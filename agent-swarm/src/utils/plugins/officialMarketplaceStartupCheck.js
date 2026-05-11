"use strict";
/**
 * Auto-install logic for the official Anthropic marketplace.
 *
 * This module handles automatically installing the official marketplace
 * on startup for new users, with appropriate checks for:
 * - Enterprise policy restrictions
 * - Git availability
 * - Previous installation attempts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETRY_CONFIG = void 0;
exports.isOfficialMarketplaceAutoInstallDisabled = isOfficialMarketplaceAutoInstallDisabled;
exports.checkAndInstallOfficialMarketplace = checkAndInstallOfficialMarketplace;
var path_1 = require("path");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var gitAvailability_js_1 = require("./gitAvailability.js");
var marketplaceHelpers_js_1 = require("./marketplaceHelpers.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var officialMarketplace_js_1 = require("./officialMarketplace.js");
var officialMarketplaceGcs_js_1 = require("./officialMarketplaceGcs.js");
/**
 * Check if official marketplace auto-install is disabled via environment variable.
 */
function isOfficialMarketplaceAutoInstallDisabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL);
}
/**
 * Configuration for retry logic
 */
exports.RETRY_CONFIG = {
    MAX_ATTEMPTS: 10,
    INITIAL_DELAY_MS: 60 * 60 * 1000, // 1 hour
    BACKOFF_MULTIPLIER: 2,
    MAX_DELAY_MS: 7 * 24 * 60 * 60 * 1000, // 1 week
};
/**
 * Calculate next retry delay using exponential backoff
 */
function calculateNextRetryDelay(retryCount) {
    var delay = exports.RETRY_CONFIG.INITIAL_DELAY_MS *
        Math.pow(exports.RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount);
    return Math.min(delay, exports.RETRY_CONFIG.MAX_DELAY_MS);
}
/**
 * Determine if installation should be retried based on failure reason and retry state
 */
function shouldRetryInstallation(config) {
    // If never attempted, should try
    if (!config.officialMarketplaceAutoInstallAttempted) {
        return true;
    }
    // If already installed successfully, don't retry
    if (config.officialMarketplaceAutoInstalled) {
        return false;
    }
    var failReason = config.officialMarketplaceAutoInstallFailReason;
    var retryCount = config.officialMarketplaceAutoInstallRetryCount || 0;
    var nextRetryTime = config.officialMarketplaceAutoInstallNextRetryTime;
    var now = Date.now();
    // Check if we've exceeded max attempts
    if (retryCount >= exports.RETRY_CONFIG.MAX_ATTEMPTS) {
        return false;
    }
    // Permanent failures - don't retry
    if (failReason === 'policy_blocked') {
        return false;
    }
    // Check if enough time has passed for next retry
    if (nextRetryTime && now < nextRetryTime) {
        return false;
    }
    // Retry for temporary failures (unknown), semi-permanent (git_unavailable),
    // and legacy state (undefined failReason from before retry logic existed)
    return (failReason === 'unknown' ||
        failReason === 'git_unavailable' ||
        failReason === 'gcs_unavailable' ||
        failReason === undefined);
}
/**
 * Check and install the official marketplace on startup.
 *
 * This function is designed to be called as a fire-and-forget operation
 * during startup. It will:
 * 1. Check if installation was already attempted
 * 2. Check if marketplace is already installed
 * 3. Check enterprise policy restrictions
 * 4. Check git availability
 * 5. Attempt installation
 * 6. Record the result in GlobalConfig
 *
 * @returns Result indicating whether installation succeeded or was skipped
 */
