import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiBriefcaseLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiCpuLine,
  RiFlagLine,
  RiLoader4Line,
  RiMoneyDollarCircleLine,
  RiRocketLine,
  RiRobot2Line,
  RiSettings3Line,
  RiShieldCheckLine,
  RiTimeLine,
} from "react-icons/ri";
import { projects as projectsAPI } from "../../api/projects";
import { swarm as swarmAPI } from "../../api/swarm";
import { ops } from "../../api/ops";
import { finance } from "../../api/finance";
import { agents as agentsAPI } from "../../api/agents";
import { observe } from "../../api/observe";
import "./Projects.css";

const EMPTY_LIST = [];
const EMPTY_OBJECT = {};

export default function ProjectDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [detail, setDetail] = useState(null);
  const [opsSummary, setOpsSummary] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [agentsSummary, setAgentsSummary] = useState({ total: 0, running: 0 });
  const [runs, setRuns] = useState([]);
  const [workflowTasks, setWorkflowTasks] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [connectors, setConnectors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadProject() {
    if (!detail) setLoading(true);
    setError("");
    try {
      const [
        projectData,
        opsData,
        financeData,
        agentData,
        runData,
        taskData,
        pendingData,
        connectorData,
      ] = await Promise.all([
        projectsAPI.overview(id),
        ops.overview({ project_id: id }),
        finance.summary({ project_id: id }),
        agentsAPI.list(),
        observe.recentRuns({ project_id: id }).catch(() => ({ results: [] })),
        observe.tasks({ project_id: id }).catch(() => ({ results: [] })),
        agentsAPI
          .pendingActions({ project_id: id })
          .catch(() => ({ results: [] })),
        ops.connectors().catch(() => null),
      ]);
      const agents = unpackList(agentData);
      setDetail(projectData);
      setOpsSummary(opsData);
      setFinanceSummary(financeData);
      setRuns(unpackList(runData));
      setWorkflowTasks(unpackList(taskData));
      setPendingActions(unpackList(pendingData));
      setConnectors(connectorData);
      setAgentsSummary({
        total: agents.length,
        running: agents.filter((agent) => agent.status === "RUNNING").length,
      });
    } catch (err) {
      setError(err?.data?.detail || err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  const project = detail?.project;
  const members = detail?.members || EMPTY_LIST;
  const activities = detail?.activities || EMPTY_LIST;
  const goals = detail?.goals || EMPTY_LIST;
  const artifacts = detail?.artifacts || EMPTY_LIST;
  const opsCounts = opsSummary?.counts || EMPTY_OBJECT;
  const financeUsage = financeSummary?.usage_summary || {};
  const financeBudget = financeSummary?.budget_summary || EMPTY_OBJECT;
  const timelineItems = useMemo(
    () =>
      buildTimeline({
        activities,
        queue: opsSummary?.recent?.queue || EMPTY_LIST,
        leads: opsSummary?.recent?.leads || EMPTY_LIST,
        tickets: opsSummary?.recent?.tickets || EMPTY_LIST,
        pendingActions,
        runs,
        workflowTasks,
        projectId: id,
      }),
    [activities, id, opsSummary, pendingActions, runs, workflowTasks],
  );
  const readiness = useMemo(
    () =>
      buildReadiness({
        agentsSummary,
        artifacts,
        connectors,
        financeBudget,
        goals,
        members,
        opsCounts,
        pendingActions,
        project,
        timelineItems,
      }),
    [
      agentsSummary,
      artifacts,
      connectors,
      financeBudget,
      goals,
      members,
      opsCounts,
      pendingActions,
      project,
      timelineItems,
    ],
  );

  if (loading) {
    return (
      <div className="projects-page">
        <div className="card projects-empty-state">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="projects-page">
        <Link className="projects-back-link" to="/app/projects">
          <RiArrowLeftLine size={15} /> Projects
        </Link>
        <div className="projects-error">{error || "Project not found"}</div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-detail-top">
        <Link className="projects-back-link" to="/app/projects">
          <RiArrowLeftLine size={15} /> Projects
        </Link>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <Link className="btn btn-ghost" to={`/app/projects/${id}/timeline`}>
            <RiTimeLine size={14} /> Timeline
          </Link>
          <Link className="btn btn-ghost" to={`/app/projects/${id}/readiness`}>
            <RiShieldCheckLine size={14} /> Readiness
          </Link>
          <Link className="btn btn-ghost" to={`/app/projects/${id}/settings`}>
            <RiSettings3Line size={14} /> Settings
          </Link>
        </div>
      </div>

      <div className="projects-hero card">
        <div className="projects-hero-main">
          <div className="projects-badge-row">
            <span className="badge badge-green">{project.status}</span>
            <span className="badge badge-amber">{project.stage}</span>
            <span className="badge badge-green">{project.operating_mode}</span>
          </div>
          <h1>{project.name}</h1>
          <p>
            {project.description || project.vision || "No description yet."}
          </p>
        </div>
        <div className="projects-hero-side">
          <div className="projects-budget">
            <span>Monthly budget</span>
            <strong>
              {project.currency} {project.monthly_budget}
            </strong>
          </div>
        </div>
      </div>

      <GettingStarted
        id={id}
        goals={goals}
        projectName={project?.name}
        onGoalAdded={loadProject}
      />

      {/* Tab bar */}
      <div className="pd-tabs">
        <button
          className={tab === "overview" ? "active" : ""}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={tab === "runs" ? "active" : ""}
          onClick={() => setTab("runs")}
        >
          Runs
        </button>
        <button
          className={tab === "goals" ? "active" : ""}
          onClick={() => setTab("goals")}
        >
          Goals <span className="pd-tab-count">{goals.length}</span>
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="projects-kpis">
            <Kpi
              icon={<RiMoneyDollarCircleLine size={18} />}
              label="Usage cost"
              value={Number(financeUsage.total_cost || 0).toFixed(2)}
              sub={`${financeUsage.record_count || 0} usage records`}
            />
            <Kpi
              icon={<RiCpuLine size={18} />}
              label="Budget spend"
              value={Number(financeBudget.current_spend || 0).toFixed(2)}
              sub={`${financeBudget.percent_used ?? 0}% used`}
            />
            <Kpi
              icon={<RiRobot2Line size={18} />}
              label="Agents"
              value={agentsSummary.total}
              sub={`${agentsSummary.running} running`}
            />
            <Kpi
              icon={<RiShieldCheckLine size={18} />}
              label="Queue"
              value={opsCounts.queue_pending ?? 0}
              sub={`${opsCounts.queue_due_now ?? 0} due now`}
            />
          </div>

          <div className="projects-detail-grid">
            <section className="card projects-panel projects-readiness-panel">
              <div className="projects-panel-head">
                <span>Autonomy readiness</span>
                <span className={`badge badge-${readiness.tone}`}>
                  {readiness.label}
                </span>
              </div>
              <div className="projects-readiness-layout">
                <div className="projects-readiness-score">
                  <span>Readiness score</span>
                  <strong>{readiness.score}%</strong>
                  <div className="projects-readiness-track">
                    <span style={{ width: `${readiness.score}%` }} />
                  </div>
                  <small>{readiness.summary}</small>
                </div>
                <div className="projects-readiness-lists">
                  <ReadinessList
                    title="Missing capability flags"
                    items={readiness.missing}
                    empty="Core capabilities are represented."
                    tone="amber"
                  />
                  <ReadinessList
                    title="Risky-action warnings"
                    items={readiness.risks}
                    empty="No active autonomy warnings."
                    tone="red"
                  />
                </div>
              </div>
            </section>

            <section className="card projects-panel projects-timeline-panel">
              <div className="projects-panel-head">
                <span>Project activity timeline</span>
                <span className="badge badge-green">
                  {timelineItems.length} events
                </span>
              </div>
              <Timeline items={timelineItems} />
            </section>

            <section className="card projects-panel">
              <div className="projects-panel-head">
                <span>Operating snapshot</span>
                <span
                  className={`badge badge-${financeBudget.over_limit ? "red" : financeBudget.over_alert ? "amber" : "green"}`}
                >
                  {financeBudget.over_limit
                    ? "Over budget"
                    : financeBudget.over_alert
                      ? "Near limit"
                      : "Within budget"}
                </span>
              </div>
              <div className="projects-snapshot-grid">
                <Metric label="Members" value={members.length} />
                <Metric label="Goals" value={goals.length} />
                <Metric label="Artifacts" value={artifacts.length} />
                <Metric label="Ops leads" value={opsCounts.leads ?? 0} />
                <Metric
                  label="Open tickets"
                  value={opsCounts.open_tickets ?? 0}
                />
                <Metric
                  label="Failed queue"
                  value={opsCounts.queue_failed ?? 0}
                />
              </div>
            </section>

            <section className="card projects-panel">
              <div className="projects-panel-head">
                <span>Goals</span>
                <span className="badge badge-amber">{goals.length}</span>
              </div>
              <List
                items={goals}
                empty="No goals yet."
                renderItem={(goal) => (
                  <Row
                    title={goal.title}
                    sub={`${goal.status} - ${goal.target_metric || "metric pending"}`}
                    badge={goal.priority}
                  />
                )}
              />
            </section>

            <section className="card projects-panel">
              <div className="projects-panel-head">
                <span>Recent activity</span>
                <span className="badge badge-green">{activities.length}</span>
              </div>
              <List
                items={activities}
                empty="No activity yet."
                renderItem={(activity) => (
                  <Row
                    title={activity.summary}
                    sub={`${activity.kind} - ${activity.actor_email || "system"}`}
                    badge={new Date(activity.created_at).toLocaleDateString()}
                  />
                )}
              />
            </section>

            <section className="card projects-panel">
              <div className="projects-panel-head">
                <span>People and artifacts</span>
                <span className="badge badge-amber">
                  {artifacts.length} artifacts
                </span>
              </div>
              <List
                items={members}
                empty="No members linked yet."
                renderItem={(member) => (
                  <Row
                    title={member.user_name || member.user_email}
                    sub={member.role}
                    badge={member.user_email || "member"}
                  />
                )}
              />
              <List
                items={artifacts}
                empty="Artifacts will appear here as work ships."
                renderItem={(artifact) => (
                  <Row
                    title={artifact.name}
                    sub={`${artifact.kind} - ${artifact.path || "inline"}`}
                    badge={artifact.kind}
                  />
                )}
              />
            </section>
          </div>
        </>
      )}

      {tab === "runs" && <RunsTab projectId={id} />}
      {tab === "goals" && (
        <GoalsTab projectId={id} goals={goals} onRefresh={loadProject} />
      )}
    </div>
  );
}

// ─── Runs tab ─────────────────────────────────────────────────────────────────
function RunsTab({ projectId }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    swarmAPI
      .list(projectId)
      .then((d) => setRuns(Array.isArray(d) ? d : d.results || []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [projectId]);

  // Auto-refresh while any run is still running
  useEffect(() => {
    const hasLive = runs.some((r) => r.status === "running");
    if (!hasLive) return;
    const t = setInterval(() => {
      swarmAPI
        .list(projectId)
        .then((d) => setRuns(Array.isArray(d) ? d : d.results || []))
        .catch(() => undefined);
    }, 3000);
    return () => clearInterval(t);
  }, [runs, projectId]);

  if (loading)
    return (
      <div className="projects-empty" style={{ padding: 24 }}>
        Loading runs…
      </div>
    );
  if (!runs.length)
    return (
      <div className="projects-empty-page" style={{ padding: "60px 24px" }}>
        <div className="projects-empty-page-icon">
          <RiRocketLine size={28} />
        </div>
        <h2>No runs yet</h2>
        <p>
          Launch a swarm from the Getting Started panel or the Run Swarm button
          in the top bar.
        </p>
      </div>
    );

  return (
    <div className="pd-runs">
      {runs.map((run) => {
        const isLive = run.status === "running";
        const isOk = run.status === "completed";
        const isFail = run.status === "failed";
        const dur =
          run.duration_s != null
            ? `${Math.floor(run.duration_s / 60)}m ${run.duration_s % 60}s`
            : null;

        return (
          <div key={run.id} className={`pd-run-row ${isLive ? "live" : ""}`}>
            <div className="pd-run-status">
              {isLive && (
                <RiLoader4Line
                  size={14}
                  className="spin"
                  style={{ color: "var(--accent)" }}
                />
              )}
              {isOk && (
                <RiCheckLine size={14} style={{ color: "var(--green)" }} />
              )}
              {isFail && (
                <span
                  style={{ color: "var(--red)", fontSize: 13, fontWeight: 700 }}
                >
                  ✕
                </span>
              )}
              {!isLive && !isOk && !isFail && (
                <span className="dot dot-amber" />
              )}
            </div>
            <div className="pd-run-body">
              <div className="pd-run-goal">
                {run.task_summary || "Untitled run"}
              </div>
              <div className="pd-run-meta">
                <span
                  className={`badge badge-${isLive ? "amber" : isOk ? "green" : isFail ? "red" : "amber"}`}
                >
                  {run.status}
                </span>
                {run.swarm_agent_name && (
                  <span className="pd-run-agent">{run.swarm_agent_name}</span>
                )}
                {run.started_at && (
                  <span>{new Date(run.started_at).toLocaleString()}</span>
                )}
                {dur && <span>{dur}</span>}
              </div>
            </div>
            <Link
              to={`/app/swarm/${run.id}`}
              className="btn btn-ghost btn-sm pd-run-link"
            >
              {isLive ? "Watch live →" : "View →"}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

// ─── Goals tab ────────────────────────────────────────────────────────────────
const STATUS_CYCLE = {
  PLANNED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: "PLANNED",
  BLOCKED: "PLANNED",
  CANCELLED: "PLANNED",
};
const STATUS_COLOR = {
  PLANNED: "amber",
  IN_PROGRESS: "green",
  COMPLETED: "green",
  BLOCKED: "red",
  CANCELLED: "amber",
};

function GoalsTab({ projectId, goals: initialGoals, onRefresh }) {
  const [goals, setGoals] = useState(initialGoals);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  async function addGoal(e) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setAdding(true);
    try {
      const g = await projectsAPI.goals.create({
        project: projectId,
        title,
        status: "PLANNED",
        priority: 1,
      });
      setGoals((prev) => [g, ...prev]);
      setInput("");
      onRefresh();
    } catch {
      // keep the inline goal form quiet; project refresh handles server truth
    } finally {
      setAdding(false);
    }
  }

  async function cycleStatus(goal) {
    const next = STATUS_CYCLE[goal.status] || "PLANNED";
    try {
      await projectsAPI.goals.update(goal.id, { status: next });
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, status: next } : g)),
      );
    } catch {
      // keep the current local state if the backend rejects the status change
    }
  }

  return (
    <div className="pd-goals">
      <form className="pd-goals-form" onSubmit={addGoal}>
        <input
          className="projects-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a goal — e.g. Reach 100 paying customers"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={adding || !input.trim()}
        >
          <RiAddLine size={14} /> {adding ? "Adding…" : "Add goal"}
        </button>
      </form>

      {goals.length === 0 ? (
        <div
          className="projects-empty"
          style={{ padding: "40px 0", textAlign: "center" }}
        >
          No goals yet — add one above.
        </div>
      ) : (
        <div className="pd-goals-list">
          {goals.map((g) => (
            <div key={g.id} className="pd-goal-row">
              <button
                className={`pd-goal-check pd-goal-check-${STATUS_COLOR[g.status] || "amber"}`}
                onClick={() => cycleStatus(g)}
                title={`Status: ${g.status} — click to advance`}
                type="button"
              >
                {g.status === "COMPLETED" && <RiCheckboxCircleLine size={18} />}
                {g.status === "IN_PROGRESS" && (
                  <RiLoader4Line size={18} className="spin" />
                )}
                {g.status === "PLANNED" && <RiFlagLine size={18} />}
                {g.status === "BLOCKED" && (
                  <span style={{ fontSize: 14 }}>⚠</span>
                )}
              </button>
              <div className="pd-goal-body">
                <span
                  className={`pd-goal-title ${g.status === "COMPLETED" ? "done" : ""}`}
                >
                  {g.title}
                </span>
                {g.target_metric && (
                  <span className="pd-goal-metric">{g.target_metric}</span>
                )}
              </div>
              <span
                className={`badge badge-${STATUS_COLOR[g.status] || "amber"}`}
              >
                {g.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GettingStarted({ id, goals, projectName, onGoalAdded }) {
  const gsKey = `aos_gs_${id}`;
  const launchKey = `aos_swarm_${id}`;
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(gsKey) === "1",
  );
  const [hasLaunched, setHasLaunched] = useState(
    () => localStorage.getItem(launchKey) === "1",
  );
  const [goalInput, setGoalInput] = useState("");
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const hasGoal = goals.length > 0;

  if (dismissed || (hasGoal && hasLaunched)) return null;

  async function addGoal(e) {
    e.preventDefault();
    const title = goalInput.trim();
    if (!title) return;
    setAdding(true);
    try {
      await projectsAPI.goals.create({
        project: id,
        title,
        status: "PLANNED",
        priority: 1,
      });
      setGoalInput("");
      onGoalAdded();
    } catch {
      // ignore inline errors silently
    } finally {
      setAdding(false);
    }
  }

  function launchSwarm() {
    const prompt = goals[0]?.title || projectName || "";
    localStorage.setItem(launchKey, "1");
    setHasLaunched(true);
    navigate(
      `/app/swarm?prompt=${encodeURIComponent(prompt)}&project_id=${id}`,
    );
  }

  function dismiss() {
    localStorage.setItem(gsKey, "1");
    setDismissed(true);
  }

  const steps = [
    {
      done: true,
      icon: <RiBriefcaseLine size={16} />,
      title: "Project created",
      desc: "Your operating workspace is live.",
      action: null,
    },
    {
      done: hasGoal,
      icon: <RiFlagLine size={16} />,
      title: "Add your first goal",
      desc: "Define what success looks like for this project.",
      action: !hasGoal ? (
        <form className="gs-goal-form" onSubmit={addGoal}>
          <input
            className="gs-goal-input"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. Reach 100 paying customers"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={adding || !goalInput.trim()}
          >
            {adding ? "…" : "Add"}
          </button>
        </form>
      ) : null,
    },
    {
      done: hasLaunched,
      icon: <RiRocketLine size={16} />,
      title: "Launch your first swarm",
      desc: "Tell your agents what to do — they handle the rest.",
      action: !hasLaunched ? (
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={launchSwarm}
          disabled={!hasGoal}
          title={!hasGoal ? "Add a goal first" : "Open swarm runner"}
        >
          <RiRocketLine size={13} /> Run Swarm →
        </button>
      ) : null,
    },
  ];

  return (
    <div className="card gs-card">
      <div className="gs-header">
        <span className="gs-title">Getting started</span>
        <button
          className="btn btn-ghost gs-dismiss"
          onClick={dismiss}
          type="button"
          title="Dismiss"
        >
          <RiCloseLine size={16} />
        </button>
      </div>
      <div className="gs-steps">
        {steps.map((step, i) => (
          <div key={i} className={`gs-step${step.done ? " gs-step-done" : ""}`}>
            <div className="gs-step-indicator">
              {step.done ? <RiCheckLine size={13} /> : <span>{i + 1}</span>}
            </div>
            <div className="gs-step-body">
              <div className="gs-step-head">
                {step.icon}
                <span className="gs-step-title">{step.title}</span>
              </div>
              <p className="gs-step-desc">{step.desc}</p>
              {step.action && (
                <div className="gs-step-action">{step.action}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub }) {
  return (
    <div className="card projects-kpi">
      <div className="projects-kpi-icon">{icon}</div>
      <div className="projects-kpi-label">{label}</div>
      <div className="projects-kpi-value">{value}</div>
      <div className="projects-kpi-sub">{sub}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="projects-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function List({ items, empty, renderItem }) {
  if (!items.length) return <div className="projects-empty">{empty}</div>;
  return (
    <div className="projects-list-stack">
      {items.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
    </div>
  );
}

function Row({ title, sub, badge }) {
  return (
    <div className="projects-row">
      <div>
        <div className="projects-row-title">{title}</div>
        <div className="projects-row-sub">{sub}</div>
      </div>
      <span className="badge badge-amber">{badge}</span>
    </div>
  );
}

function Timeline({ items }) {
  if (!items.length) {
    return (
      <div className="projects-empty">
        No project events yet. Runs, queue work, sales/support actions, and
        approvals will appear here.
      </div>
    );
  }

  return (
    <div className="projects-timeline">
      {items.map((item) => (
        <div className="projects-timeline-item" key={item.key}>
          <time>{formatWhen(item.time)}</time>
          <span
            className={`projects-timeline-dot projects-timeline-dot-${item.type}`}
          />
          <div className="projects-timeline-body">
            <span
              className={`projects-timeline-type projects-timeline-type-${item.type}`}
            >
              {item.label}
            </span>
            <strong>{item.title}</strong>
            <small>{item.sub}</small>
          </div>
          <span className="projects-timeline-status">{item.status}</span>
        </div>
      ))}
    </div>
  );
}

function ReadinessList({ title, items, empty, tone }) {
  return (
    <div className="projects-readiness-list">
      <div className="projects-readiness-list-title">{title}</div>
      {items.length ? (
        items.map((item) => (
          <div
            className={`projects-readiness-flag projects-readiness-flag-${tone}`}
            key={item}
          >
            {item}
          </div>
        ))
      ) : (
        <div className="projects-empty">{empty}</div>
      )}
    </div>
  );
}

function buildTimeline({
  activities,
  queue,
  leads,
  tickets,
  pendingActions,
  runs,
  workflowTasks,
  projectId,
}) {
  const events = [
    ...activities.map((activity) => ({
      key: `activity-${activity.id}`,
      type: "activity",
      label: "Activity",
      title: activity.summary || sentence(activity.kind) || "Project activity",
      sub: `${sentence(activity.kind) || "System"} - ${activity.actor_email || "system"}`,
      status: "Recorded",
      time: activity.created_at,
    })),
    ...queue.map((item) => ({
      key: `queue-${item.id}`,
      type: "queue",
      label: "Queue",
      title:
        `${sentence(item.kind) || "Queue item"} ${sentence(item.status) || ""}`.trim(),
      sub: queueSubject(item),
      status: sentence(item.status) || "Pending",
      time: item.updated_at || item.created_at,
    })),
    ...leads.map((lead) => ({
      key: `lead-${lead.id}`,
      type: "sales",
      label: "Sales",
      title: `Lead created: ${lead.name || lead.email || "Unnamed lead"}`,
      sub:
        [lead.company, lead.source || lead.email].filter(Boolean).join(" - ") ||
        "Sales intake",
      status: sentence(lead.status) || "Open",
      time: lead.created_at || lead.updated_at,
    })),
    ...tickets.map((ticket) => ({
      key: `ticket-${ticket.id}`,
      type: "support",
      label: "Support",
      title: `Ticket opened: ${ticket.subject || "Untitled ticket"}`,
      sub:
        ticket.requester_name ||
        ticket.requester_email ||
        ticket.email ||
        "Requester pending",
      status: sentence(ticket.status) || sentence(ticket.priority) || "Open",
      time: ticket.created_at || ticket.updated_at,
    })),
    ...pendingActions.map((action) => ({
      key: `approval-${action.id}`,
      type: "approval",
      label: "Approval",
      title: `${sentence(action.status) || "Pending"} approval: ${action.action_type || action.resource || action.agent_name || "Agent action"}`,
      sub:
        action.reason ||
        action.resource ||
        action.agent_name ||
        "Awaiting operator decision",
      status:
        sentence(action.risk_level || action.risk || action.status) || "Review",
      time: action.decided_at || action.created_at || action.updated_at,
    })),
    ...runs
      .filter((run) => belongsToProject(run, projectId))
      .map((run) => ({
        key: `run-${run.id}`,
        type: "run",
        label: "Run",
        title: `${sentence(run.status) || "Run"}: ${run.template_id || run.swarm_agent_name || "Swarm execution"}`,
        sub:
          run.task_summary ||
          durationCopy(run.duration_s) ||
          "Execution context captured",
        status: sentence(run.status) || "Run",
        time: run.started_at || run.completed_at,
      })),
    ...workflowTasks.map((task) => ({
      key: `task-${task.id}`,
      type: "run",
      label: "Task",
      title: `${sentence(task.status) || "Task"}: ${task.agent_name || task.task_type || "Agent task"}`,
      sub: task.description || task.result_summary || "Workflow task updated",
      status: sentence(task.status) || "Task",
      time: task.updated_at || task.created_at,
    })),
  ];

  return events
    .filter((event) => event.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 24);
}

function buildReadiness({
  agentsSummary,
  artifacts,
  connectors,
  financeBudget,
  goals,
  members,
  opsCounts,
  pendingActions,
  project,
  timelineItems,
}) {
  const missing = [];
  const risks = [];
  const connectorRows = connectorList(connectors);
  const hasConnectorGap = connectorRows.some(
    (connector) =>
      connector.status !== "connected" && connector.status !== "healthy",
  );
  const pendingApprovalCount = pendingActions.filter(
    (action) =>
      !action.status ||
      action.status === "PENDING" ||
      action.status === "ESCALATED",
  ).length;

  if (!agentsSummary.total)
    missing.push("No agents are configured for this project.");
  if (!agentsSummary.running)
    missing.push("No running agent is available to execute work.");
  if (!goals.length) missing.push("No project goals are defined.");
  if (!members.length) missing.push("No project members are assigned.");
  if (!artifacts.length) missing.push("No shipped artifacts are attached yet.");
  if (!opsCounts.leads && !opsCounts.open_tickets)
    missing.push("Sales and support loops have no active records.");
  if (hasConnectorGap)
    missing.push("One or more connector or fallback paths are missing.");

  if (financeBudget.over_limit) risks.push("Budget limit is already exceeded.");
  else if (financeBudget.over_alert)
    risks.push("Budget usage is near the alert threshold.");
  if ((opsCounts.queue_failed ?? 0) > 0)
    risks.push(
      `${opsCounts.queue_failed} queue item${opsCounts.queue_failed === 1 ? "" : "s"} failed.`,
    );
  if ((opsCounts.queue_due_now ?? 0) > 0)
    risks.push(
      `${opsCounts.queue_due_now} queue item${opsCounts.queue_due_now === 1 ? "" : "s"} due now.`,
    );
  if (pendingApprovalCount > 0)
    risks.push(
      `${pendingApprovalCount} approval${pendingApprovalCount === 1 ? "" : "s"} waiting for operator review.`,
    );
  if (!timelineItems.length) risks.push("No activity trail is available yet.");
  if (project?.status && project.status !== "ACTIVE")
    risks.push(`Project status is ${sentence(project.status)}.`);

  const score = clamp(100 - missing.length * 12 - risks.length * 10, 0, 100);
  const label =
    score >= 80 ? "Ready" : score >= 55 ? "Needs attention" : "Not ready";
  const tone = score >= 80 ? "green" : score >= 55 ? "amber" : "red";
  const summary =
    score >= 80
      ? "Autonomy signals are healthy enough for supervised operation."
      : score >= 55
        ? "Autonomy can run, but operators should resolve the visible gaps first."
        : "The project needs more setup before it can operate autonomously.";

  return { score, label, tone, summary, missing, risks };
}

function unpackList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

function connectorList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.entries(data).map(([name, value]) => {
    if (typeof value === "string") return { name, status: value.toLowerCase() };
    return {
      name,
      status: String(
        value?.status || value?.state || value?.configured || "missing",
      ).toLowerCase(),
    };
  });
}

function belongsToProject(item, projectId) {
  const value = item.project_id || item.project;
  return (
    value === undefined || value === null || String(value) === String(projectId)
  );
}

function queueSubject(item) {
  return (
    item.lead_name ||
    item.ticket_subject ||
    item.opportunity_title ||
    item.touchpoint_summary ||
    "Queued vendor sync"
  );
}

function durationCopy(value) {
  if (value === undefined || value === null || value === "") return "";
  const seconds = Number(value);
  return Number.isFinite(seconds) ? `${seconds.toFixed(1)}s duration` : "";
}

function sentence(value) {
  if (!value) return "";
  return String(value)
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatWhen(value) {
  if (!value) return "No time";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
