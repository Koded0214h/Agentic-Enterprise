import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  RiArrowLeftLine, RiCheckboxCircleLine, RiLoader4Line,
  RiTimeLine, RiCoinLine, RiCloseLine, RiAlertLine,
  RiPlayLine, RiPauseLine, RiStopLine,
} from 'react-icons/ri'
import './WorkflowRun.css'

const STATUS = {
  pending:  { label: 'Pending',    cls: 'pending'  },
  running:  { label: 'Running',    cls: 'running'  },
  done:     { label: 'Completed',  cls: 'done'     },
  blocked:  { label: 'Blocked',    cls: 'blocked'  },
  approval: { label: 'Awaiting Approval', cls: 'approval' },
}

const INITIAL_NODES = [
  { id: 'research',    col: 0, row: 0, label: 'Market Research',    agent: 'Research Agent',   status: 'done',    result: 'Found 847 B2B SaaS firms matching ICP in US/UK markets' },
  { id: 'competitors', col: 0, row: 1, label: 'Competitor Analysis', agent: 'Research Agent',   status: 'done',    result: 'Analysed 12 direct competitors, identified 3 key gaps' },
  { id: 'prospects',  col: 1, row: 0, label: 'Find Prospects',      agent: 'Sales Agent',      status: 'running', result: null },
  { id: 'persona',    col: 1, row: 1, label: 'Build ICP Persona',   agent: 'Growth Agent',     status: 'running', result: null },
  { id: 'validate',   col: 2, row: 0, label: 'Validate Emails',     agent: 'Validator Agent',  status: 'pending', result: null },
  { id: 'draft',      col: 2, row: 1, label: 'Draft Outreach',      agent: 'Copywriter Agent', status: 'pending', result: null },
  { id: 'send',       col: 3, row: 0, label: 'Send Sequences',      agent: 'Outreach Agent',   status: 'pending', result: null },
  { id: 'crm',        col: 3, row: 1, label: 'Sync to CRM',         agent: 'CRM Agent',        status: 'pending', result: null },
]

const EDGES = [
  ['research', 'prospects'], ['research', 'persona'],
  ['competitors', 'persona'],
  ['prospects', 'validate'], ['prospects', 'draft'],
  ['persona', 'draft'],
  ['validate', 'send'],
  ['draft', 'send'],
  ['send', 'crm'],
]

const STREAM_CHUNKS = [
  'Scanning Apollo.io for prospects matching ICP criteria...',
  'Filter: B2B SaaS, 50–500 employees, US/UK...',
  'Found 312 initial matches. Applying enrichment...',
  'LinkedIn validation in progress...',
  'Email verification: 98.2% deliverability confirmed...',
  'Scoring prospects by ICP fit: 147 high-fit, 89 medium...',
  'Exporting top 100 prospects to outreach queue...',
]

