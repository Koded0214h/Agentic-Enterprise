from django.apps import AppConfig


class AgentRegistryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.agent_registry'  # Must match the full dotted path
    verbose_name = 'Agent Registry'