function checkAndInstallOfficialMarketplace() {
    return __awaiter(this, void 0, void 0, function () {
        var config, reason, knownMarketplaces, cacheDir, installLocation, gcsSha, known, retryCount_1, now_1, nextRetryTime_1, gitAvailable, retryCount_2, now_2, nextRetryDelay, nextRetryTime_2, configSaveFailed, configError, previousRetryCount, error_1, errorMessage, retryCount_3, now_3, nextRetryDelay, nextRetryTime_3, configSaveFailed, configError;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = (0, config_js_1.getGlobalConfig)();
                    // Check if we should retry installation
                    if (!shouldRetryInstallation(config)) {
                        reason = (_a = config.officialMarketplaceAutoInstallFailReason) !== null && _a !== void 0 ? _a : 'already_attempted';
                        (0, debug_js_1.logForDebugging)("Official marketplace auto-install skipped: ".concat(reason));
                        return [2 /*return*/, {
                                installed: false,
                                skipped: true,
                                reason: reason,
                            }];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    // Check if auto-install is disabled via env var
                    if (isOfficialMarketplaceAutoInstallDisabled()) {
                        (0, debug_js_1.logForDebugging)('Official marketplace auto-install disabled via env var, skipping');
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: false, officialMarketplaceAutoInstallFailReason: 'policy_blocked' })); });
                        (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                            installed: false,
                            skipped: true,
                            policy_blocked: true,
                        });
                        return [2 /*return*/, { installed: false, skipped: true, reason: 'policy_blocked' }];
                    }
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 2:
                    knownMarketplaces = _b.sent();
                    if (knownMarketplaces[officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME]) {
                        (0, debug_js_1.logForDebugging)("Official marketplace '".concat(officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME, "' already installed, skipping"));
                        // Mark as attempted so we don't check again
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: true })); });
                        return [2 /*return*/, { installed: false, skipped: true, reason: 'already_installed' }];
                    }
                    // Check enterprise policy restrictions
                    if (!(0, marketplaceHelpers_js_1.isSourceAllowedByPolicy)(officialMarketplace_js_1.OFFICIAL_MARKETPLACE_SOURCE)) {
                        (0, debug_js_1.logForDebugging)('Official marketplace blocked by enterprise policy, skipping');
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: false, officialMarketplaceAutoInstallFailReason: 'policy_blocked' })); });
                        (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                            installed: false,
                            skipped: true,
                            policy_blocked: true,
                        });
                        return [2 /*return*/, { installed: false, skipped: true, reason: 'policy_blocked' }];
                    }
                    cacheDir = (0, marketplaceManager_js_1.getMarketplacesCacheDir)();
                    installLocation = (0, path_1.join)(cacheDir, officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME);
                    return [4 /*yield*/, (0, officialMarketplaceGcs_js_1.fetchOfficialMarketplaceFromGcs)(installLocation, cacheDir)];
                case 3:
                    gcsSha = _b.sent();
                    if (!(gcsSha !== null)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 4:
                    known = _b.sent();
                    known[officialMarketplace_js_1.OFFICIAL_MARKETPLACE_NAME] = {
                        source: officialMarketplace_js_1.OFFICIAL_MARKETPLACE_SOURCE,
                        installLocation: installLocation,
                        lastUpdated: new Date().toISOString(),
                    };
                    return [4 /*yield*/, (0, marketplaceManager_js_1.saveKnownMarketplacesConfig)(known)];
                case 5:
                    _b.sent();
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: true, officialMarketplaceAutoInstallFailReason: undefined, officialMarketplaceAutoInstallRetryCount: undefined, officialMarketplaceAutoInstallLastAttemptTime: undefined, officialMarketplaceAutoInstallNextRetryTime: undefined })); });
                    (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                        installed: true,
                        skipped: false,
                        via_gcs: true,
                    });
                    return [2 /*return*/, { installed: true, skipped: false }];
                case 6:
                    // GCS failed (404 until backend writes, or network). Fall through to git
                    // ONLY if the kill-switch allows — same gate as refreshMarketplace().
                    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_plugin_official_mkt_git_fallback', true)) {
                        (0, debug_js_1.logForDebugging)('Official marketplace GCS failed; git fallback disabled by flag — skipping install');
                        retryCount_1 = (config.officialMarketplaceAutoInstallRetryCount || 0) + 1;
                        now_1 = Date.now();
                        nextRetryTime_1 = now_1 + calculateNextRetryDelay(retryCount_1);
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: false, officialMarketplaceAutoInstallFailReason: 'gcs_unavailable', officialMarketplaceAutoInstallRetryCount: retryCount_1, officialMarketplaceAutoInstallLastAttemptTime: now_1, officialMarketplaceAutoInstallNextRetryTime: nextRetryTime_1 })); });
                        (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                            installed: false,
                            skipped: true,
                            gcs_unavailable: true,
                            retry_count: retryCount_1,
                        });
                        return [2 /*return*/, { installed: false, skipped: true, reason: 'gcs_unavailable' }];
                    }
                    return [4 /*yield*/, (0, gitAvailability_js_1.checkGitAvailable)()];
                case 7:
                    gitAvailable = _b.sent();
                    if (!gitAvailable) {
                        (0, debug_js_1.logForDebugging)('Git not available, skipping official marketplace auto-install');
                        retryCount_2 = (config.officialMarketplaceAutoInstallRetryCount || 0) + 1;
                        now_2 = Date.now();
                        nextRetryDelay = calculateNextRetryDelay(retryCount_2);
                        nextRetryTime_2 = now_2 + nextRetryDelay;
                        configSaveFailed = false;
                        try {
                            (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: false, officialMarketplaceAutoInstallFailReason: 'git_unavailable', officialMarketplaceAutoInstallRetryCount: retryCount_2, officialMarketplaceAutoInstallLastAttemptTime: now_2, officialMarketplaceAutoInstallNextRetryTime: nextRetryTime_2 })); });
                        }
                        catch (saveError) {
                            configSaveFailed = true;
                            configError = (0, errors_js_1.toError)(saveError);
                            (0, log_js_1.logError)(configError);
                            (0, debug_js_1.logForDebugging)("Failed to save marketplace auto-install git_unavailable state: ".concat(saveError), { level: 'error' });
                        }
                        (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                            installed: false,
                            skipped: true,
                            git_unavailable: true,
                            retry_count: retryCount_2,
                        });
                        return [2 /*return*/, {
                                installed: false,
                                skipped: true,
                                reason: 'git_unavailable',
                                configSaveFailed: configSaveFailed,
                            }];
                    }
                    // Attempt installation
                    (0, debug_js_1.logForDebugging)('Attempting to auto-install official marketplace');
                    return [4 /*yield*/, (0, marketplaceManager_js_1.addMarketplaceSource)(officialMarketplace_js_1.OFFICIAL_MARKETPLACE_SOURCE)
                        // Success
                    ];
                case 8:
                    _b.sent();
                    // Success
                    (0, debug_js_1.logForDebugging)('Successfully auto-installed official marketplace');
                    previousRetryCount = config.officialMarketplaceAutoInstallRetryCount || 0;
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: true, 
                        // Clear retry metadata on success
                        officialMarketplaceAutoInstallFailReason: undefined, officialMarketplaceAutoInstallRetryCount: undefined, officialMarketplaceAutoInstallLastAttemptTime: undefined, officialMarketplaceAutoInstallNextRetryTime: undefined })); });
                    (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                        installed: true,
                        skipped: false,
                        retry_count: previousRetryCount,
                    });
                    return [2 /*return*/, { installed: true, skipped: false }];
                case 9:
                    error_1 = _b.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    // On macOS, /usr/bin/git is an xcrun shim that always exists on PATH, so
                    // checkGitAvailable() (which only does `which git`) passes even without
                    // Xcode CLT installed. The shim then fails at clone time with
                    // "xcrun: error: invalid active developer path (...)". Poison the memoized
                    // availability check so other git callers in this session skip cleanly,
                    // then return silently without recording any attempt state — next startup
                    // tries fresh (no backoff machinery for what is effectively "git absent").
                    if (errorMessage.includes('xcrun: error:')) {
                        (0, gitAvailability_js_1.markGitUnavailable)();
                        (0, debug_js_1.logForDebugging)('Official marketplace auto-install: git is a non-functional macOS xcrun shim, treating as git_unavailable');
                        (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                            installed: false,
                            skipped: true,
                            git_unavailable: true,
                            macos_xcrun_shim: true,
                        });
                        return [2 /*return*/, {
                                installed: false,
                                skipped: true,
                                reason: 'git_unavailable',
                            }];
                    }
                    (0, debug_js_1.logForDebugging)("Failed to auto-install official marketplace: ".concat(errorMessage), { level: 'error' });
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    retryCount_3 = (config.officialMarketplaceAutoInstallRetryCount || 0) + 1;
                    now_3 = Date.now();
                    nextRetryDelay = calculateNextRetryDelay(retryCount_3);
                    nextRetryTime_3 = now_3 + nextRetryDelay;
                    configSaveFailed = false;
                    try {
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { officialMarketplaceAutoInstallAttempted: true, officialMarketplaceAutoInstalled: false, officialMarketplaceAutoInstallFailReason: 'unknown', officialMarketplaceAutoInstallRetryCount: retryCount_3, officialMarketplaceAutoInstallLastAttemptTime: now_3, officialMarketplaceAutoInstallNextRetryTime: nextRetryTime_3 })); });
                    }
                    catch (saveError) {
                        configSaveFailed = true;
                        configError = (0, errors_js_1.toError)(saveError);
                        (0, log_js_1.logError)(configError);
                        (0, debug_js_1.logForDebugging)("Failed to save marketplace auto-install failure state: ".concat(saveError), { level: 'error' });
                        // Still return the failure result even if config save failed
                        // This ensures we report the installation failure correctly
                    }
                    (0, index_js_1.logEvent)('tengu_official_marketplace_auto_install', {
                        installed: false,
                        skipped: true,
                        failed: true,
                        retry_count: retryCount_3,
                    });
                    return [2 /*return*/, {
                            installed: false,
                            skipped: true,
                            reason: 'unknown',
                            configSaveFailed: configSaveFailed,
                        }];
                case 10: return [2 /*return*/];
            }
        });
    });
}
