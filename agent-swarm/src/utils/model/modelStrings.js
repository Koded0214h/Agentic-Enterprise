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
exports.resolveOverriddenModel = resolveOverriddenModel;
exports.getModelStrings = getModelStrings;
exports.ensureModelStringsInitialized = ensureModelStringsInitialized;
var state_js_1 = require("src/bootstrap/state.js");
var log_js_1 = require("../log.js");
var sequential_js_1 = require("../sequential.js");
var settings_js_1 = require("../settings/settings.js");
var bedrock_js_1 = require("./bedrock.js");
var configs_js_1 = require("./configs.js");
var providers_js_1 = require("./providers.js");
var MODEL_KEYS = Object.keys(configs_js_1.ALL_MODEL_CONFIGS);
function getBuiltinModelStrings(provider) {
    var out = {};
    for (var _i = 0, MODEL_KEYS_1 = MODEL_KEYS; _i < MODEL_KEYS_1.length; _i++) {
        var key = MODEL_KEYS_1[_i];
        out[key] = configs_js_1.ALL_MODEL_CONFIGS[key][provider];
    }
    return out;
}
function getBedrockModelStrings() {
    return __awaiter(this, void 0, void 0, function () {
        var fallback, profiles, error_1, out, _i, MODEL_KEYS_2, key, needle;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fallback = getBuiltinModelStrings('bedrock');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, bedrock_js_1.getBedrockInferenceProfiles)()];
                case 2:
                    profiles = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, fallback];
                case 4:
                    if (!(profiles === null || profiles === void 0 ? void 0 : profiles.length)) {
                        return [2 /*return*/, fallback];
                    }
                    out = {};
                    for (_i = 0, MODEL_KEYS_2 = MODEL_KEYS; _i < MODEL_KEYS_2.length; _i++) {
                        key = MODEL_KEYS_2[_i];
                        needle = configs_js_1.ALL_MODEL_CONFIGS[key].firstParty;
                        out[key] = (0, bedrock_js_1.findFirstMatch)(profiles, needle) || fallback[key];
                    }
                    return [2 /*return*/, out];
            }
        });
    });
}
/**
 * Layer user-configured modelOverrides (from settings.json) on top of the
 * provider-derived model strings. Overrides are keyed by canonical first-party
 * model ID (e.g. "claude-opus-4-6") and map to arbitrary provider-specific
 * strings — typically Bedrock inference profile ARNs.
 */
function applyModelOverrides(ms) {
    var overrides = (0, settings_js_1.getInitialSettings)().modelOverrides;
    if (!overrides) {
        return ms;
    }
    var out = __assign({}, ms);
    for (var _i = 0, _a = Object.entries(overrides); _i < _a.length; _i++) {
        var _b = _a[_i], canonicalId = _b[0], override = _b[1];
        var key = configs_js_1.CANONICAL_ID_TO_KEY[canonicalId];
        if (key && override) {
            out[key] = override;
        }
    }
    return out;
}
/**
 * Resolve an overridden model ID (e.g. a Bedrock ARN) back to its canonical
 * first-party model ID. If the input doesn't match any current override value,
 * it is returned unchanged. Safe to call during module init (no-ops if settings
 * aren't loaded yet).
 */
function resolveOverriddenModel(modelId) {
    var overrides;
    try {
        overrides = (0, settings_js_1.getInitialSettings)().modelOverrides;
    }
    catch (_a) {
        return modelId;
    }
    if (!overrides) {
        return modelId;
    }
    for (var _i = 0, _b = Object.entries(overrides); _i < _b.length; _i++) {
        var _c = _b[_i], canonicalId = _c[0], override = _c[1];
        if (override === modelId) {
            return canonicalId;
        }
    }
    return modelId;
}
var updateBedrockModelStrings = (0, sequential_js_1.sequential)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var ms, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if ((0, state_js_1.getModelStrings)() !== null) {
                    // Already initialized. Doing the check here, combined with
                    // `sequential`, allows the test suite to reset the state
                    // between tests while still preventing multiple API calls
                    // in production.
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getBedrockModelStrings()];
            case 2:
                ms = _a.sent();
                (0, state_js_1.setModelStrings)(ms);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                (0, log_js_1.logError)(error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
function initModelStrings() {
    var ms = (0, state_js_1.getModelStrings)();
    if (ms !== null) {
        // Already initialized
        return;
    }
    // Initial with default values for non-Bedrock providers
    if ((0, providers_js_1.getAPIProvider)() !== 'bedrock') {
        (0, state_js_1.setModelStrings)(getBuiltinModelStrings((0, providers_js_1.getAPIProvider)()));
        return;
    }
    // On Bedrock, update model strings in the background without blocking.
    // Don't set the state in this case so that we can use `sequential` on
    // `updateBedrockModelStrings` and check for existing state on multiple
    // calls.
    void updateBedrockModelStrings();
}
function getModelStrings() {
    var ms = (0, state_js_1.getModelStrings)();
    if (ms === null) {
        initModelStrings();
        // Bedrock path falls through here while the profile fetch runs in the
        // background — still honor overrides on the interim defaults.
        return applyModelOverrides(getBuiltinModelStrings((0, providers_js_1.getAPIProvider)()));
    }
    return applyModelOverrides(ms);
}
/**
 * Ensure model strings are fully initialized.
 * For Bedrock users, this waits for the profile fetch to complete.
 * Call this before generating model options to ensure correct region strings.
 */
function ensureModelStringsInitialized() {
    return __awaiter(this, void 0, void 0, function () {
        var ms;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ms = (0, state_js_1.getModelStrings)();
                    if (ms !== null) {
                        return [2 /*return*/];
                    }
                    // For non-Bedrock, initialize synchronously
                    if ((0, providers_js_1.getAPIProvider)() !== 'bedrock') {
                        (0, state_js_1.setModelStrings)(getBuiltinModelStrings((0, providers_js_1.getAPIProvider)()));
                        return [2 /*return*/];
                    }
                    // For Bedrock, wait for the profile fetch
                    return [4 /*yield*/, updateBedrockModelStrings()];
                case 1:
                    // For Bedrock, wait for the profile fetch
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
