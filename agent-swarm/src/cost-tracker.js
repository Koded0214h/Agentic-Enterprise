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
exports.getUsageForModel = exports.getModelUsage = exports.setHasUnknownModelCost = exports.resetCostState = exports.resetStateForTests = exports.hasUnknownModelCost = exports.getTotalWebSearchRequests = exports.getTotalCacheCreationInputTokens = exports.getTotalCacheReadInputTokens = exports.getTotalOutputTokens = exports.getTotalInputTokens = exports.getTotalLinesRemoved = exports.getTotalLinesAdded = exports.addToTotalLinesChanged = exports.getTotalAPIDurationWithoutRetries = exports.getTotalAPIDuration = exports.getTotalDuration = exports.getTotalCost = void 0;
exports.formatCost = formatCost;
exports.getStoredSessionCosts = getStoredSessionCosts;
exports.restoreCostStateForSession = restoreCostStateForSession;
exports.saveCurrentSessionCosts = saveCurrentSessionCosts;
exports.formatTotalCost = formatTotalCost;
exports.addToTotalSessionCost = addToTotalSessionCost;
var chalk_1 = require("chalk");
var state_js_1 = require("./bootstrap/state.js");
Object.defineProperty(exports, "addToTotalLinesChanged", { enumerable: true, get: function () { return state_js_1.addToTotalLinesChanged; } });
Object.defineProperty(exports, "getModelUsage", { enumerable: true, get: function () { return state_js_1.getModelUsage; } });
Object.defineProperty(exports, "getTotalAPIDuration", { enumerable: true, get: function () { return state_js_1.getTotalAPIDuration; } });
Object.defineProperty(exports, "getTotalAPIDurationWithoutRetries", { enumerable: true, get: function () { return state_js_1.getTotalAPIDurationWithoutRetries; } });
Object.defineProperty(exports, "getTotalCacheCreationInputTokens", { enumerable: true, get: function () { return state_js_1.getTotalCacheCreationInputTokens; } });
Object.defineProperty(exports, "getTotalCacheReadInputTokens", { enumerable: true, get: function () { return state_js_1.getTotalCacheReadInputTokens; } });
Object.defineProperty(exports, "getTotalCost", { enumerable: true, get: function () { return state_js_1.getTotalCostUSD; } });
Object.defineProperty(exports, "getTotalDuration", { enumerable: true, get: function () { return state_js_1.getTotalDuration; } });
Object.defineProperty(exports, "getTotalInputTokens", { enumerable: true, get: function () { return state_js_1.getTotalInputTokens; } });
Object.defineProperty(exports, "getTotalLinesAdded", { enumerable: true, get: function () { return state_js_1.getTotalLinesAdded; } });
Object.defineProperty(exports, "getTotalLinesRemoved", { enumerable: true, get: function () { return state_js_1.getTotalLinesRemoved; } });
Object.defineProperty(exports, "getTotalOutputTokens", { enumerable: true, get: function () { return state_js_1.getTotalOutputTokens; } });
Object.defineProperty(exports, "getTotalWebSearchRequests", { enumerable: true, get: function () { return state_js_1.getTotalWebSearchRequests; } });
Object.defineProperty(exports, "getUsageForModel", { enumerable: true, get: function () { return state_js_1.getUsageForModel; } });
Object.defineProperty(exports, "hasUnknownModelCost", { enumerable: true, get: function () { return state_js_1.hasUnknownModelCost; } });
Object.defineProperty(exports, "resetCostState", { enumerable: true, get: function () { return state_js_1.resetCostState; } });
Object.defineProperty(exports, "resetStateForTests", { enumerable: true, get: function () { return state_js_1.resetStateForTests; } });
Object.defineProperty(exports, "setHasUnknownModelCost", { enumerable: true, get: function () { return state_js_1.setHasUnknownModelCost; } });
var index_js_1 = require("./services/analytics/index.js");
var advisor_js_1 = require("./utils/advisor.js");
var config_js_1 = require("./utils/config.js");
var context_js_1 = require("./utils/context.js");
var fastMode_js_1 = require("./utils/fastMode.js");
var format_js_1 = require("./utils/format.js");
var model_js_1 = require("./utils/model/model.js");
var modelCost_js_1 = require("./utils/modelCost.js");
/**
 * Gets stored cost state from project config for a specific session.
 * Returns the cost data if the session ID matches, or undefined otherwise.
 * Use this to read costs BEFORE overwriting the config with saveCurrentSessionCosts().
 */
