# AOS Native Runtime Architecture

**Status:** Proposed rearchitecture — supersedes CLI-wrapper execution model  
**Date:** 2026-05-15  
**Author:** Internal  
**Replaces:** `engines/adapter.py`, `engines/openclaw_native.py`, `engines/openclaw_parallel.py`

---

## Why This Document Exists

The current AOS execution model shells out to external agent CLIs (Claude Code, Codex) via subprocess. This worked for prototyping and for the open-source swarm demo. It does not work for a serious platform.

When you shell into a CLI:

- You lose observability inside the execution — AOS cannot see what the agent is actually doing, only that it started and finished
- You have no sandboxing you control — you are inside whatever sandbox the CLI provides
- You cannot retry or resume at the tool level — a failure means rerunning the whole agent from scratch
- Your governance layer is a pre-flight check, not a runtime enforcer — policy fires once before dispatch, then you hand off to someone else's runtime
- Your differentiation disappears — you are a wrapper, and wrappers get commoditised

The rearchitecture replaces the CLI execution layer with a native agent runtime that AOS owns end to end. Claude, Gemini, OpenAI, and every other provider become interchangeable intelligence APIs — not your product foundation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Entry points                                │
│  Web / API      Bot interfaces      CLI / SDK      Integrations      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                        Control Plane (Django)                        │
│                                                                      │
│  Agent IAM          Policy Engine       Observability     Billing    │
│  Identity · RBAC    Rules · HITL        Traces · Audit    Metering   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Planner / Router                           │   │
│  │  Parse intent → Select agent team → Build task graph →       │   │
│  │  Enforce policy → Dispatch to job queue                      │   │
│  │  Emits: TASK_STARTED · TOOL_EXECUTED · WAITING · DONE · ERR  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  structured jobs (not shell commands)
┌──────────────────────────────▼──────────────────────────────────────┐
│                   Native Execution Runtime  ← the change             │
│                                                                      │
│  Isolated workers      Job queue             State + memory          │
│  Docker / Firecracker  Celery · Temporal     Short-term · Vector     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                Structured Tool Execution Layer                │   │
│  │  agent.execute(tool="github.create_pr", params={...})        │   │
│  │  Every call: permissioned · logged · retryable · sandboxed   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│              Model Abstraction Layer — intelligence providers         │
│  Claude      Gemini      OpenAI      Mistral      Local / custom     │
│  Swap any provider without touching business logic                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Control Plane (Django backend)

**What it is:** The trust infrastructure. Handles everything that is not execution.

**What it does:** Agent identity, policy evaluation, billing records, audit logging, HITL approval queues, and the planner that decides what gets dispatched and to whom.

**What stays the same:** The existing Django apps (`agent_registry`, `agent_gateway`, `policy_engine`, `agent_intelligence`, `billing`, `knowledge_base`, `swarm_bridge`) are fundamentally sound. The rearchitecture does not touch them structurally.

**What changes:** The control plane stops calling `subprocess.run()` or shelling into CLI tools. Instead, the planner's final step is publishing a structured job to the execution runtime's queue. The swarm bridge HTTP contract is replaced with this queue-based dispatch for internal execution (the bridge API remains for external swarm integrations).

**Interface change:**

```python
# Before (current)
result = subprocess.run(
    ["claude", "--task", task, "--system", agent_md],
    capture_output=True
)

# After (native)
job = AgentJob(
    agent_id=agent.id,
    task=task,
    system_prompt=agent.system_prompt,
    tools=agent.allowed_tools,
    policy_context=policy_result,
    execution_id=execution_id,
)
queue.publish("agent.execute", job)
```

**Tradeoffs:**

| Consideration | Current | Native |
|---|---|---|
| Coupling | Tight — control plane owns execution | Loose — queue decouples them |
| Failure model | CLI crash kills everything | Queue persists jobs across restarts |
| Observability | Black box after dispatch | Full visibility — AOS sees every step |
| Local dev | Simple — one process | Requires queue infrastructure |
| Migration cost | Zero (already running) | Medium — queue setup, worker build |

