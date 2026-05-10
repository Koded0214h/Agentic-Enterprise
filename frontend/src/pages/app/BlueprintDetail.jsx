import { useParams, Link } from 'react-router-dom'
import {
  RiArrowLeftLine, RiRocketLine, RiTimerFlashLine, RiBarChart2Line,
  RiCustomerService2Line, RiStore2Line, RiCodeLine, RiRobot2Line,
  RiShieldCheckLine, RiCoinLine,
} from 'react-icons/ri'
import './BlueprintDetail.css'

const BLUEPRINTS = {
  'outbound-sales': {
    Icon: RiRocketLine,
    name: 'Outbound Sales Machine',
    desc: 'A full outbound engine: prospect research, personalised multi-touch outreach, follow-up sequences, and CRM sync. Goes from ICP definition to booked meetings autonomously.',
    agents: [
      { name: 'ICP Researcher', role: 'Defines ideal customer profile, sources leads from multiple APIs' },
      { name: 'Prospect Validator', role: 'Verifies emails, enriches LinkedIn data, scores fit' },
      { name: 'Copywriter', role: 'Drafts personalised email sequences from prospect context' },
      { name: 'Outreach Sequencer', role: 'Schedules and sends multi-touch campaigns via Gmail tool' },
      { name: 'Reply Classifier', role: 'Parses replies — interested, not interested, out of office' },
      { name: 'CRM Syncer', role: 'Creates and updates records in your CRM with full context' },
      { name: 'Follow-up Agent', role: 'Handles objections and re-engages cold prospects' },
      { name: 'Analytics Reporter', role: 'Weekly performance summaries: open rate, reply rate, meetings booked' },
    ],
    cost: '$1.20',
    policies: ['Global Allow', 'Email Rate Limit (50/day)', 'SOX — Escalate Financial Tools'],
    color: '#aa3bff',
    tags: ['Sales', 'Growth'],
  },
  'content-engine': {
    Icon: RiTimerFlashLine,
    name: 'Content Engine',
    desc: 'Research-backed content at scale. Keyword analysis, brief generation, drafting, editing, and publishing — automatically scheduled across channels.',
    agents: [
      { name: 'SEO Researcher', role: 'Keyword gap analysis, competitor content audit, SERP intent mapping' },
      { name: 'Brief Writer', role: 'Produces structured content briefs from keyword clusters' },
      { name: 'Content Drafter', role: 'Long-form article generation with brand voice guidelines' },
      { name: 'Editor Agent', role: 'Fact-checking, tone consistency, SEO optimisation pass' },
      { name: 'Scheduler', role: 'Publishes to CMS, schedules social snippets, tracks performance' },
      { name: 'Analytics Agent', role: 'Monthly content performance report with recommendations' },
    ],
    cost: '$0.80',
    policies: ['Global Allow', 'CMS Write Access', 'Social Rate Limit'],
    color: '#3dffa0',
    tags: ['Content', 'Growth'],
  },
}

const FALLBACK = {
  Icon: RiRocketLine,
  name: 'Blueprint',
  desc: 'Deploy this blueprint to spin up your agent workforce.',
  agents: [],
  cost: '$1.00',
  policies: ['Global Allow'],
  color: '#aa3bff',
  tags: [],
}

export default function BlueprintDetail() {
  const { id } = useParams()
  const bp = BLUEPRINTS[id] || { ...FALLBACK, name: id }

  return (
    <div className="bpd-page">
      <Link to="/app/blueprints" className="bpd-back">
        <RiArrowLeftLine size={15} /> Blueprints
      </Link>

      <div className="bpd-hero card">
        <div className="bpd-hero-icon" style={{ '--icon-color': bp.color }}>
          <bp.Icon size={28} />
        </div>
        <div className="bpd-hero-body">
          <div className="bpd-hero-tags">
            {bp.tags.map(t => <span key={t} className="badge badge-purple">{t}</span>)}
          </div>
          <h1>{bp.name}</h1>
          <p>{bp.desc}</p>
        </div>
        <div className="bpd-hero-stats">
          <div className="bpd-stat">
            <RiRobot2Line size={16} />
            <span><strong>{bp.agents.length}</strong> agents</span>
          </div>
          <div className="bpd-stat">
            <RiCoinLine size={16} />
            <span><strong>~{bp.cost}</strong>/day</span>
          </div>
          <div className="bpd-stat">
            <RiShieldCheckLine size={16} />
            <span><strong>{bp.policies.length}</strong> policies</span>
          </div>
        </div>
      </div>

      <div className="bpd-body">
        <div className="bpd-main">
          <div className="card bpd-agents-card">
            <h2>Agent roster</h2>
            <div className="bpd-agents">
              {bp.agents.map((a, i) => (
                <div key={i} className="bpd-agent-row">
                  <div className="bpd-agent-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="bpd-agent-info">
                    <span className="bpd-agent-name">{a.name}</span>
                    <span className="bpd-agent-role">{a.role}</span>
                  </div>
                  <span className="dot dot-green" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bpd-sidebar">
          <div className="card bpd-deploy-card">
            <h3>Deploy this blueprint</h3>
            <p>Answer 3 questions and your agent team will be live in under 60 seconds.</p>
            <div className="bpd-cost-estimate">
              <span className="bpd-cost-label">Estimated daily cost</span>
              <span className="bpd-cost-val">~{bp.cost}</span>
            </div>
            <Link to={`/app/blueprints/${id}/deploy`} className="btn btn-primary btn-full btn-lg">
              Deploy blueprint →
            </Link>
          </div>

          <div className="card bpd-policies-card">
            <h3>Policies applied</h3>
            <div className="bpd-policies">
              {bp.policies.map((p, i) => (
                <div key={i} className="bpd-policy-row">
                  <RiShieldCheckLine size={13} color="var(--accent)" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
