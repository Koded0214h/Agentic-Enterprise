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
exports.isBridgeEnabled = isBridgeEnabled;
exports.isBridgeEnabledBlocking = isBridgeEnabledBlocking;
exports.getBridgeDisabledReason = getBridgeDisabledReason;
exports.isEnvLessBridgeEnabled = isEnvLessBridgeEnabled;
exports.isCseShimEnabled = isCseShimEnabled;
exports.checkBridgeMinVersion = checkBridgeMinVersion;
exports.getCcrAutoConnectDefault = getCcrAutoConnectDefault;
exports.isCcrMirrorEnabled = isCcrMirrorEnabled;
var bun_bundle_1 = require("bun:bundle");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
// Namespace import breaks the bridgeEnabled → auth → config → bridgeEnabled
// cycle — authModule.foo is a live binding, so by the time the helpers below
// call it, auth.js is fully loaded. Previously used require() for the same
// deferral, but require() hits a CJS cache that diverges from the ESM
// namespace after mock.module() (daemon/auth.test.ts), breaking spyOn.
var authModule = require("../utils/auth.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var semver_js_1 = require("../utils/semver.js");
/**
 * Runtime check for bridge mode entitlement.
 *
 * Remote Control requires a claude.ai subscription (the bridge auths to CCR
 * with the claude.ai OAuth token). isClaudeAISubscriber() excludes
 * Bedrock/Vertex/Foundry, apiKeyHelper/gateway deployments, env-var API keys,
 * and Console API logins — none of which have the OAuth token CCR needs.
 * See github.com/deshaw/anthropic-issues/issues/24.
 *
 * The `feature('BRIDGE_MODE')` guard ensures the GrowthBook string literal
 * is only referenced when bridge mode is enabled at build time.
 */
function isBridgeEnabled() {
    // Positive ternary pattern — see docs/feature-gating.md.
    // Negative pattern (if (!feature(...)) return) does not eliminate
    // inline string literals from external builds.
    return (0, bun_bundle_1.feature)('BRIDGE_MODE')
        ? isClaudeAISubscriber() &&
            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_ccr_bridge', false)
        : false;
}
/**
 * Blocking entitlement check for Remote Control.
 *
 * Returns cached `true` immediately (fast path). If the disk cache says
 * `false` or is missing, awaits GrowthBook init and fetches the fresh
 * server value (slow path, max ~5s), then writes it to disk.
 *
 * Use at entitlement gates where a stale `false` would unfairly block access.
 * For user-facing error paths, prefer `getBridgeDisabledReason()` which gives
 * a specific diagnostic. For render-body UI visibility checks, use
 * `isBridgeEnabled()` instead.
 */
function isBridgeEnabledBlocking() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('BRIDGE_MODE')) return [3 /*break*/, 3];
                    _b = isClaudeAISubscriber();
                    if (!_b) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, growthbook_js_1.checkGate_CACHED_OR_BLOCKING)('tengu_ccr_bridge')];
                case 1:
                    _b = (_c.sent());
                    _c.label = 2;
                case 2:
                    _a = _b;
                    return [3 /*break*/, 4];
                case 3:
                    _a = false;
                    _c.label = 4;
                case 4: return [2 /*return*/, _a];
            }
        });
    });
}
/**
 * Diagnostic message for why Remote Control is unavailable, or null if
 * it's enabled. Call this instead of a bare `isBridgeEnabledBlocking()`
 * check when you need to show the user an actionable error.
 *
 * The GrowthBook gate targets on organizationUUID, which comes from
 * config.oauthAccount — populated by /api/oauth/profile during login.
 * That endpoint requires the user:profile scope. Tokens without it
 * (setup-token, CLAUDE_CODE_OAUTH_TOKEN env var, or pre-scope-expansion
 * logins) leave oauthAccount unpopulated, so the gate falls back to
 * false and users see a dead-end "not enabled" message with no hint
 * that re-login would fix it. See CC-1165 / gh-33105.
 */
