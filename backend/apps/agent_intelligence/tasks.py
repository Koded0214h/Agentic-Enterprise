from celery import shared_task
import logging
import time
from apps.agent_registry.models import Agent
from apps.agent_intelligence.models import Conversation, Message
from apps.agent_intelligence.utils.agent_factory import LangGraphAgentFactory
from apps.billing.services import BillingService

logger = logging.getLogger(__name__)

@shared_task
def execute_agent_background(agent_id, task_description, conversation_id=None):
    """Execute an agent in the background via Celery."""
    try:
        agent = Agent.objects.get(id=agent_id)
        capability = agent.capability
        
        if conversation_id:
            conversation = Conversation.objects.get(id=conversation_id)
        else:
            conversation = Conversation.objects.create(
                agent=agent,
                title=f"Background Task: {task_description[:30]}",
                status="ACTIVE",
                llm_config=capability.primary_llm
            )

        Message.objects.create(conversation=conversation, role="USER", content=task_description)
        
        start_time = time.time()
        executor = LangGraphAgentFactory.create_agent(agent)
        
        # Build state
        # Note: _build_agent_state is in views.py, might want to move it to a util
        # For now, let's keep it simple here
        state = {
            "messages": [{"role": "user", "content": task_description}],
            "agent_id": str(agent.id),
            "conversation_id": str(conversation.id),
            "iterations": 0,
            "max_iterations": capability.max_iterations
        }
        
        config = {"configurable": {"thread_id": str(conversation.id)}}
        result = executor.invoke(state, config=config)
        
        # Extract reply (again, _extract_reply is in views.py)
        last = result["messages"][-1]
        reply = last.content if hasattr(last, "content") else str(last)
        
        Message.objects.create(conversation=conversation, role="AGENT", content=reply)
        
        # Record usage
        duration_ms = int((time.time() - start_time) * 1000)
        BillingService.record_usage(
            agent=agent,
            resource_type="background_task",
            resource_id=conversation.id,
            compute_time_ms=duration_ms,
            cost=0.0 # Cost logic could be more complex
        )
        
        conversation.status = "COMPLETED"
        conversation.save()
        
        return f"Agent {agent_id} completed task: {task_description[:30]}"
        
    except Exception as e:
        logger.exception(f"Background execution failed for agent {agent_id}: {e}")
        if 'conversation' in locals():
            conversation.status = "FAILED"
            conversation.save()
        raise
