import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiRobot2Line,
  RiBarChartLine,
  RiPlugLine,
  RiMoneyDollarCircleLine,
  RiMegaphoneLine,
  RiFileListLine,
  RiListCheck2,
} from 'react-icons/ri'
import { projects as projectsAPI } from '../../api/projects'
import './ProjectReadiness.css'

const CAPABILITY_ICONS = {
  goals:     <RiFileListLine size={15} />,
  budget:    <RiMoneyDollarCircleLine size={15} />,
  agents:    <RiRobot2Line size={15} />,
  crm:       <RiPlugLine size={15} />,
  support:   <RiPlugLine size={15} />,
  policies:  <RiShieldCheckLine size={15} />,
  queue:     <RiListCheck2 size={15} />,
  workflows: <RiBarChartLine size={15} />,
  marketing: <RiMegaphoneLine size={15} />,
}

const WARN_COLORS = {
  high:   { cls: 'warn-high',   icon: <RiErrorWarningLine size={14} /> },
  medium: { cls: 'warn-medium', icon: <RiAlertLine size={14} /> },
  low:    { cls: 'warn-low',    icon: <RiInformationLine size={14} /> },
}

function ScoreRing({ score }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="rdy-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border-2)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="rdy-ring-inner" style={{ color }}>
        <span className="rdy-score-num">{score}</span>
        <span className="rdy-score-denom">/100</span>
      </div>
    </div>
  )
}

export default function ProjectReadiness() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await projectsAPI.readiness(id)
      setData(res)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load readiness data')
    } finally {
      setLoading(false)
    }
  }

  const score = data?.score ?? 0
  const scoreLabel = data?.score_label ?? '—'
  const flags = data?.flags || []
  const warnings = data?.warnings || []
  const summary = data?.summary || {}

  return (
    <div className="rdy-page">
      <div className="rdy-header">
        <Link className="rdy-back" to={`/app/projects/${id}`}>
          <RiArrowLeftLine size={14} /> Project
        </Link>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          <RiRefreshLine size={14} />
        </button>
      </div>

      {error && <div className="rdy-error">{error}</div>}

      {loading ? (
        <div className="card rdy-loading">Computing readiness…</div>
      ) : (
        <>
          {/* Score hero */}
          <div className="card rdy-score-card">
            <ScoreRing score={score} />
            <div className="rdy-score-meta">
              <div className="rdy-score-label-row">
                <h2>Autonomy Readiness</h2>
                <span className={`badge ${score >= 70 ? 'badge-green' : score >= 40 ? 'badge-amber' : 'badge-red'}`}>
                  {scoreLabel}
                </span>
              </div>
              <p className="rdy-score-desc">
                {score >= 70
                  ? 'This project is well-configured for autonomous operation.'
                  : score >= 40
                  ? 'Some capabilities are missing. Address the flags below to improve autonomy.'
                  : 'Critical capabilities are missing. The project needs setup before autonomous operation.'}
              </p>
              <div className="rdy-summary-grid">
                <Stat label="Goals" value={summary.goals ?? 0} />
                <Stat label="Agents" value={summary.agents ?? 0} />
                <Stat label="Policies" value={summary.policies ?? 0} />
                <Stat label="Campaigns" value={summary.campaigns ?? 0} />
                <Stat label="Queue jobs" value={summary.queue_total ?? 0} />
                <Stat label="Pending" value={summary.pending_approvals ?? 0} warn={summary.pending_approvals > 0} />
              </div>
            </div>
          </div>

          <div className="rdy-cols">
            {/* Capability flags */}
            <div className="card rdy-panel">
              <div className="rdy-panel-head">
                <RiShieldCheckLine size={15} />
                <span>Capability Flags</span>
                <span className="rdy-panel-sub">
                  {flags.filter(f => f.ok).length}/{flags.length} ready
                </span>
              </div>
              <div className="rdy-flags">
                {flags.map(flag => (
                  <div key={flag.key} className={`rdy-flag ${flag.ok ? 'ok' : 'missing'}`}>
                    <div className="rdy-flag-icon">
                      {flag.ok
                        ? <RiCheckLine size={13} />
                        : <RiCloseLine size={13} />
                      }
                    </div>
                    <div className="rdy-flag-body">
                      <div className="rdy-flag-label">{CAPABILITY_ICONS[flag.key]} {flag.label}</div>
                      <div className="rdy-flag-weight">{flag.weight} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className="card rdy-panel">
              <div className="rdy-panel-head">
                <RiAlertLine size={15} />
                <span>Risky-Action Warnings</span>
                <span className="rdy-panel-sub">{warnings.length} issue{warnings.length !== 1 ? 's' : ''}</span>
              </div>
              {warnings.length === 0 ? (
                <div className="rdy-no-warnings">
                  <RiCheckLine size={20} style={{ color: 'var(--green)' }} />
                  <p>No warnings — this project is clean.</p>
                </div>
              ) : (
                <div className="rdy-warnings">
                  {warnings.map((w, i) => {
                    const wc = WARN_COLORS[w.level] || WARN_COLORS.low
                    return (
                      <div key={i} className={`rdy-warning ${wc.cls}`}>
                        <span className="rdy-warning-icon">{wc.icon}</span>
                        <span className="rdy-warning-msg">{w.message}</span>
                        <span className="rdy-warning-level">{w.level}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Connector health */}
              <div className="rdy-panel-head" style={{ marginTop: 20 }}>
                <RiPlugLine size={15} />
                <span>Connector Health</span>
              </div>
              <div className="rdy-connectors">
                <Connector label="HubSpot / Salesforce" ok={summary.crm_connected} />
                <Connector label="Zendesk / Intercom" ok={summary.support_connected} />
                <Connector label="Budget enforced" ok={summary.has_budget} />
                <Connector label="Workflows running" ok={summary.workflows_run} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, warn }) {
  return (
    <div className="rdy-stat">
      <span className={`rdy-stat-val${warn ? ' rdy-stat-warn' : ''}`}>{value}</span>
      <span className="rdy-stat-label">{label}</span>
    </div>
  )
}

function Connector({ label, ok }) {
  return (
    <div className={`rdy-connector ${ok ? 'ok' : 'missing'}`}>
      {ok ? <RiCheckLine size={12} /> : <RiCloseLine size={12} />}
      <span>{label}</span>
      <span className={`badge ${ok ? 'badge-green' : 'badge-red'}`}>{ok ? 'Connected' : 'Not set'}</span>
    </div>
  )
}
