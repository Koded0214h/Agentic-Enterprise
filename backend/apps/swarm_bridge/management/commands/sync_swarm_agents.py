"""
Management command: sync_swarm_agents

Reads agent-swarm/swarm.config.json, iterates all 245 agent definitions,
parses each agent's .md file for metadata, and upserts every agent into
the AOS Agent Registry as a SwarmAgentManifest + Agent pair.

Usage:
    python manage.py sync_swarm_agents
    python manage.py sync_swarm_agents --swarm-root /path/to/agent-swarm
    python manage.py sync_swarm_agents --dry-run
"""
import json
import re
import secrets
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.agent_registry.models import Agent, AgentType, AgentStatus, AgentSource
from apps.swarm_bridge.models import SwarmAgentManifest, SwarmEngine

User = get_user_model()

# Default swarm root — resolved relative to this file so it works regardless
# of where manage.py is invoked from.
DEFAULT_SWARM_ROOT = Path(__file__).resolve().parents[5] / "agent-swarm"

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
YAML_FIELD_RE = re.compile(r"^(\w+):\s*(.+)$", re.MULTILINE)


def _parse_frontmatter(markdown: str) -> dict:
    """Extract key/value pairs from YAML frontmatter block."""
    match = FRONTMATTER_RE.match(markdown.strip())
    if not match:
        return {}
    block = match.group(1)
    return {k: v.strip().strip('"').strip("'") for k, v in YAML_FIELD_RE.findall(block)}


def _get_or_create_swarm_owner() -> User:
    """
    Returns a dedicated system user that owns all swarm-imported agents.
    Creates the user if it doesn't exist.
    """
    user, created = User.objects.get_or_create(
        username="swarm-system",
        defaults={
            "email": "swarm@aos.internal",
            "is_active": True,
            "first_name": "Swarm",
            "last_name": "System",
        },
    )
    if created:
        user.set_unusable_password()
        user.save()
    return user


