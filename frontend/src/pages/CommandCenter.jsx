import { useState, useEffect } from 'react'
import {
  RiDashboardLine, RiRobot2Line, RiFlowChart, RiShieldCheckLine,
  RiFileListLine, RiWalletLine, RiShutDownLine,
  RiCheckLine, RiCloseLine,
} from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { agents as agentsAPI } from '../api/agents'
import './CommandCenter.css'

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',  Icon: RiDashboardLine },
  { id: 'agents',    label: 'Agents',    Icon: RiRobot2Line },
  { id: 'tasks',     label: 'Tasks',     Icon: RiFlowChart },
  { id: 'approvals', label: 'Approvals', Icon: RiShieldCheckLine },
  { id: 'logs',      label: 'Logs',      Icon: RiFileListLine },
  { id: 'billing',   label: 'Billing',   Icon: RiWalletLine },
]

const MOCK_AGENTS = [
  { id: 1, name: 'Growth Lead', role: 'growth', status: 'active', tasks_today: 24, model: 'claude-opus-4-7' },
  { id: 2, name: 'Content Factory', role: 'content', status: 'active', tasks_today: 57, model: 'gpt-4o' },
  { id: 3, name: 'Sales Navigator', role: 'sales', status: 'idle', tasks_today: 11, model: 'claude-sonnet-4-6' },
  { id: 4, name: 'Finance Monitor', role: 'finance', status: 'paused', tasks_today: 3, model: 'claude-opus-4-7' },
  { id: 5, name: 'SEO Architect', role: 'growth', status: 'active', tasks_today: 38, model: 'gpt-4o' },
  { id: 6, name: 'Support Triage', role: 'support', status: 'active', tasks_today: 91, model: 'claude-haiku-4-5' },
]

const MOCK_APPROVALS = [
  { id: 1, agent: 'Finance Monitor', action: 'Wire transfer $12,400 to vendor ACME Corp', risk: 'high', created: '2m ago' },
  { id: 2, agent: 'Growth Lead', action: 'Publish press release to PR Newswire', risk: 'medium', created: '8m ago' },
  { id: 3, agent: 'Sales Navigator', action: 'Send contract to enterprise prospect', risk: 'medium', created: '14m ago' },
]

const MOCK_LOG = [
  { id: 1, ts: '09:42:11', agent: 'Content Factory', msg: 'Published 3 blog posts to CMS', type: 'success' },
  { id: 2, ts: '09:41:57', agent: 'SEO Architect', msg: 'Keyword gap analysis complete — 847 opportunities', type: 'success' },
  { id: 3, ts: '09:41:03', agent: 'Growth Lead', msg: 'A/B test variant deployed to 20% of traffic', type: 'success' },
  { id: 4, ts: '09:40:22', agent: 'Finance Monitor', msg: 'Flagged transaction for HITL approval', type: 'warning' },
  { id: 5, ts: '09:39:55', agent: 'Support Triage', msg: 'Resolved 14 tickets autonomously', type: 'success' },
  { id: 6, ts: '09:38:41', agent: 'Sales Navigator', msg: 'CRM updated with 6 qualified leads', type: 'success' },
]

