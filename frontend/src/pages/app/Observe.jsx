import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RiEyeLine, RiRadioButtonLine, RiFileSearchLine, RiAlertLine, RiShieldLine,
  RiCheckLine, RiCloseLine, RiTimeLine, RiRefreshLine, RiArrowRightSLine,
  RiPulseLine, RiErrorWarningLine, RiInformationLine,
} from 'react-icons/ri'
import { observe } from '../../api/observe'
import { agents as agentsAPI } from '../../api/agents'
import './Observe.css'

const TABS = [
  { id: 'feed',     label: 'Activity Feed',     Icon: RiEyeLine },
  { id: 'live',     label: 'Live Monitor',      Icon: RiRadioButtonLine },
  { id: 'traces',   label: 'Traces',            Icon: RiFileSearchLine },
  { id: 'anomalies',label: 'Anomalies',         Icon: RiAlertLine },
  { id: 'breakers', label: 'Circuit Breakers',  Icon: RiShieldLine },
]

const RISK_ICON = { green: <RiCheckLine size={13} color="var(--green)" />, amber: <RiErrorWarningLine size={13} color="var(--amber)" />, red: <RiCloseLine size={13} color="var(--red)" /> }

function timeAgo(ts) {
  if (!ts) return '—'
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}

export default function Observe() {
  const [tab, setTab] = useState('feed')

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Observe</h1>
          <p>Transparency into every agent action, decision, and anomaly</p>
        </div>
      </div>

      <div className="obs-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`obs-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.Icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'feed'     && <ActivityFeed />}
      {tab === 'live'     && <LiveMonitor />}
      {tab === 'traces'   && <TraceExplorer />}
      {tab === 'anomalies'&& <Anomalies />}
      {tab === 'breakers' && <CircuitBreakers />}
    </div>
  )
}

