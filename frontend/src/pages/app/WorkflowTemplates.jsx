import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RiRocketLine, RiFileTextLine, RiMegaphoneLine, RiSearchLine,
  RiSendPlaneLine, RiServerLine, RiCloseLine, RiPlayLine,
} from 'react-icons/ri'
import { api } from '../../api/client'
import './WorkflowTemplates.css'

const TEMPLATES = [
  {
    id: 'saas-mvp-72h',
    name: 'Launch SaaS MVP in 72h',
    desc: '5 coordinated agents — planner → backend, frontend, devops, marketing in parallel',
    agents: 5,
    Icon: RiRocketLine,
    color: 'var(--accent)',
    tag: 'popular',
    runnable: true,
  },
  {
    id: 'prd-gen',
    name: 'Generate Startup PRD',
    desc: 'Product requirements from a one-line idea',
    agents: 3,
    Icon: RiFileTextLine,
    color: '#6b9cff',
    tag: 'quick',
  },
  {
    id: 'marketing',
    name: 'Create Marketing Campaign',
    desc: 'Content calendar, social posts, email sequences',
    agents: 6,
    Icon: RiMegaphoneLine,
    color: 'var(--green)',
    tag: null,
  },
  {
    id: 'research',
    name: 'Research Startup Idea',
    desc: 'Market analysis, competitors, TAM estimation',
    agents: 4,
    Icon: RiSearchLine,
    color: 'var(--amber)',
    tag: null,
  },
  {
    id: 'sales',
    name: 'Generate Sales Outreach',
    desc: 'Lead research, personalized sequences, CRM update',
    agents: 5,
    Icon: RiSendPlaneLine,
    color: '#f472b6',
    tag: null,
  },
  {
    id: 'deploy',
    name: 'Deploy Fullstack App',
    desc: 'Docker, CI/CD, monitoring, docs in one run',
    agents: 8,
    Icon: RiServerLine,
    color: '#34d399',
    tag: 'advanced',
  },
]

const TAG_COLORS = {
  popular:  { bg: 'rgba(170,59,255,0.12)', border: 'rgba(170,59,255,0.3)', color: 'var(--accent)' },
  quick:    { bg: 'rgba(61,255,160,0.08)', border: 'rgba(61,255,160,0.2)', color: 'var(--green)' },
  advanced: { bg: 'rgba(107,156,255,0.1)', border: 'rgba(107,156,255,0.25)', color: '#6b9cff' },
}