---

### 2. Planner / Router

**What it is:** The brain that sits between user intent and execution. The most strategically important component AOS builds natively.

**What it does:**

1. Receives a task description (from API, bot, CLI, or UI)
2. Parses intent — what kind of task is this, what domain, what risk level
3. Selects the agent team — which of the 252 agents handle this, in what order, with what supervisor
4. Builds a task graph — DAG of steps with dependency edges
5. Evaluates policy — calls the policy engine before any dispatch; DENY stops here, ESCALATE creates a HITL entry, ALLOW proceeds
6. Dispatches jobs to the execution runtime queue
7. Emits structured lifecycle events throughout

**Events emitted (not logs — typed events):**

```python
TASK_STARTED        = "task.started"        # task accepted, graph built
AGENT_DISPATCHED    = "agent.dispatched"    # individual agent queued
TOOL_CALLED         = "tool.called"         # a tool was invoked
TOOL_COMPLETED      = "tool.completed"      # tool returned
WAITING_APPROVAL    = "task.waiting"        # HITL escalation
AGENT_COMPLETED     = "agent.completed"     # agent finished its step
TASK_COMPLETED      = "task.completed"      # all steps done
TASK_FAILED         = "task.failed"         # unrecoverable failure
```

**Why events matter:** Events are what make dashboards, replays, anomaly detection, and audit trails possible. Logs are for humans reading text. Events are for systems consuming structured data. The distinction becomes critical when you need to replay a failed execution, or when an enterprise auditor asks "what did the agent do and why."

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| DAG complexity | Powerful for multi-agent workflows; adds planning latency (target <50ms) |
| Intent parsing accuracy | LLM-assisted planning is non-deterministic; needs deterministic fallbacks for known task types |
| Policy at planning time | Catches violations early; some violations only become visible at execution time (add runtime re-checks) |
| Event volume | High-frequency tasks generate large event streams; needs event sampling strategy at scale |

---

### 3. Native Agent Worker

**What it is:** The replacement for `engines/openclaw_native.py` and the CLI adapter. This is the heart of the rearchitecture.

**What it does:** Consumes a job from the queue, runs the agent's 5-phase workflow natively (no subprocess), calls LLMs via direct API, executes tools through the structured tool layer, emits trace events back to AOS, and handles its own failure recovery.

**Interface:**

```python
class NativeAgentWorker:
    def __init__(self, agent_def: AgentDefinition, llm: LLMProvider):
        self.agent = agent_def
        self.llm = llm
        self.tools = ToolRegistry.for_agent(agent_def)
        self.memory = AgentMemory(agent_def.id)
        self.tracer = TraceEmitter(agent_def.id)

    async def run(self, job: AgentJob) -> AgentResult:
        context = await self.memory.load(job.execution_id)
        messages = self._build_messages(job.task, context)

        async for event in self._execute_loop(messages, job):
            await self.tracer.emit(event)

        return AgentResult(
            execution_id=job.execution_id,
            output=event.output,
            tool_calls=event.tool_calls,
            token_usage=event.tokens,
        )

    async def _execute_loop(self, messages, job):
        while True:
            response = await self.llm.complete(
                messages=messages,
                tools=self.tools.schemas(),
                system=self.agent.system_prompt,
            )
            if response.stop_reason == "end_turn":
                yield CompletionEvent(response)
                break
            if response.stop_reason == "tool_use":
                for tool_call in response.tool_calls:
                    result = await self.tools.execute(tool_call)
                    yield ToolEvent(tool_call, result)
                    messages.append(tool_result_message(tool_call.id, result))
```

**What this unlocks vs the CLI model:**

