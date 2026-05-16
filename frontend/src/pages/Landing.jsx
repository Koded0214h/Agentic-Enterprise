import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiTimerFlashLine, RiStore2Line, RiBarChart2Line, RiRocketLine,
  RiArrowRightLine, RiCpuLine, RiShieldCheckLine, RiBrainLine,
  RiDashboardLine, RiCheckLine, RiSparkling2Line, RiPriceTag3Line,
  RiUserHeartLine, RiMailLine,
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

function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  async function handleWaitlist(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/auth/waitlist/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="waitlist-section" id="waitlist">
      <div className="section-inner">
        <div className="waitlist-card reveal">
          <RiMailLine size={28} className="waitlist-icon" aria-hidden="true" />
          <p className="section-label">Early access</p>
          <h2 className="waitlist-title">Get early access to AOS.</h2>
          <p className="waitlist-desc">
            Join the waitlist and be first to deploy your autonomous company.
            No spam — just a heads-up when your slot opens.
          </p>
          {status === 'success' ? (
            <div className="waitlist-success">
              <RiCheckLine size={18} />
              <span>You're on the list! We'll be in touch.</span>
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={handleWaitlist}>
              <input
                className="waitlist-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm waitlist-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Joining...' : 'Join waitlist'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="waitlist-error">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </section>
  )
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
          <a href="#demo">Demo</a>
          <a href="#features">Features</a>
          <a href="#blueprints">Blueprints</a>
          <a href="#pricing">Pricing</a>
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

      {/* ── Demo terminal ── */}
      <section className="demo-section" id="demo">
        <div className="section-inner">
          <div className="reveal demo-header">
            <p className="section-label">See it in action</p>
            <h2 className="section-title demo-title">One prompt. A full company in motion.</h2>
          </div>
          <div className="terminal-card reveal">
            <div className="terminal-bar">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="terminal-title">aos — zsh</span>
            </div>
            <div className="terminal-body">
              <p className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-cmd"> aos run <span className="terminal-string">"Launch SaaS MVP for construction project management"</span></span>
              </p>
              <p className="terminal-line terminal-output">
                <span className="terminal-tag">[AOS]</span> Analyzing goal and decomposing into task DAG...
              </p>
              <p className="terminal-line terminal-output">
                <span className="terminal-tag">[AOS]</span> Spawning 12 agents across product, engineering, and growth...
              </p>
              <p className="terminal-line terminal-output">
                <span className="terminal-tag">[PRD]</span> Generating product requirements document — construction PM vertical
              </p>
              <p className="terminal-line terminal-output">
                <span className="terminal-tag">[ARCH]</span> Planning system architecture: Next.js + Supabase + Stripe
              </p>
              <p className="terminal-line terminal-output">
                <span className="terminal-tag">[ENG]</span>  Committing initial scaffold to GitHub... <span className="terminal-success">done</span>
              </p>
              <p className="terminal-line terminal-output">
                <span className="terminal-tag">[GTM]</span>  Drafting landing page copy, ICP, and outreach sequences...
              </p>
              <p className="terminal-line terminal-output">
                <span className="terminal-tag">[OPS]</span>  Configuring CI/CD pipeline and staging environment...
              </p>
              <p className="terminal-line terminal-output terminal-dim">
                12 agents running in parallel — awaiting human review on billing integration
              </p>
              <p className="terminal-line">
                <span className="terminal-prompt terminal-green">$</span>
                <span className="terminal-cursor-block" aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>
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

      {/* ── Pricing ── */}
      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <div className="reveal pricing-header">
            <p className="section-label">Pricing</p>
            <h2 className="section-title pricing-title">Transparent pricing. No surprises.</h2>
            <p className="pricing-desc">Start free, scale as your swarm grows. Cancel anytime.</p>
          </div>
          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card reveal" style={{ transitionDelay: '0ms' }}>
              <div className="pricing-card-header">
                <RiPriceTag3Line size={20} className="pricing-icon" />
                <span className="pricing-tier">Starter</span>
              </div>
              <div className="pricing-price">
                <span className="pricing-amount">$49</span>
                <span className="pricing-period">/mo</span>
              </div>
              <p className="pricing-tagline">For founders validating their first idea.</p>
              <ul className="pricing-features">
                <li><RiCheckLine size={14} /> 50,000 tokens / month</li>
                <li><RiCheckLine size={14} /> Up to 10 concurrent agents</li>
                <li><RiCheckLine size={14} /> 2 active swarm blueprints</li>
                <li><RiCheckLine size={14} /> Community support</li>
                <li><RiCheckLine size={14} /> Full audit trail</li>
              </ul>
              <Link to="/signup" className="pricing-cta btn btn-ghost btn-sm">Get started</Link>
            </div>

            {/* Growth */}
            <div className="pricing-card pricing-card-featured reveal" style={{ transitionDelay: '80ms' }}>
              <div className="pricing-card-popular">Most popular</div>
              <div className="pricing-card-header">
                <RiRocketLine size={20} className="pricing-icon" />
                <span className="pricing-tier">Growth</span>
              </div>
              <div className="pricing-price">
                <span className="pricing-amount">$149</span>
                <span className="pricing-period">/mo</span>
              </div>
              <p className="pricing-tagline">For operators running a real business.</p>
              <ul className="pricing-features">
                <li><RiCheckLine size={14} /> 500,000 tokens / month</li>
                <li><RiCheckLine size={14} /> Up to 50 concurrent agents</li>
                <li><RiCheckLine size={14} /> Unlimited blueprints</li>
                <li><RiCheckLine size={14} /> Priority support</li>
                <li><RiCheckLine size={14} /> Custom blueprint templates</li>
                <li><RiCheckLine size={14} /> Compliance policy packs</li>
              </ul>
              <Link to="/signup" className="pricing-cta btn btn-primary btn-sm">Start free trial</Link>
            </div>

            {/* Enterprise */}
            <div className="pricing-card reveal" style={{ transitionDelay: '160ms' }}>
              <div className="pricing-card-header">
                <RiShieldCheckLine size={20} className="pricing-icon" />
                <span className="pricing-tier">Enterprise</span>
              </div>
              <div className="pricing-price">
                <span className="pricing-amount pricing-custom">Custom</span>
              </div>
              <p className="pricing-tagline">For teams that need full control and compliance.</p>
              <ul className="pricing-features">
                <li><RiCheckLine size={14} /> Unlimited tokens</li>
                <li><RiCheckLine size={14} /> All 245 agent types</li>
                <li><RiCheckLine size={14} /> Dedicated account support</li>
                <li><RiCheckLine size={14} /> HIPAA, SOX, PCI-DSS, GDPR packs</li>
                <li><RiCheckLine size={14} /> SLA guarantee</li>
                <li><RiCheckLine size={14} /> Custom integrations &amp; API access</li>
              </ul>
              <a href="#waitlist" className="pricing-cta btn btn-ghost btn-sm">Contact us</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <WaitlistSection />

      {/* ── Founder story ── */}
      <section className="founder-section">
        <div className="section-inner">
          <div className="founder-card reveal">
            <div className="founder-icon-wrap" aria-hidden="true">
              <RiUserHeartLine size={28} />
            </div>
            <p className="founder-label section-label">Our story</p>
            <h2 className="founder-title">Built by a founder, for founders.</h2>
            <p className="founder-body">
              AOS started from a simple frustration: building a company alone is hard.
              Hiring is expensive, coordination is slow, and the gap between a great idea
              and real execution has always been people. I built AOS because I believe
              that operational leverage — the kind that used to cost $500k in salaries —
              should be accessible to any solo founder with a clear goal. Every feature
              in AOS exists to eliminate the bottleneck between idea and outcome.
              You bring the vision. The swarm handles the rest.
            </p>
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
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}
