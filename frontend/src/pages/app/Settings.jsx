import { useState, useEffect } from 'react'
import {
  RiUserLine, RiKeyLine, RiShieldLockLine, RiBellLine, RiBuilding2Line,
  RiCheckLine, RiCloseLine, RiAddLine, RiTeamLine,
} from 'react-icons/ri'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import './Settings.css'

const TABS = [
  { id: 'profile',       label: 'Profile',        Icon: RiUserLine },
  { id: 'providers',     label: 'Providers',       Icon: RiKeyLine },
  { id: 'security',      label: 'Security',        Icon: RiShieldLockLine },
  { id: 'notifications', label: 'Notifications',   Icon: RiBellLine },
  { id: 'workspace',     label: 'Workspace',       Icon: RiBuilding2Line },
]

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', models: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-3-5'] },
  { id: 'openai',    name: 'OpenAI',    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  { id: 'gemini',    name: 'Google Gemini', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'mistral',   name: 'Mistral',   models: ['mistral-large-latest', 'mistral-small-latest', 'open-mixtral-8x22b'] },
]

const NOTIF_KEYS = [
  { key: 'email_approvals',  label: 'Email on approval requests',  desc: 'Get notified when agents request human approval' },
  { key: 'email_failures',   label: 'Email on agent failures',     desc: 'Alert when an agent errors or fails a task' },
  { key: 'email_budget',     label: 'Email on budget alerts',      desc: 'Warn when spend thresholds are approaching' },
  { key: 'inapp',            label: 'In-app notifications',        desc: 'Show notifications inside the AOS interface' },
]

function loadNotifPrefs() {
  try { return JSON.parse(localStorage.getItem('aos_notif_prefs') || '{}') } catch { return {} }
}
function saveNotifPrefs(prefs) {
  localStorage.setItem('aos_notif_prefs', JSON.stringify(prefs))
}

export default function Settings() {
  const [tab, setTab] = useState('profile')

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage your profile, API providers, security, and workspace</p>
        </div>
      </div>

      <div className="set-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`set-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.Icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile'       && <ProfileTab />}
      {tab === 'providers'     && <ProvidersTab />}
      {tab === 'security'      && <SecurityTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'workspace'     && <WorkspaceTab />}
    </div>
  )
}

