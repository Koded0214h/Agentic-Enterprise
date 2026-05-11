"""
Swarm MCP hub — tools from stdio subprocesses OR remote MCP (HTTP / SSE / WebSocket).

Configured under ``mcpServers``:

- **stdio** (Cursor-style): ``command`` + optional ``args``, ``env``, ``cwd``
- **Streamable HTTP** (default when ``url`` is set): ``url`` + optional ``headers``
- **SSE**: ``url`` + ``"transport": "sse"``
- **WebSocket**: ``url`` + ``"transport": "websocket"`` (needs ``pip install websockets``)

Employees request runs via fenced JSON (see ``MCP_INSTRUCTION_APPENDIX``). Tool results that include
images are embedded as data-URIs or spooled under ``~/.swarm/mcp-images/`` when large.

Requires: ``pip install mcp`` (+ ``websockets`` for ws). See ``requirements-swarm.txt``.
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import re
import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import hashlib
import httpx

SWARM_HOME = Path(os.environ.get("SWARM_HOME", Path.home() / ".swarm"))
MCP_IMAGES_DIR = SWARM_HOME / "mcp-images"

try:
    from mcp import ClientSession
    from mcp.client.sse import sse_client
    from mcp.client.stdio import StdioServerParameters, stdio_client
    from mcp.client.streamable_http import streamable_http_client
    from mcp.types import AudioContent, BlobResourceContents, EmbeddedResource, ImageContent, ResourceLink
    from mcp.types import TextContent, TextResourceContents

    try:
        from mcp.client.websocket import websocket_client

        _HAVE_WS_TRANSPORT = websocket_client is not None
    except ImportError:
        websocket_client = None  # type: ignore[misc, assignment]
        _HAVE_WS_TRANSPORT = False

    _HAVE_MCP_SDK = True
except ImportError:
    ClientSession = None  # type: ignore[misc, assignment]
    StdioServerParameters = None  # type: ignore[misc, assignment]
    stdio_client = None  # type: ignore[misc, assignment]
    sse_client = None  # type: ignore[misc, assignment]
    streamable_http_client = None  # type: ignore[misc, assignment]
    websocket_client = None  # type: ignore[misc, assignment]
    AudioContent = ImageContent = TextContent = object  # type: ignore[misc, assignment]
    EmbeddedResource = ResourceLink = object  # type: ignore[misc, assignment]
    BlobResourceContents = TextResourceContents = object  # type: ignore[misc, assignment]
    _HAVE_MCP_SDK = False
    _HAVE_WS_TRANSPORT = False

_servers: dict[str, dict[str, Any]] = {}
_tool_rows: list[dict[str, str]] = []

_FENCE_RE = re.compile(r"```(?:swarm-mcp|json)\s*\n([\s\S]*?)```", re.IGNORECASE)

MCP_INSTRUCTION_APPENDIX = """
## Swarm MCP (automation connectors)

Boss configured MCP servers (stdio, Zapier/Figma/Stitch HTTP endpoints, etc.). You may ask the orchestrator
to invoke them **once** near the **end** of your reply using **exactly one** fence:

```swarm-mcp
{"server":"<server_name>","tool":"<tool_name>","arguments":{}}
```

- Use only ``server`` / ``tool`` names from **Available MCP tools** in CONTEXT below.
- Keep ``arguments`` valid JSON objects. Omit the fence entirely if no tool call is needed.
- Risk: tools may hit external services — prefer dry runs when unsure.
- If a tool returns **images**, the orchestrator expands them inline (Markdown data-URI / file paths) into the MCP results appendix so downstream steps can ``see`` them.

Alternative wrapper key (either works):

