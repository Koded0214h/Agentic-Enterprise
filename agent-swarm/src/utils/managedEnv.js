"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySafeConfigEnvironmentVariables = applySafeConfigEnvironmentVariables;
exports.applyConfigEnvironmentVariables = applyConfigEnvironmentVariables;
var syncCache_js_1 = require("../services/remoteManagedSettings/syncCache.js");
var caCerts_js_1 = require("./caCerts.js");
var config_js_1 = require("./config.js");
var envUtils_js_1 = require("./envUtils.js");
var managedEnvConstants_js_1 = require("./managedEnvConstants.js");
var mtls_js_1 = require("./mtls.js");
var proxy_js_1 = require("./proxy.js");
var constants_js_1 = require("./settings/constants.js");
var settings_js_1 = require("./settings/settings.js");
/**
 * `claude ssh` remote: ANTHROPIC_UNIX_SOCKET routes auth through a -R forwarded
 * socket to a local proxy, and the launcher sets a handful of placeholder auth
 * env vars that the remote's ~/.claude settings.env MUST NOT clobber (see
 * isAnthropicAuthEnabled). Strip them from any settings-sourced env object.
 */
function withoutSSHTunnelVars(env) {
    if (!env || !process.env.ANTHROPIC_UNIX_SOCKET)
        return env || {};
    var _1 = env.ANTHROPIC_UNIX_SOCKET, _2 = env.ANTHROPIC_BASE_URL, _3 = env.ANTHROPIC_API_KEY, _4 = env.ANTHROPIC_AUTH_TOKEN, _5 = env.CLAUDE_CODE_OAUTH_TOKEN, rest = __rest(env, ["ANTHROPIC_UNIX_SOCKET", "ANTHROPIC_BASE_URL", "ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "CLAUDE_CODE_OAUTH_TOKEN"]);
    return rest;
}
/**
 * When the host owns inference routing (sets
 * CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST in spawn env), strip
 * provider-selection / model-default vars from settings-sourced env so a
 * user's ~/.claude/settings.json can't redirect requests away from the
 * host-configured provider.
 */
function withoutHostManagedProviderVars(env) {
    if (!env)
        return {};
    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST)) {
        return env;
    }
    var out = {};
    for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (!(0, managedEnvConstants_js_1.isProviderManagedEnvVar)(key)) {
            out[key] = value;
        }
    }
    return out;
}
/**
 * Snapshot of env keys present before any settings.env is applied — for CCD,
 * these are the keys the desktop host set to orchestrate the subprocess.
 * Settings must not override them (OTEL_LOGS_EXPORTER=console would corrupt
 * the stdio JSON-RPC transport). Keys added LATER by user/project settings
 * are not in this set, so mid-session settings.json changes still apply.
 * Lazy-captured on first applySafeConfigEnvironmentVariables() call.
 */
var ccdSpawnEnvKeys;
function withoutCcdSpawnEnvKeys(env) {
    if (!env || !ccdSpawnEnvKeys)
        return env || {};
    var out = {};
    for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (!ccdSpawnEnvKeys.has(key))
            out[key] = value;
    }
    return out;
}
/**
 * Compose the strip filters applied to every settings-sourced env object.
 */
function filterSettingsEnv(env) {
    return withoutCcdSpawnEnvKeys(withoutHostManagedProviderVars(withoutSSHTunnelVars(env)));
}
/**
 * Trusted setting sources whose env vars can be applied before the trust dialog.
 *
 * - userSettings (~/.claude/settings.json): controlled by the user, not project-specific
 * - flagSettings (--settings CLI flag or SDK inline settings): explicitly passed by the user
 * - policySettings (managed settings from enterprise API or local managed-settings.json):
 *   controlled by IT/admin (highest priority, cannot be overridden)
 *
 * Project-scoped sources (projectSettings, localSettings) are excluded because they live
 * inside the project directory and could be committed by a malicious actor to redirect
 * traffic (e.g., ANTHROPIC_BASE_URL) to an attacker-controlled server.
 */
var TRUSTED_SETTING_SOURCES = [
    'userSettings',
    'flagSettings',
    'policySettings',
];
/**
 * Apply environment variables from trusted sources to process.env.
 * Called before the trust dialog so that user/enterprise env vars like
 * ANTHROPIC_BASE_URL take effect during first-run/onboarding.
 *
 * For trusted sources (user settings, managed settings, CLI flags), ALL env vars
 * are applied — including ones like ANTHROPIC_BASE_URL that would be dangerous
 * from project-scoped settings.
 *
 * For project-scoped sources (projectSettings, localSettings), only safe env vars
 * from the SAFE_ENV_VARS allowlist are applied. These are applied after trust is
 * fully established via applyConfigEnvironmentVariables().
 */
