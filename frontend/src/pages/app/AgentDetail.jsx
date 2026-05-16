import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  RiArrowLeftLine, RiPlayLine, RiPauseLine, RiSettings3Line,
  RiTimeLine, RiCpuLine, RiHistoryLine, RiChat3Line, RiWalletLine,
  RiAlertLine,
} from 'react-icons/ri'
import { api } from '../../api/client'
import './AgentDetail.css'

export default function AgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/registry/agents/${id}/detail_full/`)
      .then(setData)
      .catch((e) => setError(e?.data?.detail || e?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  async function pauseOrResume(action) {
    try {
      await api.post(`/registry/agents/${id}/${action}/`, {})
      const fresh = await api.get(`/registry/agents/${id}/detail_full/`)
      setData(fresh)
    } catch { /* ignore */ }
  }

  if (loading) return <div className="agent-detail-loading">Loading agent…</div>
  if (error) return <div className="agent-detail-error">{error}</div>
  if (!data) return null

  const { agent, capability, budget, manifest, recent_traces, recent_conversations, stats } = data
  const isRunning = agent.status === 'RUNNING'

  return (
    <div className="agent-detail">
      <div className="agent-detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/agents')}>
          <RiArrowLeftLine size={16} /> Back
        </button>
        <div className="agent-detail-title-wrap">
          <h1>{agent.name}</h1>
          <span className={`badge badge-${isRunning ? 'green' : 'amber'}`}>{agent.status?.toLowerCase()}</span>
          {manifest && (
            <span className="agent-detail-source">
              {manifest.source_category} · {manifest.preferred_engine || 'native'}
            </span>
          )}
        </div>
        <div className="agent-detail-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => pauseOrResume(isRunning ? 'pause' : 'resume')}
          >
            {isRunning ? <><RiPauseLine size={14} /> Pause</> : <><RiPlayLine size={14} /> Resume</>}
          </button>
          <Link to="/app/swarm" className="btn btn-primary btn-sm">
            <RiPlayLine size={14} /> Run
          </Link>
        </div>
      </div>

      <div className="agent-detail-grid">
        <Stat icon={<RiHistoryLine />} label="Traces / 7d" value={stats?.traces_last_7d ?? 0} />
        <Stat icon={<RiChat3Line />} label="Conversations / 7d" value={stats?.conversations_last_7d ?? 0} />
        <Stat
          icon={<RiWalletLine />}
          label="Monthly spend"
          value={budget ? `$${parseFloat(budget.current_month_spend || 0).toFixed(2)}` : '—'}
          sub={budget ? `of $${parseFloat(budget.monthly_limit || 0).toFixed(0)}` : ''}
        />
        <Stat icon={<RiCpuLine />} label="Model" value={capability?.model || '—'} />
      </div>

      <div className="agent-detail-cols">
        <div className="card agent-detail-panel">
          <div className="agent-detail-panel-head">
            <span>System prompt</span>
            <Link to={`/app/settings`} className="btn btn-ghost btn-sm">
              <RiSettings3Line size={13} /> Edit
            </Link>
          </div>
          {capability ? (
            <pre className="agent-detail-prompt">
              {capability.system_prompt || '(no system prompt configured)'}
            </pre>
          ) : (
            <div className="agent-detail-empty">No capability profile yet.</div>
          )}
        </div>

        <div className="card agent-detail-panel">
          <div className="agent-detail-panel-head">
            <span>Enabled tools</span>
          </div>
          {capability?.tools_enabled?.length ? (
            <div className="agent-detail-tools">
              {capability.tools_enabled.map((t) => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
          ) : (
            <div className="agent-detail-empty">No tools enabled.</div>
          )}
        </div>
      </div>

      <div className="card agent-detail-panel">
        <div className="agent-detail-panel-head">
          <span>Recent traces</span>
          <span className="agent-detail-meta">last 7 days</span>
        </div>
        {recent_traces?.length ? (
          <table className="agent-detail-table">
            <thead>
              <tr><th>When</th><th>Type</th><th>Summary</th></tr>
            </thead>
            <tbody>
              {recent_traces.map((t) => (
                <tr key={t.id}>
                  <td className="agent-detail-mono">{new Date(t.created_at).toLocaleString()}</td>
                  <td><span className="badge">{t.step_type}</span></td>
                  <td>{t.summary?.slice(0, 140) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="agent-detail-empty">
            <RiAlertLine size={20} /> No traces yet. Run the agent to populate.
          </div>
        )}
      </div>

      <div className="card agent-detail-panel">
        <div className="agent-detail-panel-head">
          <span>Recent conversations</span>
        </div>
        {recent_conversations?.length ? (
          recent_conversations.map((c) => (
            <Link
              key={c.id}
              to={`/app/observe?conversation=${c.id}`}
              className="agent-detail-convo-row"
            >
              <RiChat3Line size={14} />
              <span>{c.title || 'Untitled conversation'}</span>
              <span className="agent-detail-meta">{new Date(c.created_at).toLocaleDateString()}</span>
            </Link>
          ))
        ) : (
          <div className="agent-detail-empty">No conversations yet.</div>
        )}
      </div>
    </div>
  )
}

function Stat({ icon, label, value, sub }) {
  return (
    <div className="card agent-detail-stat">
      <div className="agent-detail-stat-icon">{icon}</div>
      <div className="agent-detail-stat-body">
        <span className="agent-detail-stat-label">{label}</span>
        <span className="agent-detail-stat-value">{value}</span>
        {sub && <span className="agent-detail-stat-sub">{sub}</span>}
      </div>
    </div>
  )
}
