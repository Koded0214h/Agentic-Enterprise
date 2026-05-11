"use strict";
/**
 * ObservationCompiler - Query building and data retrieval for context
 *
 * Handles database queries for observations and summaries, plus transcript extraction.
 */
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
exports.queryObservations = queryObservations;
exports.querySummaries = querySummaries;
exports.queryObservationsMulti = queryObservationsMulti;
exports.querySummariesMulti = querySummariesMulti;
exports.extractPriorMessages = extractPriorMessages;
exports.getPriorSessionMessages = getPriorSessionMessages;
exports.prepareSummariesForTimeline = prepareSummariesForTimeline;
exports.buildTimeline = buildTimeline;
exports.getFullObservationIds = getFullObservationIds;
var path_1 = require("path");
var fs_1 = require("fs");
var logger_js_1 = require("../../utils/logger.js");
var paths_js_1 = require("../../shared/paths.js");
var types_js_1 = require("./types.js");
/**
 * Query observations from database with type and concept filtering
 */
function queryObservations(db, project, config) {
    var _a;
    var typeArray = Array.from(config.observationTypes);
    var typePlaceholders = typeArray.map(function () { return '?'; }).join(',');
    var conceptArray = Array.from(config.observationConcepts);
    var conceptPlaceholders = conceptArray.map(function () { return '?'; }).join(',');
    return (_a = db.db.prepare("\n    SELECT\n      id, memory_session_id, type, title, subtitle, narrative,\n      facts, concepts, files_read, files_modified, discovery_tokens,\n      created_at, created_at_epoch\n    FROM observations\n    WHERE project = ?\n      AND type IN (".concat(typePlaceholders, ")\n      AND EXISTS (\n        SELECT 1 FROM json_each(concepts)\n        WHERE value IN (").concat(conceptPlaceholders, ")\n      )\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  "))).all.apply(_a, __spreadArray(__spreadArray(__spreadArray([project], typeArray, false), conceptArray, false), [config.totalObservationCount], false));
}
/**
 * Query recent session summaries from database
 */
function querySummaries(db, project, config) {
    return db.db.prepare("\n    SELECT id, memory_session_id, request, investigated, learned, completed, next_steps, created_at, created_at_epoch\n    FROM session_summaries\n    WHERE project = ?\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  ").all(project, config.sessionCount + types_js_1.SUMMARY_LOOKAHEAD);
}
/**
 * Query observations from multiple projects (for worktree support)
 *
 * Returns observations from all specified projects, interleaved chronologically.
 * Used when running in a worktree to show both parent repo and worktree observations.
 */
function queryObservationsMulti(db, projects, config) {
    var _a;
    var typeArray = Array.from(config.observationTypes);
    var typePlaceholders = typeArray.map(function () { return '?'; }).join(',');
    var conceptArray = Array.from(config.observationConcepts);
    var conceptPlaceholders = conceptArray.map(function () { return '?'; }).join(',');
    // Build IN clause for projects
    var projectPlaceholders = projects.map(function () { return '?'; }).join(',');
    return (_a = db.db.prepare("\n    SELECT\n      id, memory_session_id, type, title, subtitle, narrative,\n      facts, concepts, files_read, files_modified, discovery_tokens,\n      created_at, created_at_epoch, project\n    FROM observations\n    WHERE project IN (".concat(projectPlaceholders, ")\n      AND type IN (").concat(typePlaceholders, ")\n      AND EXISTS (\n        SELECT 1 FROM json_each(concepts)\n        WHERE value IN (").concat(conceptPlaceholders, ")\n      )\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  "))).all.apply(_a, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], projects, false), typeArray, false), conceptArray, false), [config.totalObservationCount], false));
}
/**
 * Query session summaries from multiple projects (for worktree support)
 *
 * Returns summaries from all specified projects, interleaved chronologically.
 * Used when running in a worktree to show both parent repo and worktree summaries.
 */
function querySummariesMulti(db, projects, config) {
    var _a;
    // Build IN clause for projects
    var projectPlaceholders = projects.map(function () { return '?'; }).join(',');
    return (_a = db.db.prepare("\n    SELECT id, memory_session_id, request, investigated, learned, completed, next_steps, created_at, created_at_epoch, project\n    FROM session_summaries\n    WHERE project IN (".concat(projectPlaceholders, ")\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  "))).all.apply(_a, __spreadArray(__spreadArray([], projects, false), [config.sessionCount + types_js_1.SUMMARY_LOOKAHEAD], false));
}
/**
 * Convert cwd path to dashed format for transcript lookup
 */