- AOS sees every LLM call, every tool invocation, every token consumed — in real time
- Tool failures can be retried without rerunning the whole agent
- Memory can be injected and updated mid-execution
- Multiple workers can run the same agent in parallel without process conflicts
- Cost attribution is exact — every token is attributed to a specific agent, task, and department

**Sandboxing strategy:**

```
Development:   Python process with tool permission checks
Production:    Docker container per worker (1–5s startup)
Sensitive:     Firecracker microVM per execution (<150ms startup at scale)
```

Start with Docker. Firecracker is a later optimisation for when cold-start latency matters.

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Build cost | Significant — this is the largest engineering investment in the rearchitecture |
| Streaming | Native workers can stream tokens back to the frontend; CLI wrappers cannot |
| LLM API rate limits | Multiple workers hit provider limits faster; needs rate limit management layer |
| Agent prompt parity | Existing 252 agent `.md` files are still valid — system prompts, not execution logic |
| Debugging | Easier — full trace available; no more reading CLI stdout |

---

### 4. Job Queue

**What it is:** The durable execution backbone. Decouples the control plane from execution workers.

**Recommended stack:** Celery + Redis for now. Temporal if/when you need durable multi-step workflows with guaranteed exactly-once semantics.

**Why this matters:** Without a queue, a server restart kills running agents. With a queue, jobs survive restarts, can be retried automatically, can be prioritised by department or urgency, and can be inspected by operators.

**Job schema:**

```python
@dataclass
class AgentJob:
    job_id: str                    # UUID
    execution_id: str              # links to AOS trace
    agent_id: str                  # which agent definition
    task: str                      # the task description
    system_prompt: str             # agent's system prompt
    tools: list[str]               # allowed tool names
    policy_context: dict           # result from pre-flight policy check
    priority: int                  # 0 (low) to 10 (critical)
    timeout_seconds: int           # hard execution limit
    retry_policy: RetryPolicy      # max retries, backoff strategy
    created_at: datetime
    department_id: str             # for billing attribution
```

**Queue design:**

```
queues:
  agent.execute.critical    priority 10 — HITL-approved actions
  agent.execute.standard    priority 5  — normal tasks
  agent.execute.batch       priority 1  — background/non-urgent
  agent.heartbeat           liveness checks
  agent.results             completed job results → control plane
```

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Celery vs Temporal | Celery: simple, well-known, fast to set up. Temporal: durable workflows with replay, better for long-running multi-step tasks. Start with Celery, migrate critical workflows to Temporal later. |
| Redis vs RabbitMQ | Redis is already in the stack (likely). RabbitMQ gives better message routing at scale. Redis is fine until you hit ~10k jobs/hour. |
| Queue depth visibility | Add Flower (Celery monitor) or a Temporal UI from day one — you need to see what's queued |
| At-least-once delivery | Jobs may execute twice on network partition; workers must be idempotent on `job_id` |

---

### 5. Isolated Worker Sandboxes

**What it is:** The execution environment each agent worker runs inside. Replaces the implicit sandboxing of the Claude Code CLI.

**Three tiers:**

**Tier 1 — Process isolation (development)**  
Each worker runs as a separate Python process with restricted imports. Suitable for local dev and low-risk agents (research, writing, analysis).

```python
# Worker launched per job via Celery
@celery.task(bind=True, max_retries=3)
def execute_agent_job(self, job_dict: dict):
    job = AgentJob(**job_dict)
    worker = NativeAgentWorker.from_job(job)
    return worker.run_sync(job)
```

**Tier 2 — Docker container (production)**  
Each agent category gets a container image with only the tools it needs. An engineering agent has git, npm, python. A marketing agent has none of those.

```dockerfile
FROM python:3.12-slim
RUN pip install anthropic langchain chromadb --no-cache-dir
COPY agent_worker/ /app/
# Engineering agents only
RUN apt-get install -y git nodejs npm
USER nonroot
CMD ["python", "-m", "agent_worker"]
```

Container lifecycle: warm pool of 5–10 containers per agent category, spun up on queue depth, torn down after idle timeout.