function applySafeConfigEnvironmentVariables() {
    var _a, _b, _c;
    // Capture CCD spawn-env keys before any settings.env is applied (once).
    if (ccdSpawnEnvKeys === undefined) {
        ccdSpawnEnvKeys =
            process.env.CLAUDE_CODE_ENTRYPOINT === 'claude-desktop'
                ? new Set(Object.keys(process.env))
                : null;
    }
    // Global config (~/.claude.json) is user-controlled. In CCD mode,
    // filterSettingsEnv strips keys that were in the spawn env snapshot so
    // the desktop host's operational vars (OTEL, etc.) are not overridden.
    Object.assign(process.env, filterSettingsEnv((0, config_js_1.getGlobalConfig)().env));
    // Apply ALL env vars from trusted setting sources, policySettings last.
    // Gate on isSettingSourceEnabled so SDK settingSources: [] (isolation mode)
    // doesn't get clobbered by ~/.claude/settings.json env (gh#217). policy/flag
    // sources are always enabled, so this only ever filters userSettings.
    for (var _i = 0, TRUSTED_SETTING_SOURCES_1 = TRUSTED_SETTING_SOURCES; _i < TRUSTED_SETTING_SOURCES_1.length; _i++) {
        var source = TRUSTED_SETTING_SOURCES_1[_i];
        if (source === 'policySettings')
            continue;
        if (!(0, constants_js_1.isSettingSourceEnabled)(source))
            continue;
        Object.assign(process.env, filterSettingsEnv((_a = (0, settings_js_1.getSettingsForSource)(source)) === null || _a === void 0 ? void 0 : _a.env));
    }
    // Compute remote-managed-settings eligibility now, with userSettings and
    // flagSettings env applied. Eligibility reads CLAUDE_CODE_USE_BEDROCK,
    // ANTHROPIC_BASE_URL — both settable via settings.env.
    // getSettingsForSource('policySettings') below consults the remote cache,
    // which guards on this. The two-phase structure makes the ordering
    // dependency visible: non-policy env → eligibility → policy env.
    (0, syncCache_js_1.isRemoteManagedSettingsEligible)();
    Object.assign(process.env, filterSettingsEnv((_b = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _b === void 0 ? void 0 : _b.env));
    // Apply only safe env vars from the fully-merged settings (which includes
    // project-scoped sources). For safe vars that also exist in trusted sources,
    // the merged value (which may come from a higher-priority project source)
    // will overwrite the trusted value — this is acceptable since these vars are
    // in the safe allowlist. Only policySettings values are guaranteed to survive
    // unchanged (it has the highest merge priority in both loops) — except
    // provider-routing vars, which filterSettingsEnv strips from every source
    // when CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST is set.
    var settingsEnv = filterSettingsEnv((_c = (0, settings_js_1.getSettings_DEPRECATED)()) === null || _c === void 0 ? void 0 : _c.env);
    for (var _d = 0, _e = Object.entries(settingsEnv); _d < _e.length; _d++) {
        var _f = _e[_d], key = _f[0], value = _f[1];
        if (managedEnvConstants_js_1.SAFE_ENV_VARS.has(key.toUpperCase())) {
            process.env[key] = value;
        }
    }
}
/**
 * Apply environment variables from settings to process.env.
 * This applies ALL environment variables (except provider-routing vars when
 * CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST is set — see filterSettingsEnv) and
 * should only be called after trust is established. This applies potentially
 * dangerous environment variables such as LD_PRELOAD, PATH, etc.
 */
function applyConfigEnvironmentVariables() {
    var _a;
    Object.assign(process.env, filterSettingsEnv((0, config_js_1.getGlobalConfig)().env));
    Object.assign(process.env, filterSettingsEnv((_a = (0, settings_js_1.getSettings_DEPRECATED)()) === null || _a === void 0 ? void 0 : _a.env));
    // Clear caches so agents are rebuilt with the new env vars
    (0, caCerts_js_1.clearCACertsCache)();
    (0, mtls_js_1.clearMTLSCache)();
    (0, proxy_js_1.clearProxyCache)();
    // Reconfigure proxy/mTLS agents to pick up any proxy env vars from settings
    (0, proxy_js_1.configureGlobalAgents)();
}
