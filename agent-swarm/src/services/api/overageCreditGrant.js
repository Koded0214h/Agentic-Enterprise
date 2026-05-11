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
exports.getCachedOverageCreditGrant = getCachedOverageCreditGrant;
exports.invalidateOverageCreditGrantCache = invalidateOverageCreditGrantCache;
exports.refreshOverageCreditGrantCache = refreshOverageCreditGrantCache;
exports.formatGrantAmount = formatGrantAmount;
var axios_1 = require("axios");
var oauth_js_1 = require("../../constants/oauth.js");
var auth_js_1 = require("../../utils/auth.js");
var config_js_1 = require("../../utils/config.js");
var log_js_1 = require("../../utils/log.js");
var privacyLevel_js_1 = require("../../utils/privacyLevel.js");
var api_js_1 = require("../../utils/teleport/api.js");
var CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
/**
 * Fetch the current user's overage credit grant eligibility from the backend.
 * The backend resolves tier-specific amounts and role-based claim permission,
 * so the CLI just reads the response without replicating that logic.
 */
function fetchOverageCreditGrant() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, url, response, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, api_js_1.prepareApiRequest)()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/overage_credit_grant");
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: (0, api_js_1.getOAuthHeaders)(accessToken),
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    err_1 = _b.sent();
                    (0, log_js_1.logError)(err_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get cached grant info. Returns null if no cache or cache is stale.
 * Callers should render nothing (not block) when this returns null —
 * refreshOverageCreditGrantCache fires lazily to populate it.
 */
function getCachedOverageCreditGrant() {
    var _a, _b;
    var orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
    if (!orgId)
        return null;
    var cached = (_b = (0, config_js_1.getGlobalConfig)().overageCreditGrantCache) === null || _b === void 0 ? void 0 : _b[orgId];
    if (!cached)
        return null;
    if (Date.now() - cached.timestamp > CACHE_TTL_MS)
        return null;
    return cached.info;
}
/**
 * Drop the current org's cached entry so the next read refetches.
 * Leaves other orgs' entries intact.
 */
function invalidateOverageCreditGrantCache() {
    var _a;
    var orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
    if (!orgId)
        return;
    var cache = (0, config_js_1.getGlobalConfig)().overageCreditGrantCache;
    if (!cache || !(orgId in cache))
        return;
    (0, config_js_1.saveGlobalConfig)(function (prev) {
        var next = __assign({}, prev.overageCreditGrantCache);
        delete next[orgId];
        return __assign(__assign({}, prev), { overageCreditGrantCache: next });
    });
}
/**
 * Fetch and cache grant info. Fire-and-forget; call when an upsell surface
 * is about to render and the cache is empty.
 */
function refreshOverageCreditGrantCache() {
    return __awaiter(this, void 0, void 0, function () {
        var orgId, info;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if ((0, privacyLevel_js_1.isEssentialTrafficOnly)())
                        return [2 /*return*/];
                    orgId = (_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.organizationUuid;
                    if (!orgId)
                        return [2 /*return*/];
                    return [4 /*yield*/, fetchOverageCreditGrant()];
                case 1:
                    info = _b.sent();
                    if (!info)
                        return [2 /*return*/];
                    // Skip rewriting info if grant data is unchanged — avoids config write
                    // amplification (inc-4552 pattern). Still refresh the timestamp so the
                    // TTL-based staleness check in getCachedOverageCreditGrant doesn't keep
                    // re-triggering API calls on every component mount.
                    (0, config_js_1.saveGlobalConfig)(function (prev) {
                        var _a;
                        var _b;
                        // Derive from prev (lock-fresh) rather than a pre-lock getGlobalConfig()
                        // read — saveConfigWithLock re-reads config from disk under the file lock,
                        // so another CLI instance may have written between any outer read and lock
                        // acquire.
                        var prevCached = (_b = prev.overageCreditGrantCache) === null || _b === void 0 ? void 0 : _b[orgId];
                        var existing = prevCached === null || prevCached === void 0 ? void 0 : prevCached.info;
                        var dataUnchanged = existing &&
                            existing.available === info.available &&
                            existing.eligible === info.eligible &&
                            existing.granted === info.granted &&
                            existing.amount_minor_units === info.amount_minor_units &&
                            existing.currency === info.currency;
                        // When data is unchanged and timestamp is still fresh, skip the write entirely
                        if (dataUnchanged &&
                            prevCached &&
                            Date.now() - prevCached.timestamp <= CACHE_TTL_MS) {
                            return prev;
                        }
                        var entry = {
                            info: dataUnchanged ? existing : info,
                            timestamp: Date.now(),
                        };
                        return __assign(__assign({}, prev), { overageCreditGrantCache: __assign(__assign({}, prev.overageCreditGrantCache), (_a = {}, _a[orgId] = entry, _a)) });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Format the grant amount for display. Returns null if amount isn't available
 * (not eligible, or currency we don't know how to format).
 */
function formatGrantAmount(info) {
    if (info.amount_minor_units == null || !info.currency)
        return null;
    // For now only USD; backend may expand later
    if (info.currency.toUpperCase() === 'USD') {
        var dollars = info.amount_minor_units / 100;
        return Number.isInteger(dollars) ? "$".concat(dollars) : "$".concat(dollars.toFixed(2));
    }
    return null;
}
