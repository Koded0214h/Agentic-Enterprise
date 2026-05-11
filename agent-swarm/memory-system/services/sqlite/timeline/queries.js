"use strict";
/**
 * Timeline query functions
 * Provides time-based context queries for observations, sessions, and prompts
 *
 * grep-friendly: getTimelineAroundTimestamp, getTimelineAroundObservation, getAllProjects
 */
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
exports.getTimelineAroundTimestamp = getTimelineAroundTimestamp;
exports.getTimelineAroundObservation = getTimelineAroundObservation;
exports.getAllProjects = getAllProjects;
var logger_js_1 = require("../../../utils/logger.js");
/**
 * Get timeline around a specific timestamp
 * Convenience wrapper that delegates to getTimelineAroundObservation with null anchor
 *
 * @param db Database connection
 * @param anchorEpoch Epoch timestamp to anchor the query around
 * @param depthBefore Number of records to retrieve before anchor (any type)
 * @param depthAfter Number of records to retrieve after anchor (any type)
 * @param project Optional project filter
 * @returns Object containing observations, sessions, and prompts for the specified window
 */
function getTimelineAroundTimestamp(db, anchorEpoch, depthBefore, depthAfter, project) {
    if (depthBefore === void 0) { depthBefore = 10; }
    if (depthAfter === void 0) { depthAfter = 10; }
    return getTimelineAroundObservation(db, null, anchorEpoch, depthBefore, depthAfter, project);
}
/**
 * Get timeline around a specific observation ID
 * Uses observation ID offsets to determine time boundaries, then fetches all record types in that window
 *
 * @param db Database connection
 * @param anchorObservationId Observation ID to anchor around (null for timestamp-based)
 * @param anchorEpoch Epoch timestamp fallback or anchor for timestamp-based queries
 * @param depthBefore Number of records to retrieve before anchor
 * @param depthAfter Number of records to retrieve after anchor
 * @param project Optional project filter
 * @returns Object containing observations, sessions, and prompts for the specified window
 */
