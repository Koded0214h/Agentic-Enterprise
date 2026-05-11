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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBackgroundRemoteSessionEligibility = checkBackgroundRemoteSessionEligibility;
var growthbook_js_1 = require("../../../services/analytics/growthbook.js");
var index_js_1 = require("../../../services/policyLimits/index.js");
var detectRepository_js_1 = require("../../detectRepository.js");
var envUtils_js_1 = require("../../envUtils.js");
var preconditions_js_1 = require("./preconditions.js");
/**
 * Checks eligibility for creating a background remote session
 * Returns an array of failed preconditions (empty array means all checks passed)
 *
 * @returns Array of failed preconditions
 */
function checkBackgroundRemoteSessionEligibility() {
    return __awaiter(this, arguments, void 0, function (_a) {
        var errors, _b, needsLogin, hasRemoteEnv, repository, bundleSeedGateOn, _c, _d, hasGithubApp;
        var _e = _a === void 0 ? {} : _a, _f = _e.skipBundle, skipBundle = _f === void 0 ? false : _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    errors = [];
                    // Check policy first - if blocked, no need to check other preconditions
                    if (!(0, index_js_1.isPolicyAllowed)('allow_remote_sessions')) {
                        errors.push({ type: 'policy_blocked' });
                        return [2 /*return*/, errors];
                    }
                    return [4 /*yield*/, Promise.all([
                            (0, preconditions_js_1.checkNeedsClaudeAiLogin)(),
                            (0, preconditions_js_1.checkHasRemoteEnvironment)(),
                            (0, detectRepository_js_1.detectCurrentRepositoryWithHost)(),
                        ])];
                case 1:
                    _b = _g.sent(), needsLogin = _b[0], hasRemoteEnv = _b[1], repository = _b[2];
                    if (needsLogin) {
                        errors.push({ type: 'not_logged_in' });
                    }
                    if (!hasRemoteEnv) {
                        errors.push({ type: 'no_remote_environment' });
                    }
                    _c = !skipBundle;
                    if (!_c) return [3 /*break*/, 4];
                    _d = (0, envUtils_js_1.isEnvTruthy)(process.env.CCR_FORCE_BUNDLE) ||
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CCR_ENABLE_BUNDLE);
                    if (_d) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, growthbook_js_1.checkGate_CACHED_OR_BLOCKING)('tengu_ccr_bundle_seed_enabled')];
                case 2:
                    _d = (_g.sent());
                    _g.label = 3;
                case 3:
                    _c = (_d);
                    _g.label = 4;
                case 4:
                    bundleSeedGateOn = _c;
                    if (!!(0, preconditions_js_1.checkIsInGitRepo)()) return [3 /*break*/, 5];
                    errors.push({ type: 'not_in_git_repo' });
                    return [3 /*break*/, 9];
                case 5:
                    if (!bundleSeedGateOn) return [3 /*break*/, 6];
                    return [3 /*break*/, 9];
                case 6:
                    if (!(repository === null)) return [3 /*break*/, 7];
                    errors.push({ type: 'no_git_remote' });
                    return [3 /*break*/, 9];
                case 7:
                    if (!(repository.host === 'github.com')) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, preconditions_js_1.checkGithubAppInstalled)(repository.owner, repository.name)];
                case 8:
                    hasGithubApp = _g.sent();
                    if (!hasGithubApp) {
                        errors.push({ type: 'github_app_not_installed' });
                    }
                    _g.label = 9;
                case 9: return [2 /*return*/, errors];
            }
        });
    });
}
