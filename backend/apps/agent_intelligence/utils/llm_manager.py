import logging
from typing import Optional, Dict, Any

from django.conf import settings

logger = logging.getLogger(__name__)

PROVIDER_COST_TABLE = {
    # (provider, model_pattern): (cost_per_1k_input_tokens, cost_per_1k_output_tokens)
    ("OPENAI", "gpt-4o"): (0.005, 0.015),
    ("OPENAI", "gpt-4o-mini"): (0.00015, 0.0006),
    ("OPENAI", "gpt-4-turbo"): (0.01, 0.03),
    ("OPENAI", "gpt-3.5-turbo"): (0.0005, 0.0015),
    ("CLAUDE", "claude-opus"): (0.015, 0.075),
    ("CLAUDE", "claude-sonnet"): (0.003, 0.015),
    ("CLAUDE", "claude-haiku"): (0.00025, 0.00125),
    ("GEMINI", "gemini-2.5-flash"): (0.00015, 0.0006),
    ("GEMINI", "gemini-1.5-pro"): (0.00125, 0.005),
    ("MISTRAL", "mistral-large"): (0.004, 0.012),
    ("MISTRAL", "mistral-small"): (0.001, 0.003),
    ("LLAMA", ""): (0.0, 0.0),  # local = free
}


class LLMManager:
    """Factory for creating LangChain LLM instances from our config."""

    @classmethod
    def get_llm(cls, config):
        """Return a LangChain chat model instance from an LLMConfig object."""

        provider = config.provider
        api_key = config.decrypted_api_key

        if provider == "GEMINI":
            from langchain_google_genai import ChatGoogleGenerativeAI

            return ChatGoogleGenerativeAI(
                model=config.model_name,
                google_api_key=api_key or getattr(settings, "GEMINI_API_KEY", None),
                temperature=config.temperature,
                max_output_tokens=config.max_tokens,
                top_p=config.top_p,
                # Gemini no longer needs convert_system_message_to_human for
                # gemini-1.5+ models, but keep it for older model compatibility.
                convert_system_message_to_human=True,
            )

        elif provider == "CLAUDE":
            from langchain_anthropic import ChatAnthropic

            return ChatAnthropic(
                model=config.model_name,
                # Both spellings are accepted; 'max_tokens' is the canonical one.
                max_tokens=config.max_tokens,
                anthropic_api_key=api_key or getattr(settings, "ANTHROPIC_API_KEY", None),
                temperature=config.temperature,
                top_p=config.top_p,
            )

        elif provider == "OPENAI":
            from langchain_openai import ChatOpenAI

            return ChatOpenAI(
                model=config.model_name,
                openai_api_key=api_key or getattr(settings, "OPENAI_API_KEY", None),
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                top_p=config.top_p,
                frequency_penalty=config.frequency_penalty,
                presence_penalty=config.presence_penalty,
            )

        elif provider == "MISTRAL":
            from langchain_mistralai import ChatMistralAI

            return ChatMistralAI(
                model=config.model_name,
                mistral_api_key=api_key or getattr(settings, "MISTRAL_API_KEY", None),
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                top_p=config.top_p,
            )

        elif provider == "LLAMA":
            from langchain_community.chat_models import ChatOllama

            return ChatOllama(
                model=config.model_name or "llama2",
                temperature=config.temperature,
                top_p=config.top_p,
                num_predict=config.max_tokens,
            )

        else:
            raise ValueError(f"Unsupported provider: {provider!r}")

    @classmethod
    def get_recommended_config(cls, purpose: str) -> Dict[str, Any]:
        """Return a recommended LLM config dict for a given use-case purpose."""

        recommendations: Dict[str, Dict[str, Any]] = {
            "general_reasoning": {
                "provider": "GEMINI",
                "model": "gemini-2.5-flash",
                "temperature": 0.7,
                "max_tokens": 4096,
                "notes": "Low-latency, strong multi-step reasoning",
            },
            "specialized_reasoning": {
                "provider": "CLAUDE",
                # Use a current model string — old 20240229 snapshot still works
                # but the -latest alias tracks the most recent stable release.
                "model": "claude-sonnet-4-5-20250929",
                "temperature": 0.5,
                "max_tokens": 8192,
                "notes": "Safer outputs, less hallucination",
            },
            "multi_agent": {
                "provider": "LLAMA",
                "model": "llama2:70b",
                "temperature": 0.6,
                "max_tokens": 4096,
                "notes": "Local deployment, cheaper at scale",
            },
            # NOTE: Gemini embedding models are accessed via a separate
            # GoogleGenerativeAIEmbeddings class, not a chat model.
            # Do not route embedding requests through get_llm().
            "embeddings": {
                "provider": "GEMINI",
                "model": "models/text-embedding-004",
                "temperature": 0.0,
                "max_tokens": 1024,
                "notes": "Use GoogleGenerativeAIEmbeddings, not ChatGoogleGenerativeAI",
            },
            "high_speed": {
                "provider": "GEMINI",
                "model": "gemini-2.5-flash",
                "temperature": 0.8,
                "max_tokens": 2048,
                "notes": "For sub-agents and low-critical tasks",
            },
        }

        return recommendations.get(purpose, recommendations["general_reasoning"])

    @classmethod
    async def aget_llm(cls, config):
        """Async-compatible wrapper — all LangChain chat models support ainvoke()."""
        # LangChain's chat models expose async methods (ainvoke, astream, etc.)
        # on the same object returned by get_llm(), so no separate async
        # instantiation is needed.
        return cls.get_llm(config)

    @classmethod
    def estimate_cost(cls, config, input_tokens: int = 1000, output_tokens: int = 500) -> float:
        """Estimate cost in USD for a call with the given config."""
        for (provider, model_pattern), (in_cost, out_cost) in PROVIDER_COST_TABLE.items():
            if config.provider == provider and model_pattern in (config.model_name or ''):
                return (input_tokens / 1000 * in_cost) + (output_tokens / 1000 * out_cost)
        return 0.002  # default fallback

    @classmethod
    def select_cheapest_available(cls, configs, budget_usd: float = 0.01) -> 'LLMConfig':
        """
        From a list of LLMConfig objects, return the one with the lowest
        estimated cost that is within budget. Falls back to the first config.
        """
        if not configs:
            raise ValueError("No configs provided")
        affordable = [c for c in configs if cls.estimate_cost(c) <= budget_usd]
        if not affordable:
            affordable = configs
        return min(affordable, key=lambda c: cls.estimate_cost(c))

    @classmethod
    def get_provider_pricing(cls) -> list:
        """Return pricing table as a list of dicts for the frontend."""
        result = []
        for (provider, model), (in_cost, out_cost) in PROVIDER_COST_TABLE.items():
            result.append({
                'provider': provider,
                'model': model or '(any)',
                'cost_per_1k_input': in_cost,
                'cost_per_1k_output': out_cost,
                'estimated_per_call': in_cost + out_cost * 0.5,
            })
        return sorted(result, key=lambda x: x['estimated_per_call'])