from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "workspace", "owner", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "slug"]
    raw_id_fields = ["owner", "workspace"]
