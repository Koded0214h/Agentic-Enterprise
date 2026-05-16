"""
AOS Native Runtime — Model Abstraction Layer

LLMProvider ABC + implementations for Anthropic, Gemini, OpenAI.
Every provider exposes the same interface: complete() and stream().
The native worker never calls a provider SDK directly — only through this layer.

Provider routing: different agent categories can be routed to different
providers based on cost, capability, or data-sensitivity requirements.
"""
from __future__ import annotations

import os
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import AsyncIterator


# ---------------------------------------------------------------------------
# Message primitives
# ---------------------------------------------------------------------------

@dataclass
class ToolCall:
    id: str
    name: str
    input: dict


@dataclass
class ToolResult:
    tool_call_id: str
    content: str
    is_error: bool = False


@dataclass
class Message:
    role: str  # "user" | "assistant" | "tool"
    content: str = ""
    tool_calls: list[ToolCall] = field(default_factory=list)
    tool_results: list[ToolResult] = field(default_factory=list)

    @classmethod
    def user(cls, content: str) -> "Message":
        return cls(role="user", content=content)

    @classmethod
    def assistant(cls, content: str = "", tool_calls: list[ToolCall] | None = None) -> "Message":
        return cls(role="assistant", content=content, tool_calls=tool_calls or [])

    @classmethod
    def tool(cls, results: list[ToolResult]) -> "Message":
        return cls(role="tool", tool_results=results)


@dataclass
class ToolSchema:
    name: str
    description: str
    parameters: dict  # JSON Schema object


@dataclass
class LLMResponse:
    content: str
    stop_reason: str  # "end_turn" | "tool_use" | "max_tokens" | "error"
    tool_calls: list[ToolCall] = field(default_factory=list)
    tokens_input: int = 0
    tokens_output: int = 0
    model: str = ""
    raw: dict = field(default_factory=dict)

    @property
    def total_tokens(self) -> int:
        return self.tokens_input + self.tokens_output


@dataclass
class LLMStreamChunk:
    delta: str
    is_final: bool = False
    tool_call: ToolCall | None = None
    usage: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Abstract base
# ---------------------------------------------------------------------------

class LLMProvider(ABC):
    def __init__(self, model: str, **kwargs):
        self.model = model

    @abstractmethod
    async def complete(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
        temperature: float = 0.0,
    ) -> LLMResponse:
        ...

    @abstractmethod
    async def stream(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
    ) -> AsyncIterator[LLMStreamChunk]:
        ...

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(model={self.model!r})"


# ---------------------------------------------------------------------------
# Anthropic (Claude)
# ---------------------------------------------------------------------------