function getStoredSessionCosts(sessionId) {
    var _a, _b, _c, _d, _e, _f;
    var projectConfig = (0, config_js_1.getCurrentProjectConfig)();
    // Only return costs if this is the same session that was last saved
    if (projectConfig.lastSessionId !== sessionId) {
        return undefined;
    }
    // Build model usage with context windows
    var modelUsage;
    if (projectConfig.lastModelUsage) {
        modelUsage = Object.fromEntries(Object.entries(projectConfig.lastModelUsage).map(function (_a) {
            var model = _a[0], usage = _a[1];
            return [
                model,
                __assign(__assign({}, usage), { contextWindow: (0, context_js_1.getContextWindowForModel)(model, (0, state_js_1.getSdkBetas)()), maxOutputTokens: (0, context_js_1.getModelMaxOutputTokens)(model).default }),
            ];
        }));
    }
    return {
        totalCostUSD: (_a = projectConfig.lastCost) !== null && _a !== void 0 ? _a : 0,
        totalAPIDuration: (_b = projectConfig.lastAPIDuration) !== null && _b !== void 0 ? _b : 0,
        totalAPIDurationWithoutRetries: (_c = projectConfig.lastAPIDurationWithoutRetries) !== null && _c !== void 0 ? _c : 0,
        totalToolDuration: (_d = projectConfig.lastToolDuration) !== null && _d !== void 0 ? _d : 0,
        totalLinesAdded: (_e = projectConfig.lastLinesAdded) !== null && _e !== void 0 ? _e : 0,
        totalLinesRemoved: (_f = projectConfig.lastLinesRemoved) !== null && _f !== void 0 ? _f : 0,
        lastDuration: projectConfig.lastDuration,
        modelUsage: modelUsage,
    };
}
/**
 * Restores cost state from project config when resuming a session.
 * Only restores if the session ID matches the last saved session.
 * @returns true if cost state was restored, false otherwise
 */
function restoreCostStateForSession(sessionId) {
    var data = getStoredSessionCosts(sessionId);
    if (!data) {
        return false;
    }
    (0, state_js_1.setCostStateForRestore)(data);
    return true;
}
/**
 * Saves the current session's costs to project config.
 * Call this before switching sessions to avoid losing accumulated costs.
 */
