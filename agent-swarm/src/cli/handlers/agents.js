"use strict";
/**
 * Agents subcommand handler — prints the list of configured agents.
 * Dynamically imported only when `claude agents` runs.
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
exports.agentsHandler = agentsHandler;
var agentDisplay_js_1 = require("../../tools/AgentTool/agentDisplay.js");
var loadAgentsDir_js_1 = require("../../tools/AgentTool/loadAgentsDir.js");
var cwd_js_1 = require("../../utils/cwd.js");
function formatAgent(agent) {
    var model = (0, agentDisplay_js_1.resolveAgentModelDisplay)(agent);
    var parts = [agent.agentType];
    if (model) {
        parts.push(model);
    }
    if (agent.memory) {
        parts.push("".concat(agent.memory, " memory"));
    }
    return parts.join(' · ');
}
function agentsHandler() {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, allAgents, activeAgents, resolvedAgents, lines, totalActive, _loop_1, _i, AGENT_SOURCE_GROUPS_1, _a, label, source;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cwd = (0, cwd_js_1.getCwd)();
                    return [4 /*yield*/, (0, loadAgentsDir_js_1.getAgentDefinitionsWithOverrides)(cwd)];
                case 1:
                    allAgents = (_b.sent()).allAgents;
                    activeAgents = (0, loadAgentsDir_js_1.getActiveAgentsFromList)(allAgents);
                    resolvedAgents = (0, agentDisplay_js_1.resolveAgentOverrides)(allAgents, activeAgents);
                    lines = [];
                    totalActive = 0;
                    _loop_1 = function (label, source) {
                        var groupAgents = resolvedAgents
                            .filter(function (a) { return a.source === source; })
                            .sort(agentDisplay_js_1.compareAgentsByName);
                        if (groupAgents.length === 0)
                            return "continue";
                        lines.push("".concat(label, ":"));
                        for (var _c = 0, groupAgents_1 = groupAgents; _c < groupAgents_1.length; _c++) {
                            var agent = groupAgents_1[_c];
                            if (agent.overriddenBy) {
                                var winnerSource = (0, agentDisplay_js_1.getOverrideSourceLabel)(agent.overriddenBy);
                                lines.push("  (shadowed by ".concat(winnerSource, ") ").concat(formatAgent(agent)));
                            }
                            else {
                                lines.push("  ".concat(formatAgent(agent)));
                                totalActive++;
                            }
                        }
                        lines.push('');
                    };
                    for (_i = 0, AGENT_SOURCE_GROUPS_1 = agentDisplay_js_1.AGENT_SOURCE_GROUPS; _i < AGENT_SOURCE_GROUPS_1.length; _i++) {
                        _a = AGENT_SOURCE_GROUPS_1[_i], label = _a.label, source = _a.source;
                        _loop_1(label, source);
                    }
                    if (lines.length === 0) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log('No agents found.');
                    }
                    else {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log("".concat(totalActive, " active agents\n"));
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.log(lines.join('\n').trimEnd());
                    }
                    return [2 /*return*/];
            }
        });
    });
}