function ProfileTab() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '',
  })
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name:  user.last_name  || '',
        username:   user.username   || '',
        email:      user.email      || '',
      })
    }
  }, [user])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      await api.patch('/auth/me/', {
        first_name: form.first_name,
        last_name:  form.last_name,
        username:   form.username,
      })
      setStatus({ ok: true, msg: 'Profile saved.' })
    } catch (err) {
      setStatus({ ok: false, msg: err.message || 'Failed to save profile.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="set-section">
      <div className="set-section-head">
        <h2>Profile information</h2>
        <p>Update your name and username. Your email is set at signup and cannot be changed here.</p>
      </div>
      <form className="set-form" onSubmit={handleSave}>
        <div className="set-form-row">
          <label>
            <span>First name</span>
            <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" />
          </label>
          <label>
            <span>Last name</span>
            <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" />
          </label>
        </div>
        <label>
          <span>Username</span>
          <input name="username" value={form.username} onChange={handleChange} placeholder="username" />
        </label>
        <label>
          <span>Email address</span>
          <input name="email" value={form.email} readOnly disabled className="set-input-readonly" />
        </label>
        {status && (
          <div className={`set-feedback ${status.ok ? 'ok' : 'err'}`}>
            {status.ok ? <RiCheckLine size={14} /> : <RiCloseLine size={14} />}
            {status.msg}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn" disabled={saving} style={{ background: 'var(--accent)', color: '#fff', border: 'none', minWidth: 96 }}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ProvidersTab() {
  const [configs, setConfigs] = useState({})
  const [open, setOpen] = useState(null)
  const [form, setForm] = useState({ api_key: '', model: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState({})

  useEffect(() => {
    api.get('/auth/llm-configs/')
      .then(data => {
        const map = {}
        const arr = Array.isArray(data) ? data : (data?.results || [])
        arr.forEach(c => { map[c.provider] = c })
        setConfigs(map)
      })
      .catch(() => {})
  }, [])

  function openForm(p) {
    const existing = configs[p.id]
    setForm({ api_key: '', model: existing?.model_preference || p.models[0] })
    setOpen(p.id)
  }

  async function handleSave(provider) {
    setSaving(true)
    try {
      const existing = configs[provider.id]
      const payload = {
        provider: provider.id,
        api_key: form.api_key,
        model_preference: form.model,
      }
      let result
      if (existing?.id) {
        result = await api.patch(`/auth/llm-configs/${existing.id}/`, payload)
      } else {
        result = await api.post('/auth/llm-configs/', payload)
      }
      setConfigs(c => ({ ...c, [provider.id]: result }))
      setSaved(s => ({ ...s, [provider.id]: true }))
      setOpen(null)
    } catch {
      // silently fail — form stays open
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="set-section">
      <div className="set-section-head">
        <h2>LLM providers</h2>
        <p>Configure API keys for the language model providers your agents use.</p>
      </div>
      <div className="set-providers">
        {PROVIDERS.map(p => {
          const cfg = configs[p.id]
          const isConfigured = !!cfg || saved[p.id]
          const isOpen = open === p.id
          return (
            <div key={p.id} className={`set-provider-card ${isOpen ? 'expanded' : ''}`}>
              <div className="set-provider-head">
                <div className="set-provider-info">
                  <span className="set-provider-name">{p.name}</span>
                  <span className={`badge ${isConfigured ? 'badge-green' : 'badge-amber'}`}>
                    {isConfigured ? 'Connected' : 'Not configured'}
                  </span>
                  {isConfigured && (
                    <span className="set-provider-key">API key: ***…{cfg?.api_key_hint || '****'}</span>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => isOpen ? setOpen(null) : openForm(p)}
                >
                  {isConfigured ? 'Reconfigure' : 'Configure'}
                </button>
              </div>

              {isOpen && (
                <div className="set-provider-form">
                  <label>
                    <span>API Key</span>
                    <input
                      type="password"
                      placeholder="sk-…"
                      value={form.api_key}
                      onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Default model</span>
                    <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}>
                      {p.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>Cancel</button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
                      disabled={saving || !form.api_key}
                      onClick={() => handleSave(p)}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SecurityTab() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [resetMsg, setResetMsg] = useState(null)

  async function sendReset() {
    if (!user?.email) return
    setSending(true)
    setResetMsg(null)
    try {
      await api.post('/auth/password-reset/', { email: user.email })
      setResetMsg({ ok: true, msg: 'Reset email sent. Check your inbox.' })
    } catch {
      setResetMsg({ ok: false, msg: 'Failed to send reset email.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="set-section">
      <div className="set-section-head">
        <h2>Security</h2>
        <p>Manage your password, active sessions, and two-factor authentication.</p>
      </div>

      <div className="set-security-block">
        <div className="set-security-block-head">
          <div>
            <div className="set-security-title">Password reset</div>
            <div className="set-security-desc">We'll send a password reset link to {user?.email || 'your email'}.</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={sendReset}
            disabled={sending}
          >
            {sending ? 'Sending…' : 'Send reset email'}
          </button>
        </div>
        {resetMsg && (
          <div className={`set-feedback ${resetMsg.ok ? 'ok' : 'err'}`} style={{ marginTop: 10 }}>
            {resetMsg.ok ? <RiCheckLine size={14} /> : <RiCloseLine size={14} />}
            {resetMsg.msg}
          </div>
        )}
      </div>

      <div className="set-security-block">
        <div className="set-security-block-head">
          <div>
            <div className="set-security-title">Active sessions</div>
            <div className="set-security-desc">You are currently signed in on this device.</div>
          </div>
        </div>
        <div className="set-session-row">
          <span className="dot dot-green" />
          <span className="set-session-label">This browser — current session</span>
          <span className="badge badge-green">Active</span>
        </div>
      </div>

      <div className="set-security-block">
        <div className="set-security-block-head">
          <div>
            <div className="set-security-title">Two-factor authentication</div>
            <div className="set-security-desc">Add an extra layer of security to your account.</div>
          </div>
          <span className="badge badge-amber">Coming soon</span>
        </div>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState(loadNotifPrefs)

  function toggle(key) {
    setPrefs(p => {
      const next = { ...p, [key]: !p[key] }
      saveNotifPrefs(next)
      return next
    })
  }

  return (
    <div className="set-section">
      <div className="set-section-head">
        <h2>Notifications</h2>
        <p>Choose how and when AOS alerts you about agent activity.</p>
      </div>
      <div className="set-notif-list">
        {NOTIF_KEYS.map(n => (
          <div key={n.key} className="set-notif-row">
            <div className="set-notif-info">
              <span className="set-notif-label">{n.label}</span>
              <span className="set-notif-desc">{n.desc}</span>
            </div>
            <button
              className={`set-toggle ${prefs[n.key] ? 'on' : ''}`}
              onClick={() => toggle(n.key)}
              aria-label={`Toggle ${n.label}`}
            >
              <span className="set-toggle-thumb" />
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text)', marginTop: 8 }}>
        Preferences are stored locally in this browser.
      </p>
    </div>
  )
}

function WorkspaceTab() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' })
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState(null)

  useEffect(() => {
    api.get('/auth/workspaces/')
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.results || [])
        setWorkspaces(arr)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const ws = workspaces[0]

  async function handleInvite(e) {
    e.preventDefault()
    if (!ws?.id) return
    setInviting(true)
    setInviteMsg(null)
    try {
      await api.post(`/auth/workspaces/${ws.id}/invite/`, inviteForm)
      setInviteMsg({ ok: true, msg: `Invitation sent to ${inviteForm.email}.` })
      setInviteForm({ email: '', role: 'member' })
      setInviteOpen(false)
    } catch (err) {
      setInviteMsg({ ok: false, msg: err.message || 'Failed to send invite.' })
    } finally {
      setInviting(false)
    }
  }

  const PLAN_COLOR = { free: 'amber', pro: 'green', enterprise: 'accent' }

  return (
    <div className="set-section">
      <div className="set-section-head">
        <h2>Workspace</h2>
        <p>Manage your workspace settings, plan, and team members.</p>
      </div>

      {loading ? (
        <div className="set-loading">Loading workspace…</div>
      ) : !ws ? (
        <div className="set-empty">No workspace found.</div>
      ) : (
        <>
          <div className="card set-ws-card">
            <div className="set-ws-row">
              <span className="set-ws-label">Workspace name</span>
              <span className="set-ws-val">{ws.name || 'My Workspace'}</span>
            </div>
            <div className="set-ws-row">
              <span className="set-ws-label">Plan</span>
              <span className={`badge badge-${PLAN_COLOR[ws.plan?.toLowerCase()] || 'amber'}`}>
                {ws.plan || 'Free'}
              </span>
            </div>
            <div className="set-ws-row">
              <span className="set-ws-label">Monthly token budget</span>
              <span className="set-ws-val" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                {ws.token_budget ? ws.token_budget.toLocaleString() : 'Unlimited'}
              </span>
            </div>
            <div className="set-ws-row">
              <span className="set-ws-label">Workspace ID</span>
              <span className="set-ws-val" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)' }}>
                {String(ws.id).slice(0, 16)}…
              </span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
                <RiTeamLine size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Members
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setInviteOpen(v => !v)}>
                <RiAddLine size={13} /> Invite member
              </button>
            </div>

            {inviteMsg && (
              <div className={`set-feedback ${inviteMsg.ok ? 'ok' : 'err'}`} style={{ marginBottom: 10 }}>
                {inviteMsg.ok ? <RiCheckLine size={14} /> : <RiCloseLine size={14} />}
                {inviteMsg.msg}
              </div>
            )}

            {inviteOpen && (
              <form className="set-invite-form" onSubmit={handleInvite}>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <select
                  value={inviteForm.role}
                  onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="viewer">Viewer</option>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" className="btn btn-sm" style={{ background: 'var(--accent)', color: '#fff', border: 'none' }} disabled={inviting}>
                  {inviting ? 'Sending…' : 'Send invite'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInviteOpen(false)}>Cancel</button>
              </form>
            )}

            <div className="card" style={{ padding: 0 }}>
              {(ws.members || []).length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text)' }}>
                  No additional members yet. Invite your team above.
                </div>
              ) : (
                (ws.members || []).map(m => (
                  <div key={m.id || m.email} className="set-member-row">
                    <div className="shell-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {(m.first_name?.[0] || m.email?.[0] || '?').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-h)' }}>
                        {m.first_name ? `${m.first_name} ${m.last_name || ''}`.trim() : m.email}
                      </div>
                      {m.first_name && <div style={{ fontSize: 11, color: 'var(--text)' }}>{m.email}</div>}
                    </div>
                    <span className={`badge badge-${m.role === 'admin' ? 'amber' : 'green'}`}>{m.role || 'member'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