**Tier 3 — Firecracker microVM (sensitive/enterprise)**  
Sub-150ms cold start, kernel-level isolation, no shared host resources. Required for agents handling sensitive data (finance, healthcare, compliance). This is a later milestone — implement after Docker tier is stable.

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Cold start latency | Process: ~0ms. Docker: 1–5s. Firecracker: ~150ms. Container warm pools mitigate Docker latency. |
| Resource cost | Containers idle cost money; tune pool sizes by queue depth |
| Complexity | Docker adds ops burden (image builds, registry, orchestration) — worth it for the isolation guarantees |
| Escape risk | Process isolation is weak (shared memory, syscalls). Docker is strong. Firecracker is near-perfect. Match tier to data sensitivity. |

---

### 6. State and Memory System

**What it is:** The layer that makes agents non-stateless. Without it, every execution starts from scratch and agents feel dumb.

**Three memory scopes:**

**Short-term context (within one execution)**  
The message history passed to the LLM. Managed by the worker. Includes: task description, prior tool results, agent-to-agent handoff messages.

```python
class ShortTermMemory:
    def __init__(self, max_tokens: int = 100_000):
        self.messages: list[Message] = []
        self.token_count: int = 0

    def add(self, message: Message):
        self.messages.append(message)
        self.token_count += message.token_count
        if self.token_count > self.max_tokens:
            self._compress()  # summarise old turns, keep recent ones
```

**Agent memory (cross-session, per-agent)**  
What the agent has learned from prior executions. Stored in SQLite + ChromaDB. The existing `memory-system/` (claude-mem plugin) covers this well — integrate it into the native worker rather than running it as a separate process.

```python
class AgentMemory:
    def load(self, agent_id: str, task: str) -> list[MemoryChunk]:
        # vector search: find memories relevant to this task
        return self.vector_store.query(
            query=task,
            filter={"agent_id": agent_id},
            top_k=5,
        )

    def store(self, agent_id: str, execution_id: str, learning: str):
        self.vector_store.upsert(
            id=execution_id,
            text=learning,
            metadata={"agent_id": agent_id, "timestamp": now()},
        )
```

**Workspace state (per project)**  
Files, environment variables, partial outputs that persist across an agent team's work on a project. The existing `core/workspace.py` handles this correctly — keep it as-is.

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Memory retrieval latency | Vector search adds ~20–50ms per execution; acceptable, but cache hot memories for frequent agents |
| Memory staleness | Old memories may be wrong; add TTL and confidence scoring |
| Privacy | Memories may contain sensitive data; apply the same data classification as the execution that created them |
| Cross-agent memory sharing | Powerful but risky — one agent's bad memory poisons another's. Scope sharing carefully by team, not globally. |

---

### 7. Structured Tool Execution Layer

**What it is:** The replacement for implicit "whatever the CLI decides to do." Every tool AOS agents can use is a registered, typed, permissioned function.

**Before (current model):**

```bash
claude --task "create a PR for the auth fixes" --system engineering_agent.md
# Claude Code decides what tools to use internally
# AOS sees: started, finished, output text
# AOS does not see: which files were read, what API calls were made, what was written
```

**After (native model):**

```python
result = await agent.execute(
    tool="github.create_pr",
    params={
        "repo": "org/repo",
        "title": "Fix auth token expiry",
        "branch": "fix/auth-expiry",
        "body": pr_body,
    }
)
# AOS sees: tool name, params, result, duration, error (if any)
# Policy engine checked: is this agent allowed to create PRs in this repo?
# Billing records: this tool call cost N tokens + 1 GitHub API call
# Trace: this call is step 4 of execution abc-123
```

**Tool registry design:**

