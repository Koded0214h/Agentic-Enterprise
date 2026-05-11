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
exports.getGitEmail = exports.getCoreUserData = void 0;
exports.initUser = initUser;
exports.resetUserCache = resetUserCache;
exports.getUserForGrowthBook = getUserForGrowthBook;
var execa_1 = require("execa");
var memoize_js_1 = require("lodash-es/memoize.js");
var state_js_1 = require("../bootstrap/state.js");
var auth_js_1 = require("./auth.js");
var config_js_1 = require("./config.js");
var cwd_js_1 = require("./cwd.js");
var env_js_1 = require("./env.js");
var envUtils_js_1 = require("./envUtils.js");
// Cache for email fetched asynchronously at startup
var cachedEmail = null; // null means not fetched yet
var emailFetchPromise = null;
/**
 * Initialize user data asynchronously. Should be called early in startup.
 * This pre-fetches the email so getUser() can remain synchronous.
 */
function initUser() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(cachedEmail === null && !emailFetchPromise)) return [3 /*break*/, 2];
                    emailFetchPromise = getEmailAsync();
                    return [4 /*yield*/, emailFetchPromise];
                case 1:
                    cachedEmail = _c.sent();
                    emailFetchPromise = null;
                    // Clear memoization cache so next call picks up the email
                    (_b = (_a = exports.getCoreUserData.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    _c.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Reset all user data caches. Call on auth changes (login/logout/account switch)
 * so the next getCoreUserData() call picks up fresh credentials and email.
 */
function resetUserCache() {
    var _a, _b, _c, _d;
    cachedEmail = null;
    emailFetchPromise = null;
    (_b = (_a = exports.getCoreUserData.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = exports.getGitEmail.cache).clear) === null || _d === void 0 ? void 0 : _d.call(_c);
}
/**
 * Get core user data.
 * This is the base representation that gets transformed for different analytics providers.
 */
exports.getCoreUserData = (0, memoize_js_1.default)(function (includeAnalyticsMetadata) {
    var _a, _b;
    var deviceId = (0, config_js_1.getOrCreateUserID)();
    var config = (0, config_js_1.getGlobalConfig)();
    var subscriptionType;
    var rateLimitTier;
    var firstTokenTime;
    if (includeAnalyticsMetadata) {
        subscriptionType = (_a = (0, auth_js_1.getSubscriptionType)()) !== null && _a !== void 0 ? _a : undefined;
        rateLimitTier = (_b = (0, auth_js_1.getRateLimitTier)()) !== null && _b !== void 0 ? _b : undefined;
        if (subscriptionType && config.claudeCodeFirstTokenDate) {
            var configFirstTokenTime = new Date(config.claudeCodeFirstTokenDate).getTime();
            if (!isNaN(configFirstTokenTime)) {
                firstTokenTime = configFirstTokenTime;
            }
        }
    }
    // Only include OAuth account data when actively using OAuth authentication
    var oauthAccount = (0, auth_js_1.getOauthAccountInfo)();
    var organizationUuid = oauthAccount === null || oauthAccount === void 0 ? void 0 : oauthAccount.organizationUuid;
    var accountUuid = oauthAccount === null || oauthAccount === void 0 ? void 0 : oauthAccount.accountUuid;
    return __assign({ deviceId: deviceId, sessionId: (0, state_js_1.getSessionId)(), email: getEmail(), appVersion: MACRO.VERSION, platform: (0, env_js_1.getHostPlatformForAnalytics)(), organizationUuid: organizationUuid, accountUuid: accountUuid, userType: process.env.USER_TYPE, subscriptionType: subscriptionType, rateLimitTier: rateLimitTier, firstTokenTime: firstTokenTime }, ((0, envUtils_js_1.isEnvTruthy)(process.env.GITHUB_ACTIONS) && {
        githubActionsMetadata: {
            actor: process.env.GITHUB_ACTOR,
            actorId: process.env.GITHUB_ACTOR_ID,
            repository: process.env.GITHUB_REPOSITORY,
            repositoryId: process.env.GITHUB_REPOSITORY_ID,
            repositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
            repositoryOwnerId: process.env.GITHUB_REPOSITORY_OWNER_ID,
        },
    }));
});
/**
 * Get user data for GrowthBook (same as core data with analytics metadata).
 */
function getUserForGrowthBook() {
    return (0, exports.getCoreUserData)(true);
}
function getEmail() {
    // Return cached email if available (from async initialization)
    if (cachedEmail !== null) {
        return cachedEmail;
    }
    // Only include OAuth email when actively using OAuth authentication
    var oauthAccount = (0, auth_js_1.getOauthAccountInfo)();
    if (oauthAccount === null || oauthAccount === void 0 ? void 0 : oauthAccount.emailAddress) {
        return oauthAccount.emailAddress;
    }
    // Ant-only fallbacks below (no execSync)
    if (process.env.USER_TYPE !== 'ant') {
        return undefined;
    }
    if (process.env.COO_CREATOR) {
        return "".concat(process.env.COO_CREATOR, "@anthropic.com");
    }
    // If initUser() wasn't called, we return undefined instead of blocking
    return undefined;
}
function getEmailAsync() {
    return __awaiter(this, void 0, void 0, function () {
        var oauthAccount;
        return __generator(this, function (_a) {
            oauthAccount = (0, auth_js_1.getOauthAccountInfo)();
            if (oauthAccount === null || oauthAccount === void 0 ? void 0 : oauthAccount.emailAddress) {
                return [2 /*return*/, oauthAccount.emailAddress];
            }
            // Ant-only fallbacks below
            if (process.env.USER_TYPE !== 'ant') {
                return [2 /*return*/, undefined];
            }
            if (process.env.COO_CREATOR) {
                return [2 /*return*/, "".concat(process.env.COO_CREATOR, "@anthropic.com")];
            }
            return [2 /*return*/, (0, exports.getGitEmail)()];
        });
    });
}
/**
 * Get the user's git email from `git config user.email`.
 * Memoized so the subprocess only spawns once per process.
 */
exports.getGitEmail = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, execa_1.execa)('git config --get user.email', {
                    shell: true,
                    reject: false,
                    cwd: (0, cwd_js_1.getCwd)(),
                })];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.exitCode === 0 && result.stdout
                        ? result.stdout.trim()
                        : undefined];
        }
    });
}); });
