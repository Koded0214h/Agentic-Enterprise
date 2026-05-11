"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.getModelCapability = getModelCapability;
exports.refreshModelCapabilities = refreshModelCapabilities;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var isEqual_js_1 = require("lodash-es/isEqual.js");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var oauth_js_1 = require("../../constants/oauth.js");
var client_js_1 = require("../../services/api/client.js");
var auth_js_1 = require("../auth.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var json_js_1 = require("../json.js");
var lazySchema_js_1 = require("../lazySchema.js");
var privacyLevel_js_1 = require("../privacyLevel.js");
var slowOperations_js_1 = require("../slowOperations.js");
var providers_js_1 = require("./providers.js");
// .strip() — don't persist internal-only fields (mycro_deployments etc.) to disk
var ModelCapabilitySchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        id: v4_1.z.string(),
        max_input_tokens: v4_1.z.number().optional(),
        max_tokens: v4_1.z.number().optional(),
    })
        .strip();
});
var CacheFileSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        models: v4_1.z.array(ModelCapabilitySchema()),
        timestamp: v4_1.z.number(),
    });
});
function getCacheDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'cache');
}
function getCachePath() {
    return (0, path_1.join)(getCacheDir(), 'model-capabilities.json');
}
function isModelCapabilitiesEligible() {
    if (process.env.USER_TYPE !== 'ant')
        return false;
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty')
        return false;
    if (!(0, providers_js_1.isFirstPartyAnthropicBaseUrl)())
        return false;
    return true;
}
// Longest-id-first so substring match prefers most specific; secondary key for stable isEqual
function sortForMatching(models) {
    return __spreadArray([], models, true).sort(function (a, b) { return b.id.length - a.id.length || a.id.localeCompare(b.id); });
}
// Keyed on cache path so tests that set CLAUDE_CONFIG_DIR get a fresh read
var loadCache = (0, memoize_js_1.default)(function (path) {
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs -- memoized; called from sync getContextWindowForModel
        var raw = (0, fs_1.readFileSync)(path, 'utf-8');
        var parsed = CacheFileSchema().safeParse((0, json_js_1.safeParseJSON)(raw, false));
        return parsed.success ? parsed.data.models : null;
    }
    catch (_a) {
        return null;
    }
}, function (path) { return path; });
function getModelCapability(model) {
    if (!isModelCapabilitiesEligible())
        return undefined;
    var cached = loadCache(getCachePath());
    if (!cached || cached.length === 0)
        return undefined;
    var m = model.toLowerCase();
    var exact = cached.find(function (c) { return c.id.toLowerCase() === m; });
    if (exact)
        return exact;
    return cached.find(function (c) { return m.includes(c.id.toLowerCase()); });
}
function refreshModelCapabilities() {
    return __awaiter(this, void 0, void 0, function () {
        var anthropic, betas, parsed, _a, _b, _c, entry, result, e_1_1, path, models, error_1;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!isModelCapabilitiesEligible())
                        return [2 /*return*/];
                    if ((0, privacyLevel_js_1.isEssentialTrafficOnly)())
                        return [2 /*return*/];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 17, , 18]);
                    return [4 /*yield*/, (0, client_js_1.getAnthropicClient)({ maxRetries: 1 })];
                case 2:
                    anthropic = _g.sent();
                    betas = (0, auth_js_1.isClaudeAISubscriber)() ? [oauth_js_1.OAUTH_BETA_HEADER] : undefined;
                    parsed = [];
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 8, 9, 14]);
                    _a = true, _b = __asyncValues(anthropic.models.list({ betas: betas }));
                    _g.label = 4;
                case 4: return [4 /*yield*/, _b.next()];
                case 5:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 7];
                    _f = _c.value;
                    _a = false;
                    entry = _f;
                    result = ModelCapabilitySchema().safeParse(entry);
                    if (result.success)
                        parsed.push(result.data);
                    _g.label = 6;
                case 6:
                    _a = true;
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _g.trys.push([9, , 12, 13]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _e.call(_b)];
                case 10:
                    _g.sent();
                    _g.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14:
                    if (parsed.length === 0)
                        return [2 /*return*/];
                    path = getCachePath();
                    models = sortForMatching(parsed);
                    if ((0, isEqual_js_1.default)(loadCache(path), models)) {
                        (0, debug_js_1.logForDebugging)('[modelCapabilities] cache unchanged, skipping write');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, promises_1.mkdir)(getCacheDir(), { recursive: true })];
                case 15:
                    _g.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, (0, slowOperations_js_1.jsonStringify)({ models: models, timestamp: Date.now() }), {
                            encoding: 'utf-8',
                            mode: 384,
                        })];
                case 16:
                    _g.sent();
                    loadCache.cache.delete(path);
                    (0, debug_js_1.logForDebugging)("[modelCapabilities] cached ".concat(models.length, " models"));
                    return [3 /*break*/, 18];
                case 17:
                    error_1 = _g.sent();
                    (0, debug_js_1.logForDebugging)("[modelCapabilities] fetch failed: ".concat(error_1 instanceof Error ? error_1.message : 'unknown'));
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
}
