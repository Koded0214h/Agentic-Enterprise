"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQueryConfig = buildQueryConfig;
var state_js_1 = require("../bootstrap/state.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var envUtils_js_1 = require("../utils/envUtils.js");
function buildQueryConfig() {
    return {
        sessionId: (0, state_js_1.getSessionId)(),
        gates: {
            streamingToolExecution: (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_streaming_tool_execution2'),
            emitToolUseSummaries: (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EMIT_TOOL_USE_SUMMARIES),
            isAnt: process.env.USER_TYPE === 'ant',
            // Inlined from fastMode.ts to avoid pulling its heavy module graph
            // (axios, settings, auth, model, oauth, config) into test shards that
            // didn't previously load it — changes init order and breaks unrelated tests.
            fastModeEnabled: !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_FAST_MODE),
        },
    };
}