function getBridgeDisabledReason() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('BRIDGE_MODE')) return [3 /*break*/, 2];
                    if (!isClaudeAISubscriber()) {
                        return [2 /*return*/, 'Remote Control requires a claude.ai subscription. Run `claude auth login` to sign in with your claude.ai account.'];
                    }
                    if (!hasProfileScope()) {
                        return [2 /*return*/, 'Remote Control requires a full-scope login token. Long-lived tokens (from `claude setup-token` or CLAUDE_CODE_OAUTH_TOKEN) are limited to inference-only for security reasons. Run `claude auth login` to use Remote Control.'];
                    }
                    if (!((_a = getOauthAccountInfo()) === null || _a === void 0 ? void 0 : _a.organizationUuid)) {
                        return [2 /*return*/, 'Unable to determine your organization for Remote Control eligibility. Run `claude auth login` to refresh your account information.'];
                    }
                    return [4 /*yield*/, (0, growthbook_js_1.checkGate_CACHED_OR_BLOCKING)('tengu_ccr_bridge')];
                case 1:
                    if (!(_b.sent())) {
                        return [2 /*return*/, 'Remote Control is not yet enabled for your account.'];
                    }
                    return [2 /*return*/, null];
                case 2: return [2 /*return*/, 'Remote Control is not available in this build.'];
            }
        });
    });
}
// try/catch: main.tsx:5698 calls isBridgeEnabled() while defining the Commander
// program, before enableConfigs() runs. isClaudeAISubscriber() → getGlobalConfig()
// throws "Config accessed before allowed" there. Pre-config, no OAuth token can
// exist anyway — false is correct. Same swallow getFeatureValue_CACHED_MAY_BE_STALE
// already does at growthbook.ts:775-780.
function isClaudeAISubscriber() {
    try {
        return authModule.isClaudeAISubscriber();
    }
    catch (_a) {
        return false;
    }
}
function hasProfileScope() {
    try {
        return authModule.hasProfileScope();
    }
    catch (_a) {
        return false;
    }
}
function getOauthAccountInfo() {
    try {
        return authModule.getOauthAccountInfo();
    }
    catch (_a) {
        return undefined;
    }
}
/**
 * Runtime check for the env-less (v2) REPL bridge path.
 * Returns true when the GrowthBook flag `tengu_bridge_repl_v2` is enabled.
 *
 * This gates which implementation initReplBridge uses — NOT whether bridge
 * is available at all (see isBridgeEnabled above). Daemon/print paths stay
 * on the env-based implementation regardless of this gate.
 */
function isEnvLessBridgeEnabled() {
    return (0, bun_bundle_1.feature)('BRIDGE_MODE')
        ? (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_bridge_repl_v2', false)
        : false;
}
/**
 * Kill-switch for the `cse_*` → `session_*` client-side retag shim.
 *
 * The shim exists because compat/convert.go:27 validates TagSession and the
 * claude.ai frontend routes on `session_*`, while v2 worker endpoints hand out
 * `cse_*`. Once the server tags by environment_kind and the frontend accepts
 * `cse_*` directly, flip this to false to make toCompatSessionId a no-op.
 * Defaults to true — the shim stays active until explicitly disabled.
 */
function isCseShimEnabled() {
    return (0, bun_bundle_1.feature)('BRIDGE_MODE')
        ? (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_bridge_repl_v2_cse_shim_enabled', true)
        : true;
}
/**
 * Returns an error message if the current CLI version is below the
 * minimum required for the v1 (env-based) Remote Control path, or null if the
 * version is fine. The v2 (env-less) path uses checkEnvLessBridgeMinVersion()
 * in envLessBridgeConfig.ts instead — the two implementations have independent
 * version floors.
 *
 * Uses cached (non-blocking) GrowthBook config. If GrowthBook hasn't
 * loaded yet, the default '0.0.0' means the check passes — a safe fallback.
 */
function checkBridgeMinVersion() {
    // Positive pattern — see docs/feature-gating.md.
    // Negative pattern (if (!feature(...)) return) does not eliminate
    // inline string literals from external builds.
    if ((0, bun_bundle_1.feature)('BRIDGE_MODE')) {
        var config = (0, growthbook_js_1.getDynamicConfig_CACHED_MAY_BE_STALE)('tengu_bridge_min_version', { minVersion: '0.0.0' });
        if (config.minVersion && (0, semver_js_1.lt)(MACRO.VERSION, config.minVersion)) {
            return "Your version of Claude Code (".concat(MACRO.VERSION, ") is too old for Remote Control.\nVersion ").concat(config.minVersion, " or higher is required. Run `claude update` to update.");
        }
    }
    return null;
}
/**
 * Default for remoteControlAtStartup when the user hasn't explicitly set it.
 * When the CCR_AUTO_CONNECT build flag is present (ant-only) and the
 * tengu_cobalt_harbor GrowthBook gate is on, all sessions connect to CCR by
 * default — the user can still opt out by setting remoteControlAtStartup=false
 * in config (explicit settings always win over this default).
 *
 * Defined here rather than in config.ts to avoid a direct
 * config.ts → growthbook.ts import cycle (growthbook.ts → user.ts → config.ts).
 */
function getCcrAutoConnectDefault() {
    return (0, bun_bundle_1.feature)('CCR_AUTO_CONNECT')
        ? (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_harbor', false)
        : false;
}
/**
 * Opt-in CCR mirror mode — every local session spawns an outbound-only
 * Remote Control session that receives forwarded events. Separate from
 * getCcrAutoConnectDefault (bidirectional Remote Control). Env var wins for
 * local opt-in; GrowthBook controls rollout.
 */
function isCcrMirrorEnabled() {
    return (0, bun_bundle_1.feature)('CCR_MIRROR')
        ? (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_CCR_MIRROR) ||
            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_ccr_mirror', false)
        : false;
}
