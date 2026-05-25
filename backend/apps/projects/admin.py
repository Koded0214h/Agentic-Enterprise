from django.contrib import admin
from .models import Project, ProjectMember, ProjectActivity, ProjectGoal, ProjectArtifact


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "status", "stage", "owner", "created_at")
    search_fields = ("name", "slug", "description")
    list_filter = ("status", "stage", "created_at")


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "role", "created_at")
    search_fields = ("project__name", "user__email")


@admin.register(ProjectActivity)
class ProjectActivityAdmin(admin.ModelAdmin):
    list_display = ("project", "kind", "summary", "actor", "created_at")
    search_fields = ("summary", "kind")
    list_filter = ("kind", "created_at")


@admin.register(ProjectGoal)
class ProjectGoalAdmin(admin.ModelAdmin):
    list_display = ("project", "title", "status", "priority", "due_date")
    search_fields = ("title",)
    list_filter = ("status", "priority")


@admin.register(ProjectArtifact)
class ProjectArtifactAdmin(admin.ModelAdmin):
    list_display = ("project", "kind", "name", "created_at")
    search_fields = ("name", "path")
