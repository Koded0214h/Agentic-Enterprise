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
exports.checkNeedsClaudeAiLogin = checkNeedsClaudeAiLogin;
exports.checkIsGitClean = checkIsGitClean;
exports.checkHasRemoteEnvironment = checkHasRemoteEnvironment;
exports.checkIsInGitRepo = checkIsInGitRepo;
exports.checkHasGitRemote = checkHasGitRemote;
exports.checkGithubAppInstalled = checkGithubAppInstalled;
exports.checkGithubTokenSynced = checkGithubTokenSynced;
exports.checkRepoForRemoteAccess = checkRepoForRemoteAccess;
var axios_1 = require("axios");
var oauth_js_1 = require("src/constants/oauth.js");
var client_js_1 = require("src/services/oauth/client.js");
var growthbook_js_1 = require("../../../services/analytics/growthbook.js");
var auth_js_1 = require("../../auth.js");
var cwd_js_1 = require("../../cwd.js");
var debug_js_1 = require("../../debug.js");
var detectRepository_js_1 = require("../../detectRepository.js");
var errors_js_1 = require("../../errors.js");
var git_js_1 = require("../../git.js");
var api_js_1 = require("../../teleport/api.js");
var environments_js_1 = require("../../teleport/environments.js");
/**
 * Checks if user needs to log in with Claude.ai
 * Extracted from getTeleportErrors() in TeleportError.tsx
 * @returns true if login is required, false otherwise
 */
function checkNeedsClaudeAiLogin() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!(0, auth_js_1.isClaudeAISubscriber)()) {
                return [2 /*return*/, false];
            }
            return [2 /*return*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
        });
    });
}
/**
 * Checks if git working directory is clean (no uncommitted changes)
 * Ignores untracked files since they won't be lost during branch switching
 * Extracted from getTeleportErrors() in TeleportError.tsx
 * @returns true if git is clean, false otherwise
 */
function checkIsGitClean() {
    return __awaiter(this, void 0, void 0, function () {
        var isClean;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, git_js_1.getIsClean)({ ignoreUntracked: true })];
                case 1:
                    isClean = _a.sent();
                    return [2 /*return*/, isClean];
            }
        });
    });
}
/**
 * Checks if user has access to at least one remote environment
 * @returns true if user has remote environments, false otherwise
 */
function checkHasRemoteEnvironment() {
    return __awaiter(this, void 0, void 0, function () {
        var environments, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, environments_js_1.fetchEnvironments)()];
                case 1:
                    environments = _a.sent();
                    return [2 /*return*/, environments.length > 0];
                case 2:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("checkHasRemoteEnvironment failed: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks if current directory is inside a git repository (has .git/).
 * Distinct from checkHasGitRemote — a local-only repo passes this but not that.
 */
function checkIsInGitRepo() {
    return (0, git_js_1.findGitRoot)((0, cwd_js_1.getCwd)()) !== null;
}
/**
 * Checks if current repository has a GitHub remote configured.
 * Returns false for local-only repos (git init with no `origin`).
 */
function checkHasGitRemote() {
    return __awaiter(this, void 0, void 0, function () {
        var repository;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, detectRepository_js_1.detectCurrentRepository)()];
                case 1:
                    repository = _a.sent();
                    return [2 /*return*/, repository !== null];
            }
        });
    });
}
/**
 * Checks if GitHub app is installed on a specific repository
 * @param owner The repository owner (e.g., "anthropics")
 * @param repo The repository name (e.g., "claude-cli-internal")
 * @returns true if GitHub app is installed, false otherwise
 */
