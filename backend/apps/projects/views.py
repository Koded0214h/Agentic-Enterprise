from django.utils.text import slugify
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Project, ProjectMember, ProjectActivity, ProjectGoal, ProjectArtifact
from .serializers import (
    ProjectSerializer,
    ProjectMemberSerializer,
    ProjectActivitySerializer,
    ProjectGoalSerializer,
    ProjectArtifactSerializer,
)


class OwnerQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(owner=self.request.user) | Q(memberships__user=self.request.user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all().prefetch_related("memberships", "activities", "goals", "artifacts")
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        name = serializer.validated_data.get("name") or serializer.initial_data.get("name")
        base_slug = serializer.validated_data.get("slug") or slugify(name or "project")
        slug = base_slug
        suffix = 1
        while Project.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        project = serializer.save(owner=self.request.user, slug=slug)
        ProjectMember.objects.create(project=project, user=self.request.user, role=ProjectMember.Role.OWNER)
        ProjectActivity.objects.create(
            project=project,
            actor=self.request.user,
            kind="project.created",
            summary=f"Created project {project.name}",
        )

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        project = self.get_object()
        if not request.user.is_staff and project.owner_id != request.user.id:
            return Response({"error": "Only the project owner can archive this project"}, status=status.HTTP_403_FORBIDDEN)
        project.archive()
        ProjectActivity.objects.create(
            project=project,
            actor=request.user,
            kind="project.archived",
            summary=f"Archived project {project.name}",
        )
        return Response(ProjectSerializer(project).data)

    @action(detail=True, methods=["post"])
    def add_member(self, request, pk=None):
        project = self.get_object()
        if not request.user.is_staff and project.owner_id != request.user.id:
            return Response({"error": "Only the project owner can add members"}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get("user_id")
        role = request.data.get("role") or ProjectMember.Role.MEMBER
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        member, created = ProjectMember.objects.get_or_create(
            project=project,
            user_id=user_id,
            defaults={"role": role},
        )
        if not created:
            member.role = role
            member.save(update_fields=["role"])
        return Response(ProjectMemberSerializer(member).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=["get", "post"])
    def activity(self, request, pk=None):
        project = self.get_object()
        if request.method.lower() == "post":
            activity = ProjectActivity.objects.create(
                project=project,
                actor=request.user,
                kind=request.data.get("kind") or "note",
                summary=request.data.get("summary") or "Activity",
                body=request.data.get("body") or "",
                metadata=request.data.get("metadata") or {},
            )
            return Response(ProjectActivitySerializer(activity).data, status=status.HTTP_201_CREATED)
        activities = project.activities.select_related("actor")[:100]
        return Response(ProjectActivitySerializer(activities, many=True).data)

    @action(detail=True, methods=["get"])
    def overview(self, request, pk=None):
        project = self.get_object()
        return Response({
            "project": ProjectSerializer(project).data,
            "members": ProjectMemberSerializer(project.memberships.select_related("user"), many=True).data,
            "activities": ProjectActivitySerializer(project.activities.select_related("actor")[:25], many=True).data,
            "goals": ProjectGoalSerializer(project.goals.all()[:25], many=True).data,
            "artifacts": ProjectArtifactSerializer(project.artifacts.all()[:25], many=True).data,
        })


class ProjectMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectMember.objects.select_related("project", "user")
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()


class ProjectActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectActivity.objects.select_related("project", "actor")
    serializer_class = ProjectActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()


class ProjectGoalViewSet(viewsets.ModelViewSet):
    queryset = ProjectGoal.objects.select_related("project", "workflow_task")
    serializer_class = ProjectGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if project and not self.request.user.is_staff and not (
            project.owner_id == self.request.user.id or project.memberships.filter(user=self.request.user).exists()
        ):
            raise PermissionDenied("You do not have access to this project")
        serializer.save()


class ProjectArtifactViewSet(viewsets.ModelViewSet):
    queryset = ProjectArtifact.objects.select_related("project")
    serializer_class = ProjectArtifactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(Q(project__owner=self.request.user) | Q(project__memberships__user=self.request.user)).distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if project and not self.request.user.is_staff and not (
            project.owner_id == self.request.user.id or project.memberships.filter(user=self.request.user).exists()
        ):
            raise PermissionDenied("You do not have access to this project")
        serializer.save()