```python
class Tool:
    name: str                          # "github.create_pr"
    description: str                   # for LLM tool schema
    parameters: JSONSchema             # typed input validation
    required_permissions: list[str]    # e.g. ["github.write", "code.deploy"]
    risk_level: int                    # 0-100, checked against policy
    timeout_seconds: int
    is_destructive: bool               # triggers HITL if True + high-risk agent

    async def execute(self, params: dict, context: ExecutionContext) -> ToolResult:
        ...

# Registration
registry = ToolRegistry()
registry.register(GitHubCreatePRTool())
registry.register(GitHubReadFileTool())
registry.register(SlackSendMessageTool())
registry.register(ShellCommandTool(allowed_commands=["npm", "pytest", "git"]))
```

**Existing MCP servers map directly to tool categories:**

| MCP Server | Tool namespace |
|---|---|
| `github_server.py` | `github.*` |
| `ads_server.py` | `ads.*` |
| `social_server.py` | `social.*` |
| `messaging_server.py` | `messaging.*` |
| `scheduler_server.py` | `scheduler.*` |
| `hub_server.py` | `hub.*` |

The MCP servers do not need to be rewritten. They become the implementation behind tool namespaces. The native tool layer calls them over their existing protocol, or you inline the logic as you have bandwidth.

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Schema maintenance | Every tool needs a JSON schema — ongoing maintenance cost as tools evolve |
| Permission granularity | Fine-grained permissions are powerful but complex to define and audit |
| Tool versioning | Tools change their APIs; version tools like code and give agents a tool version contract |
| LLM tool calling differences | Anthropic, OpenAI, and Gemini have slightly different tool calling schemas; the model abstraction layer handles this translation |

---

### 8. Model Abstraction Layer

**What it is:** The interface that makes every LLM provider interchangeable. Claude, Gemini, OpenAI, Mistral, local models — same interface, different implementations.

**Interface:**

```python
from abc import ABC, abstractmethod

class LLMProvider(ABC):
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
    ) -> AsyncIterator[LLMStreamChunk]:
        ...

class AnthropicProvider(LLMProvider):
    async def complete(self, messages, system, tools=None, **kwargs) -> LLMResponse:
        response = await self.client.messages.create(
            model=self.model,
            system=system,
            messages=self._format_messages(messages),
            tools=self._format_tools(tools),
            **kwargs,
        )
        return self._parse_response(response)

class GeminiProvider(LLMProvider):
    async def complete(self, messages, system, tools=None, **kwargs) -> LLMResponse:
        # Gemini-specific formatting
        ...

class LocalProvider(LLMProvider):
    # Ollama, vLLM, or any OpenAI-compatible local endpoint
    ...
```

**Routing strategy:** Different agents can use different providers based on cost, latency, capability, and data sensitivity requirements.

```python
PROVIDER_ROUTING = {
    "core.*":           "anthropic/claude-sonnet-4-6",   # high quality for planning
    "engineering.*":    "anthropic/claude-sonnet-4-6",   # code quality matters
    "marketing.*":      "google/gemini-pro",             # cost optimisation
    "research.*":       "anthropic/claude-opus-4-6",     # deep analysis
    "support.*":        "local/llama-3",                 # data stays on-prem
}
```

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Abstraction overhead | Thin layer — minimal performance cost; large correctness benefit |
| Provider capability gaps | Not all providers support all tool calling schemas; abstraction layer must handle translation and capability flags |
| Prompt portability | A prompt tuned for Claude may not perform identically on Gemini; test per provider |
| Cost routing complexity | Smart routing saves money but adds decision logic; start simple (one provider per agent category) |

---

### 9. Event System

**What it is:** The typed event bus that makes AOS observable, replayable, and debuggable. Every meaningful thing that happens in the runtime emits an event.

**Why this is different from logging:**

Logs are strings written for humans. Events are typed records consumed by systems — dashboards, alerting, replay engines, billing calculators, anomaly detectors. The same event that renders in the observability dashboard can also trigger a billing record, update a real-time chart, and feed into an anomaly detection model.

**Event schema:**

