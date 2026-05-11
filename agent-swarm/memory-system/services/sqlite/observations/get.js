"use strict";
/**
 * Observation retrieval functions
 * Extracted from SessionStore.ts for modular organization
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
exports.getObservationById = getObservationById;
exports.getObservationsByIds = getObservationsByIds;
exports.getObservationsForSession = getObservationsForSession;
/**
 * Get a single observation by ID
 */
function getObservationById(db, id) {
    var stmt = db.prepare("\n    SELECT *\n    FROM observations\n    WHERE id = ?\n  ");
    return stmt.get(id) || null;
}
/**
 * Get observations by array of IDs with ordering and limit
 */
function getObservationsByIds(db, ids, options) {
    if (options === void 0) { options = {}; }
    if (ids.length === 0)
        return [];
    var _a = options.orderBy, orderBy = _a === void 0 ? 'date_desc' : _a, limit = options.limit, project = options.project, type = options.type, concepts = options.concepts, files = options.files;
    var orderClause = orderBy === 'date_asc' ? 'ASC' : 'DESC';
    var limitClause = limit ? "LIMIT ".concat(limit) : '';
    // Build placeholders for IN clause
    var placeholders = ids.map(function () { return '?'; }).join(',');
    var params = __spreadArray([], ids, true);
    var additionalConditions = [];
    // Apply project filter
    if (project) {
        additionalConditions.push('project = ?');
        params.push(project);
    }
    // Apply type filter
    if (type) {
        if (Array.isArray(type)) {
            var typePlaceholders = type.map(function () { return '?'; }).join(',');
            additionalConditions.push("type IN (".concat(typePlaceholders, ")"));
            params.push.apply(params, type);
        }
        else {
            additionalConditions.push('type = ?');
            params.push(type);
        }
    }
    // Apply concepts filter
    if (concepts) {
        var conceptsList = Array.isArray(concepts) ? concepts : [concepts];
        var conceptConditions = conceptsList.map(function () {
            return 'EXISTS (SELECT 1 FROM json_each(concepts) WHERE value = ?)';
        });
        params.push.apply(params, conceptsList);
        additionalConditions.push("(".concat(conceptConditions.join(' OR '), ")"));
    }
    // Apply files filter
    if (files) {
        var filesList = Array.isArray(files) ? files : [files];
        var fileConditions = filesList.map(function () {
            return '(EXISTS (SELECT 1 FROM json_each(files_read) WHERE value LIKE ?) OR EXISTS (SELECT 1 FROM json_each(files_modified) WHERE value LIKE ?))';
        });
        filesList.forEach(function (file) {
            params.push("%".concat(file, "%"), "%".concat(file, "%"));
        });
        additionalConditions.push("(".concat(fileConditions.join(' OR '), ")"));
    }
    var whereClause = additionalConditions.length > 0
        ? "WHERE id IN (".concat(placeholders, ") AND ").concat(additionalConditions.join(' AND '))
        : "WHERE id IN (".concat(placeholders, ")");
    var stmt = db.prepare("\n    SELECT *\n    FROM observations\n    ".concat(whereClause, "\n    ORDER BY created_at_epoch ").concat(orderClause, "\n    ").concat(limitClause, "\n  "));
    return stmt.all.apply(stmt, params);
}
/**
 * Get observations for a specific session
 */
function getObservationsForSession(db, memorySessionId) {
    var stmt = db.prepare("\n    SELECT title, subtitle, type, prompt_number\n    FROM observations\n    WHERE memory_session_id = ?\n    ORDER BY created_at_epoch ASC\n  ");
    return stmt.all(memorySessionId);
}
