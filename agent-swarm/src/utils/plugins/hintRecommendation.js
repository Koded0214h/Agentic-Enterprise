"use strict";
/**
 * Plugin-hint recommendations.
 *
 * Companion to lspRecommendation.ts: where LSP recommendations are triggered
 * by file edits, plugin hints are triggered by CLIs/SDKs emitting a
 * `<claude-code-hint />` tag to stderr (detected by the Bash/PowerShell tools).
 *
 * State persists in GlobalConfig.claudeCodeHints — a show-once record per
 * plugin and a disabled flag (user picked "don't show again"). Official-
 * marketplace filtering is hardcoded for v1.
 */
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
exports.maybeRecordPluginHint = maybeRecordPluginHint;
exports._resetHintRecommendationForTesting = _resetHintRecommendationForTesting;
exports.resolvePluginHint = resolvePluginHint;
exports.markHintPluginShown = markHintPluginShown;
exports.disableHintRecommendations = disableHintRecommendations;
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var claudeCodeHints_js_1 = require("../claudeCodeHints.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
var pluginPolicy_js_1 = require("./pluginPolicy.js");
/**
 * Hard cap on `claudeCodeHints.plugin[]` — bounds config growth. Each shown
 * plugin appends one slug; past this point we stop prompting (and stop
 * appending) rather than let the config grow without limit.
 */
var MAX_SHOWN_PLUGINS = 100;
/**
 * Pre-store gate called by shell tools when a `type="plugin"` hint is detected.
 * Drops the hint if:
 *
 *  - a dialog has already been shown this session
 *  - user has disabled hints
 *  - the shown-plugins list has hit the config-growth cap
 *  - plugin slug doesn't parse as `name@marketplace`
 *  - marketplace isn't official (hardcoded for v1)
 *  - plugin is already installed
 *  - plugin was already shown in a prior session
 *
 * Synchronous on purpose — shell tools shouldn't await a marketplace lookup
 * just to strip a stderr line. The async marketplace-cache check happens
 * later in resolvePluginHint (hook side).
 */
function maybeRecordPluginHint(hint) {
    var _a;
    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_lapis_finch', false))
        return;
    if ((0, claudeCodeHints_js_1.hasShownHintThisSession)())
        return;
    var state = (0, config_js_1.getGlobalConfig)().claudeCodeHints;
    if (state === null || state === void 0 ? void 0 : state.disabled)
        return;
    var shown = (_a = state === null || state === void 0 ? void 0 : state.plugin) !== null && _a !== void 0 ? _a : [];
    if (shown.length >= MAX_SHOWN_PLUGINS)
        return;
    var pluginId = hint.value;
    var _b = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId), name = _b.name, marketplace = _b.marketplace;
    if (!name || !marketplace)
        return;
    if (!(0, pluginIdentifier_js_1.isOfficialMarketplaceName)(marketplace))
        return;
    if (shown.includes(pluginId))
        return;
    if ((0, installedPluginsManager_js_1.isPluginInstalled)(pluginId))
        return;
    if ((0, pluginPolicy_js_1.isPluginBlockedByPolicy)(pluginId))
        return;
    // Bound repeat lookups on the same slug — a CLI that emits on every
    // invocation shouldn't trigger N resolve cycles for the same plugin.
    if (triedThisSession.has(pluginId))
        return;
    triedThisSession.add(pluginId);
    (0, claudeCodeHints_js_1.setPendingHint)(hint);
}
var triedThisSession = new Set();
/** Test-only reset. */
function _resetHintRecommendationForTesting() {
    triedThisSession.clear();
}
/**
 * Resolve the pending hint to a renderable recommendation. Runs the async
 * marketplace lookup that the sync pre-store gate skipped. Returns null if
 * the plugin isn't in the marketplace cache — the hint is discarded.
 */
function resolvePluginHint(hint) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginId, _a, name, marketplace, pluginData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pluginId = hint.value;
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId), name = _a.name, marketplace = _a.marketplace;
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(pluginId)];
                case 1:
                    pluginData = _b.sent();
                    (0, index_js_1.logEvent)('tengu_plugin_hint_detected', {
                        _PROTO_plugin_name: (name !== null && name !== void 0 ? name : ''),
                        _PROTO_marketplace_name: (marketplace !== null && marketplace !== void 0 ? marketplace : ''),
                        result: (pluginData
                            ? 'passed'
                            : 'not_in_cache'),
                    });
                    if (!pluginData) {
                        (0, debug_js_1.logForDebugging)("[hintRecommendation] ".concat(pluginId, " not found in marketplace cache"));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            pluginId: pluginId,
                            pluginName: pluginData.entry.name,
                            marketplaceName: marketplace !== null && marketplace !== void 0 ? marketplace : '',
                            pluginDescription: pluginData.entry.description,
                            sourceCommand: hint.sourceCommand,
                        }];
            }
        });
    });
}
/**
 * Record that a prompt for this plugin was surfaced. Called regardless of
 * the user's yes/no response — show-once semantics.
 */
function markHintPluginShown(pluginId) {
    (0, config_js_1.saveGlobalConfig)(function (current) {
        var _a, _b;
        var existing = (_b = (_a = current.claudeCodeHints) === null || _a === void 0 ? void 0 : _a.plugin) !== null && _b !== void 0 ? _b : [];
        if (existing.includes(pluginId))
            return current;
        return __assign(__assign({}, current), { claudeCodeHints: __assign(__assign({}, current.claudeCodeHints), { plugin: __spreadArray(__spreadArray([], existing, true), [pluginId], false) }) });
    });
}
/** Called when the user picks "don't show plugin installation hints again". */
function disableHintRecommendations() {
    (0, config_js_1.saveGlobalConfig)(function (current) {
        var _a;
        if ((_a = current.claudeCodeHints) === null || _a === void 0 ? void 0 : _a.disabled)
            return current;
        return __assign(__assign({}, current), { claudeCodeHints: __assign(__assign({}, current.claudeCodeHints), { disabled: true }) });
    });
}
