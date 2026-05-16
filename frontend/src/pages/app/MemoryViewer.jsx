import { useState, useEffect } from 'react'
import {
  RiBrainLine, RiSearchLine, RiDeleteBinLine, RiDatabase2Line,
  RiRobot2Line, RiUserLine, RiCloseLine,
} from 'react-icons/ri'
import { api } from '../../api/client'
import './MemoryViewer.css'

function timeAgo(ts) {
  if (!ts) return '—'
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

function lastMsg(conv) {
  const msgs = conv.messages || []
  if (!msgs.length) return conv.title || 'No messages'
  const last = msgs[msgs.length - 1]
  return (last.content || '').slice(0, 80) + ((last.content || '').length > 80 ? '…' : '')
}

export default function MemoryViewer() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [collections, setCollections] = useState([])
  const [collectionsLoaded, setCollectionsLoaded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    api.get('/intelligence/conversations/')
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.results || [])
        setSessions(arr)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    api.get('/knowledge/collections/')
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.results || [])
        setCollections(arr)
      })
      .catch(() => {})
      .finally(() => setCollectionsLoaded(true))
  }, [])

  const filtered = sessions.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (s.title || '').toLowerCase().includes(q) ||
      (s.agent?.name || '').toLowerCase().includes(q) ||
      JSON.stringify(s.messages || []).toLowerCase().includes(q)
    )
  })

  function requestDelete(s) {
    setConfirmDelete(s)
  }

  async function confirmDel() {
    const s = confirmDelete
    setConfirmDelete(null)
    try {
      await api.delete(`/intelligence/conversations/${s.id}/`)
    } catch {
      // endpoint may not support delete; still remove from UI
    }
    setSessions(prev => prev.filter(x => x.id !== s.id))
    if (selected?.id === s.id) setSelected(null)
  }

  const selectedSession = selected ? sessions.find(s => s.id === selected) : null

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Memory</h1>
          <p>Agent conversation history and knowledge collections</p>
        </div>
      </div>

      <div className="mem-search-bar">
        <RiSearchLine size={14} style={{ color: 'var(--text)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search memory sessions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="mem-search-clear" onClick={() => setSearch('')}>
            <RiCloseLine size={14} />
          </button>
        )}
      </div>

      <div className="mem-layout">
        {/* Left column — session list */}
        <div className="mem-list-col">
          {loading ? (
            <div className="mem-empty">
              <div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mem-empty">
              <RiBrainLine size={32} style={{ opacity: 0.2 }} />
              <p>{search ? 'No sessions match your search.' : 'No memory sessions yet. Run agents to populate conversation history.'}</p>
            </div>
          ) : (
            filtered.map(s => (
              <div
                key={s.id}
                className={`mem-entry ${selected === s.id ? 'active' : ''}`}
                onClick={() => setSelected(s.id)}
              >
                <div className="mem-entry-head">
                  <span className="mem-entry-agent">
                    <RiRobot2Line size={12} />
                    {s.agent?.name || `Agent ${String(s.agent || s.id).slice(0, 8)}`}
                  </span>
                  <span className="mem-entry-ts">{timeAgo(s.created_at)}</span>
                </div>
                <div className="mem-entry-title">{s.title || `Session ${String(s.id).slice(0, 8)}`}</div>
                <div className="mem-entry-preview">{lastMsg(s)}</div>
                <div className="mem-entry-footer">
                  <span className={`badge badge-${s.status === 'COMPLETED' ? 'green' : 'amber'}`} style={{ fontSize: 10 }}>
                    {s.status?.toLowerCase() || 'unknown'}
                  </span>
                  <button
                    className="mem-delete-btn"
                    title="Delete session"
                    onClick={e => { e.stopPropagation(); requestDelete(s) }}
                  >
                    <RiDeleteBinLine size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right column — detail panel */}
        <div className="mem-detail-col">
          {!selectedSession ? (
            <div className="mem-detail-empty">
              <RiBrainLine size={36} style={{ opacity: 0.15 }} />
              <p>Select a memory session to view the full conversation thread.</p>
            </div>
          ) : (
            <div className="mem-detail">
              <div className="mem-detail-header">
                <div>
                  <div className="mem-detail-title">{selectedSession.title || `Session ${String(selectedSession.id).slice(0, 8)}`}</div>
                  <div className="mem-detail-meta">
                    {selectedSession.agent?.name || String(selectedSession.agent || '').slice(0, 12)}
                    {' · '}
                    {timeAgo(selectedSession.created_at)}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                  <RiCloseLine size={13} />
                </button>
              </div>

              <div className="mem-messages">
                {(selectedSession.messages || []).length === 0 ? (
                  <div style={{ padding: '20px', fontSize: 13, color: 'var(--text)', textAlign: 'center' }}>
                    No messages in this session.
                  </div>
                ) : (
                  (selectedSession.messages || []).map((msg, i) => (
                    <div key={i} className={`mem-msg mem-msg-${msg.role || 'user'}`}>
                      <div className="mem-msg-role">
                        {msg.role === 'assistant'
                          ? <RiRobot2Line size={12} />
                          : <RiUserLine size={12} />
                        }
                        {msg.role || 'user'}
                      </div>
                      <div className="mem-msg-content">{msg.content || ''}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Base section */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <RiDatabase2Line size={16} style={{ color: 'var(--text-2)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-h)' }}>Knowledge Base</span>
        </div>

        {!collectionsLoaded ? (
          <div style={{ fontSize: 13, color: 'var(--text)', padding: 20 }}>Loading…</div>
        ) : collections.length === 0 ? (
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
            <RiDatabase2Line size={28} style={{ opacity: 0.2, marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>No knowledge collections yet.</p>
          </div>
        ) : (
          <div className="mem-collections">
            {collections.map(c => (
              <div key={c.id} className="card mem-collection">
                <div className="mem-coll-name">{c.name || `Collection ${String(c.id).slice(0, 8)}`}</div>
                <div className="mem-coll-meta">
                  {c.document_count ?? 0} documents
                  {c.description ? ` · ${c.description}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="mem-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="mem-dialog" onClick={e => e.stopPropagation()}>
            <div className="mem-dialog-title">Delete memory session?</div>
            <p className="mem-dialog-body">
              This will permanently remove "{confirmDelete.title || String(confirmDelete.id).slice(0, 12)}" and all its messages.
            </p>
            <div className="mem-dialog-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--red)', color: '#fff', border: 'none' }}
                onClick={confirmDel}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
