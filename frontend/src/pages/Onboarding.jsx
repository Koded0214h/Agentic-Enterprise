import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RiComputerLine, RiShoppingCartLine, RiBankCardLine, RiHospitalLine,
  RiFilmLine, RiRocketLine, RiTruckLine, RiMagicLine,
  RiLineChartLine, RiSettings3Line, RiBriefcaseLine, RiBarChartLine,
  RiCustomerService2Line, RiBuildingLine, RiPencilLine, RiFlaskLine,
  RiTimerFlashLine, RiStore2Line, RiBarChart2Line, RiToolsLine,
  RiCheckLine, RiShieldCheckLine,
} from 'react-icons/ri'
import { agents } from '../api/agents'
import { useAuth } from '../context/AuthContext'
import './Onboarding.css'

const INDUSTRIES = [
  { id: 'saas',      label: 'SaaS / Software',   Icon: RiComputerLine },
  { id: 'ecom',      label: 'E-commerce',         Icon: RiShoppingCartLine },
  { id: 'fintech',   label: 'Fintech',            Icon: RiBankCardLine },
  { id: 'health',    label: 'Healthcare',         Icon: RiHospitalLine },
  { id: 'media',     label: 'Media / Content',    Icon: RiFilmLine },
  { id: 'agency',    label: 'Agency / Services',  Icon: RiRocketLine },
  { id: 'logistics', label: 'Logistics',          Icon: RiTruckLine },
  { id: 'other',     label: 'Other',              Icon: RiMagicLine },
]

const FUNCTIONS = [
  { id: 'growth',   label: 'Growth & Marketing',     Icon: RiLineChartLine },
  { id: 'product',  label: 'Product & Engineering',  Icon: RiSettings3Line },
  { id: 'sales',    label: 'Sales & CRM',            Icon: RiBriefcaseLine },
  { id: 'finance',  label: 'Finance & Billing',      Icon: RiBarChartLine },
  { id: 'support',  label: 'Customer Support',       Icon: RiCustomerService2Line },
  { id: 'ops',      label: 'Operations & HR',        Icon: RiBuildingLine },
  { id: 'content',  label: 'Content & SEO',          Icon: RiPencilLine },
  { id: 'data',     label: 'Data & Analytics',       Icon: RiFlaskLine },
]

const BLUEPRINTS = [
  { id: 'saas_starter',  Icon: RiTimerFlashLine, name: 'SaaS Starter',      agents: 12, desc: 'Product, growth, revenue ops — full lifecycle from launch to scale.', tags: ['growth', 'product', 'finance'] },
  { id: 'ecom_engine',   Icon: RiStore2Line,   name: 'E-commerce Engine', agents: 18, desc: 'Catalog management, fulfillment automation, support agents.',           tags: ['sales', 'support', 'ops'] },
  { id: 'growth_studio', Icon: RiRocketLine,   name: 'Growth Studio',     agents: 14, desc: 'SEO, paid ads, content factory, conversion optimization.',              tags: ['growth', 'content'] },
  { id: 'analytics',     Icon: RiBarChart2Line,name: 'Analytics Firm',    agents: 9,  desc: 'Data pipelines, reporting dashboards, insight generation.',             tags: ['data', 'finance'] },
  { id: 'custom',        Icon: RiToolsLine,    name: 'Custom Build',      agents: null, desc: 'Start from scratch and configure your own agent workforce.',          tags: [] },
]

