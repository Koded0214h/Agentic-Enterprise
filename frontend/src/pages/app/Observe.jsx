import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  RiEyeLine, RiRadioButtonLine, RiFileSearchLine, RiAlertLine, RiShieldLine,
  RiCheckLine, RiCloseLine, RiRefreshLine,
  RiErrorWarningLine, RiInformationLine, RiBarChart2Line,
  RiLineChartLine, RiListCheck2, RiSpeedLine, RiFlowChart,
} from 'react-icons/ri'
import { observe } from '../../api/observe'
import { api } from '../../api/client'
import './Observe.css'

const TABS = [
  { id: 'feed',     label: 'Activity Feed',     Icon: RiEyeLine },
  { id: 'live',     label: 'Live Monitor',      Icon: RiRadioButtonLine },
  { id: 'traces',   label: 'Traces',            Icon: RiFileSearchLine },
  { id: 'anomalies',label: 'Anomalies',         Icon: RiAlertLine },
  { id: 'breakers', label: 'Circuit Breakers',  Icon: RiShieldLine },
  { id: 'metrics',  label: 'Metrics',           Icon: RiBarChart2Line },
  { id: 'failures', label: 'Failure Analytics', Icon: RiErrorWarningLine },
  { id: 'retries',  label: 'Task Performance',  Icon: RiRefreshLine },
  { id: 'graph',    label: 'Workflow Graph',     Icon: RiFlowChart },
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
  const [tab, setTab] = useState(() => {
    // Auto-open Live Monitor when linked from a template launch
    const params = new URLSearchParams(window.location.search)
    return params.get('execution') ? 'live' : 'feed'
  })

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
      {tab === 'metrics'  && <MetricsDashboard />}
      {tab === 'failures' && <FailureAnalytics />}
      {tab === 'retries'  && <TaskPerformance />}
      {tab === 'graph'    && <WorkflowGraph />}
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

const TEMPLATE_META = {
  'saas-mvp-72h':    { label: 'MVP',  color: 'var(--accent)' },
  'launch-and-grow': { label: 'GTM',  color: '#f59e0b' },
}

function fmtDuration(s) {
  if (s == null) return null
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function RunCard({ run, selected, onClick }) {
  const tpl = TEMPLATE_META[run.template_id] || { label: run.template_id || 'RUN', color: 'var(--text)' }
  const isCompleted = run.status === 'completed'
  const isFailed = run.status === 'failed'
  const isRunning = run.status === 'running'
  const statusColor = isCompleted ? 'var(--green)' : isFailed ? 'var(--red)' : 'var(--accent)'
  const dur = fmtDuration(run.duration_s)

  return (
    <div
      className="obs-run-card"
      style={{ borderLeft: `3px solid ${selected ? tpl.color : 'transparent'}`, background: selected ? 'var(--surface-2)' : '' }}
      onClick={onClick}
    >
      <div className="obs-run-card-top">
        <span className="obs-run-badge" style={{ background: `${tpl.color}18`, color: tpl.color, border: `1px solid ${tpl.color}30` }}>
          {tpl.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(run.started_at)}</span>
      </div>
      <div className="obs-run-idea">{run.task_summary || 'No description'}</div>
      <div className="obs-run-meta">
        <span className="obs-run-status-dot" style={{ background: statusColor }} />
        <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{run.status}</span>
        {dur && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>· {dur}</span>}
      </div>
    </div>
  )
}

function EventRow({ ev }) {
  const meta = EVENT_LABEL[ev.event_type] || { label: ev.event_type, color: 'var(--text-muted)' }
  const node = ev.payload?.node
  const hasError = !!ev.payload?.error
  const hasTokens = ev.payload?.tokens_in > 0
  const durSec = ev.duration_ms != null ? (ev.duration_ms >= 1000 ? `${(ev.duration_ms / 1000).toFixed(1)}s` : `${ev.duration_ms}ms`) : null

  return (
    <div className={`obs-event-row ${hasError ? 'obs-event-row--error' : ''}`}>
      <span className="obs-event-type" style={{ color: meta.color }}>{meta.label}</span>
      <div className="obs-event-body">
        {node && <span className="obs-event-node">{node}</span>}
        <span className="obs-event-meta">
          {durSec && <span>{durSec}</span>}
          {ev.payload?.output_length > 0 && <span>{ev.payload.output_length.toLocaleString()} chars</span>}
          {hasTokens && <span>{ev.payload.tokens_in.toLocaleString()}↑ {ev.payload.tokens_out.toLocaleString()}↓ tok</span>}
          {hasError && <span className="obs-event-error">⚠ {ev.payload.error}</span>}
        </span>
      </div>
      <span className="obs-event-time">{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}</span>
    </div>
  )
}

function LiveMonitor() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRun, setSelectedRun] = useState(null)
  const [liveEvents, setLiveEvents] = useState([])
  const [streaming, setStreaming] = useState(false)
  const esRef = useRef(null)
  const feedRef = useRef(null)

  const loadRuns = useCallback(() => {
    observe.recentRuns('template')
      .then(d => setRuns((d?.results || []).filter(r => r.template_id)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadRuns()
    const id = setInterval(loadRuns, 10000)
    return () => clearInterval(id)
  }, [loadRuns])

  const loadReplay = useCallback((run) => {
    esRef.current?.close()
    setSelectedRun(run)
    setLiveEvents([])
    setStreaming(false)
    observe.executionReplay(run.id)
      .then((data) => {
        const events = Array.isArray(data?.events) ? data.events : []
        setLiveEvents(events)
        requestAnimationFrame(() => {
          if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
        })
      })
      .catch(() => {
        esRef.current = observe.streamExecution(
          run.id,
          (ev) => setLiveEvents(prev => [...prev, ev].slice(-200)),
          () => setStreaming(false),
          () => setStreaming(false),
        )
        setStreaming(true)
      })
  }, [])

  // Auto-open from ?execution= query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const execId = params.get('execution')
    if (execId) {
      loadReplay({ id: execId, task_summary: '', template_id: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => esRef.current?.close(), [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedRun ? '320px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
      {/* Recent Runs panel */}
      <div>
        <div className="obs-panel-header">
          <span className="obs-panel-title">Recent Template Runs</span>
          <button className="btn btn-ghost btn-sm" onClick={loadRuns}><RiRefreshLine size={13} /></button>
        </div>

        {loading ? (
          <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
        ) : runs.length === 0 ? (
          <EmptyState icon={<RiRadioButtonLine size={32} />} text="No template runs yet. Launch a workflow from the Templates page." />
        ) : (
          <div className="obs-run-list">
            {runs.map(r => (
              <RunCard
                key={r.id}
                run={r}
                selected={selectedRun?.id === r.id}
                onClick={() => loadReplay(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event feed — shown when a run is selected */}
      {selectedRun && (
        <div className="card obs-event-panel">
          <div className="obs-event-panel-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {streaming && <span className="dot dot-green dot-pulse" style={{ width: 7, height: 7 }} />}
              <span className="obs-panel-title">
                {streaming ? 'Live' : 'Replay'} — {String(selectedRun.id).slice(0, 8)}
              </span>
              {selectedRun.template_id && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedRun.template_id}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>{liveEvents.length} events</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { esRef.current?.close(); setSelectedRun(null); setLiveEvents([]) }}>
                <RiCloseLine size={13} />
              </button>
            </div>
          </div>
          <div ref={feedRef} className="obs-event-feed">
            {liveEvents.length === 0 ? (
              <div style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
                {streaming ? 'Waiting for events…' : 'No events recorded for this run.'}
              </div>
            ) : liveEvents.map((ev, i) => <EventRow key={i} ev={ev} />)}
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

function MetricsDashboard() {
  const [usage, setUsage] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/billing/usage/?limit=30').catch(() => []),
      observe.tasks().catch(() => ({ results: [] })),
    ]).then(([u, t]) => {
      const arr = Array.isArray(u) ? u : (u?.results || [])
      setUsage(arr)
      setTasks(t?.results || [])
    }).finally(() => setLoading(false))
  }, [])

  // Group usage by date
  const byDate = useMemo(() => {
    const map = {}
    usage.forEach(u => {
      const d = (u.created_at || u.date || '').slice(0, 10)
      if (!d) return
      if (!map[d]) map[d] = { input: 0, output: 0, cost: 0 }
      map[d].input  += u.tokens_input  || 0
      map[d].output += u.tokens_output || 0
      map[d].cost   += parseFloat(u.cost || 0)
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
  }, [usage])

  const maxTokens = Math.max(1, ...byDate.map(([, v]) => v.input + v.output))
  const maxCost   = Math.max(0.0001, ...byDate.map(([, v]) => v.cost))

  // Runtime metrics from tasks
  const totalExec  = tasks.length
  const succeeded  = tasks.filter(t => t.status === 'COMPLETED').length
  const successRate = totalExec > 0 ? ((succeeded / totalExec) * 100).toFixed(1) : '—'

  const QUEUE = { critical: 0, standard: 0, batch: 0 }

  const W = 420
  const H = 80
  const pts = byDate.map(([, v], i) => {
    const x = byDate.length < 2 ? W / 2 : (i / (byDate.length - 1)) * W
    const y = H - (v.cost / maxCost) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Token usage bar chart */}
      <div className="card">
        <div className="obs-metrics-head">
          <RiBarChart2Line size={15} />
          <span>Token usage — last 14 days</span>
        </div>
        {loading ? (
          <div className="obs-empty" style={{ padding: '30px 0' }}>
            <div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div>
          </div>
        ) : byDate.length === 0 ? (
          <EmptyState icon={<RiBarChart2Line size={28} />} text="No usage data yet. Run agents to populate token metrics." />
        ) : (
          <div className="obs-bar-chart">
            {byDate.map(([date, v]) => {
              const inH  = ((v.input)  / maxTokens) * 100
              const outH = ((v.output) / maxTokens) * 100
              return (
                <div key={date} className="obs-bar-col" title={`${date}\nInput: ${v.input.toLocaleString()}\nOutput: ${v.output.toLocaleString()}`}>
                  <div className="obs-bar-stack">
                    <div className="obs-bar-seg obs-bar-output" style={{ height: `${outH}%` }} />
                    <div className="obs-bar-seg obs-bar-input"  style={{ height: `${inH}%`  }} />
                  </div>
                  <div className="obs-bar-label">{date.slice(5)}</div>
                </div>
              )
            })}
          </div>
        )}
        <div className="obs-chart-legend">
          <span><span className="obs-legend-dot" style={{ background: '#6b9cff' }} />Input tokens</span>
          <span><span className="obs-legend-dot" style={{ background: '#a855f7' }} />Output tokens</span>
        </div>
      </div>

      {/* Cost trend SVG polyline */}
      <div className="card">
        <div className="obs-metrics-head">
          <RiLineChartLine size={15} />
          <span>Daily cost trend</span>
        </div>
        {loading ? (
          <div className="obs-empty" style={{ padding: '30px 0' }}>
            <div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div>
          </div>
        ) : byDate.length < 2 ? (
          <EmptyState icon={<RiLineChartLine size={28} />} text="Need at least 2 days of usage data to draw a trend." />
        ) : (
          <div className="obs-svg-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="obs-cost-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cost-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,${H} ${pts} ${W},${H}`}
                fill="url(#cost-grad)"
              />
              <polyline
                points={pts}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="obs-svg-axis">
              {byDate.filter((_, i) => i % Math.ceil(byDate.length / 5) === 0).map(([d]) => (
                <span key={d}>{d.slice(5)}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Queue monitoring */}
        <div className="card">
          <div className="obs-metrics-head">
            <RiListCheck2 size={15} />
            <span>Queue status</span>
          </div>
          {[
            { key: 'critical', label: 'Critical queue', color: 'var(--red)' },
            { key: 'standard', label: 'Standard queue', color: 'var(--accent)' },
            { key: 'batch',    label: 'Batch queue',    color: 'var(--green)' },
          ].map(q => (
            <div key={q.key} className="obs-queue-row">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: q.color, flexShrink: 0 }} />
              <span className="obs-queue-label">{q.label}</span>
              <span className="obs-queue-count">{QUEUE[q.key]}</span>
              <span className={`badge badge-${QUEUE[q.key] === 0 ? 'green' : 'amber'}`} style={{ fontSize: 10 }}>
                {QUEUE[q.key] === 0 ? 'idle' : 'queued'}
              </span>
            </div>
          ))}
        </div>

        {/* Runtime metrics */}
        <div className="card">
          <div className="obs-metrics-head">
            <RiSpeedLine size={15} />
            <span>Runtime metrics</span>
          </div>
          <div className="obs-runtime-grid">
            <div className="obs-runtime-stat">
              <span className="obs-runtime-val">{totalExec}</span>
              <span className="obs-runtime-label">Total executions</span>
            </div>
            <div className="obs-runtime-stat">
              <span className="obs-runtime-val" style={{ color: 'var(--green)' }}>
                {successRate}{totalExec > 0 ? '%' : ''}
              </span>
              <span className="obs-runtime-label">Success rate</span>
            </div>
            <div className="obs-runtime-stat">
              <span className="obs-runtime-val">{succeeded}</span>
              <span className="obs-runtime-label">Completed</span>
            </div>
            <div className="obs-runtime-stat">
              <span className="obs-runtime-val" style={{ color: 'var(--red)' }}>
                {tasks.filter(t => t.status === 'FAILED').length}
              </span>
              <span className="obs-runtime-label">Failed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FailureAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    observe.failureAnalytics()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
  }

  if (!data) {
    return <EmptyState icon={<RiErrorWarningLine size={32} />} text="Could not load failure analytics." />
  }

  const maxAgentCount = Math.max(1, ...(data.failed_by_agent || []).map(a => a.count))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI chips */}
      <div className="obs-kpi-row">
        <div className="obs-kpi-chip">
          <span className="obs-kpi-val">{data.total_tasks ?? 0}</span>
          <span className="obs-kpi-label">Total Tasks</span>
        </div>
        <div className="obs-kpi-chip">
          <span className="obs-kpi-val" style={{ color: 'var(--red)' }}>{data.total_failed ?? 0}</span>
          <span className="obs-kpi-label">Total Failed</span>
        </div>
        <div className="obs-kpi-chip">
          <span className="obs-kpi-val" style={{ color: data.failure_rate > 25 ? 'var(--red)' : data.failure_rate > 10 ? 'var(--amber)' : 'var(--green)' }}>
            {data.failure_rate ?? 0}%
          </span>
          <span className="obs-kpi-label">Failure Rate</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Failures by agent */}
        <div className="card">
          <div className="obs-metrics-head">
            <RiErrorWarningLine size={15} />
            <span>Failures by Agent</span>
          </div>
          {(data.failed_by_agent || []).length === 0 ? (
            <EmptyState icon={<RiCheckLine size={24} />} text="No agent failures." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.failed_by_agent.map(a => (
                <div key={a.agent_id} className="obs-bar-list-row">
                  <div className="obs-bar-list-label">{a.agent_name}</div>
                  <div className="obs-bar-list-track">
                    <div
                      className="obs-bar-list-fill"
                      style={{ width: `${(a.count / maxAgentCount) * 100}%`, background: 'var(--red)' }}
                    />
                  </div>
                  <div className="obs-bar-list-count">{a.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top error patterns */}
        <div className="card">
          <div className="obs-metrics-head">
            <RiAlertLine size={15} />
            <span>Top Error Patterns</span>
          </div>
          {(data.top_errors || []).length === 0 ? (
            <EmptyState icon={<RiCheckLine size={24} />} text="No error patterns found." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.top_errors.map((e, i) => (
                <div key={i} className="obs-error-row">
                  <div className="obs-error-msg" title={e.error}>{e.error || 'Unknown error'}</div>
                  <span className="obs-error-count">{e.count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const STATUS_COLORS = {
  COMPLETED: 'var(--green)',
  FAILED: 'var(--red)',
  PENDING: 'var(--amber)',
  IN_PROGRESS: 'var(--accent)',
  BLOCKED: 'var(--text)',
}

function TaskPerformance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    observe.retryAnalytics()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
  }

  if (!data) {
    return <EmptyState icon={<RiRefreshLine size={32} />} text="Could not load task performance data." />
  }

  const breakdown = data.task_status_breakdown || []
  const total = breakdown.reduce((s, b) => s + b.count, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stacked bar */}
      <div className="card">
        <div className="obs-metrics-head">
          <RiBarChart2Line size={15} />
          <span>Task Status Breakdown</span>
          {total > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text)', fontWeight: 400 }}>{total} total tasks</span>}
        </div>
        {total === 0 ? (
          <EmptyState icon={<RiListCheck2 size={24} />} text="No tasks recorded yet." />
        ) : (
          <>
            <div className="obs-stacked-bar">
              {breakdown.filter(b => b.count > 0).map(b => (
                <div
                  key={b.status}
                  className="obs-stacked-seg"
                  style={{ width: `${(b.count / total) * 100}%`, background: STATUS_COLORS[b.status] || 'var(--border)' }}
                  title={`${b.status}: ${b.count}`}
                />
              ))}
            </div>
            <div className="obs-stacked-legend">
              {breakdown.map(b => (
                <div key={b.status} className="obs-stacked-legend-item">
                  <span className="obs-legend-dot" style={{ background: STATUS_COLORS[b.status] || 'var(--border)' }} />
                  <span>{b.status.replace('_', ' ')}</span>
                  <span style={{ color: 'var(--text-h)', fontWeight: 700, marginLeft: 4 }}>{b.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Agent performance table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="obs-metrics-head" style={{ marginBottom: 0 }}>
            <RiSpeedLine size={15} />
            <span>Agent Performance</span>
          </div>
        </div>
        {(data.agent_performance || []).length === 0 ? (
          <EmptyState icon={<RiListCheck2 size={24} />} text="No agent performance data yet." />
        ) : (
          <table className="obs-perf-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Failed</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.agent_performance.map((a, i) => {
                const rateColor = a.success_rate >= 80 ? 'var(--green)' : a.success_rate >= 50 ? 'var(--amber)' : 'var(--red)'
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{a.agent_name}</td>
                    <td>{a.total}</td>
                    <td style={{ color: 'var(--green)' }}>{a.completed}</td>
                    <td style={{ color: a.failed > 0 ? 'var(--red)' : 'var(--text)' }}>{a.failed}</td>
                    <td>
                      <span style={{ color: rateColor, fontWeight: 700 }}>{a.success_rate}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function WorkflowGraph() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    observe.workflowGraph()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="obs-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
  }

  if (!data) {
    return <EmptyState icon={<RiFlowChart size={32} />} text="Could not load workflow graph." />
  }

  const nodes = data.nodes || []
  const edges = data.edges || []

  if (nodes.length === 0) {
    return <EmptyState icon={<RiFlowChart size={32} />} text="No workflow tasks yet. Run a DAG workflow to see the graph." />
  }

  // Build adjacency: node id -> list of dep node ids (from)
  const depsOf = {}
  nodes.forEach(n => { depsOf[n.id] = [] })
  edges.forEach(e => {
    if (depsOf[e.to]) depsOf[e.to].push(e.from)
  })

  // Build label lookup
  const nodeById = {}
  nodes.forEach(n => { nodeById[n.id] = n })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="obs-metrics-head">
          <RiFlowChart size={15} />
          <span>Workflow Task Graph</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text)', fontWeight: 400 }}>
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>

        {/* Legend */}
        <div className="obs-stacked-legend" style={{ marginBottom: 16 }}>
          {Object.entries(STATUS_COLORS).map(([s, c]) => (
            <div key={s} className="obs-stacked-legend-item">
              <span className="obs-legend-dot" style={{ background: c }} />
              <span>{s.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {nodes.map(node => {
            const depNodes = depsOf[node.id]?.map(id => nodeById[id]).filter(Boolean) || []
            return (
              <div key={node.id} className="obs-graph-node">
                <div className="obs-graph-node-header">
                  <span
                    className="obs-graph-status-dot"
                    style={{ background: STATUS_COLORS[node.status] || 'var(--border)' }}
                  />
                  <span className="obs-graph-label">{node.label}</span>
                  <span className="obs-graph-agent">{node.agent_name}</span>
                  <span className={`badge badge-${node.status === 'COMPLETED' ? 'green' : node.status === 'FAILED' ? 'red' : node.status === 'IN_PROGRESS' ? 'blue' : 'amber'}`} style={{ fontSize: 10 }}>
                    {node.status?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                {depNodes.length > 0 && (
                  <div className="obs-graph-deps">
                    <span className="obs-graph-dep-label">depends on:</span>
                    {depNodes.map(d => (
                      <span key={d.id} className="obs-graph-dep-chip">
                        <span className="obs-legend-dot" style={{ background: STATUS_COLORS[d.status] || 'var(--border)', width: 7, height: 7 }} />
                        {d.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
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
