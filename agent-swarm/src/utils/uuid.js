"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUuid = validateUuid;
exports.createAgentId = createAgentId;
var crypto_1 = require("crypto");
var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Validate uuid
 * @param maybeUUID The value to be checked if it is a uuid
 * @returns string as UUID or null if it is not valid
 */
function validateUuid(maybeUuid) {
    // UUID format: 8-4-4-4-12 hex digits
    if (typeof maybeUuid !== 'string')
        return null;
    return uuidRegex.test(maybeUuid) ? maybeUuid : null;
}
/**
 * Generate a new agent ID with prefix for consistency with task IDs.
 * Format: a{label-}{16 hex chars}
 * Example: aa3f2c1b4d5e6f7a8, acompact-a3f2c1b4d5e6f7a8
 */
function createAgentId(label) {
    var suffix = (0, crypto_1.randomBytes)(8).toString('hex');
    return (label ? "a".concat(label, "-").concat(suffix) : "a".concat(suffix));
}
