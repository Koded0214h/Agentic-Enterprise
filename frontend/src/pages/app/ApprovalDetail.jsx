import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  RiArrowLeftLine, RiCheckLine, RiCloseLine, RiShieldCheckLine,
  RiAlertLine, RiExternalLinkLine,
} from 'react-icons/ri'
import { agents as agentsAPI } from '../../api/agents'
import './ApprovalDetail.css'

const MOCK_APPROVALS = {
  'ap_001': {
    id: 'ap_001',
    agent: 'Finance Monitor',
    action: 'Wire transfer $12,400 to vendor ACME Corp via tool:payment',
    risk: 'high',
    risk_score: 88,
    policy: 'SOX — Escalate Agent-Initiated Financial Transactions',
    created: '2m ago',
    workflow_id: 'wf_outbound_sales',
    env: 'prod',
    context: [
      { role: 'user', content: 'Analyse Q4 vendor invoices and process payments for approved vendors.' },
      { role: 'agent', content: 'Scanning invoice queue. Found 3 pending invoices from approved vendors.' },
      { role: 'agent', content: 'Invoice INV-2024-0891 from ACME Corp: $12,400 for software licences. Vendor is on approved list. Processing payment...' },
      { role: 'system', content: 'POLICY BLOCK: SOX rule triggered. Amount $12,400 exceeds $10,000 threshold for agent-initiated transfers. Escalating to human review.' },
    ],
    state: {
      vendor: 'ACME Corp',
      amount: 12400,
      invoice_id: 'INV-2024-0891',
      vendor_approved: true,
      payment_method: 'wire_transfer',
      destination_account: 'IBAN: GB29NWBK60161331926819',
    },
  },
  'ap_002': {
    id: 'ap_002',
    agent: 'Growth Lead',
    action: 'Publish press release to PR Newswire — 800 word announcement',
    risk: 'medium',
    risk_score: 54,
    policy: 'Global Allow — External Publish Threshold',
    created: '8m ago',
    workflow_id: 'wf_content_engine',
    env: 'prod',
    context: [
      { role: 'user', content: 'Draft and publish a press release announcing our Series A funding round.' },
      { role: 'agent', content: 'Draft complete. 843 words, approved tone, no legal flags. Ready to submit to PR Newswire.' },
      { role: 'system', content: 'POLICY BLOCK: External publication threshold triggered. Requires human approval before distributing to press wire.' },
    ],
    state: {
      outlet: 'PR Newswire',
      word_count: 843,
      headline: 'AOS Raises $12M Series A to Build Autonomous Business Operating System',
      scheduled_for: '2026-05-10T14:00:00Z',
    },
  },
}

const FALLBACK = {
  id: '',
  agent: 'Agent',
  action: 'Action pending review',
  risk: 'medium',
  risk_score: 50,
  policy: 'Policy triggered',
  created: 'just now',
  workflow_id: 'wf_unknown',
  env: 'prod',
  context: [],
  state: {},
}

export default function ApprovalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const approval = MOCK_APPROVALS[id] || { ...FALLBACK, id }

  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(false)

  const riskColor = { high: 'red', medium: 'amber', low: 'green' }[approval.risk]

  async function handleDecision(action) {
    setLoading(true)
    try {
      if (action === 'approve') await agentsAPI.approve(id)
      else await agentsAPI.reject(id)
    } catch {}
    setDecision(action)
    setLoading(false)
  }

  if (decision) {
    return (
      <div className="apd-page">
        <div className="apd-outcome card">
          <div className={`apd-outcome-icon ${decision}`}>
            {decision === 'approve' ? <RiCheckLine size={28} /> : <RiCloseLine size={28} />}
          </div>
          <h2>{decision === 'approve' ? 'Action approved' : 'Action denied'}</h2>
          <p>
            {decision === 'approve'
              ? `${approval.agent} will resume from its checkpoint and execute the action.`
              : `${approval.agent} has been stopped. Downstream tasks are blocked.`}
          </p>
          <div className="apd-outcome-actions">
            <Link to={`/app/workflows/${approval.workflow_id}/run`} className="btn btn-ghost">
              View workflow <RiExternalLinkLine size={13} />
            </Link>
            <Link to="/app/approvals" className="btn btn-primary">Back to inbox →</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="apd-page">
      <Link to="/app/approvals" className="bpd-back">
        <RiArrowLeftLine size={15} /> Approvals
      </Link>

      <div className="apd-layout">
        {/* Main */}
        <div className="apd-main">
          {/* Risk header */}
          <div className={`card apd-risk-card apd-risk-${approval.risk}`}>
            <div className="apd-risk-score">
              <span className="apd-risk-num">{approval.risk_score}</span>
              <span className="apd-risk-label">/ 100</span>
            </div>
            <div className="apd-risk-body">
              <span className={`badge badge-${riskColor}`}>{approval.risk} risk</span>
              <h2>{approval.action}</h2>
              <div className="apd-risk-meta">
                <span><strong>{approval.agent}</strong></span>
                <span>·</span>
                <span>{approval.env} environment</span>
                <span>·</span>
                <span>{approval.created}</span>
              </div>
              <div className="apd-policy-tag">
                <RiShieldCheckLine size={12} />
                {approval.policy}
              </div>
            </div>
          </div>

          {/* Conversation context */}
          <div className="card apd-context-card">
            <h3>What the agent was doing</h3>
            <div className="apd-conversation">
              {approval.context.map((msg, i) => (
                <div key={i} className={`apd-msg apd-msg-${msg.role}`}>
                  <span className="apd-msg-role">{msg.role === 'user' ? 'You' : msg.role === 'agent' ? approval.agent : 'System'}</span>
                  <p className="apd-msg-content">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="apd-sidebar">
          {/* Action buttons */}
          <div className="card apd-action-card">
            <h3>Your decision</h3>
            <p>The agent is paused and waiting. Your decision is final for this action.</p>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => handleDecision('approve')}
              disabled={loading}
            >
              <RiCheckLine size={16} /> Approve action
            </button>
            <button
              className="btn btn-danger btn-full"
              onClick={() => handleDecision('reject')}
              disabled={loading}
            >
              <RiCloseLine size={16} /> Deny action
            </button>
            <Link
              to={`/app/workflows/${approval.workflow_id}/run`}
              className="btn btn-ghost btn-full btn-sm"
            >
              View workflow context <RiExternalLinkLine size={12} />
            </Link>
          </div>

          {/* State snapshot */}
          <div className="card apd-state-card">
            <h3>Agent state snapshot</h3>
            <p>The agent will resume from this exact state if approved.</p>
            <pre className="apd-state-json mono">
              {JSON.stringify(approval.state, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
