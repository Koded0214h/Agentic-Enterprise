import { useNavigate } from 'react-router-dom'
import {
  RiRocketLine, RiFileTextLine, RiMegaphoneLine, RiSearchLine,
  RiSendPlaneLine, RiServerLine,
} from 'react-icons/ri'
import './WorkflowTemplates.css'

const TEMPLATES = [
  {
    id: 'saas-mvp',
    name: 'Launch SaaS MVP',
    desc: 'Full product + engineering + marketing launch',
    agents: 12,
    Icon: RiRocketLine,
    color: 'var(--accent)',
    tag: 'popular',
  },
  {
    id: 'prd-gen',
    name: 'Generate Startup PRD',
    desc: 'Product requirements from a one-line idea',
    agents: 3,
    Icon: RiFileTextLine,
    color: '#6b9cff',
    tag: 'quick',
  },
  {
    id: 'marketing',
    name: 'Create Marketing Campaign',
    desc: 'Content calendar, social posts, email sequences',
    agents: 6,
    Icon: RiMegaphoneLine,
    color: 'var(--green)',
    tag: null,
  },
  {
    id: 'research',
    name: 'Research Startup Idea',
    desc: 'Market analysis, competitors, TAM estimation',
    agents: 4,
    Icon: RiSearchLine,
    color: 'var(--amber)',
    tag: null,
  },
  {
    id: 'sales',
    name: 'Generate Sales Outreach',
    desc: 'Lead research, personalized sequences, CRM update',
    agents: 5,
    Icon: RiSendPlaneLine,
    color: '#f472b6',
    tag: null,
  },
  {
    id: 'deploy',
    name: 'Deploy Fullstack App',
    desc: 'Docker, CI/CD, monitoring, docs in one run',
    agents: 8,
    Icon: RiServerLine,
    color: '#34d399',
    tag: 'advanced',
  },
]

const TAG_COLORS = {
  popular:  { bg: 'rgba(170,59,255,0.12)', border: 'rgba(170,59,255,0.3)', color: 'var(--accent)' },
  quick:    { bg: 'rgba(61,255,160,0.08)', border: 'rgba(61,255,160,0.2)', color: 'var(--green)' },
  advanced: { bg: 'rgba(107,156,255,0.1)', border: 'rgba(107,156,255,0.25)', color: '#6b9cff' },
}

export default function WorkflowTemplates() {
  const navigate = useNavigate()

  function useTemplate(t) {
    navigate(`/app/swarm?prompt=${encodeURIComponent(t.name)}`)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Templates</h1>
          <p>Pre-built workflows to launch common AI operations in one click</p>
        </div>
      </div>

      <div className="tpl-grid">
        {TEMPLATES.map(t => (
          <div key={t.id} className="card tpl-card">
            <div className="tpl-card-top">
              <div className="tpl-icon" style={{ background: `${t.color}18`, border: `1px solid ${t.color}30` }}>
                <t.Icon size={22} color={t.color} />
              </div>
              {t.tag && (
                <span
                  className="tpl-tag"
                  style={{
                    background: TAG_COLORS[t.tag]?.bg,
                    border: `1px solid ${TAG_COLORS[t.tag]?.border}`,
                    color: TAG_COLORS[t.tag]?.color,
                  }}
                >
                  {t.tag}
                </span>
              )}
            </div>

            <div className="tpl-card-body">
              <div className="tpl-name">{t.name}</div>
              <div className="tpl-desc">{t.desc}</div>
            </div>

            <div className="tpl-card-footer">
              <span className="tpl-agents">{t.agents} agents</span>
              <button
                className="btn btn-sm tpl-use-btn"
                style={{ background: `${t.color}18`, border: `1px solid ${t.color}30`, color: t.color }}
                onClick={() => useTemplate(t)}
              >
                Use template
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="tpl-cta">
        <div className="tpl-cta-body">
          <span className="tpl-cta-title">Need a custom workflow?</span>
          <span className="tpl-cta-desc">Describe your goal and the swarm will build a plan from scratch.</span>
        </div>
        <button
          className="btn"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '9px 20px' }}
          onClick={() => navigate('/app/swarm?prompt=')}
        >
          <RiRocketLine size={14} /> Run custom swarm
        </button>
      </div>
    </div>
  )
}
