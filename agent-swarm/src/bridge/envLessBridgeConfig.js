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
exports.DEFAULT_ENV_LESS_BRIDGE_CONFIG = void 0;
exports.getEnvLessBridgeConfig = getEnvLessBridgeConfig;
exports.checkEnvLessBridgeMinVersion = checkEnvLessBridgeMinVersion;
exports.shouldShowAppUpgradeMessage = shouldShowAppUpgradeMessage;
var v4_1 = require("zod/v4");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var lazySchema_js_1 = require("../utils/lazySchema.js");
var semver_js_1 = require("../utils/semver.js");
var bridgeEnabled_js_1 = require("./bridgeEnabled.js");
exports.DEFAULT_ENV_LESS_BRIDGE_CONFIG = {
    init_retry_max_attempts: 3,
    init_retry_base_delay_ms: 500,
    init_retry_jitter_fraction: 0.25,
    init_retry_max_delay_ms: 4000,
    http_timeout_ms: 10000,
    uuid_dedup_buffer_size: 2000,
    heartbeat_interval_ms: 20000,
    heartbeat_jitter_fraction: 0.1,
    token_refresh_buffer_ms: 300000,
    teardown_archive_timeout_ms: 1500,
    connect_timeout_ms: 15000,
    min_version: '0.0.0',
    should_show_app_upgrade_message: false,
};
// Floors reject the whole object on violation (fall back to DEFAULT) rather
// than partially trusting — same defense-in-depth as pollConfig.ts.
var envLessBridgeConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        init_retry_max_attempts: v4_1.z.number().int().min(1).max(10).default(3),
        init_retry_base_delay_ms: v4_1.z.number().int().min(100).default(500),
        init_retry_jitter_fraction: v4_1.z.number().min(0).max(1).default(0.25),
        init_retry_max_delay_ms: v4_1.z.number().int().min(500).default(4000),
        http_timeout_ms: v4_1.z.number().int().min(2000).default(10000),
        uuid_dedup_buffer_size: v4_1.z.number().int().min(100).max(50000).default(2000),
        // Server TTL is 60s. Floor 5s prevents thrash; cap 30s keeps ≥2× margin.
        heartbeat_interval_ms: v4_1.z
            .number()
            .int()
            .min(5000)
            .max(30000)
            .default(20000),
        // ±fraction per beat. Cap 0.5: at max interval (30s) × 1.5 = 45s worst case,
        // still under the 60s TTL.
        heartbeat_jitter_fraction: v4_1.z.number().min(0).max(0.5).default(0.1),
        // Floor 30s prevents tight-looping. Cap 30min rejects buffer-vs-delay
        // semantic inversion: ops entering expires_in-5min (the *delay until
        // refresh*) instead of 5min (the *buffer before expiry*) yields
        // delayMs = expires_in - buffer ≈ 5min instead of ≈4h. Both are positive
        // durations so .min() alone can't distinguish; .max() catches the
        // inverted value since buffer ≥ 30min is nonsensical for a multi-hour JWT.
        token_refresh_buffer_ms: v4_1.z
            .number()
            .int()
            .min(30000)
            .max(1800000)
            .default(300000),
        // Cap 2000 keeps this under gracefulShutdown's 2s cleanup race — a higher
        // timeout just lies to axios since forceExit kills the socket regardless.
        teardown_archive_timeout_ms: v4_1.z
            .number()
            .int()
            .min(500)
            .max(2000)
            .default(1500),
        // Observed p99 connect is ~2-3s; 15s is ~5× headroom. Floor 5s bounds
        // false-positive rate under transient slowness; cap 60s bounds how long
        // a truly-stalled session stays dark.
        connect_timeout_ms: v4_1.z.number().int().min(5000).max(60000).default(15000),
        min_version: v4_1.z
            .string()
            .refine(function (v) {
            try {
                (0, semver_js_1.lt)(v, '0.0.0');
                return true;
            }
            catch (_a) {
                return false;
            }
        })
            .default('0.0.0'),
        should_show_app_upgrade_message: v4_1.z.boolean().default(false),
    });
});
/**
 * Fetch the env-less bridge timing config from GrowthBook. Read once per
 * initEnvLessBridgeCore call — config is fixed for the lifetime of a bridge
 * session.
 *
 * Uses the blocking getter (not _CACHED_MAY_BE_STALE) because /remote-control
 * runs well after GrowthBook init — initializeGrowthBook() resolves instantly,
 * so there's no startup penalty, and we get the fresh in-memory remoteEval
 * value instead of the stale-on-first-read disk cache. The _DEPRECATED suffix
 * warns against startup-path usage, which this isn't.
 */
function getEnvLessBridgeConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var raw, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, growthbook_js_1.getFeatureValue_DEPRECATED)('tengu_bridge_repl_v2_config', exports.DEFAULT_ENV_LESS_BRIDGE_CONFIG)];
                case 1:
                    raw = _a.sent();
                    parsed = envLessBridgeConfigSchema().safeParse(raw);
                    return [2 /*return*/, parsed.success ? parsed.data : exports.DEFAULT_ENV_LESS_BRIDGE_CONFIG];
            }
        });
    });
}
/**
 * Returns an error message if the current CLI version is below the minimum
 * required for the env-less (v2) bridge path, or null if the version is fine.
 *
 * v2 analogue of checkBridgeMinVersion() — reads from tengu_bridge_repl_v2_config
 * instead of tengu_bridge_min_version so the two implementations can enforce
 * independent floors.
 */
function checkEnvLessBridgeMinVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var cfg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getEnvLessBridgeConfig()];
                case 1:
                    cfg = _a.sent();
                    if (cfg.min_version && (0, semver_js_1.lt)(MACRO.VERSION, cfg.min_version)) {
                        return [2 /*return*/, "Your version of Claude Code (".concat(MACRO.VERSION, ") is too old for Remote Control.\nVersion ").concat(cfg.min_version, " or higher is required. Run `claude update` to update.")];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Whether to nudge users toward upgrading their claude.ai app when a
 * Remote Control session starts. True only when the v2 bridge is active
 * AND the should_show_app_upgrade_message config bit is set — lets us
 * roll the v2 bridge before the app ships the new session-list query.
 */
function shouldShowAppUpgradeMessage() {
    return __awaiter(this, void 0, void 0, function () {
        var cfg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(0, bridgeEnabled_js_1.isEnvLessBridgeEnabled)())
                        return [2 /*return*/, false];
                    return [4 /*yield*/, getEnvLessBridgeConfig()];
                case 1:
                    cfg = _a.sent();
                    return [2 /*return*/, cfg.should_show_app_upgrade_message];
            }
        });
    });
}
