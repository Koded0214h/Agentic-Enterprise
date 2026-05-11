"use strict";
/**
 * FormattingService - Handles all formatting logic for search results
 * Uses table format matching context-generator style for visual consistency
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormattingService = void 0;
var ModeManager_js_1 = require("../domain/ModeManager.js");
// Token estimation constant (matches context-generator)
var CHARS_PER_TOKEN_ESTIMATE = 4;
var FormattingService = /** @class */ (function () {
    function FormattingService() {
    }
    /**
     * Format search tips footer
     */
    FormattingService.prototype.formatSearchTips = function () {
        return "\n---\n\uD83D\uDCA1 Search Strategy:\n1. Search with index to see titles, dates, IDs\n2. Use timeline to get context around interesting results\n3. Batch fetch full details: get_observations(ids=[...])\n\nTips:\n\u2022 Filter by type: obs_type=\"bugfix,feature\"\n\u2022 Filter by date: dateStart=\"2025-01-01\"\n\u2022 Sort: orderBy=\"date_desc\" or \"date_asc\"";
    };
    /**
     * Format time from epoch (matches context-generator formatTime)
     */
    FormattingService.prototype.formatTime = function (epoch) {
        return new Date(epoch).toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };
    /**
     * Estimate read tokens for an observation
     */
    FormattingService.prototype.estimateReadTokens = function (obs) {
        var _a, _b, _c, _d;
        var size = (((_a = obs.title) === null || _a === void 0 ? void 0 : _a.length) || 0) +
            (((_b = obs.subtitle) === null || _b === void 0 ? void 0 : _b.length) || 0) +
            (((_c = obs.narrative) === null || _c === void 0 ? void 0 : _c.length) || 0) +
            (((_d = obs.facts) === null || _d === void 0 ? void 0 : _d.length) || 0);
        return Math.ceil(size / CHARS_PER_TOKEN_ESTIMATE);
    };
    /**
     * Format observation as table row
     * | ID | Time | T | Title | Read | Work |
     */
    FormattingService.prototype.formatObservationIndex = function (obs, _index) {
        var id = "#".concat(obs.id);
        var time = this.formatTime(obs.created_at_epoch);
        var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
        var title = obs.title || 'Untitled';
        var readTokens = this.estimateReadTokens(obs);
        var workEmoji = ModeManager_js_1.ModeManager.getInstance().getWorkEmoji(obs.type);
        var workTokens = obs.discovery_tokens || 0;
        var workDisplay = workTokens > 0 ? "".concat(workEmoji, " ").concat(workTokens) : '-';
        return "| ".concat(id, " | ").concat(time, " | ").concat(icon, " | ").concat(title, " | ~").concat(readTokens, " | ").concat(workDisplay, " |");
    };
    /**
     * Format session summary as table row
     * | ID | Time | T | Title | - | - |
     */
    FormattingService.prototype.formatSessionIndex = function (session, _index) {
        var _a;
        var id = "#S".concat(session.id);
        var time = this.formatTime(session.created_at_epoch);
        var icon = '🎯';
        var title = session.request || "Session ".concat(((_a = session.memory_session_id) === null || _a === void 0 ? void 0 : _a.substring(0, 8)) || 'unknown');
        return "| ".concat(id, " | ").concat(time, " | ").concat(icon, " | ").concat(title, " | - | - |");
    };
    /**
     * Format user prompt as table row
     * | ID | Time | T | Title | - | - |
     */
    FormattingService.prototype.formatUserPromptIndex = function (prompt, _index) {
        var id = "#P".concat(prompt.id);
        var time = this.formatTime(prompt.created_at_epoch);
        var icon = '💬';
        // Truncate long prompts for table display
        var title = prompt.prompt_text.length > 60
            ? prompt.prompt_text.substring(0, 57) + '...'
            : prompt.prompt_text;
        return "| ".concat(id, " | ").concat(time, " | ").concat(icon, " | ").concat(title, " | - | - |");
    };
    /**
     * Generate table header for observations
     */
    FormattingService.prototype.formatTableHeader = function () {
        return "| ID | Time | T | Title | Read | Work |\n|-----|------|---|-------|------|------|";
    };
    /**
     * Generate table header for search results (no Work column)
     */
    FormattingService.prototype.formatSearchTableHeader = function () {
        return "| ID | Time | T | Title | Read |\n|----|------|---|-------|------|";
    };
    /**
     * Format observation as table row for search results (no Work column)
     */
    FormattingService.prototype.formatObservationSearchRow = function (obs, lastTime) {
        var id = "#".concat(obs.id);
        var time = this.formatTime(obs.created_at_epoch);
        var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
        var title = obs.title || 'Untitled';
        var readTokens = this.estimateReadTokens(obs);
        // Use ditto mark if same time as previous row
        var timeDisplay = time === lastTime ? '″' : time;
        return {
            row: "| ".concat(id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title, " | ~").concat(readTokens, " |"),
            time: time
        };
    };
    /**
     * Format session summary as table row for search results (no Work column)
     */
    FormattingService.prototype.formatSessionSearchRow = function (session, lastTime) {
        var _a;
        var id = "#S".concat(session.id);
        var time = this.formatTime(session.created_at_epoch);
        var icon = '🎯';
        var title = session.request || "Session ".concat(((_a = session.memory_session_id) === null || _a === void 0 ? void 0 : _a.substring(0, 8)) || 'unknown');
        // Use ditto mark if same time as previous row
        var timeDisplay = time === lastTime ? '″' : time;
        return {
            row: "| ".concat(id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title, " | - |"),
            time: time
        };
    };
    /**
     * Format user prompt as table row for search results (no Work column)
     */
    FormattingService.prototype.formatUserPromptSearchRow = function (prompt, lastTime) {
        var id = "#P".concat(prompt.id);
        var time = this.formatTime(prompt.created_at_epoch);
        var icon = '💬';
        // Truncate long prompts for table display
        var title = prompt.prompt_text.length > 60
            ? prompt.prompt_text.substring(0, 57) + '...'
            : prompt.prompt_text;
        // Use ditto mark if same time as previous row
        var timeDisplay = time === lastTime ? '″' : time;
        return {
            row: "| ".concat(id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title, " | - |"),
            time: time
        };
    };
    return FormattingService;
}());
exports.FormattingService = FormattingService;
