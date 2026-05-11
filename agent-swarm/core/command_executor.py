#!/usr/bin/env python3
"""
Agent Swarm — Command Executor
Agents can run CLI commands with approval.

Safety levels:
- SAFE: Auto-approve (ls, cat, npm list, git status, etc.)
- MODERATE: Log but auto-approve (npm install, git commit, etc.)
- DANGEROUS: Require approval (rm, deploy, git push --force, etc.)
- BLOCKED: Never allowed (rm -rf /, shutdown, etc.)
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

SWARM_ROOT = Path(__file__).parent.parent
COMMAND_LOG = SWARM_ROOT / "memory" / "command_log.json"


# Command safety classification
SAFE_COMMANDS = [
    # Read-only operations
    "ls", "cat", "head", "tail", "less", "more", "wc", "file",
    "find", "grep", "rg", "ag", "ack", "which", "whereis", "type",
    "pwd", "whoami", "date", "echo", "printf",
    # Git read-only
    "git status", "git log", "git diff", "git show", "git branch",
    "git remote", "git stash list", "git reflog",
    # Node/npm read-only
    "npm list", "npm ls", "npm outdated", "npm audit",
    "node --version", "npm --version", "npx --version",
    # Python read-only
    "python --version", "python3 --version", "pip list", "pip show",
    "pip freeze",
    # Docker read-only
    "docker ps", "docker images", "docker logs", "docker stats",
    # System info
    "uname", "df", "du", "free", "uptime", "top", "ps",
    # File content
    "jq", "sort", "uniq", "cut", "awk", "sed", "tr",
]

MODERATE_COMMANDS = [
    # Git write operations
    "git add", "git commit", "git checkout", "git switch",
    "git merge", "git rebase", "git stash", "git tag",
    "git fetch", "git pull",
    # Package management
    "npm install", "npm i", "npm ci", "npm update",
    "npm uninstall", "npm run", "npm test", "npm build",
    "pip install", "pip uninstall", "pip upgrade",
    "yarn", "pnpm",
    # File creation/modification
    "touch", "mkdir", "cp", "mv",
    # Docker operations
    "docker build", "docker run", "docker stop", "docker start",
    "docker-compose up", "docker-compose down",
    # Make
    "make", "cmake",
    # Build tools
    "tsc", "vite", "webpack", "rollup", "esbuild",
    "cargo build", "cargo test",
    "go build", "go test",
]

DANGEROUS_COMMANDS = [
    # Destructive file operations
    "rm ", "rm -", "rmdir",
    # Git dangerous operations
    "git push", "git push --force", "git reset --hard",
    "git clean -fd", "git branch -D",
    # Deployment
    "fly deploy", "vercel deploy", "netlify deploy",
    "aws deploy", "gcloud deploy", "kubectl apply",
    # System modifications
    "chmod", "chown", "sudo",
    "systemctl", "service",
    # Network
    "curl -X POST", "curl -X PUT", "curl -X DELETE",
    "wget",
]

BLOCKED_COMMANDS = [
    # Absolutely never
    "rm -rf /", "rm -rf /*",
    "dd if=", "mkfs",
    "shutdown", "reboot", "halt", "poweroff",
    "passwd", "userdel", "useradd",
    "> /dev/sda", "format",
    ":(){:|:&};:",  # fork bomb
]


# Compound-shell risky patterns (`cmd1; rm -rf`, pipes, nested commands).
_RISK_SHELL_RE = re.compile(
    r"|".join(
        (
            r"\brm\b",
            r"\brmdir\b",
            r"\bsudo\b",
            r"\bchmod\b",
            r"\bchown\b",
            r"\bdd\b",
            r"\bmkfs\b",
            r"\bshutdown\b",
            r"\breboot\b",
            r"\bpoweroff\b",
            r"\bhalt\b",
            r"\bkubectl\s+(?:apply|delete|patch|replace|exec)\b",
            r"\bgit\s+push\b",
            r"\bgit\s+reset\s+--hard\b",
            r"\bgit\s+clean\b",
            r"\bgit\s+branch\s+-[dD]\b",
            r"\bfly\s+deploy\b",
            r"\bvercel\s+deploy\b",
            r"\bnetlify\s+deploy\b",
            r"\bgcloud\b",
            r"\baws\b",
            r"\bcurl\b.{0,400}?-(?:x|request)\s*(?:post|put|delete|patch)\b",
            r"\bwget\b",
            r"\bsystemctl\b",
            r"\bservice\b",
            r">\s*/dev/sd[a-z]",
        )
    ),
    re.DOTALL,
)

# Readable export — prefix list aligns with heuristic startsWith checks below.
RISKY_COMMAND_PREFIXES = DANGEROUS_COMMANDS


class CommandSafety:
    SAFE = "safe"
    MODERATE = "moderate"
    DANGEROUS = "dangerous"
    BLOCKED = "blocked"


def tty_confirm_risky_command(command: str, safety: str) -> bool:
    """
    Prompt on TTY before executing classifier-marked destructive commands.

    Bypass (emergency / automation-only): SWARM_AUTO_APPROVE_DANGEROUS=1
    """
    if safety != CommandSafety.DANGEROUS:
        return True
    bypass = os.environ.get("SWARM_AUTO_APPROVE_DANGEROUS", "").strip().lower()
    if bypass in ("1", "true", "yes"):
        return True
    try:
        tty = sys.stdin.isatty()
    except (ValueError, AttributeError):
        tty = False
    if not tty:
        return False
    preview = command if len(command) <= 4000 else command[:3997] + "…"
    print("\n⚠ Swarm classified this shell command as RISKY (destructive).", file=sys.stderr)
    print(preview + "\n", file=sys.stderr)
    try:
        ans = (
            input("Execute this risky command anyway? Type YES in capitals or [n]/Enter to abort: ").strip()
        )
    except EOFError:
        return False
    return ans == "YES"


LEVEL_ALIASES = {
    "safe": CommandSafety.SAFE,
    "moderate": CommandSafety.MODERATE,
    "dangerous": CommandSafety.DANGEROUS,
}


class CommandResult:
    def __init__(self, command: str, stdout: str, stderr: str, returncode: int,
                 safety: str, approved: bool, duration: float):
        self.command = command
        self.stdout = stdout
        self.stderr = stderr
        self.returncode = returncode
        self.safety = safety
        self.approved = approved
        self.duration = duration
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> dict:
        return {
            "command": self.command,
            "stdout": self.stdout[:1000],  # Truncate for storage
            "stderr": self.stderr[:500],
            "returncode": self.returncode,
            "safety": self.safety,
            "approved": self.approved,
            "duration": round(self.duration, 2),
            "timestamp": self.timestamp,
            "success": self.returncode == 0,
        }


class CommandExecutor:
    """
    Execute CLI commands with safety classification and approval.
    """
    
    def __init__(self, cwd: str = ".", auto_approve: list = None, 
                 approval_callback=None):
        """
        Args:
            cwd: Working directory for commands
            auto_approve: List of safety levels to auto-approve (default: ["safe", "moderate"])
            approval_callback: Function to call for approval (returns True/False)
                               If None, dangerous commands are blocked
        """
        self.cwd = Path(cwd)
        self.auto_approve = auto_approve or [CommandSafety.SAFE, CommandSafety.MODERATE]
        self.approval_callback = approval_callback
        self.command_log = []

    @classmethod
    def from_swarm_config(cls, swarm_config: Optional[dict], cwd: str = ".") -> CommandExecutor:
        """Build executor from swarm.config.json ``security.commands``."""
        swarm_config = swarm_config or {}
        sec = swarm_config.get("security")
        cmds = (sec.get("commands") if isinstance(sec, dict) else None) or {}

        raw_levels = cmds.get("auto_approve_levels")
        if not isinstance(raw_levels, list) or not raw_levels:
            auto_levels = [CommandSafety.SAFE, CommandSafety.MODERATE]
        else:
            auto_levels: list[str] = []
            for x in raw_levels:
                key = str(x).lower().strip()
                if key in LEVEL_ALIASES:
                    auto_levels.append(LEVEL_ALIASES[key])
            if not auto_levels:
                auto_levels = [CommandSafety.SAFE, CommandSafety.MODERATE]

        callback = tty_confirm_risky_command if cmds.get("confirm_risky_commands", True) else None
        return cls(cwd=cwd, auto_approve=auto_levels, approval_callback=callback)
    
    def classify(self, command: str) -> str:
        """Classify a command's safety level"""
        cmd_lower = command.lower().strip()
        
        # Check blocked substrings anywhere in the compound command line
        for blocked in BLOCKED_COMMANDS:
            if blocked.lower() in cmd_lower:
                return CommandSafety.BLOCKED

        # Compound shells: ; && | etc.
        if _RISK_SHELL_RE.search(cmd_lower):
            return CommandSafety.DANGEROUS

        for dangerous in DANGEROUS_COMMANDS:
            if cmd_lower.startswith(dangerous.lower()):
                return CommandSafety.DANGEROUS
        
        # Check moderate
        for moderate in MODERATE_COMMANDS:
            if cmd_lower.startswith(moderate.lower()):
                return CommandSafety.MODERATE
        
        # Check safe
        for safe in SAFE_COMMANDS:
            if cmd_lower.startswith(safe.lower()):
                return CommandSafety.SAFE
        
        # Unknown commands are moderate by default
        return CommandSafety.MODERATE
    
    def execute(self, command: str, timeout: int = 120, 
                cwd: Optional[str] = None) -> CommandResult:
        """
        Execute a command with safety checks.
        
        Returns CommandResult with output and safety info.
        """
        import time
        
        safety = self.classify(command)
        working_dir = Path(cwd) if cwd else self.cwd
        
        # Handle blocked commands
        if safety == CommandSafety.BLOCKED:
            result = CommandResult(
                command=command,
                stdout="",
                stderr=f"BLOCKED: Command not allowed for safety reasons: {command}",
                returncode=-1,
                safety=safety,
                approved=False,
                duration=0,
            )
            self._log(result)
            return result
        
        # Check if approval needed
        approved = True
        if safety not in self.auto_approve:
            if self.approval_callback:
                approved = self.approval_callback(command, safety)
            else:
                # No callback = block dangerous commands
                if safety == CommandSafety.DANGEROUS:
                    result = CommandResult(
                        command=command,
                        stdout="",
                        stderr=f"APPROVAL REQUIRED: Dangerous command needs approval: {command}",
                        returncode=-1,
                        safety=safety,
                        approved=False,
                        duration=0,
                    )
                    self._log(result)
                    return result
        
        if not approved:
            result = CommandResult(
                command=command,
                stdout="",
                stderr="Command rejected by approval callback",
                returncode=-1,
                safety=safety,
                approved=False,
                duration=0,
            )
            self._log(result)
            return result
        
        # Execute the command
        start_time = time.time()
        try:
            proc = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=str(working_dir),
            )
            duration = time.time() - start_time
            
            result = CommandResult(
                command=command,
                stdout=proc.stdout,
                stderr=proc.stderr,
                returncode=proc.returncode,
                safety=safety,
                approved=approved,
                duration=duration,
            )
        
        except subprocess.TimeoutExpired:
            duration = time.time() - start_time
            result = CommandResult(
                command=command,
                stdout="",
                stderr=f"Command timed out after {timeout}s",
                returncode=124,
                safety=safety,
                approved=approved,
                duration=duration,
            )
        
        except Exception as e:
            duration = time.time() - start_time
            result = CommandResult(
                command=command,
                stdout="",
                stderr=str(e),
                returncode=1,
                safety=safety,
                approved=approved,
                duration=duration,
            )
        
        self._log(result)
        return result
    
    def execute_sequence(self, commands: list, stop_on_error: bool = True) -> list:
        """Execute multiple commands in sequence"""
        results = []
        for cmd in commands:
            result = self.execute(cmd)
            results.append(result)
            if stop_on_error and result.returncode != 0:
                break
        return results
    
    def _log(self, result: CommandResult):
        """Log command execution"""
        self.command_log.append(result.to_dict())
        
        # Persist log
        log_file = COMMAND_LOG
        log_file.parent.mkdir(exist_ok=True)
        
        existing = []
        if log_file.exists():
            try:
                existing = json.loads(log_file.read_text())
            except:
                existing = []
        
        existing.append(result.to_dict())
        
        # Keep last 500 entries
        if len(existing) > 500:
            existing = existing[-500:]
        
        log_file.write_text(json.dumps(existing, indent=2))


def execute_command(command: str, cwd: str = ".", timeout: int = 120,
                    auto_approve_all: bool = False) -> dict:
    """
    Convenience function to execute a single command.
    
    Args:
        command: Shell command to execute
        cwd: Working directory
        timeout: Timeout in seconds
        auto_approve_all: If True, auto-approve everything (DANGEROUS)
    """
    if auto_approve_all:
        executor = CommandExecutor(
            cwd=cwd,
            auto_approve=[
                CommandSafety.SAFE,
                CommandSafety.MODERATE,
                CommandSafety.DANGEROUS,
            ],
            approval_callback=lambda _c, _s: True,
        )
    else:
        executor = CommandExecutor(
            cwd=cwd,
            approval_callback=tty_confirm_risky_command,
        )
    result = executor.execute(command, timeout)
    return result.to_dict()
