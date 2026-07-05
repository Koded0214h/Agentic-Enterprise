import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RiArrowLeftLine, RiCheckLine, RiCloseLine, RiShieldCheckLine } from 'react-icons/ri'
import { agents } from '../../api/agents'
import './ApprovalDetail.css'

export default function ApprovalDetail() {
  const { id } = useParams()
  const [approval, setApproval] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deciding, setDeciding] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    agents.pendingAction(id)
      .then((data) => { if (!cancelled) setApproval(data) })
      .catch((err) => { if (!cancelled) setError(err?.data?.detail || err.message || 'Failed to load approval') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  async function decide(decision) {
    setDeciding(decision)
    setError('')
    try {
      if (decision === 'APPROVED') await agents.approve(id, { decision })
      else await agents.reject(id, { decision })
      setApproval((current) => ({ ...current, status: decision }))
    } catch (err) {
      setError(err?.data?.error || err?.data?.detail || err.message || 'Unable to save decision')
    } finally {
      setDeciding('')
    }
  }

  if (loading) return <div className="apd-page"><div className="card apd-context-card">Loading approval…</div></div>
  if (error && !approval) return <div className="apd-page"><Link to="/app/approvals" className="bpd-back"><RiArrowLeftLine size={15} /> Approvals</Link><div className="projects-error">{error}</div></div>

  const snapshot = approval?.state_snapshot || {}
  const messages = Array.isArray(snapshot.messages) ? snapshot.messages : []
  const decided = approval?.status && approval.status !== 'PENDING' && approval.status !== 'ESCALATED'

  return (
    <div className="apd-page">
      <Link to={approval?.project ? `/app/approvals?project_id=${approval.project}` : '/app/approvals'} className="bpd-back"><RiArrowLeftLine size={15} /> Approvals</Link>
      {error && <div className="projects-error">{error}</div>}
      <div className="apd-layout">
        <div className="apd-main">
          <div className="card apd-risk-card apd-risk-medium">
            <div className="apd-risk-body">
              <span className={`badge badge-${approval.status === 'PENDING' ? 'amber' : approval.status === 'APPROVED' ? 'green' : 'red'}`}>{approval.status}</span>
              <h2>{approval.action_type || 'Agent action'} · {approval.resource || 'Unknown resource'}</h2>
              <div className="apd-risk-meta"><span><strong>{approval.agent_name || 'Agent'}</strong></span><span>·</span><span>{approval.conversation_title || 'Conversation'}</span><span>·</span><span>{approval.created_at ? new Date(approval.created_at).toLocaleString() : 'Time unavailable'}</span></div>
              {approval.reason && <div className="apd-policy-tag"><RiShieldCheckLine size={12} />{approval.reason}</div>}
            </div>
          </div>
          <div className="card apd-context-card">
            <h3>What the agent was doing</h3>
            {messages.length ? <div className="apd-conversation">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`apd-msg apd-msg-${message.role}`}><span className="apd-msg-role">{message.role}</span><p className="apd-msg-content">{message.content}</p></div>)}</div> : <p>No conversation snapshot was supplied for this action.</p>}
          </div>
        </div>
        <div className="apd-sidebar">
          <div className="card apd-action-card">
            <h3>Your decision</h3>
            {decided ? <p>This action was {approval.status.toLowerCase()}.</p> : <><p>The agent is paused and waiting for an explicit decision.</p><button className="btn btn-primary btn-full btn-lg" onClick={() => decide('APPROVED')} disabled={Boolean(deciding)}><RiCheckLine size={16} /> {deciding === 'APPROVED' ? 'Approving…' : 'Approve action'}</button><button className="btn btn-danger btn-full" onClick={() => decide('DENIED')} disabled={Boolean(deciding)}><RiCloseLine size={16} /> {deciding === 'DENIED' ? 'Denying…' : 'Deny action'}</button></>}
          </div>
          <div className="card apd-state-card"><h3>Agent state snapshot</h3><p>This is the backend checkpoint used when an approved action resumes.</p><pre className="apd-state-json mono">{JSON.stringify(snapshot, null, 2)}</pre></div>
        </div>
      </div>
    </div>
  )
}
