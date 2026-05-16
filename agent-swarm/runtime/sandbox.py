"""
AOS Native Runtime — Container Warm Pool (Phase 2)

Each agent category runs inside its own Docker container with only the
tools it needs. The ContainerPool keeps a warm pool of pre-started
containers to avoid cold-start latency on every job dispatch.

Tiers:
  Tier 1 (dev):        Python process — no Docker, fast, no isolation
  Tier 2 (prod):       Docker container per agent category
  Tier 3 (sensitive):  Firecracker microVM — future milestone

Usage:
  pool = ContainerPool()
  async with pool.acquire("engineering") as container_id:
      result = await pool.exec(container_id, job)
"""
from __future__ import annotations

import asyncio
import json
import os
import subprocess
import time
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from pathlib import Path

SWARM_ROOT = Path(__file__).parent.parent
DOCKER_DIR = SWARM_ROOT / "docker"

# Pool sizes per category. Tune based on queue depth in production.
_DEFAULT_POOL_SIZE = int(os.environ.get("SWARM_POOL_SIZE", "2"))
_CONTAINER_IDLE_TIMEOUT = int(os.environ.get("SWARM_CONTAINER_IDLE_TIMEOUT", "300"))  # 5 min

# Base image name — built from Dockerfile.runtime
_BASE_IMAGE = os.environ.get("SWARM_BASE_IMAGE", "aos-runtime:latest")

# Image per agent category. Falls back to base image if not found.
_CATEGORY_IMAGES: dict[str, str] = {
    "engineering": "aos-runtime-engineering:latest",
    "marketing":   "aos-runtime-marketing:latest",
    "sales":       "aos-runtime-default:latest",
    "support":     "aos-runtime-default:latest",
}


@dataclass
class PooledContainer:
    container_id: str
    category: str
    image: str
    created_at: float = field(default_factory=time.monotonic)
    last_used: float = field(default_factory=time.monotonic)
    in_use: bool = False

    def is_idle_expired(self) -> bool:
        return not self.in_use and (time.monotonic() - self.last_used) > _CONTAINER_IDLE_TIMEOUT


def _docker_available() -> bool:
    try:
        return subprocess.run(["docker", "info"], capture_output=True, timeout=3).returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _image_exists(image: str) -> bool:
    try:
        result = subprocess.run(
            ["docker", "image", "inspect", image],
            capture_output=True, timeout=5,
        )
        return result.returncode == 0
    except Exception:
        return False


def _start_container(image: str, category: str) -> str | None:
    """Start a warm container and return its ID."""
    env_args = []
    for key in ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY",
                 "AOS_BASE_URL", "AOS_TOKEN", "REDIS_URL"]:
        if os.environ.get(key):
            env_args.extend(["-e", f"{key}={os.environ[key]}"])

    try:
        result = subprocess.run(
            [
                "docker", "run", "-d", "--rm",
                "--network", "host",
                "--label", f"aos.category={category}",
                "--label", "aos.pool=true",
                *env_args,
                image,
                "python3", "-c", "import time; time.sleep(3600)",  # idle worker, accepts exec
            ],
            capture_output=True, text=True, timeout=10,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None


def _stop_container(container_id: str) -> None:
    try:
        subprocess.run(["docker", "stop", container_id], capture_output=True, timeout=10)
    except Exception:
        pass


def _exec_in_container(container_id: str, job_dict: dict) -> dict:
    """Run a job inside a container via docker exec."""
    job_json = json.dumps(job_dict)
    script = f"""
import sys, json, asyncio
sys.path.insert(0, '/app')
from runtime import run_agent
job = json.loads({repr(job_json)})
result = asyncio.run(run_agent(
    agent_name=job['agent_id'],
    task=job['task'],
    permissions=job.get('permissions', ['file.read']),
    execution_id=job['execution_id'],
    workspace_dir=job.get('workspace_dir', '/workspace'),
    department_id=job.get('department_id', ''),
))
print(json.dumps(result.to_dict()))
"""
    try:
        proc = subprocess.run(
            ["docker", "exec", container_id, "python3", "-c", script],
            capture_output=True, text=True, timeout=1800,
        )
        if proc.returncode == 0:
            return json.loads(proc.stdout.strip())
        return {"success": False, "error": proc.stderr[:500], "output": ""}
    except Exception as exc:
        return {"success": False, "error": str(exc), "output": ""}


class ContainerPool:
    """
    Manages a warm pool of Docker containers per agent category.
    Falls back to process-level execution when Docker is not available.
    """

    def __init__(self) -> None:
        self._pools: dict[str, list[PooledContainer]] = {}
        self._lock = asyncio.Lock()
        self._docker = _docker_available()
        if not self._docker:
            print("[ContainerPool] Docker not available — using process-level isolation")

    def _image_for(self, category: str) -> str:
        img = _CATEGORY_IMAGES.get(category, _BASE_IMAGE)
        return img if _image_exists(img) else _BASE_IMAGE

    async def _ensure_pool(self, category: str) -> None:
        """Maintain minimum pool size for a category."""
        if not self._docker:
            return
        pool = self._pools.setdefault(category, [])

        # Remove expired idle containers
        expired = [c for c in pool if c.is_idle_expired()]
        for c in expired:
            _stop_container(c.container_id)
            pool.remove(c)

        # Top up to minimum pool size
        available = [c for c in pool if not c.in_use]
        needed = _DEFAULT_POOL_SIZE - len(available)
        for _ in range(max(0, needed)):
            image = self._image_for(category)
            if not _image_exists(image):
                break
            cid = _start_container(image, category)
            if cid:
                pool.append(PooledContainer(container_id=cid, category=category, image=image))

    @asynccontextmanager
    async def acquire(self, category: str):
        """Acquire a container from the pool. Releases on context exit."""
        async with self._lock:
            await self._ensure_pool(category)
            pool = self._pools.get(category, [])
            available = [c for c in pool if not c.in_use]

        if available and self._docker:
            container = available[0]
            container.in_use = True
            container.last_used = time.monotonic()
            try:
                yield container.container_id
            finally:
                container.in_use = False
                container.last_used = time.monotonic()
        else:
            # No warm container — yield None (caller falls back to process isolation)
            yield None

    async def run_job(self, job_dict: dict) -> dict:
        """
        Run a job in the appropriate sandbox tier.
        Tier 1 (no Docker): process isolation via asyncio.run()
        Tier 2 (Docker): docker exec into warm container
        """
        category = job_dict.get("agent_category", "")
        async with self.acquire(category) as container_id:
            if container_id and self._docker:
                return await asyncio.get_event_loop().run_in_executor(
                    None, _exec_in_container, container_id, job_dict
                )

            # Process fallback — same as current behaviour
            from .jobs import AgentJob
            from .worker import NativeAgentWorker
            job = AgentJob.from_dict(job_dict)
            worker = NativeAgentWorker.from_job(job)
            result = await worker.run(job)
            return result.to_dict()

    async def shutdown(self) -> None:
        """Stop all containers in all pools."""
        for pool in self._pools.values():
            for container in pool:
                _stop_container(container.container_id)
        self._pools.clear()


# Global pool instance (one per process)
_pool: ContainerPool | None = None


def get_pool() -> ContainerPool:
    global _pool
    if _pool is None:
        _pool = ContainerPool()
    return _pool
