"""
Management command: compliance_policies

Seeds industry-standard compliance policy sets into the policy engine.

Usage:
    python manage.py compliance_policies --framework hipaa
    python manage.py compliance_policies --framework sox
    python manage.py compliance_policies --framework pci
    python manage.py compliance_policies --framework all
"""
from django.core.management.base import BaseCommand
from apps.policy_engine.models import Policy, PolicyEffect, PolicyCondition


HIPAA_POLICIES = [
    {
        "name": "HIPAA - Block PHI in External API Calls",
        "description": (
            "Prevents agents from sending data flagged as PHI (Protected Health Information) "
            "to external APIs. Required by HIPAA §164.312(e)."
        ),
        "resources": ["tool:api", "tool:email"],
        "effect": PolicyEffect.DENY,
        "priority": 100,
        "risk_level": 95,
    },
    {
        "name": "HIPAA - Audit All Database Access",
        "description": (
            "Forces an AUDIT log entry on every database tool call so access to health records "
            "is traceable. Required by HIPAA §164.312(b)."
        ),
        "resources": ["tool:database", "data:read", "data:write"],
        "effect": PolicyEffect.AUDIT,
        "priority": 90,
        "risk_level": 70,
    },
    {
        "name": "HIPAA - Escalate PHI Deletion Requests",
        "description": (
            "Requires human approval before any data deletion that could affect health records. "
            "Required by HIPAA §164.312(c)."
        ),
        "resources": ["data:delete"],
        "effect": PolicyEffect.ESCALATE,
        "priority": 95,
        "risk_level": 90,
    },
    {
        "name": "HIPAA - Restrict File Export",
        "description": (
            "Denies uncontrolled file system access to prevent data exfiltration of health records."
        ),
        "resources": ["tool:file"],
        "effect": PolicyEffect.ESCALATE,
        "priority": 85,
        "risk_level": 80,
    },
]

SOX_POLICIES = [
    {
        "name": "SOX - Audit All Financial Data Writes",
        "description": (
            "Immutably logs every write operation to financial data resources. "
            "Required by Sarbanes-Oxley §302 and §404."
        ),
        "resources": ["data:write", "tool:database"],
        "effect": PolicyEffect.AUDIT,
        "priority": 100,
        "risk_level": 80,
    },
    {
        "name": "SOX - Escalate Agent-Initiated Financial Transactions",
        "description": (
            "Requires human approval for any agent that initiates a financial workflow. "
            "Required by SOX to ensure human oversight of material transactions."
        ),
        "resources": ["workflow:execute"],
        "effect": PolicyEffect.ESCALATE,
        "priority": 95,
        "risk_level": 90,
    },
    {
        "name": "SOX - Deny Autonomous Data Deletion in Prod",
        "description": (
            "Blocks autonomous deletion of data in production environments. "
            "Prevents destruction of audit trails required under SOX §802."
        ),
        "resources": ["data:delete"],
        "effect": PolicyEffect.DENY,
        "priority": 110,
        "risk_level": 100,
    },
    {
        "name": "SOX - Audit CRM Access",
        "description": "Logs all CRM tool interactions for financial audit trail completeness.",
        "resources": ["tool:crm"],
        "effect": PolicyEffect.AUDIT,
        "priority": 80,
        "risk_level": 60,
    },
]

PCI_DSS_POLICIES = [
    {
        "name": "PCI-DSS - Deny Cardholder Data in External Calls",
        "description": (
            "Prevents agents from transmitting potential cardholder data (PAN, CVV, expiry) "
            "to external APIs or email. Required by PCI-DSS Requirement 4."
        ),
        "resources": ["tool:api", "tool:email"],
        "effect": PolicyEffect.DENY,
        "priority": 110,
        "risk_level": 100,
    },
    {
        "name": "PCI-DSS - Audit All Payment Tool Access",
        "description": (
            "Forces audit logging on all payment-adjacent tool calls. "
            "Required by PCI-DSS Requirement 10."
        ),
        "resources": ["tool:*"],
        "effect": PolicyEffect.AUDIT,
        "priority": 90,
        "risk_level": 70,
    },
    {
        "name": "PCI-DSS - Escalate Data Write in CDE",
        "description": (
            "Requires human approval before any agent writes data that could affect the "
            "Cardholder Data Environment (CDE). PCI-DSS Requirement 7."
        ),
        "resources": ["data:write", "data:delete"],
        "effect": PolicyEffect.ESCALATE,
        "priority": 100,
        "risk_level": 95,
    },
    {
        "name": "PCI-DSS - Deny Unapproved Agent Creation in Prod",
        "description": (
            "Prevents autonomous creation of new agents in production environments. "
            "PCI-DSS Requirement 6: change management controls."
        ),
        "resources": ["agent:create"],
        "effect": PolicyEffect.DENY,
        "priority": 105,
        "risk_level": 85,
    },
]

FRAMEWORK_MAP = {
    "hipaa": ("HIPAA", HIPAA_POLICIES),
    "sox": ("SOX", SOX_POLICIES),
    "pci": ("PCI-DSS", PCI_DSS_POLICIES),
}


class Command(BaseCommand):
    help = "Seed compliance policy templates (HIPAA, SOX, PCI-DSS)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--framework",
            default="all",
            choices=["hipaa", "sox", "pci", "all"],
            help="Compliance framework to seed.",
        )

    def handle(self, *args, **options):
        framework = options["framework"]
        targets = FRAMEWORK_MAP.items() if framework == "all" else [(framework, FRAMEWORK_MAP[framework])]

        total_created = 0
        for key, (label, policies) in targets:
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n── {label} ──"))
            created = 0
            for policy_data in policies:
                _p, is_new = Policy.objects.get_or_create(
                    name=policy_data["name"],
                    defaults={
                        "description": policy_data["description"],
                        "resources": policy_data["resources"],
                        "effect": policy_data["effect"],
                        "priority": policy_data["priority"],
                        "risk_level": policy_data["risk_level"],
                        "is_active": True,
                    },
                )
                if is_new:
                    created += 1
                    self.stdout.write(self.style.SUCCESS(f"  ✅ Created: {policy_data['name']}"))
                else:
                    self.stdout.write(f"  ⏭  Already exists: {policy_data['name']}")
            total_created += created

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {total_created} new compliance polic"
                f"{'y' if total_created == 1 else 'ies'} created."
            )
        )
        self.stdout.write(
            self.style.WARNING(
                "\n⚠  Review and assign these policies to specific agents/roles "
                "via /api/policies/ before enabling in production."
            )
        )
