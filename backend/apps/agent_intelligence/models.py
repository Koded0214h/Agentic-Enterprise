import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.agent_registry.models import Agent

User = get_user_model()


class LLMProvider(models.TextChoices):
    GEMINI = "GEMINI", "Google Gemini"
    CLAUDE = "CLAUDE", "Anthropic Claude"
    OPENAI = "OPENAI", "OpenAI GPT"
    MISTRAL = "MISTRAL", "Mistral AI"
    LLAMA = "LLAMA", "Meta Llama"
    CUSTOM = "CUSTOM", "Custom LLM"


class LLMConfig(models.Model):
    """Configuration for LLM models that agents can use"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    provider = models.CharField(max_length=20, choices=LLMProvider.choices)
    model_name = models.CharField(max_length=100)  # e.g., "gemini-2.5-flash", "claude-3-opus"
    
    # API Configuration
    api_key = models.CharField(max_length=500, blank=True)
    api_base = models.URLField(blank=True, null=True)
    organization = models.CharField(max_length=200, blank=True)
    
    # Model Parameters
    temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=4096)
    top_p = models.FloatField(default=0.95)
    frequency_penalty = models.FloatField(default=0.0)
    presence_penalty = models.FloatField(default=0.0)
    
    # Capabilities
    supports_tools = models.BooleanField(default=True)
    supports_vision = models.BooleanField(default=False)
    supports_streaming = models.BooleanField(default=True)
    max_context_length = models.IntegerField(default=128000)  # Gemini 2.5 Flash: 1M
    
    # Cost tracking
    cost_per_1k_tokens_input = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    cost_per_1k_tokens_output = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    
    # Usage limits
    rate_limit_requests_per_minute = models.IntegerField(default=60)
    rate_limit_tokens_per_minute = models.IntegerField(default=100000)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['provider', 'model_name']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_provider_display()}: {self.model_name}"


class AgentCapability(models.Model):
    """Capabilities and configurations assigned to specific agents"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.OneToOneField(Agent, on_delete=models.CASCADE, related_name='capability')
    
    # LLM Configuration
    primary_llm = models.ForeignKey(
        LLMConfig, 
        on_delete=models.SET_NULL,
        null=True,
        related_name='primary_for_agents'
    )
    reasoning_llm = models.ForeignKey(
        LLMConfig,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reasoning_for_agents'
    )
    
    # LangGraph Configuration
    graph_type = models.CharField(
        max_length=50,
        choices=[
            ('REACT', 'ReAct Agent'),
            ('PLAN_EXECUTE', 'Plan-and-Execute'),
            ('MULTI_AGENT', 'Multi-Agent Supervisor'),
            ('CUSTOM', 'Custom Graph'),
        ],
        default='REACT'
    )
    
    # Memory
    memory_type = models.CharField(
        max_length=50,
        choices=[
            ('BUFFER', 'Conversation Buffer'),
            ('BUFFER_WINDOW', 'Window Buffer'),
            ('SUMMARY', 'Summary Memory'),
            ('VECTOR', 'Vector Store Memory'),
            ('NONE', 'No Memory'),
        ],
        default='BUFFER_WINDOW'
    )
    memory_window = models.IntegerField(default=10)  # Number of conversations to remember
    
    # Tools
    tools_enabled = models.JSONField(default=list)  # List of tool names this agent can use
    
    # RAG Configuration
    rag_enabled = models.BooleanField(default=False)
    rag_collection = models.CharField(max_length=100, blank=True)
    rag_top_k = models.IntegerField(default=5)
    
    # Performance
    max_iterations = models.IntegerField(default=10)  # Max tool call iterations
    timeout_seconds = models.IntegerField(default=60)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Capabilities for {self.agent.name}"


class Conversation(models.Model):
    """Track conversations between agents and users/other agents"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='conversations')
    session_id = models.UUIDField(default=uuid.uuid4)
    
    # Conversation metadata
    title = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('COMPLETED', 'Completed'),
            ('ERROR', 'Error'),
            ('TIMEOUT', 'Timeout'),
        ],
        default='ACTIVE'
    )
    
    # LLM usage
    llm_config = models.ForeignKey(LLMConfig, on_delete=models.SET_NULL, null=True)
    total_tokens_input = models.IntegerField(default=0)
    total_tokens_output = models.IntegerField(default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']


class Message(models.Model):
    """Individual messages in a conversation"""
    
    ROLE_CHOICES = [
        ('SYSTEM', 'System'),
        ('USER', 'User'),
        ('AGENT', 'Agent'),
        ('TOOL', 'Tool'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    
    # For tool calls
    tool_calls = models.JSONField(null=True, blank=True)
    tool_call_id = models.CharField(max_length=100, blank=True)
    tool_name = models.CharField(max_length=100, blank=True)
    
    # Metadata
    tokens = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']


class ToolDefinition(models.Model):
    """Define tools that agents can use"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    
    # Tool schema (JSON Schema for parameters)
    parameters_schema = models.JSONField(default=dict)
    
    # Implementation
    tool_type = models.CharField(
        max_length=50,
        choices=[
            ('API', 'HTTP API Call'),
            ('FUNCTION', 'Python Function'),
            ('DATABASE', 'Database Query'),
            ('WORKFLOW', 'Workflow Trigger'),
        ]
    )
    
    # For API tools
    api_endpoint = models.URLField(blank=True)
    api_method = models.CharField(max_length=10, blank=True)
    api_headers = models.JSONField(default=dict)
    
    # For function tools
    function_path = models.CharField(max_length=500, blank=True)  # Python import path
    
    # Permissions
    required_permissions = models.JSONField(default=list)
    
    # Rate limiting
    rate_limit = models.IntegerField(default=100)  # Calls per minute
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name