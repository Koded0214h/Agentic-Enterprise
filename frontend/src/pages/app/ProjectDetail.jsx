import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiBriefcaseLine,
  RiCheckLine,
  RiCloseLine,
  RiCpuLine,
  RiFlagLine,
  RiMoneyDollarCircleLine,
  RiRocketLine,
  RiRobot2Line,
  RiSettings3Line,
  RiShieldCheckLine,
  RiTimeLine,
} from 'react-icons/ri'
import { projects as projectsAPI } from '../../api/projects'
import { ops } from '../../api/ops'
import { finance } from '../../api/finance'
import { agents as agentsAPI } from '../../api/agents'
import './Projects.css'

export default function ProjectDetail() {
  const { id } = useParams()
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
    navigate(`/app/swarm?prompt=${encodeURIComponent(prompt)}`)
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
