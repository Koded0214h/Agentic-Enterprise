"use strict";
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
exports.ResultFormatter = void 0;
var ModeManager_js_1 = require("../../domain/ModeManager.js");
var timeline_formatting_js_1 = require("../../../shared/timeline-formatting.js");
var CHARS_PER_TOKEN_ESTIMATE = 4;
var ResultFormatter = /** @class */ (function () {
    function ResultFormatter() {
    }
    /**
     * Format search results as markdown text
     */
    ResultFormatter.prototype.formatSearchResults = function (results, query, chromaFailed) {
        if (chromaFailed === void 0) { chromaFailed = false; }
        var totalResults = results.observations.length +
            results.sessions.length +
            results.prompts.length;
        if (totalResults === 0) {
            if (chromaFailed) {
                return this.formatChromaFailureMessage();
            }
            return "No results found matching \"".concat(query, "\"");
        }
        // Combine all results with timestamps for unified sorting
        var combined = this.combineResults(results);
        // Sort by date
        combined.sort(function (a, b) { return b.epoch - a.epoch; });
        // Group by date, then by file within each day
        var cwd = process.cwd();
        var resultsByDate = (0, timeline_formatting_js_1.groupByDate)(combined, function (item) { return item.created_at; });
        // Build output with date/file grouping
        var lines = [];
        lines.push("Found ".concat(totalResults, " result(s) matching \"").concat(query, "\" (").concat(results.observations.length, " obs, ").concat(results.sessions.length, " sessions, ").concat(results.prompts.length, " prompts)"));
        lines.push('');
        for (var _i = 0, resultsByDate_1 = resultsByDate; _i < resultsByDate_1.length; _i++) {
            var _a = resultsByDate_1[_i], day = _a[0], dayResults = _a[1];
            lines.push("### ".concat(day));
            lines.push('');
            // Group by file within this day
            var resultsByFile = new Map();
            for (var _b = 0, dayResults_1 = dayResults; _b < dayResults_1.length; _b++) {
                var result = dayResults_1[_b];
                var file = 'General';
                if (result.type === 'observation') {
                    var obs = result.data;
                    file = (0, timeline_formatting_js_1.extractFirstFile)(obs.files_modified, cwd, obs.files_read);
                }
                if (!resultsByFile.has(file)) {
                    resultsByFile.set(file, []);
                }
                resultsByFile.get(file).push(result);
            }
            // Render each file section
            for (var _c = 0, resultsByFile_1 = resultsByFile; _c < resultsByFile_1.length; _c++) {
                var _d = resultsByFile_1[_c], file = _d[0], fileResults = _d[1];
                lines.push("**".concat(file, "**"));
                lines.push(this.formatSearchTableHeader());
                var lastTime = '';
                for (var _e = 0, fileResults_1 = fileResults; _e < fileResults_1.length; _e++) {
                    var result = fileResults_1[_e];
                    if (result.type === 'observation') {
                        var formatted = this.formatObservationSearchRow(result.data, lastTime);
                        lines.push(formatted.row);
                        lastTime = formatted.time;
                    }
                    else if (result.type === 'session') {
                        var formatted = this.formatSessionSearchRow(result.data, lastTime);
                        lines.push(formatted.row);
                        lastTime = formatted.time;
                    }
                    else {
                        var formatted = this.formatPromptSearchRow(result.data, lastTime);
                        lines.push(formatted.row);
                        lastTime = formatted.time;
                    }
                }
                lines.push('');
            }
        }
        return lines.join('\n');
    };
    /**
     * Combine results into unified format
     */
    ResultFormatter.prototype.combineResults = function (results) {
        return __spreadArray(__spreadArray(__spreadArray([], results.observations.map(function (obs) { return ({
            type: 'observation',
            data: obs,
            epoch: obs.created_at_epoch,
            created_at: obs.created_at
        }); }), true), results.sessions.map(function (sess) { return ({
            type: 'session',
            data: sess,
            epoch: sess.created_at_epoch,
            created_at: sess.created_at
        }); }), true), results.prompts.map(function (prompt) { return ({
            type: 'prompt',
            data: prompt,
            epoch: prompt.created_at_epoch,
            created_at: prompt.created_at
        }); }), true);
    };
    /**
     * Format search table header (no Work column)
     */
    ResultFormatter.prototype.formatSearchTableHeader = function () {
        return "| ID | Time | T | Title | Read |\n|----|------|---|-------|------|";
    };
    /**
     * Format full table header (with Work column)
     */
    ResultFormatter.prototype.formatTableHeader = function () {
        return "| ID | Time | T | Title | Read | Work |\n|-----|------|---|-------|------|------|";
    };
    /**
     * Format observation as table row for search results
     */
    ResultFormatter.prototype.formatObservationSearchRow = function (obs, lastTime) {
        var id = "#".concat(obs.id);
        var time = (0, timeline_formatting_js_1.formatTime)(obs.created_at_epoch);
        var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
        var title = obs.title || 'Untitled';
        var readTokens = this.estimateReadTokens(obs);
        var timeDisplay = time === lastTime ? '"' : time;
        return {
            row: "| ".concat(id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title, " | ~").concat(readTokens, " |"),
            time: time
        };
    };
    /**
     * Format session as table row for search results
     */
    ResultFormatter.prototype.formatSessionSearchRow = function (session, lastTime) {
        var _a;
        var id = "#S".concat(session.id);
        var time = (0, timeline_formatting_js_1.formatTime)(session.created_at_epoch);
        var icon = '\uD83C\uDFAF'; // Target emoji
        var title = session.request ||
            "Session ".concat(((_a = session.memory_session_id) === null || _a === void 0 ? void 0 : _a.substring(0, 8)) || 'unknown');
        var timeDisplay = time === lastTime ? '"' : time;
        return {
            row: "| ".concat(id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title, " | - |"),
            time: time
        };
    };
    /**
     * Format user prompt as table row for search results
     */
    ResultFormatter.prototype.formatPromptSearchRow = function (prompt, lastTime) {
        var id = "#P".concat(prompt.id);
        var time = (0, timeline_formatting_js_1.formatTime)(prompt.created_at_epoch);
        var icon = '\uD83D\uDCAC'; // Speech bubble emoji
        var title = prompt.prompt_text.length > 60
            ? prompt.prompt_text.substring(0, 57) + '...'
            : prompt.prompt_text;
        var timeDisplay = time === lastTime ? '"' : time;
        return {
            row: "| ".concat(id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title, " | - |"),
            time: time
        };
    };
    /**
     * Format observation as index row (with Work column)
     */
    ResultFormatter.prototype.formatObservationIndex = function (obs, _index) {
        var id = "#".concat(obs.id);
        var time = (0, timeline_formatting_js_1.formatTime)(obs.created_at_epoch);
        var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
        var title = obs.title || 'Untitled';
        var readTokens = this.estimateReadTokens(obs);
        var workEmoji = ModeManager_js_1.ModeManager.getInstance().getWorkEmoji(obs.type);
        var workTokens = obs.discovery_tokens || 0;
        var workDisplay = workTokens > 0 ? "".concat(workEmoji, " ").concat(workTokens) : '-';
        return "| ".concat(id, " | ").concat(time, " | ").concat(icon, " | ").concat(title, " | ~").concat(readTokens, " | ").concat(workDisplay, " |");
    };
    /**
     * Format session as index row
     */
    ResultFormatter.prototype.formatSessionIndex = function (session, _index) {
        var _a;
        var id = "#S".concat(session.id);
        var time = (0, timeline_formatting_js_1.formatTime)(session.created_at_epoch);
        var icon = '\uD83C\uDFAF';
        var title = session.request ||
            "Session ".concat(((_a = session.memory_session_id) === null || _a === void 0 ? void 0 : _a.substring(0, 8)) || 'unknown');
        return "| ".concat(id, " | ").concat(time, " | ").concat(icon, " | ").concat(title, " | - | - |");
    };
    /**
     * Format user prompt as index row
     */
    ResultFormatter.prototype.formatPromptIndex = function (prompt, _index) {
        var id = "#P".concat(prompt.id);
        var time = (0, timeline_formatting_js_1.formatTime)(prompt.created_at_epoch);
        var icon = '\uD83D\uDCAC';
        var title = prompt.prompt_text.length > 60
            ? prompt.prompt_text.substring(0, 57) + '...'
            : prompt.prompt_text;
        return "| ".concat(id, " | ").concat(time, " | ").concat(icon, " | ").concat(title, " | - | - |");
    };
    /**
     * Estimate read tokens for an observation
     */
    ResultFormatter.prototype.estimateReadTokens = function (obs) {
        var _a, _b, _c, _d;
        var size = (((_a = obs.title) === null || _a === void 0 ? void 0 : _a.length) || 0) +
            (((_b = obs.subtitle) === null || _b === void 0 ? void 0 : _b.length) || 0) +
            (((_c = obs.narrative) === null || _c === void 0 ? void 0 : _c.length) || 0) +
            (((_d = obs.facts) === null || _d === void 0 ? void 0 : _d.length) || 0);
        return Math.ceil(size / CHARS_PER_TOKEN_ESTIMATE);
    };
    /**
     * Format Chroma failure message
     */
    ResultFormatter.prototype.formatChromaFailureMessage = function () {
        return "Vector search failed - semantic search unavailable.\n\nTo enable semantic search:\n1. Install uv: https://docs.astral.sh/uv/getting-started/installation/\n2. Restart the worker: npm run worker:restart\n\nNote: You can still use filter-only searches (date ranges, types, files) without a query term.";
    };
    /**
     * Format search tips footer
     */
    ResultFormatter.prototype.formatSearchTips = function () {
        return "\n---\nSearch Strategy:\n1. Search with index to see titles, dates, IDs\n2. Use timeline to get context around interesting results\n3. Batch fetch full details: get_observations(ids=[...])\n\nTips:\n- Filter by type: obs_type=\"bugfix,feature\"\n- Filter by date: dateStart=\"2025-01-01\"\n- Sort: orderBy=\"date_desc\" or \"date_asc\"";
    };
    return ResultFormatter;
}());
exports.ResultFormatter = ResultFormatter;
