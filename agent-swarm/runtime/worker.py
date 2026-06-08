"""
AOS Native Runtime — Native Agent Worker

Replaces the CLI subprocess execution model (engines/adapter.py).
The worker owns the full execution loop:

  1. Load agent definition from .md file
  2. Inject memory context (vector search)
  3. Call LLM via provider abstraction
  4. Execute tool calls via ToolRegistry (permissioned, logged)
  5. Emit typed events throughout
  6. Report usage to AOS bridge on completion

Runs async. Celery wraps it with asyncio.run() for queue-based execution.
The old CLI adapter remains untouched — migration is agent-category by category.
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import AsyncIterator

from .events import EventType, TraceEmitter
from .providers import (
    LLMProvider, LLMResponse, Message, ToolCall, ToolResult as LLMToolResult,
    get_provider,
)
from .tools import ExecutionContext, ToolRegistry, ToolResult

SWARM_ROOT = Path(__file__).parent.parent
AGENTS_DIR = SWARM_ROOT / "agents"
MEMORY_DIR = SWARM_ROOT / "memory"


# ---------------------------------------------------------------------------
# Agent definition
# ---------------------------------------------------------------------------

@dataclass
class AgentDefinition:
    name: str
    category: str
    system_prompt: str
    file_path: str = ""

    @classmethod
    def load(cls, agent_name: str) -> "AgentDefinition":
        """
        Load an agent definition from its .md file.
        Searches all category subdirectories.
        """
        # Direct path first
        direct = AGENTS_DIR / f"{agent_name}.md"
        if direct.exists():
            return cls(
                name=agent_name,
                category="",
                system_prompt=direct.read_text(),
                file_path=str(direct),
            )

        # Search category subdirs
        for category_dir in AGENTS_DIR.iterdir():
            if not category_dir.is_dir():
                continue
            candidate = category_dir / f"{agent_name}.md"
            if candidate.exists():
                return cls(
                    name=agent_name,
                    category=category_dir.name,
                    system_prompt=candidate.read_text(),
                    file_path=str(candidate),
                )

        raise FileNotFoundError(f"Agent definition not found: {agent_name}")


# ---------------------------------------------------------------------------
# Short-term memory (within one execution)
# ---------------------------------------------------------------------------

class ShortTermMemory:
    MAX_TOKENS = 120_000

    def __init__(self) -> None:
        self.messages: list[Message] = []
        self._token_count: int = 0

    def add(self, message: Message) -> None:
        self.messages.append(message)
        # Rough token estimate: 4 chars ≈ 1 token
        self._token_count += len(message.content) // 4 + sum(
            len(str(tc.input)) // 4 for tc in message.tool_calls
        )
        if self._token_count > self.MAX_TOKENS:
            self._compress()

    def _compress(self) -> None:
        """Drop oldest user/assistant pairs, keep last 10 messages."""
        if len(self.messages) > 10:
            self.messages = self.messages[-10:]
            self._token_count = sum(len(m.content) // 4 for m in self.messages)

    @property
    def all(self) -> list[Message]:
        return list(self.messages)


# ---------------------------------------------------------------------------
# Agent memory (cross-session, per-agent — vector search)
# ---------------------------------------------------------------------------

class AgentMemory:
    """
    Loads relevant prior memories for an agent before execution.
    Stores new learnings after completion.
    Uses the memory/ directory and optionally ChromaDB for vector search.
    """

    def __init__(self, agent_id: str) -> None:
        self.agent_id = agent_id
        self._chroma = None
        self._init_chroma()

    def _init_chroma(self) -> None:
        try:
            import chromadb
            client = chromadb.PersistentClient(path=str(MEMORY_DIR / "chroma"))
            self._chroma = client.get_or_create_collection(
                name="agent_memory",
                metadata={"hnsw:space": "cosine"},
            )
        except Exception:
            self._chroma = None

    def load(self, task: str, top_k: int = 5) -> list[str]:
        """Return relevant memory chunks for this task."""
        if self._chroma is None:
            return self._load_from_file()

        try:
            results = self._chroma.query(
                query_texts=[task],
                n_results=top_k,
                where={"agent_id": self.agent_id},
            )
            return results.get("documents", [[]])[0]
        except Exception:
            return self._load_from_file()

    def _load_from_file(self) -> list[str]:
        """Fallback: load from the memory/ flat files."""
        agent_memory_file = MEMORY_DIR / f"{self.agent_id}_latest.md"
        if agent_memory_file.exists():
            return [agent_memory_file.read_text()[:2000]]
        return []

    def store(self, execution_id: str, learning: str) -> None:
        """Persist a learning from this execution."""
        if self._chroma is None:
            self._store_to_file(learning)
            return
        try:
            self._chroma.upsert(
                ids=[execution_id],
                documents=[learning],
                metadatas=[{"agent_id": self.agent_id}],
            )
        except Exception:
            self._store_to_file(learning)

    def _store_to_file(self, learning: str) -> None:
        MEMORY_DIR.mkdir(exist_ok=True)
        agent_memory_file = MEMORY_DIR / f"{self.agent_id}_latest.md"
        agent_memory_file.write_text(learning[:10_000])


# ---------------------------------------------------------------------------
# Execution result
# ---------------------------------------------------------------------------

@dataclass
class AgentResult:
    execution_id: str
    agent_id: str
    success: bool
    output: str
    tool_calls_made: list[dict] = field(default_factory=list)
    tokens_input: int = 0
    tokens_output: int = 0
    duration_ms: int = 0
    error: str = ""

    def to_dict(self) -> dict:
        return {
            "execution_id": self.execution_id,
            "agent_id": self.agent_id,
            "success": self.success,
            "output": self.output,
            "tool_calls_made": self.tool_calls_made,
            "tokens_input": self.tokens_input,
            "tokens_output": self.tokens_output,
            "duration_ms": self.duration_ms,
            "error": self.error,
        }


# ---------------------------------------------------------------------------
# Native agent worker
# ---------------------------------------------------------------------------

class NativeAgentWorker:
    """
    Executes an agent natively — no subprocess, no CLI.
    AOS sees every LLM call, every tool invocation, every token.
    """

    MAX_ITERATIONS = 30  # hard loop cap to prevent infinite tool chains

    def __init__(
        self,
        agent_def: AgentDefinition,
        provider: LLMProvider,
        tool_registry: ToolRegistry,
        memory: AgentMemory,
        tracer: TraceEmitter,
        workspace_dir: str = ".",
        department_id: str = "",
    ) -> None:
        self.agent_def = agent_def
        self.provider = provider
        self.tools = tool_registry
        self.memory = memory
        self.tracer = tracer
        self.workspace_dir = workspace_dir
        self.department_id = department_id

    @classmethod
    def from_job(cls, job) -> "NativeAgentWorker":
        """Build a worker from an AgentJob."""
        from .jobs import AgentJob
        agent_def = AgentDefinition.load(job.agent_id)
        provider = get_provider(agent_def.category or job.agent_category)
        registry = ToolRegistry.for_agent(job.permissions)
        memory = AgentMemory(job.agent_id)
        tracer = TraceEmitter(job.execution_id, job.agent_id, job.department_id)
        return cls(
            agent_def=agent_def,
            provider=provider,
            tool_registry=registry,
            memory=memory,
            tracer=tracer,
            workspace_dir=job.workspace_dir,
            department_id=job.department_id,
        )

    async def run(self, job) -> AgentResult:
        start = time.monotonic()
        self.tracer.emit(EventType.AGENT_STARTED, {"task": job.task[:500]})

        ctx = ExecutionContext(
            execution_id=job.execution_id,
            agent_id=job.agent_id,
            agent_permissions=job.permissions,
            workspace_dir=self.workspace_dir,
            department_id=self.department_id,
        )

        # Inject memory context
        memories = self.memory.load(job.task)
        self.tracer.emit(EventType.MEMORY_LOADED, {"chunks": len(memories)})

        system_prompt = self._build_system_prompt(memories)
        stm = ShortTermMemory()
        stm.add(Message.user(job.task))

        total_input = 0
        total_output = 0
        all_tool_calls: list[dict] = []
        final_output = ""
        error = ""
        success = True

        try:
            async for response, tool_results in self._execute_loop(stm, system_prompt, ctx, job.timeout_seconds):
                total_input += response.tokens_input
                total_output += response.tokens_output
                if response.content:
                    final_output = response.content
                for tr in tool_results:
                    all_tool_calls.append({
                        "tool": tr.tool_name,
                        "success": tr.success,
                        "duration_ms": tr.duration_ms,
                    })

        except Exception as exc:
            error = str(exc)
            success = False
            self.tracer.emit(EventType.AGENT_FAILED, {"error": error[:500]})

        duration_ms = int((time.monotonic() - start) * 1000)

        if success:
            self.tracer.emit(EventType.AGENT_COMPLETED, {
                "output_length": len(final_output),
                "tool_calls": len(all_tool_calls),
                "tokens_in": total_input,
                "tokens_out": total_output,
            }, duration_ms=duration_ms)
            # Store what we learned
            if final_output:
                self.memory.store(job.execution_id, final_output[:3000])
            self.tracer.emit(EventType.MEMORY_STORED, {})

        self._report_usage(job, total_input, total_output, duration_ms, success, error)

        return AgentResult(
            execution_id=job.execution_id,
            agent_id=job.agent_id,
            success=success,
            output=final_output,
            tool_calls_made=all_tool_calls,
            tokens_input=total_input,
            tokens_output=total_output,
            duration_ms=duration_ms,
            error=error,
        )

    async def _execute_loop(
        self,
        stm: ShortTermMemory,
        system: str,
        ctx: ExecutionContext,
        timeout_seconds: int,
    ) -> AsyncIterator[tuple[LLMResponse, list[ToolResult]]]:
        """
        Core agentic loop:
          LLM call → tool calls (if any) → add results → repeat
        Yields (response, tool_results) each iteration.
        Stops when stop_reason is "end_turn" or MAX_ITERATIONS reached.
        """
        import asyncio

        for iteration in range(self.MAX_ITERATIONS):
            # Check for cancellation signal via Redis
            if self._is_cancelled(ctx.execution_id):
                self.tracer.emit(EventType.AGENT_FAILED, {"error": "Cancelled by user"})
                raise RuntimeError("Execution cancelled by user")

            t0 = time.monotonic()
            self.tracer.emit(EventType.LLM_REQUEST, {"iteration": iteration, "messages": len(stm.all)})

            try:
                response = await asyncio.wait_for(
                    self.provider.complete(
                        messages=stm.all,
                        system=system,
                        tools=self.tools.schemas(),
                    ),
                    timeout=min(timeout_seconds, 120),
                )
            except asyncio.TimeoutError:
                raise TimeoutError(f"LLM call timed out after {min(timeout_seconds, 120)}s on iteration {iteration}")

            llm_ms = int((time.monotonic() - t0) * 1000)
            self.tracer.emit(EventType.LLM_RESPONSE, {
                "stop_reason": response.stop_reason,
                "tokens_in": response.tokens_input,
                "tokens_out": response.tokens_output,
                "has_tool_calls": bool(response.tool_calls),
            }, duration_ms=llm_ms)

            stm.add(Message.assistant(response.content, response.tool_calls))

            tool_results: list[ToolResult] = []

            if response.stop_reason == "tool_use" and response.tool_calls:
                tool_results = await self._execute_tools(response.tool_calls, ctx)
                from .providers import ToolResult as LLMToolResultCls
                stm.add(Message.tool([
                    LLMToolResultCls(
                        tool_call_id=tc.id,
                        content=tr.to_content(),
                        is_error=not tr.success,
                    )
                    for tc, tr in zip(response.tool_calls, tool_results)
                ]))

            yield response, tool_results

            if response.stop_reason == "error":
                # Provider returned a structured error (key missing, blocked
                # response, all fallbacks exhausted). Bail with the content
                # as the error so the orchestrator surfaces it cleanly.
                raise RuntimeError(response.content or "LLM provider returned an error")

            if response.stop_reason == "end_turn":
                break

    async def _execute_tools(
        self, tool_calls: list[ToolCall], ctx: ExecutionContext
    ) -> list[ToolResult]:
        import asyncio
        results = []
        for tc in tool_calls:
            self.tracer.emit(EventType.TOOL_CALLED, {"tool": tc.name, "input": str(tc.input)[:200]})
            t0 = time.monotonic()
            result = await self.tools.execute(tc, ctx)
            duration_ms = int((time.monotonic() - t0) * 1000)
            result.duration_ms = duration_ms

            event_type = EventType.TOOL_COMPLETED if result.success else EventType.TOOL_FAILED
            self.tracer.emit(event_type, {
                "tool": tc.name,
                "success": result.success,
                "error": result.error[:200] if result.error else "",
            }, duration_ms=duration_ms)
            results.append(result)
        return results

    def _is_cancelled(self, execution_id: str) -> bool:
        """Check Redis for a cancellation signal for this execution."""
        try:
            import os
            import redis
            redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
            r = redis.from_url(redis_url, decode_responses=True, socket_connect_timeout=1)
            return bool(r.get(f"aos:cancel:{execution_id}"))
        except Exception:
            return False

    def _build_system_prompt(self, memories: list[str]) -> str:
        prompt = self.agent_def.system_prompt

        # Always inject tool-use instructions so agents don't narrate instead of act
        tool_names = self.tools.names()
        if tool_names:
            tool_list = ", ".join(f"`{t}`" for t in tool_names)
            prompt += f"""

