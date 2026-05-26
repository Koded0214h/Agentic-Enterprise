import { useEffect, useMemo, useState } from 'react'
import {
  RiBriefcaseLine,
  RiCustomerService2Line,
  RiRefreshLine,
  RiAddLine,
  RiCheckboxCircleLine,
  RiTimerLine,
} from 'react-icons/ri'
import { ops } from '../../api/ops'
import { projects as projectsAPI } from '../../api/projects'
import './Ops.css'

const INITIAL_LEAD = {
  name: '',
  email: '',
  company: '',
  source: 'inbound',
}

const INITIAL_TICKET = {
  requester_name: '',
  requester_email: '',
  subject: '',
  body: '',
  priority: 'NORMAL',
}

export default function Ops() {
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [data, setData] = useState(null)
  const [connectors, setConnectors] = useState(null)
  const [loading, setLoading] = useState(true)
  const [leadForm, setLeadForm] = useState(INITIAL_LEAD)
  const [ticketForm, setTicketForm] = useState(INITIAL_TICKET)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      reload(selectedProjectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId])

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const [projectData, connectorInfo] = await Promise.all([
        projectsAPI.list(),
        ops.connectors(),
      ])
      const rows = Array.isArray(projectData) ? projectData : (projectData.results || [])
      setProjects(rows)
      setConnectors(connectorInfo)
      setSelectedProjectId((current) => current || rows[0]?.id || '')
      if (!rows.length) {
        setData(null)
      }
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load ops data')
    } finally {
      setLoading(false)
    }
  }

  async function reload(projectId = selectedProjectId) {
    if (!projectId) return
    setLoading(true)
    setError('')
    try {
      const [overview, connectorInfo] = await Promise.all([
        ops.overview({ project_id: projectId }),
        ops.connectors(),
      ])
      setData(overview)
      setConnectors(connectorInfo)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load ops data')
    } finally {
      setLoading(false)
    }
  }

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null
  const counts = data?.counts || {}
  const providers = data?.providers || {}
  const recentLeads = data?.recent?.leads || []
  const recentTickets = data?.recent?.tickets || []
  const recentQueue = data?.recent?.queue || []

  const queueBadge = useMemo(() => {
    const pending = counts.queue_pending || 0
    if (pending >= 10) return 'red'
    if (pending >= 1) return 'amber'
    return 'green'
  }, [counts.queue_pending])

  async function submitLead(e) {
    e.preventDefault()
    if (!selectedProjectId) {
      setError('Select a project before creating a lead')
      return
    }
    setBusy(true)
    setError('')
    try {
      await ops.leads.create({ ...leadForm, project_id: selectedProjectId })
      setLeadForm(INITIAL_LEAD)
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to create lead')
    } finally {
      setBusy(false)
    }
  }

  async function submitTicket(e) {
    e.preventDefault()
    if (!selectedProjectId) {
      setError('Select a project before creating a ticket')
      return
    }
    setBusy(true)
    setError('')
    try {
      await ops.tickets.create({ ...ticketForm, project_id: selectedProjectId })
      setTicketForm(INITIAL_TICKET)
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to create ticket')
    } finally {
      setBusy(false)
    }
  }

  async function processQueue() {
    if (!selectedProjectId) {
      setError('Select a project before processing queue work')
      return
    }
    setBusy(true)
    setError('')
    try {
      await ops.queue.process(25, { project_id: selectedProjectId })
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to process queue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ops-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Ops</h1>
          <p>Sales, support, queueing, and vendor fallback for the selected project</p>
        </div>
        <div className="ops-header-actions">
          <label className="ops-project-select">
            <span>Project</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={loading || busy || !projects.length}
            >
              {projects.length ? projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              )) : (
                <option value="">No projects</option>
              )}
            </select>
          </label>
          <button className="btn btn-ghost" onClick={() => reload()} disabled={loading || busy || !selectedProjectId}>
            <RiRefreshLine size={15} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={processQueue} disabled={loading || busy || !selectedProjectId}>
            <RiAddLine size={15} />
            Process queue
          </button>
        </div>
      </div>

      {error && <div className="ops-error">{error}</div>}

      {selectedProject ? (
        <div className="card ops-project-context">
          <div>
            <span className="ops-context-label">Selected project</span>
            <strong>{selectedProject.name}</strong>
            <p>{selectedProject.description || selectedProject.vision || 'No project description yet.'}</p>
          </div>
          <div className="ops-context-meta">
            <span className="badge badge-green">{selectedProject.status}</span>
            <span className="badge badge-amber">{selectedProject.stage}</span>
            <span className="badge badge-green">{selectedProject.slug}</span>
          </div>
        </div>
      ) : (
        <div className="card ops-project-context ops-project-empty">
          Create a project first, then return here to run sales, support, and queue operations inside that boundary.
        </div>
      )}

      <div className="ops-kpis">
        <Kpi icon={<RiBriefcaseLine size={18} />} label="Leads" value={counts.leads ?? '—'} sub={`${counts.open_opportunities ?? 0} open opportunities`} />
        <Kpi icon={<RiCustomerService2Line size={18} />} label="Tickets" value={counts.tickets ?? '—'} sub={`${counts.open_tickets ?? 0} open tickets`} />
        <Kpi icon={<RiTimerLine size={18} />} label="Queue pending" value={counts.queue_pending ?? '—'} sub={`${counts.queue_due_now ?? 0} due now`} badge={queueBadge} />
        <Kpi icon={<RiCheckboxCircleLine size={18} />} label="Bridge" value={providers.bridge?.available ? 'Ready' : 'Idle'} sub={`${providers.crm?.provider || 'crm'} / ${providers.support?.provider || 'support'}`} />
      </div>

      <div className="ops-provider-grid">
        <div className="card ops-panel">
          <div className="ops-panel-head">
            <span>Connector status</span>
            <span className={`badge badge-${connectors?.bridge?.available ? 'green' : 'amber'}`}>
              {connectors?.bridge?.available ? 'Fallback ready' : 'No fallback bridge'}
            </span>
          </div>
          <div className="ops-status-list">
            <StatusRow name="CRM" value={connectors?.crm?.provider || 'hubspot'} ok={connectors?.crm?.available} />
            <StatusRow name="Support" value={connectors?.support?.provider || 'zendesk'} ok={connectors?.support?.available} />
            <StatusRow name="Fallback webhook" value={connectors?.bridge?.webhook_configured ? 'configured' : 'missing'} ok={connectors?.bridge?.webhook_configured} />
            <StatusRow name="Fallback email" value={connectors?.bridge?.email_configured ? 'configured' : 'missing'} ok={connectors?.bridge?.email_configured} />
          </div>
        </div>

        <div className="card ops-panel">
          <div className="ops-panel-head">
            <span>Queue health</span>
            <span className={`badge badge-${queueBadge}`}>{counts.queue_pending || 0} pending</span>
          </div>
          <div className="ops-metric-stack">
            <div className="ops-metric">
              <span>Failed</span>
              <strong>{counts.queue_failed ?? 0}</strong>
            </div>
            <div className="ops-metric">
              <span>Due now</span>
              <strong>{counts.queue_due_now ?? 0}</strong>
            </div>
            <div className="ops-metric">
              <span>Touchpoints</span>
              <strong>{counts.touchpoints ?? 0}</strong>
            </div>
          </div>
          <p className="ops-muted">
            The queue is the fallback control plane when no vendor creds are present.
          </p>
        </div>
      </div>

      <div className="ops-form-grid">
        <form className="card ops-form" onSubmit={submitLead}>
          <div className="ops-panel-head">
            <span>Create lead</span>
            <span className="badge badge-green">Sales intake</span>
          </div>
          <div className="ops-fields">
            <Field label="Name" value={leadForm.name} onChange={(v) => setLeadForm((p) => ({ ...p, name: v }))} />
            <Field label="Email" value={leadForm.email} onChange={(v) => setLeadForm((p) => ({ ...p, email: v }))} />
            <Field label="Company" value={leadForm.company} onChange={(v) => setLeadForm((p) => ({ ...p, company: v }))} />
            <Field label="Source" value={leadForm.source} onChange={(v) => setLeadForm((p) => ({ ...p, source: v }))} />
          </div>
          <button className="btn btn-primary" disabled={busy || loading || !selectedProjectId}>
            <RiAddLine size={15} />
            Create lead
          </button>
        </form>

        <form className="card ops-form" onSubmit={submitTicket}>
          <div className="ops-panel-head">
            <span>Create ticket</span>
            <span className="badge badge-amber">Support intake</span>
          </div>
          <div className="ops-fields">
            <Field label="Requester" value={ticketForm.requester_name} onChange={(v) => setTicketForm((p) => ({ ...p, requester_name: v }))} />
            <Field label="Email" value={ticketForm.requester_email} onChange={(v) => setTicketForm((p) => ({ ...p, requester_email: v }))} />
            <Field label="Subject" value={ticketForm.subject} onChange={(v) => setTicketForm((p) => ({ ...p, subject: v }))} />
            <Field label="Priority" value={ticketForm.priority} onChange={(v) => setTicketForm((p) => ({ ...p, priority: v }))} />
            <Field label="Body" value={ticketForm.body} onChange={(v) => setTicketForm((p) => ({ ...p, body: v }))} multiline />
          </div>
          <button className="btn btn-primary" disabled={busy || loading || !selectedProjectId}>
            <RiAddLine size={15} />
            Create ticket
          </button>
        </form>
      </div>

      <div className="ops-lower-grid">
        <div className="card ops-panel">
          <div className="ops-panel-head">
            <span>Recent leads</span>
            <span className="badge badge-green">{recentLeads.length}</span>
          </div>
          <OpsList items={recentLeads} empty="No leads yet. Create one to start the sales loop." renderItem={(item) => (
            <div className="ops-row">
              <div>
                <div className="ops-row-title">{item.name}</div>
                <div className="ops-row-sub">{item.company || item.email || 'No company'} · {item.source}</div>
              </div>
              <span className="badge badge-amber">{item.status}</span>
            </div>
          )} />
        </div>

        <div className="card ops-panel">
          <div className="ops-panel-head">
            <span>Recent tickets</span>
            <span className="badge badge-amber">{recentTickets.length}</span>
          </div>
          <OpsList items={recentTickets} empty="No tickets yet. Create one to start the support loop." renderItem={(item) => (
            <div className="ops-row">
              <div>
                <div className="ops-row-title">{item.subject}</div>
                <div className="ops-row-sub">{item.requester_name} · {item.priority} · {item.channel}</div>
              </div>
              <span className="badge badge-green">{item.status}</span>
            </div>
          )} />
        </div>
      </div>

      <div className="card ops-panel">
        <div className="ops-panel-head">
          <span>Queue</span>
          <span className="badge badge-amber">{recentQueue.length} recent</span>
        </div>
        <OpsList items={recentQueue} empty="Queue is empty. New creates and syncs will show up here." renderItem={(item) => (
          <div className="ops-row">
            <div>
              <div className="ops-row-title">{item.kind}</div>
              <div className="ops-row-sub">
                {item.lead_name || item.ticket_subject || item.opportunity_title || item.touchpoint_summary || 'No linked object'}
              </div>
            </div>
            <div className="ops-row-meta">
              <span className={`badge badge-${item.status === 'FAILED' ? 'red' : item.status === 'COMPLETED' ? 'green' : 'amber'}`}>{item.status}</span>
              <span className="ops-row-time">{item.age_minutes}m</span>
            </div>
          </div>
        )} />
      </div>
    </div>
  )
}

function Kpi({ icon, label, value, sub, badge }) {
  return (
    <div className="card ops-kpi">
      <div className="ops-kpi-icon">{icon}</div>
      <div className="ops-kpi-label">{label}</div>
      <div className="ops-kpi-value">{value}</div>
      <div className="ops-kpi-sub">{sub}</div>
      {badge && <span className={`badge badge-${badge}`}>{badge}</span>}
    </div>
  )
}

function StatusRow({ name, value, ok }) {
  return (
    <div className="ops-status-row">
      <span className={`dot dot-${ok ? 'green' : 'amber'}`} />
      <span className="ops-status-name">{name}</span>
      <span className="ops-status-value">{value}</span>
    </div>
  )
}

function Field({ label, value, onChange, multiline = false }) {
  return (
    <label className="ops-field">
      <span>{label}</span>
      {multiline ? (
        <textarea className="ops-input" rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ops-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

function OpsList({ items, empty, renderItem }) {
  if (!items?.length) {
    return <div className="ops-empty">{empty}</div>
  }
  return <div className="ops-list">{items.map((item) => <div key={item.id}>{renderItem(item)}</div>)}</div>
}