function ActivityFeed() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    observe.tasks()
      .then(d => setTasks(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusFilter === 'all' ? tasks : tasks.filter(t => t.status === statusFilter)

  const riskFor = (task) => {
    if (task.status === 'FAILED') return 'red'
    if (task.status === 'PENDING_APPROVAL') return 'amber'
    return 'green'
  }

  return (
    <div className="obs-feed">
      <div className="obs-filters">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING_APPROVAL">Pending approval</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => {
          setLoading(true)
          observe.tasks().then(d => setTasks(d.results || [])).catch(() => {}).finally(() => setLoading(false))
        }}>
          <RiRefreshLine size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<RiEyeLine size={32} />} text="No activity yet. Run a workflow or execute an agent to see the feed populate." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.map(task => {
            const risk = riskFor(task)
            const isOpen = expanded === task.id
            return (
              <div key={task.id} className="obs-row">
                <div className="obs-row-main" onClick={() => setExpanded(isOpen ? null : task.id)}>
                  <div className="obs-row-icon">{RISK_ICON[risk]}</div>
                  <div className="obs-row-agent">{task.agent?.name || `Agent ${String(task.agent).slice(0,8)}`}</div>
                  <div className="obs-row-msg">{task.description || 'Task executed'}</div>
                  <div className="obs-row-status">
                    <span className={`badge badge-${risk === 'red' ? 'red' : risk === 'amber' ? 'amber' : 'green'}`}>
                      {task.status?.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="obs-row-ts">{timeAgo(task.created_at)}</div>
                </div>
                {isOpen && (
                  <div className="obs-row-expand">
                    <div className="obs-tier">
                      <span className="obs-tier-label">Summary</span>
                      <div className="obs-tier-body">{task.description || 'Task completed.'}</div>
                    </div>
                    {task.input_data && (
                      <div className="obs-tier">
                        <span className="obs-tier-label">Input</span>
                        <div className="obs-tier-body" style={{ fontFamily: 'var(--mono)', fontSize: 11, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(task.input_data, null, 2)}
                        </div>
                      </div>
                    )}
                    {task.output_data && (
                      <div className="obs-tier">
                        <span className="obs-tier-label">Output</span>
                        <div className="obs-tier-body" style={{ fontFamily: 'var(--mono)', fontSize: 11, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(task.output_data, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const EVENT_LABEL = {
  'task.started':      { label: 'Task started',    color: 'var(--accent)' },
  'task.completed':    { label: 'Task done',        color: 'var(--green)' },
  'task.failed':       { label: 'Task failed',      color: 'var(--red)' },
  'agent.started':     { label: 'Agent running',    color: 'var(--accent)' },
  'agent.completed':   { label: 'Agent done',       color: 'var(--green)' },
  'agent.failed':      { label: 'Agent failed',     color: 'var(--red)' },
  'llm.request':       { label: 'LLM call',         color: 'var(--text-muted)' },
  'llm.response':      { label: 'LLM response',     color: 'var(--text-muted)' },
  'tool.called':       { label: 'Tool called',      color: 'var(--amber)' },
  'tool.completed':    { label: 'Tool done',        color: 'var(--green)' },
  'tool.failed':       { label: 'Tool failed',      color: 'var(--red)' },
  'tool.retried':      { label: 'Tool retry',       color: 'var(--amber)' },
  'policy.checked':    { label: 'Policy checked',   color: 'var(--text-muted)' },
  'policy.denied':     { label: 'Policy denied',    color: 'var(--red)' },
  'hitl.raised':       { label: 'HITL escalated',   color: 'var(--amber)' },
  'memory.loaded':     { label: 'Memory loaded',    color: 'var(--text-muted)' },
  'recovery.strategy': { label: 'Self-healing',     color: 'var(--amber)' },
  'trace.step':        { label: 'Trace step',       color: 'var(--text-muted)' },
}

function LiveMonitor() {
  const [tasks, setTasks] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExec, setSelectedExec] = useState(null)
  const [liveEvents, setLiveEvents] = useState([])
  const [streaming, setStreaming] = useState(false)
  const esRef = useRef(null)
  const feedRef = useRef(null)

  const refresh = useCallback(() => {
    Promise.all([
      observe.tasks({ status: 'IN_PROGRESS' }),
      agentsAPI.list(),
    ]).then(([t, a]) => {
      setTasks(t.results || [])
      const arr = Array.isArray(a) ? a : (a.results || [])
      setAgents(arr.filter(ag => ag.status === 'RUNNING'))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [refresh])

  const openStream = useCallback((executionId) => {
    if (esRef.current) esRef.current.close()
    setSelectedExec(executionId)
    setLiveEvents([])
    setStreaming(true)

    esRef.current = observe.streamExecution(
      executionId,
      (event) => {
        setLiveEvents(prev => {
          const next = [...prev, event].slice(-200) // keep last 200 events
          return next
        })
        // auto-scroll feed
        requestAnimationFrame(() => {
          if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
        })
      },
      () => setStreaming(false),
      () => setStreaming(false),
    )
  }, [])

  useEffect(() => () => esRef.current?.close(), [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedExec ? '1fr 1fr' : '1fr', gap: 16 }}>
      {/* Agent / task list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dot dot-green dot-pulse" style={{ width: 8, height: 8 }} />
            <span style={{ fontSize: 12, color: 'var(--text)' }}>Auto-refreshes every 5s</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={refresh}><RiRefreshLine size={13} /> Refresh</button>
        </div>

        {loading ? (
          <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
        ) : agents.length === 0 && tasks.length === 0 ? (
          <EmptyState icon={<RiRadioButtonLine size={32} />} text="No agents currently executing. Start a workflow to see live activity here." />
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <table className="obs-live-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id} style={{ cursor: a.execution_id ? 'pointer' : 'default', background: selectedExec === a.execution_id ? 'var(--surface-2)' : '' }}
                      onClick={() => a.execution_id && openStream(a.execution_id)}>
                    <td><div className="obs-live-agent">{a.name}</div></td>
                    <td><span className="obs-live-mono">{a.agent_type}</span></td>
                    <td>
                      <span className="badge badge-green">
                        <span className="dot dot-green dot-pulse" style={{ width: 6, height: 6 }} />
                        running
                      </span>
                    </td>
                    <td>{a.source}</td>
                    <td>
                      {a.execution_id && (
                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); openStream(a.execution_id) }}>
                          <RiPulseLine size={12} /> Stream
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live event feed — shown when an execution is selected */}
      {selectedExec && (
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 520 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {streaming && <span className="dot dot-green dot-pulse" style={{ width: 7, height: 7 }} />}
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {streaming ? 'Live stream' : 'Stream ended'} — {String(selectedExec).slice(0, 8)}
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { esRef.current?.close(); setSelectedExec(null); setLiveEvents([]) }}>
              <RiCloseLine size={13} />
            </button>
          </div>
          <div ref={feedRef} style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
            {liveEvents.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>Waiting for events…</div>
            ) : liveEvents.map((ev, i) => {
              const meta = EVENT_LABEL[ev.event_type] || { label: ev.event_type, color: 'var(--text-muted)' }
              return (
                <div key={i} style={{ padding: '4px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                  <span style={{ color: meta.color, fontWeight: 600, minWidth: 120, flexShrink: 0 }}>{meta.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
                    {ev.duration_ms != null ? `${ev.duration_ms}ms · ` : ''}
                    {ev.payload?.tool || ev.payload?.node || ev.payload?.output_length != null ? `${ev.payload.output_length} chars` : ''}
                    {ev.payload?.tokens_in ? ` · ${ev.payload.tokens_in}+${ev.payload.tokens_out} tok` : ''}
                    {ev.payload?.error ? ` ⚠ ${ev.payload.error}` : ''}
                  </span>
                  <span style={{ color: 'var(--text-muted)', opacity: 0.5, marginLeft: 'auto', fontSize: 10, flexShrink: 0 }}>
                    {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function TraceExplorer() {
  const [convs, setConvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    observe.conversations()
      .then(d => setConvs(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = convs.filter(c =>
    !search || JSON.stringify(c).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="obs-filters" style={{ marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Search traces…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
      </div>

      {loading ? (
        <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<RiFileSearchLine size={32} />} text="No conversation traces yet. Run agents to generate traces." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.map(c => (
            <div key={c.id} className="obs-row">
              <div className="obs-row-main">
                <div className="obs-row-icon"><RiFileSearchLine size={13} color="var(--accent)" /></div>
                <div className="obs-row-agent">{c.agent?.name || String(c.agent).slice(0, 8)}</div>
                <div className="obs-row-msg">{c.title || `Conversation ${String(c.id).slice(0, 8)}`}</div>
                <div className="obs-row-status">
                  <span className={`badge badge-${c.status === 'COMPLETED' ? 'green' : 'amber'}`}>{c.status?.toLowerCase()}</span>
                </div>
                <div className="obs-row-ts">{timeAgo(c.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Anomalies() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    observe.tasks({ status: 'FAILED' })
      .then(d => setTasks(d.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const ANOMALY_TYPES = [
    { type: 'loop', label: 'Infinite Loop', desc: 'Agent called the same tool >10 times in one conversation' },
    { type: 'timeout', label: 'LLM Timeout', desc: 'Model failed to respond within the 30s SLA — 3 retries exhausted' },
    { type: 'budget', label: 'Budget Spike', desc: 'Agent spent more than 2× its 5-minute rolling average' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--text)' }}>
          {tasks.length} failed tasks detected
        </div>
      </div>

      {loading ? (
        <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
      ) : (
        <>
          {tasks.length === 0 && (
            <EmptyState icon={<RiAlertLine size={32} />} text="No anomalies detected. All agents are behaving within normal parameters." />
          )}
          {tasks.length > 0 && tasks.map(t => (
            <div key={t.id} className="obs-anomaly">
              <div className="obs-anomaly-icon"><RiErrorWarningLine size={16} /></div>
              <div>
                <div className="obs-anomaly-name">Task failure — {t.agent?.name || 'Unknown agent'}</div>
                <div className="obs-anomaly-desc">{t.description || 'Task failed without error details'}</div>
                <div className="obs-anomaly-meta">{timeAgo(t.updated_at)}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text)', marginBottom: 10 }}>
              Anomaly Types — Detection Rules
            </p>
            {ANOMALY_TYPES.map(a => (
              <div key={a.type} className="obs-anomaly">
                <div className="obs-anomaly-icon" style={{ background: 'var(--bg-3)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                  <RiInformationLine size={16} />
                </div>
                <div>
                  <div className="obs-anomaly-name">{a.label}</div>
                  <div className="obs-anomaly-desc">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const BREAKERS = [
  {
    id: 'burn-rate',
    name: 'Token Burn Rate',
    desc: 'Spend exceeds $50 in any 10-minute window',
    metric: 'Current: $0.00 / 10min',
    threshold: '$50.00',
    status: 'CLOSED',
  },
  {
    id: 'loop-detect',
    name: 'Loop Detection',
    desc: 'Same tool called >15× in a single conversation',
    metric: 'Max this hour: 0',
    threshold: '15 calls',
    status: 'CLOSED',
  },
  {
    id: 'error-rate',
    name: 'Error Rate',
    desc: 'Agent failure rate exceeds 25% in a rolling 5-minute window',
    metric: 'Current: 0%',
    threshold: '25%',
    status: 'CLOSED',
  },
  {
    id: 'latency',
    name: 'LLM Latency',
    desc: 'P95 response time exceeds 45 seconds',
    metric: 'P95: —',
    threshold: '45s',
    status: 'CLOSED',
  },
]

function CircuitBreakers() {
  const [breakers, setBreakers] = useState(BREAKERS)
  const openCount = breakers.filter(b => b.status === 'OPEN').length
  const healthScore = Math.max(0, 100 - openCount * 25)

  return (
    <div>
      <div className="obs-health-score">
        <div>
          <div className={`obs-health-num ${healthScore >= 75 ? 'good' : healthScore >= 50 ? 'warn' : 'bad'}`}>
            {healthScore}
          </div>
          <div className="obs-health-label">System Health Score</div>
          <div className="obs-health-sub">{openCount === 0 ? 'All circuit breakers nominal' : `${openCount} breaker${openCount > 1 ? 's' : ''} open`}</div>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Breakers total', val: breakers.length },
            { label: 'Open', val: openCount },
            { label: 'Trips this month', val: 0 },
            { label: 'Agents protected', val: 245 },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-h)' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {breakers.map(b => (
        <div key={b.id} className="obs-breaker">
          <div>
            <div className="obs-breaker-name">{b.name}</div>
            <div className="obs-breaker-desc">{b.desc}</div>
          </div>
          <div className="obs-breaker-val">{b.metric}</div>
          <div className="obs-breaker-val">Threshold: {b.threshold}</div>
          <div className={b.status === 'OPEN' ? 'obs-breaker-status-open' : 'obs-breaker-status-closed'}>
            {b.status}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {b.status === 'OPEN' ? (
              <button
                className="btn btn-sm"
                style={{ background: 'var(--red)', color: '#fff', fontSize: 11 }}
                onClick={() => setBreakers(bs => bs.map(x => x.id === b.id ? { ...x, status: 'CLOSED' } : x))}
              >
                Reset
              </button>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--green)' }}>
                <RiCheckLine size={13} /> OK
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div className="obs-empty">
      <div className="obs-empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  )
}
