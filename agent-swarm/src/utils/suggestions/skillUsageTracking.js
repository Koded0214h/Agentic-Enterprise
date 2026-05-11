"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSkillUsage = recordSkillUsage;
exports.getSkillUsageScore = getSkillUsageScore;
var config_js_1 = require("../config.js");
var SKILL_USAGE_DEBOUNCE_MS = 60000;
// Process-lifetime debounce cache — avoids lock + read + parse on debounced
// calls. Same pattern as lastConfigStatTime / globalConfigWriteCount in config.ts.
var lastWriteBySkill = new Map();
/**
 * Records a skill usage for ranking purposes.
 * Updates both usage count and last used timestamp.
 */
function recordSkillUsage(skillName) {
    var now = Date.now();
    var lastWrite = lastWriteBySkill.get(skillName);
    // The ranking algorithm uses a 7-day half-life, so sub-minute granularity
    // is irrelevant. Bail out before saveGlobalConfig to avoid lock + file I/O.
    if (lastWrite !== undefined && now - lastWrite < SKILL_USAGE_DEBOUNCE_MS) {
        return;
    }
    lastWriteBySkill.set(skillName, now);
    (0, config_js_1.saveGlobalConfig)(function (current) {
        var _a;
        var _b, _c;
        var existing = (_b = current.skillUsage) === null || _b === void 0 ? void 0 : _b[skillName];
        return __assign(__assign({}, current), { skillUsage: __assign(__assign({}, current.skillUsage), (_a = {}, _a[skillName] = {
                usageCount: ((_c = existing === null || existing === void 0 ? void 0 : existing.usageCount) !== null && _c !== void 0 ? _c : 0) + 1,
                lastUsedAt: now,
            }, _a)) });
    });
}
/**
 * Calculates a usage score for a skill based on frequency and recency.
 * Higher scores indicate more frequently and recently used skills.
 *
 * The score uses exponential decay with a half-life of 7 days,
 * meaning usage from 7 days ago is worth half as much as usage today.
 */
function getSkillUsageScore(skillName) {
    var _a;
    var config = (0, config_js_1.getGlobalConfig)();
    var usage = (_a = config.skillUsage) === null || _a === void 0 ? void 0 : _a[skillName];
    if (!usage)
        return 0;
    // Recency decay: halve score every 7 days
    var daysSinceUse = (Date.now() - usage.lastUsedAt) / (1000 * 60 * 60 * 24);
    var recencyFactor = Math.pow(0.5, daysSinceUse / 7);
    // Minimum recency factor of 0.1 to avoid completely dropping old but heavily used skills
    return usage.usageCount * Math.max(recencyFactor, 0.1);
}
