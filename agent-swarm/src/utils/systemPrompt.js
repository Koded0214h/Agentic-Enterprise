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
exports.asSystemPrompt = void 0;
exports.buildEffectiveSystemPrompt = buildEffectiveSystemPrompt;
var bun_bundle_1 = require("bun:bundle");
var index_js_1 = require("../services/analytics/index.js");
var loadAgentsDir_js_1 = require("../tools/AgentTool/loadAgentsDir.js");
var envUtils_js_1 = require("./envUtils.js");
var systemPromptType_js_1 = require("./systemPromptType.js");
var systemPromptType_js_2 = require("./systemPromptType.js");
Object.defineProperty(exports, "asSystemPrompt", { enumerable: true, get: function () { return systemPromptType_js_2.asSystemPrompt; } });
// Dead code elimination: conditional import for proactive mode.
// Same pattern as prompts.ts — lazy require to avoid pulling the module
// into non-proactive builds.
/* eslint-disable @typescript-eslint/no-require-imports */
var proactiveModule = (0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
    ? require('../proactive/index.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
function isProactiveActive_SAFE_TO_CALL_ANYWHERE() {
    var _a;
    return (_a = proactiveModule === null || proactiveModule === void 0 ? void 0 : proactiveModule.isProactiveActive()) !== null && _a !== void 0 ? _a : false;
}
/**
 * Builds the effective system prompt array based on priority:
 * 0. Override system prompt (if set, e.g., via loop mode - REPLACES all other prompts)
 * 1. Coordinator system prompt (if coordinator mode is active)
 * 2. Agent system prompt (if mainThreadAgentDefinition is set)
 *    - In proactive mode: agent prompt is APPENDED to default (agent adds domain
 *      instructions on top of the autonomous agent prompt, like teammates do)
 *    - Otherwise: agent prompt REPLACES default
 * 3. Custom system prompt (if specified via --system-prompt)
 * 4. Default system prompt (the standard Claude Code prompt)
 *
 * Plus appendSystemPrompt is always added at the end if specified (except when override is set).
 */
function buildEffectiveSystemPrompt(_a) {
    var mainThreadAgentDefinition = _a.mainThreadAgentDefinition, toolUseContext = _a.toolUseContext, customSystemPrompt = _a.customSystemPrompt, defaultSystemPrompt = _a.defaultSystemPrompt, appendSystemPrompt = _a.appendSystemPrompt, overrideSystemPrompt = _a.overrideSystemPrompt;
    if (overrideSystemPrompt) {
        return (0, systemPromptType_js_1.asSystemPrompt)([overrideSystemPrompt]);
    }
    // Coordinator mode: use coordinator prompt instead of default
    // Use inline env check instead of coordinatorModule to avoid circular
    // dependency issues during test module loading.
    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE') &&
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_COORDINATOR_MODE) &&
        !mainThreadAgentDefinition) {
        // Lazy require to avoid circular dependency at module load time
        var getCoordinatorSystemPrompt = 
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../coordinator/coordinatorMode.js').getCoordinatorSystemPrompt;
        return (0, systemPromptType_js_1.asSystemPrompt)(__spreadArray([
            getCoordinatorSystemPrompt()
        ], (appendSystemPrompt ? [appendSystemPrompt] : []), true));
    }
    var agentSystemPrompt = mainThreadAgentDefinition
        ? (0, loadAgentsDir_js_1.isBuiltInAgent)(mainThreadAgentDefinition)
            ? mainThreadAgentDefinition.getSystemPrompt({
                toolUseContext: { options: toolUseContext.options },
            })
            : mainThreadAgentDefinition.getSystemPrompt()
        : undefined;
    // Log agent memory loaded event for main loop agents
    if (mainThreadAgentDefinition === null || mainThreadAgentDefinition === void 0 ? void 0 : mainThreadAgentDefinition.memory) {
        (0, index_js_1.logEvent)('tengu_agent_memory_loaded', __assign(__assign({}, (process.env.USER_TYPE === 'ant' && {
            agent_type: mainThreadAgentDefinition.agentType,
        })), { scope: mainThreadAgentDefinition.memory, source: 'main-thread' }));
    }
    // In proactive mode, agent instructions are appended to the default prompt
    // rather than replacing it. The proactive default prompt is already lean
    // (autonomous agent identity + memory + env + proactive section), and agents
    // add domain-specific behavior on top — same pattern as teammates.
    if (agentSystemPrompt &&
        ((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) &&
        isProactiveActive_SAFE_TO_CALL_ANYWHERE()) {
        return (0, systemPromptType_js_1.asSystemPrompt)(__spreadArray(__spreadArray(__spreadArray([], defaultSystemPrompt, true), [
            "\n# Custom Agent Instructions\n".concat(agentSystemPrompt)
        ], false), (appendSystemPrompt ? [appendSystemPrompt] : []), true));
    }
    return (0, systemPromptType_js_1.asSystemPrompt)(__spreadArray(__spreadArray([], (agentSystemPrompt
        ? [agentSystemPrompt]
        : customSystemPrompt
            ? [customSystemPrompt]
            : defaultSystemPrompt), true), (appendSystemPrompt ? [appendSystemPrompt] : []), true));
}
