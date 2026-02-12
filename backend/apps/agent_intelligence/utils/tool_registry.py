import importlib
import logging
from typing import Dict, Any, List, Optional

import requests
from langchain.tools import BaseTool
from langchain_core.tools import tool, StructuredTool

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

class ToolRegistry:
    """
    Registry that loads active tool definitions from the database and exposes
    them as LangChain BaseTool instances.

    Usage
    -----
    Do NOT call ToolRegistry() before Django's app registry is ready (e.g.
    at module import time).  Initialise it inside a view, a Celery task, or
    in AgentConfig.ready() via a module-level singleton pattern:

        # apps.py
        from django.apps import AppConfig

        class AgentsConfig(AppConfig):
            name = "agents"

            def ready(self):
                from .core.tool_registry import ToolRegistry
                ToolRegistry.initialise()   # safe — app registry is ready
    """

    _registry: Optional["ToolRegistry"] = None  # module-level singleton
    _tools: Dict[str, BaseTool]

    def __init__(self):
        # _tools is populated lazily by initialise() or the first get_tool() call.
        self._tools = {}

    # ------------------------------------------------------------------ #
    # Singleton helpers                                                    #
    # ------------------------------------------------------------------ #

    @classmethod
    def initialise(cls) -> "ToolRegistry":
        """
        Build the singleton and load tools from the DB.
        Call this once from AppConfig.ready() so the ORM is available.
        """
        if cls._registry is None:
            instance = cls()
            instance._load_tools()
            cls._registry = instance
        return cls._registry

    @classmethod
    def get_registry(cls) -> "ToolRegistry":
        """Return the initialised singleton, initialising it if necessary."""
        if cls._registry is None:
            # Fallback: safe to call here because Django is already up by the
            # time any request or task reaches this code path.
            return cls.initialise()
        return cls._registry

    # ------------------------------------------------------------------ #
    # Tool loading                                                         #
    # ------------------------------------------------------------------ #

    def _load_tools(self) -> None:
        """Load all active ToolDefinition rows and register them."""
        from ..models import ToolDefinition  # deferred — ORM must be ready

        db_tools = ToolDefinition.objects.filter(is_active=True)
        for db_tool in db_tools:
            try:
                if db_tool.tool_type == "API":
                    self._tools[db_tool.name] = self._create_api_tool(db_tool)
                elif db_tool.tool_type == "FUNCTION":
                    self._tools[db_tool.name] = self._create_function_tool(db_tool)
                else:
                    logger.warning("Unknown tool type %r for %r — skipping", db_tool.tool_type, db_tool.name)
            except Exception:
                logger.exception("Failed to load tool %r", db_tool.name)

    def _create_api_tool(self, db_tool) -> BaseTool:
        """Wrap an HTTP endpoint as a LangChain StructuredTool."""
        schema = self._build_pydantic_schema(db_tool.parameters_schema, db_tool.name)
        headers: dict = db_tool.api_headers or {}
        method: str = (db_tool.api_method or "GET").upper()
        endpoint: str = db_tool.api_endpoint
        description: str = db_tool.description

        def _call(**kwargs):
            if method == "GET":
                resp = requests.get(endpoint, params=kwargs, headers=headers, timeout=30)
            elif method == "POST":
                resp = requests.post(endpoint, json=kwargs, headers=headers, timeout=30)
            else:
                resp = requests.request(method, endpoint, json=kwargs, headers=headers, timeout=30)
            resp.raise_for_status()
            return resp.text

        return StructuredTool.from_function(
            func=_call,
            name=db_tool.name,
            description=description,
            args_schema=schema,
        )

    def _create_function_tool(self, db_tool) -> BaseTool:
        """Dynamically import a Python function and wrap it as a StructuredTool."""
        module_path, func_name = db_tool.function_path.rsplit(".", 1)
        module = importlib.import_module(module_path)
        func = getattr(module, func_name)

        schema = self._build_pydantic_schema(db_tool.parameters_schema, db_tool.name)

        return StructuredTool.from_function(
            func=func,
            name=db_tool.name,
            description=db_tool.description,
            args_schema=schema,
        )

    # ------------------------------------------------------------------ #
    # Schema helpers                                                       #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _build_pydantic_schema(parameters_schema: Dict, tool_name: str):
        """Derive a Pydantic v2 model from a JSON-Schema-style dict."""
        from pydantic import BaseModel, create_model
        from typing import Optional as Opt

        _type_map = {
            "integer": int,
            "number": float,
            "boolean": bool,
            "array": list,
            "object": dict,
            "string": str,
        }

        fields: Dict[str, Any] = {}
        properties: Dict = parameters_schema.get("properties", {})
        required: list = parameters_schema.get("required", [])

        for param_name, param_info in properties.items():
            python_type = _type_map.get(param_info.get("type", "string"), str)
            if param_name in required:
                fields[param_name] = (python_type, ...)
            else:
                fields[param_name] = (Opt[python_type], None)

        return create_model(f"{tool_name}Schema", **fields)

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def get_tool(self, name: str) -> Optional[BaseTool]:
        """Return a registered tool by name, or None if not found."""
        return self._tools.get(name)

    def get_tools_for_agent(self, agent) -> List[BaseTool]:
        """
        Return the subset of registered tools that *agent* is allowed to use.

        Expects agent.capability.tools_enabled to be a list of tool name strings.
        Returns an empty list (with a warning) if the attribute path is missing.
        """
        try:
            allowed_names: List[str] = agent.capability.tools_enabled
        except AttributeError:
            logger.warning(
                "Agent %r has no capability.tools_enabled — returning no tools",
                agent,
            )
            return []

        tools = []
        for name in allowed_names:
            t = self.get_tool(name)
            if t is not None:
                tools.append(t)
            else:
                logger.warning("Tool %r is listed for agent %r but not registered", name, agent)
        return tools

    def list_available_tools(self) -> List[Dict[str, Any]]:
        """Return a summary list of all registered tools."""
        return [
            {
                "name": name,
                "description": t.description,
                "args": t.args if hasattr(t, "args") else {},
            }
            for name, t in self._tools.items()
        ]