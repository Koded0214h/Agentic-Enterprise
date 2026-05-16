import { Link } from 'react-router-dom'
import {
  RiTimerFlashLine, RiStore2Line, RiBarChart2Line, RiRocketLine,
  RiCustomerService2Line, RiCodeLine, RiArrowRightLine,
  RiLineChartLine, RiPieChartLine,
} from 'react-icons/ri'
import './BlueprintGallery.css'

const BLUEPRINTS = [
  {
    id: 'outbound-sales',
    Icon: RiRocketLine,
    name: 'Outbound Sales Machine',
    agents: 8,
    desc: 'Prospect research, personalised outreach, follow-up sequences and CRM sync.',
    cost: '$1.20',
    tags: ['Sales', 'Growth'],
    color: '#aa3bff',
  },
  {
    id: 'content-engine',
    Icon: RiTimerFlashLine,
    name: 'Content Engine',
    agents: 6,
    desc: 'SEO research, blog writing, social scheduling and performance reporting.',
    cost: '$0.80',
    tags: ['Content', 'Growth'],
    color: '#3dffa0',
  },
  {
    id: 'saas-launch',
    Icon: RiCodeLine,
    name: 'Developer Workforce',
    agents: 12,
    desc: 'Code review, PR summaries, test generation and dependency monitoring.',
    cost: '$2.40',
    tags: ['Engineering'],
    color: '#c084fc',
  },
  {
    id: 'customer-support',
    Icon: RiCustomerService2Line,
    name: 'Customer Support',
    agents: 5,
    desc: 'Ticket triage, FAQ resolution, escalation routing and CSAT tracking.',
    cost: '$0.60',
    tags: ['Support'],
    color: '#ffb03d',
  },
  {
    id: 'ecom-engine',
    Icon: RiStore2Line,
    name: 'E-commerce Engine',
    agents: 18,
    desc: 'Catalog management, fulfillment automation, returns and support.',
    cost: '$3.10',
    tags: ['Sales', 'Ops'],
    color: '#38bdf8',
  },
  {
    id: 'analytics-firm',
    Icon: RiBarChart2Line,
    name: 'Analytics Firm',
    agents: 9,
    desc: 'Data pipelines, reporting dashboards, anomaly detection and insight briefs.',
    cost: '$1.80',
    tags: ['Data', 'Finance'],
    color: '#f472b6',
  },
  {
    id: 'launch-landing-page',
    Icon: RiLineChartLine,
    name: 'Launch Landing Page',
    agents: 4,
    desc: 'Generate, design, and deploy a high-converting landing page. Includes copy, SEO, and deployment.',
    cost: '$0.50',
    tags: ['Growth', 'Marketing'],
    color: '#fb923c',
  },
  {
    id: 'setup-analytics-stack',
    Icon: RiPieChartLine,
    name: 'Setup Analytics Stack',
    agents: 3,
    desc: 'Configure product analytics, user tracking, funnel analysis, and dashboards for data-driven decisions.',
    cost: '$0.40',
    tags: ['Engineering', 'Data'],
    color: '#818cf8',
  },
]

export default function BlueprintGallery() {
  return (
    <div className="bp-gallery">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Blueprints</h1>
          <p>Pre-built agent teams you can deploy in minutes</p>
        </div>
      </div>

      <div className="bp-grid">
        {BLUEPRINTS.map(bp => (
          <Link key={bp.id} to={`/app/blueprints/${bp.id}`} className="bp-card card">
            <div className="bp-card-top">
              <div className="bp-card-icon" style={{ '--icon-color': bp.color }}>
                <bp.Icon size={20} />
              </div>
              <div className="bp-card-tags">
                {bp.tags.map(t => (
                  <span key={t} className="badge badge-purple">{t}</span>
                ))}
              </div>
            </div>
            <h3>{bp.name}</h3>
            <p>{bp.desc}</p>
            <div className="bp-card-footer">
              <div className="bp-card-meta">
                <span className="bp-meta-item">
                  <span className="bp-meta-num">{bp.agents}</span> agents
                </span>
                <span className="bp-meta-sep">·</span>
                <span className="bp-meta-item">
                  <span className="bp-meta-num">~{bp.cost}</span>/day
                </span>
              </div>
              <RiArrowRightLine className="bp-card-arrow" size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
