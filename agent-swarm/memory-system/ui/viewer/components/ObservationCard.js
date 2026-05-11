"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservationCard = ObservationCard;
var react_1 = require("react");
var formatters_1 = require("../utils/formatters");
// Helper to strip project root from file paths
function stripProjectRoot(filePath) {
    // Try to extract relative path by finding common project markers
    var markers = ['/Scripts/', '/src/', '/plugin/', '/docs/'];
    for (var _i = 0, markers_1 = markers; _i < markers_1.length; _i++) {
        var marker = markers_1[_i];
        var index = filePath.indexOf(marker);
        if (index !== -1) {
            // Keep the marker and everything after it
            return filePath.substring(index + 1);
        }
    }
    // Fallback: if path contains project name, strip everything before it
    var projectIndex = filePath.indexOf('claude-mem/');
    if (projectIndex !== -1) {
        return filePath.substring(projectIndex + 'claude-mem/'.length);
    }
    // If no markers found, return basename or original path
    var parts = filePath.split('/');
    return parts.length > 3 ? parts.slice(-3).join('/') : filePath;
}
function ObservationCard(_a) {
    var observation = _a.observation;
    var _b = (0, react_1.useState)(false), showFacts = _b[0], setShowFacts = _b[1];
    var _c = (0, react_1.useState)(false), showNarrative = _c[0], setShowNarrative = _c[1];
    var date = (0, formatters_1.formatDate)(observation.created_at_epoch);
    // Parse JSON fields
    var facts = observation.facts ? JSON.parse(observation.facts) : [];
    var concepts = observation.concepts ? JSON.parse(observation.concepts) : [];
    var filesRead = observation.files_read ? JSON.parse(observation.files_read).map(stripProjectRoot) : [];
    var filesModified = observation.files_modified ? JSON.parse(observation.files_modified).map(stripProjectRoot) : [];
    // Show facts toggle if there are facts, concepts, or files
    var hasFactsContent = facts.length > 0 || concepts.length > 0 || filesRead.length > 0 || filesModified.length > 0;
    return (<div className="card">
      {/* Header with toggle buttons in top right */}
      <div className="card-header">
        <div className="card-header-left">
          <span className={"card-type type-".concat(observation.type)}>
            {observation.type}
          </span>
          <span className="card-project">{observation.project}</span>
        </div>
        <div className="view-mode-toggles">
          {hasFactsContent && (<button className={"view-mode-toggle ".concat(showFacts ? 'active' : '')} onClick={function () {
                setShowFacts(!showFacts);
                if (!showFacts)
                    setShowNarrative(false); // Turn off narrative when turning on facts
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>facts</span>
            </button>)}
          {observation.narrative && (<button className={"view-mode-toggle ".concat(showNarrative ? 'active' : '')} onClick={function () {
                setShowNarrative(!showNarrative);
                if (!showNarrative)
                    setShowFacts(false); // Turn off facts when turning on narrative
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>narrative</span>
            </button>)}
        </div>
      </div>

      {/* Title */}
      <div className="card-title">{observation.title || 'Untitled'}</div>

      {/* Content based on toggle state */}
      <div className="view-mode-content">
        {!showFacts && !showNarrative && observation.subtitle && (<div className="card-subtitle">{observation.subtitle}</div>)}
        {showFacts && facts.length > 0 && (<ul className="facts-list">
            {facts.map(function (fact, i) { return (<li key={i}>{fact}</li>); })}
          </ul>)}
        {showNarrative && observation.narrative && (<div className="narrative">
            {observation.narrative}
          </div>)}
      </div>

      {/* Metadata footer - id, date, and conditionally concepts/files when facts toggle is on */}
      <div className="card-meta">
        <span className="meta-date">#{observation.id} • {date}</span>
        {showFacts && (concepts.length > 0 || filesRead.length > 0 || filesModified.length > 0) && (<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {concepts.map(function (concept, i) { return (<span key={i} style={{
                    padding: '2px 8px',
                    background: 'var(--color-type-badge-bg)',
                    color: 'var(--color-type-badge-text)',
                    borderRadius: '3px',
                    fontWeight: '500',
                    fontSize: '10px'
                }}>
                {concept}
              </span>); })}
            {filesRead.length > 0 && (<span className="meta-files">
                <span className="file-label">read:</span> {filesRead.join(', ')}
              </span>)}
            {filesModified.length > 0 && (<span className="meta-files">
                <span className="file-label">modified:</span> {filesModified.join(', ')}
              </span>)}
          </div>)}
      </div>
    </div>);
}
