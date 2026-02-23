from prometheus_client import Counter, Histogram

# Metrics for agent performance and cost
AGENT_TOKEN_USAGE = Counter(
    'agent_token_usage_total',
    'Total tokens consumed by agents',
    ['agent_id', 'agent_name', 'token_type'] # token_type: input/output
)

AGENT_EXECUTION_LATENCY = Histogram(
    'agent_execution_duration_seconds',
    'Time spent in agent execution turns',
    ['agent_id', 'agent_name', 'node_name'],
    buckets=(1, 2, 5, 10, 30, 60, 120, 300)
)

AGENT_ANOMALY_COUNTER = Counter(
    'agent_anomaly_total',
    'Total number of detected anomalies',
    ['agent_id', 'anomaly_type'] # anomaly_type: loop/high_risk
)
