import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiSave3Line,
  RiArchiveLine,
  RiDeleteBin6Line,
  RiAlertLine,
  RiTeamLine,
} from 'react-icons/ri'
import { projects as projectsAPI } from '../../api/projects'
import './Projects.css'
import './ProjectSettings.css'

const STAGES     = ['IDEA', 'MVP', 'LAUNCH', 'GROWTH', 'SCALE']
const MODES      = ['standard', 'conservative', 'aggressive', 'autonomous']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'JPY']
const ROLES      = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']

export default function ProjectSettings() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project,  setProject]  = useState(null)
  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [loadErr,  setLoadErr]  = useState('')

  // Section states: { saving, msg }
  const [gs, setGs] = useState({ saving: false, msg: '' })
  const [bs, setBs] = useState({ saving: false, msg: '' })
  const [ds, setDs] = useState({ saving: false, msg: '' })

  // Form values
  const [general, setGeneral] = useState({
    name: '', description: '', vision: '', target_market: '', stage: 'IDEA', operating_mode: 'standard',
  })
  const [budget, setBudget] = useState({ monthly_budget: '1000.00', currency: 'USD' })

  // Danger zone
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleteInput,  setDeleteInput]  = useState('')
  const [deleting,     setDeleting]     = useState(false)
  const [archiving,    setArchiving]    = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    setLoadErr('')
    try {
      const data = await projectsAPI.overview(id)
      const p = data.project
      setProject(p)
      setMembers(data.members || [])
      setGeneral({
        name:           p.name           || '',
        description:    p.description    || '',
        vision:         p.vision         || '',
        target_market:  p.target_market  || '',
        stage:          p.stage          || 'IDEA',
        operating_mode: p.operating_mode || 'standard',
      })
      setBudget({ monthly_budget: p.monthly_budget || '0.00', currency: p.currency || 'USD' })
    } catch (err) {
      setLoadErr(err?.data?.detail || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  async function saveGeneral(e) {
    e.preventDefault()
    setGs({ saving: true, msg: '' })
    try {
      const updated = await projectsAPI.update(id, general)
      setProject(p => ({ ...p, ...updated }))
      setGs({ saving: false, msg: 'Saved' })
      setTimeout(() => setGs(s => ({ ...s, msg: '' })), 2500)
    } catch (err) {
      setGs({ saving: false, msg: err?.data?.detail || 'Save failed' })
    }
  }

  async function saveBudget(e) {
    e.preventDefault()
    setBs({ saving: true, msg: '' })
    try {
      const updated = await projectsAPI.update(id, budget)
      setProject(p => ({ ...p, ...updated }))
      setBs({ saving: false, msg: 'Saved' })
      setTimeout(() => setBs(s => ({ ...s, msg: '' })), 2500)
    } catch (err) {
      setBs({ saving: false, msg: err?.data?.detail || 'Save failed' })
    }
  }

  async function archiveProject() {
    setArchiving(true)
    setDs(s => ({ ...s, msg: '' }))
    try {
      await projectsAPI.archive(id)
      navigate('/app/projects')
    } catch (err) {
      setDs({ saving: false, msg: err?.data?.detail || 'Archive failed' })
      setArchiving(false)
    }
  }

  async function deleteProject() {
    if (deleteInput !== project?.name) return
    setDeleting(true)
    try {
      await projectsAPI.delete(id)
      navigate('/app/projects', { replace: true })
    } catch (err) {
      setDs({ saving: false, msg: err?.data?.detail || 'Delete failed' })
      setDeleting(false)
    }
  }

  if (loading) return <div className="projects-page"><div className="card projects-empty-state">Loading…</div></div>
  if (loadErr || !project) return (
    <div className="projects-page">
      <Link className="projects-back-link" to={`/app/projects/${id}`}><RiArrowLeftLine size={15} /> Project</Link>
      <div className="projects-error">{loadErr || 'Project not found'}</div>
    </div>
  )

  const isArchived = project.status === 'ARCHIVED'

  return (
    <div className="projects-page ps-page">
      <div className="projects-detail-top">
        <Link className="projects-back-link" to={`/app/projects/${id}`}>
          <RiArrowLeftLine size={15} /> {project.name}
        </Link>
      </div>

      <div className="ps-header card">
        <div>
          <h1 className="ps-title">Project settings</h1>
          <p className="ps-sub">Manage configuration, budget, members, and lifecycle for <strong>{project.name}</strong>.</p>
        </div>
        <span className={`badge badge-${isArchived ? 'amber' : 'green'}`}>{project.status}</span>
      </div>

      {/* General */}
      <section className="card projects-panel">
        <div className="projects-panel-head">
          <span>General</span>
        </div>
        <form onSubmit={saveGeneral} className="ps-form">
          <div className="ps-fields">
            <Field label="Project name *" value={general.name} onChange={v => setGeneral(s => ({ ...s, name: v }))} required />
            <Field label="Target market"  value={general.target_market} onChange={v => setGeneral(s => ({ ...s, target_market: v }))} />
            <Field label="Description"    value={general.description}   onChange={v => setGeneral(s => ({ ...s, description: v }))}   multiline />
            <Field label="Vision"         value={general.vision}        onChange={v => setGeneral(s => ({ ...s, vision: v }))}        multiline />
          </div>
          <div className="ps-row-2">
            <div className="ps-select-field">
              <label>Stage</label>
              <select className="ps-select" value={general.stage} onChange={e => setGeneral(s => ({ ...s, stage: e.target.value }))}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="ps-select-field">
              <label>Operating mode</label>
              <select className="ps-select" value={general.operating_mode} onChange={e => setGeneral(s => ({ ...s, operating_mode: e.target.value }))}>
                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="ps-footer">
            {gs.msg && <span className={`ps-msg ${gs.msg === 'Saved' ? 'ps-msg-ok' : 'ps-msg-err'}`}>{gs.msg}</span>}
            <button type="submit" className="btn btn-primary" disabled={gs.saving}>
              <RiSave3Line size={14} /> {gs.saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Budget */}
      <section className="card projects-panel">
        <div className="projects-panel-head">
          <span>Budget</span>
        </div>
        <form onSubmit={saveBudget} className="ps-form">
          <div className="ps-row-2">
            <div className="ps-select-field">
              <label>Currency</label>
              <select className="ps-select" value={budget.currency} onChange={e => setBudget(s => ({ ...s, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="projects-field">
              <span>Monthly budget</span>
              <div className="projects-input-prefix-wrap">
                <span className="projects-input-prefix">$</span>
                <input
                  className="projects-input projects-input-prefixed"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget.monthly_budget}
                  onChange={e => setBudget(s => ({ ...s, monthly_budget: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="ps-footer">
            {bs.msg && <span className={`ps-msg ${bs.msg === 'Saved' ? 'ps-msg-ok' : 'ps-msg-err'}`}>{bs.msg}</span>}
            <button type="submit" className="btn btn-primary" disabled={bs.saving}>
              <RiSave3Line size={14} /> {bs.saving ? 'Saving…' : 'Save budget'}
            </button>
          </div>
        </form>
      </section>

      {/* Members */}
      <section className="card projects-panel">
        <div className="projects-panel-head">
          <span>Members</span>
          <span className="badge badge-amber">{members.length}</span>
        </div>
        {members.length === 0 ? (
          <div className="projects-empty">No members yet.</div>
        ) : (
          <div className="ps-members">
            {members.map(m => (
              <div key={m.id} className="ps-member-row">
                <div className="ps-member-avatar">
                  {(m.user_name || m.user_email || 'U')[0].toUpperCase()}
                </div>
                <div className="ps-member-info">
                  <span className="ps-member-name">{m.user_name || m.user_email}</span>
                  <span className="ps-member-email">{m.user_email}</span>
                </div>
                <span className={`badge badge-${m.role === 'OWNER' ? 'green' : m.role === 'ADMIN' ? 'amber' : 'amber'}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="ps-members-note">
          <RiTeamLine size={13} />
          To invite new members, use the <Link to="/app/iam" className="ps-inline-link">IAM page</Link>.
        </div>
      </section>

      {/* Danger zone */}
      <section className="card projects-panel ps-danger-zone">
        <div className="projects-panel-head">
          <span className="ps-danger-title"><RiAlertLine size={15} /> Danger zone</span>
        </div>

        {ds.msg && <div className="projects-error" style={{ marginBottom: 16 }}>{ds.msg}</div>}

        {/* Archive */}
        <div className="ps-danger-row">
          <div>
            <p className="ps-danger-row-title">Archive project</p>
            <p className="ps-danger-row-sub">
              {isArchived
                ? 'This project is already archived.'
                : 'Pauses all activity. You can unarchive later.'}
            </p>
          </div>
          <button
            className="btn ps-btn-archive"
            type="button"
            onClick={archiveProject}
            disabled={archiving || isArchived}
          >
            <RiArchiveLine size={14} />
            {archiving ? 'Archiving…' : isArchived ? 'Archived' : 'Archive'}
          </button>
        </div>

        <div className="ps-danger-divider" />

        {/* Delete */}
        <div className="ps-danger-row">
          <div>
            <p className="ps-danger-row-title">Delete project</p>
            <p className="ps-danger-row-sub">
              Permanently deletes this project and all its data. This cannot be undone.
            </p>
          </div>
          {!showDelete && (
            <button className="btn ps-btn-delete" type="button" onClick={() => setShowDelete(true)}>
              <RiDeleteBin6Line size={14} /> Delete project
            </button>
          )}
        </div>

        {showDelete && (
          <div className="ps-delete-confirm">
            <p className="ps-delete-prompt">
              Type <strong>{project.name}</strong> to confirm:
            </p>
            <div className="ps-delete-row">
              <input
                className="projects-input ps-delete-input"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={project.name}
                autoFocus
              />
              <button
                className="btn ps-btn-delete"
                type="button"
                onClick={deleteProject}
                disabled={deleteInput !== project.name || deleting}
              >
                <RiDeleteBin6Line size={14} />
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => { setShowDelete(false); setDeleteInput('') }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Field({ label, value, onChange, multiline = false, required = false }) {
  return (
    <label className="projects-field">
      <span>{label}</span>
      {multiline
        ? <textarea className="projects-input" value={value} onChange={e => onChange(e.target.value)} rows={3} required={required} />
        : <input    className="projects-input" value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </label>
  )
}