```python
@dataclass
class AOSEvent:
    event_id: str                  # UUID
    event_type: str                # see taxonomy below
    execution_id: str              # links all events for one task
    agent_id: str
    timestamp: datetime
    payload: dict                  # event-specific data
    duration_ms: int | None
    risk_score: int | None
    department_id: str             # for billing attribution

# Event taxonomy
class EventType:
    # Lifecycle
    TASK_STARTED         = "task.started"
    TASK_COMPLETED       = "task.completed"
    TASK_FAILED          = "task.failed"

    # Agent
    AGENT_DISPATCHED     = "agent.dispatched"
    AGENT_STARTED        = "agent.started"
    AGENT_COMPLETED      = "agent.completed"
    AGENT_FAILED         = "agent.failed"

    # LLM
    LLM_REQUEST          = "llm.request"
    LLM_RESPONSE         = "llm.response"
    LLM_STREAM_CHUNK     = "llm.stream_chunk"

    # Tools
    TOOL_CALLED          = "tool.called"
    TOOL_COMPLETED       = "tool.completed"
    TOOL_FAILED          = "tool.failed"
    TOOL_RETRIED         = "tool.retried"

    # Governance
    POLICY_CHECKED       = "policy.checked"
    POLICY_DENIED        = "policy.denied"
    HITL_RAISED          = "hitl.raised"
    HITL_APPROVED        = "hitl.approved"
    HITL_REJECTED        = "hitl.rejected"

    # Memory
    MEMORY_LOADED        = "memory.loaded"
    MEMORY_STORED        = "memory.stored"

    # Self-healing
    RECOVERY_TRIGGERED   = "recovery.triggered"
    RECOVERY_STRATEGY    = "recovery.strategy"    # RETRY/REASSIGN/SIMPLIFY/FALLBACK/ESCALATE
```

**Consumers of events:**

```
Events →  Prometheus metrics     (counters, histograms per event type)
       →  Audit log              (immutable append-only store in DB)
       →  Billing engine         (LLM_RESPONSE → UsageRecord)
       →  Frontend WebSocket     (real-time dashboard updates)
       →  Grafana / Tempo        (via OpenTelemetry OTLP export)
       →  Anomaly detector       (phase 2 — pattern detection)
```

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Event volume | A complex 20-agent task may emit 500+ events; needs event sampling for high-frequency types (LLM_STREAM_CHUNK especially) |
| Consumer coupling | Multiple consumers on one event bus can slow down execution if consumers block; use async fan-out |
| Replay | Events enable execution replay for debugging; store events durably (not just metrics) |
| Schema evolution | Events are an API contract; version them and avoid breaking changes |

---

### 10. Self-Healing (Recovery Engine)

**What it is:** The existing `core/self_healer.py` adapted to the native runtime. Recovery strategies trigger on typed failure events rather than catching subprocess errors.

**Five strategies (unchanged):**

```python
class RecoveryStrategy(Enum):
    RETRY     = "retry"      # same agent, same task, after backoff
    REASSIGN  = "reassign"   # different agent, same task
    SIMPLIFY  = "simplify"   # break task into smaller subtasks
    FALLBACK  = "fallback"   # predefined safe default output
    ESCALATE  = "escalate"   # create HITL entry, pause execution

class RecoveryEngine:
    def on_agent_failed(self, event: AgentFailedEvent) -> RecoveryAction:
        strategy = self._select_strategy(
            failure_type=event.failure_type,
            retry_count=event.retry_count,
            agent_risk=event.agent.risk_level,
        )
        return RecoveryAction(strategy=strategy, execution_id=event.execution_id)
```

**What changes in the native model:** Recovery now happens at the tool level as well as the agent level. A failed GitHub API call can be retried without rerunning the LLM. This significantly reduces unnecessary token spend on transient failures.

**Tradeoffs:**