```json
{"swarm_mcp":{"server":"...","tool":"...","arguments":{}}}
```
""".strip()


def _max_image_embed_b64_chars() -> int:
    raw = os.environ.get("SWARM_MCP_MAX_IMAGE_B64_CHARS", "400000")
    try:
        return max(0, int(raw))
    except ValueError:
        return 400_000


def _mime_to_image_ext(mime: str) -> str:
    m = (mime or "").split(";")[0].strip().lower()
    mapping = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "image/svg+xml": ".svg",
    }
    return mapping.get(m, ".bin")


def _safe_filename_part(s: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", s)[:80] if s else "x"


def _format_image(server: str, tool: str, mime: str, b64_data: str) -> str:
    mime = mime or "image/png"
    max_embed = _max_image_embed_b64_chars()
    n = len(b64_data or "")
    if max_embed > 0 and n <= max_embed and n > 0:
        return (
            f"![MCP `{server}`/`{tool}`](data:{mime};base64,{b64_data})\n\n"
            f"*(inline `{mime}`, {n} base64 chars)*"
        )
    try:
        raw_bytes = base64.b64decode(b64_data or "", validate=False)
    except Exception as e:
        return f"_(could not decode image base64: {e})_"
    MCP_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    short = hashlib.sha256(raw_bytes).hexdigest()[:16]
    fname = f"{_safe_filename_part(server)}__{_safe_filename_part(tool)}__{short}{_mime_to_image_ext(mime)}"
    path = MCP_IMAGES_DIR / fname
    path.write_bytes(raw_bytes)
    uri = path.resolve().as_uri()
    hint = ""
    if n > (max_embed or 0):
        hint = f" *(spooled: {len(raw_bytes)} bytes — increase `SWARM_MCP_MAX_IMAGE_B64_CHARS` to embed inline)*"
    return f"![MCP `{server}`/`{tool}`]({uri})\n\n`{path}`{hint}"


def _block_to_markdown(server: str, tool: str, block: Any) -> str:
    """Turn MCP ``CallToolResult`` content entries into Markdown (text + images)."""
    if _HAVE_MCP_SDK and isinstance(block, TextContent):
        return str(block.text)

    if hasattr(block, "type"):
        bt = getattr(block, "type", None)
        if bt == "text" and hasattr(block, "text"):
            return str(block.text)

        if _HAVE_MCP_SDK and isinstance(block, ImageContent):
            return _format_image(server, tool, getattr(block, "mimeType", "image/png") or "image/png", block.data)

        if _HAVE_MCP_SDK and isinstance(block, AudioContent):
            ln = len(getattr(block, "data", "") or "")
            return f"*(audio `{getattr(block, 'mimeType', '')}` — {ln} base64 chars; not rendered inline)_"

        if _HAVE_MCP_SDK and isinstance(block, ResourceLink):
            return f"**(resource)** `{block.uri}` — {block.name or ''}\n_{block.description or ''}_".strip()

        if _HAVE_MCP_SDK and isinstance(block, EmbeddedResource):
            res = getattr(block, "resource", None)
            if isinstance(res, TextResourceContents):
                txt = getattr(res, "text", "") or ""
                return f"**(embedded resource)** `{res.uri}` ({res.mimeType or 'text'})\n\n```\n{txt[:12_000]}{'…' if len(txt) > 12_000 else ''}\n```"
            if isinstance(res, BlobResourceContents):
                blob = getattr(res, "blob", "") or ""
                mt = getattr(res, "mimeType", None) or ""
                low = mt.lower()
                if low.startswith("image/"):
                    return _format_image(server, tool, mt, blob)
                return f"**(embedded binary)** `{res.uri}` (`{mt}` — {len(blob)} base64 chars)_"

        if hasattr(block, "text"):
            t = getattr(block, "text", None)
            if t is not None:
                return str(t)

    if isinstance(block, dict):
        t = block.get("type")
        if t == "text" and "text" in block:
            return str(block["text"])
        if t == "image":
            return _format_image(server, tool, block.get("mimeType", "image/png"), block.get("data", "") or "")
        if t == "audio":
            ln = len(block.get("data") or "")
            return f"*(audio `{block.get('mimeType', '')}` — {ln} base64 chars; not rendered inline)_"

    return str(block)


def format_tool_content_markdown(server: str, tool: str, blocks: list[Any]) -> str:
    parts: list[str] = [_block_to_markdown(server, tool, b) for b in (blocks or [])]
    return "\n\n".join(p for p in parts if p).strip() or "(empty tool result)"


def mcp_sdk_available() -> bool:
    return _HAVE_MCP_SDK


def configured_server_count() -> int:
    return len(_servers)


def configure_mcp_servers(merged_cfg: dict) -> None:
    """Parse ``mcpServers`` entries (stdio, streamable-http, sse, websocket)."""
    global _servers, _tool_rows
    _tool_rows.clear()
    if (
        not _HAVE_MCP_SDK
        or StdioServerParameters is None
        or stdio_client is None
        or streamable_http_client is None
        or sse_client is None
    ):
        _servers = {}
        return

    merged: dict[str, dict] = {}
    base = merged_cfg.get("mcpServers")
    if isinstance(base, dict):
        merged.update(base)

    mcp_path = SWARM_HOME / "mcp.json"
    if mcp_path.exists():
        try:
            extra = json.loads(mcp_path.read_text())
            ms = extra.get("mcpServers") if isinstance(extra, dict) else None
            if isinstance(ms, dict):
                merged.update(ms)
        except (json.JSONDecodeError, OSError):
            pass

    security_sec = merged_cfg.get("security")
    sec_dict = security_sec if isinstance(security_sec, dict) else {}

    from core import mcp_digest

    filtered, pin_msgs = mcp_digest.reconcile_merged_servers(dict(merged), sec_dict)
    for line in pin_msgs:
        print(f"  {line}", file=sys.stderr)

    out: dict[str, dict[str, Any]] = {}
    for name, spec in filtered.items():
        if not isinstance(spec, dict) or not isinstance(name, str):
            continue
        cmd = spec.get("command")
        url = spec.get("url") or spec.get("endpoint")
        transport = str(spec.get("transport") or "").strip().lower()

        header_obj = spec.get("headers")
        headers: dict[str, str] = {}
        if isinstance(header_obj, dict):
            for k, v in header_obj.items():
                if v is not None:
                    headers[str(k)] = str(v)

        if cmd:
            raw_args = spec.get("args")
            args = raw_args if isinstance(raw_args, list) else ([] if raw_args is None else list(raw_args))
            env_overlay = spec.get("env")
            cwd = spec.get("cwd")
            environ = dict(os.environ)
            if isinstance(env_overlay, dict):
                for k, v in env_overlay.items():
                    if v is not None:
                        environ[str(k)] = str(v)

            kwargs: dict[str, Any] = {
                "command": str(cmd),
                "args": [str(a) for a in args],
                "env": environ,
            }
            if cwd:
                kwargs["cwd"] = str(Path(cwd).expanduser())
            out[name] = {"transport": "stdio", "stdio": StdioServerParameters(**kwargs)}
            continue

        if url:
            url_s = str(url).strip()
            if transport == "sse":
                out[name] = {"transport": "sse", "url": url_s, "headers": headers}
            elif transport in ("websocket", "ws"):
                out[name] = {"transport": "websocket", "url": url_s}
            elif transport in ("streamable-http", "streamable_http", "http", "https", ""):
                out[name] = {"transport": "streamable_http", "url": url_s, "headers": headers}
            else:
                out[name] = {"transport": "streamable_http", "url": url_s, "headers": headers}

    _servers = out


@asynccontextmanager
async def _connect_server_streams(spec: dict[str, Any]) -> AsyncIterator[tuple[Any, Any]]:
    kind = spec.get("transport")
    assert stdio_client is not None and ClientSession is not None

    if kind == "stdio":
        params = spec.get("stdio")
        async with stdio_client(params) as streams:
            read, write = streams
            yield read, write
        return

    if kind == "streamable_http":
        assert streamable_http_client is not None
        url = spec["url"]
        hdrs = spec.get("headers") or {}
        timeout = httpx.Timeout(60.0, read=float(os.environ.get("SWARM_MCP_HTTP_READ_TIMEOUT", "300")))
        async with httpx.AsyncClient(headers=hdrs if hdrs else None, timeout=timeout) as http_client:
            async with streamable_http_client(url, http_client=http_client) as tup:
                read, write, _get_sid = tup
                yield read, write
        return

    if kind == "sse":
        assert sse_client is not None
        url = spec["url"]
        hdrs = spec.get("headers") or {}
        sse_read_timeout = float(os.environ.get("SWARM_MCP_SSE_READ_TIMEOUT", "600"))
        async with sse_client(
            url,
            headers=hdrs if hdrs else None,
            timeout=60,
            sse_read_timeout=sse_read_timeout,
        ) as streams:
            read, write = streams
            yield read, write
        return

    if kind == "websocket":
        if not _HAVE_WS_TRANSPORT or websocket_client is None:
            raise RuntimeError("Install websockets (`pip install websockets`) for MCP WebSocket transports.")
        url = spec["url"]
        async with websocket_client(url) as streams:
            read, write = streams
            yield read, write
        return

    raise ValueError(f"Unknown MCP transport `{kind}`")


async def _list_tools_one(name: str, spec: dict[str, Any]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    assert ClientSession is not None
    async with _connect_server_streams(spec) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            res = await session.list_tools()
            for t in res.tools:
                rows.append(
                    {
                        "server": name,
                        "name": t.name,
                        "description": (t.description or "").strip().replace("\n", " ")[:400],
                    }
                )
    return rows


async def _refresh_catalog_async() -> None:
    global _tool_rows
    if not _servers:
        _tool_rows = []
        return
    acc: list[dict[str, str]] = []
    for name, spec in _servers.items():
        try:
            acc.extend(await _list_tools_one(name, spec))
        except Exception:
            transport = spec.get("transport", "?")
            acc.append(
                {
                    "server": name,
                    "name": "(connect failed)",
                    "description": f"Check URL/command, transport `{transport}`, network, secrets, deps.",
                }
            )
    _tool_rows = acc


def refresh_tool_catalog_blocking() -> tuple[bool, str]:
    """Return (ok, message)."""
    if not _HAVE_MCP_SDK:
        return False, "MCP SDK not installed (pip install mcp)."
    if not _servers:
        return True, "No MCP servers configured (mcpServers in swarm.config.json or ~/.swarm/mcp.json)."
    try:
        try:
            asyncio.run(_refresh_catalog_async())
        except RuntimeError:
            loop = asyncio.new_event_loop()
            try:
                loop.run_until_complete(_refresh_catalog_async())
            finally:
                loop.close()
    except Exception as e:
        return False, str(e)
    return True, f"Indexed {_len_tools()} tools from {len(_servers)} servers."


def _len_tools() -> int:
    return len([r for r in _tool_rows if r.get("name") != "(connect failed)"])


def format_tools_markdown(max_lines: int = 80) -> str:
    if not _tool_rows:
        if _servers and not _HAVE_MCP_SDK:
            return "_(MCP servers are configured but Python package `mcp` is missing — run `pip install mcp`)_"
        if not _servers:
            return "_(No MCP servers — add ``mcpServers`` to swarm.config.json or ~/.swarm/mcp.json.)_"
        return "_(MCP catalog empty — run `/mcp refresh`.)_"
    lines = ["| Server | Tool | Description |", "| --- | --- | --- |"]
    for row in _tool_rows[:max_lines]:
        srv = row.get("server", "")
        tn = row.get("name", "")
        dsc = row.get("description", "").replace("|", "\\|")
        lines.append(f"| `{srv}` | `{tn}` | {dsc} |")
    if len(_tool_rows) > max_lines:
        lines.append(f"| … | … | _{len(_tool_rows) - max_lines} more — `/mcp tools`_ |")
    return "\n".join(lines)


def mcp_context_for_prompt() -> str:
    """Appended to every employee CONTEXT when MCP may be relevant."""
    if not _servers:
        return ""
    return (
        "## Swarm MCP — available connectors\n\n"
        + MCP_INSTRUCTION_APPENDIX
        + "\n\n### Available MCP tools\n\n"
        + format_tools_markdown()
    )


async def _call_tool_async(server: str, tool: str, arguments: dict[str, Any]) -> str:
    assert ClientSession is not None
    spec = _servers.get(server)
    if not spec:
        raise ValueError(f"Unknown MCP server `{server}` (configured: {sorted(_servers)})")

    chunks_markdown: list[str] = []
    async with _connect_server_streams(spec) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            result = await session.call_tool(tool, arguments)
            if result.isError:
                chunks_markdown.append("(tool reported error)")
            body_md = format_tool_content_markdown(server, tool, list(result.content or []))
            sc = getattr(result, "structuredContent", None)
            if isinstance(sc, dict) and sc:
                try:
                    js = json.dumps(sc, indent=2, default=str)
                except Exception:
                    js = str(sc)
                cap = int(os.environ.get("SWARM_MCP_STRUCTURED_JSON_MAX", "20000"))
                if len(js) > cap:
                    js = js[:cap] + "\n…"
                body_md += f"\n\n**structuredContent** (JSON)\n\n```json\n{js}\n```"
            chunks_markdown.append(body_md)

    return "\n\n".join(c for c in chunks_markdown if c).strip() or "(empty tool result)"


def call_tool_sync(server: str, tool: str, arguments: dict[str, Any] | None) -> str:
    """Run a single tool (blocking)."""
    if not _HAVE_MCP_SDK:
        raise RuntimeError("pip install mcp")
    arguments = dict(arguments or {})

    try:
        return asyncio.run(_call_tool_async(server, tool, arguments))
    except RuntimeError:
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(_call_tool_async(server, tool, arguments))
        finally:
            loop.close()


def execute_swarm_mcp_fences(stdout: str) -> tuple[str, str]:
    """Strip ``swarm-mcp`` fences, run tools, return ``(stdout_without_fences, appendix_md)``."""
    if not _HAVE_MCP_SDK or not stdout or not _servers:
        return stdout, ""

    appendix: list[str] = []
    out_parts: list[str] = []
    pos = 0

    for m in _FENCE_RE.finditer(stdout):
        out_parts.append(stdout[pos : m.start()])
        pos = m.end()
        raw = m.group(1).strip()
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            appendix.append(f"### Swarm MCP — parse error\n```\n{raw[:800]}\n```\n")
            continue
        if isinstance(obj, dict) and "swarm_mcp" in obj:
            obj = obj["swarm_mcp"]
        if not isinstance(obj, dict):
            appendix.append(f"### Swarm MCP — invalid payload\n```json\n{raw[:800]}\n```\n")
            continue
        srv = obj.get("server")
        tn = obj.get("tool")
        args = obj.get("arguments")
        if not isinstance(srv, str) or not isinstance(tn, str):
            appendix.append(f"### Swarm MCP — missing server/tool\n```json\n{json.dumps(obj)[:800]}\n```\n")
            continue
        if not isinstance(args, dict):
            args = {}

        label = f"### Swarm MCP — `{srv}` · `{tn}`\n\n"
        try:
            body = call_tool_sync(srv, tn, args)
            appendix.append(f"{label}{body}\n")
        except Exception as e:
            appendix.append(f"{label}_Error:_ `{type(e).__name__}` — {e}\n")

    out_parts.append(stdout[pos:])
    return "".join(out_parts).strip(), "\n".join(appendix).strip()


def ensure_catalog_if_needed(cfg: dict) -> None:
    """Load server params + build tool catalog once workers are configured."""
    configure_mcp_servers(cfg)
    if not _tool_rows and _servers and _HAVE_MCP_SDK:
        refresh_tool_catalog_blocking()
