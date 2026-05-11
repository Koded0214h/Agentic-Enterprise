import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiTimerFlashLine, RiStore2Line, RiBarChart2Line, RiRocketLine,
  RiArrowRightLine, RiCpuLine, RiShieldCheckLine, RiBrainLine,
  RiDashboardLine, RiCheckLine, RiSparkling2Line,
} from 'react-icons/ri'
import SpaceBackground from '../components/SpaceBackground'
import GlassButton from '../components/ui/glass-button'
import './Landing.css'

const BLUEPRINTS = [
  { Icon: RiTimerFlashLine, name: 'SaaS Starter',    agents: 12, desc: 'Product, growth, and revenue ops' },
  { Icon: RiStore2Line,     name: 'E-commerce Engine', agents: 18, desc: 'Catalog, fulfillment, support' },
  { Icon: RiBarChart2Line,  name: 'Analytics Firm',  agents: 9,  desc: 'Data pipelines, reporting, insights' },
  { Icon: RiRocketLine,     name: 'Growth Studio',   agents: 14, desc: 'SEO, ads, content, conversion' },
]

const FEATURES = [
  {
    big: true,
    Icon: RiCpuLine,
    color: '#aa3bff',
    dim: 'rgba(170,59,255,0.12)',
    tag: 'Orchestration',
    title: 'Deploy agent swarms in one prompt',
    body: 'Describe your business goal. AOS decomposes it into tasks, spawns the right agents, and executes with full DAG orchestration — no hand-holding required.',
    extra: (
      <div className="feature-stats-row">
        <div className="feature-stat"><span>245</span><label>agent types</label></div>
        <div className="feature-stat"><span>&lt;1s</span><label>spawn time</label></div>
        <div className="feature-stat"><span>∞</span><label>parallel tasks</label></div>
      </div>
    ),
  },
  {
    Icon: RiShieldCheckLine,
    color: '#3dffa0',
    dim: 'rgba(61,255,160,0.12)',
    tag: 'Governance',
    title: 'Policy guardrails on every action',
    body: 'HIPAA, SOX, PCI-DSS templates built in. Agents cannot exceed budget, violate compliance, or act outside defined trust zones.',
  },
  {
    Icon: RiBrainLine,
    color: '#e879f9',
    dim: 'rgba(232,121,249,0.12)',
    tag: 'Intelligence',
    title: 'DAG-scheduled, context-aware tasks',
    body: 'Topological execution with upstream context injection. Agents share knowledge across tasks — no repeated prompting.',
  },
  {
    big: true,
    Icon: RiDashboardLine,
    color: '#ffb03d',
    dim: 'rgba(255,176,61,0.12)',
    tag: 'Control',
    title: 'Human-in-the-loop where it counts',
    body: 'High-stakes actions pause for approval. Full audit trail, SSE streaming logs, and Grafana dashboards out of the box.',
    extra: (
      <div className="feature-badges-row">
        {['HIPAA', 'SOX', 'PCI-DSS', 'GDPR'].map(f => (
          <span key={f} className="feature-compliance-badge">{f}</span>
        ))}
      </div>
    ),
  },
]

const FAQS = [
  {
    q: 'What exactly is AOS?',
    a: 'AOS (Autonomous Operating System) is an enterprise platform that deploys intelligent AI agent swarms to run your entire business — product, marketing, operations — under strict policy and compliance guardrails.',
  },
  {
    q: 'How long does it take to deploy my first swarm?',
    a: 'Under 5 minutes. Pick a blueprint or type your business goal. AOS decomposes it into tasks, spawns agents from our library of 245 agent types, and begins executing with full DAG orchestration.',
  },
  {
    q: 'What compliance frameworks are supported?',
    a: 'AOS ships with HIPAA, SOX, PCI-DSS, and GDPR policy templates. Agents are hard-capped at your budget thresholds and cannot operate outside their trust zone. Violations trigger automatic escalation.',
  },
  {
    q: 'What does "human-in-the-loop" mean in practice?',
    a: 'High-stakes actions — large spend approvals, external API calls, data deletion, contract execution — automatically pause and notify designated reviewers. Every action generates a full audit log with SSE streaming.',
  },
  {
    q: 'Can I customize or extend the agent library?',
    a: 'Yes. Every agent is configurable via blueprint templates. Tune task scope, trust levels, inter-agent communication, and approval thresholds. Custom agent integrations are available via our API.',
  },
]

// Typing animation prompts
const TYPED_PROMPTS = [
  'I want to build a B2B SaaS for construction project management',
  'Launch an AI-powered marketplace for freelance legal services',
  'Build a healthcare analytics platform for hospital systems',
  'Create a fintech app for freelancer invoicing and payments',
  'Start a growth agency powered by 18 autonomous marketing agents',
]

