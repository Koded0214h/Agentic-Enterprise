import uuid
from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import jwt
from apps.agent_registry.models import Agent
from .models import AgentSession, AgentRequestLog
from .serializers import AgentLoginSerializer, AgentSessionSerializer
from .authentication import AgentAuthentication


class AgentLoginView(APIView):
    """Authenticate an agent and return JWT token"""
    permission_classes = [permissions.AllowAny]  # No auth required for login
    
    def post(self, request):
        serializer = AgentLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        agent_id = serializer.validated_data['agent_id']
        identity_key = serializer.validated_data['identity_key']
        
        try:
            agent = Agent.objects.get(id=agent_id, identity_key=identity_key)
        except Agent.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT for agent
        jti = str(uuid.uuid4())
        expires_at = timezone.now() + timedelta(hours=1)
        
        payload = {
            'agent_id': str(agent.id),
            'jti': jti,
            'exp': expires_at,
            'iat': timezone.now(),
            'token_type': 'access',
            'type': 'agent',
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Create session
        session = AgentSession.objects.create(
            agent=agent,
            jti=jti,
            expires_at=expires_at,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        
        return Response({
            'access_token': token,
            'token_type': 'Bearer',
            'expires_in': 3600,
            'agent_id': agent.id,
            'session_id': session.id,
        })


class AgentLogoutView(APIView):
    """Revoke agent session"""
    authentication_classes = [AgentAuthentication]
    
    def post(self, request):
        auth_header = request.headers.get('Authorization')
        token = auth_header.split()[1]
        
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            session = AgentSession.objects.get(jti=payload['jti'])
            session.revoked_at = timezone.now()
            session.save()
            
            return Response({'message': 'Successfully logged out'})
        except (jwt.InvalidTokenError, AgentSession.DoesNotExist):
            return Response(
                {'error': 'Invalid token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )