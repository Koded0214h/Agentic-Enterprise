#!/usr/bin/env python3
"""
Agent Swarm Orchestrator
Engine-agnostic multi-agent task execution.

Works with ANY CLI agent that accepts a prompt.
Add your own engine with 5 lines of code.

Usage:
  python orchestrator.py "Build a landing page"
  python orchestrator.py --engine gemini "Create an API"
  python orchestrator.py --engine generic --command "my-agent" --system-flag "--role" "Do something"
  python orchestrator.py --list-engines
  python orchestrator.py --list-agents
"""

import os
import json
import sys
import shutil
import argparse
import concurrent.futures
from datetime import datetime
from pathlib import Path

# Add engines to path
sys.path.insert(0, str(Path(__file__).parent))
from engines.adapter import (
    get_engine, register_engine, list_engines, detect_available_engine, detect_all_available, GenericEngine, BaseEngine
)
from core.workspace import Workspace, WorkspaceManager
from core.command_executor import CommandExecutor, CommandSafety
from core.self_healer import SelfHealer, HealingStrategy
from core.tui import TUI, Spinner, Colors as C

# Paths
SWARM_ROOT = Path(__file__).parent
AGENTS_DIR = SWARM_ROOT / "agents"
MEMORY_DIR = SWARM_ROOT / "memory"
OUTPUT_DIR = SWARM_ROOT / "output"
CONFIG_FILE = SWARM_ROOT / "swarm.config.json"

# Ensure directories exist
MEMORY_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


def load_config() -> dict:
    """Load swarm configuration"""
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {"default_engine": "claude", "agents": {}}


def dispatch_agent(
    agent_name: str,
    task: str,
    context: str = "",
    engine_name: str = None,
    config: dict = None,
    workspace: Workspace = None,
) -> dict:
    """Dispatch a task to a specific agent via an engine"""
    
    if config is None:
        config = load_config()
    
    # Determine which engine to use
    if engine_name is None:
        engine_name = (
            config.get("agents", {}).get(agent_name, {}).get("engine")
            or config.get("default_engine", "claude")
        )
    
    # Auto-detect if specified engine isn't available
    engine = get_engine(engine_name)
    if engine is None or not shutil.which(engine.command.split()[0]):
        detected = detect_available_engine()
        if detected:
            print(f"  ⚠️  Engine '{engine_name}' not found, auto-detected: {detected}")
            engine_name = detected
            engine = get_engine(engine_name)
        else:
            return {
                "agent": agent_name,
                "status": "ERROR",
                "error": f"No CLI agent found. Install one of: claude, gemini, kilo, codex, cursor-agent, aider"
            }
    
    # Find agent file
    agent_config = config.get("agents", {}).get(agent_name, {})
    agent_file = agent_config.get("file")
    
    if agent_file is None:
        # Try to find agent file by convention
        agent_file = f"engineering/{agent_name}.md"
        if not (AGENTS_DIR / agent_file).exists():
            agent_file = f"management/{agent_name}.md"
            if not (AGENTS_DIR / agent_file).exists():
                return {
                    "agent": agent_name,
                    "status": "ERROR",
                    "error": f"No agent definition found for: {agent_name}"
                }
    
    # Build full task with context
    full_task = task
    if context:
        full_task = f"CONTEXT:\n{context}\n\nTASK:\n{task}"
    
    # Create output directory — in workspace if provided, otherwise in swarm output/
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if workspace:
        run_dir = workspace.get_path() / ".swarm-output" / f"{agent_name}_{timestamp}"
    else:
        run_dir = OUTPUT_DIR / f"{agent_name}_{timestamp}"
    run_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"🔄 [{engine_name}] Dispatching to {agent_name}...")
    
    try:
        result = engine.run(agent_file, full_task, str(workspace.get_path() if workspace else run_dir))
        
        # Save output
        output_file = run_dir / "output.md"
        output_file.write_text(result["stdout"])
        
        # Save command used
        cmd_file = run_dir / "command.txt"
        cmd_file.write_text(result.get("command", ""))
        
        # Update memory
        memory_file = MEMORY_DIR / f"{agent_name}_latest.md"
        memory_file.write_text(f"# {agent_name} Output — {timestamp}\n\n{result['stdout']}")
        
        status = "✅ SUCCESS" if result["returncode"] == 0 else "❌ FAILED"
        print(f"{status} {agent_name}")
        
        return {
            "agent": agent_name,
            "engine": engine_name,
            "status": status,
            "output": result["stdout"],
            "error": result.get("stderr", ""),
            "command": result.get("command", ""),
            "output_dir": str(run_dir),
        }
    
    except Exception as e:
        print(f"💥 {agent_name} crashed: {e}")
        return {
            "agent": agent_name,
            "engine": engine_name,
            "status": "ERROR",
            "error": str(e)
        }


def dispatch_parallel(tasks: list, config: dict = None) -> list:
    """Dispatch multiple agents in parallel"""
    if config is None:
        config = load_config()
    
    max_workers = config.get("parallel_max_workers", 4)
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(
                dispatch_agent,
                t["agent"],
                t["task"],
                t.get("context", ""),
                t.get("engine"),
                config
            ): t
            for t in tasks
        }
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
    
    return results


def orchestrate(goal: str, engine: str = None, project_dir: str = ".", interactive: bool = False) -> dict:
    """
    Main orchestration workflow:
    
    1. QUESTIONNAIRE — Clarify requirements before building
    2. PLANNER — Design the implementation plan
    3. EXECUTE — Dispatch agents to implement
    4. DEBUG — Fix any issues found
    5. SHIP — Final review and deliver
    """
    config = load_config()
    
    # ═══════════════════════════════════════════════════════
    # CREATE WORKSPACE — in current directory, not in swarm folder
    # ═══════════════════════════════════════════════════════
    ws_manager = WorkspaceManager(project_dir)
    workspace = ws_manager.create_workspace(goal)
    
    # ═══════════════════════════════════════════════════════
    # DISPLAY
    # ═══════════════════════════════════════════════════════
    TUI.mini_banner()
    TUI.goal(goal, str(workspace.get_path()), engine or config.get('default_engine', 'claude'))
    
    # ═══════════════════════════════════════════════════════
    # PHASE 1: QUESTIONNAIRE — Ask before you build
    # ═══════════════════════════════════════════════════════
    TUI.phase_header(1, "QUESTIONNAIRE", "Clarifying requirements")
    spinner = Spinner("Questionnaire analyzing goal").start()
    questions_result = dispatch_agent(
        "questionnaire",
        f"Analyze this goal and produce clarifying questions:\n\n{goal}\n\nProject directory: {workspace.get_path()}",
        context=f"Project at {workspace.get_path()}. Be thorough about scope, users, data, auth, edge cases.",
        engine_name=engine,
        config=config,
        workspace=workspace,
    )
    
    if questions_result["status"] != "✅ SUCCESS":
        spinner.stop(False, "Questionnaire failed")
        TUI.warn("Clarification phase failed.")
        if not TUI.confirm("Continue without clarifications?", default=True):
            return {"error": "User chose to stop after questionnaire failure"}
        clarified_requirements = f"Goal: {goal}\n(No clarifications — building based on goal alone)"
    else:
        spinner.stop(True, "Questions ready")
        raw_output = questions_result["output"]
        TUI.info("Clarifying questions generated — answer them to help the swarm.")
        # Always show the questionnaire box and collect user answers
        clarified_requirements = TUI.questionnaire_box(raw_output)
    
    # ═══════════════════════════════════════════════════════
    # PHASE 2: PLANNER — Design the implementation
    # ═══════════════════════════════════════════════════════
    TUI.phase_header(2, "PLANNER", "Designing implementation")
    spinner = Spinner("Planner designing architecture").start()
    plan_result = dispatch_agent(
        "planner",
        f"Design a complete implementation plan for:\n\nGOAL:\n{goal}\n\nCLARIFIED REQUIREMENTS:\n{clarified_requirements}\n\nProject directory: {workspace.get_path()}",
        context="Design architecture, file structure, ordered tasks with dependencies. Be specific.",
        engine_name=engine,
        config=config,
        workspace=workspace,
    )
    
    if plan_result["status"] != "✅ SUCCESS":
        spinner.stop(False, "Planner failed")
        TUI.error("Planning phase failed. Can not continue without a plan.")
        if TUI.confirm("Retry planning?", default=True):
            # Retry once
            spinner = Spinner("Retrying planner").start()
            plan_result = dispatch_agent(
                "planner",
                f"RETRY: Design a complete implementation plan for:\n\nGOAL:\n{goal}\n\nCLARIFIED REQUIREMENTS:\n{clarified_requirements}",
                context="Previous attempt failed. Design architecture and tasks. Be specific.",
                engine_name=engine,
                config=config,
                workspace=workspace,
            )
            if plan_result["status"] != "✅ SUCCESS":
                spinner.stop(False, "Planner failed again")
                return {"error": "Planner failed twice", "details": plan_result}
            spinner.stop(True, "Plan ready on retry")
        else:
            return {"error": "Planner failed, user chose not to retry", "details": plan_result}
    
    spinner.stop(True, "Plan ready")
    plan_result["output"] = TUI.collect_agent_input("Planner", plan_result.get("output", ""))
    TUI.info("Implementation plan designed")
    
    # ═══════════════════════════════════════════════════════
    # PHASE 3: EXECUTE — Dispatch specialist agents
    # ═══════════════════════════════════════════════════════
    TUI.phase_header(3, "EXECUTE", "Dispatching specialist agents")
    tasks = parse_tasks(plan_result["output"], goal, engine)

    TUI.agent_roster([
        {"name": t["agent"], "engine": t.get("engine") or engine or "auto"}
        for t in tasks
    ])

    spinner = Spinner(f"Running {len(tasks)} agents in parallel").start()
    results = dispatch_parallel(tasks, config)
    spinner.stop(True, f"{len(tasks)} agents completed")

    # Show results + collect any questions agents left in their output
    for r in results:
        if "SUCCESS" in r.get("status", ""):
            TUI.agent_success(r["agent"], 0)
            r["output"] = TUI.collect_agent_input(r["agent"], r.get("output", ""))
        else:
            TUI.agent_fail(r["agent"], r.get("error", "Unknown"))
    
    # ═══════════════════════════════════════════════════════
    # PHASE 4: DEBUG — Fix any issues
    # ═══════════════════════════════════════════════════════
    failed_agents = [r for r in results if r.get("status") != "✅ SUCCESS"]
    if failed_agents:
        TUI.phase_header(4, "DEBUG", f"Fixing {len(failed_agents)} failure(s)")
        
        for failed in failed_agents:
            TUI.agent_debug(failed["agent"])
            spinner = Spinner(f"Debugging {failed['agent']}").start()
            
            debug_result = dispatch_agent(
                "debugger",
                f"Debug this failed agent output:\n\nAgent: {failed['agent']}\nError: {failed.get('error', 'Unknown')}\n\nOriginal task context:\n{plan_result['output'][:1000]}",
                context=f"Find root cause and fix. Original goal: {goal}",
                engine_name=engine,
                config=config,
                workspace=workspace,
            )
            if debug_result["status"] == "✅ SUCCESS":
                spinner.stop(True, f"{failed['agent']} fixed")
                debug_result["output"] = TUI.collect_agent_input(
                    "Debugger", debug_result.get("output", "")
                )
                for i, r in enumerate(results):
                    if r["agent"] == failed["agent"]:
                        results[i] = {
                            "agent": failed["agent"],
                            "engine": engine,
                            "status": "✅ DEBUGGED",
                            "output": debug_result["output"],
                            "original_error": failed.get("error", ""),
                            "debug_notes": debug_result["output"][:200]
                        }
            else:
                spinner.stop(False, f"{failed['agent']} still broken")
    else:
        TUI.phase_header(4, "DEBUG", "Checking for issues")
        TUI.success("No failures detected")
    
    # ═══════════════════════════════════════════════════════
    # PHASE 5: SHIP — Final review
    # ═══════════════════════════════════════════════════════
    TUI.phase_header(5, "SHIP", "Tech Lead final review")
    spinner = Spinner("Tech Lead reviewing").start()
    
    review_context = "\n\n".join([
        f"## {r['agent']} ({r.get('status', '?')})\n{r.get('output', '')[:500]}"
        for r in results
    ])
    
    review_result = dispatch_agent(
        "tech-lead",
        f"Final review of all agent outputs for consistency, quality, and completeness:\n\n{review_context}",
        context=f"Goal: {goal}. Check for conflicts, missing pieces, quality issues.",
        engine_name=engine,
        config=config,
        workspace=workspace,
    )
    
    if review_result["status"] == "✅ SUCCESS":
        spinner.stop(True, "Review complete")
        review_result["output"] = TUI.collect_agent_input(
            "Tech Lead", review_result.get("output", "")
        )
    else:
        spinner.stop(False, "Review failed")
    
    # ═══════════════════════════════════════════════════════
    # FINAL SUMMARY
    # ═══════════════════════════════════════════════════════
    workspace.complete("completed")
    
    total = len(results)
    succeeded = len([r for r in results if "SUCCESS" in r.get("status", "")])
    failed_count = len([r for r in results if "FAILED" in r.get("status", "")])
    debugged = len([r for r in results if "DEBUG" in r.get("status", "")])
    duration = (datetime.now() - workspace.created_at).total_seconds()
    
    TUI.divider()
    TUI.summary(total, succeeded, failed_count, debugged, duration)
    TUI.complete(str(workspace.get_path()))
    
    report = {
        "goal": goal,
        "workspace": str(workspace.get_path()),
        "engine": engine or config.get("default_engine"),
        "timestamp": datetime.now().isoformat(),
        "workflow": {
            "questionnaire": questions_result.get("output", ""),
            "plan": plan_result.get("output", ""),
            "execution": results,
            "debug": [r for r in results if "DEBUG" in r.get("status", "")],
            "review": review_result.get("output", ""),
        },
        "status": "COMPLETED",
        "agents_used": len(tasks),
        "agents_succeeded": len([r for r in results if "SUCCESS" in r.get("status", "")]),
        "agents_failed": len([r for r in results if "FAILED" in r.get("status", "")]),
        "agents_debugged": len([r for r in results if "DEBUG" in r.get("status", "")]),
    }
    
    report_file = OUTPUT_DIR / f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_file.write_text(json.dumps(report, indent=2, default=str))
    
    # Also save report in workspace
    ws_report = workspace.get_path() / ".swarm-report.json"
    ws_report.write_text(json.dumps(report, indent=2, default=str))
    
    print(f"\n{'=' * 60}")
    print(f"✅ COMPLETE! Agents: {report['agents_used']} | "
          f"✅ {report['agents_succeeded']} | "
          f"❌ {report['agents_failed']} | "
          f"🐛 {report['agents_debugged']}")
    print(f"📄 Report: {report_file}")
    print(f"{'=' * 60}")
    
    return report


def parse_tasks(pm_output: str, goal: str, engine: str = None) -> list:
    """Parse PM output into dispatchable tasks"""
    tasks = []
    goal_lower = goal.lower()
    
    if any(kw in goal_lower for kw in ["website", "web app", "landing page", "frontend", "ui"]):
        tasks.append({
            "agent": "frontend-dev",
            "task": f"Build the frontend for: {goal}",
            "context": pm_output,
            "engine": engine
        })
    
    if any(kw in goal_lower for kw in ["api", "backend", "server", "database", "auth"]):
        tasks.append({
            "agent": "backend-dev",
            "task": f"Build the backend for: {goal}",
            "context": pm_output,
            "engine": engine
        })
    
    if any(kw in goal_lower for kw in ["deploy", "docker", "ci/cd", "pipeline", "hosting"]):
        tasks.append({
            "agent": "devops",
            "task": f"Set up deployment for: {goal}",
            "context": pm_output,
            "engine": engine
        })
    
    if any(kw in goal_lower for kw in ["secure", "security", "audit"]):
        tasks.append({
            "agent": "security",
            "task": f"Audit security for: {goal}",
            "context": pm_output,
            "engine": engine
        })
    
    # Always add QA
    tasks.append({
        "agent": "qa-tester",
        "task": f"Write tests for: {goal}",
        "context": pm_output,
        "engine": engine
    })
    
    # Default: frontend + backend
    if not tasks:
        tasks = [
            {"agent": "frontend-dev", "task": f"Build the frontend for: {goal}", "context": pm_output, "engine": engine},
            {"agent": "backend-dev", "task": f"Build the backend for: {goal}", "context": pm_output, "engine": engine},
        ]
    
    return tasks


