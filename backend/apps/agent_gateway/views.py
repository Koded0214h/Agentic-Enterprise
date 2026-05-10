import uuid
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import jwt
from apps.agent_registry.models import Agent
from .models import AgentSession, AgentRequestLog
from .serializers import AgentLoginSerializer, AgentSessionSerializer
from .authentication import AgentAuthentication

User = get_user_model()


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


class UserRegisterView(APIView):
    """Register a new human user and return simplejwt tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        username = data.get('username', email)
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')

        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'email': ['A user with that email already exists.']}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'password': ['Password must be at least 8 characters.']}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        # Return simplejwt tokens so the frontend can log in immediately
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
        }, status=status.HTTP_201_CREATED)


class UserMeView(APIView):
    """Return the authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        })