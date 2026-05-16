import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiBellLine, RiBellFill } from 'react-icons/ri'
import { notifications as notifAPI } from '../../api/notifications'
import './NotificationBell.css'

const POLL_INTERVAL = 30_000 // 30 seconds

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationBell() {
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  const fetchAll = useCallback(() => {
    notifAPI.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.results || [])
        setItems(arr.slice(0, 20))
        setUnreadCount(arr.filter(n => !n.is_read).length)
      })
      .catch(() => {})
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchAll()
    const timer = setInterval(fetchAll, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchAll])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function handleMarkAllRead() {
    notifAPI.markAllRead()
      .then(() => {
        setItems(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      })
      .catch(() => {})
  }

  function handleItemClick(notif) {
    if (!notif.is_read) {
      notifAPI.markRead(notif.id)
        .then(() => {
          setItems(prev =>
            prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        })
        .catch(() => {})
    }
    setOpen(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const hasUnread = unreadCount > 0

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <button
        className="nb-btn"
        aria-label="Notifications"
        onClick={() => setOpen(v => !v)}
      >
        {hasUnread ? <RiBellFill size={18} /> : <RiBellLine size={18} />}
        {hasUnread && (
          <span className="nb-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="nb-panel">
          <div className="nb-panel-header">
            <span className="nb-panel-title">
              Notifications{hasUnread ? ` (${unreadCount})` : ''}
            </span>
            <button
              className="nb-mark-all"
              onClick={handleMarkAllRead}
              disabled={!hasUnread}
            >
              Mark all read
            </button>
          </div>

          <div className="nb-list">
            {items.length === 0 ? (
              <div className="nb-empty">No notifications yet</div>
            ) : (
              items.map(notif => (
                <div
                  key={notif.id}
                  className={`nb-item${notif.is_read ? '' : ' nb-item--unread'}`}
                  onClick={() => handleItemClick(notif)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleItemClick(notif)}
                >
                  <span
                    className={`nb-item-dot${notif.is_read ? ' nb-item-dot--read' : ''}`}
                  />
                  <div className="nb-item-body">
                    <div className="nb-item-title">{notif.title}</div>
                    <div className="nb-item-text">{notif.body}</div>
                    <div className="nb-item-time">{timeAgo(notif.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