export default function CommandCenter() {
  const [section, setSection] = useState('overview')
  const [approvals, setApprovals] = useState(MOCK_APPROVALS)
  const [agentList, setAgentList] = useState(MOCK_AGENTS)
  const [liveLogs, setLiveLogs] = useState(MOCK_LOG)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    agentsAPI.list().then(data => {
      if (data?.results?.length) setAgentList(data.results)
    }).catch(() => {})

    agentsAPI.pendingActions().then(data => {
      if (data?.results?.length) setApprovals(data.results)
    }).catch(() => {})
  }, [])

  function approve(id) {
    agentsAPI.approve(id).catch(() => {})
    setApprovals(prev => prev.filter(a => a.id !== id))
  }
  function reject(id) {
    agentsAPI.reject(id).catch(() => {})
    setApprovals(prev => prev.filter(a => a.id !== id))
  }

  const activeCount = agentList.filter(a => a.status === 'active').length
  const totalTasks = agentList.reduce((s, a) => s + (a.tasks_today || 0), 0)

  return (
    <div className="cc-layout">
      {/* Sidebar */}
      <aside className={`cc-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="cc-sidebar-top">
          <span className="cc-logo">AOS</span>
          <button className="cc-collapse-btn" onClick={() => setSidebarOpen(s => !s)}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="cc-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`cc-nav-item ${section === item.id ? 'active' : ''}`}
              onClick={() => setSection(item.id)}
            >
              <span className="cc-nav-icon"><item.Icon size={17} /></span>
              {sidebarOpen && <span className="cc-nav-label">{item.label}</span>}
              {item.id === 'approvals' && approvals.length > 0 && (
                <span className="cc-badge">{approvals.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="cc-sidebar-footer">
          {sidebarOpen && (
            <div className="cc-user-chip">
              <div className="cc-avatar">
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="cc-user-info">
                <span className="cc-user-name">{user?.first_name || user?.email}</span>
                <span className="cc-user-role">Admin</span>
              </div>
            </div>
          )}
          <button className="cc-logout-btn" onClick={logout} title="Sign out"><RiShutDownLine size={16} /></button>
        </div>
      </aside>

      {/* Main */}
      <main className="cc-main">
        {/* Top bar */}
        <header className="cc-topbar">
          <div className="cc-topbar-left">
            <h1 className="cc-section-title">
              {NAV_ITEMS.find(n => n.id === section)?.label}
            </h1>
          </div>
          <div className="cc-topbar-right">
            <div className="cc-status-pill">
              <span className="dot dot-green dot-pulse" />
              <span>{activeCount} agents active</span>
            </div>
          </div>
        </header>

        <div className="cc-body">
          {section === 'overview' && (
            <Overview
              agents={agentList}
              approvals={approvals}
              logs={liveLogs}
              totalTasks={totalTasks}
              activeCount={activeCount}
              onSection={setSection}
            />
          )}
          {section === 'agents' && <AgentsView agents={agentList} />}
          {section === 'approvals' && (
            <ApprovalsView approvals={approvals} onApprove={approve} onReject={reject} />
          )}
          {section === 'logs' && <LogsView logs={liveLogs} />}
          {section === 'tasks' && <TasksView />}
          {section === 'billing' && <BillingView />}
        </div>
      </main>
    </div>
  )
}

function Overview({ agents, approvals, logs, totalTasks, activeCount, onSection }) {
  return (
    <div className="cc-overview">
      {/* KPIs */}
      <div className="cc-kpi-row">
        <div className="card cc-kpi">
          <p className="cc-kpi-label">Agents online</p>
          <p className="cc-kpi-val">{activeCount}<span>/{agents.length}</span></p>
          <span className="badge badge-green">Healthy</span>
        </div>
        <div className="card cc-kpi">
          <p className="cc-kpi-label">Tasks today</p>
          <p className="cc-kpi-val">{totalTasks}</p>
          <span className="cc-kpi-trend">↑ 12% vs yesterday</span>
        </div>
        <div className="card cc-kpi">
          <p className="cc-kpi-label">Pending approvals</p>
          <p className="cc-kpi-val cc-kpi-amber">{approvals.length}</p>
          {approvals.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => onSection('approvals')}>
              Review →
            </button>
          )}
        </div>
        <div className="card cc-kpi">
          <p className="cc-kpi-label">Spend today</p>
          <p className="cc-kpi-val">$0.00</p>
          <span className="cc-kpi-trend">Budget: $500/day</span>
        </div>
      </div>

      {/* Two-col: agents + log */}
      <div className="cc-overview-cols">
        <div className="card cc-panel">
          <div className="cc-panel-head">
            <span>Agent roster</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onSection('agents')}>View all</button>
          </div>
          <div className="cc-agent-list">
            {agents.slice(0, 5).map(a => (
              <AgentRow key={a.id} agent={a} />
            ))}
          </div>
        </div>

        <div className="card cc-panel">
          <div className="cc-panel-head">
            <span>Live log</span>
            <span className="badge badge-green"><span className="dot dot-green dot-pulse" style={{width:6,height:6}} /> Live</span>
          </div>
          <div className="cc-log-list">
            {logs.map(l => (
              <LogRow key={l.id} log={l} />
            ))}
          </div>
        </div>
      </div>

      {/* Approvals strip */}
      {approvals.length > 0 && (
        <div className="card cc-approvals-strip">
          <div className="cc-panel-head">
            <span>Pending approvals</span>
            <span className="badge badge-amber">{approvals.length} waiting</span>
          </div>
          {approvals.map(a => (
            <ApprovalRow key={a.id} approval={a} compact />
          ))}
        </div>
      )}
    </div>
  )
}

function AgentRow({ agent }) {
  const statusClass = { active: 'green', idle: 'amber', paused: 'red' }[agent.status] || 'amber'
  return (
    <div className="cc-agent-row">
      <span className={`dot dot-${statusClass}`} />
      <div className="cc-agent-info">
        <span className="cc-agent-name">{agent.name}</span>
        <span className="cc-agent-meta">{agent.model || agent.role}</span>
      </div>
      <span className="cc-agent-tasks">{agent.tasks_today} tasks</span>
    </div>
  )
}

function LogRow({ log }) {
  const cls = { success: 'green', warning: 'amber', error: 'red' }[log.type] || 'text'
  return (
    <div className="cc-log-row">
      <span className="cc-log-ts mono">{log.ts}</span>
      <span className={`cc-log-agent cc-log-${cls}`}>{log.agent}</span>
      <span className="cc-log-msg">{log.msg}</span>
    </div>
  )
}

function ApprovalRow({ approval, compact, onApprove, onReject }) {
  const riskClass = { high: 'red', medium: 'amber', low: 'green' }[approval.risk] || 'purple'
  return (
    <div className="cc-approval-row">
      <div className="cc-approval-info">
        <span className="cc-approval-agent">{approval.agent}</span>
        <p className="cc-approval-action">{approval.action}</p>
        <div className="cc-approval-meta">
          <span className={`badge badge-${riskClass}`}>{approval.risk} risk</span>
          <span className="cc-approval-time">{approval.created}</span>
        </div>
      </div>
      {!compact && (
        <div className="cc-approval-btns">
          <button className="btn btn-primary btn-sm" onClick={onApprove}><RiCheckLine size={14} /> Approve</button>
          <button className="btn btn-danger btn-sm" onClick={onReject}><RiCloseLine size={14} /> Reject</button>
        </div>
      )}
    </div>
  )
}

function AgentsView({ agents }) {
  return (
    <div className="cc-agents-view">
      <div className="cc-agents-grid">
        {agents.map(a => {
          const statusClass = { active: 'green', idle: 'amber', paused: 'red' }[a.status] || 'amber'
          return (
            <div key={a.id} className="card cc-agent-card">
              <div className="cc-agent-card-top">
                <span className={`dot dot-${statusClass}`} />
                <span className={`badge badge-${statusClass}`}>{a.status}</span>
              </div>
              <h3>{a.name}</h3>
              <p className="cc-agent-card-role">{a.role}</p>
              <div className="cc-agent-card-stats">
                <div>
                  <p className="cc-stat-label">Tasks today</p>
                  <p className="cc-stat-val">{a.tasks_today || 0}</p>
                </div>
                <div>
                  <p className="cc-stat-label">Model</p>
                  <p className="cc-stat-val mono" style={{fontSize:11}}>{a.model || '—'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ApprovalsView({ approvals, onApprove, onReject }) {
  if (!approvals.length) {
    return (
      <div className="cc-empty">
        <RiShieldCheckLine className="cc-empty-icon" size={40} />
        <p>No pending approvals</p>
        <span>All agents are operating within policy</span>
      </div>
    )
  }
  return (
    <div className="cc-approvals-list">
      {approvals.map(a => (
        <div key={a.id} className="card">
          <ApprovalRow
            approval={a}
            onApprove={() => onApprove(a.id)}
            onReject={() => onReject(a.id)}
          />
        </div>
      ))}
    </div>
  )
}

function LogsView({ logs }) {
  return (
    <div className="card cc-logs-full">
      <div className="cc-panel-head">
        <span>Activity log</span>
        <span className="badge badge-green"><span className="dot dot-green dot-pulse" style={{width:6,height:6}} /> Live</span>
      </div>
      <div className="cc-log-list cc-log-list-full">
        {logs.map(l => <LogRow key={l.id} log={l} />)}
      </div>
    </div>
  )
}

function TasksView() {
  return (
    <div className="cc-empty">
      <RiFlowChart className="cc-empty-icon" size={40} />
      <p>Task graph</p>
      <span>DAG visualization coming soon</span>
    </div>
  )
}

function BillingView() {
  return (
    <div className="cc-empty">
      <RiWalletLine className="cc-empty-icon" size={40} />
      <p>Billing dashboard</p>
      <span>Cost attribution and usage metrics</span>
    </div>
  )
}
