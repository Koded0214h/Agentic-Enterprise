import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RiShieldCheckLine, RiArrowRightLine, RiTimeLine } from 'react-icons/ri'
import { agents as agentsAPI } from '../../api/agents'
import './ApprovalsInbox.css'

const MOCK = [
  {
    id: 'ap_001',
    agent: 'Finance Monitor',
    action: 'Wire transfer $12,400 to vendor ACME Corp via tool:payment',
    risk: 'high',
    risk_score: 88,
    policy: 'SOX — Escalate Agent-Initiated Financial Transactions',
    created: '2m ago',
    workflow: 'wf_outbound_sales',
    env: 'prod',
  },
  {
    id: 'ap_002',
    agent: 'Growth Lead',
    action: 'Publish press release to PR Newswire — 800 word announcement',
    risk: 'medium',
    risk_score: 54,
    policy: 'Global Allow — External Publish Threshold',
    created: '8m ago',
    workflow: 'wf_content_engine',
    env: 'prod',
  },
  {
    id: 'ap_003',
    agent: 'Sales Navigator',
    action: 'Send contract (PDF, $24,000 ACV) to enterprise prospect via DocuSign',
    risk: 'medium',
    risk_score: 61,
    policy: 'Enterprise Contract Approval Gate',
    created: '14m ago',
    workflow: 'wf_outbound_sales',
    env: 'prod',
  },
]

const RISK_COLOR = { high: 'red', medium: 'amber', low: 'green' }

export default function ApprovalsInbox() {
  const [items, setItems] = useState(MOCK)

  useEffect(() => {
    agentsAPI.pendingActions()
      .then(d => { if (d?.results?.length) setItems(d.results) })
      .catch(() => {})
  }, [])

  return (
    <div className="inbox-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Approvals</h1>
          <p>High-risk agent actions paused for your review</p>
        </div>
        <span className="badge badge-amber">{items.length} pending</span>
      </div>

      {items.length === 0 ? (
        <div className="inbox-empty card">
          <RiShieldCheckLine size={32} color="var(--green)" />
          <p>All clear — no pending approvals</p>
          <span>All agents are operating within policy</span>
        </div>
      ) : (
        <div className="inbox-list">
          {items.map(item => (
            <Link key={item.id} to={`/app/approvals/${item.id}`} className="inbox-card card">
              <div className="inbox-card-left">
                <div className="inbox-risk-score" data-risk={item.risk}>
                  {item.risk_score}
                </div>
              </div>
              <div className="inbox-card-body">
                <div className="inbox-card-top">
                  <span className="inbox-agent">{item.agent}</span>
                  <span className="inbox-env badge badge-purple">{item.env}</span>
                </div>
                <p className="inbox-action">{item.action}</p>
                <div className="inbox-meta">
                  <span className={`badge badge-${RISK_COLOR[item.risk]}`}>{item.risk} risk</span>
                  <span className="inbox-policy">{item.policy}</span>
                  <span className="inbox-time"><RiTimeLine size={11} /> {item.created}</span>
                </div>
              </div>
              <RiArrowRightLine className="inbox-arrow" size={16} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
