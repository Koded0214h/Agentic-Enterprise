"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areExplorePlanAgentsEnabled = areExplorePlanAgentsEnabled;
exports.getBuiltInAgents = getBuiltInAgents;
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var claudeCodeGuideAgent_js_1 = require("./built-in/claudeCodeGuideAgent.js");
var exploreAgent_js_1 = require("./built-in/exploreAgent.js");
var generalPurposeAgent_js_1 = require("./built-in/generalPurposeAgent.js");
var planAgent_js_1 = require("./built-in/planAgent.js");
var statuslineSetup_js_1 = require("./built-in/statuslineSetup.js");
var verificationAgent_js_1 = require("./built-in/verificationAgent.js");
function areExplorePlanAgentsEnabled() {
    if ((0, bun_bundle_1.feature)('BUILTIN_EXPLORE_PLAN_AGENTS')) {
        // 3P default: true — Bedrock/Vertex keep agents enabled (matches pre-experiment
        // external behavior). A/B test treatment sets false to measure impact of removal.
        return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_amber_stoat', true);
    }
    return false;
}
function getBuiltInAgents() {
    // Allow disabling all built-in agents via env var (useful for SDK users who want a blank slate)
    // Only applies in noninteractive mode (SDK/API usage)
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS) &&
        (0, state_js_1.getIsNonInteractiveSession)()) {
        return [];
    }
    // Use lazy require inside the function body to avoid circular dependency
    // issues at module init time. The coordinatorMode module depends on tools
    // which depend on AgentTool which imports this file.
    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE')) {
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_COORDINATOR_MODE)) {
            /* eslint-disable @typescript-eslint/no-require-imports */
            var getCoordinatorAgents = require('../../coordinator/workerAgent.js').getCoordinatorAgents;
            /* eslint-enable @typescript-eslint/no-require-imports */
            return getCoordinatorAgents();
        }
    }
    var agents = [
        generalPurposeAgent_js_1.GENERAL_PURPOSE_AGENT,
        statuslineSetup_js_1.STATUSLINE_SETUP_AGENT,
    ];
    if (areExplorePlanAgentsEnabled()) {
        agents.push(exploreAgent_js_1.EXPLORE_AGENT, planAgent_js_1.PLAN_AGENT);
    }
    // Include Code Guide agent for non-SDK entrypoints
    var isNonSdkEntrypoint = process.env.CLAUDE_CODE_ENTRYPOINT !== 'sdk-ts' &&
        process.env.CLAUDE_CODE_ENTRYPOINT !== 'sdk-py' &&
        process.env.CLAUDE_CODE_ENTRYPOINT !== 'sdk-cli';
    if (isNonSdkEntrypoint) {
        agents.push(claudeCodeGuideAgent_js_1.CLAUDE_CODE_GUIDE_AGENT);
    }
    if ((0, bun_bundle_1.feature)('VERIFICATION_AGENT') &&
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_hive_evidence', false)) {
        agents.push(verificationAgent_js_1.VERIFICATION_AGENT);
    }
    return agents;
}
