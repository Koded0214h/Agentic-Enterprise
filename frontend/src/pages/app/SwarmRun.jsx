import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  RiArrowLeftLine, RiRocketLine, RiCheckLine, RiLoader4Line,
  RiTimeLine, RiRobot2Line, RiSendPlaneLine, RiErrorWarningLine,
  RiTerminalLine, RiNodeTree,
} from 'react-icons/ri'
import { api } from '../../api/client'
import './SwarmRun.css'

// ─── Phase definitions ────────────────────────────────────────────────────────
const PHASES = [
  { id: 'questionnaire', label: 'Questionnaire', desc: 'Clarifying requirements' },
  { id: 'planner',       label: 'Planner',       desc: 'Designing architecture'  },
  { id: 'execute',       label: 'Execute',        desc: 'Dispatching agents'      },
  { id: 'debug',         label: 'Debug',          desc: 'Fixing issues'           },
  { id: 'ship',          label: 'Ship',           desc: 'Final review'            },
]

const PHASE_TRIGGERS = [
  /PHASE\s+1\s*[\/|]\s*5|\bQUESTIONNAIRE\b/i,
  /PHASE\s+2\s*[\/|]\s*5|\bPLANNER\b/i,
  /PHASE\s+3\s*[\/|]\s*5|\bEXECUTE\b/i,
  /PHASE\s+4\s*[\/|]\s*5|\bDEBUG\b/i,
  /PHASE\s+5\s*[\/|]\s*5|\bSHIP\b/i,
]

