import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RiArrowRightLine, RiCheckLine, RiCloseLine, RiShieldCheckLine, RiTimeLine } from 'react-icons/ri'
import { agents } from '../../api/agents'
import { projects } from '../../api/projects'
import './ApprovalsInbox.css'

const DECIDED = new Set(['APPROVED', 'DENIED', 'EXPIRED'])

export default function ApprovalsInbox() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projectOptions, setProjectOptions] = useState([])
  const [projectId, setProjectId] = useState(searchParams.get('project_id') || '')
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deciding, setDeciding] = useState('')

  useEffect(() => {
    projects.list()
      .then((data) => setProjectOptions(Array.isArray(data) ? data : data.results || []))
      .catch(() => setProjectOptions([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    agents.pendingActions(projectId ? { project_id: projectId } : {})
      .then((data) => { if (!cancelled) setItems(data?.results || []) })
      .catch((err) => { if (!cancelled) setError(err?.data?.detail || err.message || 'Failed to load approvals') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [projectId])

  function selectProject(value) {
    setLoading(true)
    setError('')
    setProjectId(value)
    setSearchParams(value ? { project_id: value } : {})
  }

  async function decide(actionId, decision) {
    setDeciding(actionId)
    setError('')
    try {
      if (decision === 'APPROVED') await agents.approve(actionId, { decision })
      else await agents.reject(actionId, { decision })
      setItems((current) => current.map((item) => item.id === actionId ? { ...item, status: decision } : item))
    } catch (err) {
      setError(err?.data?.error || err?.data?.detail || err.message || 'Unable to save decision')
    } finally {
      setDeciding('')
    }
  }

  const visible = items.filter((item) => tab === 'pending' ? !DECIDED.has(item.status) : DECIDED.has(item.status))
  const pendingCount = items.filter((item) => !DECIDED.has(item.status)).length

  return (
    <div className="inbox-page">
      <div className="page-header">
        <div className="page-header-left"><h1>Approvals</h1><p>Project-scoped agent actions paused for review</p></div>
        <span className={`badge badge-${pendingCount ? 'amber' : 'green'}`}>{pendingCount} pending</span>
      </div>

      <div className="inbox-project-filter card">
        <label htmlFor="approval-project">Project</label>
        <select id="approval-project" value={projectId} onChange={(event) => selectProject(event.target.value)}>
          <option value="">All my projects</option>
          {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      </div>

      {error && <div className="projects-error">{error}</div>}

      <div className="inbox-tabs">
        <button className={`inbox-tab${tab === 'pending' ? ' inbox-tab--active' : ''}`} onClick={() => setTab('pending')}>Pending <span className="inbox-tab-count">{pendingCount}</span></button>
        <button className={`inbox-tab${tab === 'decided' ? ' inbox-tab--active' : ''}`} onClick={() => setTab('decided')}>Decided</button>
      </div>

      {loading ? <div className="inbox-empty card"><p>Loading approvals…</p></div> : visible.length === 0 ? (
        <div className="inbox-empty card"><RiShieldCheckLine size={32} color="var(--green)" /><p>{tab === 'pending' ? 'No pending approvals' : 'No decided approvals'}</p><span>{projectId ? 'Nothing in this project needs attention.' : 'Nothing across your projects needs attention.'}</span></div>
      ) : (
        <div className="inbox-list">
          {visible.map((item) => (
            <div key={item.id} className="inbox-card card">
              <div className="inbox-card-body">
                <div className="inbox-card-top"><span className="inbox-agent">{item.agent_name || 'Agent'}</span><span className={`badge badge-${item.status === 'PENDING' ? 'amber' : item.status === 'APPROVED' ? 'green' : 'red'}`}>{item.status || 'PENDING'}</span></div>
                <p className="inbox-action">{item.action_type || 'Agent action'} · {item.resource || 'No resource supplied'}</p>
                <div className="inbox-meta">{item.reason && <span className="inbox-policy">{item.reason}</span>}<span className="inbox-time"><RiTimeLine size={11} /> {item.created_at ? new Date(item.created_at).toLocaleString() : 'Time unavailable'}</span></div>
              </div>
              {tab === 'pending' ? <div className="inbox-row-actions"><button className="btn btn-sm btn-ghost inbox-override-reject" disabled={Boolean(deciding)} onClick={() => decide(item.id, 'DENIED')}><RiCloseLine size={14} /> Reject</button><button className="btn btn-sm btn-primary" disabled={Boolean(deciding)} onClick={() => decide(item.id, 'APPROVED')}><RiCheckLine size={14} /> {deciding === item.id ? 'Saving…' : 'Approve'}</button></div> : <Link to={`/app/approvals/${item.id}`} aria-label="View approval"><RiArrowRightLine className="inbox-arrow" size={16} /></Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