function cwdToDashed(cwd) {
    return cwd.replace(/\//g, '-');
}
/**
 * Extract prior messages from transcript file
 */
function extractPriorMessages(transcriptPath) {
    var _a;
    try {
        if (!(0, fs_1.existsSync)(transcriptPath)) {
            return { userMessage: '', assistantMessage: '' };
        }
        var content = (0, fs_1.readFileSync)(transcriptPath, 'utf-8').trim();
        if (!content) {
            return { userMessage: '', assistantMessage: '' };
        }
        var lines = content.split('\n').filter(function (line) { return line.trim(); });
        var lastAssistantMessage = '';
        for (var i = lines.length - 1; i >= 0; i--) {
            try {
                var line = lines[i];
                if (!line.includes('"type":"assistant"')) {
                    continue;
                }
                var entry = JSON.parse(line);
                if (entry.type === 'assistant' && ((_a = entry.message) === null || _a === void 0 ? void 0 : _a.content) && Array.isArray(entry.message.content)) {
                    var text = '';
                    for (var _i = 0, _b = entry.message.content; _i < _b.length; _i++) {
                        var block = _b[_i];
                        if (block.type === 'text') {
                            text += block.text;
                        }
                    }
                    text = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '').trim();
                    if (text) {
                        lastAssistantMessage = text;
                        break;
                    }
                }
            }
            catch (parseError) {
                logger_js_1.logger.debug('PARSER', 'Skipping malformed transcript line', { lineIndex: i }, parseError);
                continue;
            }
        }
        return { userMessage: '', assistantMessage: lastAssistantMessage };
    }
    catch (error) {
        logger_js_1.logger.failure('WORKER', "Failed to extract prior messages from transcript", { transcriptPath: transcriptPath }, error);
        return { userMessage: '', assistantMessage: '' };
    }
}
/**
 * Get prior session messages if enabled
 */
function getPriorSessionMessages(observations, config, currentSessionId, cwd) {
    if (!config.showLastMessage || observations.length === 0) {
        return { userMessage: '', assistantMessage: '' };
    }
    var priorSessionObs = observations.find(function (obs) { return obs.memory_session_id !== currentSessionId; });
    if (!priorSessionObs) {
        return { userMessage: '', assistantMessage: '' };
    }
    var priorSessionId = priorSessionObs.memory_session_id;
    var dashedCwd = cwdToDashed(cwd);
    // Use CLAUDE_CONFIG_DIR to support custom Claude config directories
    var transcriptPath = path_1.default.join(paths_js_1.CLAUDE_CONFIG_DIR, 'projects', dashedCwd, "".concat(priorSessionId, ".jsonl"));
    return extractPriorMessages(transcriptPath);
}
/**
 * Prepare summaries for timeline display
 */
function prepareSummariesForTimeline(displaySummaries, allSummaries) {
    var _a;
    var mostRecentSummaryId = (_a = allSummaries[0]) === null || _a === void 0 ? void 0 : _a.id;
    return displaySummaries.map(function (summary, i) {
        var olderSummary = i === 0 ? null : allSummaries[i + 1];
        return __assign(__assign({}, summary), { displayEpoch: olderSummary ? olderSummary.created_at_epoch : summary.created_at_epoch, displayTime: olderSummary ? olderSummary.created_at : summary.created_at, shouldShowLink: summary.id !== mostRecentSummaryId });
    });
}
/**
 * Build unified timeline from observations and summaries
 */
function buildTimeline(observations, summaries) {
    var timeline = __spreadArray(__spreadArray([], observations.map(function (obs) { return ({ type: 'observation', data: obs }); }), true), summaries.map(function (summary) { return ({ type: 'summary', data: summary }); }), true);
    // Sort chronologically
    timeline.sort(function (a, b) {
        var aEpoch = a.type === 'observation' ? a.data.created_at_epoch : a.data.displayEpoch;
        var bEpoch = b.type === 'observation' ? b.data.created_at_epoch : b.data.displayEpoch;
        return aEpoch - bEpoch;
    });
    return timeline;
}
/**
 * Get set of observation IDs that should show full details
 */
function getFullObservationIds(observations, count) {
    return new Set(observations
        .slice(0, count)
        .map(function (obs) { return obs.id; }));
}
