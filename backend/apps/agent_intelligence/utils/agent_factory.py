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
    agent_id: str
    conversation_id: str
    iterations: int
    max_iterations: int


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

class LangGraphAgentFactory:
    """Factory for creating LangGraph-based ReAct agents."""

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
            iterations = state.get("iterations", 0)
            max_iterations = state.get("max_iterations", 10)

            if iterations >= max_iterations:
                # Hard-stop: return a plain message so the graph can exit.
                from langchain_core.messages import AIMessage
                return {
                    "messages": [
                        AIMessage(content="Max iterations reached. Stopping.")
                    ],
                    "iterations": iterations,
                }

            messages = [SystemMessage(content=system_prompt)] + list(state["messages"])
            response = llm_with_tools.invoke(messages)

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