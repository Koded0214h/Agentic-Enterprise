import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiRocketLine, RiCloseLine, RiSparkling2Line } from 'react-icons/ri'
import { api } from '../api/client'
import './SwarmRunDrawer.css'

const ENGINES = ['claude', 'gemini', 'codex']

const SPEEDS = [
  { id: 'haiku',  label: 'Fast',     desc: 'Haiku — quickest results'   },
  { id: 'sonnet', label: 'Balanced', desc: 'Sonnet — quality + speed'   },
  { id: 'opus',   label: 'Deep',     desc: 'Opus — most thorough'        },
]

const TYPED_GOALS = [
  'Build a B2B SaaS for construction project management',
  'Launch an AI-powered marketplace for freelance legal services',
  'Build a healthcare analytics platform for hospital systems',
  'Create a fintech app for freelancer invoicing and payments',
  'Start a growth agency powered by autonomous marketing agents',
]

export default function SwarmRunDrawer({ open, onClose, initialGoal = '' }) {
  const [goal, setGoal] = useState('')

  // Pre-fill goal when opened from a template redirect
  useEffect(() => {
    if (open && initialGoal) setGoal(initialGoal)
  }, [open, initialGoal])
  const [engine, setEngine] = useState('claude')
  const [speed, setSpeed] = useState('sonnet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [placeholder, setPlaceholder] = useState(TYPED_GOALS[0])
  const navigate = useNavigate()
  const pIdx = useRef(0)
  const cIdx = useRef(0)
  const erasing = useRef(false)
  const timerRef = useRef(null)

  // Typewriter placeholder
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

  async function launch(e) {
    e.preventDefault()
    if (!goal.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/swarm/run/', { goal: goal.trim(), engine, model: engine === 'claude' ? speed : '' })
      onClose()
      setGoal('')
      navigate(`/app/swarm/${data.run_id}`)
    } catch (err) {
      setError(err?.data?.error || 'Failed to start run')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    onClose()
    setTimeout(() => { setGoal(''); setError(''); setSpeed('sonnet') }, 300)
  }

  return (
    <>
      {open && <div className="srd-backdrop" onClick={handleClose} />}
      <div className={`srd-drawer ${open ? 'open' : ''}`}>
        <div className="srd-head">
          <div className="srd-head-left">
            <RiRocketLine size={16} className="srd-head-icon" />
            <span>Run Swarm</span>
          </div>
          <button className="srd-close" onClick={handleClose} disabled={loading}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <form className="srd-form" onSubmit={launch}>
          <div className="srd-input-wrap">
            <RiSparkling2Line size={15} className="srd-input-icon" />
            <textarea
              className="srd-textarea"
              rows={4}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) launch(e) }}
              autoFocus={open}
            />
          </div>

          <div className="srd-controls">
            <div className="srd-engine-wrap">
              <span className="srd-engine-label">Engine</span>
              <div className="srd-engine-pills">
                {ENGINES.map(e => (
                  <button key={e} type="button"
                    className={`srd-engine-pill ${engine === e ? 'active' : ''}`}
                    onClick={() => setEngine(e)}
                    disabled={loading}
                  >{e}</button>
                ))}
              </div>
            </div>

            <button className="srd-btn-launch" type="submit" disabled={!goal.trim() || loading}>
              <RiRocketLine size={14} />
              {loading ? 'Starting…' : 'Launch →'}
            </button>
          </div>

          {engine === 'claude' && (
            <div className="srd-speed-row">
              <span className="srd-engine-label">Speed</span>
              <div className="srd-speed-pills">
                {SPEEDS.map(s => (
                  <button key={s.id} type="button"
                    className={`srd-speed-pill ${speed === s.id ? 'active' : ''}`}
                    onClick={() => setSpeed(s.id)}
                    disabled={loading}
                    title={s.desc}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="srd-error">{error}</p>}
        </form>

        <p className="srd-hint">
          Opens a full workflow view with live agent nodes and interactive input.
          <br />⌘ Enter to launch
        </p>
      </div>
    </>
  )
}
