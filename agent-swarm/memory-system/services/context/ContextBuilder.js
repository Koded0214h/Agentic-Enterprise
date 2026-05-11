"use strict";
/**
 * ContextBuilder - Main orchestrator for context generation
 *
 * Coordinates all context generation components to build the final output.
 * This is the primary entry point for context generation.
 */
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
exports.generateContext = generateContext;
var path_1 = require("path");
var fs_1 = require("fs");
var SessionStore_js_1 = require("../sqlite/SessionStore.js");
var logger_js_1 = require("../../utils/logger.js");
var project_name_js_1 = require("../../utils/project-name.js");
var paths_js_1 = require("../../shared/paths.js");
var ContextConfigLoader_js_1 = require("./ContextConfigLoader.js");
var TokenCalculator_js_1 = require("./TokenCalculator.js");
var ObservationCompiler_js_1 = require("./ObservationCompiler.js");
var HeaderRenderer_js_1 = require("./sections/HeaderRenderer.js");
var TimelineRenderer_js_1 = require("./sections/TimelineRenderer.js");
var SummaryRenderer_js_1 = require("./sections/SummaryRenderer.js");
var FooterRenderer_js_1 = require("./sections/FooterRenderer.js");
var MarkdownFormatter_js_1 = require("./formatters/MarkdownFormatter.js");
var ColorFormatter_js_1 = require("./formatters/ColorFormatter.js");
/** Matches BranchManager / npm lifecycle: ~/.claude/plugins/marketplaces/thedotmack/.install-version */
var INSTALL_VERSION_MARKER = path_1.default.join(paths_js_1.MARKETPLACE_ROOT, '.install-version');
/** Legacy location (pre-unified marker); remove during recovery so reinstall picks correct layout */
var LEGACY_INSTALL_VERSION_MARKER = path_1.default.join(paths_js_1.MARKETPLACE_ROOT, 'plugin', '.install-version');
function unlinkInstallVersionMarkers() {
    for (var _i = 0, _a = [INSTALL_VERSION_MARKER, LEGACY_INSTALL_VERSION_MARKER]; _i < _a.length; _i++) {
        var markerPath = _a[_i];
        try {
            (0, fs_1.unlinkSync)(markerPath);
        }
        catch (unlinkError) {
            logger_js_1.logger.debug('SYSTEM', 'Marker file cleanup failed (may not exist)', {}, unlinkError);
        }
    }
}
/**
 * Initialize database connection with error handling
 */
function initializeDatabase() {
    try {
        return new SessionStore_js_1.SessionStore();
    }
    catch (error) {
        if (error.code === 'ERR_DLOPEN_FAILED') {
            unlinkInstallVersionMarkers();
            logger_js_1.logger.error('SYSTEM', 'Native module rebuild needed - restart Claude Code to auto-fix');
            return null;
        }
        throw error;
    }
}
/**
 * Render empty state when no data exists
 */
function renderEmptyState(project, useColors) {
    return useColors ? (0, ColorFormatter_js_1.renderColorEmptyState)(project) : (0, MarkdownFormatter_js_1.renderMarkdownEmptyState)(project);
}
/**
 * Build context output from loaded data
 */
function buildContextOutput(project, observations, summaries, config, cwd, sessionId, useColors) {
    var output = [];
    // Calculate token economics
    var economics = (0, TokenCalculator_js_1.calculateTokenEconomics)(observations);
    // Render header section
    output.push.apply(output, (0, HeaderRenderer_js_1.renderHeader)(project, economics, config, useColors));
    // Prepare timeline data
    var displaySummaries = summaries.slice(0, config.sessionCount);
    var summariesForTimeline = (0, ObservationCompiler_js_1.prepareSummariesForTimeline)(displaySummaries, summaries);
    var timeline = (0, ObservationCompiler_js_1.buildTimeline)(observations, summariesForTimeline);
    var fullObservationIds = (0, ObservationCompiler_js_1.getFullObservationIds)(observations, config.fullObservationCount);
    // Render timeline
    output.push.apply(output, (0, TimelineRenderer_js_1.renderTimeline)(timeline, fullObservationIds, config, cwd, useColors));
    // Render most recent summary if applicable
    var mostRecentSummary = summaries[0];
    var mostRecentObservation = observations[0];
    if ((0, SummaryRenderer_js_1.shouldShowSummary)(config, mostRecentSummary, mostRecentObservation)) {
        output.push.apply(output, (0, SummaryRenderer_js_1.renderSummaryFields)(mostRecentSummary, useColors));
    }
    // Render previously section (prior assistant message)
    var priorMessages = (0, ObservationCompiler_js_1.getPriorSessionMessages)(observations, config, sessionId, cwd);
    output.push.apply(output, (0, FooterRenderer_js_1.renderPreviouslySection)(priorMessages, useColors));
    // Render footer
    output.push.apply(output, (0, FooterRenderer_js_1.renderFooter)(economics, config, useColors));
    return output.join('\n').trimEnd();
}
/**
 * Generate context for a project
 *
 * Main entry point for context generation. Orchestrates loading config,
 * querying data, and rendering the final context string.
 */
function generateContext(input_1) {
    return __awaiter(this, arguments, void 0, function (input, useColors) {
        var config, cwd, project, projects, db, observations, summaries, output;
        var _a;
        if (useColors === void 0) { useColors = false; }
        return __generator(this, function (_b) {
            config = (0, ContextConfigLoader_js_1.loadContextConfig)();
            cwd = (_a = input === null || input === void 0 ? void 0 : input.cwd) !== null && _a !== void 0 ? _a : process.cwd();
            project = (0, project_name_js_1.getProjectName)(cwd);
            projects = (input === null || input === void 0 ? void 0 : input.projects) || [project];
            // Full mode: fetch all observations but keep normal rendering (level 1 summaries)
            if (input === null || input === void 0 ? void 0 : input.full) {
                config.totalObservationCount = 999999;
                config.sessionCount = 999999;
            }
            db = initializeDatabase();
            if (!db) {
                return [2 /*return*/, ''];
            }
            try {
                observations = projects.length > 1
                    ? (0, ObservationCompiler_js_1.queryObservationsMulti)(db, projects, config)
                    : (0, ObservationCompiler_js_1.queryObservations)(db, project, config);
                summaries = projects.length > 1
                    ? (0, ObservationCompiler_js_1.querySummariesMulti)(db, projects, config)
                    : (0, ObservationCompiler_js_1.querySummaries)(db, project, config);
                // Handle empty state
                if (observations.length === 0 && summaries.length === 0) {
                    return [2 /*return*/, renderEmptyState(project, useColors)];
                }
                output = buildContextOutput(project, observations, summaries, config, cwd, input === null || input === void 0 ? void 0 : input.session_id, useColors);
                return [2 /*return*/, output];
            }
            finally {
                db.close();
            }
            return [2 /*return*/];
        });
    });
}
