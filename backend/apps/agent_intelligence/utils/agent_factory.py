import logging
from typing import List

from langchain_core.messages import SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.checkpoint.memory import MemorySaver  # corrected import path
from langgraph.graph import StateGraph, END, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition  # ToolExecutor is deprecated
from typing import TypedDict, Annotated, Sequence

from .llm_manager import LLMManager
from .tool_registry import ToolRegistry
from ..models import Agent, AgentCapability

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# State schema
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    # add_messages merges incoming message lists instead of replacing them.
    messages: Annotated[list, add_messages]
    next: str
    agent_id: str
    conversation_id: str
    iterations: int
    max_iterations: int


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

class LangGraphAgentFactory:
    """Factory for creating LangGraph-based agents."""

    @classmethod
    def create_agent(cls, agent: Agent):
        """Main entry point to create an agent based on its capability type."""
        if not hasattr(agent, 'capability'):
            return cls.create_react_agent(agent, None)
        
        cap = agent.capability
        if cap.graph_type == 'MULTI_AGENT':
            return cls.create_supervisor_agent(agent, cap)
        else:
            return cls.create_react_agent(agent, cap)

    @classmethod
    def create_supervisor_agent(cls, agent: Agent, capability: AgentCapability):
        """
        Build a supervisor graph that delegates to sub-agents.
        """
        from langchain_core.messages import HumanMessage
        from langchain_core.output_parsers.openai_functions import JsonOutputFunctionsParser
        from pydantic import BaseModel, Field

        sub_agents = capability.sub_agents.all()
        if not sub_agents:
            logger.warning(f"Supervisor agent {agent.name} has no sub-agents configured.")
            return cls.create_react_agent(agent, capability)

        options = ["FINISH"] + [sa.name for sa in sub_agents]
        
        # Define the supervisor logic
        llm = LLMManager.get_llm(capability.primary_llm)

        class RouteResponse(BaseModel):
            next: str = Field(description=f"The next agent to call. Choose from {options}")

        def supervisor_node(state: AgentState) -> dict:
            import time
            from ..models import TraceStep
            from .metrics import AGENT_EXECUTION_LATENCY
            start_time = time.time()
            
            agent_id = state.get("agent_id")
            
            system_prompt = (
                f"You are a supervisor managing a conversation between the following workers: {[sa.name for sa in sub_agents]}.\n"
                "Given the user request, respond with the worker to act next. Each worker will perform a task and respond with their results.\n"
                "When finished, respond with FINISH."
            )
            
            # Using function calling or structured output to ensure valid routing
            structured_llm = llm.with_structured_output(RouteResponse)
            
            messages = [SystemMessage(content=system_prompt)] + state["messages"]
            response = structured_llm.invoke(messages)
            
            # Record Trace & Metrics
            duration = time.time() - start_time
            duration_ms = int(duration * 1000)
            
            AGENT_EXECUTION_LATENCY.labels(agent_id=agent_id, agent_name=agent.name, node_name="supervisor").observe(duration)
            
            try:
                TraceStep.objects.create(
                    conversation_id=state.get("conversation_id"),
                    node_name="supervisor",
                    input_data={"message_count": len(state["messages"])},
                    output_data={"next": response.next},
                    duration_ms=duration_ms
                )
            except Exception as e:
                logger.error(f"Failed to record supervisor trace: {e}")
            
            return {"next": response.next}

        # Create worker nodes
        workflow = StateGraph(AgentState)
        workflow.add_node("supervisor", supervisor_node)

        for sa in sub_agents:
            # Recursively create sub-agents
            worker_app = cls.create_agent(sa)
            
            def create_worker_node(app, name):
                def worker_node(state: AgentState) -> dict:
                    result = app.invoke(state)
                    # Get the last message from the worker
                    last_msg = result["messages"][-1]
                    # We need to make sure the message identifies which worker it came from
                    last_msg.content = f"[{name}]: {last_msg.content}"
                    return {"messages": [last_msg]}
                return worker_node

            workflow.add_node(sa.name, create_worker_node(worker_app, sa.name))

        # Define edges
        for sa in sub_agents:
            # Workers always go back to supervisor
            workflow.add_edge(sa.name, "supervisor")

        # Conditional edges from supervisor
        conditional_map = {name: name for name in [sa.name for sa in sub_agents]}
        conditional_map["FINISH"] = END

        workflow.add_conditional_edges(
            "supervisor",
            lambda state: state["next"],
            conditional_map
        )

        workflow.add_edge(START, "supervisor")

        memory = MemorySaver()
        return workflow.compile(checkpointer=memory)

    @classmethod
    def create_react_agent(cls, agent: Agent, capability: AgentCapability):
        """
        Build and compile a ReAct-style LangGraph agent.

        The graph has two nodes:
          • "agent"  – calls the LLM (with tools bound)
          • "tools"  – executes whatever tool the LLM requested

        Routing:  agent → tools_condition → tools → agent  (loop)
                                          ↘ END
        """
        llm = LLMManager.get_llm(capability.primary_llm)
        tools: List = ToolRegistry().get_tools_for_agent(agent)

        # Bind tools to the model so it can emit structured tool-call messages.
        llm_with_tools = llm.bind_tools(tools)

        system_prompt = (
            "You are an autonomous agent with access to tools.\n"
            "Reason step-by-step and use the provided tools when needed.\n"
            "When the task is complete, provide a final answer to the user."
        )

        # ------------------------------------------------------------------ #
        # Node: agent                                                          #
        # ------------------------------------------------------------------ #
        def agent_node(state: AgentState) -> dict:
            import time
            from ..models import TraceStep, Conversation
            from .metrics import AGENT_TOKEN_USAGE, AGENT_EXECUTION_LATENCY, AGENT_ANOMALY_COUNTER
            
            start_time = time.time()
            iterations = state.get("iterations", 0)
            max_iterations = state.get("max_iterations", 10)
            agent_id = state.get("agent_id")
            
            # Get agent info for metrics
            agent_name = "unknown"
            try:
                agent = Agent.objects.get(id=agent_id)
                agent_name = agent.name
            except Agent.DoesNotExist:
                pass

            if iterations >= max_iterations:
                from langchain_core.messages import AIMessage
                AGENT_ANOMALY_COUNTER.labels(agent_id=agent_id, anomaly_type="max_iterations").inc()
                return {
                    "messages": [
                        AIMessage(content="Max iterations reached. Stopping.")
                    ],
                    "iterations": iterations,
                }

            messages = [SystemMessage(content=system_prompt)] + list(state["messages"])
            response = llm_with_tools.invoke(messages)
            
            # Record Trace & Metrics
            duration = time.time() - start_time
            duration_ms = int(duration * 1000)
            conv_id = state.get("conversation_id")
            
            AGENT_EXECUTION_LATENCY.labels(agent_id=agent_id, agent_name=agent_name, node_name="agent").observe(duration)
            
            # Simple loop detection
            is_loop = False
            if len(state["messages"]) > 0:
                last_msg = state["messages"][-1]
                if hasattr(last_msg, 'content') and last_msg.content == response.content:
                    is_loop = True
                    AGENT_ANOMALY_COUNTER.labels(agent_id=agent_id, anomaly_type="loop").inc()

            try:
                TraceStep.objects.create(
                    conversation_id=conv_id,
                    node_name="agent",
                    input_data={"message_count": len(messages)},
                    output_data={"content": response.content[:200] if hasattr(response, 'content') else str(response)[:200]},
                    duration_ms=duration_ms,
                    is_loop=is_loop
                )
            except Exception as e:
                logger.error(f"Failed to record trace step: {e}")

            return {
                "messages": [response],
                "iterations": iterations + 1,
            }

        # ------------------------------------------------------------------ #
        # Graph assembly                                                       #
        # ------------------------------------------------------------------ #
        tool_node = ToolNode(tools)  # handles tool execution + result messages

        workflow = StateGraph(AgentState)
        workflow.add_node("agent", agent_node)
        workflow.add_node("tools", tool_node)

        # Entry point
        workflow.add_edge(START, "agent")

        # After the agent runs, use tools_condition to decide next step:
        #   • if the LLM emitted tool_calls  → "tools"
        #   • otherwise                      → END
        workflow.add_conditional_edges(
            "agent",
            tools_condition,  # built-in: checks for AIMessage.tool_calls
            {
                "tools": "tools",
                END: END,
            },
        )

        # After tools execute, always return to the agent for the next turn.
        workflow.add_edge("tools", "agent")

        memory = MemorySaver()
        app = workflow.compile(checkpointer=memory)
        return app

    @classmethod
    async def acreate_react_agent(cls, agent: Agent, capability: AgentCapability):
        """Async entry-point — graph compilation is synchronous; invoke is async."""
        # The compiled graph returned by create_react_agent supports ainvoke()
        # and astream() natively.
        return cls.create_react_agent(agent, capability)