function getTimelineAroundObservation(db, anchorObservationId, anchorEpoch, depthBefore, depthAfter, project) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (depthBefore === void 0) { depthBefore = 10; }
    if (depthAfter === void 0) { depthAfter = 10; }
    var projectFilter = project ? 'AND project = ?' : '';
    var projectParams = project ? [project] : [];
    var startEpoch;
    var endEpoch;
    if (anchorObservationId !== null) {
        // Get boundary observations by ID offset
        var beforeQuery = "\n      SELECT id, created_at_epoch\n      FROM observations\n      WHERE id <= ? ".concat(projectFilter, "\n      ORDER BY id DESC\n      LIMIT ?\n    ");
        var afterQuery = "\n      SELECT id, created_at_epoch\n      FROM observations\n      WHERE id >= ? ".concat(projectFilter, "\n      ORDER BY id ASC\n      LIMIT ?\n    ");
        try {
            var beforeRecords = (_a = db.prepare(beforeQuery)).all.apply(_a, __spreadArray(__spreadArray([anchorObservationId], projectParams, false), [depthBefore + 1], false));
            var afterRecords = (_b = db.prepare(afterQuery)).all.apply(_b, __spreadArray(__spreadArray([anchorObservationId], projectParams, false), [depthAfter + 1], false));
            // Get the earliest and latest timestamps from boundary observations
            if (beforeRecords.length === 0 && afterRecords.length === 0) {
                return { observations: [], sessions: [], prompts: [] };
            }
            startEpoch = beforeRecords.length > 0 ? beforeRecords[beforeRecords.length - 1].created_at_epoch : anchorEpoch;
            endEpoch = afterRecords.length > 0 ? afterRecords[afterRecords.length - 1].created_at_epoch : anchorEpoch;
        }
        catch (err) {
            logger_js_1.logger.error('DB', 'Error getting boundary observations', undefined, { error: err, project: project });
            return { observations: [], sessions: [], prompts: [] };
        }
    }
    else {
        // For timestamp-based anchors, use time-based boundaries
        // Get observations to find the time window
        var beforeQuery = "\n      SELECT created_at_epoch\n      FROM observations\n      WHERE created_at_epoch <= ? ".concat(projectFilter, "\n      ORDER BY created_at_epoch DESC\n      LIMIT ?\n    ");
        var afterQuery = "\n      SELECT created_at_epoch\n      FROM observations\n      WHERE created_at_epoch >= ? ".concat(projectFilter, "\n      ORDER BY created_at_epoch ASC\n      LIMIT ?\n    ");
        try {
            var beforeRecords = (_c = db.prepare(beforeQuery)).all.apply(_c, __spreadArray(__spreadArray([anchorEpoch], projectParams, false), [depthBefore], false));
            var afterRecords = (_d = db.prepare(afterQuery)).all.apply(_d, __spreadArray(__spreadArray([anchorEpoch], projectParams, false), [depthAfter + 1], false));
            if (beforeRecords.length === 0 && afterRecords.length === 0) {
                return { observations: [], sessions: [], prompts: [] };
            }
            startEpoch = beforeRecords.length > 0 ? beforeRecords[beforeRecords.length - 1].created_at_epoch : anchorEpoch;
            endEpoch = afterRecords.length > 0 ? afterRecords[afterRecords.length - 1].created_at_epoch : anchorEpoch;
        }
        catch (err) {
            logger_js_1.logger.error('DB', 'Error getting boundary timestamps', undefined, { error: err, project: project });
            return { observations: [], sessions: [], prompts: [] };
        }
    }
    // Now query ALL record types within the time window
    var obsQuery = "\n    SELECT *\n    FROM observations\n    WHERE created_at_epoch >= ? AND created_at_epoch <= ? ".concat(projectFilter, "\n    ORDER BY created_at_epoch ASC\n  ");
    var sessQuery = "\n    SELECT *\n    FROM session_summaries\n    WHERE created_at_epoch >= ? AND created_at_epoch <= ? ".concat(projectFilter, "\n    ORDER BY created_at_epoch ASC\n  ");
    var promptQuery = "\n    SELECT up.*, s.project, s.memory_session_id\n    FROM user_prompts up\n    JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n    WHERE up.created_at_epoch >= ? AND up.created_at_epoch <= ? ".concat(projectFilter.replace('project', 's.project'), "\n    ORDER BY up.created_at_epoch ASC\n  ");
    var observations = (_e = db.prepare(obsQuery)).all.apply(_e, __spreadArray([startEpoch, endEpoch], projectParams, false));
    var sessions = (_f = db.prepare(sessQuery)).all.apply(_f, __spreadArray([startEpoch, endEpoch], projectParams, false));
    var prompts = (_g = db.prepare(promptQuery)).all.apply(_g, __spreadArray([startEpoch, endEpoch], projectParams, false));
    return {
        observations: observations,
        sessions: sessions.map(function (s) { return ({
            id: s.id,
            memory_session_id: s.memory_session_id,
            project: s.project,
            request: s.request,
            completed: s.completed,
            next_steps: s.next_steps,
            created_at: s.created_at,
            created_at_epoch: s.created_at_epoch
        }); }),
        prompts: prompts.map(function (p) { return ({
            id: p.id,
            content_session_id: p.content_session_id,
            prompt_number: p.prompt_number,
            prompt_text: p.prompt_text,
            project: p.project,
            created_at: p.created_at,
            created_at_epoch: p.created_at_epoch
        }); })
    };
}
/**
 * Get all unique projects from the database (for web UI project filter)
 *
 * @param db Database connection
 * @returns Array of unique project names
 */
function getAllProjects(db) {
    var stmt = db.prepare("\n    SELECT DISTINCT project\n    FROM sdk_sessions\n    WHERE project IS NOT NULL AND project != ''\n    ORDER BY project ASC\n  ");
    var rows = stmt.all();
    return rows.map(function (row) { return row.project; });
}
