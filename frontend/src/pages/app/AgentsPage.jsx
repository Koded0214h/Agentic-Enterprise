import { useState, useEffect } from 'react'
import { RiRobot2Line, RiRefreshLine } from 'react-icons/ri'
import { agents as agentsAPI } from '../../api/agents'

const STATUS_MAP = {
  RUNNING: { dot: 'green', badge: 'green'  },
  PAUSED:  { dot: 'amber', badge: 'amber'  },
  FAILED:  { dot: 'red',   badge: 'red'    },
  STOPPED: { dot: 'red',   badge: 'red'    },
  IDLE:    { dot: 'amber', badge: 'amber'  },
}

export default function AgentsPage() {
  const [data, setData] = useState({ count: 0, results: [] })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [envFilter, setEnvFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    agentsAPI.list()
      .then(d => {
        const results = Array.isArray(d) ? d : (d.results || [])
        const count = Array.isArray(d) ? d.length : (d.count || results.length)
        setData({ count, results })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const envs = ['all', ...new Set(data.results.map(a => a.environment).filter(Boolean))]
  const sources = ['all', ...new Set(data.results.map(a => a.source).filter(Boolean))]

  const filtered = data.results.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.agent_type?.toLowerCase().includes(search.toLowerCase())
    const matchEnv = envFilter === 'all' || a.environment === envFilter
    const matchSource = sourceFilter === 'all' || a.source === sourceFilter
    return matchSearch && matchEnv && matchSource
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Agents</h1>
          <p>{loading ? 'Loading…' : `${data.count} agents in your workforce`}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>
          <RiRefreshLine size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search agents…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text-h)', fontSize: 13, outline: 'none', fontFamily: 'var(--sans)' }}
        />
        <select
          value={envFilter}
          onChange={e => setEnvFilter(e.target.value)}
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text-h)', fontSize: 13, outline: 'none', fontFamily: 'var(--sans)', cursor: 'pointer' }}
        >
          {envs.map(e => <option key={e} value={e}>{e === 'all' ? 'All environments' : e}</option>)}
        </select>
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text-h)', fontSize: 13, outline: 'none', fontFamily: 'var(--sans)', cursor: 'pointer' }}
        >
          {sources.map(s => <option key={s} value={s}>{s === 'all' ? 'All sources' : s}</option>)}
        </select>
        {(search || envFilter !== 'all' || sourceFilter !== 'all') && (
          <span style={{ fontSize: 12, color: 'var(--text)', alignSelf: 'center' }}>
            {filtered.length} results
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text)' }}>
          <div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map(a => <AgentCard key={a.id} agent={a} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: 'var(--text)' }}>
              No agents match your filters
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AgentCard({ agent }) {
  const s = STATUS_MAP[agent.status] || { dot: 'amber', badge: 'amber' }
  const label = agent.status?.toLowerCase() || 'unknown'

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <RiRobot2Line size={17} />
        </div>
        <span className={`badge badge-${s.badge}`}>
          <span className={`dot dot-${s.dot}`} style={{ width: 6, height: 6 }} />
          {label}
        </span>
      </div>

      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)', marginBottom: 3 }}>{agent.name}</p>
        <p style={{ fontSize: 11, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{agent.agent_type}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', marginBottom: 3 }}>Source</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-h)' }}>{agent.source}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text)', marginBottom: 3 }}>Environment</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-h)' }}>{agent.environment}</p>
        </div>
      </div>
    </div>
  )
}
