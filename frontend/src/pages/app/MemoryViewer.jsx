import { useState, useEffect, useCallback } from 'react'
import {
  RiBrainLine, RiSearchLine, RiDeleteBinLine, RiDatabase2Line,
  RiRobot2Line, RiUserLine, RiCloseLine, RiPriceTag3Line,
  RiFileTextLine, RiTimeLine, RiAddLine, RiArrowDownSLine, RiArrowUpSLine,
} from 'react-icons/ri'
import { api } from '../../api/client'
import './MemoryViewer.css'

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

function timeAgo(ts) {
  if (!ts) return '—'
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function trunc(str, n) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

function lastMsg(conv) {
  const msgs = conv.messages || []
  if (!msgs.length) return conv.title || 'No messages'
  const last = msgs[msgs.length - 1]
  return (last.content || '').slice(0, 80) + ((last.content || '').length > 80 ? '…' : '')
}

/* ── Tags Tab ── */
function TagsTab() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const loadTags = useCallback(() => {
    setLoading(true)
    api.get('/knowledge/tags/')
      .then(data => setTags(Array.isArray(data) ? data : (data?.results || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadTags() }, [loadTags])

  async function createTag(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const tag = await api.post('/knowledge/tags/', { name: newName.trim(), color: newColor })
      setTags(prev => [...prev, tag])
      setNewName('')
    } catch (err) {
      setError(err?.data?.name?.[0] || err?.data?.detail || 'Failed to create tag')
    } finally {
      setCreating(false)
    }
  }

  async function deleteTag(id) {
    try {
      await api.delete(`/knowledge/tags/${id}/`)
      setTags(prev => prev.filter(t => t.id !== id))
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="mem-tab-content">
      {/* Create tag form */}
      <div className="mem-tag-form card">
        <div className="mem-tag-form-title">
          <RiAddLine size={14} />
          New Tag
        </div>
        <form onSubmit={createTag} className="mem-tag-form-row">
          <input
            type="text"
            placeholder="Tag name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            maxLength={100}
            className="mem-tag-input"
          />
          <div className="mem-tag-colors">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`mem-color-swatch ${newColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
                title={c}
              />
            ))}
          </div>
          <button
            type="submit"
            className="btn btn-sm"
            disabled={creating || !newName.trim()}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
        {error && <div className="mem-tag-error">{error}</div>}
      </div>

      {/* Tag list */}
      {loading ? (
        <div className="mem-empty">
          <div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div>
        </div>
      ) : tags.length === 0 ? (
        <div className="mem-empty">
          <RiPriceTag3Line size={32} style={{ opacity: 0.2 }} />
          <p>No tags yet. Create one above to organize your knowledge collections.</p>
        </div>
      ) : (
        <div className="mem-tag-list">
          {tags.map(tag => (
            <div key={tag.id} className="mem-tag-row card">
              <span className="mem-tag-dot" style={{ background: tag.color }} />
              <span className="mem-tag-name">{tag.name}</span>
              <span className="mem-tag-ts">{timeAgo(tag.created_at)}</span>
              <button
                className="mem-delete-btn"
                title="Delete tag"
                onClick={() => deleteTag(tag.id)}
              >
                <RiDeleteBinLine size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Retrieval Logs Tab ── */
function LogsTab() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filterCollection, setFilterCollection] = useState('')

  useEffect(() => {
    api.get('/knowledge/query-logs/')
      .then(data => setLogs(Array.isArray(data) ? data : (data?.results || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const collections = [...new Set(logs.map(l => l.collection_name).filter(Boolean))]

  const filtered = filterCollection
    ? logs.filter(l => l.collection_name === filterCollection)
    : logs

  function toggleExpand(id) {
    setExpanded(prev => (prev === id ? null : id))
  }

  return (
    <div className="mem-tab-content">
      {/* Filter bar */}
      {collections.length > 0 && (
        <div className="mem-logs-filter">
          <select
            value={filterCollection}
            onChange={e => setFilterCollection(e.target.value)}
            className="mem-logs-select"
          >
            <option value="">All collections</option>
            {collections.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="mem-empty">
          <div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mem-empty">
          <RiFileTextLine size={32} style={{ opacity: 0.2 }} />
          <p>No retrieval logs yet. Logs appear when agents query knowledge collections.</p>
        </div>
      ) : (
        <div className="mem-logs-table-wrap">
          <table className="mem-logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Agent</th>
                <th>Collection</th>
                <th>Query</th>
                <th>Tokens</th>
                <th>Retrieval</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <>
                  <tr
                    key={log.id}
                    className={`mem-log-row ${expanded === log.id ? 'expanded' : ''}`}
                    onClick={() => toggleExpand(log.id)}
                  >
                    <td className="mem-log-date">{fmtDate(log.created_at)}</td>
                    <td className="mem-log-agent">{log.agent_name || '—'}</td>
                    <td className="mem-log-coll">{log.collection_name || '—'}</td>
                    <td className="mem-log-query">{trunc(log.query, 60)}</td>
                    <td className="mem-log-num">{log.tokens_used ?? '—'}</td>
                    <td className="mem-log-num">{log.retrieval_time_ms != null ? `${log.retrieval_time_ms}ms` : '—'}</td>
                    <td className="mem-log-expand">
                      {expanded === log.id ? <RiArrowUpSLine size={14} /> : <RiArrowDownSLine size={14} />}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={`${log.id}-detail`} className="mem-log-detail-row">
                      <td colSpan={7}>
                        <div className="mem-log-detail">
                          <div className="mem-log-detail-section">
                            <div className="mem-log-detail-label">Full Query</div>
                            <div className="mem-log-detail-text">{log.query || '—'}</div>
                          </div>
                          {log.response && (
                            <div className="mem-log-detail-section">
                              <div className="mem-log-detail-label">Response</div>
                              <div className="mem-log-detail-text">{log.response}</div>
                            </div>
                          )}
                          {Array.isArray(log.retrieved_chunks) && log.retrieved_chunks.length > 0 && (
                            <div className="mem-log-detail-section">
                              <div className="mem-log-detail-label">
                                Retrieved Chunks ({log.retrieved_chunks.length})
                              </div>
                              {log.retrieved_chunks.map((chunk, i) => (
                                <div key={i} className="mem-log-chunk">
                                  <span className="mem-log-chunk-num">#{i + 1}</span>
                                  <span className="mem-log-detail-text">
                                    {typeof chunk === 'string' ? chunk : JSON.stringify(chunk)}
                                  </span>
                                  {log.relevance_scores?.[i] != null && (
                                    <span className="mem-log-score">
                                      {(log.relevance_scores[i] * 100).toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Collections Tab ── */
function CollectionsTab({ collections, collectionsLoaded }) {
  const [tagsMap, setTagsMap] = useState({})  // collectionId -> [tag]
  const [allTags, setAllTags] = useState([])
  const [addingTagTo, setAddingTagTo] = useState(null)
  const [selectedTagId, setSelectedTagId] = useState('')

  useEffect(() => {
    // Build tags map from collections data (tags are embedded in serializer)
    const map = {}
    collections.forEach(c => {
      map[c.id] = c.tags || []
    })
    setTagsMap(map)
    // Load all user tags for the add-tag dropdown
    api.get('/knowledge/tags/')
      .then(data => setAllTags(Array.isArray(data) ? data : (data?.results || [])))
      .catch(() => {})
  }, [collections])

  async function handleAddTag(collectionId) {
    if (!selectedTagId) return
    try {
      await api.post(`/knowledge/collections/${collectionId}/add_tag/`, { tag_id: selectedTagId })
      const tag = allTags.find(t => t.id === selectedTagId)
      if (tag) {
        setTagsMap(prev => ({
          ...prev,
          [collectionId]: [...(prev[collectionId] || []).filter(t => t.id !== tag.id), tag],
        }))
      }
      setAddingTagTo(null)
      setSelectedTagId('')
    } catch {
      // silently ignore
    }
  }

  async function handleRemoveTag(collectionId, tagId) {
    try {
      await api.post(`/knowledge/collections/${collectionId}/remove_tag/`, { tag_id: tagId })
      setTagsMap(prev => ({
        ...prev,
        [collectionId]: (prev[collectionId] || []).filter(t => t.id !== tagId),
      }))
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="mem-tab-content">
      {!collectionsLoaded ? (
        <div className="mem-empty">
          <div className="aos-loader" style={{ minHeight: 'unset' }}><span /></div>
        </div>
      ) : collections.length === 0 ? (
        <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <RiDatabase2Line size={28} style={{ opacity: 0.2, marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>No knowledge collections yet.</p>
        </div>
      ) : (
        <div className="mem-collections">
          {collections.map(c => {
            const cTags = tagsMap[c.id] || []
            const isAdding = addingTagTo === c.id
            return (
              <div key={c.id} className="card mem-collection">
                <div className="mem-coll-name">{c.name || `Collection ${String(c.id).slice(0, 8)}`}</div>
                <div className="mem-coll-meta">
                  {c.document_count ?? 0} documents
                  {c.description ? ` · ${c.description}` : ''}
                </div>

                {/* Tag chips */}
                <div className="mem-coll-tags">
                  {cTags.map(tag => (
                    <span key={tag.id} className="mem-coll-tag-chip">
                      <span className="mem-tag-dot" style={{ background: tag.color, width: 8, height: 8 }} />
                      {tag.name}
                      <button
                        className="mem-chip-remove"
                        title="Remove tag"
                        onClick={() => handleRemoveTag(c.id, tag.id)}
                      >
                        <RiCloseLine size={10} />
                      </button>
                    </span>
                  ))}

                  {/* Add tag control */}
                  {isAdding ? (
                    <span className="mem-coll-tag-adder">
                      <select
                        value={selectedTagId}
                        onChange={e => setSelectedTagId(e.target.value)}
                        className="mem-tag-mini-select"
                        autoFocus
                      >
                        <option value="">Pick tag…</option>
                        {allTags
                          .filter(t => !cTags.some(ct => ct.id === t.id))
                          .map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                      </select>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                        onClick={() => handleAddTag(c.id)}
                        disabled={!selectedTagId}
                      >
                        Add
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', fontSize: 11 }}
                        onClick={() => { setAddingTagTo(null); setSelectedTagId('') }}
                      >
                        <RiCloseLine size={11} />
                      </button>
                    </span>
                  ) : (
                    <button
                      className="mem-add-tag-btn"
                      title="Add tag"
                      onClick={() => { setAddingTagTo(c.id); setSelectedTagId('') }}
                    >
                      <RiAddLine size={11} />
                      tag
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Sessions Tab ── */
function SessionsTab({ sessions, loading, search, setSearch, selected, setSelected, requestDelete }) {
  const filtered = sessions.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (s.title || '').toLowerCase().includes(q) ||
      (s.agent?.name || '').toLowerCase().includes(q) ||
      JSON.stringify(s.messages || []).toLowerCase().includes(q)
    )
  })

  const selectedSession = selected ? sessions.find(s => s.id === selected) : null

  return (
    <>
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
    </>
  )
}

/* ── Main MemoryViewer ── */
const TABS = [
  { id: 'sessions', label: 'Sessions', icon: RiBrainLine },
  { id: 'collections', label: 'Collections', icon: RiDatabase2Line },
  { id: 'tags', label: 'Tags', icon: RiPriceTag3Line },
  { id: 'logs', label: 'Retrieval Logs', icon: RiTimeLine },
]

export default function MemoryViewer() {
  const [activeTab, setActiveTab] = useState('sessions')
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

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Memory</h1>
          <p>Agent conversation history, knowledge collections, tags, and retrieval logs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mem-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`mem-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'sessions' && (
        <SessionsTab
          sessions={sessions}
          loading={loading}
          search={search}
          setSearch={setSearch}
          selected={selected}
          setSelected={setSelected}
          requestDelete={requestDelete}
        />
      )}
      {activeTab === 'collections' && (
        <CollectionsTab collections={collections} collectionsLoaded={collectionsLoaded} />
      )}
      {activeTab === 'tags' && <TagsTab />}
      {activeTab === 'logs' && <LogsTab />}

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