class AnthropicProvider(LLMProvider):
    """
    Native Anthropic SDK provider.
    Uses prompt caching on the system prompt automatically.
    """

    def __init__(self, model: str = "claude-sonnet-4-6", api_key: str = ""):
        super().__init__(model)
        try:
            import anthropic
        except ImportError as exc:
            raise RuntimeError("anthropic package not installed — pip install anthropic") from exc

        resolved_key = api_key or os.environ.get("ANTHROPIC_API_KEY", "")
        if not resolved_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. Either provide one, or rely on "
                "get_provider()'s automatic fallback to another configured "
                "provider (Gemini / OpenAI / Mistral)."
            )
        self._client = anthropic.AsyncAnthropic(api_key=resolved_key)

    def _format_messages(self, messages: list[Message]) -> list[dict]:
        formatted = []
        for msg in messages:
            if msg.role == "tool":
                formatted.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": r.tool_call_id,
                            "content": r.content,
                            "is_error": r.is_error,
                        }
                        for r in msg.tool_results
                    ],
                })
            elif msg.tool_calls:
                content: list[dict] = []
                if msg.content:
                    content.append({"type": "text", "text": msg.content})
                for tc in msg.tool_calls:
                    content.append({
                        "type": "tool_use",
                        "id": tc.id,
                        "name": tc.name,
                        "input": tc.input,
                    })
                formatted.append({"role": "assistant", "content": content})
            else:
                formatted.append({"role": msg.role, "content": msg.content})
        return formatted

    def _format_tools(self, tools: list[ToolSchema] | None) -> list[dict]:
        if not tools:
            return []
        return [
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.parameters,
            }
            for t in tools
        ]

    def _parse_response(self, response) -> LLMResponse:
        content = ""
        tool_calls = []
        for block in response.content:
            if block.type == "text":
                content = block.text
            elif block.type == "tool_use":
                tool_calls.append(ToolCall(id=block.id, name=block.name, input=block.input))

        return LLMResponse(
            content=content,
            stop_reason=response.stop_reason,
            tool_calls=tool_calls,
            tokens_input=response.usage.input_tokens,
            tokens_output=response.usage.output_tokens,
            model=response.model,
        )

    async def complete(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
        temperature: float = 0.0,
    ) -> LLMResponse:
        kwargs: dict = dict(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=self._format_messages(messages),
            system=[
                {
                    "type": "text",
                    "text": system,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        )
        formatted_tools = self._format_tools(tools)
        if formatted_tools:
            kwargs["tools"] = formatted_tools

        response = await self._client.messages.create(**kwargs)
        return self._parse_response(response)

    async def stream(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
    ) -> AsyncIterator[LLMStreamChunk]:
        kwargs: dict = dict(
            model=self.model,
            max_tokens=max_tokens,
            messages=self._format_messages(messages),
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        )
        formatted_tools = self._format_tools(tools)
        if formatted_tools:
            kwargs["tools"] = formatted_tools

        async with self._client.messages.stream(**kwargs) as stream_ctx:
            async for text in stream_ctx.text_stream:
                yield LLMStreamChunk(delta=text)
            final = await stream_ctx.get_final_message()
            yield LLMStreamChunk(delta="", is_final=True, usage={
                "input_tokens": final.usage.input_tokens,
                "output_tokens": final.usage.output_tokens,
            })


# ---------------------------------------------------------------------------
# Gemini (Google)
# ---------------------------------------------------------------------------

class GeminiProvider(LLMProvider):
    """
    Google Gemini provider.

    Uses the deprecated `google.generativeai` SDK because it's already in
    requirements.txt. Wraps every sync call in asyncio.to_thread so we don't
    block the event loop (the previous version did, which is why a Gemini run
    sometimes hung for 10+ seconds before failing).

    Safety filters, empty candidates, and exception bubbles are all caught
    and surfaced as LLMResponse(stop_reason='error') with a clear message,
    so the orchestrator sees a clean per-node error instead of crashing the
    whole DAG.
    """

    # Fallback list when the requested model name is unrecognised / quota'd.
    # Ordered newest → cheapest stable. The v1beta API only exposes the 2.5
    # family on most accounts; 2.0 and 1.5 names return 404 NotFound.
    _MODEL_FALLBACKS = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-pro",
        "gemini-2.0-flash",       # last-resort fallbacks for older accounts
        "gemini-1.5-flash-latest",
    ]

    def __init__(self, model: str = "gemini-2.5-flash", api_key: str = ""):
        super().__init__(model)
        try:
            import google.generativeai as genai
        except ImportError as exc:
            raise RuntimeError("google-generativeai not installed — pip install google-generativeai") from exc

        resolved_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        if not resolved_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Get one at https://aistudio.google.com/app/apikey"
            )
        genai.configure(api_key=resolved_key)
        self._genai = genai

    @staticmethod
    def _extract_text(response) -> str:
        """Pull text out of a Gemini response even if .text raises (blocked / no candidates)."""
        try:
            txt = getattr(response, "text", None)
            if txt:
                return txt
        except Exception:
            pass
        # Fall back to scanning candidates / parts
        try:
            for cand in getattr(response, "candidates", []) or []:
                parts = getattr(getattr(cand, "content", None), "parts", []) or []
                for p in parts:
                    if getattr(p, "text", None):
                        return p.text
        except Exception:
            pass
        return ""

    @staticmethod
    def _block_reason(response) -> str:
        """Return a human-readable reason if Gemini blocked / refused the response."""
        try:
            pf = getattr(response, "prompt_feedback", None)
            if pf and getattr(pf, "block_reason", None):
                return f"prompt_blocked:{pf.block_reason}"
        except Exception:
            pass
        try:
            for cand in getattr(response, "candidates", []) or []:
                finish = getattr(cand, "finish_reason", None)
                if finish and str(finish) not in ("STOP", "FinishReason.STOP", "1"):
                    return f"finish_reason:{finish}"
        except Exception:
            pass
        return ""

    async def complete(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
        temperature: float = 0.0,
    ) -> LLMResponse:
        import asyncio
        # Flatten messages into a single prompt; Gemini doesn't have a tool/role
        # protocol that maps cleanly onto our schema yet.
        prompt = "\n\n".join(
            f"{m.role.upper()}:\n{m.content}" for m in messages if m.content
        ) or "Please respond."

        # Trim absurdly long system prompts — Gemini Flash has ~1M token context
        # but the request body limit is more conservative.
        sys_trimmed = system if len(system) < 200_000 else (system[:200_000] + "\n\n[…system prompt truncated…]")

        last_err = ""
        # Try the configured model, then fall through to known-good fallbacks.
        candidates = [self.model] + [m for m in self._MODEL_FALLBACKS if m != self.model]
        for model_name in candidates:
            try:
                response = await asyncio.to_thread(
                    self._sync_generate, model_name, sys_trimmed, prompt, max_tokens, temperature
                )
                text = self._extract_text(response)
                block = self._block_reason(response)
                if not text and block:
                    last_err = f"Gemini ({model_name}) returned no text: {block}"
                    continue
                if not text:
                    last_err = f"Gemini ({model_name}) returned an empty response"
                    continue

                # Pull token usage if available
                usage = getattr(response, "usage_metadata", None)
                tin = getattr(usage, "prompt_token_count", 0) if usage else 0
                tout = getattr(usage, "candidates_token_count", 0) if usage else 0

                return LLMResponse(
                    content=text,
                    stop_reason="end_turn",
                    tokens_input=tin,
                    tokens_output=tout,
                    model=model_name,
                )
            except Exception as exc:
                last_err = f"{model_name} → {type(exc).__name__}: {exc}"
                continue

        # All models failed — return a clean error response so the orchestrator
        # surfaces a useful message instead of a stack trace.
        return LLMResponse(
            content=f"[Gemini error: {last_err}]",
            stop_reason="error",
            model=self.model,
        )

    def _sync_generate(self, model_name: str, system: str, prompt: str, max_tokens: int, temperature: float):
        """The actual sync call — invoked via asyncio.to_thread so it doesn't block."""
        gen_config = {"max_output_tokens": max_tokens, "temperature": temperature}
        model = self._genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system,
            generation_config=gen_config,
        )
        return model.generate_content(prompt)

    async def stream(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
    ) -> AsyncIterator[LLMStreamChunk]:
        response = await self.complete(messages, system, tools, max_tokens)
        yield LLMStreamChunk(delta=response.content, is_final=True)