export default function WorkflowTemplates() {
  const navigate = useNavigate()
  const [launchTpl, setLaunchTpl] = useState(null)   // template object when modal open
  const [idea, setIdea] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function useTemplate(t) {
    if (t.runnable) {
      setLaunchTpl(t)
      setIdea('')
      setResult(null)
      setError('')
    } else {
      navigate(`/app/swarm?prompt=${encodeURIComponent(t.name)}`)
    }
  }

  async function launch() {
    if (!idea.trim() || !launchTpl) return
    setRunning(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post(
        `/swarm/workflows/templates/${launchTpl.id}/launch/`,
        { idea: idea.trim() }
      )
      setResult(res)
    } catch (e) {
      setError(e?.data?.detail || e?.message || 'Workflow failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Templates</h1>
          <p>Pre-built workflows to launch common AI operations in one click</p>
        </div>
      </div>

      <div className="tpl-grid">
        {TEMPLATES.map(t => (
          <div key={t.id} className="card tpl-card">
            <div className="tpl-card-top">
              <div className="tpl-icon" style={{ background: `${t.color}18`, border: `1px solid ${t.color}30` }}>
                <t.Icon size={22} color={t.color} />
              </div>
              {t.tag && (
                <span
                  className="tpl-tag"
                  style={{
                    background: TAG_COLORS[t.tag]?.bg,
                    border: `1px solid ${TAG_COLORS[t.tag]?.border}`,
                    color: TAG_COLORS[t.tag]?.color,
                  }}
                >
                  {t.tag}
                </span>
              )}
            </div>

            <div className="tpl-card-body">
              <div className="tpl-name">{t.name}</div>
              <div className="tpl-desc">{t.desc}</div>
            </div>

            <div className="tpl-card-footer">
              <span className="tpl-agents">{t.agents} agents</span>
              <button
                className="btn btn-sm tpl-use-btn"
                style={{ background: `${t.color}18`, border: `1px solid ${t.color}30`, color: t.color }}
                onClick={() => useTemplate(t)}
              >
                Use template
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="tpl-cta">
        <div className="tpl-cta-body">
          <span className="tpl-cta-title">Need a custom workflow?</span>
          <span className="tpl-cta-desc">Describe your goal and the swarm will build a plan from scratch.</span>
        </div>
        <button
          className="btn"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '9px 20px' }}
          onClick={() => navigate('/app/swarm?prompt=')}
        >
          <RiRocketLine size={14} /> Run custom swarm
        </button>
      </div>

      {launchTpl && (
        <div className="tpl-modal-backdrop" onClick={() => !running && setLaunchTpl(null)}>
          <div className="tpl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tpl-modal-head">
              <div>
                <div className="tpl-modal-title">{launchTpl.name}</div>
                <div className="tpl-modal-sub">{launchTpl.desc}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => !running && setLaunchTpl(null)}>
                <RiCloseLine size={16} />
              </button>
            </div>

            {!result && !error && (
              <>
                <label className="tpl-modal-label">Describe your SaaS idea in one sentence</label>
                <textarea
                  className="tpl-modal-input"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. A tool that helps freelance designers send invoices and track payments without spreadsheets."
                  rows={3}
                  disabled={running}
                />
                <div className="tpl-modal-actions">
                  <button
                    className="btn btn-primary"
                    onClick={launch}
                    disabled={running || !idea.trim()}
                  >
                    {running ? (
                      <>Running 5 agents…</>
                    ) : (
                      <><RiPlayLine size={14} /> Launch swarm</>
                    )}
                  </button>
                </div>
                {running && (
                  <p className="tpl-modal-hint">
                    This takes ~8 minutes. The planner runs first, then 4 specialists run in parallel.
                    You'll see live progress on the Observe page once it starts.
                  </p>
                )}
              </>
            )}

            {error && (
              <div className="tpl-modal-error">
                <strong>Failed:</strong> {error}
                <button className="btn btn-ghost btn-sm" onClick={() => setError('')}>Try again</button>
              </div>
            )}

            {result && (
              <div className="tpl-modal-result">
                <div className="tpl-modal-result-header">
                  <span className={`badge ${result.success ? 'badge-green' : 'badge-amber'}`}>
                    {result.success ? '✓ Complete' : 'Partial — check failed nodes'}
                  </span>
                  <span className="tpl-modal-mono">{result.execution_id?.slice(0, 8)}</span>
                </div>
                <ul className="tpl-modal-nodes">
                  {result.graph?.nodes?.map((n) => (
                    <li key={n.id} className={`tpl-modal-node status-${n.status}`}>
                      <div className="tpl-modal-node-row">
                        <span className="tpl-modal-node-id">{n.id}</span>
                        <span className="tpl-modal-node-agent">{n.agent_name}</span>
                        <span className={`badge badge-${
                          n.status === 'completed' ? 'green' :
                          n.status === 'failed' ? 'red' :
                          n.status === 'cancelled' || n.status === 'skipped' ? 'amber' :
                          'gray'
                        }`}>
                          {n.status}
                        </span>
                        <span className="tpl-modal-mono">{n.duration_ms ? `${(n.duration_ms / 1000).toFixed(1)}s` : ''}</span>
                      </div>
                      {n.error && (
                        <div className="tpl-modal-node-error" title={n.error}>
                          {n.error.length > 200 ? n.error.slice(0, 200) + '…' : n.error}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="tpl-modal-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/app/observe?execution=${result.execution_id}`)}
                  >
                    Open in Observe →
                  </button>
                  <button className="btn btn-ghost" onClick={() => setLaunchTpl(null)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
