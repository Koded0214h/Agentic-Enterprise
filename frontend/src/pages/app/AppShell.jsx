import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  RiDashboardLine, RiRobot2Line, RiFlowChart, RiShieldCheckLine,
  RiWalletLine, RiShutDownLine, RiBellLine, RiRocketLine,
  RiLayoutGridLine, RiEyeLine, RiSettings3Line, RiShieldLine, RiBriefcaseLine,
  RiTeamLine, RiBrainLine, RiArrowRightLine,
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { agents as agentsAPI } from '../../api/agents'
import SwarmRunDrawer from '../../components/SwarmRunDrawer'
import NotificationBell from './NotificationBell'
import './AppShell.css'

function buildNav(pendingCount) {
  return [
    {
      items: [
        { to: '/app', label: 'Overview', Icon: RiDashboardLine, end: true },
      ],
    },
    {
      section: 'Build',
      items: [
        { to: '/app/projects',   label: 'Projects',   Icon: RiBriefcaseLine },
        { to: '/app/blueprints',  label: 'Blueprints',  Icon: RiLayoutGridLine },
        { to: '/app/agents',      label: 'Agents',      Icon: RiRobot2Line },
        { to: '/app/workflows',   label: 'Workflows',   Icon: RiFlowChart },
        { to: '/app/templates',   label: 'Templates',   Icon: RiLayoutGridLine },
      ],
    },
    {
      section: 'Operate',
      items: [
        { to: '/app/approvals', label: 'Approvals', Icon: RiShieldCheckLine, badge: pendingCount },
        { to: '/app/observe',   label: 'Observe',   Icon: RiEyeLine },
        { to: '/app/ops',       label: 'Ops',       Icon: RiBriefcaseLine },
        { to: '/app/finance',   label: 'Finance',   Icon: RiWalletLine },
      ],
    },
    {
      section: 'Configure',
      items: [
        { to: '/app/memory',   label: 'Memory',   Icon: RiBrainLine },
        { to: '/app/policies', label: 'Policies', Icon: RiShieldLine },
        { to: '/app/iam',      label: 'IAM',      Icon: RiTeamLine },
        { to: '/app/settings', label: 'Settings', Icon: RiSettings3Line },
      ],
    },
  ]
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [activeCount, setActiveCount] = useState(0)
  const [swarmOpen, setSwarmOpen] = useState(false)
  const [swarmInitialGoal, setSwarmInitialGoal] = useState('')
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Non-runnable templates navigate to /app/swarm?prompt=... — intercept and open the drawer
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const prompt = params.get('prompt')
    if (prompt && location.pathname === '/app/swarm') {
      setSwarmInitialGoal(decodeURIComponent(prompt))
      setSwarmOpen(true)
      navigate('/app', { replace: true })
    }
  }, [location.search, location.pathname, navigate])

  useEffect(() => {
    Promise.all([agentsAPI.pendingActions(), agentsAPI.list()])
      .then(([ap, ag]) => {
        const pending = Array.isArray(ap) ? ap : (ap?.results || [])
        setPendingApprovals(pending.slice(0, 5))
        setPendingCount(pending.length)
        const arr = Array.isArray(ag) ? ag : (ag?.results || [])
        setActiveCount(arr.filter(a => a.status === 'RUNNING').length)
      })
      .catch(() => {})
  }, [location.pathname])

  // Close bell dropdown on outside click
  useEffect(() => {
    if (!bellOpen) return
    function handle(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [bellOpen])

  const NAV = buildNav(pendingCount)

  return (
    <div className="shell-layout">
      <aside className={`shell-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="shell-sidebar-top">
          <Link to="/app" className="shell-logo">{collapsed ? 'A' : 'AOS'}</Link>
          <button className="shell-collapse" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="shell-nav">
          {NAV.map((group, gi) => (
            <div key={gi} className="shell-nav-group">
              {group.section && !collapsed && (
                <span className="shell-nav-section">{group.section}</span>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `shell-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="shell-nav-icon"><item.Icon size={17} /></span>
                  {!collapsed && <span className="shell-nav-label">{item.label}</span>}
                  {!collapsed && item.badge > 0 && (
                    <span className="shell-nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="shell-sidebar-footer">
          {!collapsed && (
            <div className="shell-user">
              <div className="shell-avatar">
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="shell-user-info">
                <span className="shell-user-name">{user?.first_name || user?.email}</span>
                <span className="shell-user-role">Admin</span>
              </div>
            </div>
          )}
          <button className="shell-logout" onClick={logout} title="Sign out">
            <RiShutDownLine size={16} />
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <div className="shell-topbar-left">
            <Breadcrumb path={location.pathname} />
          </div>
          <div className="shell-topbar-right">
            <div className="shell-status-pill">
              <span className="dot dot-green dot-pulse" />
              <span>{activeCount} agent{activeCount !== 1 ? 's' : ''} ready</span>
            </div>
            <NotificationBell />
            <div className="shell-bell-wrap" ref={bellRef}>
              <button
                className="shell-bell"
                aria-label="Notifications"
                onClick={() => setBellOpen(v => !v)}
              >
                <RiBellLine size={18} />
                {pendingCount > 0 && <span className="shell-bell-badge">{pendingCount}</span>}
              </button>

              {bellOpen && (
                <div className="shell-notif-panel">
                  <div className="shell-notif-header">
                    <span>Pending approvals</span>
                    {pendingCount > 0 && (
                      <span className="badge badge-amber" style={{ fontSize: 10 }}>{pendingCount}</span>
                    )}
                  </div>
                  {pendingApprovals.length === 0 ? (
                    <div className="shell-notif-empty">No pending approvals</div>
                  ) : (
                    pendingApprovals.map(a => (
                      <Link
                        key={a.id}
                        to={`/app/approvals/${a.id}`}
                        className="shell-notif-item"
                        onClick={() => setBellOpen(false)}
                      >
                        <div className="shell-notif-item-name">{a.agent || a.agent_name || 'Agent'}</div>
                        <div className="shell-notif-item-action">{a.action || a.description || 'Needs approval'}</div>
                        <span className={`badge badge-${{ high: 'red', medium: 'amber', low: 'green' }[a.risk] || 'amber'}`} style={{ fontSize: 10 }}>
                          {a.risk || 'medium'} risk
                        </span>
                      </Link>
                    ))
                  )}
                  <Link
                    to="/app/approvals"
                    className="shell-notif-view-all"
                    onClick={() => setBellOpen(false)}
                  >
                    View all approvals <RiArrowRightLine size={12} />
                  </Link>
                </div>
              )}
            </div>
            <button
              className="shell-run-swarm"
              onClick={() => setSwarmOpen(true)}
              aria-label="Run swarm"
              title="Run Swarm"
            >
              <RiRocketLine size={15} />
              <span>Run Swarm</span>
            </button>
          </div>
        </header>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>

      <SwarmRunDrawer
        open={swarmOpen}
        onClose={() => { setSwarmOpen(false); setSwarmInitialGoal('') }}
        initialGoal={swarmInitialGoal}
      />
    </div>
  )
}

function Breadcrumb({ path }) {
  const parts = path.replace('/app', '').split('/').filter(Boolean)
  if (!parts.length) return <span className="breadcrumb-root">Overview</span>
  return (
    <div className="breadcrumb">
      <Link to="/app" className="breadcrumb-link">Overview</Link>
      {parts.map((p, i) => {
        const to = '/app/' + parts.slice(0, i + 1).join('/')
        const label = p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        return (
          <span key={i} className="breadcrumb-item">
            <span className="breadcrumb-sep">/</span>
            {i === parts.length - 1
              ? <span className="breadcrumb-current">{label}</span>
              : <Link to={to} className="breadcrumb-link">{label}</Link>
            }
          </span>
        )
      })}
    </div>
  )
}
