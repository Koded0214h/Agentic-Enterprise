import { useState, useRef, useEffect } from 'react'
import {
  RiRocketLine, RiCloseLine, RiStopLine, RiCheckLine,
  RiErrorWarningLine, RiSparkling2Line,
} from 'react-icons/ri'
import { api } from '../api/client'
import './SwarmRunDrawer.css'

const ENGINES = ['claude', 'gemini', 'codex']

const TYPED_GOALS = [
  'Build a B2B SaaS for construction project management',
  'Launch an AI-powered marketplace for freelance legal services',
  'Build a healthcare analytics platform for hospital systems',
  'Create a fintech app for freelancer invoicing and payments',
]

export default function SwarmRunDrawer({ open, onClose }) {
  const [goal, setGoal] = useState('')
  const [engine, setEngine] = useState('claude')
  const [lines, setLines] = useState([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [exitCode, setExitCode] = useState(null)
  const [placeholder, setPlaceholder] = useState(TYPED_GOALS[0])
  const termRef = useRef(null)
  const abortRef = useRef(null)
  const pIdx = useRef(0)
  const cIdx = useRef(0)
  const erasing = useRef(false)
  const timerRef = useRef(null)

  // Typewriter for placeholder
  useEffect(() => {
    if (!open || goal) return
    const tick = () => {
      const current = TYPED_GOALS[pIdx.current]
      if (!erasing.current) {
        if (cIdx.current < current.length) {
          cIdx.current++
          setPlaceholder(current.slice(0, cIdx.current))
          timerRef.current = setTimeout(tick, 40 + Math.random() * 25)
        } else {
          timerRef.current = setTimeout(() => { erasing.current = true; tick() }, 2000)
        }
      } else {
        if (cIdx.current > 0) {
          cIdx.current--
          setPlaceholder(current.slice(0, cIdx.current))
          timerRef.current = setTimeout(tick, 18)
        } else {
          erasing.current = false
          pIdx.current = (pIdx.current + 1) % TYPED_GOALS.length
          timerRef.current = setTimeout(tick, 300)
        }
      }
    }
    timerRef.current = setTimeout(tick, 600)
    return () => clearTimeout(timerRef.current)
  }, [open, goal])

  // Scroll terminal to bottom on new lines
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [lines])

  function reset() {
    setLines([])
    setDone(false)
    setExitCode(null)
  }

  async function launch() {
    if (!goal.trim() || running) return
    reset()
    setRunning(true)

    const token = api.getAccess()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('/api/swarm/run/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goal: goal.trim(), engine }),
        signal: ctrl.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setLines([{ type: 'error', content: err.error || 'Launch failed' }])
        setRunning(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        buf += decoder.decode(value, { stream: true })
        const parts = buf.split('\n')
        buf = parts.pop()
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(part.slice(6))
            if (evt.type === 'line') {
              setLines(prev => [...prev, { type: 'line', content: evt.content }])
            } else if (evt.type === 'done') {
              setExitCode(evt.exit_code)
              setDone(true)
            } else if (evt.type === 'error') {
              setLines(prev => [...prev, { type: 'error', content: evt.detail }])
              setDone(true)
            }
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setLines(prev => [...prev, { type: 'error', content: String(e) }])
      }
    } finally {
      setRunning(false)
    }
  }

  function stop() {
    abortRef.current?.abort()
    setRunning(false)
    setLines(prev => [...prev, { type: 'stopped', content: '— Run stopped by user —' }])
  }

  function handleClose() {
    if (running) stop()
    onClose()
    setTimeout(() => { setGoal(''); reset() }, 300)
  }

  return (
    <>
      {open && <div className="srd-backdrop" onClick={handleClose} />}
      <div className={`srd-drawer ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="srd-head">
          <div className="srd-head-left">
            <RiRocketLine size={16} className="srd-head-icon" />
            <span>Run Swarm</span>
          </div>
          <button className="srd-close" onClick={handleClose}><RiCloseLine size={18} /></button>
        </div>

        {/* Goal input */}
        <div className="srd-form">
          <div className="srd-input-wrap">
            <RiSparkling2Line size={15} className="srd-input-icon" />
            <textarea
              className="srd-textarea"
              rows={3}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder={placeholder}
              disabled={running}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) launch()
              }}
            />
          </div>

          <div className="srd-controls">
            <div className="srd-engine-wrap">
              <span className="srd-engine-label">Engine</span>
              <div className="srd-engine-pills">
                {ENGINES.map(e => (
                  <button
                    key={e}
                    className={`srd-engine-pill ${engine === e ? 'active' : ''}`}
                    onClick={() => setEngine(e)}
                    disabled={running}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="srd-launch-wrap">
              {running ? (
                <button className="srd-btn-stop" onClick={stop}>
                  <RiStopLine size={14} /> Stop
                </button>
              ) : (
                <button
                  className="srd-btn-launch"
                  onClick={launch}
                  disabled={!goal.trim()}
                >
                  <RiRocketLine size={14} />
                  {done ? 'Run again' : 'Launch'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Terminal */}
        {(lines.length > 0 || running) && (
          <div className="srd-terminal-wrap">
            <div className="srd-terminal-bar">
              <span className="srd-terminal-dot red" />
              <span className="srd-terminal-dot amber" />
              <span className="srd-terminal-dot green" />
              <span className="srd-terminal-title">orchestrator output</span>
              {done && (
                <span className={`srd-exit-badge ${exitCode === 0 ? 'ok' : 'fail'}`}>
                  {exitCode === 0
                    ? <><RiCheckLine size={11} /> exit 0</>
                    : <><RiErrorWarningLine size={11} /> exit {exitCode}</>
                  }
                </span>
              )}
            </div>
            <div className="srd-terminal" ref={termRef}>
              {lines.map((l, i) => (
                <div key={i} className={`srd-line srd-line-${l.type}`}>
                  {l.content}
                </div>
              ))}
              {running && (
                <div className="srd-line srd-line-cursor">
                  <span className="srd-blink">▊</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="srd-hint">⌘ Enter to launch · Esc to close</p>
      </div>
    </>
  )
}