const DISPATCH_RE = /Dispatching to ([^\s.]+)/i
const AGENT_DONE_RE = /\bSUCCESS\b ([^\s(]+)|✅.*?([a-z][\w-]+)/i

// Detect when orchestrator is prompting for interactive input.
// Kept narrow — native runs never prompt; only old CLI runs do.
const PROMPT_PATTERNS = [
  /\[Y\/n\]/i, /\[y\/N\]/i,
  /^>\s*$/, /^\?\s*$/,
]

function looksLikePrompt(line) {
  return PROMPT_PATTERNS.some(p => p.test(line))
}

// ─── Terminal line classifier ─────────────────────────────────────────────────
function lineClass(content = '') {
  if (/^\[sys\]/.test(content))          return 'tl-sys'
  if (/^PHASE\s+\d/i.test(content))      return 'tl-phase'
  if (/^\s+SUCCESS\b/i.test(content))    return 'tl-success'
  if (/^\s+FAILED\b/i.test(content))     return 'tl-fail'
  if (/^\[error\]/i.test(content))       return 'tl-error'
  if (/^\[wrote\]/i.test(content))       return 'tl-wrote'
  if (/^#{1,3} /.test(content))          return 'tl-heading'
  if (/^\s*[*•-] /.test(content))        return 'tl-bullet'
  if (/^\s*`{3}/.test(content))          return 'tl-fence'
  if (/^\s{4,}/.test(content))           return 'tl-indent'
  return ''
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SwarmRun() {
  const { runId } = useParams()

  const [lines, setLines] = useState([])
  const [phases, setPhases] = useState(PHASES.map(p => ({ ...p, state: 'pending', agents: [] })))
  const [done, setDone] = useState(false)
  const [exitCode, setExitCode] = useState(null)
  const [goal, setGoal] = useState('')
  const [model, setModel] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [inputVal, setInputVal] = useState('')
  const [awaitingInput, setAwaitingInput] = useState(false)
  const [view, setView] = useState('terminal')
  const [streamStatus, setStreamStatus] = useState('connecting') // connecting | live | error

  const termRef = useRef(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const lastLineTime = useRef(Date.now())

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Detect input-waiting when stream stalls
  useEffect(() => {
    if (done) return
    const check = setInterval(() => {
      if (Date.now() - lastLineTime.current > 1500 && lines.length > 0) {
        const last = lines[lines.length - 1]
        if (last && looksLikePrompt(last.content)) setAwaitingInput(true)
      }
    }, 500)
    return () => clearInterval(check)
  }, [done, lines])

  // Load goal/model from status endpoint
  useEffect(() => {
    api.get(`/swarm/run/${runId}/`).then(d => {
      setGoal(d.goal || '')
      setModel(d.model || '')
    }).catch(() => {})
  }, [runId])

  // Poll backend for new lines every 500ms
  useEffect(() => {
    let cursor = 0
    let active = true
    let timer = null

    function addLine(content, extra = {}) {
      setLines(prev => [...prev, { content, ts: Date.now(), ...extra }])
    }

    function handleLine(content) {
      lastLineTime.current = Date.now()
      setAwaitingInput(false)
      addLine(content)

      PHASE_TRIGGERS.forEach((re, i) => {
        if (!re.test(content)) return
        setPhases(prev => prev.map((p, pi) => {
          if (pi < i)   return { ...p, state: 'done' }
          if (pi === i) return { ...p, state: 'running' }
          return p
        }))
      })

      const dm = content.match(DISPATCH_RE)
      if (dm) {
        setPhases(prev => prev.map((p, pi) => {
          if (pi !== 2) return p
          if (p.agents.find(a => a.name === dm[1])) return p
          return { ...p, agents: [...p.agents, { name: dm[1], state: 'running' }] }
        }))
      }

      const done1 = content.match(AGENT_DONE_RE)
      if (done1) {
        const name = (done1[1] || done1[2] || '').toLowerCase()
        setPhases(prev => prev.map((p, pi) => {
          if (pi !== 2) return p
          return { ...p, agents: p.agents.map(a => a.name.toLowerCase().includes(name) ? { ...a, state: 'done' } : a) }
        }))
      }
    }

    async function poll() {
      if (!active) return
      try {
        const data = await api.get(`/swarm/run/${runId}/poll/?from=${cursor}`)
        if (!active) return
        setStreamStatus('live')
        for (const evt of (data.lines || [])) {
          cursor++
          if (evt.type === 'line') handleLine(evt.content)
        }
        if (data.done) {
          setDone(true)
          setExitCode(data.exit_code)
          setPhases(prev => prev.map(p => p.state === 'running' ? { ...p, state: 'done' } : p))
          return
        }
      } catch (err) {
        if (!active) return
        setStreamStatus('error')
        addLine(`[error] poll failed — ${err.message} — retrying…`)
        timer = setTimeout(poll, 2000)
        return
      }
      timer = setTimeout(poll, 500)
    }

    poll()
    return () => { active = false; clearTimeout(timer) }
  }, [runId])

  // Scroll terminal
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lines])

  // Focus input when awaiting
  useEffect(() => {
    if (awaitingInput) inputRef.current?.focus()
  }, [awaitingInput])

  async function sendInput(e) {
    e.preventDefault()
    if (!inputVal.trim() && inputVal !== '') return
    const text = inputVal
    setInputVal('')
    setAwaitingInput(false)
    setLines(prev => [...prev, { content: `> ${text}`, ts: Date.now(), isInput: true }])
    try {
      await fetch(`/api/swarm/run/${runId}/input/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getAccess()}`,
        },
        body: JSON.stringify({ text }),
      })
    } catch {}
  }

  function fmt(s) {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const donePhases = phases.filter(p => p.state === 'done').length
  const progress = done ? 100 : Math.round((donePhases / PHASES.length) * 100)
  const currentPhase = phases.find(p => p.state === 'running')
  const allAgents = phases[2]?.agents || []

  return (
    <div className="sr-page">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sr-header">
        <div className="sr-header-left">
          <Link to="/app" className="sr-back"><RiArrowLeftLine size={14} /> Back</Link>
          <div className="sr-header-meta">
            <div className="sr-header-goal">
              <RiRocketLine size={13} className="sr-header-icon" />
              <span>{goal || 'Swarm run'}</span>
            </div>
            {model && <span className="sr-model-tag">{model}</span>}
          </div>
        </div>
        <div className="sr-header-right">
          {done ? (
            <span className={`sr-status-badge ${exitCode === 0 ? 'ok' : 'fail'}`}>
              {exitCode === 0 ? <><RiCheckLine size={12} /> Complete</> : <><RiErrorWarningLine size={12} /> Failed</>}
            </span>
          ) : (
            <span className="sr-status-badge running">
              <RiLoader4Line size={12} className="spin" />
              {currentPhase?.label || 'Starting…'}
            </span>
          )}
          <div className="sr-timer"><RiTimeLine size={12} />{fmt(elapsed)}</div>
          <div className="sr-view-toggle">
            <button className={view === 'split'    ? 'active' : ''} onClick={() => setView('split')}    title="Split view">⊞</button>
            <button className={view === 'terminal' ? 'active' : ''} onClick={() => setView('terminal')} title="Terminal only"><RiTerminalLine size={13} /></button>
            <button className={view === 'nodes'    ? 'active' : ''} onClick={() => setView('nodes')}    title="Phases only"><RiNodeTree size={13} /></button>
          </div>
        </div>
      </div>

      {/* ── Phase strip (always visible in split/nodes) ─────────────────── */}
      {view !== 'terminal' && (
        <div className="sr-phase-strip">
          {phases.map((phase, i) => (
            <div key={phase.id} className="sr-ps-item">
              {i > 0 && <div className={`sr-ps-connector ${phases[i-1].state === 'done' ? 'lit' : ''}`} />}
              <div className={`sr-ps-step sr-ps-${phase.state}`}>
                <div className="sr-ps-circle">
                  <PhaseIcon state={phase.state} num={i + 1} />
                </div>
                <div className="sr-ps-text">
                  <span className="sr-ps-label">{phase.label}</span>
                  <span className="sr-ps-desc">{phase.desc}</span>
                  {phase.id === 'execute' && phase.agents.map(a => (
                    <span key={a.name} className={`sr-ps-agent sr-ps-agent-${a.state}`}>
                      <RiRobot2Line size={9} />{a.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {done && (
            <div className={`sr-ps-result ${exitCode === 0 ? 'ok' : 'fail'}`}>
              {exitCode === 0
                ? <><RiCheckLine size={13} /> {allAgents.length} agent{allAgents.length !== 1 ? 's' : ''} · {fmt(elapsed)}</>
                : <><RiErrorWarningLine size={13} /> exit {exitCode}</>}
            </div>
          )}
        </div>
      )}

      {/* ── Terminal ────────────────────────────────────────────────────── */}
      {view !== 'nodes' && (
        <div className="sr-terminal-panel">
          <div className="sr-term-bar">
            <span className="sr-term-dot red" />
            <span className="sr-term-dot amber" />
            <span className="sr-term-dot green" />
            <span className="sr-term-title">orchestrator · {goal}</span>
            {!done && streamStatus === 'connecting' && <span className="sr-term-status dim">connecting…</span>}
            {!done && streamStatus === 'live'       && <span className="sr-term-status live"><span className="sr-live-dot" /> live</span>}
            {!done && streamStatus === 'error'      && <span className="sr-term-status err">stream error</span>}
            {done  && <span className={`sr-term-exit ${exitCode === 0 ? 'ok' : 'fail'}`}>exit {exitCode}</span>}
          </div>

          <div className="sr-terminal" ref={termRef}>
            {lines.map((l, i) => (
              <div key={i} className={`sr-tline ${l.isInput ? 'tl-input' : lineClass(l.content)}`}>
                {l.content}
              </div>
            ))}
            {!done && <div className="sr-tline"><span className="sr-blink">▊</span></div>}
          </div>

          <form className={`sr-input-bar ${awaitingInput ? 'active' : ''}`} onSubmit={sendInput}>
            <span className="sr-input-prompt">›</span>
            <input
              ref={inputRef}
              className="sr-input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={awaitingInput ? 'Orchestrator is waiting…' : 'Send input to swarm…'}
              disabled={done}
              onKeyDown={e => { if (e.key === 'Enter') sendInput(e) }}
            />
            <button type="submit" className="sr-input-send" disabled={done || !inputVal.trim()}>
              <RiSendPlaneLine size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function PhaseIcon({ state, num }) {
  if (state === 'done')    return <RiCheckLine size={12} />
  if (state === 'running') return <RiLoader4Line size={12} className="spin" />
  return <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)' }}>{num}</span>
}

function AgentDot({ state }) {
  const cls = state === 'done' ? 'green' : state === 'running' ? 'accent' : 'dim'
  return <span className={`sr-agent-dot sr-agent-dot-${cls}`} />
}
