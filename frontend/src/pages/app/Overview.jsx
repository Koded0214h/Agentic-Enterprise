import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiArrowRightLine, RiRobot2Line, RiBriefcaseLine, RiAddLine, RiFlashlightLine } from 'react-icons/ri'
import { agents as agentsAPI } from '../../api/agents'
import { projects as projectsAPI } from '../../api/projects'
import './Overview.css'

const STATUS_MAP = {
  RUNNING: { label: 'running', dot: 'green' },
  PAUSED:  { label: 'paused',  dot: 'amber' },
  FAILED:  { label: 'failed',  dot: 'red'   },
  STOPPED: { label: 'stopped', dot: 'red'   },
  IDLE:    { label: 'idle',    dot: 'amber' },
}

export default function Overview() {
  const [agentData, setAgentData] = useState({ count: 0, results: [] })
  const [approvals, setApprovals] = useState([])
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      agentsAPI.list(),
      agentsAPI.pendingActions(),
    ]).then(([ag, ap]) => {
      if (ag) {
        const results = Array.isArray(ag) ? ag : (ag.results || [])
        const count = Array.isArray(ag) ? ag.length : (ag.count || results.length)
        setAgentData({ count, results })
      }
      if (ap?.results) setApprovals(ap.results)
    }).catch(() => {}).finally(() => setLoading(false))

    projectsAPI.list({ status: 'ACTIVE' })
      .then(data => {
        const rows = Array.isArray(data) ? data : (data.results || [])
        setProjects(rows)
      })
      .catch(() => {})
      .finally(() => setProjectsLoading(false))
  }, [])

  const { count, results } = agentData
  const activeCount = results.filter(a => a.status === 'RUNNING').length

  function approve(id) {
    agentsAPI.approve(id).catch(() => {})
    setApprovals(p => p.filter(a => a.id !== id))
  }
  function reject(id) {
    agentsAPI.reject(id).catch(() => {})
    setApprovals(p => p.filter(a => a.id !== id))
  }

  return (
    <div className="overview">
      {/* KPIs */}
      <div className="ov-kpis">
        <div className="card ov-kpi">
          <p className="ov-kpi-label">Agents online</p>
          <p className="ov-kpi-val">
            {loading ? '—' : activeCount}
            <span>/{loading ? '—' : count}</span>
          </p>
          <span className="badge badge-green">Healthy</span>
        </div>
        <div className="card ov-kpi">
          <p className="ov-kpi-label">Total agents</p>
          <p className="ov-kpi-val">{loading ? '—' : count}</p>
          <span className="ov-kpi-trend">Across all environments</span>
        </div>
        <div className="card ov-kpi">
          <p className="ov-kpi-label">Pending approvals</p>
          <p className="ov-kpi-val" style={{ color: approvals.length ? 'var(--amber)' : undefined }}>
            {approvals.length}
          </p>
          {approvals.length > 0 && (
            <Link to="/app/approvals" className="btn btn-ghost btn-sm">Review →</Link>
          )}
        </div>
        <div className="card ov-kpi">
          <p className="ov-kpi-label">Environments</p>
          <p className="ov-kpi-val">
            {loading ? '—' : new Set(results.map(a => a.environment)).size}
          </p>
          <span className="ov-kpi-trend">dev · staging · prod</span>
        </div>
      </div>

      {/* Projects */}
      <div className="card ov-panel ov-projects-panel">
        <div className="ov-panel-head">
          <span>Your projects</span>
          {projects.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-green">{projects.length} active</span>
              <Link to="/app/projects" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
          )}
        </div>

        {projectsLoading ? (
          <div className="ov-loading">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="ov-projects-empty">
            <div className="ov-projects-empty-icon">
              <RiFlashlightLine size={28} />
            </div>
            <p className="ov-projects-empty-title">No projects yet</p>
            <p className="ov-projects-empty-sub">A project is your startup's operating boundary — it holds your goals, agents, budget, and workflows.</p>
            <button className="btn btn-primary" onClick={() => navigate('/app/projects')}>
              <RiAddLine size={15} /> Create your first project
            </button>
          </div>
        ) : (
          <div className="ov-projects-grid">
            {projects.slice(0, 6).map(p => (
              <Link key={p.id} to={`/app/projects/${p.id}`} className="ov-project-card">
                <div className="ov-project-card-top">
                  <div className="ov-project-icon">
                    <RiBriefcaseLine size={15} />
                  </div>
                  <span className={`badge badge-${p.stage === 'GROWTH' || p.stage === 'SCALE' ? 'green' : 'amber'}`}>
                    {p.stage}
                  </span>
                </div>
                <div className="ov-project-name">{p.name}</div>
                <div className="ov-project-meta">{p.description || p.target_market || 'No description'}</div>
                <div className="ov-project-footer">
                  <span>{p.currency} {Number(p.monthly_budget || 0).toLocaleString()} / mo</span>
                  <RiArrowRightLine size={13} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Two-col */}
      <div className="ov-cols">
        <div className="card ov-panel">
          <div className="ov-panel-head">
            <span>Recent agents</span>
            <Link to="/app/agents" className="btn btn-ghost btn-sm">View all {count} →</Link>
          </div>
          {loading
            ? <div className="ov-loading">Loading…</div>
            : results.slice(0, 6).map(a => <AgentRow key={a.id} agent={a} />)
          }
        </div>

        <div className="card ov-panel">
          <div className="ov-panel-head">
            <span>Agent sources</span>
          </div>
          {loading ? <div className="ov-loading">Loading…</div> : (
            <SourceBreakdown agents={results} />
          )}
        </div>
      </div>

      {/* Approvals */}
      {approvals.length > 0 && (
        <div className="card ov-panel">
          <div className="ov-panel-head">
            <span>Pending approvals</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-amber">{approvals.length} waiting</span>
              <Link to="/app/approvals" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
          </div>
          {approvals.map(a => (
            <div key={a.id} className="ov-approval-row">
              <div className="ov-approval-info">
                <span className="ov-approval-agent">{a.agent || a.agent_name}</span>
                <p className="ov-approval-action">{a.action || a.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span className={`badge badge-${{ high: 'red', medium: 'amber', low: 'green' }[a.risk] || 'amber'}`}>{a.risk || 'medium'} risk</span>
                </div>
              </div>
              <Link to={`/app/approvals/${a.id}`} className="btn btn-ghost btn-sm">
                Review <RiArrowRightLine size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AgentRow({ agent }) {
  const s = STATUS_MAP[agent.status] || { dot: 'amber', label: agent.status?.toLowerCase() }
  return (
    <div className="ov-agent-row">
      <span className={`dot dot-${s.dot}`} />
      <div className="ov-agent-info">
        <span className="ov-agent-name">{agent.name}</span>
        <span className="ov-agent-meta">
          {agent.agent_type} · {agent.environment} · {agent.source}
        </span>
      </div>
      <span className={`badge badge-${s.dot === 'green' ? 'green' : s.dot === 'red' ? 'red' : 'amber'}`}>
        {s.label}
      </span>
    </div>
  )
}

function SourceBreakdown({ agents }) {
  const bySource = agents.reduce((acc, a) => {
    acc[a.source] = (acc[a.source] || 0) + 1
    return acc
  }, {})
  const byEnv = agents.reduce((acc, a) => {
    acc[a.environment] = (acc[a.environment] || 0) + 1
    return acc
  }, {})
  const total = agents.length || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', marginBottom: 10 }}>By source</p>
        {Object.entries(bySource).map(([src, n]) => (
          <div key={src} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{src}</span>
              <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{n}</span>
            </div>
            <div style={{ height: 4, background: 'var(--border-2)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${(n / total) * 100}%`, background: 'var(--accent)', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', marginBottom: 10 }}>By environment</p>
        {Object.entries(byEnv).map(([env, n]) => (
          <div key={env} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{env}</span>
              <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{n}</span>
            </div>
            <div style={{ height: 4, background: 'var(--border-2)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${(n / total) * 100}%`, background: 'var(--green)', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
