"""
Management command: default_policies

Creates the minimal set of Policy rows needed for a fresh install to
function.  Safe to run multiple times (uses get_or_create).

Usage:
    python manage.py default_policies
    python manage.py default_policies --env production
"""
from django.core.management.base import BaseCommand

from apps.policy_engine.models import Policy, PolicyEffect


DEFAULT_POLICIES = [
    {
        "name": "Global Allow - Agent Execution",
        "description": (
            "Default policy: allow any authenticated agent to call the execute "
            "and chat endpoints. Assign more specific DENY policies with higher "
            "priority to restrict individual agents or roles."
        ),
        "resources": ["agent:execute"],
        "effect": PolicyEffect.ALLOW,
        "priority": 0,
        "risk_level": 0,
        "is_active": True,
    },
    {
        "name": "Global Allow - Tool Access",
        "description": "Default policy: allow any authenticated agent to call tools.",
        "resources": ["tool:*"],
        "effect": PolicyEffect.ALLOW,
        "priority": 0,
        "risk_level": 0,
        "is_active": True,
    },
    {
        "name": "Global Allow - Workflow Execution",
        "description": "Default policy: allow workflow execution for all agents.",
        "resources": ["workflow:execute", "workflow:create"],
        "effect": PolicyEffect.ALLOW,
        "priority": 0,
        "risk_level": 0,
        "is_active": True,
    },
]


class Command(BaseCommand):
    help = "Seed default allow policies required for a working installation."

    def add_arguments(self, parser):
        parser.add_argument(
            "--env",
            default="development",
            choices=["development", "staging", "production"],
            help="Target environment (production skips permissive defaults).",
        )

    def handle(self, *args, **options):
        env = options["env"]

        if env == "production":
            self.stdout.write(
                self.style.WARNING(
                    "Skipping permissive default policies in production.\n"
                    "Create explicit ALLOW policies for each agent/role instead."
                )
            )
            return

        created_count = 0
        for policy_data in DEFAULT_POLICIES:
            _policy, created = Policy.objects.get_or_create(
                name=policy_data["name"],
                defaults=policy_data,
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"  ✅ Created: {policy_data['name']}")
                )
            else:
                self.stdout.write(f"  ⏭  Already exists: {policy_data['name']}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_count} new "
                f"polic{'y' if created_count == 1 else 'ies'} created."
            )
        )