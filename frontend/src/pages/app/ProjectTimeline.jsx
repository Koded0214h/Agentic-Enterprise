import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiRefreshLine,
  RiTimeLine,
  RiRobot2Line,
  RiStackLine,
  RiUserLine,
  RiShieldCheckLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiLoaderLine,
} from 'react-icons/ri'
import { projects as projectsAPI } from '../../api/projects'
import './ProjectTimeline.css'

const KIND_META = {
  activity:   { icon: <RiTimeLine size={14} />,         color: 'accent',  label: 'Activity' },
  queue:      { icon: <RiStackLine size={14} />,        color: 'amber',   label: 'Queue' },
  touchpoint: { icon: <RiUserLine size={14} />,         color: 'green',   label: 'Touchpoint' },
  approval:   { icon: <RiShieldCheckLine size={14} />,  color: 'red',     label: 'Approval' },
  run:        { icon: <RiRobot2Line size={14} />,       color: 'blue',    label: 'Run' },
}

const FILTER_OPTIONS = ['all', 'activity', 'queue', 'touchpoint', 'approval', 'run']

const STATUS_ICON = {
  COMPLETED: <RiCheckboxCircleLine size={12} style={{ color: 'var(--green)' }} />,
  completed: <RiCheckboxCircleLine size={12} style={{ color: 'var(--green)' }} />,
  FAILED:    <RiErrorWarningLine   size={12} style={{ color: 'var(--red)' }} />,
  failed:    <RiErrorWarningLine   size={12} style={{ color: 'var(--red)' }} />,
  PENDING:   <RiLoaderLine         size={12} style={{ color: 'var(--amber)' }} />,
  pending:   <RiLoaderLine         size={12} style={{ color: 'var(--amber)' }} />,
}

function groupByDate(events) {
  const groups = {}
  for (const e of events) {
    const day = e.ts.slice(0, 10)
    if (!groups[day]) groups[day] = []
    groups[day].push(e)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function fmtTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectTimeline() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await projectsAPI.timeline(id)
      setData(res)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const events = (data?.events || []).filter(e => filter === 'all' || e.kind === filter)
  const grouped = groupByDate(events)

  return (
    <div className="ptl-page">
      <div className="ptl-header">
        <Link className="ptl-back" to={`/app/projects/${id}`}>
          <RiArrowLeftLine size={14} /> Project
        </Link>
        <div className="ptl-header-right">
          <div className="ptl-filters">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                className={`ptl-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : KIND_META[f]?.label || f}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={load} disabled={loading}>
            <RiRefreshLine size={14} />
          </button>
        </div>
      </div>

      <div className="ptl-hero card">
        <div className="ptl-hero-icon"><RiTimeLine size={20} /></div>
        <div>
          <h2>Project Timeline</h2>
          <p>{data?.total ?? '—'} events across all workstreams</p>
        </div>
        <div className="ptl-counters">
          {Object.entries(KIND_META).map(([kind, meta]) => {
            const count = (data?.events || []).filter(e => e.kind === kind).length
            return (
              <div key={kind} className="ptl-counter" data-color={meta.color}>
                <span>{meta.icon}</span>
                <span>{count}</span>
                <span className="ptl-counter-label">{meta.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {error && <div className="ptl-error">{error}</div>}

      {loading ? (
        <div className="ptl-loading card">Loading timeline…</div>
      ) : events.length === 0 ? (
        <div className="card ptl-empty">
          <RiTimeLine size={32} style={{ color: 'var(--text-2)' }} />
          <p>No events yet. Run a workflow, sync a lead, or launch a campaign to see activity here.</p>
        </div>
      ) : (
        <div className="ptl-feed">
          {grouped.map(([day, dayEvents]) => (
            <div key={day} className="ptl-day-group">
              <div className="ptl-day-header">{fmtDate(day)}</div>
              {dayEvents.map(event => {
                const meta = KIND_META[event.kind] || { icon: <RiTimeLine size={14} />, color: 'accent', label: event.kind }
                const statusIcon = STATUS_ICON[event.meta?.status] || STATUS_ICON[event.subkind]
                return (
                  <div key={`${event.kind}-${event.id}-${event.ts}`} className="ptl-event card" data-kind={event.kind}>
                    <div className="ptl-event-icon" data-color={meta.color}>{meta.icon}</div>
                    <div className="ptl-event-body">
                      <div className="ptl-event-row">
                        <span className="ptl-event-summary">{event.summary}</span>
                        {statusIcon && <span className="ptl-event-status">{statusIcon}</span>}
                      </div>
                      <div className="ptl-event-meta">
                        <span className={`badge badge-${meta.color === 'accent' ? 'green' : meta.color === 'red' ? 'red' : meta.color === 'amber' ? 'amber' : 'green'}`}>
                          {event.subkind}
                        </span>
                        <span className="ptl-event-actor">{event.actor}</span>
                        {event.meta?.account && <span className="ptl-event-account">{event.meta.account}</span>}
                        {event.meta?.error && <span className="ptl-event-error">{event.meta.error}</span>}
                      </div>
                    </div>
                    <div className="ptl-event-time">{fmtTime(event.ts)}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
