import { useState, useEffect, useRef, useCallback } from 'react'
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
  /PHASE\s+1\s*[\/|]\s*5|QUESTIONNAIRE/i,
  /PHASE\s+2\s*[\/|]\s*5|PLANNER/i,
  /PHASE\s+3\s*[\/|]\s*5|EXECUTE/i,
  /PHASE\s+4\s*[\/|]\s*5|DEBUG/i,
  /PHASE\s+5\s*[\/|]\s*5|SHIP/i,
]

const DISPATCH_RE = /Dispatching to ([^\s.]+)/i
const AGENT_DONE_RE = /SUCCESS ([^\s]+)|✅.*?([a-z][\w-]+)/i

// Detect when orchestrator is prompting for input
const PROMPT_PATTERNS = [
  /\?\s*$/, /\[Y\/n\]/i, /\[y\/N\]/i, /confirm/i,
  /enter\s+(your|the)/i, /type\s+your/i, /answer/i,
  />\s*$/, /:\s*$/,
]

function looksLikePrompt(line) {
  return PROMPT_PATTERNS.some(p => p.test(line))
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SwarmRun() {
  const { runId } = useParams()

  const [lines, setLines] = useState([])
  const [phases, setPhases] = useState(PHASES.map(p => ({ ...p, state: 'pending', agents: [] })))
  const [activePhase, setActivePhase] = useState(-1)
  const [done, setDone] = useState(false)
  const [exitCode, setExitCode] = useState(null)
  const [goal, setGoal] = useState('')
  const [model, setModel] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [inputVal, setInputVal] = useState('')
  const [awaitingInput, setAwaitingInput] = useState(false)
  const [view, setView] = useState('split') // 'split' | 'terminal' | 'nodes'

  const termRef = useRef(null)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const lastLineTime = useRef(Date.now())

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!done) setElapsed(e => e + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [done])

  // Detect input-waiting state (stream stalls for 1.5s)
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

  // Load goal from status endpoint
  useEffect(() => {
    api.get(`/swarm/run/${runId}/`).then(d => {
      setGoal(d.goal || '')
      setModel(d.model || '')
    }).catch(() => {})
  }, [runId])

  // SSE stream
  useEffect(() => {
    const token = api.getAccess()
    let active = true

    async function connect() {
      try {
        const res = await fetch(`/api/swarm/run/${runId}/stream/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok || !active) return

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''

        while (active) {
          const { done: d, value } = await reader.read()
          if (d) break
          buf += decoder.decode(value, { stream: true })
          const parts = buf.split('\n')
          buf = parts.pop()
          for (const part of parts) {
            if (!part.startsWith('data: ')) continue
            try {
              const evt = JSON.parse(part.slice(6))
              if (evt.type === 'ping') continue
              if (evt.type === 'done') {
                setDone(true)
                setExitCode(evt.exit_code)
                setPhases(prev => prev.map((p, i) =>
                  i === activePhase ? { ...p, state: 'done' } : p
                ))
              } else if (evt.type === 'line') {
                lastLineTime.current = Date.now()
                setAwaitingInput(false)
                processLine(evt.content)
              }
            } catch {}
          }
        }
      } catch {}
    }

    connect()
    return () => { active = false }
  }, [runId])

  // Scroll terminal
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lines])

  // Focus input when awaiting
  useEffect(() => {
    if (awaitingInput) inputRef.current?.focus()
  }, [awaitingInput])

  const processLine = useCallback((content) => {
    setLines(prev => [...prev, { content, ts: Date.now() }])

    // Phase detection
    PHASE_TRIGGERS.forEach((re, i) => {
      if (re.test(content)) {
        setActivePhase(i)
        setPhases(prev => prev.map((p, pi) => {
          if (pi < i)  return { ...p, state: 'done' }
          if (pi === i) return { ...p, state: 'running' }
          return p
        }))
      }
    })

    // Agent dispatch detection
    const dispatchMatch = content.match(DISPATCH_RE)
    if (dispatchMatch) {
      const agentName = dispatchMatch[1]
      setPhases(prev => prev.map((p, pi) => {
        if (pi !== 2) return p // only under Execute (phase index 2)
        const already = p.agents.find(a => a.name === agentName)
        if (already) return p
        return { ...p, agents: [...p.agents, { name: agentName, state: 'running' }] }
      }))
    }

    // Agent done detection
    const doneMatch = content.match(AGENT_DONE_RE)
    if (doneMatch) {
      const agentName = (doneMatch[1] || doneMatch[2] || '').toLowerCase()
      setPhases(prev => prev.map((p, pi) => {
        if (pi !== 2) return p
        return {
          ...p,
          agents: p.agents.map(a =>
            a.name.toLowerCase().includes(agentName) ? { ...a, state: 'done' } : a
          ),
        }
      }))
    }
  }, [activePhase])

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
      {/* Top bar */}
      <div className="sr-topbar">
        <div className="sr-topbar-left">
          <Link to="/app" className="sr-back"><RiArrowLeftLine size={14} /> Back</Link>
          <RiRocketLine size={14} className="sr-topbar-icon" />
          <span className="sr-topbar-goal">{goal || 'Swarm run'}</span>
        </div>
        <div className="sr-topbar-center">
          <div className="sr-progress-bar">
            <div className="sr-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="sr-progress-label">
            {done ? 'Complete' : (currentPhase?.label || 'Starting…')}
          </span>
        </div>
        <div className="sr-topbar-right">
          {model && <span className="sr-model-tag">{model}</span>}
          <div className="sr-timer"><RiTimeLine size={12} />{fmt(elapsed)}</div>
          <div className="sr-view-toggle">
            <button className={view === 'nodes' ? 'active' : ''} onClick={() => setView('nodes')} title="Nodes view"><RiNodeTree size={14} /></button>
            <button className={view === 'split' ? 'active' : ''} onClick={() => setView('split')} title="Split view">⊞</button>
            <button className={view === 'terminal' ? 'active' : ''} onClick={() => setView('terminal')} title="Terminal only"><RiTerminalLine size={14} /></button>
          </div>
        </div>
      </div>

      <div className={`sr-body sr-body-${view}`}>
        {/* ─── Phase / Node panel ─── */}
        {view !== 'terminal' && (
          <div className="sr-nodes-panel">
            <div className="sr-phases-flow">
              {phases.map((phase, i) => (
                <div key={phase.id} className="sr-phase-col">
                  {/* Connector arrow */}
                  {i > 0 && (
                    <div className={`sr-phase-arrow ${phases[i - 1].state === 'done' ? 'active' : ''}`}>
                      →
                    </div>
                  )}

                  <div className={`sr-phase-node sr-phase-${phase.state}`}>
                    <div className="sr-phase-node-head">
                      <PhaseIcon state={phase.state} />
                      <span className="sr-phase-num">{i + 1}</span>
                    </div>
                    <span className="sr-phase-label">{phase.label}</span>
                    <span className="sr-phase-desc">{phase.desc}</span>
                  </div>

                  {/* Sub-agents under Execute */}
                  {phase.id === 'execute' && phase.agents.length > 0 && (
                    <div className="sr-agents-col">
                      {phase.agents.map(agent => (
                        <div key={agent.name} className={`sr-agent-node sr-agent-${agent.state}`}>
                          <RiRobot2Line size={11} />
                          <span>{agent.name}</span>
                          <AgentDot state={agent.state} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {done && (
              <div className={`sr-done-banner ${exitCode === 0 ? 'ok' : 'fail'}`}>
                {exitCode === 0
                  ? <><RiCheckLine size={14} /> Swarm completed — {allAgents.length} agent{allAgents.length !== 1 ? 's' : ''} dispatched</>
                  : <><RiErrorWarningLine size={14} /> Run exited with code {exitCode}</>
                }
              </div>
            )}
          </div>
        )}

        {/* ─── Terminal panel ─── */}
        {view !== 'nodes' && (
          <div className="sr-terminal-panel">
            <div className="sr-term-bar">
              <span className="sr-term-dot red" /><span className="sr-term-dot amber" /><span className="sr-term-dot green" />
              <span className="sr-term-title">orchestrator · {goal}</span>
              {!done && <span className="sr-term-live"><span className="dot dot-green dot-pulse" style={{ width: 6, height: 6 }} /> live</span>}
              {done && <span className={`sr-term-exit ${exitCode === 0 ? 'ok' : 'fail'}`}>exit {exitCode}</span>}
            </div>

            <div className="sr-terminal" ref={termRef}>
              {lines.map((l, i) => (
                <div key={i} className={`sr-tline ${l.isInput ? 'sr-tline-input' : ''}`}>
                  {l.content}
                </div>
              ))}
              {!done && <div className="sr-tline sr-tline-cursor"><span className="sr-blink">▊</span></div>}
            </div>

            {/* Interactive input */}
            <form className={`sr-input-bar ${awaitingInput ? 'active' : ''}`} onSubmit={sendInput}>
              <span className="sr-input-prompt">›</span>
              <input
                ref={inputRef}
                className="sr-input"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={awaitingInput ? 'Orchestrator is waiting for your response…' : 'Type to send input to the swarm…'}
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
    </div>
  )
}

function PhaseIcon({ state }) {
  if (state === 'done')    return <RiCheckLine size={13} className="sr-phase-icon done" />
  if (state === 'running') return <RiLoader4Line size={13} className="sr-phase-icon running spin" />
  return <span className="sr-phase-icon pending" />
}

function AgentDot({ state }) {
  const cls = state === 'done' ? 'green' : state === 'running' ? 'accent' : 'dim'
  return <span className={`sr-agent-dot sr-agent-dot-${cls}`} />
}
