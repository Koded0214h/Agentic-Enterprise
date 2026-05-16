import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  RiShieldCheckLine, RiArrowRightLine, RiTimeLine,
  RiAlertLine, RiCheckLine, RiCloseLine,
} from 'react-icons/ri'
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
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState(MOCK)
  const [escalated, setEscalated] = useState([])
  const [overriding, setOverriding] = useState(null) // action id being overridden

  useEffect(() => {
    agentsAPI.pendingActions()
      .then(d => { if (d?.results?.length) setItems(d.results) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'escalated') {
      agentsAPI.escalations()
        .then(d => setEscalated(d?.escalated || []))
        .catch(() => {})
    }
  }, [tab])

  async function handleOverride(actionId, decision) {
    setOverriding(actionId)
    try {
      if (decision === 'APPROVED') {
        await agentsAPI.approve(actionId)
      } else {
        await agentsAPI.reject(actionId)
      }
      setEscalated(prev => prev.filter(a => a.id !== actionId))
    } catch {
      // swallow — show nothing on error
    } finally {
      setOverriding(null)
    }
  }

  return (
    <div className="inbox-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Approvals</h1>
          <p>High-risk agent actions paused for your review</p>
        </div>
        <span className="badge badge-amber">{items.length} pending</span>
      </div>

      <div className="inbox-tabs">
        <button
          className={`inbox-tab${tab === 'pending' ? ' inbox-tab--active' : ''}`}
          onClick={() => setTab('pending')}
        >
          Pending
          {items.length > 0 && (
            <span className="inbox-tab-count">{items.length}</span>
          )}
        </button>
        <button
          className={`inbox-tab${tab === 'escalated' ? ' inbox-tab--active' : ''}`}
          onClick={() => setTab('escalated')}
        >
          Escalated
          {escalated.length > 0 && (
            <span className="inbox-tab-count inbox-tab-count--red">{escalated.length}</span>
          )}
        </button>
      </div>

      {tab === 'pending' && (
        <>
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
        </>
      )}

      {tab === 'escalated' && (
        <>
          {escalated.length === 0 ? (
            <div className="inbox-empty card">
              <RiShieldCheckLine size={32} color="var(--green)" />
              <p>No escalated actions</p>
              <span>Council has resolved all queued decisions</span>
            </div>
          ) : (
            <div className="inbox-list">
              {escalated.map(action => (
                <div key={action.id} className="inbox-card card inbox-escalated-card">
                  <div className="inbox-card-left">
                    <div className="inbox-escalated-icon">
                      <RiAlertLine size={20} color="var(--amber)" />
                    </div>
                  </div>
                  <div className="inbox-card-body">
                    <div className="inbox-card-top">
                      <span className="inbox-agent">{action.agent_name}</span>
                      <span className="badge badge-amber">escalated</span>
                    </div>
                    <p className="inbox-action">{action.action_type}</p>
                    {action.description && (
                      <p className="inbox-escalated-reason">{action.description}</p>
                    )}
                    <div className="inbox-meta">
                      <span className="inbox-time">
                        <RiTimeLine size={11} />
                        {new Date(action.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="inbox-escalated-actions">
                    <button
                      className="btn btn-sm btn-ghost inbox-override-btn inbox-override-approve"
                      disabled={overriding === action.id}
                      onClick={() => handleOverride(action.id, 'APPROVED')}
                      title="Override: Approve"
                    >
                      <RiCheckLine size={14} /> Approve
                    </button>
                    <button
                      className="btn btn-sm btn-ghost inbox-override-btn inbox-override-reject"
                      disabled={overriding === action.id}
                      onClick={() => handleOverride(action.id, 'DENIED')}
                      title="Override: Reject"
                    >
                      <RiCloseLine size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
