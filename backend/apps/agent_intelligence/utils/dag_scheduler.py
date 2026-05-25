"""
DAG-based workflow task scheduler.

Resolves WorkflowTask dependency graphs using Kahn's topological sort,
then executes tasks in order using each task's assigned agent.
"""
import logging
from collections import defaultdict, deque
from typing import List

logger = logging.getLogger(__name__)


class CyclicDependencyError(ValueError):
    pass


class DAGScheduler:

    @staticmethod
    def topological_sort(tasks) -> List:
        """
        Kahn's algorithm. Returns tasks in valid execution order.
        Raises CyclicDependencyError if the graph has a cycle.
        """
        task_map = {t.id: t for t in tasks}
        in_degree = defaultdict(int)
        adjacency = defaultdict(list)

        for task in tasks:
            if task.id not in in_degree:
                in_degree[task.id] = 0
            for dep in task.depends_on.all():
                if dep.id in task_map:
                    adjacency[dep.id].append(task.id)
                    in_degree[task.id] += 1

        queue = deque(tid for tid in task_map if in_degree[tid] == 0)
        ordered = []

        while queue:
            tid = queue.popleft()
            ordered.append(task_map[tid])
            for neighbor in adjacency[tid]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if len(ordered) != len(tasks):
            raise CyclicDependencyError(
                "Workflow contains a cyclic dependency — cannot schedule execution"
            )

        return ordered

    @staticmethod
    def get_runnable_tasks(owner):
        """
        Return tasks that are PENDING and have all dependencies COMPLETED.
        These are safe to run right now.
        """
        from apps.agent_intelligence.models import WorkflowTask

        pending = WorkflowTask.objects.filter(
            agent__owner=owner,
            status="PENDING",
        ).prefetch_related("depends_on")

        runnable = []
        for task in pending:
            deps = task.depends_on.all()
            if all(d.status == "COMPLETED" for d in deps):
                runnable.append(task)
        return runnable

    @staticmethod
    def run_workflow(task_ids: List[str], owner) -> dict:
        """
        Execute a set of tasks in DAG order.

        Each task is executed via its agent's LangGraph executor using the
        task description as the prompt.  Results are stored in task.output_data.

        Returns a summary dict: { task_id: { status, response } }.
        """
        from apps.agent_intelligence.models import WorkflowTask
        from apps.agent_intelligence.utils.agent_factory import LangGraphAgentFactory
        from apps.billing.services import BillingService, BudgetExceededError
        import time

        tasks = list(
            WorkflowTask.objects.filter(id__in=task_ids, agent__owner=owner)
            .prefetch_related("depends_on")
        )
        if not tasks:
            raise ValueError("No tasks found for the provided IDs")

        ordered = DAGScheduler.topological_sort(tasks)
        results = {}

        for task in ordered:
            agent = task.agent

            # Hard budget check
            try:
                BillingService.check_budget(agent, estimated_cost=0.002)
            except BudgetExceededError as exc:
                task.status = "FAILED"
                task.output_data = {"error": f"Budget exceeded: {exc}"}
                task.save()
                results[str(task.id)] = {"status": "FAILED", "error": str(exc)}
                logger.warning("Task %s skipped: %s", task.id, exc)
                continue

            # Skip if dependencies failed
            failed_deps = [d for d in task.depends_on.all() if d.status == "FAILED"]
            if failed_deps:
                task.status = "BLOCKED"
                task.save()
                results[str(task.id)] = {
                    "status": "BLOCKED",
                    "reason": "upstream dependency failed",
                }
                continue

            if not hasattr(agent, "capability"):
                task.status = "FAILED"
                task.output_data = {"error": "Agent has no capability configuration"}
                task.save()
                results[str(task.id)] = {"status": "FAILED", "error": "No capability"}
                continue

            task.status = "IN_PROGRESS"
            task.save()
            start = time.time()

            try:
                from apps.agent_intelligence.models import Conversation, Message

                # Inject outputs from upstream tasks as context
                upstream_context = _build_upstream_context(task, results)
                prompt = task.description
                if upstream_context:
                    prompt = f"{upstream_context}\n\n---\n\nYour task:\n{task.description}"

                conversation = Conversation.objects.create(
                    agent=agent,
                    project=task.project,
                    title=f"DAG Task: {task.description[:50]}",
                    status="ACTIVE",
                    llm_config=agent.capability.primary_llm,
                )
                Message.objects.create(conversation=conversation, role="USER", content=prompt)

                capability = agent.capability
                state = {
                    "messages": [{"role": "user", "content": prompt}],
                    "agent_id": str(agent.id),
                    "conversation_id": str(conversation.id),
                    "project_id": str(task.project_id) if task.project_id else None,
                    "iterations": 0,
                    "max_iterations": capability.max_iterations,
                }
                executor = LangGraphAgentFactory.create_agent(agent)
                config = {"configurable": {"thread_id": str(conversation.id)}}
                result = executor.invoke(state, config=config)

                last = result["messages"][-1]
                reply = getattr(last, "content", str(last))

                duration_ms = int((time.time() - start) * 1000)
                task.status = "COMPLETED"
                task.output_data = {"response": reply, "duration_ms": duration_ms}
                task.save()

                BillingService.record_usage(
                    agent=agent,
                    resource_type="dag_task",
                    resource_id=task.id,
                    compute_time_ms=duration_ms,
                    cost=0.002,
                    project=task.project,
                )
                conversation.status = "COMPLETED"
                conversation.save()

                results[str(task.id)] = {"status": "COMPLETED", "response": reply}

            except Exception as exc:
                logger.exception("DAG task %s failed", task.id)
                task.status = "FAILED"
                task.output_data = {"error": str(exc)}
                task.save()
                results[str(task.id)] = {"status": "FAILED", "error": str(exc)}

        return results


def _build_upstream_context(task, results: dict) -> str:
    """Build a prompt prefix summarising upstream task outputs."""
    parts = []
    for dep in task.depends_on.all():
        dep_result = results.get(str(dep.id), {})
        if dep_result.get("status") == "COMPLETED":
            parts.append(f"[{dep.description[:60]}]:\n{dep_result.get('response', '')}")
    if not parts:
        return ""
    return "Context from upstream tasks:\n" + "\n\n".join(parts)