---

## Tool Use — Critical Instructions

You have access to these tools: {tool_list}

**You MUST call tools to do real work. Do NOT describe or simulate tool calls in text.**

When creating files:
- Call `file.write` with the exact path and complete file contents
- One call per file — write complete, production-ready content, no placeholders
- After every `file.write` call succeeds, confirm with: `[wrote] <path>`
- Write ALL files the plan specifies before writing any summary text

When running commands:
- Call `shell.run` — do not just show what you would run

A response that only describes what tools would do has zero real-world effect.
Act. Don't narrate."""

        if memories:
            context = "\n\n".join(f"- {m[:500]}" for m in memories)
            prompt += f"\n\n---\n\n## Relevant context from prior work\n\n{context}"

        return prompt

    def _report_usage(
        self,
        job,
        tokens_input: int,
        tokens_output: int,
        duration_ms: int,
        success: bool,
        error: str,
    ) -> None:
        """Fire-and-forget usage report to AOS bridge."""
        try:
            from core import aos_client
            if not aos_client.ENABLED:
                return
            cost_per_1k = 0.003  # default; ideally pulled from LLMConfig in AOS
            cost_usd = ((tokens_input + tokens_output) / 1000) * cost_per_1k
            aos_client.usage_report(
                execution_id=job.execution_id,
                agent_name=job.agent_id,
                engine="native",
                duration_ms=duration_ms,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                cost_usd=cost_usd,
                success=success,
                error_message=error[:500] if error else "",
            )
        except Exception:
            pass
