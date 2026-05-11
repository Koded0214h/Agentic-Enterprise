"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSERVATION_TYPES = void 0;
exports.normalizeType = normalizeType;
exports.matchesType = matchesType;
exports.filterObservationsByType = filterObservationsByType;
exports.parseTypeString = parseTypeString;
/**
 * Valid observation types
 */
exports.OBSERVATION_TYPES = [
    'decision',
    'bugfix',
    'feature',
    'refactor',
    'discovery',
    'change'
];
/**
 * Normalize type filter value(s)
 */
function normalizeType(type) {
    if (!type) {
        return undefined;
    }
    var types = Array.isArray(type) ? type : [type];
    var normalized = types
        .map(function (t) { return t.trim().toLowerCase(); })
        .filter(function (t) { return exports.OBSERVATION_TYPES.includes(t); });
    return normalized.length > 0 ? normalized : undefined;
}
/**
 * Check if a result matches the type filter
 */
function matchesType(resultType, filterTypes) {
    if (!filterTypes || filterTypes.length === 0) {
        return true;
    }
    return filterTypes.includes(resultType);
}
/**
 * Filter observations by type
 */
function filterObservationsByType(observations, types) {
    if (!types || types.length === 0) {
        return observations;
    }
    return observations.filter(function (obs) { return matchesType(obs.type, types); });
}
/**
 * Parse comma-separated type string
 */
function parseTypeString(typeString) {
    return typeString
        .split(',')
        .map(function (t) { return t.trim().toLowerCase(); })
        .filter(function (t) { return exports.OBSERVATION_TYPES.includes(t); });
}
