import { useState, useEffect } from 'react'
import {
  RiWalletLine, RiBarChartLine, RiPieChartLine, RiTrophyLine,
  RiArrowUpLine, RiEditLine,
} from 'react-icons/ri'
import { finance } from '../../api/finance'
import './Finance.css'

const TABS = [
  { id: 'overview',     label: 'Overview',    Icon: RiWalletLine },
  { id: 'budgets',      label: 'Budgets',     Icon: RiBarChartLine },
  { id: 'attribution',  label: 'Attribution', Icon: RiPieChartLine },
  { id: 'roi',          label: 'ROI',         Icon: RiTrophyLine },
]

export default function Finance() {
  const [tab, setTab] = useState('overview')

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Finance</h1>
          <p>Spend, budgets, and ROI across all agents and workflows</p>
        </div>
      </div>

      <div className="fin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`fin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.Icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview'    && <Overview />}
      {tab === 'budgets'     && <Budgets />}
      {tab === 'attribution' && <Attribution />}
      {tab === 'roi'         && <ROI />}
    </div>
  )
}

function Overview() {
  const [usage, setUsage] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([finance.usage(), finance.budgets()])
      .then(([u, b]) => { setUsage(u); setBudgets(b) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const todaySpend = usage.reduce((s, u) => s + parseFloat(u.cost || 0), 0)
  const mtdSpend = todaySpend
  const totalTokens = usage.reduce((s, u) => s + (u.tokens_input || 0) + (u.tokens_output || 0), 0)

  const byAgent = usage.reduce((acc, u) => {
    const id = u.agent?.name || String(u.agent).slice(0, 8)
    acc[id] = (acc[id] || 0) + parseFloat(u.cost || 0)
    return acc
  }, {})

  const topSpenders = Object.entries(byAgent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div>
      <div className="fin-kpis">
        <div className="card fin-kpi">
          <span className="fin-kpi-label">Today's spend</span>
          <span className="fin-kpi-val">${todaySpend.toFixed(2)}</span>
          <span className="fin-kpi-sub">UTC day</span>
        </div>
        <div className="card fin-kpi">
          <span className="fin-kpi-label">MTD spend</span>
          <span className="fin-kpi-val">${mtdSpend.toFixed(2)}</span>
          <span className="fin-kpi-sub">{loading ? '—' : `${usage.length} records`}</span>
        </div>
        <div className="card fin-kpi">
          <span className="fin-kpi-label">Total tokens</span>
          <span className="fin-kpi-val">{totalTokens.toLocaleString()}</span>
          <span className="fin-kpi-sub">input + output</span>
        </div>
        <div className="card fin-kpi">
          <span className="fin-kpi-label">Active budgets</span>
          <span className="fin-kpi-val">{budgets.filter(b => b.is_active).length}</span>
          <span className="fin-kpi-sub">of {budgets.length} total</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-2)' }}>Top spenders</div>
          {loading ? (
            <FinEmpty icon={<RiBarChartLine size={24} />} text="Loading usage data…" />
          ) : topSpenders.length === 0 ? (
            <FinEmpty icon={<RiBarChartLine size={24} />} text="No spend yet. Run agents to see cost attribution." />
          ) : (
            topSpenders.map(([name, cost]) => (
              <div key={name} className="fin-budget-row">
                <div className="fin-budget-head">
                  <span className="fin-budget-name">{name}</span>
                  <span className="fin-budget-vals">${cost.toFixed(4)}</span>
                </div>
                <div className="fin-bar-track">
                  <div
                    className="fin-bar-fill"
                    style={{
                      width: `${(cost / (topSpenders[0]?.[1] || 1)) * 100}%`,
                      background: 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-2)' }}>Budget status</div>
          {loading ? (
            <FinEmpty icon={<RiWalletLine size={24} />} text="Loading budgets…" />
          ) : budgets.length === 0 ? (
            <FinEmpty icon={<RiWalletLine size={24} />} text="No budgets configured. Set limits per agent or department." />
          ) : (
            budgets.map(b => {
              const pct = b.monthly_limit > 0 ? (b.current_month_spend / b.monthly_limit) * 100 : 0
              const alertPct = b.alert_threshold_percentage || 80
              const color = pct >= 100 ? 'var(--red)' : pct >= alertPct ? 'var(--amber)' : 'var(--green)'
              return (
                <div key={b.id} className="fin-budget-row">
                  <div className="fin-budget-head">
                    <span className="fin-budget-name">{b.agent?.name || `Budget ${String(b.id).slice(0, 6)}`}</span>
                    <span className="fin-budget-vals">${parseFloat(b.current_month_spend || 0).toFixed(2)} / ${parseFloat(b.monthly_limit || 0).toFixed(2)}</span>
                  </div>
                  <div className="fin-bar-track">
                    <div className="fin-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    finance.budgets()
      .then(setBudgets)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <FinEmpty icon={<RiBarChartLine size={28} />} text="Loading…" />

  return (
    <div className="card" style={{ padding: 0 }}>
      {budgets.length === 0 ? (
        <div style={{ padding: 20 }}>
          <FinEmpty icon={<RiBarChartLine size={28} />} text="No budgets set. Create budgets for agents or departments to enforce spending limits." />
        </div>
      ) : (
        <table className="fin-table">
          <thead>
            <tr>
              <th>Agent / Dept</th>
              <th>Monthly limit</th>
              <th>Current spend</th>
              <th>Alert at</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(b => {
              const pct = b.monthly_limit > 0 ? (b.current_month_spend / b.monthly_limit) * 100 : 0
              const alertPct = b.alert_threshold_percentage || 80
              const color = pct >= 100 ? 'var(--red)' : pct >= alertPct ? 'var(--amber)' : 'var(--green)'
              return (
                <tr key={b.id}>
                  <td><span className="fin-name">{b.agent?.name || String(b.id).slice(0, 8)}</span></td>
                  <td><span className="fin-mono">${parseFloat(b.monthly_limit || 0).toFixed(2)}</span></td>
                  <td><span className="fin-mono">${parseFloat(b.current_month_spend || 0).toFixed(2)}</span></td>
                  <td><span className="fin-mono">{alertPct}%</span></td>
                  <td>
                    <span className={`badge badge-${pct >= 100 ? 'red' : pct >= alertPct ? 'amber' : 'green'}`}>
                      {pct.toFixed(0)}% used
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Attribution() {
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState('agent')

  useEffect(() => {
    finance.usage()
      .then(setUsage)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const byGroup = usage.reduce((acc, u) => {
    const key = group === 'agent'
      ? (u.agent?.name || String(u.agent).slice(0, 8))
      : (u.department?.name || 'Unassigned')
    if (!acc[key]) acc[key] = { cost: 0, tokens: 0, records: 0 }
    acc[key].cost += parseFloat(u.cost || 0)
    acc[key].tokens += (u.tokens_input || 0) + (u.tokens_output || 0)
    acc[key].records++
    return acc
  }, {})

  const rows = Object.entries(byGroup).sort((a, b) => b[1].cost - a[1].cost)
  const maxCost = rows[0]?.[1]?.cost || 1

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['agent', 'department'].map(g => (
          <button
            key={g}
            className={`btn btn-sm ${group === g ? '' : 'btn-ghost'}`}
            style={group === g ? { background: 'var(--accent)', color: '#fff', border: 'none' } : {}}
            onClick={() => setGroup(g)}
          >
            By {g}
          </button>
        ))}
      </div>

      {loading ? (
        <FinEmpty icon={<RiPieChartLine size={28} />} text="Loading…" />
      ) : rows.length === 0 ? (
        <FinEmpty icon={<RiPieChartLine size={28} />} text="No usage records yet. Cost attribution appears here as agents run." />
      ) : (
        <div className="card">
          {rows.map(([key, val]) => (
            <div key={key} className="fin-budget-row">
              <div className="fin-budget-head">
                <span className="fin-budget-name">{key}</span>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span className="fin-budget-vals">{val.tokens.toLocaleString()} tokens</span>
                  <span className="fin-budget-vals" style={{ color: 'var(--text-h)', fontWeight: 700 }}>${val.cost.toFixed(4)}</span>
                </div>
              </div>
              <div className="fin-bar-track">
                <div className="fin-bar-fill" style={{ width: `${(val.cost / maxCost) * 100}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ROI() {
  const [assumptions, setAssumptions] = useState({
    tasksAutomated: 847,
    avgMinPerTask: 12,
    hourlyRate: 60,
    emailsSent: 220,
    workflowsCompleted: 3,
    tokenCost: 34.72,
    aosPlanCost: 49,
  })
  const [editing, setEditing] = useState(false)

  const laborSaved = (assumptions.tasksAutomated * assumptions.avgMinPerTask / 60) * assumptions.hourlyRate
  const totalCost = assumptions.tokenCost + assumptions.aosPlanCost
  const netROI = ((laborSaved - totalCost) / totalCost) * 100

  return (
    <div>
      <div className="fin-roi-grid">
        <div className="card fin-roi-card">
          <span className="fin-roi-section">What it cost</span>
          <span className="fin-roi-val">${totalCost.toFixed(2)}</span>
          <span className="fin-roi-desc">
            ${assumptions.tokenCost.toFixed(2)} in LLM tokens
            + ${assumptions.aosPlanCost}/mo AOS plan
          </span>
        </div>
        <div className="card fin-roi-card">
          <span className="fin-roi-section">What it did</span>
          <span className="fin-roi-val">{assumptions.tasksAutomated.toLocaleString()}</span>
          <span className="fin-roi-desc">
            tasks automated · {assumptions.emailsSent} emails sent · {assumptions.workflowsCompleted} workflows completed
          </span>
        </div>
        <div className="card fin-roi-card">
          <span className="fin-roi-section">Labor saved</span>
          <span className="fin-roi-val" style={{ color: 'var(--green)' }}>${laborSaved.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
          <span className="fin-roi-desc">
            {assumptions.tasksAutomated} tasks × {assumptions.avgMinPerTask}min × ${assumptions.hourlyRate}/hr
          </span>
        </div>
      </div>

      <div className="fin-roi-highlight">
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent)' }}>
          Net ROI
        </span>
        <span className="fin-roi-pct">
          {netROI > 0 ? '+' : ''}{netROI.toFixed(0).toLocaleString()}%
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
          For every $1 spent on AOS, you saved ${(laborSaved / totalCost).toFixed(0)} in labor costs.
        </span>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>Baseline assumptions</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e => !e)}>
            <RiEditLine size={13} /> {editing ? 'Done' : 'Edit'}
          </button>
        </div>
        {[
          { key: 'tasksAutomated', label: 'Tasks automated', unit: '' },
          { key: 'avgMinPerTask', label: 'Avg minutes per task', unit: 'min' },
          { key: 'hourlyRate', label: 'Hourly labor rate', unit: '$/hr' },
          { key: 'emailsSent', label: 'Emails sent', unit: '' },
          { key: 'tokenCost', label: 'Token cost this month', unit: '$' },
          { key: 'aosPlanCost', label: 'AOS plan cost', unit: '$/mo' },
        ].map(({ key, label, unit }) => (
          <div key={key} className="fin-assumption-row">
            <span className="fin-assumption-label">{label}</span>
            {editing ? (
              <input
                type="number"
                value={assumptions[key]}
                onChange={e => setAssumptions(a => ({ ...a, [key]: parseFloat(e.target.value) || 0 }))}
                style={{
                  width: 100, background: 'var(--bg-3)', border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius)', padding: '4px 8px', color: 'var(--text-h)',
                  fontFamily: 'var(--mono)', fontSize: 12, outline: 'none', textAlign: 'right',
                }}
              />
            ) : (
              <span className="fin-assumption-val">{unit === '$' ? `$${assumptions[key]}` : `${assumptions[key]}${unit ? ' ' + unit : ''}`}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FinEmpty({ icon, text }) {
  return (
    <div className="fin-empty">
      <div className="fin-empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  )
}
