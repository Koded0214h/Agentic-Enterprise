import { useEffect, useMemo, useState } from 'react'
import {
  RiAddLine,
  RiBarChart2Line,
  RiCalendarLine,
  RiMegaphoneLine,
  RiRefreshLine,
  RiSendPlaneLine,
} from 'react-icons/ri'
import { marketing } from '../../api/marketing'
import { projects as projectsAPI } from '../../api/projects'
import './Marketing.css'

const INITIAL_CAMPAIGN = {
  name: '',
  objective: '',
  audience: '',
  channels: 'instagram, linkedin',
  budget: '0.00',
  currency: 'USD',
}

const INITIAL_POST = {
  campaign: '',
  title: '',
  platform: 'instagram',
  caption: '',
  media_urls: '',
  scheduled_at: '',
}

const SAMPLE_ANALYTICS = {
  impressions: 1600,
  reach: 1250,
  clicks: 72,
  likes: 118,
  comments: 12,
  shares: 18,
  saves: 9,
  conversions: 4,
  spend: '0.00',
}

export default function Marketing() {
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [overview, setOverview] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [calendar, setCalendar] = useState([])
  const [activeTab, setActiveTab] = useState('calendar')
  const [campaignForm, setCampaignForm] = useState(INITIAL_CAMPAIGN)
  const [postForm, setPostForm] = useState(INITIAL_POST)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) reload(selectedProjectId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId])

  async function loadProjects() {
    setLoading(true)
    setError('')
    try {
      const projectData = await projectsAPI.list()
      const rows = Array.isArray(projectData) ? projectData : (projectData.results || [])
      setProjects(rows)
      setSelectedProjectId((current) => current || rows[0]?.id || '')
      if (!rows.length) {
        setOverview(null)
        setCampaigns([])
        setCalendar([])
      }
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function reload(projectId = selectedProjectId) {
    if (!projectId) return
    setLoading(true)
    setError('')
    try {
      const [summary, campaignData, calendarData] = await Promise.all([
        marketing.overview({ project_id: projectId }),
        marketing.campaigns.list({ project_id: projectId }),
        marketing.calendar.list({ project_id: projectId }),
      ])
      const campaignRows = Array.isArray(campaignData) ? campaignData : (campaignData.results || [])
      const calendarRows = Array.isArray(calendarData) ? calendarData : (calendarData.results || [])
      setOverview(summary)
      setCampaigns(campaignRows)
      setCalendar(calendarRows)
      setPostForm((form) => ({ ...form, campaign: form.campaign || campaignRows[0]?.id || '' }))
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Failed to load marketing data')
    } finally {
      setLoading(false)
    }
  }

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null
  const counts = overview?.counts || {}
  const performance = overview?.performance || {}
  const connectorMode = overview?.connectors?.mode || 'dry_run'
  const activeCampaign = campaigns.find((campaign) => campaign.id === postForm.campaign) || campaigns[0] || null
  const suggestions = activeCampaign?.next_action_suggestions || []

  const failedPosts = useMemo(
    () => calendar.filter((item) => item.status === 'FAILED'),
    [calendar]
  )

  async function submitCampaign(e) {
    e.preventDefault()
    if (!selectedProjectId) return setError('Select a project before creating a campaign')
    setBusy(true)
    setError('')
    try {
      const created = await marketing.campaigns.create({
        ...campaignForm,
        project: selectedProjectId,
        channels: campaignForm.channels.split(',').map((channel) => channel.trim()).filter(Boolean),
      })
      setCampaignForm(INITIAL_CAMPAIGN)
      setPostForm((form) => ({ ...form, campaign: created.id }))
      setActiveTab('calendar')
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to create campaign')
    } finally {
      setBusy(false)
    }
  }

  async function submitPost(e) {
    e.preventDefault()
    if (!postForm.campaign) return setError('Create or select a campaign before adding content')
    setBusy(true)
    setError('')
    try {
      await marketing.calendar.create({
        ...postForm,
        media_urls: postForm.media_urls.split('\n').map((url) => url.trim()).filter(Boolean),
        scheduled_at: postForm.scheduled_at ? new Date(postForm.scheduled_at).toISOString() : null,
      })
      setPostForm({ ...INITIAL_POST, campaign: postForm.campaign })
      setActiveTab('calendar')
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to add calendar item')
    } finally {
      setBusy(false)
    }
  }

  async function publishCampaign(id) {
    setBusy(true)
    setError('')
    try {
      await marketing.campaigns.publish(id)
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to queue campaign publishing')
    } finally {
      setBusy(false)
    }
  }

  async function ingestAnalytics(id) {
    setBusy(true)
    setError('')
    try {
      await marketing.campaigns.ingestAnalytics(id, SAMPLE_ANALYTICS)
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to ingest analytics')
    } finally {
      setBusy(false)
    }
  }

  async function retryPost(id) {
    setBusy(true)
    setError('')
    try {
      await marketing.calendar.retry(id)
      await reload()
    } catch (err) {
      setError(err?.data?.detail || err.message || 'Unable to retry post')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="marketing-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Marketing</h1>
          <p>Project campaigns, content calendar, publishing, analytics, and feedback actions</p>
        </div>
        <div className="marketing-header-actions">
          <label className="marketing-project-select">
            <span>Project</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={loading || busy || !projects.length}
            >
              {projects.length ? projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              )) : (
                <option value="">No projects</option>
              )}
            </select>
          </label>
          <button className="btn btn-ghost" onClick={() => reload()} disabled={loading || busy || !selectedProjectId}>
            <RiRefreshLine size={15} />
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="marketing-error">{error}</div>}

      <section className="card marketing-project-context">
        <div>
          <span className="marketing-context-label">Selected project</span>
          <strong>{selectedProject?.name || 'No project selected'}</strong>
          <p>{selectedProject?.description || selectedProject?.vision || 'Create a project first to run marketing loops inside a real operating boundary.'}</p>
        </div>
        <span className={`badge badge-${connectorMode === 'live' ? 'green' : 'amber'}`}>
          Upload-Post {connectorMode}
        </span>
      </section>

      <section className="marketing-kpis">
        <Kpi icon={<RiMegaphoneLine size={18} />} label="Campaigns" value={counts.campaigns ?? '—'} sub={`${counts.live_campaigns ?? 0} live or measuring`} />
        <Kpi icon={<RiCalendarLine size={18} />} label="Scheduled" value={counts.scheduled_posts ?? '—'} sub={`${counts.failed_posts ?? 0} failed posts`} badge={counts.failed_posts ? 'red' : 'green'} />
        <Kpi icon={<RiBarChart2Line size={18} />} label="Impressions" value={performance.impressions ?? '—'} sub={`${performance.clicks ?? 0} clicks`} />
        <Kpi icon={<RiSendPlaneLine size={18} />} label="Conversions" value={performance.conversions ?? '—'} sub="Tracked from ingested metrics" />
      </section>

      <div className="marketing-tabs" role="tablist" aria-label="Marketing sections">
        <Tab id="calendar" label="Calendar" active={activeTab} onClick={setActiveTab} />
        <Tab id="plan" label="Plan" active={activeTab} onClick={setActiveTab} />
        <Tab id="measure" label="Measure" active={activeTab} onClick={setActiveTab} />
      </div>

      {activeTab === 'calendar' && (
        <div className="marketing-grid">
          <div className="card marketing-panel">
            <div className="marketing-panel-head">
              <span>Content calendar</span>
              <span className="badge badge-green">{calendar.length} items</span>
            </div>
            <div className="marketing-list">
              {calendar.length ? calendar.map((item) => (
                <div key={item.id} className="marketing-row">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.platform} · {item.status}</span>
                    <p>{item.caption}</p>
                  </div>
                  <div className="marketing-row-actions">
                    {item.status === 'FAILED' && (
                      <button className="btn btn-ghost" onClick={() => retryPost(item.id)} disabled={busy}>Retry</button>
                    )}
                    <span className={`badge badge-${statusColor(item.status)}`}>{item.status}</span>
                  </div>
                </div>
              )) : (
                <div className="marketing-empty">No content calendar items yet.</div>
              )}
            </div>
          </div>

          <form className="card marketing-panel marketing-form" onSubmit={submitPost}>
            <div className="marketing-panel-head">
              <span>Add scheduled content</span>
              <RiAddLine size={16} />
            </div>
            <select value={postForm.campaign} onChange={(e) => setPostForm({ ...postForm, campaign: e.target.value })} required>
              <option value="">Select campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
            <input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder="Post title" required />
            <select value={postForm.platform} onChange={(e) => setPostForm({ ...postForm, platform: e.target.value })}>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">X/Twitter</option>
            </select>
            <textarea value={postForm.caption} onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })} placeholder="Caption" rows={4} />
            <textarea value={postForm.media_urls} onChange={(e) => setPostForm({ ...postForm, media_urls: e.target.value })} placeholder="Media URLs, one per line" rows={3} />
            <input type="datetime-local" value={postForm.scheduled_at} onChange={(e) => setPostForm({ ...postForm, scheduled_at: e.target.value })} />
            <button className="btn btn-primary" disabled={busy || !selectedProjectId}>
              <RiAddLine size={15} />
              Add to calendar
            </button>
          </form>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="marketing-grid">
          <form className="card marketing-panel marketing-form" onSubmit={submitCampaign}>
            <div className="marketing-panel-head">
              <span>Campaign plan</span>
              <RiMegaphoneLine size={16} />
            </div>
            <input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="Campaign name" required />
            <textarea value={campaignForm.objective} onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })} placeholder="Objective" rows={3} />
            <input value={campaignForm.audience} onChange={(e) => setCampaignForm({ ...campaignForm, audience: e.target.value })} placeholder="Audience" />
            <input value={campaignForm.channels} onChange={(e) => setCampaignForm({ ...campaignForm, channels: e.target.value })} placeholder="Channels" />
            <div className="marketing-inline-fields">
              <input value={campaignForm.budget} onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })} placeholder="Budget" />
              <input value={campaignForm.currency} onChange={(e) => setCampaignForm({ ...campaignForm, currency: e.target.value.toUpperCase() })} maxLength={3} />
            </div>
            <button className="btn btn-primary" disabled={busy || !selectedProjectId}>
              <RiAddLine size={15} />
              Create campaign
            </button>
          </form>

          <div className="card marketing-panel">
            <div className="marketing-panel-head">
              <span>Campaigns</span>
              <span className="badge badge-green">{campaigns.length}</span>
            </div>
            <div className="marketing-list">
              {campaigns.length ? campaigns.map((campaign) => (
                <div key={campaign.id} className="marketing-row">
                  <div>
                    <strong>{campaign.name}</strong>
                    <span>{campaign.status} · {(campaign.channels || []).join(', ') || 'no channels'}</span>
                    <p>{campaign.objective || 'No objective set.'}</p>
                  </div>
                  <button className="btn btn-ghost" onClick={() => publishCampaign(campaign.id)} disabled={busy}>
                    <RiSendPlaneLine size={14} />
                    Publish
                  </button>
                </div>
              )) : (
                <div className="marketing-empty">No campaigns planned yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'measure' && (
        <div className="marketing-grid">
          <div className="card marketing-panel">
            <div className="marketing-panel-head">
              <span>Performance feedback</span>
              {activeCampaign && (
                <button className="btn btn-ghost" onClick={() => ingestAnalytics(activeCampaign.id)} disabled={busy}>
                  Ingest sample
                </button>
              )}
            </div>
            {activeCampaign ? (
              <div className="marketing-feedback">
                <strong>{activeCampaign.name}</strong>
                <div className="marketing-metrics">
                  <Metric label="Impressions" value={activeCampaign.performance_summary?.impressions ?? 0} />
                  <Metric label="Clicks" value={activeCampaign.performance_summary?.clicks ?? 0} />
                  <Metric label="Conversions" value={activeCampaign.performance_summary?.conversions ?? 0} />
                  <Metric label="Engagement" value={activeCampaign.performance_summary?.engagement_rate ?? 0} />
                </div>
                <div className="marketing-suggestions">
                  {suggestions.length ? suggestions.map((suggestion, index) => (
                    <div key={index} className="marketing-suggestion">{suggestion}</div>
                  )) : (
                    <div className="marketing-empty">No measurement suggestions yet.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="marketing-empty">Create a campaign to measure feedback.</div>
            )}
          </div>

          <div className="card marketing-panel">
            <div className="marketing-panel-head">
              <span>Failed post recovery</span>
              <span className={`badge badge-${failedPosts.length ? 'red' : 'green'}`}>{failedPosts.length}</span>
            </div>
            <div className="marketing-list">
              {failedPosts.length ? failedPosts.map((item) => (
                <div key={item.id} className="marketing-row">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.error_message || 'Publishing failed'}</span>
                  </div>
                  <button className="btn btn-ghost" onClick={() => retryPost(item.id)} disabled={busy}>Retry</button>
                </div>
              )) : (
                <div className="marketing-empty">No failed posts need recovery.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ icon, label, value, sub, badge = 'green' }) {
  return (
    <div className="card marketing-kpi">
      <div className="marketing-kpi-icon">{icon}</div>
      <span className="marketing-kpi-label">{label}</span>
      <strong className="marketing-kpi-value">{value}</strong>
      <span className="marketing-kpi-sub">{sub}</span>
      {badge && <span className={`badge badge-${badge}`}>{badge}</span>}
    </div>
  )
}

function Tab({ id, label, active, onClick }) {
  return (
    <button className={`marketing-tab ${active === id ? 'active' : ''}`} onClick={() => onClick(id)} type="button">
      {label}
    </button>
  )
}

function Metric({ label, value }) {
  return (
    <div className="marketing-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function statusColor(status) {
  if (status === 'PUBLISHED' || status === 'LIVE' || status === 'MEASURING') return 'green'
  if (status === 'FAILED') return 'red'
  if (status === 'QUEUED' || status === 'PUBLISHING' || status === 'SCHEDULED') return 'amber'
  return 'green'
}
