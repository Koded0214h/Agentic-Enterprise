"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPillLabel = getPillLabel;
exports.pillNeedsCta = pillNeedsCta;
var figures_js_1 = require("../constants/figures.js");
var array_js_1 = require("../utils/array.js");
/**
 * Produces the compact footer-pill label for a set of background tasks.
 * Used by both the footer pill and the turn-duration transcript line so the
 * two surfaces agree on terminology.
 */
function getPillLabel(tasks) {
    var n = tasks.length;
    var allSameType = tasks.every(function (t) { return t.type === tasks[0].type; });
    if (allSameType) {
        switch (tasks[0].type) {
            case 'local_bash': {
                var monitors = (0, array_js_1.count)(tasks, function (t) { return t.type === 'local_bash' && t.kind === 'monitor'; });
                var shells = n - monitors;
                var parts = [];
                if (shells > 0)
                    parts.push(shells === 1 ? '1 shell' : "".concat(shells, " shells"));
                if (monitors > 0)
                    parts.push(monitors === 1 ? '1 monitor' : "".concat(monitors, " monitors"));
                return parts.join(', ');
            }
            case 'in_process_teammate': {
                var teamCount = new Set(tasks.map(function (t) {
                    return t.type === 'in_process_teammate' ? t.identity.teamName : '';
                })).size;
                return teamCount === 1 ? '1 team' : "".concat(teamCount, " teams");
            }
            case 'local_agent':
                return n === 1 ? '1 local agent' : "".concat(n, " local agents");
            case 'remote_agent': {
                var first = tasks[0];
                // Per design mockup: ◇ open diamond while running/needs-input,
                // ◆ filled once ExitPlanMode is awaiting approval.
                if (n === 1 && first.type === 'remote_agent' && first.isUltraplan) {
                    switch (first.ultraplanPhase) {
                        case 'plan_ready':
                            return "".concat(figures_js_1.DIAMOND_FILLED, " ultraplan ready");
                        case 'needs_input':
                            return "".concat(figures_js_1.DIAMOND_OPEN, " ultraplan needs your input");
                        default:
                            return "".concat(figures_js_1.DIAMOND_OPEN, " ultraplan");
                    }
                }
                return n === 1
                    ? "".concat(figures_js_1.DIAMOND_OPEN, " 1 cloud session")
                    : "".concat(figures_js_1.DIAMOND_OPEN, " ").concat(n, " cloud sessions");
            }
            case 'local_workflow':
                return n === 1 ? '1 background workflow' : "".concat(n, " background workflows");
            case 'monitor_mcp':
                return n === 1 ? '1 monitor' : "".concat(n, " monitors");
            case 'dream':
                return 'dreaming';
        }
    }
    return "".concat(n, " background ").concat(n === 1 ? 'task' : 'tasks');
}
/**
 * True when the pill should show the dimmed " · ↓ to view" call-to-action.
 * Per the state diagram: only the two attention states (needs_input,
 * plan_ready) surface the CTA; plain running shows just the diamond + label.
 */
function pillNeedsCta(tasks) {
    if (tasks.length !== 1)
        return false;
    var t = tasks[0];
    return (t.type === 'remote_agent' &&
        t.isUltraplan === true &&
        t.ultraplanPhase !== undefined);
}
