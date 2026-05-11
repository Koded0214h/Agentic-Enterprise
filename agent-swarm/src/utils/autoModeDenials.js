"use strict";
/**
 * Tracks commands recently denied by the auto mode classifier.
 * Populated from useCanUseTool.ts, read from RecentDenialsTab.tsx in /permissions.
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
exports.recordAutoModeDenial = recordAutoModeDenial;
exports.getAutoModeDenials = getAutoModeDenials;
var bun_bundle_1 = require("bun:bundle");
var DENIALS = [];
var MAX_DENIALS = 20;
function recordAutoModeDenial(denial) {
    if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER'))
        return;
    DENIALS = __spreadArray([denial], DENIALS.slice(0, MAX_DENIALS - 1), true);
}
function getAutoModeDenials() {
    return DENIALS;
}
