import logging
from django.utils import timezone

security_logger = logging.getLogger('aos.security')

EVENTS = {
    'AUTH_FAILURE': 'Authentication failure',
    'INJECTION_ATTEMPT': 'Prompt injection attempt detected',
    'POLICY_VIOLATION': 'Policy violation',
    'RATE_LIMIT_HIT': 'Rate limit exceeded',
    'UNAUTHORIZED_TOOL': 'Unauthorized tool access attempt',
    'BUDGET_EXCEEDED': 'Agent budget exceeded',
}


def log_security_event(event_type: str, user=None, agent=None, detail: str = '', request=None):
    ip = None
    if request:
        ip = request.META.get('REMOTE_ADDR')
    security_logger.warning(
        f"[SECURITY] {event_type} | user={getattr(user, 'id', None)} "
        f"agent={getattr(agent, 'id', None)} ip={ip} | {detail}",
        extra={'event_type': event_type, 'timestamp': timezone.now().isoformat()}
    )
