import os
import uuid
import base64
import secrets
import string
from datetime import timedelta

from django.utils import timezone
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.conf import settings

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

import jwt

from apps.agent_registry.models import Agent
from .models import (
    AgentSession,
    AgentRequestLog,
    PasswordResetToken,
    Workspace,
    WorkspaceMembership,
    WorkspaceInvitation,
    LLMProviderConfig,
    WaitlistEntry,
    BetaInviteCode,
    BetaTesterProfile,
    FeedbackEntry,
    EmailVerificationToken,
    UserPreferences,
)
from .serializers import AgentLoginSerializer, AgentSessionSerializer
from .authentication import AgentAuthentication
from .throttles import AuthRateThrottle

User = get_user_model()


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _fernet_key():
    """Derive a 32-byte URL-safe base64 Fernet key from Django's SECRET_KEY."""
    raw = settings.SECRET_KEY[:32].encode().ljust(32, b'0')
    return base64.urlsafe_b64encode(raw)


def _encrypt(plaintext: str) -> str:
    from cryptography.fernet import Fernet
    f = Fernet(_fernet_key())
    return f.encrypt(plaintext.encode()).decode()


def _decrypt(ciphertext: str) -> str:
    from cryptography.fernet import Fernet
    f = Fernet(_fernet_key())
    return f.decrypt(ciphertext.encode()).decode()