# ---------------------------------------------------------------------------
# OpenAI
# ---------------------------------------------------------------------------

class OpenAIProvider(LLMProvider):
    """OpenAI GPT via openai SDK."""

    def __init__(self, model: str = "gpt-4o", api_key: str = ""):
        super().__init__(model)
        try:
            from openai import AsyncOpenAI
        except ImportError as exc:
            raise RuntimeError("openai not installed — pip install openai") from exc
        self._client = AsyncOpenAI(api_key=api_key or os.environ.get("OPENAI_API_KEY", ""))

    def _format_messages(self, system: str, messages: list[Message]) -> list[dict]:
        result = [{"role": "system", "content": system}]
        for m in messages:
            if m.role == "tool":
                for r in m.tool_results:
                    result.append({"role": "tool", "tool_call_id": r.tool_call_id, "content": r.content})
            elif m.tool_calls:
                result.append({
                    "role": "assistant",
                    "content": m.content or None,
                    "tool_calls": [
                        {"id": tc.id, "type": "function", "function": {"name": tc.name, "arguments": str(tc.input)}}
                        for tc in m.tool_calls
                    ],
                })
            else:
                result.append({"role": m.role, "content": m.content})
        return result

    def _format_tools(self, tools: list[ToolSchema] | None) -> list[dict]:
        if not tools:
            return []
        return [
            {"type": "function", "function": {"name": t.name, "description": t.description, "parameters": t.parameters}}
            for t in tools
        ]

    async def complete(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
        temperature: float = 0.0,
    ) -> LLMResponse:
        kwargs: dict = dict(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=self._format_messages(system, messages),
        )
        formatted_tools = self._format_tools(tools)
        if formatted_tools:
            kwargs["tools"] = formatted_tools

        resp = await self._client.chat.completions.create(**kwargs)
        choice = resp.choices[0]
        tool_calls = []
        if choice.message.tool_calls:
            import json
            for tc in choice.message.tool_calls:
                tool_calls.append(ToolCall(
                    id=tc.id,
                    name=tc.function.name,
                    input=json.loads(tc.function.arguments),
                ))
        return LLMResponse(
            content=choice.message.content or "",
            stop_reason="tool_use" if tool_calls else "end_turn",
            tool_calls=tool_calls,
            tokens_input=resp.usage.prompt_tokens,
            tokens_output=resp.usage.completion_tokens,
            model=resp.model,
        )

    async def stream(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
    ) -> AsyncIterator[LLMStreamChunk]:
        response = await self.complete(messages, system, tools, max_tokens)
        yield LLMStreamChunk(delta=response.content, is_final=True)


