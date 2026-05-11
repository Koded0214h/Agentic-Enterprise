"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsDrawer = LogsDrawer;
var react_1 = require("react");
// Configuration for log levels
var LOG_LEVELS = [
    { key: 'DEBUG', label: 'Debug', icon: '🔍', color: '#8b8b8b' },
    { key: 'INFO', label: 'Info', icon: 'ℹ️', color: '#58a6ff' },
    { key: 'WARN', label: 'Warn', icon: '⚠️', color: '#d29922' },
    { key: 'ERROR', label: 'Error', icon: '❌', color: '#f85149' },
];
// Configuration for log components
var LOG_COMPONENTS = [
    { key: 'HOOK', label: 'Hook', icon: '🪝', color: '#a371f7' },
    { key: 'WORKER', label: 'Worker', icon: '⚙️', color: '#58a6ff' },
    { key: 'SDK', label: 'SDK', icon: '📦', color: '#3fb950' },
    { key: 'PARSER', label: 'Parser', icon: '📄', color: '#79c0ff' },
    { key: 'DB', label: 'DB', icon: '🗄️', color: '#f0883e' },
    { key: 'SYSTEM', label: 'System', icon: '💻', color: '#8b949e' },
    { key: 'HTTP', label: 'HTTP', icon: '🌐', color: '#39d353' },
    { key: 'SESSION', label: 'Session', icon: '📋', color: '#db61a2' },
    { key: 'CHROMA', label: 'Chroma', icon: '🔮', color: '#a855f7' },
];
// Parse a single log line into structured data
function parseLogLine(line) {
    // Pattern: [timestamp] [LEVEL] [COMPONENT] [correlation?] message
    // Example: [2025-01-02 14:30:45.123] [INFO ] [WORKER] [session-123] → message
    var pattern = /^\[([^\]]+)\]\s+\[(\w+)\s*\]\s+\[(\w+)\s*\]\s+(?:\[([^\]]+)\]\s+)?(.*)$/;
    var match = line.match(pattern);
    if (!match) {
        return { raw: line };
    }
    var timestamp = match[1], level = match[2], component = match[3], correlationId = match[4], message = match[5];
    // Detect special message types
    var isSpecial = undefined;
    if (message.startsWith('→'))
        isSpecial = 'dataIn';
    else if (message.startsWith('←'))
        isSpecial = 'dataOut';
    else if (message.startsWith('✓'))
        isSpecial = 'success';
    else if (message.startsWith('✗'))
        isSpecial = 'failure';
    else if (message.startsWith('⏱'))
        isSpecial = 'timing';
    else if (message.includes('[HAPPY-PATH]'))
        isSpecial = 'happyPath';
    return {
        raw: line,
        timestamp: timestamp,
        level: level === null || level === void 0 ? void 0 : level.trim(),
        component: component === null || component === void 0 ? void 0 : component.trim(),
        correlationId: correlationId || undefined,
        message: message,
        isSpecial: isSpecial,
    };
}
function LogsDrawer(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = (0, react_1.useState)(''), logs = _b[0], setLogs = _b[1];
    var _c = (0, react_1.useState)(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(false), autoRefresh = _e[0], setAutoRefresh = _e[1];
    var _f = (0, react_1.useState)(350), height = _f[0], setHeight = _f[1];
    var _g = (0, react_1.useState)(false), isResizing = _g[0], setIsResizing = _g[1];
    var startYRef = (0, react_1.useRef)(0);
    var startHeightRef = (0, react_1.useRef)(0);
    var contentRef = (0, react_1.useRef)(null);
    var wasAtBottomRef = (0, react_1.useRef)(true);
    // Filter state
    var _h = (0, react_1.useState)(new Set(['DEBUG', 'INFO', 'WARN', 'ERROR'])), activeLevels = _h[0], setActiveLevels = _h[1];
    var _j = (0, react_1.useState)(new Set(['HOOK', 'WORKER', 'SDK', 'PARSER', 'DB', 'SYSTEM', 'HTTP', 'SESSION', 'CHROMA'])), activeComponents = _j[0], setActiveComponents = _j[1];
    var _k = (0, react_1.useState)(false), alignmentOnly = _k[0], setAlignmentOnly = _k[1];
    // Parse and filter log lines
    var parsedLines = (0, react_1.useMemo)(function () {
        if (!logs)
            return [];
        return logs.split('\n').map(parseLogLine);
    }, [logs]);
    var filteredLines = (0, react_1.useMemo)(function () {
        return parsedLines.filter(function (line) {
            // Alignment filter - if enabled, only show [ALIGNMENT] lines
            if (alignmentOnly) {
                return line.raw.includes('[ALIGNMENT]');
            }
            // Always show unparsed lines
            if (!line.level || !line.component)
                return true;
            return activeLevels.has(line.level) && activeComponents.has(line.component);
        });
    }, [parsedLines, activeLevels, activeComponents, alignmentOnly]);
    // Check if user is at bottom before updating
    var checkIfAtBottom = (0, react_1.useCallback)(function () {
        if (!contentRef.current)
            return true;
        var _a = contentRef.current, scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
        return scrollHeight - scrollTop - clientHeight < 50;
    }, []);
    // Auto-scroll to bottom
    var scrollToBottom = (0, react_1.useCallback)(function () {
        if (contentRef.current && wasAtBottomRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, []);
    var fetchLogs = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Save scroll position before fetch
                    wasAtBottomRef.current = checkIfAtBottom();
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/logs')];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch logs: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    setLogs(data.logs || '');
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : 'Unknown error');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [checkIfAtBottom]);
    // Scroll to bottom after logs update
    (0, react_1.useEffect)(function () {
        scrollToBottom();
    }, [logs, scrollToBottom]);
    var handleClearLogs = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to clear all logs?')) {
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch('/api/logs/clear', { method: 'POST' })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to clear logs: ".concat(response.statusText));
                    }
                    setLogs('');
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError(err_2 instanceof Error ? err_2.message : 'Unknown error');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    // Handle resize
    var handleMouseDown = (0, react_1.useCallback)(function (e) {
        e.preventDefault();
        setIsResizing(true);
        startYRef.current = e.clientY;
        startHeightRef.current = height;
    }, [height]);
    (0, react_1.useEffect)(function () {
        if (!isResizing)
            return;
        var handleMouseMove = function (e) {
            var deltaY = startYRef.current - e.clientY;
            var newHeight = Math.min(Math.max(150, startHeightRef.current + deltaY), window.innerHeight - 100);
            setHeight(newHeight);
        };
        var handleMouseUp = function () {
            setIsResizing(false);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return function () {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);
    // Fetch logs when drawer opens
    (0, react_1.useEffect)(function () {
        if (isOpen) {
            wasAtBottomRef.current = true; // Start at bottom on open
            fetchLogs();
        }
    }, [isOpen, fetchLogs]);
    // Auto-refresh logs every 2 seconds if enabled
    (0, react_1.useEffect)(function () {
        if (!isOpen || !autoRefresh) {
            return;
        }
        var interval = setInterval(fetchLogs, 2000);
        return function () { return clearInterval(interval); };
    }, [isOpen, autoRefresh, fetchLogs]);
    // Toggle level filter
    var toggleLevel = (0, react_1.useCallback)(function (level) {
        setActiveLevels(function (prev) {
            var next = new Set(prev);
            if (next.has(level)) {
                next.delete(level);
            }
            else {
                next.add(level);
            }
            return next;
        });
    }, []);
    // Toggle component filter
    var toggleComponent = (0, react_1.useCallback)(function (component) {
        setActiveComponents(function (prev) {
            var next = new Set(prev);
            if (next.has(component)) {
                next.delete(component);
            }
            else {
                next.add(component);
            }
            return next;
        });
    }, []);
    // Select all / none for levels
    var setAllLevels = (0, react_1.useCallback)(function (enabled) {
        if (enabled) {
            setActiveLevels(new Set(['DEBUG', 'INFO', 'WARN', 'ERROR']));
        }
        else {
            setActiveLevels(new Set());
        }
    }, []);
    // Select all / none for components
    var setAllComponents = (0, react_1.useCallback)(function (enabled) {
        if (enabled) {
            setActiveComponents(new Set(['HOOK', 'WORKER', 'SDK', 'PARSER', 'DB', 'SYSTEM', 'HTTP', 'SESSION', 'CHROMA']));
        }
        else {
            setActiveComponents(new Set());
        }
    }, []);
    if (!isOpen) {
        return null;
    }
    // Get style for a parsed log line
    var getLineStyle = function (line) {
        var levelConfig = LOG_LEVELS.find(function (l) { return l.key === line.level; });
        var componentConfig = LOG_COMPONENTS.find(function (c) { return c.key === line.component; });
        var color = 'var(--color-text-primary)';
        var fontWeight = 'normal';
        var backgroundColor = 'transparent';
        if (line.level === 'ERROR') {
            color = '#f85149';
            backgroundColor = 'rgba(248, 81, 73, 0.1)';
        }
        else if (line.level === 'WARN') {
            color = '#d29922';
            backgroundColor = 'rgba(210, 153, 34, 0.05)';
        }
        else if (line.isSpecial === 'success') {
            color = '#3fb950';
        }
        else if (line.isSpecial === 'failure') {
            color = '#f85149';
        }
        else if (line.isSpecial === 'happyPath') {
            color = '#d29922';
        }
        else if (levelConfig) {
            color = levelConfig.color;
        }
        return { color: color, fontWeight: fontWeight, backgroundColor: backgroundColor, padding: '1px 0', borderRadius: '2px' };
    };
    // Render a single log line with syntax highlighting
    var renderLogLine = function (line, index) {
        var _a, _b;
        if (!line.timestamp) {
            // Unparsed line - render as-is
            return (<div key={index} className="log-line log-line-raw">
          {line.raw}
        </div>);
        }
        var levelConfig = LOG_LEVELS.find(function (l) { return l.key === line.level; });
        var componentConfig = LOG_COMPONENTS.find(function (c) { return c.key === line.component; });
        return (<div key={index} className="log-line" style={getLineStyle(line)}>
        <span className="log-timestamp">[{line.timestamp}]</span>
        {' '}
        <span className="log-level" style={{ color: levelConfig === null || levelConfig === void 0 ? void 0 : levelConfig.color }} title={line.level}>
          [{(levelConfig === null || levelConfig === void 0 ? void 0 : levelConfig.icon) || ''} {(_a = line.level) === null || _a === void 0 ? void 0 : _a.padEnd(5)}]
        </span>
        {' '}
        <span className="log-component" style={{ color: componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.color }} title={line.component}>
          [{(componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.icon) || ''} {(_b = line.component) === null || _b === void 0 ? void 0 : _b.padEnd(7)}]
        </span>
        {' '}
        {line.correlationId && (<>
            <span className="log-correlation">[{line.correlationId}]</span>
            {' '}
          </>)}
        <span className="log-message">{line.message}</span>
      </div>);
    };
    return (<div className="console-drawer" style={{ height: "".concat(height, "px") }}>
      <div className="console-resize-handle" onMouseDown={handleMouseDown}>
        <div className="console-resize-bar"/>
      </div>

      <div className="console-header">
        <div className="console-tabs">
          <div className="console-tab active">Console</div>
        </div>
        <div className="console-controls">
          <label className="console-auto-refresh">
            <input type="checkbox" checked={autoRefresh} onChange={function (e) { return setAutoRefresh(e.target.checked); }}/>
            Auto-refresh
          </label>
          <button className="console-control-btn" onClick={fetchLogs} disabled={isLoading} title="Refresh logs">
            ↻
          </button>
          <button className="console-control-btn" onClick={function () {
            wasAtBottomRef.current = true;
            scrollToBottom();
        }} title="Scroll to bottom">
            ⬇
          </button>
          <button className="console-control-btn console-clear-btn" onClick={handleClearLogs} disabled={isLoading} title="Clear logs">
            🗑
          </button>
          <button className="console-control-btn" onClick={onClose} title="Close console">
            ✕
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="console-filters">
        <div className="console-filter-section">
          <span className="console-filter-label">Quick:</span>
          <div className="console-filter-chips">
            <button className={"console-filter-chip ".concat(alignmentOnly ? 'active' : '')} onClick={function () { return setAlignmentOnly(!alignmentOnly); }} style={{
            '--chip-color': '#f0883e',
        }} title="Show only session alignment logs">
              🔗 Alignment
            </button>
          </div>
        </div>
        <div className="console-filter-section">
          <span className="console-filter-label">Levels:</span>
          <div className="console-filter-chips">
            {LOG_LEVELS.map(function (level) { return (<button key={level.key} className={"console-filter-chip ".concat(activeLevels.has(level.key) ? 'active' : '')} onClick={function () { return toggleLevel(level.key); }} style={{
                '--chip-color': level.color,
            }} title={level.label}>
                {level.icon} {level.label}
              </button>); })}
            <button className="console-filter-action" onClick={function () { return setAllLevels(activeLevels.size === 0); }} title={activeLevels.size === LOG_LEVELS.length ? 'Select none' : 'Select all'}>
              {activeLevels.size === LOG_LEVELS.length ? '○' : '●'}
            </button>
          </div>
        </div>
        <div className="console-filter-section">
          <span className="console-filter-label">Components:</span>
          <div className="console-filter-chips">
            {LOG_COMPONENTS.map(function (comp) { return (<button key={comp.key} className={"console-filter-chip ".concat(activeComponents.has(comp.key) ? 'active' : '')} onClick={function () { return toggleComponent(comp.key); }} style={{
                '--chip-color': comp.color,
            }} title={comp.label}>
                {comp.icon} {comp.label}
              </button>); })}
            <button className="console-filter-action" onClick={function () { return setAllComponents(activeComponents.size === 0); }} title={activeComponents.size === LOG_COMPONENTS.length ? 'Select none' : 'Select all'}>
              {activeComponents.size === LOG_COMPONENTS.length ? '○' : '●'}
            </button>
          </div>
        </div>
      </div>

      {error && (<div className="console-error">
          ⚠ {error}
        </div>)}

      <div className="console-content" ref={contentRef}>
        <div className="console-logs">
          {filteredLines.length === 0 ? (<div className="log-line log-line-empty">No logs available</div>) : (filteredLines.map(function (line, index) { return renderLogLine(line, index); }))}
        </div>
      </div>
    </div>);
}
