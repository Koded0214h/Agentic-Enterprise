"use strict";
/**
 * Pure permission type definitions extracted to break import cycles.
 *
 * This file contains only type definitions and constants with no runtime dependencies.
 * Implementation files remain in src/utils/permissions/ but can now import from here
 * to avoid circular dependencies.
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
exports.PERMISSION_MODES = exports.INTERNAL_PERMISSION_MODES = exports.EXTERNAL_PERMISSION_MODES = void 0;
var bun_bundle_1 = require("bun:bundle");
// ============================================================================
// Permission Modes
// ============================================================================
exports.EXTERNAL_PERMISSION_MODES = [
    'acceptEdits',
    'bypassPermissions',
    'default',
    'dontAsk',
    'plan',
];
// Runtime validation set: modes that are user-addressable (settings.json
// defaultMode, --permission-mode CLI flag, conversation recovery).
exports.INTERNAL_PERMISSION_MODES = __spreadArray(__spreadArray([], exports.EXTERNAL_PERMISSION_MODES, true), ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') ? ['auto'] : []), true);
exports.PERMISSION_MODES = exports.INTERNAL_PERMISSION_MODES;