| Consideration | Tradeoff |
|---|---|
| Tool-level vs agent-level retry | Tool retry is cheaper (no LLM cost) but requires idempotent tool implementations |
| REASSIGN complexity | Selecting a substitute agent requires the planner — adds latency to recovery path |
| Escalation UX | HITL entries must surface clearly in the dashboard; a task silently waiting for approval is a support ticket waiting to happen |

---

## Migration Path

The rearchitecture does not require a rewrite. It runs in parallel with the existing CLI execution path until each agent category is migrated.

### Phase 1 — Build the native worker (weeks 1–4) ✅ DONE (2026-05-16)

- ✅ `runtime/events.py` — `AOSEvent`, `EventType`, `EventBus`, `TraceEmitter` (forwards to AOS bridge)
- ✅ `runtime/providers.py` — `LLMProvider` ABC + `AnthropicProvider` (streaming, prompt caching) + `GeminiProvider` + `OpenAIProvider` stubs + `ProviderRouter`
- ✅ `runtime/tools.py` — `Tool` ABC, `ToolRegistry`, built-in tools (shell.run, file.read, file.write, file.list), `MCPTool` proxy for all 6 MCP server namespaces
- ✅ `runtime/jobs.py` — `AgentJob` dataclass, Celery app + task, queue routing (critical/standard/batch), sync fallback
- ✅ `runtime/worker.py` — `NativeAgentWorker` async execution loop, `ShortTermMemory`, `AgentMemory` (ChromaDB + file fallback), usage reporting
- ✅ `runtime/recovery.py` — `RecoveryEngine` wired to EventBus, 5 strategies, tool-level retry before agent-level retry
- ✅ `runtime/__init__.py` — `run_agent()` (async direct) + `enqueue_agent()` (Celery) public API
- ✅ `requirements-runtime.txt` — anthropic, openai, google-generativeai, celery, redis, chromadb
- ✅ `test_runtime.py` — smoke tests passing (EventBus, ToolRegistry, FileReadTool, AgentJob, AgentDefinition)
- ✅ `engines/adapter.py` untouched — CLI path still works for all agent categories

Next: migrate one agent category (engineering) to run natively, validate output parity with CLI adapter

### Phase 2 — Docker sandboxing (weeks 5–8) ✅ DONE (2026-05-16)

- Build Docker images per agent category
- Implement container warm pool manager
- ✅ `Dockerfile.runtime` — base runtime image (python:3.12-slim, non-root)
- ✅ `docker/engineering.Dockerfile` — +git, Node.js, npm, build tools
- ✅ `docker/default.Dockerfile` — minimal (sales, marketing, support, strategy)
- ✅ `runtime/sandbox.py` — `ContainerPool` with warm pool, idle expiry, Docker exec, process fallback
- ✅ `docker-compose.runtime.yml` — standard worker (×2), critical worker, Flower monitor, Redis
- ✅ `engines/adapter.py` — `NativeEngine` registered as `--engine native`; routes `dispatch_agent()` to `runtime.run_agent()`
- ⬜ Migrate remaining agent categories from CLI adapter (do one category at a time as native runtime matures)
- ⬜ Decommission `engines/adapter.py` and `engines/openclaw_native.py` (after full migration)

### Phase 3 — Streaming and real-time (weeks 9–12) ✅ DONE (2026-05-16)

- ✅ `runtime/events.py` — Redis pub/sub publisher (`_redis_publish`); events stream to `aos:events:{execution_id}` channel when `REDIS_URL` is set
- ✅ `backend/apps/swarm_bridge/views.py` — `ExecutionEventStreamView`: SSE endpoint, Redis subscriber with DB-poll fallback; query-param JWT auth for EventSource
- ✅ `backend/apps/swarm_bridge/urls.py` — `GET /api/swarm/executions/<id>/stream/` registered
- ✅ `frontend/src/api/observe.js` — `observe.streamExecution(id, onEvent, onDone, onError)` + `observe.executionReplay(id)`
- ✅ `frontend/src/pages/app/Observe.jsx` — `LiveMonitor` upgraded: click agent row → opens live event feed panel; real-time event log with colour-coded event types, auto-scroll, close button; `useRef` for EventSource lifecycle management
- ⬜ Connect Prometheus event counters (wire `_bus.on()` listeners to prometheus_client)
- ⬜ Grafana dashboard JSON (import from `docs/grafana/`)
- ⬜ LLM token stream → frontend (requires frontend `<textarea>` streaming component)