function useTypewriter(prompts, enabled) {
  const [charIdx, setCharIdx] = useState(0)
  const [promptIdx, setPromptIdx] = useState(0)
  const [erasing, setErasing] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const current = prompts[promptIdx]

    if (!erasing) {
      if (charIdx < current.length) {
        timerRef.current = setTimeout(
          () => setCharIdx(c => c + 1),
          38 + Math.random() * 28
        )
      } else {
        timerRef.current = setTimeout(() => setErasing(true), 2200)
      }
    } else {
      if (charIdx > 0) {
        timerRef.current = setTimeout(() => setCharIdx(c => c - 1), 16)
      } else {
        setErasing(false)
        setPromptIdx(i => (i + 1) % prompts.length)
      }
    }
    return () => clearTimeout(timerRef.current)
  }, [charIdx, erasing, promptIdx, prompts, enabled])

  return prompts[promptIdx].slice(0, charIdx)
}

export default function Landing() {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()

  const typedText = useTypewriter(TYPED_PROMPTS, !prompt)

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function handleLaunch(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    sessionStorage.setItem('aos_launch_prompt', prompt)
    navigate('/signup')
  }

  return (
    <div className="landing">
      <SpaceBackground mode="fixed" />

      {/* ── Nav ── */}
      <nav className="landing-nav">
        <span className="landing-logo">AOS</span>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#blueprints">Blueprints</a>
          <a href="#faq">FAQ</a>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-glow hero-glow-2" aria-hidden="true" />

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
              <RiSparkling2Line className="hero-input-icon" size={18} />
              <div className="hero-input-container">
                <input
                  className="hero-input"
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                {!prompt && (
                  <span className="hero-typed-placeholder" aria-hidden="true">
                    {typedText}
                    <span className="hero-cursor" />
                  </span>
                )}
              </div>
              <GlassButton
                type="submit"
                size="sm"
                disabled={!prompt.trim()}
                className="hero-glass-btn"
              >
                Launch →
              </GlassButton>
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

        <div className="hero-scroll-cue" aria-hidden="true"><span /></div>
      </section>

      {/* ── Features bento ── */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="reveal">
            <p className="section-label">Platform</p>
            <h2 className="section-title">Built for operators, not hobbyists</h2>
          </div>

          <div className="features-bento">
            {FEATURES.map((f, i) => (
              <div
                key={f.tag}
                className={`feature-bento-card reveal${f.big ? ' feature-bento-big' : ''}`}
                style={{
                  '--card-color': f.color,
                  '--card-dim': f.dim,
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                {/* Dot grid pattern */}
                <div className="feature-dot-grid" aria-hidden="true" />

                {/* Top accent line */}
                <div className="feature-accent-line" aria-hidden="true" />

                <div className="feature-bento-body">
                  <div className="feature-icon-wrap" style={{ background: f.dim }}>
                    <f.Icon size={f.big ? 24 : 20} style={{ color: f.color }} />
                  </div>

                  <span className="badge" style={{
                    background: f.dim,
                    color: f.color,
                    border: `1px solid ${f.color}33`,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 20,
                  }}>
                    {f.tag}
                  </span>

                  <h3 className="feature-bento-title">{f.title}</h3>
                  <p className="feature-bento-body-text">{f.body}</p>

                  {f.extra && <div className="feature-extra">{f.extra}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blueprints ── */}
      <section className="blueprints-section" id="blueprints">
        <div className="section-inner">
          <div className="reveal">
            <p className="section-label">Blueprints</p>
            <h2 className="section-title">Launch in minutes, not months</h2>
          </div>
          <div className="blueprints-grid">
            {BLUEPRINTS.map((bp, i) => (
              <Link
                to="/signup"
                key={bp.name}
                className="blueprint-card card reveal"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
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

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq">
        <div className="section-inner">
          <div className="reveal faq-header">
            <span className="badge badge-purple">FAQ</span>
            <h2 className="section-title faq-title">Common questions</h2>
            <p className="faq-desc">Everything you need to know before you launch.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className="faq-item reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="faq-body">
                  <h3 className="faq-q">{item.q}</h3>
                  <p className="faq-a">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-glow" aria-hidden="true" />
        <div className="cta-inner reveal">
          <h2 className="cta-title">Your company. Fully autonomous.</h2>
          <p className="cta-sub">Deploy in under 5 minutes. Cancel anytime.</p>
          <div className="cta-actions">
            <Link to="/signup">
              <GlassButton size="lg">
                <RiCheckLine size={18} /> Start for free
              </GlassButton>
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Sign in →</Link>
          </div>
          <div className="cta-trust">
            <span>SOX compliant</span>
            <span className="dot" style={{ width: 4, height: 4, background: 'var(--border-2)' }} />
            <span>HIPAA ready</span>
            <span className="dot" style={{ width: 4, height: 4, background: 'var(--border-2)' }} />
            <span>PCI-DSS templates</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span className="landing-logo">AOS</span>
        <span>© 2026 Autonomous Operating System</span>
      </footer>
    </div>
  )
}
