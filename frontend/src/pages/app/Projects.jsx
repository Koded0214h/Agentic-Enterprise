import { useEffect, useState } from 'react'
import {
  RiBriefcaseLine,
  RiAddLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiTimerLine,
  RiTeamLine,
} from 'react-icons/ri'
import { projects as projectsAPI } from '../../api/projects'
import { ops } from '../../api/ops'
import { finance } from '../../api/finance'
import './Projects.css'

const EMPTY_PROJECT = {
  name: '',
  slug: '',
  description: '',
  vision: '',
  target_market: '',
  stage: 'IDEA',
  status: 'ACTIVE',
  operating_mode: 'standard',
  monthly_budget: '1000.00',
  currency: 'USD',
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function Projects() {
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selected, setSelected] = useState(null)
  const [opsSummary, setOpsSummary] = useState(null)
  const [financeSummary, setFinanceSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [slugEdited, setSlugEdited] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [activityBody, setActivityBody] = useState('')
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    priority: 0,
    status: 'PLANNED',
    target_metric: '',
    target_value: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedId) {
      loadProjectDetail(selectedId)
    }
  }, [selectedId])

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const data = await projectsAPI.list()
      const rows = Array.isArray(data) ? data : (data.results || [])
      setItems(rows)
      if (!selectedId && rows.length) {
        setSelectedId(rows[0].id)
      }
      if (!rows.length) {
        setSelected(null)
        setOpsSummary(null)
        setFinanceSummary(null)
      }
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function loadProjectDetail(id) {
    setDetailLoading(true)
    setError('')
    try {
      const [detail, opsData, financeData] = await Promise.all([
        projectsAPI.overview(id),
        ops.overview({ project_id: id }),
        finance.summary({ project_id: id }),
      ])
      setSelected(detail)
      setOpsSummary(opsData)
      setFinanceSummary(financeData)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load project detail')
    } finally {
      setDetailLoading(false)
    }
  }

  async function createProject(e) {
    e.preventDefault()
    const name = form.name.trim()
    const slug = slugify(form.slug || name)
    if (!name) {
      setError('Project name is required')
      return
    }
    if (!slug) {
      setError('Project slug is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const created = await projectsAPI.create({
        ...form,
        name,
        slug,
      })
      const item = created?.id ? created : created?.project || created
      setForm(EMPTY_PROJECT)
      setSlugEdited(false)
      setShowCreate(false)
      setActiveTab('overview')
      await loadProjects()
      if (item?.id) {
        setSelectedId(item.id)
      }
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  async function archiveProject() {
    if (!selectedId) return
    setSaving(true)
    setError('')
    try {
      await projectsAPI.archive(selectedId)
      await loadProjects()
      await loadProjectDetail(selectedId)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to archive project')
    } finally {
      setSaving(false)
    }
  }

  async function addActivity(e) {
    e.preventDefault()
    if (!selectedId || !activityBody.trim()) return
    setSaving(true)
    setError('')
    try {
      await projectsAPI.activity(selectedId, {
        kind: 'note',
        summary: activityBody.slice(0, 80),
        body: activityBody,
      })
      setActivityBody('')
      await loadProjectDetail(selectedId)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to add activity')
    } finally {
      setSaving(false)
    }
  }

  async function addGoal(e) {
    e.preventDefault()
    if (!selectedId || !goalForm.title.trim()) return
    setSaving(true)
    setError('')
    try {
      await projectsAPI.goals.create({
        ...goalForm,
        project: selectedId,
      })
      setGoalForm({
        title: '',
        description: '',
        priority: 0,
        status: 'PLANNED',
        target_metric: '',
        target_value: '',
      })
      await loadProjectDetail(selectedId)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to add goal')
    } finally {
      setSaving(false)
    }
  }

  const overview = selected?.project || items.find((p) => p.id === selectedId) || null
  const members = selected?.members || []
  const activities = selected?.activities || []
  const goals = selected?.goals || []
  const artifacts = selected?.artifacts || []
  const projectCount = items.length
  const activeCount = items.filter((p) => p.status === 'ACTIVE').length

  const opsCounts = opsSummary?.counts || {}
  const financeUsage = financeSummary?.usage_summary || {}
  const financeBudget = financeSummary?.budget_summary || {}

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Projects</h1>
          <p>Each project is a startup boundary with its own goals, ops, finance, and execution state.</p>
        </div>
        <div className="projects-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate((v) => !v)} disabled={saving}>
            <RiAddLine size={15} />
            {showCreate ? 'Close form' : 'New project'}
          </button>
          <button className="btn btn-ghost" onClick={loadProjects} disabled={loading || detailLoading || saving}>
            <RiRefreshLine size={15} />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="projects-error">{error}</div>}

      <div className="projects-kpis">
        <Kpi icon={<RiBriefcaseLine size={18} />} label="Projects" value={projectCount} sub={`${activeCount} active`} />
        <Kpi icon={<RiTeamLine size={18} />} label="Members" value={members.length || 0} sub="project membership" />
        <Kpi icon={<RiTimerLine size={18} />} label="Goals" value={goals.length || 0} sub="planned execution" />
        <Kpi icon={<RiCheckboxCircleLine size={18} />} label="Queue" value={opsCounts.queue_pending ?? 0} sub={`${opsCounts.queue_due_now ?? 0} due now`} />
      </div>

      {showCreate && (
        <form className="card projects-panel projects-form" onSubmit={createProject}>
          <div className="projects-panel-head">
            <span>Create project</span>
            <span className="badge badge-green">Startup boundary</span>
          </div>
          <div className="projects-fields">
            <Field
              label="Name"
              value={form.name}
              required
              onChange={(v) => setForm((p) => ({
                ...p,
                name: v,
                slug: slugEdited ? p.slug : slugify(v),
              }))}
            />
            <Field
              label="Slug"
              value={form.slug}
              required
              onChange={(v) => {
                setSlugEdited(true)
                setForm((p) => ({ ...p, slug: slugify(v) }))
              }}
            />
            <Field label="Target market" value={form.target_market} onChange={(v) => setForm((p) => ({ ...p, target_market: v }))} />
            <Field label="Stage" value={form.stage} onChange={(v) => setForm((p) => ({ ...p, stage: v }))} />
            <Field label="Budget" value={form.monthly_budget} onChange={(v) => setForm((p) => ({ ...p, monthly_budget: v }))} />
            <Field label="Operating mode" value={form.operating_mode} onChange={(v) => setForm((p) => ({ ...p, operating_mode: v }))} />
            <Field label="Vision" value={form.vision} onChange={(v) => setForm((p) => ({ ...p, vision: v }))} multiline />
            <Field label="Description" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} multiline />
          </div>
          <button className="btn btn-primary" disabled={saving || loading}>
            <RiAddLine size={15} />
            Create project
          </button>
        </form>
      )}

      <div className="projects-workspace">
        <div className="card projects-panel projects-list-panel">
          <div className="projects-panel-head">
            <span>Project list</span>
            <span className="badge badge-amber">{items.length}</span>
          </div>
          <div className="projects-list">
            {loading ? (
              <div className="projects-empty">Loading projects…</div>
            ) : items.length ? (
              items.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`projects-list-item ${selectedId === project.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedId(project.id)
                    setActiveTab('overview')
                  }}
                >
                  <div className="projects-list-main">
                    <div className="projects-list-title">{project.name}</div>
                    <div className="projects-list-sub">
                      {project.stage} · {project.status} · {project.slug}
                    </div>
                  </div>
                  <div className="projects-list-meta">
                    <span className="badge badge-green">{project.activity_count ?? 0} act</span>
                    <span className="badge badge-amber">{project.goal_count ?? 0} goals</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="projects-empty">No projects yet. Create the first startup boundary to begin.</div>
            )}
          </div>
        </div>

        <div className="projects-detail-shell">
          {overview ? (
            <>
              <div className="projects-hero card">
            <div className="projects-hero-main">
              <div className="projects-badge-row">
                <span className="badge badge-green">{overview.status}</span>
                <span className="badge badge-amber">{overview.stage}</span>
                <span className="badge badge-green">{overview.operating_mode}</span>
              </div>
              <h2>{overview.name}</h2>
              <p>{overview.description || overview.vision || 'No description yet.'}</p>
            </div>
            <div className="projects-hero-side">
              <div className="projects-budget">
                <span>Monthly budget</span>
                <strong>{overview.currency} {overview.monthly_budget}</strong>
              </div>
              <button className="btn btn-ghost" onClick={archiveProject} disabled={saving}>
                Archive project
              </button>
            </div>
          </div>

              <div className="projects-tabs" role="tablist" aria-label="Project sections">
                <Tab id="overview" label="Overview" active={activeTab} onClick={setActiveTab} />
                <Tab id="goals" label={`Goals ${goals.length}`} active={activeTab} onClick={setActiveTab} />
                <Tab id="activity" label={`Activity ${activities.length}`} active={activeTab} onClick={setActiveTab} />
                <Tab id="people" label="People & artifacts" active={activeTab} onClick={setActiveTab} />
              </div>

              {activeTab === 'overview' && (
                <>
                  <div className="projects-metrics">
                    <Metric label="Members" value={members.length} />
                    <Metric label="Activities" value={activities.length} />
                    <Metric label="Goals" value={goals.length} />
                    <Metric label="Artifacts" value={artifacts.length} />
                    <Metric label="Ops leads" value={opsCounts.leads ?? 0} />
                    <Metric label="Open tickets" value={opsCounts.open_tickets ?? 0} />
                  </div>

                  <div className="projects-loop card">
            <div className="projects-panel-head">
              <span>Project loop health</span>
              <span className={`badge badge-${(financeBudget.over_limit || 0) ? 'red' : (financeBudget.over_alert ? 'amber' : 'green')}`}>
                {financeBudget.over_limit ? 'Over budget' : financeBudget.over_alert ? 'Near limit' : 'Within budget'}
              </span>
            </div>
            <div className="projects-loop-grid">
              <div className="projects-loop-box">
                <span>Usage cost</span>
                <strong>{Number(financeUsage.total_cost || 0).toFixed(4)}</strong>
                <small>{financeUsage.record_count || 0} usage records</small>
              </div>
              <div className="projects-loop-box">
                <span>Budget spend</span>
                <strong>{Number(financeBudget.current_spend || 0).toFixed(2)}</strong>
                <small>{financeBudget.percent_used ?? 0}% used</small>
              </div>
              <div className="projects-loop-box">
                <span>Queue status</span>
                <strong>{opsCounts.queue_pending ?? 0}</strong>
                <small>{opsCounts.queue_due_now ?? 0} due now</small>
              </div>
              <div className="projects-loop-box">
                <span>Open tickets</span>
                <strong>{opsCounts.open_tickets ?? 0}</strong>
                <small>{opsCounts.queue_failed ?? 0} failed queue items</small>
              </div>
            </div>
          </div>
                </>
              )}

              {activeTab === 'goals' && (
                <div className="card projects-panel">
              <div className="projects-panel-head">
                <span>Goals</span>
                <span className="badge badge-amber">{goals.length}</span>
              </div>
              <form className="projects-inline-form" onSubmit={addGoal}>
                <Field label="Goal title" value={goalForm.title} onChange={(v) => setGoalForm((p) => ({ ...p, title: v }))} />
                <Field label="Priority" value={goalForm.priority} onChange={(v) => setGoalForm((p) => ({ ...p, priority: v }))} />
                <Field label="Metric" value={goalForm.target_metric} onChange={(v) => setGoalForm((p) => ({ ...p, target_metric: v }))} />
                <Field label="Target value" value={goalForm.target_value} onChange={(v) => setGoalForm((p) => ({ ...p, target_value: v }))} />
                <Field label="Description" value={goalForm.description} onChange={(v) => setGoalForm((p) => ({ ...p, description: v }))} multiline />
                <button className="btn btn-primary" disabled={saving}>
                  <RiAddLine size={15} />
                  Add goal
                </button>
              </form>
              <div className="projects-list-stack">
                {goals.length ? goals.map((goal) => (
                  <div key={goal.id} className="projects-row">
                    <div>
                      <div className="projects-row-title">{goal.title}</div>
                      <div className="projects-row-sub">{goal.status} · {goal.target_metric || 'metric pending'}</div>
                    </div>
                    <span className="badge badge-green">{goal.priority}</span>
                  </div>
                )) : <div className="projects-empty">No goals yet.</div>}
              </div>
            </div>
              )}

              {activeTab === 'activity' && (
                <div className="card projects-panel">
              <div className="projects-panel-head">
                <span>Activities</span>
                <span className="badge badge-green">{activities.length}</span>
              </div>
              <form className="projects-inline-form" onSubmit={addActivity}>
                <Field label="Activity note" value={activityBody} onChange={setActivityBody} multiline />
                <button className="btn btn-primary" disabled={saving || !activityBody.trim()}>
                  <RiAddLine size={15} />
                  Log activity
                </button>
              </form>
              <div className="projects-list-stack">
                {activities.length ? activities.map((activity) => (
                  <div key={activity.id} className="projects-row">
                    <div>
                      <div className="projects-row-title">{activity.summary}</div>
                      <div className="projects-row-sub">{activity.kind} · {activity.actor_email || 'system'}</div>
                    </div>
                    <span className="badge badge-amber">{new Date(activity.created_at).toLocaleDateString()}</span>
                  </div>
                )) : <div className="projects-empty">No activity yet.</div>}
              </div>
            </div>
              )}

              {activeTab === 'people' && (
                <div className="projects-content-grid">
                  <div className="card projects-panel">
              <div className="projects-panel-head">
                <span>Members</span>
                <span className="badge badge-green">{members.length}</span>
              </div>
              <div className="projects-list-stack">
                {members.length ? members.map((member) => (
                  <div key={member.id} className="projects-row">
                    <div>
                      <div className="projects-row-title">{member.user_name || member.user_email}</div>
                      <div className="projects-row-sub">{member.role}</div>
                    </div>
                    <span className="badge badge-amber">{member.user_email || 'member'}</span>
                  </div>
                )) : <div className="projects-empty">No members linked yet.</div>}
              </div>
            </div>

                  <div className="card projects-panel">
              <div className="projects-panel-head">
                <span>Artifacts</span>
                <span className="badge badge-amber">{artifacts.length}</span>
              </div>
              <div className="projects-list-stack">
                {artifacts.length ? artifacts.map((artifact) => (
                  <div key={artifact.id} className="projects-row">
                    <div>
                      <div className="projects-row-title">{artifact.name}</div>
                      <div className="projects-row-sub">{artifact.kind} · {artifact.path || 'inline'}</div>
                    </div>
                    <span className="badge badge-green">{artifact.kind}</span>
                  </div>
                )) : <div className="projects-empty">Artifacts will land here as the startup ships.</div>}
              </div>
            </div>
                </div>
              )}
            </>
          ) : (
            <div className="card projects-empty-state">
              <h2>No project selected</h2>
              <p>Create or select a project to see its goals, activity, operations, and artifacts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Tab({ id, label, active, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active === id}
      className={`projects-tab ${active === id ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      {label}
    </button>
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
    <div className="projects-metric card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Field({ label, value, onChange, multiline = false, required = false }) {
  return (
    <label className="projects-field">
      <span>{label}</span>
      {multiline ? (
        <textarea className="projects-input" value={value} onChange={(e) => onChange(e.target.value)} rows={4} required={required} />
      ) : (
        <input className="projects-input" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </label>
  )
}
