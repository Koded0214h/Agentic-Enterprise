import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  RiDashboardLine, RiRobot2Line, RiFlowChart, RiShieldCheckLine,
  RiWalletLine, RiShutDownLine, RiBellLine,
  RiLayoutGridLine, RiEyeLine, RiSettings3Line, RiShieldLine,
  RiTeamLine,
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { agents as agentsAPI } from '../../api/agents'
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
        { to: '/app/blueprints', label: 'Blueprints', Icon: RiLayoutGridLine },
        { to: '/app/agents', label: 'Agents', Icon: RiRobot2Line },
        { to: '/app/workflows', label: 'Workflows', Icon: RiFlowChart },
      ],
    },
    {
      section: 'Operate',
      items: [
        { to: '/app/approvals', label: 'Approvals', Icon: RiShieldCheckLine, badge: pendingCount },
        { to: '/app/observe', label: 'Observe', Icon: RiEyeLine },
        { to: '/app/finance', label: 'Finance', Icon: RiWalletLine },
      ],
    },
    {
      section: 'Configure',
      items: [
        { to: '/app/policies', label: 'Policies', Icon: RiShieldLine },
        { to: '/app/iam', label: 'IAM', Icon: RiTeamLine },
        { to: '/app/settings', label: 'Settings', Icon: RiSettings3Line },
      ],
    },
  ]
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const { user, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    Promise.all([agentsAPI.pendingActions(), agentsAPI.list()])
      .then(([ap, ag]) => {
        const pending = Array.isArray(ap) ? ap : (ap?.results || [])
        setPendingCount(pending.length)
        const arr = Array.isArray(ag) ? ag : (ag?.results || [])
        setActiveCount(arr.filter(a => a.status === 'RUNNING').length)
      })
      .catch(() => {})
  }, [location.pathname])

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
              <span>{activeCount} agent{activeCount !== 1 ? 's' : ''} active</span>
            </div>
            <Link to="/app/approvals" className="shell-bell" aria-label="Approvals">
              <RiBellLine size={18} />
              {pendingCount > 0 && <span className="shell-bell-badge">{pendingCount}</span>}
            </Link>
          </div>
        </header>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>
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