class Command(BaseCommand):
    help = (
        "Sync all agents from agent-swarm/swarm.config.json into the AOS Agent Registry. "
        "Idempotent — safe to re-run; existing agents are updated, not duplicated."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--swarm-root",
            type=str,
            default=str(DEFAULT_SWARM_ROOT),
            help="Absolute path to the agent-swarm directory. "
                 f"Defaults to: {DEFAULT_SWARM_ROOT}",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Parse and report what would be synced without writing to the database.",
        )
        parser.add_argument(
            "--category",
            type=str,
            default=None,
            help="Only sync agents from a specific source category (e.g. 'sales', 'engineering').",
        )

    def handle(self, *args, **options):
        swarm_root = Path(options["swarm_root"])
        dry_run = options["dry_run"]
        filter_category = options.get("category")

        # ----------------------------------------------------------------
        # Validate paths
        # ----------------------------------------------------------------
        config_path = swarm_root / "swarm.config.json"
        agents_dir = swarm_root / "agents"

        if not config_path.exists():
            raise CommandError(f"swarm.config.json not found at: {config_path}")
        if not agents_dir.exists():
            raise CommandError(f"agents/ directory not found at: {agents_dir}")

        config = json.loads(config_path.read_text())
        swarm_version = config.get("version", "unknown")
        agent_defs = config.get("agents", {})

        if filter_category:
            agent_defs = {
                k: v for k, v in agent_defs.items()
                if v.get("source") == filter_category
            }
            self.stdout.write(
                f"Filtering to category '{filter_category}': {len(agent_defs)} agents"
            )

        self.stdout.write(
            self.style.MIGRATE_HEADING(
                f"\nSwarm Agent Sync — v{swarm_version} — {len(agent_defs)} agents"
            )
        )
        if dry_run:
            self.stdout.write(self.style.WARNING("  DRY RUN — no database writes\n"))

        # ----------------------------------------------------------------
        # Ensure swarm system owner exists
        # ----------------------------------------------------------------
        if not dry_run:
            owner = _get_or_create_swarm_owner()
        else:
            owner = None

        # ----------------------------------------------------------------
        # Sync loop
        # ----------------------------------------------------------------
        created_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []

        for swarm_name, agent_def in agent_defs.items():
            file_rel = agent_def.get("file", "")
            source_category = agent_def.get("source", "")
            engine_raw = agent_def.get("engine")

            # Map swarm engine string → SwarmEngine choice
            engine_map = {
                "claude": SwarmEngine.CLAUDE,
                "gemini": SwarmEngine.GEMINI,
                "generic": SwarmEngine.GENERIC,
            }
            preferred_engine = engine_map.get(engine_raw) if engine_raw else None

            # Read agent .md file
            md_path = agents_dir / file_rel
            raw_markdown = ""
            description = ""

            if md_path.exists():
                raw_markdown = md_path.read_text(encoding="utf-8")
                fm = _parse_frontmatter(raw_markdown)
                description = fm.get("description", "")
                # Fallback: use vibe field if description is empty
                if not description:
                    description = fm.get("vibe", "")
            else:
                errors.append(f"Missing .md file: {md_path}")
                self.stdout.write(
                    self.style.WARNING(f"  SKIP  {swarm_name} — file not found: {file_rel}")
                )
                skipped_count += 1
                continue

            if dry_run:
                exists = SwarmAgentManifest.objects.filter(swarm_name=swarm_name).exists()
                action = "UPDATE" if exists else "CREATE"
                self.stdout.write(f"  {action:6}  {swarm_name}  [{source_category}]")
                continue

            # ----------------------------------------------------------------
            # Upsert inside a transaction per agent so one failure doesn't
            # roll back the entire sync.
            # ----------------------------------------------------------------
            try:
                with transaction.atomic():
                    manifest_qs = SwarmAgentManifest.objects.filter(swarm_name=swarm_name)

                    if manifest_qs.exists():
                        manifest = manifest_qs.select_related("aos_agent").get()
                        agent = manifest.aos_agent

                        # Update agent fields that might have changed
                        agent.metadata = {
                            **(agent.metadata or {}),
                            "source_category": source_category,
                            "file_path": file_rel,
                            "swarm_version": swarm_version,
                        }
                        agent.save(update_fields=["metadata", "updated_at"])

                        # Update manifest
                        manifest.source_category = source_category
                        manifest.file_path = file_rel
                        manifest.preferred_engine = preferred_engine
                        manifest.description = description
                        manifest.raw_markdown = raw_markdown
                        manifest.sync_version = swarm_version
                        manifest.save()

                        updated_count += 1
                        self.stdout.write(f"  UPDATE  {swarm_name}")

                    else:
                        # Create AOS Agent
                        agent = Agent.objects.create(
                            name=swarm_name,
                            agent_type=AgentType.FUNCTIONAL,
                            source=AgentSource.SWARM,
                            owner=owner,
                            identity_key=f"swarm_{secrets.token_urlsafe(32)}",
                            status=AgentStatus.RUNNING,
                            version=swarm_version,
                            metadata={
                                "source": "swarm",
                                "source_category": source_category,
                                "file_path": file_rel,
                                "swarm_version": swarm_version,
                            },
                        )

                        SwarmAgentManifest.objects.create(
                            aos_agent=agent,
                            swarm_name=swarm_name,
                            source_category=source_category,
                            file_path=file_rel,
                            preferred_engine=preferred_engine,
                            description=description,
                            raw_markdown=raw_markdown,
                            sync_version=swarm_version,
                        )

                        created_count += 1
                        self.stdout.write(f"  CREATE  {swarm_name}  [{source_category}]")

            except Exception as exc:
                errors.append(f"{swarm_name}: {exc}")
                self.stdout.write(
                    self.style.ERROR(f"  ERROR   {swarm_name}: {exc}")
                )
                skipped_count += 1

        # ----------------------------------------------------------------
        # Summary
        # ----------------------------------------------------------------
        self.stdout.write("")
        self.stdout.write(self.style.MIGRATE_HEADING("Sync complete"))
        self.stdout.write(self.style.SUCCESS(f"  Created : {created_count}"))
        self.stdout.write(self.style.SUCCESS(f"  Updated : {updated_count}"))

        if skipped_count:
            self.stdout.write(self.style.WARNING(f"  Skipped : {skipped_count}"))

        if errors:
            self.stdout.write(self.style.ERROR(f"\n  Errors ({len(errors)}):"))
            for err in errors:
                self.stdout.write(self.style.ERROR(f"    - {err}"))

        total = created_count + updated_count
        self.stdout.write(
            f"\n  {total} / {len(agent_defs)} agents synced into AOS Agent Registry\n"
        )