function checkGithubAppInstalled(owner, repo, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, orgUUID, url, headers, response, installed, error_2, status_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    accessToken = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken;
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('checkGithubAppInstalled: No access token found, assuming app not installed');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, client_js_1.getOrganizationUUID)()];
                case 1:
                    orgUUID = _c.sent();
                    if (!orgUUID) {
                        (0, debug_js_1.logForDebugging)('checkGithubAppInstalled: No org UUID found, assuming app not installed');
                        return [2 /*return*/, false];
                    }
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/code/repos/").concat(owner, "/").concat(repo);
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    (0, debug_js_1.logForDebugging)("Checking GitHub app installation for ".concat(owner, "/").concat(repo));
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                            timeout: 15000,
                            signal: signal,
                        })];
                case 2:
                    response = _c.sent();
                    if (response.status === 200) {
                        if (response.data.status) {
                            installed = response.data.status.app_installed;
                            (0, debug_js_1.logForDebugging)("GitHub app ".concat(installed ? 'is' : 'is not', " installed on ").concat(owner, "/").concat(repo));
                            return [2 /*return*/, installed];
                        }
                        // status is null - app is not installed on this repo
                        (0, debug_js_1.logForDebugging)("GitHub app is not installed on ".concat(owner, "/").concat(repo, " (status is null)"));
                        return [2 /*return*/, false];
                    }
                    (0, debug_js_1.logForDebugging)("checkGithubAppInstalled: Unexpected response status ".concat(response.status));
                    return [2 /*return*/, false];
                case 3:
                    error_2 = _c.sent();
                    // 4XX errors typically mean app is not installed or repo not accessible
                    if (axios_1.default.isAxiosError(error_2)) {
                        status_1 = (_b = error_2.response) === null || _b === void 0 ? void 0 : _b.status;
                        if (status_1 && status_1 >= 400 && status_1 < 500) {
                            (0, debug_js_1.logForDebugging)("checkGithubAppInstalled: Got ".concat(status_1, " error, app likely not installed on ").concat(owner, "/").concat(repo));
                            return [2 /*return*/, false];
                        }
                    }
                    (0, debug_js_1.logForDebugging)("checkGithubAppInstalled error: ".concat((0, errors_js_1.errorMessage)(error_2)));
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks if the user has synced their GitHub credentials via /web-setup
 * @returns true if GitHub token is synced, false otherwise
 */
function checkGithubTokenSynced() {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, orgUUID, url, headers, response, synced, error_3, status_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    accessToken = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken;
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('checkGithubTokenSynced: No access token found');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, client_js_1.getOrganizationUUID)()];
                case 1:
                    orgUUID = _d.sent();
                    if (!orgUUID) {
                        (0, debug_js_1.logForDebugging)('checkGithubTokenSynced: No org UUID found');
                        return [2 /*return*/, false];
                    }
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/api/oauth/organizations/").concat(orgUUID, "/sync/github/auth");
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    (0, debug_js_1.logForDebugging)('Checking if GitHub token is synced via web-setup');
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                            timeout: 15000,
                        })];
                case 2:
                    response = _d.sent();
                    synced = response.status === 200 && ((_b = response.data) === null || _b === void 0 ? void 0 : _b.is_authenticated) === true;
                    (0, debug_js_1.logForDebugging)("GitHub token synced: ".concat(synced, " (status=").concat(response.status, ", data=").concat(JSON.stringify(response.data), ")"));
                    return [2 /*return*/, synced];
                case 3:
                    error_3 = _d.sent();
                    if (axios_1.default.isAxiosError(error_3)) {
                        status_2 = (_c = error_3.response) === null || _c === void 0 ? void 0 : _c.status;
                        if (status_2 && status_2 >= 400 && status_2 < 500) {
                            (0, debug_js_1.logForDebugging)("checkGithubTokenSynced: Got ".concat(status_2, ", token not synced"));
                            return [2 /*return*/, false];
                        }
                    }
                    (0, debug_js_1.logForDebugging)("checkGithubTokenSynced error: ".concat((0, errors_js_1.errorMessage)(error_3)));
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Tiered check for whether a GitHub repo is accessible for remote operations.
 * 1. GitHub App installed on the repo
 * 2. GitHub token synced via /web-setup
 * 3. Neither — caller should prompt user to set up access
 */
function checkRepoForRemoteAccess(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, checkGithubAppInstalled(owner, repo)];
                case 1:
                    if (_b.sent()) {
                        return [2 /*return*/, { hasAccess: true, method: 'github-app' }];
                    }
                    _a = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_lantern', false);
                    if (!_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, checkGithubTokenSynced()];
                case 2:
                    _a = (_b.sent());
                    _b.label = 3;
                case 3:
                    if (_a) {
                        return [2 /*return*/, { hasAccess: true, method: 'token-sync' }];
                    }
                    return [2 /*return*/, { hasAccess: false, method: 'none' }];
            }
        });
    });
}
