import { useState, useEffect } from 'react'
import {
  RiGridLine, RiServerLine, RiTeamLine, RiKeyLine,
  RiCheckLine, RiCloseLine, RiSubtractLine, RiRobot2Line,
  RiAddLine, RiShieldCheckLine,
} from 'react-icons/ri'
import { agents as agentsAPI } from '../../api/agents'
import './IAMPage.css'

const TABS = [
  { id: 'trust',        label: 'Trust Matrix',   Icon: RiGridLine },
  { id: 'environments', label: 'Environments',   Icon: RiServerLine },
  { id: 'members',      label: 'Members',        Icon: RiTeamLine },
  { id: 'api-keys',     label: 'API Keys',       Icon: RiKeyLine },
]

export default function IAMPage() {
  const [tab, setTab] = useState('trust')

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>IAM</h1>
          <p>Agent trust, environment controls, team access, and API keys</p>
        </div>
      </div>

      <div className="iam-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`iam-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.Icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'trust'        && <TrustMatrix />}
      {tab === 'environments' && <Environments />}
      {tab === 'members'      && <Members />}
      {tab === 'api-keys'     && <APIKeys />}
    </div>
  )
}

const INITIAL_TRUST = {}

function TrustMatrix() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [trust, setTrust] = useState(INITIAL_TRUST)
  const [modal, setModal] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    agentsAPI.list()
      .then(d => {
        const arr = Array.isArray(d) ? d : (d.results || [])
        setAgents(arr.slice(0, 8))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const key = (src, tgt) => `${src}__${tgt}`

  const cellStatus = (src, tgt) => {
    if (src === tgt) return 'self'
    return trust[key(src, tgt)] || 'none'
  }

  const toggleCell = (src, tgt) => {
    if (src === tgt) return
    const current = trust[key(src, tgt)]
    if (current === 'allow') {
      setTrust(t => ({ ...t, [key(src, tgt)]: 'none' }))
    } else if (current === 'none' || !current) {
      setModal({ src, tgt })
      setReason('')
    }
  }

  const confirmAllow = () => {
    if (!modal) return
    setTrust(t => ({ ...t, [key(modal.src, modal.tgt)]: 'allow' }))
    setModal(null)
  }

  const cellIcon = (status) => {
    if (status === 'self') return <span style={{ color: 'var(--border-2)' }}>—</span>
    if (status === 'allow') return <RiCheckLine size={14} color="var(--green)" />
    return <RiSubtractLine size={14} color="var(--border-2)" />
  }

  if (loading) {
    return <div className="iam-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>
  }

  if (agents.length === 0) {
    return <IAMEmpty icon={<RiGridLine size={32} />} text="No agents found. Create agents to configure trust policies." />
  }

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
          Click a cell to grant trust between agents. In production, agents default-deny all calls to other agents unless explicitly allowed here.
        </p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="iam-matrix-wrap">
          <table className="iam-matrix">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Source → Target</th>
                {agents.map(a => (
                  <th key={a.id} title={a.name}>{a.name.slice(0, 12)}{a.name.length > 12 ? '…' : ''}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map(src => (
                <tr key={src.id}>
                  <td className="iam-row-header">{src.name}</td>
                  {agents.map(tgt => {
                    const status = cellStatus(src.id, tgt.id)
                    return (
                      <td key={tgt.id}>
                        <div
                          className={`iam-cell ${status}`}
                          onClick={() => toggleCell(src.id, tgt.id)}
                          title={status === 'self' ? 'Same agent' : status === 'allow' ? `${src.name} → ${tgt.name}: ALLOWED (click to revoke)` : `${src.name} → ${tgt.name}: DENY (click to allow)`}
                        >
                          {cellIcon(status)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><RiCheckLine size={13} color="var(--green)" /> Allowed</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><RiSubtractLine size={13} color="var(--border-2)" /> Denied (default)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><RiSubtractLine size={13} color="var(--border-2)" style={{ opacity: 0.4 }} /> Self (N/A)</span>
      </div>

      {modal && (
        <div className="iam-modal-overlay" onClick={() => setModal(null)}>
          <div className="iam-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', align: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                <RiShieldCheckLine size={18} />
              </div>
              <div>
                <h3>Grant trust access</h3>
                <p style={{ marginTop: 4, fontSize: 12 }}>
                  Allow <strong style={{ color: 'var(--text-h)' }}>{agents.find(a => a.id === modal.src)?.name}</strong> to call <strong style={{ color: 'var(--text-h)' }}>{agents.find(a => a.id === modal.tgt)?.name}</strong>?
                </p>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                Reason (optional)
              </label>
              <textarea
                placeholder="e.g. Sales Agent needs to query Finance Agent for budget checks"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
                onClick={confirmAllow}
              >
                <RiCheckLine size={13} /> Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Environments() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    agentsAPI.list()
      .then(d => {
        const arr = Array.isArray(d) ? d : (d.results || [])
        setAgents(arr)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const byEnv = agents.reduce((acc, a) => {
    const env = (a.environment || 'unknown').toLowerCase()
    if (!acc[env]) acc[env] = []
    acc[env].push(a)
    return acc
  }, {})

  const ENVS = [
    { key: 'dev',     label: 'Development',  cls: 'iam-env-dev',     badge: 'green' },
    { key: 'staging', label: 'Staging',       cls: 'iam-env-staging', badge: 'amber' },
    { key: 'prod',    label: 'Production',    cls: 'iam-env-prod',    badge: 'red'   },
  ]

  if (loading) return <div className="iam-empty"><div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div></div>

  return (
    <div className="iam-env-grid">
      {ENVS.map(env => {
        const envAgents = byEnv[env.key] || []
        return (
          <div key={env.key} className="iam-env-col">
            <div className={`iam-env-header ${env.cls}`}>
              <span className="iam-env-name">{env.label}</span>
              <span className={`badge badge-${env.badge}`}>{envAgents.length} agents</span>
            </div>
            {envAgents.length === 0 ? (
              <div className="iam-env-empty">No agents in {env.label.toLowerCase()}</div>
            ) : (
              envAgents.slice(0, 10).map(a => (
                <div key={a.id} className="iam-env-card">
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                    <RiRobot2Line size={13} />
                  </div>
                  <div>
                    <div className="iam-env-agent-name">{a.name}</div>
                    <div className="iam-env-agent-type">{a.agent_type}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className={`dot dot-${a.status === 'RUNNING' ? 'green' : a.status === 'FAILED' ? 'red' : 'amber'}`} />
                  </div>
                </div>
              ))
            )}
            {envAgents.length > 10 && (
              <div style={{ fontSize: 11, color: 'var(--text)', textAlign: 'center', padding: '8px 0' }}>
                +{envAgents.length - 10} more
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Members() {
  const MOCK_MEMBERS = [
    { id: 1, name: 'Raufu Abdulraman', email: 'coder0214h@gmail.com', role: 'Admin', joined: '2025-01-15' },
  ]

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{MOCK_MEMBERS.length} member</span>
        <button className="btn btn-sm" style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12 }}>
          <RiAddLine size={13} /> Invite member
        </button>
      </div>
      {MOCK_MEMBERS.map(m => (
        <div key={m.id} className="iam-member-row">
          <div className="iam-avatar">{m.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div className="iam-member-name">{m.name}</div>
            <div className="iam-member-email">{m.email}</div>
          </div>
          <span className="badge badge-green">{m.role}</span>
        </div>
      ))}
    </div>
  )
}

function APIKeys() {
  const [keys] = useState([])
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: 'var(--text)' }}>
          API keys grant programmatic access to your AOS workspace.
        </p>
        <button
          className="btn btn-sm"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12 }}
          onClick={() => setCreating(true)}
        >
          <RiAddLine size={13} /> New key
        </button>
      </div>

      {creating && (
        <div className="card" style={{ marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Key name (e.g. CI/CD pipeline)"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            style={{
              flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text-h)',
              fontSize: 13, outline: 'none', fontFamily: 'var(--sans)',
            }}
            autoFocus
          />
          <button className="btn btn-ghost btn-sm" onClick={() => setCreating(false)}>Cancel</button>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12 }}
            onClick={() => { alert('Backend API key management endpoint not yet wired.'); setCreating(false) }}
          >
            Create
          </button>
        </div>
      )}

      <div className="card">
        {keys.length === 0 ? (
          <IAMEmpty icon={<RiKeyLine size={28} />} text="No API keys yet. Create one to integrate AOS into CI/CD, scripts, or external tools." />
        ) : null}
      </div>
    </div>
  )
}

function IAMEmpty({ icon, text }) {
  return (
    <div className="iam-empty">
      <div className="iam-empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  )
}
