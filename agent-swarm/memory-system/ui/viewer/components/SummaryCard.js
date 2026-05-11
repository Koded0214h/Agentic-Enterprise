"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryCard = SummaryCard;
var react_1 = require("react");
var formatters_1 = require("../utils/formatters");
function SummaryCard(_a) {
    var summary = _a.summary;
    var date = (0, formatters_1.formatDate)(summary.created_at_epoch);
    var sections = [
        { key: "investigated", label: "Investigated", content: summary.investigated, icon: "/icon-thick-investigated.svg" },
        { key: "learned", label: "Learned", content: summary.learned, icon: "/icon-thick-learned.svg" },
        { key: "completed", label: "Completed", content: summary.completed, icon: "/icon-thick-completed.svg" },
        { key: "next_steps", label: "Next Steps", content: summary.next_steps, icon: "/icon-thick-next-steps.svg" },
    ].filter(function (section) { return section.content; });
    return (<article className="card summary-card">
      <header className="summary-card-header">
        <div className="summary-badge-row">
          <span className="card-type summary-badge">Session Summary</span>
          <span className="summary-project-badge">{summary.project}</span>
        </div>
        {summary.request && (<h2 className="summary-title">{summary.request}</h2>)}
      </header>

      <div className="summary-sections">
        {sections.map(function (section, index) { return (<section key={section.key} className="summary-section" style={{ animationDelay: "".concat(index * 50, "ms") }}>
            <div className="summary-section-header">
              <img src={section.icon} alt={section.label} className={"summary-section-icon summary-section-icon--".concat(section.key)}/>
              <h3 className="summary-section-label">{section.label}</h3>
            </div>
            <div className="summary-section-content">
              {section.content}
            </div>
          </section>); })}
      </div>

      <footer className="summary-card-footer">
        <span className="summary-meta-id">Session #{summary.id}</span>
        <span className="summary-meta-divider">•</span>
        <time className="summary-meta-date" dateTime={new Date(summary.created_at_epoch).toISOString()}>
          {date}
        </time>
      </footer>
    </article>);
}
