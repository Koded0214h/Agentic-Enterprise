import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RiAddLine,
  RiRefreshLine,
  RiSearchLine,
} from 'react-icons/ri'
import { projects as projectsAPI } from '../../api/projects'
import './Projects.css'

const EMPTY_PROJECT = {
  name: '',
  slug: '',
  description: '',
  vision: '',
  target_market: '',
  stage: 'IDEA',
  status: 'ACTIVE',
  operating_mode: 'standard',
  monthly_budget: '1000.00',
  currency: 'USD',
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function Projects() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('ACTIVE')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const data = await projectsAPI.list()
      const rows = Array.isArray(data) ? data : (data.results || [])
      setItems(rows)
      if (!rows.length) setShowCreate(true)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function createProject(e) {
    e.preventDefault()
    const name = form.name.trim()
    const slug = slugify(form.slug || name)
    if (!name) {
      setError('Project name is required')
      return
    }
    if (!slug) {
      setError('Project slug is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const created = await projectsAPI.create({ ...form, name, slug })
      const project = created?.id ? created : created?.project || created
      setForm(EMPTY_PROJECT)
      setSlugEdited(false)
      setShowCreate(false)
      await loadProjects()
      if (project?.id) navigate(`/app/projects/${project.id}`)
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const activeCount = items.filter((p) => p.status === 'ACTIVE').length
  const archivedCount = items.filter((p) => p.status === 'ARCHIVED').length
  const filteredItems = useMemo(() => {
    return items.filter((project) => {
      const matchesFilter = filter === 'ALL' || project.status === filter
      const haystack = `${project.name} ${project.slug} ${project.description || ''} ${project.stage}`.toLowerCase()
      return matchesFilter && haystack.includes(query.trim().toLowerCase())
    })
  }, [items, filter, query])

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Overview</h1>
          <p>Projects are startup workspaces for cost, agents, goals, operations, and execution state.</p>
        </div>
        <div className="projects-header-actions">
          <button className="btn btn-ghost" onClick={loadProjects} disabled={loading || saving}>
            <RiRefreshLine size={15} />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="projects-error">{error}</div>}

      <section className="projects-section">
        <div className="projects-section-head">
          <h2>Projects</h2>
        </div>

        <div className="projects-onboarding">
          <div className="projects-onboarding-copy">
            <span className="projects-onboarding-icon">⌘</span>
            <div>
              <h3>{items.length ? 'Get organized with Projects' : 'Create your first project'}</h3>
              <p>An easier way to organize resources, agents, goals, and operating work around one startup.</p>
              <div className="projects-onboarding-actions">
                <button className="btn btn-primary" onClick={() => setShowCreate(true)} disabled={saving}>
                  <RiAddLine size={15} />
                  {items.length ? 'Create project' : 'Create your first project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showCreate && (
        <form className="card projects-panel projects-form" onSubmit={createProject}>
          <div className="projects-panel-head">
            <span>Create project</span>
            <span className="badge badge-green">Startup boundary</span>
          </div>
          <div className="projects-fields">
            <Field
              label="Name"
              value={form.name}
              required
              onChange={(v) => setForm((p) => ({
                ...p,
                name: v,
                slug: slugEdited ? p.slug : slugify(v),
              }))}
            />
            <Field
              label="Slug"
              value={form.slug}
              required
              onChange={(v) => {
                setSlugEdited(true)
                setForm((p) => ({ ...p, slug: slugify(v) }))
              }}
            />
            <Field label="Target market" value={form.target_market} onChange={(v) => setForm((p) => ({ ...p, target_market: v }))} />
            <Field label="Stage" value={form.stage} onChange={(v) => setForm((p) => ({ ...p, stage: v }))} />
            <Field label="Budget" value={form.monthly_budget} onChange={(v) => setForm((p) => ({ ...p, monthly_budget: v }))} />
            <Field label="Operating mode" value={form.operating_mode} onChange={(v) => setForm((p) => ({ ...p, operating_mode: v }))} />
            <Field label="Vision" value={form.vision} onChange={(v) => setForm((p) => ({ ...p, vision: v }))} multiline />
            <Field label="Description" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} multiline />
          </div>
          <button className="btn btn-primary" disabled={saving || loading}>
            <RiAddLine size={15} />
            Create project
          </button>
        </form>
      )}

      <section className="projects-section">
        <div className="projects-section-head">
          <h2>Your projects</h2>
        </div>

        <div className="projects-toolbar">
          <div className="projects-filters">
            <button className={filter === 'ACTIVE' ? 'active' : ''} onClick={() => setFilter('ACTIVE')}>Active ({activeCount})</button>
            <button className={filter === 'ARCHIVED' ? 'active' : ''} onClick={() => setFilter('ARCHIVED')}>Archived ({archivedCount})</button>
            <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>All ({items.length})</button>
          </div>
          <label className="projects-search">
            <RiSearchLine size={14} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" />
          </label>
        </div>

        <div className="card projects-table-card">
          <div className="projects-table projects-table-head">
            <span>Project name</span>
            <span>Status</span>
            <span>Stage</span>
            <span>Budget</span>
            <span>Updated</span>
            <span />
          </div>
          {loading ? (
            <div className="projects-table-empty">Loading projects...</div>
          ) : filteredItems.length ? (
            filteredItems.map((project) => (
              <button
                key={project.id}
                type="button"
                className="projects-table projects-table-row"
                onClick={() => navigate(`/app/projects/${project.id}`)}
              >
                <span className="projects-table-name">
                  <strong>{project.name}</strong>
                  <small>{project.slug}</small>
                </span>
                <span><span className={`badge badge-${project.status === 'ACTIVE' ? 'green' : 'amber'}`}>{project.status}</span></span>
                <span>{project.stage}</span>
                <span>{project.currency} {project.monthly_budget}</span>
                <span>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '—'}</span>
                <span className="projects-table-action">›</span>
              </button>
            ))
          ) : (
            <div className="projects-table-empty">
              {items.length ? 'No projects match this view.' : 'No projects yet. Create your first project to begin.'}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Field({ label, value, onChange, multiline = false, required = false }) {
  return (
    <label className="projects-field">
      <span>{label}</span>
      {multiline ? (
        <textarea className="projects-input" value={value} onChange={(e) => onChange(e.target.value)} rows={4} required={required} />
      ) : (
        <input className="projects-input" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </label>
  )
}