# ---------------------------------------------------------------------------
# Mistral
# ---------------------------------------------------------------------------

class MistralProvider(LLMProvider):
    """Mistral AI via mistralai SDK."""

    def __init__(self, model: str = "mistral-large-latest", api_key: str = ""):
        super().__init__(model)
        try:
            from mistralai import Mistral
        except ImportError as exc:
            raise RuntimeError("mistralai not installed — pip install mistralai") from exc
        self._client = Mistral(api_key=api_key or os.environ.get("MISTRAL_API_KEY", ""))

    def _format_messages(self, system: str, messages: list[Message]) -> list[dict]:
        result = [{"role": "system", "content": system}]
        for m in messages:
            if m.role == "tool":
                for r in m.tool_results:
                    result.append({"role": "tool", "tool_call_id": r.tool_call_id, "content": r.content})
            elif m.tool_calls:
                import json
                result.append({
                    "role": "assistant",
                    "content": m.content or "",
                    "tool_calls": [
                        {"id": tc.id, "type": "function", "function": {"name": tc.name, "arguments": json.dumps(tc.input)}}
                        for tc in m.tool_calls
                    ],
                })
            else:
                result.append({"role": m.role, "content": m.content})
        return result

    def _format_tools(self, tools: list[ToolSchema] | None) -> list[dict]:
        if not tools:
            return []
        return [
            {"type": "function", "function": {"name": t.name, "description": t.description, "parameters": t.parameters}}
            for t in tools
        ]

    async def complete(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
        temperature: float = 0.0,
    ) -> LLMResponse:
        import asyncio
        kwargs: dict = dict(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=self._format_messages(system, messages),
        )
        formatted_tools = self._format_tools(tools)
        if formatted_tools:
            kwargs["tools"] = formatted_tools
        resp = await asyncio.to_thread(self._client.chat.complete, **kwargs)
        choice = resp.choices[0]
        tool_calls = []
        if choice.message.tool_calls:
            import json
            for tc in choice.message.tool_calls:
                tool_calls.append(ToolCall(
                    id=tc.id,
                    name=tc.function.name,
                    input=json.loads(tc.function.arguments),
                ))
        return LLMResponse(
            content=choice.message.content or "",
            stop_reason="tool_use" if tool_calls else "end_turn",
            tool_calls=tool_calls,
            tokens_input=resp.usage.prompt_tokens if resp.usage else 0,
            tokens_output=resp.usage.completion_tokens if resp.usage else 0,
            model=self.model,
        )

    async def stream(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
    ) -> AsyncIterator[LLMStreamChunk]:
        response = await self.complete(messages, system, tools, max_tokens)
        yield LLMStreamChunk(delta=response.content, is_final=True)


