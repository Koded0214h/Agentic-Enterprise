from django.db import models as dj_models


def get_effective_policies(agent, workspace=None):
    """Returns queryset of policies that apply: global + workspace-scoped."""
    from .models import Policy, PolicyAssignment
    base = PolicyAssignment.objects.filter(agent=agent, policy__is_active=True)
    if workspace:
        base = base.filter(
            dj_models.Q(policy__workspace=workspace) | dj_models.Q(policy__workspace__isnull=True)
        )
    return base.select_related('policy')
