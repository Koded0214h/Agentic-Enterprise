"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADVISOR_TOOL_INSTRUCTIONS = void 0;
exports.isAdvisorBlock = isAdvisorBlock;
exports.isAdvisorEnabled = isAdvisorEnabled;
exports.canUserConfigureAdvisor = canUserConfigureAdvisor;
exports.getExperimentAdvisorModels = getExperimentAdvisorModels;
exports.modelSupportsAdvisor = modelSupportsAdvisor;
exports.isValidAdvisorModel = isValidAdvisorModel;
exports.getInitialAdvisorSetting = getInitialAdvisorSetting;
exports.getAdvisorUsage = getAdvisorUsage;
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var betas_js_1 = require("./betas.js");
var envUtils_js_1 = require("./envUtils.js");
var settings_js_1 = require("./settings/settings.js");
function isAdvisorBlock(param) {
    return (param.type === 'advisor_tool_result' ||
        (param.type === 'server_tool_use' && param.name === 'advisor'));
}
function getAdvisorConfig() {
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_sage_compass', {});
}
function isAdvisorEnabled() {
    var _a;
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_ADVISOR_TOOL)) {
        return false;
    }
    // The advisor beta header is first-party only (Bedrock/Vertex 400 on it).
    if (!(0, betas_js_1.shouldIncludeFirstPartyOnlyBetas)()) {
        return false;
    }
    return (_a = getAdvisorConfig().enabled) !== null && _a !== void 0 ? _a : false;
}
function canUserConfigureAdvisor() {
    var _a;
    return isAdvisorEnabled() && ((_a = getAdvisorConfig().canUserConfigure) !== null && _a !== void 0 ? _a : false);
}
function getExperimentAdvisorModels() {
    var config = getAdvisorConfig();
    return isAdvisorEnabled() &&
        !canUserConfigureAdvisor() &&
        config.baseModel &&
        config.advisorModel
        ? { baseModel: config.baseModel, advisorModel: config.advisorModel }
        : undefined;
}
// @[MODEL LAUNCH]: Add the new model if it supports the advisor tool.
// Checks whether the main loop model supports calling the advisor tool.
function modelSupportsAdvisor(model) {
    var m = model.toLowerCase();
    return (m.includes('opus-4-6') ||
        m.includes('sonnet-4-6') ||
        process.env.USER_TYPE === 'ant');
}
// @[MODEL LAUNCH]: Add the new model if it can serve as an advisor model.
function isValidAdvisorModel(model) {
    var m = model.toLowerCase();
    return (m.includes('opus-4-6') ||
        m.includes('sonnet-4-6') ||
        process.env.USER_TYPE === 'ant');
}
function getInitialAdvisorSetting() {
    if (!isAdvisorEnabled()) {
        return undefined;
    }
    return (0, settings_js_1.getInitialSettings)().advisorModel;
}
function getAdvisorUsage(usage) {
    var iterations = usage.iterations;
    if (!iterations) {
        return [];
    }
    return iterations.filter(function (it) { return it.type === 'advisor_message'; });
}
exports.ADVISOR_TOOL_INSTRUCTIONS = "# Advisor Tool\n\nYou have access to an `advisor` tool backed by a stronger reviewer model. It takes NO parameters -- when you call it, your entire conversation history is automatically forwarded. The advisor sees the task, every tool call you've made, every result you've seen.\n\nCall advisor BEFORE substantive work -- before writing code, before committing to an interpretation, before building on an assumption. If the task requires orientation first (finding files, reading code, seeing what's there), do that, then call advisor. Orientation is not substantive work. Writing, editing, and declaring an answer are.\n\nAlso call advisor:\n- When you believe the task is complete. BEFORE this call, make your deliverable durable: write the file, stage the change, save the result. The advisor call takes time; if the session ends during it, a durable result persists and an unwritten one doesn't.\n- When stuck -- errors recurring, approach not converging, results that don't fit.\n- When considering a change of approach.\n\nOn tasks longer than a few steps, call advisor at least once before committing to an approach and once before declaring done. On short reactive tasks where the next action is dictated by tool output you just read, you don't need to keep calling -- the advisor adds most of its value on the first call, before the approach crystallizes.\n\nGive the advice serious weight. If you follow a step and it fails empirically, or you have primary-source evidence that contradicts a specific claim (the file says X, the code does Y), adapt. A passing self-test is not evidence the advice is wrong -- it's evidence your test doesn't check what the advice is checking.\n\nIf you've already retrieved data pointing one way and the advisor points another: don't silently switch. Surface the conflict in one more advisor call -- \"I found X, you suggest Y, which constraint breaks the tie?\" The advisor saw your evidence but may have underweighted it; a reconcile call is cheaper than committing to the wrong branch.";
