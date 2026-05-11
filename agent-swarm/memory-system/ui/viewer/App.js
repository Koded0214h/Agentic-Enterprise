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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = App;
var react_1 = require("react");
var Header_1 = require("./components/Header");
var Feed_1 = require("./components/Feed");
var ContextSettingsModal_1 = require("./components/ContextSettingsModal");
var LogsModal_1 = require("./components/LogsModal");
var useSSE_1 = require("./hooks/useSSE");
var useSettings_1 = require("./hooks/useSettings");
var useStats_1 = require("./hooks/useStats");
var usePagination_1 = require("./hooks/usePagination");
var useTheme_1 = require("./hooks/useTheme");
var data_1 = require("./utils/data");
function App() {
    var _this = this;
    var _a = (0, react_1.useState)(''), currentFilter = _a[0], setCurrentFilter = _a[1];
    var _b = (0, react_1.useState)(false), contextPreviewOpen = _b[0], setContextPreviewOpen = _b[1];
    var _c = (0, react_1.useState)(false), logsModalOpen = _c[0], setLogsModalOpen = _c[1];
    var _d = (0, react_1.useState)([]), paginatedObservations = _d[0], setPaginatedObservations = _d[1];
    var _e = (0, react_1.useState)([]), paginatedSummaries = _e[0], setPaginatedSummaries = _e[1];
    var _f = (0, react_1.useState)([]), paginatedPrompts = _f[0], setPaginatedPrompts = _f[1];
    var _g = (0, useSSE_1.useSSE)(), observations = _g.observations, summaries = _g.summaries, prompts = _g.prompts, projects = _g.projects, isProcessing = _g.isProcessing, queueDepth = _g.queueDepth, isConnected = _g.isConnected;
    var _h = (0, useSettings_1.useSettings)(), settings = _h.settings, saveSettings = _h.saveSettings, isSaving = _h.isSaving, saveStatus = _h.saveStatus;
    var _j = (0, useStats_1.useStats)(), stats = _j.stats, refreshStats = _j.refreshStats;
    var _k = (0, useTheme_1.useTheme)(), preference = _k.preference, resolvedTheme = _k.resolvedTheme, setThemePreference = _k.setThemePreference;
    var pagination = (0, usePagination_1.usePagination)(currentFilter);
    // Merge SSE live data with paginated data, filtering by project when active
    var allObservations = (0, react_1.useMemo)(function () {
        var live = currentFilter
            ? observations.filter(function (o) { return o.project === currentFilter; })
            : observations;
        return (0, data_1.mergeAndDeduplicateByProject)(live, paginatedObservations);
    }, [observations, paginatedObservations, currentFilter]);
    var allSummaries = (0, react_1.useMemo)(function () {
        var live = currentFilter
            ? summaries.filter(function (s) { return s.project === currentFilter; })
            : summaries;
        return (0, data_1.mergeAndDeduplicateByProject)(live, paginatedSummaries);
    }, [summaries, paginatedSummaries, currentFilter]);
    var allPrompts = (0, react_1.useMemo)(function () {
        var live = currentFilter
            ? prompts.filter(function (p) { return p.project === currentFilter; })
            : prompts;
        return (0, data_1.mergeAndDeduplicateByProject)(live, paginatedPrompts);
    }, [prompts, paginatedPrompts, currentFilter]);
    // Toggle context preview modal
    var toggleContextPreview = (0, react_1.useCallback)(function () {
        setContextPreviewOpen(function (prev) { return !prev; });
    }, []);
    // Toggle logs modal
    var toggleLogsModal = (0, react_1.useCallback)(function () {
        setLogsModalOpen(function (prev) { return !prev; });
    }, []);
    // Handle loading more data
    var handleLoadMore = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, newObservations_1, newSummaries_1, newPrompts_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            pagination.observations.loadMore(),
                            pagination.summaries.loadMore(),
                            pagination.prompts.loadMore()
                        ])];
                case 1:
                    _a = _b.sent(), newObservations_1 = _a[0], newSummaries_1 = _a[1], newPrompts_1 = _a[2];
                    if (newObservations_1.length > 0) {
                        setPaginatedObservations(function (prev) { return __spreadArray(__spreadArray([], prev, true), newObservations_1, true); });
                    }
                    if (newSummaries_1.length > 0) {
                        setPaginatedSummaries(function (prev) { return __spreadArray(__spreadArray([], prev, true), newSummaries_1, true); });
                    }
                    if (newPrompts_1.length > 0) {
                        setPaginatedPrompts(function (prev) { return __spreadArray(__spreadArray([], prev, true), newPrompts_1, true); });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error('Failed to load more data:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [currentFilter, pagination.observations, pagination.summaries, pagination.prompts]);
    // Reset paginated data and load first page when filter changes
    (0, react_1.useEffect)(function () {
        setPaginatedObservations([]);
        setPaginatedSummaries([]);
        setPaginatedPrompts([]);
        handleLoadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFilter]);
    return (<>
      <Header_1.Header isConnected={isConnected} projects={projects} currentFilter={currentFilter} onFilterChange={setCurrentFilter} isProcessing={isProcessing} queueDepth={queueDepth} themePreference={preference} onThemeChange={setThemePreference} onContextPreviewToggle={toggleContextPreview}/>

      <Feed_1.Feed observations={allObservations} summaries={allSummaries} prompts={allPrompts} onLoadMore={handleLoadMore} isLoading={pagination.observations.isLoading || pagination.summaries.isLoading || pagination.prompts.isLoading} hasMore={pagination.observations.hasMore || pagination.summaries.hasMore || pagination.prompts.hasMore}/>

      <ContextSettingsModal_1.ContextSettingsModal isOpen={contextPreviewOpen} onClose={toggleContextPreview} settings={settings} onSave={saveSettings} isSaving={isSaving} saveStatus={saveStatus}/>

      <button className="console-toggle-btn" onClick={toggleLogsModal} title="Toggle Console">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
      </button>

      <LogsModal_1.LogsDrawer isOpen={logsModalOpen} onClose={toggleLogsModal}/>
    </>);
}