export default function WorkflowRun() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const blueprint = searchParams.get('blueprint') || 'outbound-sales'

  const [nodes, setNodes] = useState(INITIAL_NODES)
  const [elapsed, setElapsed] = useState(0)
  const [tokens, setTokens] = useState(0)
  const [cost, setCost] = useState(0)
  const [streamLines, setStreamLines] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [traceOpen, setTraceOpen] = useState(false)
  const [traceTier, setTraceTier] = useState(1)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)

  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const streamIdx = useRef(0)
  const nodeRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!paused) {
        setElapsed(e => e + 1)
        setTokens(t => t + Math.floor(Math.random() * 80 + 20))
        setCost(c => +(c + 0.0012).toFixed(4))
      }
    }, 1000)

    streamRef.current = setInterval(() => {
      if (!paused && streamIdx.current < STREAM_CHUNKS.length) {
        setStreamLines(l => [...l, STREAM_CHUNKS[streamIdx.current]])
        streamIdx.current++
      }
    }, 1400)

    nodeRef.current = setTimeout(() => {
      setNodes(n => n.map(node =>
        node.id === 'prospects'
          ? { ...node, status: 'approval', result: null }
          : node
      ))
    }, 7000)

    return () => {
      clearInterval(timerRef.current)
      clearInterval(streamRef.current)
      clearTimeout(nodeRef.current)
    }
  }, [])

  useEffect(() => {
    if (paused) return
    clearInterval(streamRef.current)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1)
      setTokens(t => t + Math.floor(Math.random() * 80 + 20))
      setCost(c => +(c + 0.0012).toFixed(4))
    }, 1000)
    streamRef.current = setInterval(() => {
      if (streamIdx.current < STREAM_CHUNKS.length) {
        setStreamLines(l => [...l, STREAM_CHUNKS[streamIdx.current]])
        streamIdx.current++
      }
    }, 1400)
    return () => {
      clearInterval(timerRef.current)
      clearInterval(streamRef.current)
    }
  }, [paused])

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  function openTrace(node) {
    setSelectedNode(node)
    setTraceOpen(true)
    setTraceTier(1)
  }

  const approvalNodes = nodes.filter(n => n.status === 'approval')

  return (
    <div className="wfr-page">
      {/* Top bar */}
      <div className="wfr-topbar">
        <div className="wfr-topbar-left">
          <Link to="/app" className="wfr-back"><RiArrowLeftLine size={15} /> Dashboard</Link>
          <span className="wfr-title">Workflow run</span>
          <span className="mono wfr-id">{id}</span>
        </div>
        <div className="wfr-topbar-right">
          <div className="wfr-metric">
            <RiTimeLine size={13} /> {formatTime(elapsed)}
          </div>
          <div className="wfr-metric">
            <RiCoinLine size={13} /> ${cost.toFixed(4)}
          </div>
          <div className="wfr-metric">
            {tokens.toLocaleString()} tok
          </div>
          <button
            className={`btn btn-sm ${paused ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPaused(p => !p)}
          >
            {paused ? <><RiPlayLine size={13} /> Resume</> : <><RiPauseLine size={13} /> Pause</>}
          </button>
        </div>
      </div>

      {/* Approval banner */}
      {approvalNodes.length > 0 && (
        <div className="wfr-approval-banner">
          <RiAlertLine size={16} />
          <span>
            <strong>{approvalNodes[0].agent}</strong> is waiting for your approval —
            high-risk action detected
          </span>
          <Link to={`/app/approvals/approval_${id}`} className="btn btn-primary btn-sm">
            Review now →
          </Link>
        </div>
      )}

      <div className="wfr-body">
        {/* DAG Canvas */}
        <div className="wfr-canvas-wrap">
          <DagCanvas nodes={nodes} edges={EDGES} onNodeClick={openTrace} />
        </div>

        {/* Stream panel */}
        <div className="wfr-stream-panel">
          <div className="wfr-stream-head">
            <span>Sales Agent</span>
            <span className="badge badge-purple">Find Prospects</span>
          </div>
          <div className="wfr-stream-body">
            {streamLines.map((line, i) => (
              <div key={i} className="wfr-stream-line">
                <span className="mono wfr-stream-ts">{String(i + 1).padStart(2, '0')}</span>
                <span>{line}</span>
              </div>
            ))}
            {!paused && streamIdx.current < STREAM_CHUNKS.length && (
              <div className="wfr-stream-cursor" />
            )}
          </div>
        </div>
      </div>

      {/* Trace drawer */}
      {traceOpen && selectedNode && (
        <TraceDrawer
          node={selectedNode}
          tier={traceTier}
          onTier={setTraceTier}
          onClose={() => setTraceOpen(false)}
        />
      )}
    </div>
  )
}

function DagCanvas({ nodes, edges, onNodeClick }) {
  const cols = Math.max(...nodes.map(n => n.col)) + 1
  const rows = Math.max(...nodes.map(n => n.row)) + 1
  const COL_W = 200
  const ROW_H = 100
  const NODE_W = 168
  const NODE_H = 68
  const PAD = 16

  function nodePos(n) {
    return {
      x: PAD + n.col * COL_W,
      y: PAD + n.row * ROW_H,
    }
  }

  function edgePath(fromId, toId) {
    const from = nodes.find(n => n.id === fromId)
    const to = nodes.find(n => n.id === toId)
    if (!from || !to) return ''
    const fp = nodePos(from)
    const tp = nodePos(to)
    const x1 = fp.x + NODE_W
    const y1 = fp.y + NODE_H / 2
    const x2 = tp.x
    const y2 = tp.y + NODE_H / 2
    const cx = (x1 + x2) / 2
    return `M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`
  }

  const svgW = PAD * 2 + cols * COL_W
  const svgH = PAD * 2 + rows * ROW_H

  return (
    <div className="dag-canvas">
      <svg className="dag-svg" width={svgW} height={svgH} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--border-2)" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--accent)" />
          </marker>
        </defs>
        {edges.map(([from, to]) => {
          const fromNode = nodes.find(n => n.id === from)
          const active = fromNode?.status === 'done' || fromNode?.status === 'running'
          return (
            <path
              key={`${from}-${to}`}
              d={edgePath(from, to)}
              fill="none"
              stroke={active ? 'var(--accent)' : 'var(--border-2)'}
              strokeWidth={active ? 1.5 : 1}
              strokeOpacity={active ? 0.6 : 0.4}
              markerEnd={active ? 'url(#arrow-active)' : 'url(#arrow)'}
              strokeDasharray={active ? 'none' : '4 4'}
            />
          )
        })}
      </svg>

      {nodes.map(node => {
        const { x, y } = nodePos(node)
        return (
          <button
            key={node.id}
            className={`dag-node dag-node-${node.status}`}
            style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
            onClick={() => onNodeClick(node)}
          >
            <div className="dag-node-head">
              <span className="dag-node-agent">{node.agent}</span>
              <NodeIcon status={node.status} />
            </div>
            <span className="dag-node-label">{node.label}</span>
            {node.result && (
              <span className="dag-node-result">{node.result.slice(0, 48)}…</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function NodeIcon({ status }) {
  if (status === 'done') return <RiCheckboxCircleLine size={14} color="var(--green)" />
  if (status === 'running') return <RiLoader4Line size={14} color="var(--accent)" className="spin-icon" />
  if (status === 'approval') return <RiAlertLine size={14} color="var(--amber)" />
  return null
}

function TraceDrawer({ node, tier, onTier, onClose }) {
  const tiers = [
    {
      label: 'Summary',
      content: (
        <div className="trace-summary">
          <p className="trace-result">
            {node.result || `${node.label} is currently ${node.status}.`}
          </p>
          <div className="trace-meta-row">
            <span className="trace-meta-label">Agent</span>
            <span>{node.agent}</span>
          </div>
          <div className="trace-meta-row">
            <span className="trace-meta-label">Status</span>
            <span className={`badge badge-${
              { done: 'green', running: 'purple', approval: 'amber', pending: 'purple', blocked: 'red' }[node.status]
            }`}>{STATUS[node.status]?.label}</span>
          </div>
          <div className="trace-meta-row">
            <span className="trace-meta-label">Duration</span>
            <span>1m 24s</span>
          </div>
        </div>
      ),
    },
    {
      label: 'Decision',
      content: (
        <div className="trace-decision">
          <div className="trace-decision-row">
            <span className="trace-meta-label">Policy evaluated</span>
            <span>Global Allow</span>
          </div>
          <div className="trace-decision-row">
            <span className="trace-meta-label">Effect</span>
            <span className="badge badge-green">ALLOW</span>
          </div>
          <div className="trace-decision-row">
            <span className="trace-meta-label">Eval time</span>
            <span>38ms</span>
          </div>
          <div className="trace-decision-row">
            <span className="trace-meta-label">Risk score</span>
            <span>12 / 100</span>
          </div>
        </div>
      ),
    },
    {
      label: 'Raw',
      content: (
        <pre className="trace-raw mono">{JSON.stringify({
          node_id: node.id,
          agent: node.agent,
          status: node.status,
          input_data: { query: 'B2B SaaS 50-500 employees US/UK', filters: ['active', 'tech'] },
          output_data: node.result ? { result: node.result, count: 147 } : null,
          duration_ms: 84230,
          policy_result: { decision: 'allow', policy: 'Global Allow', risk_score: 12 },
        }, null, 2)}</pre>
      ),
    },
  ]

  return (
    <div className="trace-overlay">
      <div className="trace-drawer">
        <div className="trace-drawer-head">
          <div>
            <p className="trace-drawer-label">{node.agent}</p>
            <h3>{node.label}</h3>
          </div>
          <button className="trace-close" onClick={onClose}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="trace-tier-tabs">
          {tiers.map((t, i) => (
            <button
              key={i}
              className={`trace-tier-tab ${tier === i + 1 ? 'active' : ''}`}
              onClick={() => onTier(i + 1)}
            >
              Tier {i + 1} — {t.label}
            </button>
          ))}
        </div>

        <div className="trace-tier-body">
          {tiers[tier - 1].content}
        </div>
      </div>
    </div>
  )
}
