import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiAddLine,
  RiCloseLine,
  RiRefreshLine,
  RiSearchLine,
  RiBriefcaseLine,
  RiFlashlightLine,
  RiCloseLine,
} from "react-icons/ri";
import { projects as projectsAPI } from "../../api/projects";
import "./Projects.css";

const EMPTY_PROJECT = {
  name: "",
  slug: "",
  description: "",
  vision: "",
  target_market: "",
  stage: "IDEA",
  status: "ACTIVE",
  operating_mode: "standard",
  monthly_budget: "1000.00",
  currency: "USD",
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Projects() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("ACTIVE");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [slugEdited, setSlugEdited] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const data = await projectsAPI.list();
      const rows = Array.isArray(data) ? data : data.results || [];
      setItems(rows);
    } catch (err) {
      setError(err?.data?.detail || err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setForm(EMPTY_PROJECT);
    setSlugEdited(false);
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
  }

  async function createProject(e) {
    e.preventDefault();
    const name = form.name.trim();
    const slug = slugify(form.slug || name);
    if (!name) {
      setFormError("Project name is required");
      return;
    }
    if (!slug) {
      setFormError("Project slug is required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const created = await projectsAPI.create({ ...form, name, slug });
      const project = created?.id ? created : created?.project || created;
      closeModal();
      await loadProjects();
      if (project?.id) navigate(`/app/projects/${project.id}`);
    } catch (err) {
      setFormError(
        err?.data?.detail || err.message || "Failed to create project",
      );
    } finally {
      setSaving(false);
    }
  }

  const activeCount = items.filter((p) => p.status === "ACTIVE").length;
  const archivedCount = items.filter((p) => p.status === "ARCHIVED").length;

  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      const matchesFilter = filter === "ALL" || p.status === filter;
      const haystack =
        `${p.name} ${p.slug} ${p.description || ""} ${p.stage}`.toLowerCase();
      return matchesFilter && haystack.includes(query.trim().toLowerCase());
    });
  }, [items, filter, query]);

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Projects</h1>
          <p>
            Each project is a startup workspace — it holds your goals, agents,
            budget, and all operating work.
          </p>
        </div>
        <div className="projects-header-actions">
          <button
            className="btn btn-ghost"
            onClick={loadProjects}
            disabled={loading}
          >
            <RiRefreshLine size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openModal}>
            <RiAddLine size={15} /> New project
          </button>
        </div>
      </div>

      {error && <div className="projects-error">{error}</div>}

      {loading ? (
        <div className="card projects-table-card">
          <div className="projects-table-empty">Loading projects…</div>
        </div>
      ) : items.length === 0 ? (
        <div className="projects-empty-page">
          <div className="projects-empty-page-icon">
            <RiBriefcaseLine size={32} />
          </div>
          <h2>No projects yet</h2>
          <p>
            A project is your operating boundary — give it a name, a budget, and
            let AOS run it like a startup.
          </p>
          <button className="btn btn-primary btn-lg" onClick={openModal}>
            <RiFlashlightLine size={16} /> Create your first project
          </button>
        </div>
      ) : (
        <section className="projects-section">
          <div className="projects-toolbar">
            <div className="projects-filters">
              <button
                className={filter === "ACTIVE" ? "active" : ""}
                onClick={() => setFilter("ACTIVE")}
              >
                Active ({activeCount})
              </button>
              <button
                className={filter === "ARCHIVED" ? "active" : ""}
                onClick={() => setFilter("ARCHIVED")}
              >
                Archived ({archivedCount})
              </button>
              <button
                className={filter === "ALL" ? "active" : ""}
                onClick={() => setFilter("ALL")}
              >
                All ({items.length})
              </button>
            </div>
            <label className="projects-search">
              <RiSearchLine size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects"
              />
            </label>
          </div>

          <div className="card projects-table-card">
            <div className="projects-table projects-table-head">
              <span>Project</span>
              <span>Status</span>
              <span>Stage</span>
              <span>Budget</span>
              <span>Updated</span>
              <span />
            </div>
            {filteredItems.length ? (
              filteredItems.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="projects-table projects-table-row"
                  onClick={() => navigate(`/app/projects/${p.id}`)}
                >
                  <span className="projects-table-name">
                    <strong>{p.name}</strong>
                    <small>{p.slug}</small>
                  </span>
                  <span>
                    <span
                      className={`badge badge-${p.status === "ACTIVE" ? "green" : "amber"}`}
                    >
                      {p.status}
                    </span>
                  </span>
                  <span>{p.stage}</span>
                  <span>
                    {p.currency} {p.monthly_budget}
                  </span>
                  <span>
                    {p.updated_at
                      ? new Date(p.updated_at).toLocaleDateString()
                      : "—"}
                  </span>
                  <span className="projects-table-action">›</span>
                </button>
              ))
            ) : (
              <div className="projects-table-empty">
                No projects match this filter.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Create project modal */}
      {showModal && (
        <div
          className="proj-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="proj-modal card">
            <div className="proj-modal-header">
              <span className="proj-modal-title">New project</span>
              <button
                className="btn btn-ghost proj-modal-close"
                onClick={closeModal}
                type="button"
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            {formError && <div className="projects-error">{formError}</div>}

            <form onSubmit={createProject} className="proj-modal-form">
              <div className="projects-fields">
                <Field
                  label="Name *"
                  value={form.name}
                  required
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      name: v,
                      slug: slugEdited ? p.slug : slugify(v),
                    }))
                  }
                />
                <Field
                  label="Slug *"
                  value={form.slug}
                  required
                  onChange={(v) => {
                    setSlugEdited(true);
                    setForm((p) => ({ ...p, slug: slugify(v) }));
                  }}
                />
                <Field
                  label="Target market"
                  value={form.target_market}
                  onChange={(v) => setForm((p) => ({ ...p, target_market: v }))}
                />
                <Field
                  label="Monthly budget"
                  value={form.monthly_budget}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, monthly_budget: v }))
                  }
                  prefix="$"
                />
                <Field
                  label="Vision"
                  value={form.vision}
                  onChange={(v) => setForm((p) => ({ ...p, vision: v }))}
                  multiline
                />
                <Field
                  label="Description"
                  value={form.description}
                  onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                  multiline
                />
              </div>

              <div className="proj-modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <RiAddLine size={15} />
                  {saving ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
  prefix,
}) {
  return (
    <label className="projects-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          className="projects-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          required={required}
        />
      ) : prefix ? (
        <div className="projects-input-prefix-wrap">
          <span className="projects-input-prefix">{prefix}</span>
          <input
            className="projects-input projects-input-prefixed"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
        </div>
      ) : (
        <input
          className="projects-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </label>
  );
}