# ---------------------------------------------------------------------------
# Ollama (local)
# ---------------------------------------------------------------------------

class OllamaProvider(LLMProvider):
    """Local Ollama inference via HTTP API."""

    def __init__(self, model: str = "llama3.2", base_url: str = ""):
        super().__init__(model)
        self._base_url = base_url or os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

    async def complete(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
        temperature: float = 0.0,
    ) -> LLMResponse:
        import json
        import asyncio
        import urllib.request

        formatted = [{"role": "system", "content": system}]
        for m in messages:
            if m.content:
                formatted.append({"role": m.role if m.role != "tool" else "user", "content": m.content})

        payload = json.dumps({
            "model": self.model,
            "messages": formatted,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens},
        }).encode()

        def _call():
            req = urllib.request.Request(
                f"{self._base_url}/api/chat",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                return json.loads(resp.read())

        try:
            data = await asyncio.to_thread(_call)
        except Exception as exc:
            return LLMResponse(content=f"[Ollama error: {exc}]", stop_reason="error", model=self.model)

        content = data.get("message", {}).get("content", "")
        return LLMResponse(content=content, stop_reason="end_turn", model=self.model)

    async def stream(
        self,
        messages: list[Message],
        system: str,
        tools: list[ToolSchema] | None = None,
        max_tokens: int = 8192,
    ) -> AsyncIterator[LLMStreamChunk]:
        response = await self.complete(messages, system, tools, max_tokens)
        yield LLMStreamChunk(delta=response.content, is_final=True)


# ---------------------------------------------------------------------------
# Provider registry + routing
# ---------------------------------------------------------------------------

_PROVIDER_ROUTING: dict[str, tuple[str, str]] = {
    "core":         ("anthropic", "claude-sonnet-4-6"),
    "engineering":  ("anthropic", "claude-sonnet-4-6"),
    "research":     ("anthropic", "claude-opus-4-7"),
    "academic":     ("anthropic", "claude-opus-4-7"),
    "strategy":     ("anthropic", "claude-opus-4-7"),
    "marketing":    ("gemini",    "gemini-2.5-flash"),
    "creative":     ("gemini",    "gemini-2.5-flash"),
    "support":      ("openai",    "gpt-4o-mini"),
    "sales":        ("anthropic", "claude-sonnet-4-6"),
    "analytics":    ("mistral",   "mistral-large-latest"),
    "local":        ("ollama",    "llama3.2"),
}

_DEFAULT_ROUTING = ("anthropic", "claude-sonnet-4-6")

# Fallback chain per provider — tried in order if primary fails
_FALLBACK_CHAIN: dict[str, list[tuple[str, str]]] = {
    "anthropic": [("openai", "gpt-4o"), ("gemini", "gemini-2.0-flash")],
    "openai":    [("anthropic", "claude-sonnet-4-6"), ("mistral", "mistral-large-latest")],
    "gemini":    [("anthropic", "claude-sonnet-4-6")],
    "mistral":   [("anthropic", "claude-sonnet-4-6")],
    "ollama":    [("anthropic", "claude-sonnet-4-6")],
}


# Maps a provider name to the env var that gates it. If the env var is empty,
# routing skips that provider and picks the next available one (so a user with
# only a Gemini key can run any agent — including ones routed to Anthropic).
_PROVIDER_KEY_ENV: dict[str, str] = {
    "anthropic": "ANTHROPIC_API_KEY",
    "openai":    "OPENAI_API_KEY",
    "gemini":    "GEMINI_API_KEY",
    "mistral":   "MISTRAL_API_KEY",
    "ollama":    "",  # Ollama is local; no key gate
}


def _provider_available(provider_name: str) -> bool:
    env_var = _PROVIDER_KEY_ENV.get(provider_name, "")
    if not env_var:
        return True  # No gate (Ollama)
    return bool(os.environ.get(env_var, "").strip())


# Default model for each provider — used when falling back so we always pick a
# sensible model for that provider, not a model name from a different one.
_PROVIDER_DEFAULT_MODEL: dict[str, str] = {
    "anthropic": "claude-sonnet-4-6",
    "openai":    "gpt-4o",
    "gemini":    "gemini-2.5-flash",
    "mistral":   "mistral-large-latest",
    "ollama":    "llama3.2",
}


def _resolve_provider(provider_name: str, model: str) -> tuple[str, str]:
    """
    Returns (provider_name, model) to actually use. If the primary provider's
    API key is missing, walks _FALLBACK_CHAIN and returns the first entry
    whose key IS configured. If nothing is configured anywhere, returns the
    original (caller will see a runtime error which is the right behaviour).
    """
    if _provider_available(provider_name):
        return provider_name, model
    for fallback_name, fallback_model in _FALLBACK_CHAIN.get(provider_name, []):
        if _provider_available(fallback_name):
            return fallback_name, fallback_model
    # No fallback worked — try any provider that has a key set
    for any_name in ("gemini", "anthropic", "openai", "mistral", "ollama"):
        if _provider_available(any_name):
            return any_name, _PROVIDER_DEFAULT_MODEL[any_name]
    return provider_name, model  # Will raise a clear runtime error


def _make_provider(provider_name: str, model: str) -> LLMProvider:
    if provider_name == "anthropic":
        return AnthropicProvider(model=model)
    if provider_name == "gemini":
        return GeminiProvider(model=model)
    if provider_name == "openai":
        return OpenAIProvider(model=model)
    if provider_name == "mistral":
        return MistralProvider(model=model)
    if provider_name == "ollama":
        return OllamaProvider(model=model)
    return AnthropicProvider(model=model)


def get_provider(agent_category: str = "") -> LLMProvider:
    """
    Return the appropriate LLMProvider for a given agent category, AUTOMATICALLY
    falling back to whatever provider key the operator has configured. So a
    user with only GEMINI_API_KEY can run agents routed to Anthropic — they'll
    transparently use Gemini instead.
    """
    primary, model = _PROVIDER_ROUTING.get(agent_category, _DEFAULT_ROUTING)
    resolved_name, resolved_model = _resolve_provider(primary, model)
    return _make_provider(resolved_name, resolved_model)


async def get_provider_with_fallback(agent_category: str = "") -> LLMProvider:
    """
    Returns primary provider. Caller should catch exceptions and call
    get_fallback_provider() to get the next option.
    """
    return get_provider(agent_category)


def get_fallback_providers(agent_category: str = "") -> list[LLMProvider]:
    """Return ordered list of fallback providers for this category."""
    provider_name, _ = _PROVIDER_ROUTING.get(agent_category, _DEFAULT_ROUTING)
    fallbacks = _FALLBACK_CHAIN.get(provider_name, [])
    return [_make_provider(p, m) for p, m in fallbacks]
