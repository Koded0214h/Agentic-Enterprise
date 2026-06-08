import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
} from 'react-icons/ri'
import { projects as projectsAPI } from '../../api/projects'
import { swarm as swarmAPI } from '../../api/swarm'
import { ops } from '../../api/ops'
import { finance } from '../../api/finance'
import { agents as agentsAPI } from '../../api/agents'
import './Projects.css'

export default function ProjectDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('overview')
  const [detail, setDetail] = useState(null)
  const [opsSummary, setOpsSummary] = useState(null)
  const [financeSummary, setFinanceSummary] = useState(null)
  const [agentsSummary, setAgentsSummary] = useState({ total: 0, running: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function loadProject() {
    if (!detail) setLoading(true)
    setError('')
    try {
      const [projectData, opsData, financeData, agentData] = await Promise.all([
        projectsAPI.overview(id),
        ops.overview({ project_id: id }),
        finance.summary({ project_id: id }),
        agentsAPI.list(),
      ])
      const agents = Array.isArray(agentData) ? agentData : (agentData.results || [])
      setDetail(projectData)
      setOpsSummary(opsData)
      setFinanceSummary(financeData)
      setAgentsSummary({
        total: agents.length,
        running: agents.filter((agent) => agent.status === 'RUNNING').length,
      })
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const project = detail?.project
  const members = detail?.members || []
  const activities = detail?.activities || []
  const goals = detail?.goals || []
  const artifacts = detail?.artifacts || []
  const opsCounts = opsSummary?.counts || {}
  const financeUsage = financeSummary?.usage_summary || {}
  const financeBudget = financeSummary?.budget_summary || {}

  if (loading) {
    return <div className="projects-page"><div className="card projects-empty-state">Loading project...</div></div>
  }

  if (error || !project) {
    return (
      <div className="projects-page">
        <Link className="projects-back-link" to="/app/projects"><RiArrowLeftLine size={15} /> Projects</Link>
        <div className="projects-error">{error || 'Project not found'}</div>
      </div>
    )
  }

  return (
    <div className="projects-page">
      <div className="projects-detail-top">
        <Link className="projects-back-link" to="/app/projects"><RiArrowLeftLine size={15} /> Projects</Link>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
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
          <p>{project.description || project.vision || 'No description yet.'}</p>
        </div>
        <div className="projects-hero-side">
          <div className="projects-budget">
            <span>Monthly budget</span>
            <strong>{project.currency} {project.monthly_budget}</strong>
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
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'runs'     ? 'active' : ''} onClick={() => setTab('runs')}>
          Runs
        </button>
        <button className={tab === 'goals'    ? 'active' : ''} onClick={() => setTab('goals')}>
          Goals <span className="pd-tab-count">{goals.length}</span>
        </button>
      </div>

      {tab === 'overview' && (<>
      <div className="projects-kpis">
        <Kpi icon={<RiMoneyDollarCircleLine size={18} />} label="Usage cost" value={Number(financeUsage.total_cost || 0).toFixed(2)} sub={`${financeUsage.record_count || 0} usage records`} />
        <Kpi icon={<RiCpuLine size={18} />} label="Budget spend" value={Number(financeBudget.current_spend || 0).toFixed(2)} sub={`${financeBudget.percent_used ?? 0}% used`} />
        <Kpi icon={<RiRobot2Line size={18} />} label="Agents" value={agentsSummary.total} sub={`${agentsSummary.running} running`} />
        <Kpi icon={<RiShieldCheckLine size={18} />} label="Queue" value={opsCounts.queue_pending ?? 0} sub={`${opsCounts.queue_due_now ?? 0} due now`} />
      </div>

      <div className="projects-detail-grid">
        <section className="card projects-panel">
          <div className="projects-panel-head">
            <span>Operating snapshot</span>
            <span className={`badge badge-${financeBudget.over_limit ? 'red' : financeBudget.over_alert ? 'amber' : 'green'}`}>
              {financeBudget.over_limit ? 'Over budget' : financeBudget.over_alert ? 'Near limit' : 'Within budget'}
            </span>
          </div>
          <div className="projects-snapshot-grid">
            <Metric label="Members" value={members.length} />
            <Metric label="Goals" value={goals.length} />
            <Metric label="Artifacts" value={artifacts.length} />
            <Metric label="Ops leads" value={opsCounts.leads ?? 0} />
            <Metric label="Open tickets" value={opsCounts.open_tickets ?? 0} />
            <Metric label="Failed queue" value={opsCounts.queue_failed ?? 0} />
          </div>
        </section>

        <section className="card projects-panel">
          <div className="projects-panel-head">
            <span>Goals</span>
            <span className="badge badge-amber">{goals.length}</span>
          </div>
          <List items={goals} empty="No goals yet." renderItem={(goal) => (
            <Row title={goal.title} sub={`${goal.status} - ${goal.target_metric || 'metric pending'}`} badge={goal.priority} />
          )} />
        </section>

        <section className="card projects-panel">
          <div className="projects-panel-head">
            <span>Recent activity</span>
            <span className="badge badge-green">{activities.length}</span>
          </div>
          <List items={activities} empty="No activity yet." renderItem={(activity) => (
            <Row title={activity.summary} sub={`${activity.kind} - ${activity.actor_email || 'system'}`} badge={new Date(activity.created_at).toLocaleDateString()} />
          )} />
        </section>

        <section className="card projects-panel">
          <div className="projects-panel-head">
            <span>People and artifacts</span>
            <span className="badge badge-amber">{artifacts.length} artifacts</span>
          </div>
          <List items={members} empty="No members linked yet." renderItem={(member) => (
            <Row title={member.user_name || member.user_email} sub={member.role} badge={member.user_email || 'member'} />
          )} />
          <List items={artifacts} empty="Artifacts will appear here as work ships." renderItem={(artifact) => (
            <Row title={artifact.name} sub={`${artifact.kind} - ${artifact.path || 'inline'}`} badge={artifact.kind} />
          )} />
        </section>
      </div>
      </>)}

      {tab === 'runs' && <RunsTab projectId={id} />}
      {tab === 'goals' && <GoalsTab projectId={id} goals={goals} onRefresh={loadProject} />}
    </div>
  )
}

// ─── Runs tab ─────────────────────────────────────────────────────────────────
function RunsTab({ projectId }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    swarmAPI.list(projectId)
      .then(d => setRuns(Array.isArray(d) ? d : (d.results || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId])

  // Auto-refresh while any run is still running
  useEffect(() => {
    const hasLive = runs.some(r => r.status === 'running')
    if (!hasLive) return
    const t = setInterval(() => {
      swarmAPI.list(projectId)
        .then(d => setRuns(Array.isArray(d) ? d : (d.results || [])))
        .catch(() => {})
    }, 3000)
    return () => clearInterval(t)
  }, [runs, projectId])

  if (loading) return <div className="projects-empty" style={{ padding: 24 }}>Loading runs…</div>
  if (!runs.length) return (
    <div className="projects-empty-page" style={{ padding: '60px 24px' }}>
      <div className="projects-empty-page-icon"><RiRocketLine size={28} /></div>
      <h2>No runs yet</h2>
      <p>Launch a swarm from the Getting Started panel or the Run Swarm button in the top bar.</p>
    </div>
  )

  return (
    <div className="pd-runs">
      {runs.map(run => {
        const isLive    = run.status === 'running'
        const isOk      = run.status === 'completed'
        const isFail    = run.status === 'failed'
        const dur = run.duration_s != null
          ? `${Math.floor(run.duration_s / 60)}m ${run.duration_s % 60}s`
          : null

        return (
          <div key={run.id} className={`pd-run-row ${isLive ? 'live' : ''}`}>
            <div className="pd-run-status">
              {isLive  && <RiLoader4Line size={14} className="spin" style={{ color: 'var(--accent)' }} />}
              {isOk    && <RiCheckLine size={14} style={{ color: 'var(--green)' }} />}
              {isFail  && <span style={{ color: 'var(--red)', fontSize: 13, fontWeight: 700 }}>✕</span>}
              {!isLive && !isOk && !isFail && <span className="dot dot-amber" />}
            </div>
            <div className="pd-run-body">
              <div className="pd-run-goal">{run.task_summary || 'Untitled run'}</div>
              <div className="pd-run-meta">
                <span className={`badge badge-${isLive ? 'amber' : isOk ? 'green' : isFail ? 'red' : 'amber'}`}>
                  {run.status}
                </span>
                {run.swarm_agent_name && <span className="pd-run-agent">{run.swarm_agent_name}</span>}
                {run.started_at && <span>{new Date(run.started_at).toLocaleString()}</span>}
                {dur && <span>{dur}</span>}
              </div>
            </div>
            <Link to={`/app/swarm/${run.id}`} className="btn btn-ghost btn-sm pd-run-link">
              {isLive ? 'Watch live →' : 'View →'}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

// ─── Goals tab ────────────────────────────────────────────────────────────────
const STATUS_CYCLE = { PLANNED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: 'PLANNED', BLOCKED: 'PLANNED', CANCELLED: 'PLANNED' }
const STATUS_COLOR = { PLANNED: 'amber', IN_PROGRESS: 'green', COMPLETED: 'green', BLOCKED: 'red', CANCELLED: 'amber' }

function GoalsTab({ projectId, goals: initialGoals, onRefresh }) {
  const [goals, setGoals] = useState(initialGoals)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { setGoals(initialGoals) }, [initialGoals])

  async function addGoal(e) {
    e.preventDefault()
    const title = input.trim()
    if (!title) return
    setAdding(true)
    try {
      const g = await projectsAPI.goals.create({ project: projectId, title, status: 'PLANNED', priority: 1 })
      setGoals(prev => [g, ...prev])
      setInput('')
      onRefresh()
    } catch {} finally { setAdding(false) }
  }

  async function cycleStatus(goal) {
    const next = STATUS_CYCLE[goal.status] || 'PLANNED'
    try {
      await projectsAPI.goals.update(goal.id, { status: next })
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: next } : g))
    } catch {}
  }

  return (
    <div className="pd-goals">
      <form className="pd-goals-form" onSubmit={addGoal}>
        <input
          className="projects-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a goal — e.g. Reach 100 paying customers"
        />
        <button type="submit" className="btn btn-primary" disabled={adding || !input.trim()}>
          <RiAddLine size={14} /> {adding ? 'Adding…' : 'Add goal'}
        </button>
      </form>

      {goals.length === 0 ? (
        <div className="projects-empty" style={{ padding: '40px 0', textAlign: 'center' }}>No goals yet — add one above.</div>
      ) : (
        <div className="pd-goals-list">
          {goals.map(g => (
            <div key={g.id} className="pd-goal-row">
              <button
                className={`pd-goal-check pd-goal-check-${STATUS_COLOR[g.status] || 'amber'}`}
                onClick={() => cycleStatus(g)}
                title={`Status: ${g.status} — click to advance`}
                type="button"
              >
                {g.status === 'COMPLETED' && <RiCheckboxCircleLine size={18} />}
                {g.status === 'IN_PROGRESS' && <RiLoader4Line size={18} className="spin" />}
                {g.status === 'PLANNED' && <RiFlagLine size={18} />}
                {g.status === 'BLOCKED' && <span style={{ fontSize: 14 }}>⚠</span>}
              </button>
              <div className="pd-goal-body">
                <span className={`pd-goal-title ${g.status === 'COMPLETED' ? 'done' : ''}`}>{g.title}</span>
                {g.target_metric && <span className="pd-goal-metric">{g.target_metric}</span>}
              </div>
              <span className={`badge badge-${STATUS_COLOR[g.status] || 'amber'}`}>{g.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GettingStarted({ id, goals, projectName, onGoalAdded }) {
  const gsKey     = `aos_gs_${id}`
  const launchKey = `aos_swarm_${id}`
  const [dismissed,   setDismissed]   = useState(() => localStorage.getItem(gsKey) === '1')
  const [hasLaunched, setHasLaunched] = useState(() => localStorage.getItem(launchKey) === '1')
  const [goalInput, setGoalInput] = useState('')
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()

  const hasGoal = goals.length > 0

  if (dismissed || (hasGoal && hasLaunched)) return null

  async function addGoal(e) {
    e.preventDefault()
    const title = goalInput.trim()
    if (!title) return
    setAdding(true)
    try {
      await projectsAPI.goals.create({ project: id, title, status: 'PLANNED', priority: 1 })
      setGoalInput('')
      onGoalAdded()
    } catch {
      // ignore inline errors silently
    } finally {
      setAdding(false)
    }
  }

  function launchSwarm() {
    const prompt = goals[0]?.title || projectName || ''
    localStorage.setItem(launchKey, '1')
    setHasLaunched(true)
    navigate(`/app/swarm?prompt=${encodeURIComponent(prompt)}&project_id=${id}`)
  }

  function dismiss() {
    localStorage.setItem(gsKey, '1')
    setDismissed(true)
  }

  const steps = [
    {
      done: true,
      icon: <RiBriefcaseLine size={16} />,
      title: 'Project created',
      desc: 'Your operating workspace is live.',
      action: null,
    },
    {
      done: hasGoal,
      icon: <RiFlagLine size={16} />,
      title: 'Add your first goal',
      desc: 'Define what success looks like for this project.',
      action: !hasGoal ? (
        <form className="gs-goal-form" onSubmit={addGoal}>
          <input
            className="gs-goal-input"
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            placeholder="e.g. Reach 100 paying customers"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={adding || !goalInput.trim()}>
            {adding ? '…' : 'Add'}
          </button>
        </form>
      ) : null,
    },
    {
      done: hasLaunched,
      icon: <RiRocketLine size={16} />,
      title: 'Launch your first swarm',
      desc: 'Tell your agents what to do — they handle the rest.',
      action: !hasLaunched ? (
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={launchSwarm}
          disabled={!hasGoal}
          title={!hasGoal ? 'Add a goal first' : 'Open swarm runner'}
        >
          <RiRocketLine size={13} /> Run Swarm →
        </button>
      ) : null,
    },
  ]

  return (
    <div className="card gs-card">
      <div className="gs-header">
        <span className="gs-title">Getting started</span>
        <button className="btn btn-ghost gs-dismiss" onClick={dismiss} type="button" title="Dismiss">
          <RiCloseLine size={16} />
        </button>
      </div>
      <div className="gs-steps">
        {steps.map((step, i) => (
          <div key={i} className={`gs-step${step.done ? ' gs-step-done' : ''}`}>
            <div className="gs-step-indicator">
              {step.done ? <RiCheckLine size={13} /> : <span>{i + 1}</span>}
            </div>
            <div className="gs-step-body">
              <div className="gs-step-head">
                {step.icon}
                <span className="gs-step-title">{step.title}</span>
              </div>
              <p className="gs-step-desc">{step.desc}</p>
              {step.action && <div className="gs-step-action">{step.action}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Kpi({ icon, label, value, sub }) {
  return (
    <div className="card projects-kpi">
      <div className="projects-kpi-icon">{icon}</div>
      <div className="projects-kpi-label">{label}</div>
      <div className="projects-kpi-value">{value}</div>
      <div className="projects-kpi-sub">{sub}</div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="projects-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function List({ items, empty, renderItem }) {
  if (!items.length) return <div className="projects-empty">{empty}</div>
  return <div className="projects-list-stack">{items.map((item) => <div key={item.id}>{renderItem(item)}</div>)}</div>
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
  )
}
