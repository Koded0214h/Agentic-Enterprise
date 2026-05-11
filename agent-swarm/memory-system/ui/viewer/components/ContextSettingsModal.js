"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextSettingsModal = ContextSettingsModal;
var react_1 = require("react");
var TerminalPreview_1 = require("./TerminalPreview");
var useContextPreview_1 = require("../hooks/useContextPreview");
// Collapsible section component
function CollapsibleSection(_a) {
    var title = _a.title, description = _a.description, children = _a.children, _b = _a.defaultOpen, defaultOpen = _b === void 0 ? true : _b;
    var _c = (0, react_1.useState)(defaultOpen), isOpen = _c[0], setIsOpen = _c[1];
    return (<div className={"settings-section-collapsible ".concat(isOpen ? 'open' : '')}>
      <button className="section-header-btn" onClick={function () { return setIsOpen(!isOpen); }} type="button">
        <div className="section-header-content">
          <span className="section-title">{title}</span>
          {description && <span className="section-description">{description}</span>}
        </div>
        <svg className={"chevron-icon ".concat(isOpen ? 'rotated' : '')} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {isOpen && <div className="section-content">{children}</div>}
    </div>);
}
// Form field with optional tooltip
function FormField(_a) {
    var label = _a.label, tooltip = _a.tooltip, children = _a.children;
    return (<div className="form-field">
      <label className="form-field-label">
        {label}
        {tooltip && (<span className="tooltip-trigger" title={tooltip}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>)}
      </label>
      {children}
    </div>);
}
// Toggle switch component
function ToggleSwitch(_a) {
    var id = _a.id, label = _a.label, description = _a.description, checked = _a.checked, onChange = _a.onChange, disabled = _a.disabled;
    return (<div className="toggle-row">
      <div className="toggle-info">
        <label htmlFor={id} className="toggle-label">{label}</label>
        {description && <span className="toggle-description">{description}</span>}
      </div>
      <button type="button" id={id} role="switch" aria-checked={checked} className={"toggle-switch ".concat(checked ? 'on' : '', " ").concat(disabled ? 'disabled' : '')} onClick={function () { return !disabled && onChange(!checked); }} disabled={disabled}>
        <span className="toggle-knob"/>
      </button>
    </div>);
}
function ContextSettingsModal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, settings = _a.settings, onSave = _a.onSave, isSaving = _a.isSaving, saveStatus = _a.saveStatus;
    var _b = (0, react_1.useState)(settings), formState = _b[0], setFormState = _b[1];
    // Update form state when settings prop changes
    (0, react_1.useEffect)(function () {
        setFormState(settings);
    }, [settings]);
    // Get context preview based on current form state
    var _c = (0, useContextPreview_1.useContextPreview)(formState), preview = _c.preview, isLoading = _c.isLoading, error = _c.error, projects = _c.projects, selectedProject = _c.selectedProject, setSelectedProject = _c.setSelectedProject;
    var updateSetting = (0, react_1.useCallback)(function (key, value) {
        var _a;
        var newState = __assign(__assign({}, formState), (_a = {}, _a[key] = value, _a));
        setFormState(newState);
    }, [formState]);
    var handleSave = (0, react_1.useCallback)(function () {
        onSave(formState);
    }, [formState, onSave]);
    var toggleBoolean = (0, react_1.useCallback)(function (key) {
        var currentValue = formState[key];
        var newValue = currentValue === 'true' ? 'false' : 'true';
        updateSetting(key, newValue);
    }, [formState, updateSetting]);
    // Handle ESC key
    (0, react_1.useEffect)(function () {
        var handleEsc = function (e) {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            return function () { return window.removeEventListener('keydown', handleEsc); };
        }
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (<div className="modal-backdrop" onClick={onClose}>
      <div className="context-settings-modal" onClick={function (e) { return e.stopPropagation(); }}>
        {/* Header */}
        <div className="modal-header">
          <h2>Settings</h2>
          <div className="header-controls">
            <label className="preview-selector">
              Preview for:
              <select value={selectedProject || ''} onChange={function (e) { return setSelectedProject(e.target.value); }}>
                {projects.map(function (project) { return (<option key={project} value={project}>{project}</option>); })}
              </select>
            </label>
            <button onClick={onClose} className="modal-close-btn" title="Close (Esc)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body - 2 columns */}
        <div className="modal-body">
          {/* Left column - Terminal Preview */}
          <div className="preview-column">
            <div className="preview-content">
              {error ? (<div style={{ color: '#ff6b6b' }}>
                  Error loading preview: {error}
                </div>) : (<TerminalPreview_1.TerminalPreview content={preview} isLoading={isLoading}/>)}
            </div>
          </div>

          {/* Right column - Settings Panel */}
          <div className="settings-column">
            {/* Section 1: Loading */}
            <CollapsibleSection title="Loading" description="How many observations to inject">
              <FormField label="Observations" tooltip="Number of recent observations to include in context (1-200)">
                <input type="number" min="1" max="200" value={formState.CLAUDE_MEM_CONTEXT_OBSERVATIONS || '50'} onChange={function (e) { return updateSetting('CLAUDE_MEM_CONTEXT_OBSERVATIONS', e.target.value); }}/>
              </FormField>
              <FormField label="Sessions" tooltip="Number of recent sessions to pull observations from (1-50)">
                <input type="number" min="1" max="50" value={formState.CLAUDE_MEM_CONTEXT_SESSION_COUNT || '10'} onChange={function (e) { return updateSetting('CLAUDE_MEM_CONTEXT_SESSION_COUNT', e.target.value); }}/>
              </FormField>
            </CollapsibleSection>

            {/* Section 2: Display */}
            <CollapsibleSection title="Display" description="What to show in context tables">
              <div className="display-subsection">
                <span className="subsection-label">Full Observations</span>
                <FormField label="Count" tooltip="How many observations show expanded details (0-20)">
                  <input type="number" min="0" max="20" value={formState.CLAUDE_MEM_CONTEXT_FULL_COUNT || '5'} onChange={function (e) { return updateSetting('CLAUDE_MEM_CONTEXT_FULL_COUNT', e.target.value); }}/>
                </FormField>
                <FormField label="Field" tooltip="Which field to expand for full observations">
                  <select value={formState.CLAUDE_MEM_CONTEXT_FULL_FIELD || 'narrative'} onChange={function (e) { return updateSetting('CLAUDE_MEM_CONTEXT_FULL_FIELD', e.target.value); }}>
                    <option value="narrative">Narrative</option>
                    <option value="facts">Facts</option>
                  </select>
                </FormField>
              </div>

              <div className="display-subsection">
                <span className="subsection-label">Token Economics</span>
                <div className="toggle-group">
                  <ToggleSwitch id="show-read-tokens" label="Read cost" description="Tokens to read this observation" checked={formState.CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS === 'true'} onChange={function () { return toggleBoolean('CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS'); }}/>
                  <ToggleSwitch id="show-work-tokens" label="Work investment" description="Tokens spent creating this observation" checked={formState.CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS === 'true'} onChange={function () { return toggleBoolean('CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS'); }}/>
                  <ToggleSwitch id="show-savings-amount" label="Savings" description="Total tokens saved by reusing context" checked={formState.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT === 'true'} onChange={function () { return toggleBoolean('CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT'); }}/>
                </div>
              </div>
            </CollapsibleSection>

            {/* Section 4: Advanced */}
            <CollapsibleSection title="Advanced" description="AI provider and model selection" defaultOpen={false}>
              <FormField label="AI Provider" tooltip="Choose between Claude (via Agent SDK) or Gemini (via REST API)">
                <select value={formState.CLAUDE_MEM_PROVIDER || 'claude'} onChange={function (e) { return updateSetting('CLAUDE_MEM_PROVIDER', e.target.value); }}>
                  <option value="claude">Claude (uses your Claude account)</option>
                  <option value="gemini">Gemini (uses API key)</option>
                  <option value="openrouter">OpenRouter (multi-model)</option>
                </select>
              </FormField>

              {formState.CLAUDE_MEM_PROVIDER === 'claude' && (<FormField label="Claude Model" tooltip="Claude model used for generating observations">
                  <select value={formState.CLAUDE_MEM_MODEL || 'haiku'} onChange={function (e) { return updateSetting('CLAUDE_MEM_MODEL', e.target.value); }}>
                    <option value="haiku">haiku (fastest)</option>
                    <option value="sonnet">sonnet (balanced)</option>
                    <option value="opus">opus (highest quality)</option>
                  </select>
                </FormField>)}

              {formState.CLAUDE_MEM_PROVIDER === 'gemini' && (<>
                  <FormField label="Gemini API Key" tooltip="Your Google AI Studio API key (or set GEMINI_API_KEY env var)">
                    <input type="password" value={formState.CLAUDE_MEM_GEMINI_API_KEY || ''} onChange={function (e) { return updateSetting('CLAUDE_MEM_GEMINI_API_KEY', e.target.value); }} placeholder="Enter Gemini API key..."/>
                  </FormField>
                  <FormField label="Gemini Model" tooltip="Gemini model used for generating observations">
                    <select value={formState.CLAUDE_MEM_GEMINI_MODEL || 'gemini-2.5-flash-lite'} onChange={function (e) { return updateSetting('CLAUDE_MEM_GEMINI_MODEL', e.target.value); }}>
                      <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (10 RPM free)</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash (5 RPM free)</option>
                      <option value="gemini-3-flash-preview">gemini-3-flash-preview (5 RPM free)</option>
                    </select>
                  </FormField>
                  <div className="toggle-group" style={{ marginTop: '8px' }}>
                    <ToggleSwitch id="gemini-rate-limiting" label="Rate Limiting" description="Enable for free tier (10-30 RPM). Disable if you have billing set up (1000+ RPM)." checked={formState.CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED === 'true'} onChange={function (checked) { return updateSetting('CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED', checked ? 'true' : 'false'); }}/>
                  </div>
                </>)}

              {formState.CLAUDE_MEM_PROVIDER === 'openrouter' && (<>
                  <FormField label="OpenRouter API Key" tooltip="Your OpenRouter API key from openrouter.ai (or set OPENROUTER_API_KEY env var)">
                    <input type="password" value={formState.CLAUDE_MEM_OPENROUTER_API_KEY || ''} onChange={function (e) { return updateSetting('CLAUDE_MEM_OPENROUTER_API_KEY', e.target.value); }} placeholder="Enter OpenRouter API key..."/>
                  </FormField>
                  <FormField label="OpenRouter Model" tooltip="Model identifier from OpenRouter (e.g., anthropic/claude-3.5-sonnet, google/gemini-2.0-flash-thinking-exp)">
                    <input type="text" value={formState.CLAUDE_MEM_OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free'} onChange={function (e) { return updateSetting('CLAUDE_MEM_OPENROUTER_MODEL', e.target.value); }} placeholder="e.g., xiaomi/mimo-v2-flash:free"/>
                  </FormField>
                  <FormField label="Site URL (Optional)" tooltip="Your site URL for OpenRouter analytics (optional)">
                    <input type="text" value={formState.CLAUDE_MEM_OPENROUTER_SITE_URL || ''} onChange={function (e) { return updateSetting('CLAUDE_MEM_OPENROUTER_SITE_URL', e.target.value); }} placeholder="https://yoursite.com"/>
                  </FormField>
                  <FormField label="App Name (Optional)" tooltip="Your app name for OpenRouter analytics (optional)">
                    <input type="text" value={formState.CLAUDE_MEM_OPENROUTER_APP_NAME || 'claude-mem'} onChange={function (e) { return updateSetting('CLAUDE_MEM_OPENROUTER_APP_NAME', e.target.value); }} placeholder="claude-mem"/>
                  </FormField>
                </>)}

              <FormField label="Worker Port" tooltip="Port for the background worker service">
                <input type="number" min="1024" max="65535" value={formState.CLAUDE_MEM_WORKER_PORT || '37777'} onChange={function (e) { return updateSetting('CLAUDE_MEM_WORKER_PORT', e.target.value); }}/>
              </FormField>

              <div className="toggle-group" style={{ marginTop: '12px' }}>
                <ToggleSwitch id="show-last-summary" label="Include last summary" description="Add previous session's summary to context" checked={formState.CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY === 'true'} onChange={function () { return toggleBoolean('CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY'); }}/>
                <ToggleSwitch id="show-last-message" label="Include last message" description="Add previous session's final message" checked={formState.CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE === 'true'} onChange={function () { return toggleBoolean('CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE'); }}/>
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* Footer with Save button */}
        <div className="modal-footer">
          <div className="save-status">
            {saveStatus && <span className={saveStatus.includes('✓') ? 'success' : saveStatus.includes('✗') ? 'error' : ''}>{saveStatus}</span>}
          </div>
          <button className="save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>);
}
