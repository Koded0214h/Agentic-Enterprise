import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RiRocketLine, RiFileTextLine, RiMegaphoneLine, RiSearchLine,
  RiSendPlaneLine, RiServerLine, RiCloseLine, RiPlayLine,
  RiFileCopyLine, RiLineChartLine, RiBarChart2Line,
  RiFlashlightLine, RiArrowDownSLine, RiCheckLine, RiErrorWarningLine,
} from 'react-icons/ri'
import { api } from '../../api/client'
import './WorkflowTemplates.css'

const LIVE_TEMPLATES = [
  {
    id: 'saas-mvp-72h',
    name: 'Launch SaaS MVP in 72h',
    desc: 'Planner → backend, frontend, devops, and marketing all run in parallel. Outputs code scaffolding, deployment config, and a go-to-market brief.',
    agents: 5,
    estimatedMinutes: 8,
    Icon: RiRocketLine,
    color: 'var(--accent)',
    tag: 'popular',
    promptLabel: 'Describe your SaaS idea in one sentence',
    promptPlaceholder: 'e.g. A tool that helps freelance designers send invoices and track payments without spreadsheets.',
    runningHint: 'Planner runs first, then 4 specialists run in parallel (~8 min total).',
    pipeline: ['planner', 'backend-dev', 'frontend-dev', 'devops', 'marketing'],
  },
  {
    id: 'launch-and-grow',
    name: 'Launch & Grow',
    desc: 'Full GTM engine — strategy shapes everything, then 6 specialists produce content, SEO research, sales sequences, ads, and social posts all in parallel. Ends by scheduling 5 recurring autonomous ops jobs.',
    agents: 8,
    estimatedMinutes: 20,
    Icon: RiFlashlightLine,
    color: '#f59e0b',
    tag: 'GTM',
    promptLabel: 'What product or business are you marketing?',
    promptPlaceholder: 'e.g. A freelance invoice tool for designers — launching next month, competing with Wave and FreshBooks.',
    runningHint: 'Strategy first, then 3 research agents in parallel, then 4 output agents, then the ops scheduler wires up 5 recurring jobs.',
    pipeline: ['strategy', 'content_calendar', 'seo', 'competitor_intel', 'social_posts', 'sales_outreach', 'email_sequences', 'paid_media', 'ops_scheduler'],
  },
]

const CHAT_TEMPLATES = [
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
  {
    id: 'launch-landing-page',
    name: 'Launch Landing Page',
    desc: 'Generate, design, and deploy a high-converting landing page with copy, SEO, and deployment.',
    agents: 4,
    Icon: RiLineChartLine,
    color: '#f472b6',
    tag: 'Growth',
  },
  {
    id: 'setup-analytics-stack',
    name: 'Setup Analytics Stack',
    desc: 'Configure product analytics, user tracking, funnel analysis, and dashboards.',
    agents: 3,
    Icon: RiBarChart2Line,
    color: '#38bdf8',
    tag: 'Engineering',
  },
]

const TAG_COLORS = {
  popular:     { bg: 'rgba(170,59,255,0.12)', border: 'rgba(170,59,255,0.3)',  color: 'var(--accent)' },
  quick:       { bg: 'rgba(61,255,160,0.08)', border: 'rgba(61,255,160,0.2)',  color: 'var(--green)' },
  advanced:    { bg: 'rgba(107,156,255,0.1)', border: 'rgba(107,156,255,0.25)',color: '#6b9cff' },
  Growth:      { bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)',color: '#f472b6' },
  Engineering: { bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)', color: '#38bdf8' },
  GTM:         { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  color: '#f59e0b' },
}

function TagChip({ tag }) {
  if (!tag) return null
  const s = TAG_COLORS[tag] || {}
  return (
    <span className="tpl-tag" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {tag}
    </span>
  )
}

