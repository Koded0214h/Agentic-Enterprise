from rest_framework import authentication, exceptions
from django.utils import timezone
from apps.agent_registry.models import Agent
from .models import AgentSession
import jwt
from django.conf import settings


class AgentAuthentication(authentication.BaseAuthentication):
    """Authenticate agents using their identity tokens"""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        try:
            # Expect "Bearer <token>"
            token_type, token = auth_header.split()
            if token_type.lower() != 'bearer':
                return None
        except ValueError:
            raise exceptions.AuthenticationFailed('Invalid Authorization header')
        
        # First check if it's an agent token (not a user JWT)
        try:
            # Try to decode as JWT first
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            # Check if it's an agent token (has agent_id claim)
            if 'agent_id' in payload:
                return self._authenticate_jwt(token, payload)
        except jwt.InvalidTokenError:
            # If not JWT, treat as direct agent identity token
            return self._authenticate_identity_token(token)
    
    def _authenticate_jwt(self, token, payload):
        """Authenticate via JWT (created for agents)"""
        try:
            session = AgentSession.objects.select_related('agent').get(
                jti=payload['jti'],
                revoked_at__isnull=True,
                expires_at__gt=timezone.now()
            )
            
            # Update last activity
            session.last_activity = timezone.now()
            session.save(update_fields=['last_activity'])
            
            return (session.agent, token)
        except AgentSession.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid or expired session')
    
    def _authenticate_identity_token(self, token):
        """Authenticate via direct agent identity key"""
        try:
            agent = Agent.objects.get(
                identity_key=token,
                status__in=['RUNNING', 'PAUSED']  # Can authenticate even if paused
            )
            return (agent, token)
        except Agent.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid agent identity')