function saveCurrentSessionCosts(fpsMetrics) {
    (0, config_js_1.saveCurrentProjectConfig)(function (current) { return (__assign(__assign({}, current), { lastCost: (0, state_js_1.getTotalCostUSD)(), lastAPIDuration: (0, state_js_1.getTotalAPIDuration)(), lastAPIDurationWithoutRetries: (0, state_js_1.getTotalAPIDurationWithoutRetries)(), lastToolDuration: (0, state_js_1.getTotalToolDuration)(), lastDuration: (0, state_js_1.getTotalDuration)(), lastLinesAdded: (0, state_js_1.getTotalLinesAdded)(), lastLinesRemoved: (0, state_js_1.getTotalLinesRemoved)(), lastTotalInputTokens: (0, state_js_1.getTotalInputTokens)(), lastTotalOutputTokens: (0, state_js_1.getTotalOutputTokens)(), lastTotalCacheCreationInputTokens: (0, state_js_1.getTotalCacheCreationInputTokens)(), lastTotalCacheReadInputTokens: (0, state_js_1.getTotalCacheReadInputTokens)(), lastTotalWebSearchRequests: (0, state_js_1.getTotalWebSearchRequests)(), lastFpsAverage: fpsMetrics === null || fpsMetrics === void 0 ? void 0 : fpsMetrics.averageFps, lastFpsLow1Pct: fpsMetrics === null || fpsMetrics === void 0 ? void 0 : fpsMetrics.low1PctFps, lastModelUsage: Object.fromEntries(Object.entries((0, state_js_1.getModelUsage)()).map(function (_a) {
            var model = _a[0], usage = _a[1];
            return [
                model,
                {
                    inputTokens: usage.inputTokens,
                    outputTokens: usage.outputTokens,
                    cacheReadInputTokens: usage.cacheReadInputTokens,
                    cacheCreationInputTokens: usage.cacheCreationInputTokens,
                    webSearchRequests: usage.webSearchRequests,
                    costUSD: usage.costUSD,
                },
            ];
        })), lastSessionId: (0, state_js_1.getSessionId)() })); });
}
function formatCost(cost, maxDecimalPlaces) {
    if (maxDecimalPlaces === void 0) { maxDecimalPlaces = 4; }
    return "$".concat(cost > 0.5 ? round(cost, 100).toFixed(2) : cost.toFixed(maxDecimalPlaces));
}
function formatModelUsage() {
    var modelUsageMap = (0, state_js_1.getModelUsage)();
    if (Object.keys(modelUsageMap).length === 0) {
        return 'Usage:                 0 input, 0 output, 0 cache read, 0 cache write';
    }
    // Accumulate usage by short name
    var usageByShortName = {};
    for (var _i = 0, _a = Object.entries(modelUsageMap); _i < _a.length; _i++) {
        var _b = _a[_i], model = _b[0], usage = _b[1];
        var shortName = (0, model_js_1.getCanonicalName)(model);
        if (!usageByShortName[shortName]) {
            usageByShortName[shortName] = {
                inputTokens: 0,
                outputTokens: 0,
                cacheReadInputTokens: 0,
                cacheCreationInputTokens: 0,
                webSearchRequests: 0,
                costUSD: 0,
                contextWindow: 0,
                maxOutputTokens: 0,
            };
        }
        var accumulated = usageByShortName[shortName];
        accumulated.inputTokens += usage.inputTokens;
        accumulated.outputTokens += usage.outputTokens;
        accumulated.cacheReadInputTokens += usage.cacheReadInputTokens;
        accumulated.cacheCreationInputTokens += usage.cacheCreationInputTokens;
        accumulated.webSearchRequests += usage.webSearchRequests;
        accumulated.costUSD += usage.costUSD;
    }
    var result = 'Usage by model:';
    for (var _c = 0, _d = Object.entries(usageByShortName); _c < _d.length; _c++) {
        var _e = _d[_c], shortName = _e[0], usage = _e[1];
        var usageString = "  ".concat((0, format_js_1.formatNumber)(usage.inputTokens), " input, ") +
            "".concat((0, format_js_1.formatNumber)(usage.outputTokens), " output, ") +
            "".concat((0, format_js_1.formatNumber)(usage.cacheReadInputTokens), " cache read, ") +
            "".concat((0, format_js_1.formatNumber)(usage.cacheCreationInputTokens), " cache write") +
            (usage.webSearchRequests > 0
                ? ", ".concat((0, format_js_1.formatNumber)(usage.webSearchRequests), " web search")
                : '') +
            " (".concat(formatCost(usage.costUSD), ")");
        result += "\n" + "".concat(shortName, ":").padStart(21) + usageString;
    }
    return result;
}
function formatTotalCost() {
    var costDisplay = formatCost((0, state_js_1.getTotalCostUSD)()) +
        ((0, state_js_1.hasUnknownModelCost)()
            ? ' (costs may be inaccurate due to usage of unknown models)'
            : '');
    var modelUsageDisplay = formatModelUsage();
    return chalk_1.default.dim("Total cost:            ".concat(costDisplay, "\n") +
        "Total duration (API):  ".concat((0, format_js_1.formatDuration)((0, state_js_1.getTotalAPIDuration)()), "\nTotal duration (wall): ").concat((0, format_js_1.formatDuration)((0, state_js_1.getTotalDuration)()), "\nTotal code changes:    ").concat((0, state_js_1.getTotalLinesAdded)(), " ").concat((0, state_js_1.getTotalLinesAdded)() === 1 ? 'line' : 'lines', " added, ").concat((0, state_js_1.getTotalLinesRemoved)(), " ").concat((0, state_js_1.getTotalLinesRemoved)() === 1 ? 'line' : 'lines', " removed\n").concat(modelUsageDisplay));
}
function round(number, precision) {
    return Math.round(number * precision) / precision;
}
function addToTotalModelUsage(cost, usage, model) {
    var _a, _b, _c, _d, _e;
    var modelUsage = (_a = (0, state_js_1.getUsageForModel)(model)) !== null && _a !== void 0 ? _a : {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadInputTokens: 0,
        cacheCreationInputTokens: 0,
        webSearchRequests: 0,
        costUSD: 0,
        contextWindow: 0,
        maxOutputTokens: 0,
    };
    modelUsage.inputTokens += usage.input_tokens;
    modelUsage.outputTokens += usage.output_tokens;
    modelUsage.cacheReadInputTokens += (_b = usage.cache_read_input_tokens) !== null && _b !== void 0 ? _b : 0;
    modelUsage.cacheCreationInputTokens += (_c = usage.cache_creation_input_tokens) !== null && _c !== void 0 ? _c : 0;
    modelUsage.webSearchRequests +=
        (_e = (_d = usage.server_tool_use) === null || _d === void 0 ? void 0 : _d.web_search_requests) !== null && _e !== void 0 ? _e : 0;
    modelUsage.costUSD += cost;
    modelUsage.contextWindow = (0, context_js_1.getContextWindowForModel)(model, (0, state_js_1.getSdkBetas)());
    modelUsage.maxOutputTokens = (0, context_js_1.getModelMaxOutputTokens)(model).default;
    return modelUsage;
}
function addToTotalSessionCost(cost, usage, model) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var modelUsage = addToTotalModelUsage(cost, usage, model);
    (0, state_js_1.addToTotalCostState)(cost, modelUsage, model);
    var attrs = (0, fastMode_js_1.isFastModeEnabled)() && usage.speed === 'fast'
        ? { model: model, speed: 'fast' }
        : { model: model };
    (_a = (0, state_js_1.getCostCounter)()) === null || _a === void 0 ? void 0 : _a.add(cost, attrs);
    (_b = (0, state_js_1.getTokenCounter)()) === null || _b === void 0 ? void 0 : _b.add(usage.input_tokens, __assign(__assign({}, attrs), { type: 'input' }));
    (_c = (0, state_js_1.getTokenCounter)()) === null || _c === void 0 ? void 0 : _c.add(usage.output_tokens, __assign(__assign({}, attrs), { type: 'output' }));
    (_d = (0, state_js_1.getTokenCounter)()) === null || _d === void 0 ? void 0 : _d.add((_e = usage.cache_read_input_tokens) !== null && _e !== void 0 ? _e : 0, __assign(__assign({}, attrs), { type: 'cacheRead' }));
    (_f = (0, state_js_1.getTokenCounter)()) === null || _f === void 0 ? void 0 : _f.add((_g = usage.cache_creation_input_tokens) !== null && _g !== void 0 ? _g : 0, __assign(__assign({}, attrs), { type: 'cacheCreation' }));
    var totalCost = cost;
    for (var _i = 0, _k = (0, advisor_js_1.getAdvisorUsage)(usage); _i < _k.length; _i++) {
        var advisorUsage = _k[_i];
        var advisorCost = (0, modelCost_js_1.calculateUSDCost)(advisorUsage.model, advisorUsage);
        (0, index_js_1.logEvent)('tengu_advisor_tool_token_usage', {
            advisor_model: advisorUsage.model,
            input_tokens: advisorUsage.input_tokens,
            output_tokens: advisorUsage.output_tokens,
            cache_read_input_tokens: (_h = advisorUsage.cache_read_input_tokens) !== null && _h !== void 0 ? _h : 0,
            cache_creation_input_tokens: (_j = advisorUsage.cache_creation_input_tokens) !== null && _j !== void 0 ? _j : 0,
            cost_usd_micros: Math.round(advisorCost * 1000000),
        });
        totalCost += addToTotalSessionCost(advisorCost, advisorUsage, advisorUsage.model);
    }
    return totalCost;
}