export default function WorkflowTemplates() {
  const navigate = useNavigate()
  const [launchTpl, setLaunchTpl] = useState(null)
  const [idea, setIdea] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!running) { setElapsed(0); return }
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  function fmtElapsed(s) {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  function openModal(t) {
    setLaunchTpl(t)
    setIdea('')
    setResult(null)
    setError('')
  }

  async function launch() {
    if (!idea.trim() || !launchTpl) return
    setRunning(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post(`/swarm/workflows/templates/${launchTpl.id}/launch/`, { idea: idea.trim() })
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
          <p>Pre-built multi-agent workflows — launch real operations in one click</p>
        </div>
      </div>

      {/* ── Live workflows ── */}
      <div className="tpl-section-label">Live Workflows</div>
      <div className="tpl-live-grid">
        {LIVE_TEMPLATES.map(t => (
          <div key={t.id} className="tpl-live-card" style={{ '--tpl-color': t.color }}>
            <div className="tpl-live-top-bar" style={{ background: t.color }} />
            <div className="tpl-live-body">
              <div className="tpl-live-head">
                <div className="tpl-icon-lg" style={{ background: `${t.color}18`, border: `1px solid ${t.color}35` }}>
                  <t.Icon size={24} color={t.color} />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="tpl-live-badge">LIVE</span>
                  <TagChip tag={t.tag} />
                </div>
              </div>
              <div className="tpl-live-name">{t.name}</div>
              <div className="tpl-live-desc">{t.desc}</div>
              <div className="tpl-live-pipeline">
                {t.pipeline.map((step, i) => (
                  <span key={step} className="tpl-pipeline-step">
                    {i > 0 && <span className="tpl-pipeline-arrow">→</span>}
                    <span className="tpl-pipeline-node">{step.replace(/_/g, ' ')}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="tpl-live-footer">
              <span className="tpl-live-meta">{t.agents} agents · ~{t.estimatedMinutes} min</span>
              <button
                className="tpl-launch-btn"
                style={{ background: t.color }}
                onClick={() => openModal(t)}
              >
                <RiPlayLine size={13} /> Launch
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chat templates ── */}
      <div className="tpl-section-label" style={{ marginTop: 28 }}>Chat Templates</div>
      <div className="tpl-grid">
        {CHAT_TEMPLATES.map(t => (
          <div key={t.id} className="card tpl-card">
            <div className="tpl-card-top">
              <div className="tpl-icon" style={{ background: `${t.color}18`, border: `1px solid ${t.color}30` }}>
                <t.Icon size={20} color={t.color} />
              </div>
              <TagChip tag={t.tag} />
            </div>
            <div className="tpl-card-body">
              <div className="tpl-name">{t.name}</div>
              <div className="tpl-desc">{t.desc}</div>
            </div>
            <div className="tpl-card-footer">
              <span className="tpl-agents">{t.agents} agents</span>
              <button
                className="btn btn-sm tpl-use-btn"
                style={{ border: `1px solid ${t.color}30`, color: t.color }}
                onClick={() => navigate(`/app/swarm?prompt=${encodeURIComponent(t.name)}`)}
              >
                Open in Chat →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="tpl-cta">
        <div className="tpl-cta-body">
          <span className="tpl-cta-title">Need a custom workflow?</span>
          <span className="tpl-cta-desc">Describe your goal and the swarm builds a plan from scratch.</span>
        </div>
        <button
          className="btn"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '9px 20px' }}
          onClick={() => navigate('/app/swarm?prompt=')}
        >
          <RiRocketLine size={14} /> Run custom swarm
        </button>
      </div>

      {/* ── Launch modal ── */}
      {launchTpl && (
        <div className="tpl-modal-backdrop" onClick={() => !running && setLaunchTpl(null)}>
          <div className="tpl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tpl-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="tpl-icon" style={{ background: `${launchTpl.color}18`, border: `1px solid ${launchTpl.color}35`, flexShrink: 0 }}>
                  <launchTpl.Icon size={20} color={launchTpl.color} />
                </div>
                <div>
                  <div className="tpl-modal-title">{launchTpl.name}</div>
                  <div className="tpl-modal-sub">{launchTpl.agents} agents · ~{launchTpl.estimatedMinutes} min</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => !running && setLaunchTpl(null)}>
                <RiCloseLine size={16} />
              </button>
            </div>

            {!result && !error && (
              <>
                <label className="tpl-modal-label">{launchTpl.promptLabel}</label>
                <textarea
                  className="tpl-modal-input"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder={launchTpl.promptPlaceholder}
                  rows={3}
                  disabled={running}
                  autoFocus
                />

                {running && (
                  <div className="tpl-running-pipeline">
                    {launchTpl.pipeline.map((step, i) => (
                      <div key={step} className="tpl-running-step">
                        <div className="tpl-running-step-dot" style={{ background: launchTpl.color }} />
                        <span>{step.replace(/_/g, ' ')}</span>
                        {i < launchTpl.pipeline.length - 1 && (
                          <div className="tpl-running-step-line" style={{ background: `${launchTpl.color}30` }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="tpl-modal-actions">
                  <button
                    className="btn btn-primary"
                    onClick={launch}
                    disabled={running || !idea.trim()}
                    style={{ background: running ? undefined : launchTpl.color, border: 'none' }}
                  >
                    {running ? (
                      <><span className="tpl-spinner" /> {fmtElapsed(elapsed)}</>
                    ) : (
                      <><RiPlayLine size={14} /> Launch swarm</>
                    )}
                  </button>
                  {running && (
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/observe?tab=live')}>
                      Watch live →
                    </button>
                  )}
                </div>
                {running && (
                  <p className="tpl-modal-hint">{launchTpl.runningHint}</p>
                )}
              </>
            )}

            {error && (
              <div className="tpl-modal-error">
                <div>
                  <strong>Failed:</strong> {error}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setError('')}>Try again</button>
              </div>
            )}

            {result && (
              <ResultPanel
                result={result}
                tpl={launchTpl}
                onClose={() => setLaunchTpl(null)}
                onOpenObserve={() => navigate(`/app/observe?execution=${result.execution_id}`)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}


function ResultPanel({ result, tpl, onClose, onOpenObserve }) {
  const [openNode, setOpenNode] = useState(
    result.graph?.nodes?.find((n) => n.status === 'completed' && n.output)?.id || null
  )

  const nodes = result.graph?.nodes || []
  const totalTokensIn  = nodes.reduce((s, n) => s + (n.tokens_input  || 0), 0)
  const totalTokensOut = nodes.reduce((s, n) => s + (n.tokens_output || 0), 0)
  const totalDuration  = nodes.reduce((s, n) => s + (n.duration_ms   || 0), 0)
  const completed = nodes.filter(n => n.status === 'completed').length
  const failed    = nodes.filter(n => n.status === 'failed').length

  async function copyOutput(text) {
    try { await navigator.clipboard.writeText(text) } catch { /* noop */ }
  }

  function badgeColor(status) {
    if (status === 'completed') return 'green'
    if (status === 'failed') return 'red'
    return 'amber'
  }

  return (
    <div>
      {/* Summary row */}
      <div className="tpl-result-summary">
        <span className={`badge badge-${result.success ? 'green' : 'amber'}`} style={{ fontSize: 12 }}>
          {result.success ? '✓ Complete' : `${completed}/${nodes.length} completed`}
        </span>
        <div className="tpl-result-stats">
          <span><b>{(totalDuration / 1000).toFixed(1)}s</b></span>
          <span className="tpl-stat-sep">·</span>
          <span><b>{(totalTokensIn + totalTokensOut).toLocaleString()}</b> tokens</span>
          <span className="tpl-stat-sep">·</span>
          <span style={{ color: failed > 0 ? 'var(--red)' : 'var(--text-2)' }}>
            {failed > 0 ? `${failed} failed` : `${completed} agents`}
          </span>
        </div>
        <span className="tpl-modal-mono" style={{ marginLeft: 'auto' }}>{result.execution_id?.slice(0, 8)}</span>
      </div>

      {/* Node list */}
      <ul className="tpl-modal-nodes">
        {nodes.map((n) => {
          const isOpen = openNode === n.id
          const hasOutput = !!(n.output || n.error)
          return (
            <li key={n.id} className="tpl-modal-node">
              <button
                type="button"
                className="tpl-modal-node-row"
                onClick={() => setOpenNode(isOpen ? null : n.id)}
                disabled={!hasOutput}
              >
                <RiArrowDownSLine
                  size={14}
                  className="tpl-modal-node-caret"
                  style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', opacity: hasOutput ? 1 : 0.25 }}
                />
                <span className="tpl-modal-node-id">{n.id}</span>
                <span className="tpl-modal-node-agent">{n.agent_name}</span>
                <span className={`badge badge-${badgeColor(n.status)}`} style={{ fontSize: 10 }}>{n.status}</span>
                <span className="tpl-modal-mono">
                  {n.duration_ms ? `${(n.duration_ms / 1000).toFixed(1)}s` : '—'}
                </span>
              </button>
              {isOpen && n.error && (
                <div className="tpl-modal-node-error">{n.error}</div>
              )}
              {isOpen && n.output && (
                <div className="tpl-modal-node-output-wrap">
                  <div className="tpl-modal-node-output-head">
                    <span className="tpl-modal-mono">{n.tokens_input}↑ {n.tokens_output}↓ tok</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyOutput(n.output)}>
                      <RiFileCopyLine size={12} /> Copy
                    </button>
                  </div>
                  <pre className="tpl-modal-node-output">{n.output}</pre>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="tpl-modal-actions" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={onOpenObserve}
          style={{ background: tpl?.color, border: 'none' }}>
          View in Observe →
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
