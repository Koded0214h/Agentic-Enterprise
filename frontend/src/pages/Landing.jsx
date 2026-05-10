import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiTimerFlashLine, RiStore2Line, RiBarChart2Line, RiRocketLine, RiArrowRightLine } from 'react-icons/ri'
import './Landing.css'

const BLUEPRINTS = [
  { Icon: RiTimerFlashLine, name: 'SaaS Starter', agents: 12, desc: 'Product, growth, and revenue ops' },
  { Icon: RiStore2Line, name: 'E-commerce Engine', agents: 18, desc: 'Catalog, fulfillment, support' },
  { Icon: RiBarChart2Line, name: 'Analytics Firm', agents: 9, desc: 'Data pipelines, reporting, insights' },
  { Icon: RiRocketLine, name: 'Growth Studio', agents: 14, desc: 'SEO, ads, content, conversion' },
]

const FEATURES = [
  {
    tag: 'Orchestration',
    title: 'Deploy agent swarms in one prompt',
    body: 'Describe your business goal. AOS decomposes it into tasks, spawns the right agents, and executes — no hand-holding required.',
  },
  {
    tag: 'Governance',
    title: 'Policy guardrails on every action',
    body: 'HIPAA, SOX, PCI-DSS templates built in. Agents cannot exceed budget, violate compliance, or act outside defined trust zones.',
  },
  {
    tag: 'Intelligence',
    title: 'DAG-scheduled, context-aware tasks',
    body: 'Topological execution with upstream context injection. Agents share knowledge across tasks — no repeated prompting.',
  },
  {
    tag: 'Control',
    title: 'Human-in-the-loop where it counts',
    body: 'High-stakes actions pause for approval. Full audit trail, SSE streaming logs, and Grafana dashboards out of the box.',
  },
]

export default function Landing() {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()

  function handleLaunch(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    sessionStorage.setItem('aos_launch_prompt', prompt)
    navigate('/signup')
  }

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <span className="landing-logo">AOS</span>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#blueprints">Blueprints</a>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-inner animate-fadeup">
          <div className="badge badge-purple hero-badge">
            <span className="dot dot-green dot-pulse" />
            245 agents online
          </div>

          <h1 className="hero-title">
            Describe your startup.<br />
            <span className="hero-accent">We'll build it.</span>
          </h1>

          <p className="hero-sub">
            AOS deploys autonomous agent swarms that run your entire business —
            product, growth, ops — under enterprise-grade policy guardrails.
          </p>

          <form className="hero-form" onSubmit={handleLaunch}>
            <div className="hero-input-wrap">
              <input
                className="hero-input"
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="I want to build a B2B SaaS for construction project management..."
              />
              <button
                type="submit"
                className="btn btn-primary hero-submit"
                disabled={!prompt.trim()}
              >
                Launch →
              </button>
            </div>
            <p className="hero-hint">
              Or{' '}
              <Link to="/signup" className="hero-link">browse blueprints</Link>
              {' '}— pre-built agent teams for common use cases.
            </p>
          </form>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">245</span>
              <span className="hero-stat-label">Agent types</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">4</span>
              <span className="hero-stat-label">Compliance frameworks</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">∞</span>
              <span className="hero-stat-label">Tasks in parallel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <p className="section-label">Platform</p>
          <h2 className="section-title">Built for operators, not hobbyists</h2>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.tag} className="feature-card card">
                <span className="badge badge-purple">{f.tag}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blueprints */}
      <section className="blueprints-section" id="blueprints">
        <div className="section-inner">
          <p className="section-label">Blueprints</p>
          <h2 className="section-title">Launch in minutes, not months</h2>
          <div className="blueprints-grid">
            {BLUEPRINTS.map(bp => (
              <Link to="/signup" key={bp.name} className="blueprint-card card">
                <span className="bp-icon"><bp.Icon size={24} /></span>
                <h3>{bp.name}</h3>
                <p>{bp.desc}</p>
                <div className="bp-footer">
                  <span className="badge badge-purple">{bp.agents} agents</span>
                  <RiArrowRightLine className="bp-arrow" size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" aria-hidden="true" />
        <h2 className="cta-title">Your company. Fully autonomous.</h2>
        <p className="cta-sub">Deploy in under 5 minutes. Cancel anytime.</p>
        <Link to="/signup" className="btn btn-primary btn-lg">Start for free →</Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="landing-logo">AOS</span>
        <span>© 2026 Autonomous Operating System</span>
      </footer>
    </div>
  )
}