def main():
    parser = argparse.ArgumentParser(
        description="🛡️ Agent Swarm — Engine-agnostic multi-agent orchestrator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "Build a landing page for TeenovateX"
  %(prog)s --engine gemini "Create a REST API"
  %(prog)s --engine generic --command "my-agent" --system-flag "--role" "Do something"
  %(prog)s --agent frontend-dev "Create a navbar"
  %(prog)s --list-engines
  %(prog)s --list-agents
        """
    )
    
    parser.add_argument("goal", nargs="?", help="Goal or task description")
    parser.add_argument("--engine", "-e", help="Engine to use (claude, gemini, codex, kilocode, etc.)")
    parser.add_argument("--agent", "-a", help="Dispatch to a specific agent only")
    parser.add_argument("--command", help="Custom command for generic engine")
    parser.add_argument("--system-flag", default="--prompt", help="System prompt flag for generic engine")
    parser.add_argument("--auto-flag", default="", help="Auto/yes flag for generic engine")
    parser.add_argument("--project", default=".", help="Project directory")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive mode — pause for human input between phases")
    parser.add_argument("--list-engines", action="store_true", help="List available engines")
    parser.add_argument("--list-agents", action="store_true", help="List available agents")
    parser.add_argument("--register-engine", nargs=3, metavar=("NAME", "COMMAND", "FLAG"),
                        help="Register a custom engine: NAME COMMAND SYSTEM_FLAG")
    
    args = parser.parse_args()
    
    # List engines
    if args.list_engines:
        print("\n🔧 Available Engines:\n")
        all_available = detect_all_available()
        for eng in list_engines():
            status = "✅ INSTALLED" if eng['name'] in all_available else "❌ not found"
            print(f"  {eng['name']:12} — {eng['command']:20} {status}")
        print(f"\n  {'generic':12} — (configure dynamically with --command and --system-flag)")
        if all_available:
            print(f"\n  Auto-detected default: {all_available[0]}")
        print(f"\n  Total: {len(list_engines()) + 1} engines ({len(all_available)} available)")
        return
    
    # List agents
    if args.list_agents:
        config = load_config()
        print("\n🤖 Available Agents:\n")
        for name, conf in config.get("agents", {}).items():
            print(f"  {name:20} — {conf.get('description', 'No description')}")
        print(f"\nTotal: {len(config.get('agents', {}))} agents")
        return
    
    # Register custom engine
    if args.register_engine:
        name, command, flag = args.register_engine
        
        class CustomEngine(BaseEngine):
            pass
        
        CustomEngine.name = name
        CustomEngine.command = command
        CustomEngine.system_prompt_flag = flag
        
        register_engine(name, CustomEngine)
        print(f"✅ Registered custom engine: {name} ({command} {flag})")
        return
    
    # Configure generic engine
    if args.command:
        GenericEngine.configure(args.command, args.system_flag, args.auto_flag)
        register_engine("generic", GenericEngine)
    
    # Single agent dispatch
    if args.agent:
        if not args.goal:
            print("❌ Error: Provide a task/goal after --agent")
            sys.exit(1)
        
        result = dispatch_agent(args.agent, args.goal, engine_name=args.engine)
        print(json.dumps(result, indent=2, default=str))
        return
    
    # Full orchestration
    if args.goal:
        report = orchestrate(args.goal, engine=args.engine, project_dir=args.project, interactive=args.interactive)
        return
    
    # ── Session state (persists across REPL iterations) ──────────────────────
    session_engine      = {"name": args.engine}   # CLI --engine is the startup default
    session_agent       = {"name": "swarm-assistant"}
    session_model       = {"name": None}
    project_path_holder = {"path": args.project}

    _cfg_cache: list = [None]

    def _load_config() -> dict:
        if _cfg_cache[0] is None:
            _cfg_cache[0] = load_config()
        return _cfg_cache[0]

    def _on_reload_config() -> None:
        _cfg_cache[0] = None

    def _agent_slug_ok(slug: str) -> bool:
        return slug in (_load_config().get("agents") or {})

    def _paths() -> None:
        print(f"\n  {'Swarm home':<14}  {Path.home() / '.swarm'}")
        print(f"  {'Memory':<14}  {MEMORY_DIR}")
        print(f"  {'Output':<14}  {OUTPUT_DIR}")
        print(f"  {'Config':<14}  {CONFIG_FILE}")
        print(f"  {'Project':<14}  {project_path_holder['path']}")

    def _print_help_doc() -> None:
        parser.print_help()

    def _run_company(goal_text: str) -> None:
        orchestrate(
            goal_text,
            engine=session_engine.get("name") or args.engine,
            project_dir=project_path_holder["path"],
            interactive=args.interactive,
        )

    def _run_chat(msg: str) -> None:
        agent  = session_agent.get("name") or "swarm-assistant"
        engine = session_engine.get("name") or args.engine
        result = dispatch_agent(agent, msg, engine_name=engine, config=_load_config())
        out = (result.get("output") or "").strip()
        if out:
            print(out)
        elif result.get("error"):
            TUI.warn(str(result["error"])[:200])

    # ── Import slash handler once ──────────────────────────────────────────
    from core.slash_commands import handle_slash_line  # noqa: PLC0415

    def _handle_slash(raw: str) -> "SlashOutcome":  # type: ignore[name-defined]
        return handle_slash_line(
            raw,
            session_engine=session_engine,
            session_agent=session_agent,
            session_model=session_model,
            project_path_holder=project_path_holder,
            load_config_fn=_load_config,
            agent_slug_ok_fn=_agent_slug_ok,
            paths_fn=_paths,
            print_help_doc_fn=_print_help_doc,
            run_company_fn=_run_company,
            run_chat_fn=_run_chat,
            dispatch_agent_fn=dispatch_agent,
            on_reload_config=_on_reload_config,
        )

    # ── Interactive REPL ───────────────────────────────────────────────────
    TUI.banner()
    print(f"  {C.DIM}Type your goal, or type / to see commands. Ctrl+C or empty input to exit.{C.RESET}\n")

    while True:
        try:
            raw = TUI.prompt("What should the swarm build for you?")
        except (KeyboardInterrupt, EOFError):
            raw = ""

        raw = raw.strip()

        if not raw:
            TUI.goodbye()
            break

        # ── Slash command: intercept before orchestrating ─────────────────
        if raw.startswith("/"):
            outcome = _handle_slash(raw)
            if outcome.stop:
                TUI.goodbye()
                break
            continue   # command handled — don't orchestrate

        # ── Full orchestration ────────────────────────────────────────────
        orchestrate(
            raw,
            engine=session_engine.get("name") or args.engine,
            project_dir=project_path_holder["path"],
            interactive=args.interactive,
        )
        print()
        if not TUI.confirm("Run another task?", default=True):
            TUI.goodbye()
            break


if __name__ == "__main__":
    main()