const STEPS = ['Industry', 'Functions', 'API Keys', 'Blueprint', 'Launch']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [industry, setIndustry] = useState(null)
  const [functions, setFunctions] = useState([])
  const [apiKeys, setApiKeys] = useState({ openai: '', anthropic: '' })
  const [blueprint, setBlueprint] = useState(null)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const launchPrompt = sessionStorage.getItem('aos_launch_prompt') || ''

  function toggleFn(id) {
    setFunctions(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  function canNext() {
    if (step === 0) return !!industry
    if (step === 1) return functions.length > 0
    if (step === 2) return true
    if (step === 3) return !!blueprint
    return true
  }

  async function handleLaunch() {
    setLaunching(true)
    setError('')
    try {
      await agents.create({
        name: `${user?.first_name || 'My'} Enterprise`,
        blueprint,
        industry,
        functions,
        launch_prompt: launchPrompt,
      })
      sessionStorage.removeItem('aos_launch_prompt')
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Launch failed. Please try again.')
      setLaunching(false)
    }
  }

  const progressPct = ((step + 1) / STEPS.length) * 100

  return (
    <div className="onboarding-page">
      <div className="ob-glow" aria-hidden="true" />

      <div className="ob-shell">
        <div className="ob-header">
          <span className="ob-logo">AOS</span>
          <div className="ob-progress-wrap">
            <div className="ob-progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="ob-step-label">{step + 1} / {STEPS.length}</span>
        </div>

        <div className="ob-steps">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`ob-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            >
              <span className="ob-step-num">
                {i < step ? <RiCheckLine size={10} /> : i + 1}
              </span>
              <span className="ob-step-name">{s}</span>
            </div>
          ))}
        </div>

        <div className="ob-content">
          {step === 0 && <StepIndustry value={industry} onChange={setIndustry} prompt={launchPrompt} />}
          {step === 1 && <StepFunctions value={functions} onChange={toggleFn} />}
          {step === 2 && <StepAPIKeys value={apiKeys} onChange={setApiKeys} />}
          {step === 3 && <StepBlueprint value={blueprint} onChange={setBlueprint} functions={functions} />}
          {step === 4 && <StepReview industry={industry} functions={functions} blueprint={blueprint} apiKeys={apiKeys} prompt={launchPrompt} />}
        </div>

        {error && <div className="error-banner ob-error">{error}</div>}

        <div className="ob-nav">
          <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Continue →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleLaunch} disabled={launching}>
              {launching ? <><span className="ob-spinner" /> Launching swarm…</> : 'Launch enterprise →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StepIndustry({ value, onChange, prompt }) {
  return (
    <div className="ob-step-body">
      <h2>What's your industry?</h2>
      <p className="ob-step-sub">We'll tailor your agent workforce to match your domain.</p>
      {prompt && (
        <div className="ob-prompt-preview">
          <span className="mono ob-prompt-label">Your goal</span>
          <p className="ob-prompt-text">"{prompt}"</p>
        </div>
      )}
      <div className="ob-grid ob-grid-4">
        {INDUSTRIES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`ob-select-card ${value === id ? 'selected' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepFunctions({ value, onChange }) {
  return (
    <div className="ob-step-body">
      <h2>Which functions do you need?</h2>
      <p className="ob-step-sub">Select all departments your agents should cover.</p>
      <div className="ob-grid ob-grid-4">
        {FUNCTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`ob-select-card ${value.includes(id) ? 'selected' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {value.length > 0 && (
        <p className="ob-sel-count">{value.length} function{value.length !== 1 ? 's' : ''} selected</p>
      )}
    </div>
  )
}

function StepAPIKeys({ value, onChange }) {
  function set(k) {
    return e => onChange(prev => ({ ...prev, [k]: e.target.value }))
  }
  return (
    <div className="ob-step-body">
      <h2>Connect your AI providers</h2>
      <p className="ob-step-sub">Keys are encrypted at rest and never logged. Skip if using AOS-managed credits.</p>
      <div className="ob-keys-grid">
        <div className="field">
          <label>OpenAI API Key</label>
          <input type="password" value={value.openai} onChange={set('openai')} placeholder="sk-proj-…" />
          <span className="hint">Used for GPT-4o and embeddings</span>
        </div>
        <div className="field">
          <label>Anthropic API Key</label>
          <input type="password" value={value.anthropic} onChange={set('anthropic')} placeholder="sk-ant-…" />
          <span className="hint">Used for Claude agents</span>
        </div>
      </div>
      <div className="ob-skip-hint">
        <span className="badge badge-amber">Optional</span>
        <span>Skip this step to use AOS-managed model credits.</span>
      </div>
    </div>
  )
}

function StepBlueprint({ value, onChange, functions: selectedFns }) {
  const recommended = BLUEPRINTS.filter(bp => bp.tags.some(t => selectedFns.includes(t)))

  return (
    <div className="ob-step-body">
      <h2>Choose a blueprint</h2>
      <p className="ob-step-sub">Pre-built agent teams you can deploy instantly and customize later.</p>
      <div className="ob-bp-list">
        {BLUEPRINTS.map(bp => {
          const isRec = recommended.some(r => r.id === bp.id)
          const isSelected = value === bp.id
          return (
            <button
              key={bp.id}
              type="button"
              className={`ob-bp-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(bp.id)}
            >
              <div className="ob-bp-icon-wrap">
                <bp.Icon size={20} />
              </div>
              <div className="ob-bp-body">
                <div className="ob-bp-name">
                  {bp.name}
                  {isRec && <span className="badge badge-green">Recommended</span>}
                </div>
                <p className="ob-bp-desc">{bp.desc}</p>
              </div>
              <div className="ob-bp-right">
                {bp.agents && <span className="badge badge-purple">{bp.agents} agents</span>}
                <div className={`ob-bp-radio ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <RiCheckLine size={11} />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepReview({ industry, functions, blueprint, apiKeys, prompt }) {
  const ind = INDUSTRIES.find(i => i.id === industry)
  const bp = BLUEPRINTS.find(b => b.id === blueprint)
  const fns = FUNCTIONS.filter(f => functions.includes(f.id))

  return (
    <div className="ob-step-body">
      <h2>Ready to launch</h2>
      <p className="ob-step-sub">Review your configuration before deploying your autonomous enterprise.</p>

      <div className="ob-review-grid">
        <div className="card ob-review-card">
          <p className="ob-review-label">Industry</p>
          <p className="ob-review-val">
            {ind && <ind.Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
            {ind?.label}
          </p>
        </div>
        <div className="card ob-review-card">
          <p className="ob-review-label">Blueprint</p>
          <p className="ob-review-val">
            {bp && <bp.Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
            {bp?.name}
          </p>
          {bp?.agents && <p className="ob-review-sub">{bp.agents} agents</p>}
        </div>
        <div className="card ob-review-card ob-review-wide">
          <p className="ob-review-label">Functions ({fns.length})</p>
          <div className="ob-review-tags">
            {fns.map(f => (
              <span key={f.id} className="badge badge-purple">
                <f.Icon size={11} /> {f.label}
              </span>
            ))}
          </div>
        </div>
        <div className="card ob-review-card">
          <p className="ob-review-label">API Keys</p>
          <p className="ob-review-val">
            {(apiKeys.openai || apiKeys.anthropic) ? 'Configured' : 'AOS-managed'}
          </p>
        </div>
        {prompt && (
          <div className="card ob-review-card ob-review-wide">
            <p className="ob-review-label">Launch goal</p>
            <p className="ob-review-val ob-review-prompt">"{prompt}"</p>
          </div>
        )}
      </div>

      <div className="ob-launch-note">
        <RiShieldCheckLine size={15} color="var(--green)" />
        Your agent swarm will be live within 60 seconds of launch.
      </div>
    </div>
  )
}
