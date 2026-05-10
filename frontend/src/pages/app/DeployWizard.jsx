import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { RiArrowLeftLine, RiRocketLine } from 'react-icons/ri'
import './DeployWizard.css'

const BUDGET_MARKS = [10, 25, 50, 100, 200, 500]

export default function DeployWizard() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState('')
  const [customer, setCustomer] = useState('')
  const [budget, setBudget] = useState(50)
  const [launching, setLaunching] = useState(false)
  const [step, setStep] = useState(0)

  async function handleDeploy() {
    setLaunching(true)
    await new Promise(r => setTimeout(r, 1800))
    const workflowId = `wf_${Date.now()}`
    navigate(`/app/workflows/${workflowId}/run?blueprint=${id}`, { replace: true })
  }

  const steps = [
    {
      label: 'What is your product or service?',
      hint: 'Be specific — this context shapes every agent prompt.',
      content: (
        <div className="field">
          <textarea
            className="dw-textarea"
            rows={4}
            value={product}
            onChange={e => setProduct(e.target.value)}
            placeholder="e.g. A B2B SaaS platform that helps construction project managers track budgets and timelines in real time…"
          />
        </div>
      ),
      valid: product.trim().length > 10,
    },
    {
      label: 'Who is your target customer?',
      hint: 'Describe firmographics, job titles, and pain points.',
      content: (
        <div className="field">
          <textarea
            className="dw-textarea"
            rows={4}
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="e.g. Mid-market construction firms (50–500 employees), project managers and ops directors who currently use spreadsheets…"
          />
        </div>
      ),
      valid: customer.trim().length > 10,
    },
    {
      label: "What's your monthly agent budget?",
      hint: 'Agents will stay within this limit. You can adjust anytime.',
      content: (
        <div className="dw-budget-wrap">
          <div className="dw-budget-display">
            <span className="dw-budget-val">${budget}</span>
            <span className="dw-budget-label">/ month</span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={5}
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="dw-slider"
          />
          <div className="dw-budget-marks">
            {BUDGET_MARKS.map(m => (
              <button
                key={m}
                type="button"
                className={`dw-mark ${budget === m ? 'active' : ''}`}
                onClick={() => setBudget(m)}
              >
                ${m}
              </button>
            ))}
          </div>
          <div className="dw-budget-note">
            ~${(budget / 30).toFixed(2)}/day · Agents pause if budget is exceeded
          </div>
        </div>
      ),
      valid: true,
    },
  ]

  const current = steps[step]

  return (
    <div className="dw-page">
      <Link to={`/app/blueprints/${id}`} className="bpd-back">
        <RiArrowLeftLine size={15} /> Blueprint
      </Link>

      <div className="dw-shell card">
        {/* Progress */}
        <div className="dw-progress-row">
          {steps.map((s, i) => (
            <div key={i} className={`dw-step-dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        {!launching ? (
          <>
            <div className="dw-step-content">
              <p className="dw-step-num">Question {step + 1} of {steps.length}</p>
              <h2 className="dw-step-q">{current.label}</h2>
              <p className="dw-step-hint">{current.hint}</p>
              {current.content}
            </div>

            <div className="dw-nav">
              <button
                className="btn btn-ghost"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
              >
                ← Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!current.valid}
                >
                  Continue →
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleDeploy}
                  disabled={!current.valid}
                >
                  <RiRocketLine size={16} /> Deploy blueprint
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="dw-launching">
            <div className="dw-launch-spinner" />
            <h2>Deploying your agents</h2>
            <p>Registering agents → assigning policies → configuring tools…</p>
            <div className="dw-launch-steps">
              {['Registering agents', 'Applying policies', 'Configuring capabilities', 'Warming up'].map((s, i) => (
                <div key={s} className="dw-launch-step" style={{ animationDelay: `${i * 0.4}s` }}>
                  <span className="dw-launch-dot" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