def _generate_reset_token(length=6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def _unique_slug(base: str) -> str:
    slug = slugify(base)
    candidate = slug
    counter = 1
    while Workspace.objects.filter(slug=candidate).exists():
        candidate = f"{slug}-{counter}"
        counter += 1
    return candidate


# ──────────────────────────────────────────────
# Existing agent views (unchanged)
# ──────────────────────────────────────────────

class AgentLoginView(APIView):
    """Authenticate an agent and return JWT token"""
    permission_classes = [permissions.AllowAny]  # No auth required for login
    throttle_classes = [AuthRateThrottle]

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
                status=status.HTTP_401_UNAUTHORIZED,
            )

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
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        auth_header = request.headers.get('Authorization', '')
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        token = parts[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            session = AgentSession.objects.get(jti=payload['jti'])
            session.revoked_at = timezone.now()
            session.save()
            return Response({'message': 'Successfully logged out'})
        except (jwt.InvalidTokenError, KeyError, AgentSession.DoesNotExist):
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ──────────────────────────────────────────────
# Task 7 helper – beta invite validation
# ──────────────────────────────────────────────

def _validate_invite_code(code: str):
    """
    Returns (BetaInviteCode, None) on success or (None, error_str) on failure.
    """
    try:
        obj = BetaInviteCode.objects.get(code=code)
    except BetaInviteCode.DoesNotExist:
        return None, 'Invalid invite code.'

    if not obj.is_active:
        return None, 'Invite code is no longer active.'

    if obj.expires_at and obj.expires_at < timezone.now():
        return None, 'Invite code has expired.'

    if obj.use_count >= obj.max_uses:
        return None, 'Invite code has reached its maximum uses.'

    return obj, None


# ──────────────────────────────────────────────
# Task 1 + 7 – User registration (updated)
# ──────────────────────────────────────────────

class UserRegisterView(APIView):
    """Register a new human user and return simplejwt tokens."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        data = request.data
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        username = data.get('username', email)
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        invite_code_str = data.get('invite_code', '').strip()

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'email': ['A user with that email already exists.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {'password': ['Password must be at least 8 characters.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate invite code before creating user
        invite_obj = None
        if invite_code_str:
            invite_obj, err = _validate_invite_code(invite_code_str)
            if err:
                return Response({'invite_code': [err]}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        if invite_obj:
            BetaTesterProfile.objects.create(user=user, invite_code_used=invite_obj)
            invite_obj.use_count += 1
            invite_obj.save(update_fields=['use_count'])

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


# ──────────────────────────────────────────────
# Task 3 – User profile (get + patch) + avatar stub
# ──────────────────────────────────────────────

class UserMeView(APIView):
    """Return or update the authenticated user's profile."""
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

    def patch(self, request):
        user = request.user
        allowed = ('first_name', 'last_name', 'username')
        updated = []
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
                updated.append(field)
        if updated:
            user.save(update_fields=updated)
        return Response({
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        })


class UserAvatarView(APIView):
    """Stub – avatar upload not yet supported."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response(
            {'detail': 'Avatar upload not yet supported'},
            status=status.HTTP_200_OK,
        )


# ──────────────────────────────────────────────
# Task 1 – Password Reset
# ──────────────────────────────────────────────

class PasswordResetRequestView(APIView):
    """POST /auth/password-reset/ — send a reset token."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        # Always return the same response regardless of whether email exists
        generic_response = Response(
            {'detail': 'If that email exists, a reset link was sent.'},
            status=status.HTTP_200_OK,
        )

        if not email:
            return generic_response

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return generic_response

        token_str = _generate_reset_token(6)
        expires_at = timezone.now() + timedelta(hours=1)

        PasswordResetToken.objects.create(
            user=user,
            token=token_str,
            expires_at=expires_at,
        )

        # Send via configured transport (Resend/Postmark/SendGrid/SMTP/console fallback)
        from .notifications import send_email
        send_email(
            to=email,
            template='password_reset',
            context={'token': token_str},
        )

        return generic_response


class PasswordResetConfirmView(APIView):
    """POST /auth/password-reset/confirm/ — validate token and set new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_str = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '')

        if not token_str or not new_password:
            return Response(
                {'detail': 'token and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {'new_password': ['Password must be at least 8 characters.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reset_token = PasswordResetToken.objects.select_related('user').get(token=token_str)
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        if reset_token.used:
            return Response({'detail': 'Token has already been used.'}, status=status.HTTP_400_BAD_REQUEST)

        if reset_token.expires_at < timezone.now():
            return Response({'detail': 'Token has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_token.user
        user.set_password(new_password)
        user.save()

        reset_token.used = True
        reset_token.save(update_fields=['used'])

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


# ──────────────────────────────────────────────
# Task 4 – Workspace
# ──────────────────────────────────────────────

class WorkspaceViewSet(viewsets.ModelViewSet):
    """CRUD for workspaces — filtered to workspaces the user is a member of."""
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']

    def get_queryset(self):
        return Workspace.objects.filter(members=self.request.user, is_active=True)

    def get_serializer_class(self):
        # Inline serializer to avoid a separate serializers file for now
        from rest_framework import serializers as drf_serializers

        class WorkspaceSerializer(drf_serializers.ModelSerializer):
            class Meta:
                model = Workspace
                fields = [
                    'id', 'name', 'slug', 'owner', 'plan',
                    'token_budget_monthly', 'created_at', 'is_active',
                ]
                read_only_fields = ['id', 'slug', 'owner', 'created_at']

        return WorkspaceSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = _unique_slug(name)
        workspace = serializer.save(owner=self.request.user, slug=slug)
        # Auto-add creator as owner member
        WorkspaceMembership.objects.create(
            workspace=workspace,
            user=self.request.user,
            role='owner',
            invited_by=None,
        )


class WorkspaceInviteView(APIView):
    """POST /workspaces/<workspace_id>/invite/ — create an invitation."""
    permission_classes = [IsAuthenticated]

    def post(self, request, workspace_id):
        try:
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return Response({'detail': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only owners/admins may invite
        try:
            membership = WorkspaceMembership.objects.get(workspace=workspace, user=request.user)
        except WorkspaceMembership.DoesNotExist:
            return Response({'detail': 'You are not a member of this workspace.'}, status=status.HTTP_403_FORBIDDEN)

        if membership.role not in ('owner', 'admin'):
            return Response({'detail': 'Only owners and admins can invite members.'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email', '').strip().lower()
        role = request.data.get('role', 'member')

        if not email:
            return Response({'detail': 'email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        token_str = secrets.token_urlsafe(48)
        expires_at = timezone.now() + timedelta(days=7)

        invitation = WorkspaceInvitation.objects.create(
            workspace=workspace,
            email=email,
            role=role,
            token=token_str,
            invited_by=request.user,
            expires_at=expires_at,
        )

        invite_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/accept-invite?token={token_str}"
        from .notifications import send_email
        send_email(
            to=email,
            template='workspace_invite',
            context={
                'inviter': request.user.email,
                'workspace': workspace.name,
            },
            body=f"<p>{request.user.email} invited you to <b>{workspace.name}</b>.</p>"
                 f"<p><a href='{invite_url}'>Click here to accept</a></p>",
        )

        return Response({
            'detail': 'Invitation created.',
            'invitation_id': str(invitation.id),
            'expires_at': invitation.expires_at,
        }, status=status.HTTP_201_CREATED)


class WorkspaceAcceptInviteView(APIView):
    """POST /workspaces/accept-invite/ — accept a workspace invitation."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token_str = request.data.get('token', '').strip()
        if not token_str:
            return Response({'detail': 'token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invitation = WorkspaceInvitation.objects.select_related('workspace').get(token=token_str)
        except WorkspaceInvitation.DoesNotExist:
            return Response({'detail': 'Invalid or expired invitation token.'}, status=status.HTTP_400_BAD_REQUEST)

        if invitation.accepted:
            return Response({'detail': 'Invitation has already been accepted.'}, status=status.HTTP_400_BAD_REQUEST)

        if invitation.expires_at < timezone.now():
            return Response({'detail': 'Invitation has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        workspace = invitation.workspace

        # Idempotent — skip if already a member
        membership, created = WorkspaceMembership.objects.get_or_create(
            workspace=workspace,
            user=request.user,
            defaults={'role': invitation.role, 'invited_by': invitation.invited_by},
        )

        invitation.accepted = True
        invitation.save(update_fields=['accepted'])

        return Response({
            'detail': 'You have joined the workspace.',
            'workspace': {
                'id': str(workspace.id),
                'name': workspace.name,
                'slug': workspace.slug,
            },
            'role': membership.role,
        })


# ──────────────────────────────────────────────
# Task 5 – LLM Provider Config
# ──────────────────────────────────────────────

class LLMProviderConfigViewSet(viewsets.ModelViewSet):
    """CRUD for LLM provider configs — scoped to request.user."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LLMProviderConfig.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        from rest_framework import serializers as drf_serializers

        class LLMProviderConfigSerializer(drf_serializers.ModelSerializer):
            api_key = drf_serializers.CharField(write_only=True, required=True, source='api_key_encrypted')
            api_key_masked = drf_serializers.SerializerMethodField()

            class Meta:
                model = LLMProviderConfig
                fields = [
                    'id', 'provider', 'api_key', 'api_key_masked',
                    'model_preference', 'is_active', 'created_at',
                ]
                read_only_fields = ['id', 'created_at', 'api_key_masked']

            def get_api_key_masked(self, obj):
                return '***'

            def validate_api_key(self, value):
                # Encrypt before saving
                return _encrypt(value)

        return LLMProviderConfigSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """Try a minimal API call to validate the stored key."""
        config = self.get_object()

        try:
            api_key = _decrypt(config.api_key_encrypted)
        except Exception:
            return Response(
                {'detail': 'Failed to decrypt stored API key.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        result = {'provider': config.provider, 'valid': False, 'detail': ''}

        try:
            if config.provider == 'openai':
                import openai
                client = openai.OpenAI(api_key=api_key)
                client.models.list()
                result['valid'] = True
                result['detail'] = 'OpenAI key is valid.'

            elif config.provider == 'anthropic':
                import anthropic
                client = anthropic.Anthropic(api_key=api_key)
                # Minimal call — list models endpoint
                client.models.list()
                result['valid'] = True
                result['detail'] = 'Anthropic key is valid.'

            elif config.provider == 'gemini':
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                list(genai.list_models())
                result['valid'] = True
                result['detail'] = 'Gemini key is valid.'

            elif config.provider == 'mistral':
                import httpx as _httpx
                resp = _httpx.get(
                    'https://api.mistral.ai/v1/models',
                    headers={'Authorization': f'Bearer {api_key}'},
                    timeout=10,
                )
                if resp.status_code == 200:
                    result['valid'] = True
                    result['detail'] = 'Mistral key is valid.'
                else:
                    result['detail'] = f'Mistral returned status {resp.status_code}.'

            else:
                result['detail'] = f'Test not implemented for provider: {config.provider}'

        except Exception as exc:
            result['detail'] = str(exc)

        return Response(result)


# ──────────────────────────────────────────────
# Task 6 – Waitlist
# ──────────────────────────────────────────────

class WaitlistView(APIView):
    """POST /auth/waitlist/ — join the waitlist (no auth required)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        source = request.data.get('source', 'landing')
        notes = request.data.get('notes', '')

        if not email:
            return Response({'detail': 'email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        entry, created = WaitlistEntry.objects.get_or_create(
            email=email,
            defaults={'source': source, 'notes': notes},
        )

        if created:
            return Response({'detail': 'You have been added to the waitlist.'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'detail': 'You are already on the waitlist.'}, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# Task 7 – Beta Invite & Feedback
# ──────────────────────────────────────────────

class BetaInviteCodeValidateView(APIView):
    """POST /auth/invite/validate/ — check whether an invite code is usable."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip()
        if not code:
            return Response({'detail': 'code is required.'}, status=status.HTTP_400_BAD_REQUEST)

        invite_obj, err = _validate_invite_code(code)
        if err:
            return Response({'valid': False, 'detail': err}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'valid': True,
            'detail': 'Invite code is valid.',
            'uses_remaining': invite_obj.max_uses - invite_obj.use_count,
        })


class FeedbackView(APIView):
    """POST /auth/feedback/ — submit feedback (auth required)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        type_ = request.data.get('type', '')
        title = request.data.get('title', '').strip()
        body = request.data.get('body', '').strip()
        rating = request.data.get('rating', None)
        page = request.data.get('page', '')

        valid_types = ('bug', 'feature', 'general')
        if type_ not in valid_types:
            return Response(
                {'type': [f'Must be one of: {", ".join(valid_types)}.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not title or not body:
            return Response(
                {'detail': 'title and body are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rating is not None:
            try:
                rating = int(rating)
            except (TypeError, ValueError):
                return Response({'rating': ['Must be an integer.']}, status=status.HTTP_400_BAD_REQUEST)

        entry = FeedbackEntry.objects.create(
            user=request.user,
            type=type_,
            title=title,
            body=body,
            rating=rating,
            page=page,
        )

        # Update beta tester feedback count if applicable
        try:
            profile = request.user.beta_profile
            profile.feedback_count += 1
            profile.save(update_fields=['feedback_count'])
        except Exception:
            pass

        return Response({
            'detail': 'Feedback submitted.',
            'id': str(entry.id),
        }, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Email Verification
# ──────────────────────────────────────────────

class EmailVerificationRequestView(APIView):
    """POST /auth/email/send-verification/ — issue a token for the current user's email."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        user = request.user
        # Reuse an active unverified token if one exists
        EmailVerificationToken.objects.filter(
            user=user, verified_at__isnull=True, expires_at__lt=timezone.now()
        ).delete()
        token = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            email=user.email,
            expires_at=timezone.now() + timedelta(hours=24),
        )
        from .notifications import send_email
        send_email(
            to=user.email,
            template='verify_email',
            context={'token': token},
        )
        return Response({'detail': 'Verification email sent.'})


class EmailVerificationConfirmView(APIView):
    """POST /auth/email/verify/ — confirm a verification token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()
        if not token:
            return Response({'detail': 'token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            record = EmailVerificationToken.objects.select_related('user').get(token=token)
        except EmailVerificationToken.DoesNotExist:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        if record.verified_at:
            return Response({'detail': 'Email already verified.'})
        if record.expires_at < timezone.now():
            return Response({'detail': 'Token expired.'}, status=status.HTTP_400_BAD_REQUEST)
        record.verified_at = timezone.now()
        record.save(update_fields=['verified_at'])
        prefs, _ = UserPreferences.objects.get_or_create(user=record.user)
        prefs.email_verified = True
        prefs.save(update_fields=['email_verified'])
        return Response({'detail': 'Email verified.', 'user_id': record.user.id})


# ──────────────────────────────────────────────
# User Preferences (settings, HITL, onboarding state, active workspace)
# ──────────────────────────────────────────────

class UserPreferencesView(APIView):
    """GET / PATCH /auth/preferences/ — read or update the current user's preferences."""
    permission_classes = [IsAuthenticated]

    def _serialize(self, prefs: UserPreferences) -> dict:
        return {
            'email_verified': prefs.email_verified,
            'onboarding_completed': prefs.onboarding_completed,
            'onboarding_step': prefs.onboarding_step,
            'active_workspace': str(prefs.active_workspace_id) if prefs.active_workspace_id else None,
            'hitl_level': prefs.hitl_level,
            'hitl_cost_threshold': str(prefs.hitl_cost_threshold),
            'monthly_token_budget': prefs.monthly_token_budget,
            'notify_on_approval': prefs.notify_on_approval,
            'notify_on_failure': prefs.notify_on_failure,
            'notify_on_budget': prefs.notify_on_budget,
            'notify_in_app': prefs.notify_in_app,
        }

    def get(self, request):
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        return Response(self._serialize(prefs))

    def patch(self, request):
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        editable = {
            'onboarding_completed', 'onboarding_step',
            'hitl_level', 'hitl_cost_threshold', 'monthly_token_budget',
            'notify_on_approval', 'notify_on_failure', 'notify_on_budget', 'notify_in_app',
        }
        for field, value in request.data.items():
            if field in editable:
                setattr(prefs, field, value)
        # Workspace switching: validate membership
        if 'active_workspace' in request.data:
            ws_id = request.data['active_workspace']
            if ws_id is None:
                prefs.active_workspace = None
            else:
                try:
                    ws = Workspace.objects.get(id=ws_id)
                    if ws.owner_id == request.user.id or WorkspaceMembership.objects.filter(
                        workspace=ws, user=request.user
                    ).exists():
                        prefs.active_workspace = ws
                    else:
                        return Response(
                            {'detail': 'Not a member of that workspace.'},
                            status=status.HTTP_403_FORBIDDEN,
                        )
                except Workspace.DoesNotExist:
                    return Response({'detail': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)
        prefs.save()
        return Response(self._serialize(prefs))


class WorkspaceSwitchView(APIView):
    """POST /auth/workspaces/switch/ — set the active workspace for the user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ws_id = request.data.get('workspace_id')
        if not ws_id:
            return Response({'detail': 'workspace_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ws = Workspace.objects.get(id=ws_id)
        except Workspace.DoesNotExist:
            return Response({'detail': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)
        is_member = ws.owner_id == request.user.id or WorkspaceMembership.objects.filter(
            workspace=ws, user=request.user
        ).exists()
        if not is_member:
            return Response({'detail': 'Not a member.'}, status=status.HTTP_403_FORBIDDEN)
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        prefs.active_workspace = ws
        prefs.save(update_fields=['active_workspace'])
        return Response({
            'active_workspace': {
                'id': str(ws.id),
                'name': ws.name,
                'slug': ws.slug,
                'plan': ws.plan,
            },
        })


# ──────────────────────────────────────────────
# Contact form (public)
# ──────────────────────────────────────────────

class ContactFormView(APIView):
    """POST /auth/contact/ — public contact form. Routes to admin email/Discord."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        message = request.data.get('message', '').strip()

        if not email or not message:
            return Response(
                {'detail': 'email and message are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from .notifications import send_email, notify_admin

        admin_to = (
            getattr(settings, 'CONTACT_FORM_RECIPIENT', None)
            or os.environ.get('CONTACT_FORM_RECIPIENT')
            or 'contact@aos-swarm.com'
        )
        send_email(
            to=admin_to,
            subject=f"[AOS Contact] {name or 'Anonymous'} <{email}>",
            body=f"<p><b>From:</b> {name or '(no name)'} &lt;{email}&gt;</p>"
                 f"<p><b>Message:</b></p><pre>{message[:5000]}</pre>",
        )
        notify_admin('Contact form submission', {
            'name': name, 'email': email, 'message': message[:500],
        })

        return Response({'detail': 'Message sent.'}, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Analytics events (server-side track endpoint for PostHog/Mixpanel)
# ──────────────────────────────────────────────

class AnalyticsTrackView(APIView):
    """
    POST /auth/analytics/track/
    Frontend posts user events here; we forward to PostHog or Mixpanel if a
    project key is configured, else no-op.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        event = request.data.get('event', '')
        properties = request.data.get('properties', {})
        distinct_id = request.data.get('distinct_id') or (
            str(request.user.id) if request.user.is_authenticated else 'anonymous'
        )

        if not event:
            return Response({'detail': 'event is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from .analytics_service import track
        track(event=event, distinct_id=distinct_id, properties=properties)
        return Response({'tracked': True})