### Phase 4 — Enterprise hardening (months 4–6) ✅ DONE (2026-05-16)

- ✅ `runtime/tools.py` — `ToolRegistry.execute()` idempotency cache: destructive tools deduped by `(execution_id, tool_name, params_hash)` — safe for Celery retries
- ✅ `backend/apps/swarm_bridge/views.py` — `ExecutionReplayView`: `GET /api/swarm/executions/<id>/replay/` returns interleaved TraceStep + PolicyAuditLog records sorted by timestamp
- ✅ `backend/apps/swarm_bridge/urls.py` — `/replay/` route registered
- ✅ `backend/apps/agent_intelligence/views.py` — HITL state snapshot now stores full message history (`messages`, `agent_id`, `conversation_id`); resume path uses snapshot messages directly instead of re-querying DB
- ⬜ Firecracker microVM tier — future milestone (after Docker tier stable)
- ⬜ Event replay UI in Observe.jsx (wire to `/replay/` endpoint)

---

## What Does Not Change

| Component | Status | Reason |
|---|---|---|
| Django control plane apps | Keep as-is | Sound architecture, no structural changes needed |
| 252 agent `.md` definitions | Keep as-is | System prompts work in any execution model |
| Policy engine | Keep as-is | Fits natively into the pre-dispatch check |
| LangGraph supervisor routing | Keep as-is | Wire to native workers instead of CLI |
| Memory system (claude-mem) | Integrate | Move from standalone process to library import |
| MCP servers | Keep as-is | Wrap as tool implementations |
| Frontend pages | Keep as-is | Wire to live APIs as planned |
| TypeScript/Bun CLI | Keep as-is | Developer-facing tool; not the execution engine |
| Bots (Telegram, WhatsApp) | Keep as-is | Entry points, not execution |

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Native worker build takes longer than expected | High | Keep CLI adapter running in parallel; no forced cutover |
| LLM provider API changes break abstraction layer | Medium | Pin provider SDK versions; abstract at message schema level not SDK level |
| Container warm pool cost in idle environments | Low | Scale pool to zero outside business hours for non-critical agents |
| Event volume overwhelms database at scale | Medium | Add event sampling for high-frequency types; use time-series DB for metrics |
| Agent `.md` prompts behave differently without CLI context | Medium | Audit top-20 most-used agents in native execution before full migration |
| Dual runtime divergence (Python + TypeScript/Bun) | Medium | Clearly separate concerns: Python orchestrator = internal execution engine, TS/Bun = developer CLI. No shared execution logic. |

---

## What This Unlocks

Once the native runtime is in place, these become possible:

**For enterprises:**
- Real-time streaming of agent execution to the frontend
- Sub-second policy enforcement at the tool level (not just pre-flight)
- Exact token and cost attribution per department per tool call
- Execution replay for compliance audit ("show me exactly what the agent did in this run")
- Anomaly detection ("this agent is calling the GitHub API 10x more than usual")

**For the product:**
- Provider routing as a pricing lever (route cheap tasks to cheaper models automatically)
- Agent marketplace where third parties publish tool implementations
- White-label deployment where enterprises bring their own models
- The autonomous startup engine vision — the orchestration, state, and tool execution are all in-house; LLMs become commodities you price-shop

**The core insight:** The value in agent infrastructure is not the model. It is orchestration, state, permissions, reliability, and execution environment. Those are now yours.

---

*AOS Native Architecture · Internal Technical Document · 2026-05-15*