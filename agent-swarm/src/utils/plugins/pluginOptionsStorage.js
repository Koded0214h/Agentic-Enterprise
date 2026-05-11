"use strict";
/**
 * Plugin option storage and substitution.
 *
 * Plugins declare user-configurable options in `manifest.userConfig` — a record
 * of field schemas matching `McpbUserConfigurationOption`. At enable time the
 * user is prompted for values. Storage splits by `sensitive`:
 *   - `sensitive: true`  → secureStorage (keychain on macOS, .credentials.json elsewhere)
 *   - everything else    → settings.json `pluginConfigs[pluginId].options`
 *
 * `loadPluginOptions` reads and merges both. The substitution helpers are also
 * here (moved from mcpPluginIntegration.ts) so hooks/LSP/skills don't all
 * import from MCP-specific code.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPluginOptions = void 0;
exports.getPluginStorageId = getPluginStorageId;
exports.clearPluginOptionsCache = clearPluginOptionsCache;
exports.savePluginOptions = savePluginOptions;
exports.deletePluginOptions = deletePluginOptions;
exports.getUnconfiguredOptions = getUnconfiguredOptions;
exports.substitutePluginVariables = substitutePluginVariables;
exports.substituteUserConfigVariables = substituteUserConfigVariables;
exports.substituteUserConfigInContent = substituteUserConfigInContent;
var memoize_js_1 = require("lodash-es/memoize.js");
var debug_js_1 = require("../debug.js");
var log_js_1 = require("../log.js");
var index_js_1 = require("../secureStorage/index.js");
var settings_js_1 = require("../settings/settings.js");
var mcpbHandler_js_1 = require("./mcpbHandler.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
/**
 * Canonical storage key for a plugin's options in both `settings.pluginConfigs`
 * and `secureStorage.pluginSecrets`. Today this is `plugin.source` — always
 * `"${name}@${marketplace}"` (pluginLoader.ts:1400). `plugin.repository` is
 * a backward-compat alias that's set to the same string (1401); don't use it
 * for storage. UI code that manually constructs `` `${name}@${marketplace}` ``
 * produces the same key by convention — see PluginOptionsFlow, ManagePlugins.
 *
 * Exists so there's exactly one place to change if the key format ever drifts.
 */
function getPluginStorageId(plugin) {
    return plugin.source;
}
/**
 * Load saved option values for a plugin, merging non-sensitive (from settings)
 * with sensitive (from secureStorage). SecureStorage wins on key collision.
 *
 * Memoized per-pluginId because hooks can fire per-tool-call and each call
 * would otherwise do a settings read + keychain spawn. Cache cleared via
 * `clearPluginOptionsCache` when settings change or plugins reload.
 */
exports.loadPluginOptions = (0, memoize_js_1.default)(function (pluginId) {
    var _a, _b, _c, _d, _e, _f;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var nonSensitive = (_c = (_b = (_a = settings.pluginConfigs) === null || _a === void 0 ? void 0 : _a[pluginId]) === null || _b === void 0 ? void 0 : _b.options) !== null && _c !== void 0 ? _c : {};
    // NOTE: storage.read() spawns `security find-generic-password` on macOS
    // (~50-100ms, synchronous). Mitigated by the memoize above (per-pluginId,
    // session-lifetime) + keychain's own 30s TTL cache — so one blocking spawn
    // per session per plugin-with-options. /reload-plugins clears the memoize
    // and the next hook/MCP-load after that eats a fresh spawn.
    var storage = (0, index_js_1.getSecureStorage)();
    var sensitive = (_f = (_e = (_d = storage.read()) === null || _d === void 0 ? void 0 : _d.pluginSecrets) === null || _e === void 0 ? void 0 : _e[pluginId]) !== null && _f !== void 0 ? _f : {};
    // secureStorage wins on collision — schema determines destination so
    // collision shouldn't happen, but if a user hand-edits settings.json we
    // trust the more secure source.
    return __assign(__assign({}, nonSensitive), sensitive);
});
function clearPluginOptionsCache() {
    var _a, _b;
    (_b = (_a = exports.loadPluginOptions.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Save option values, splitting by `schema[key].sensitive`. Non-sensitive go
 * to userSettings; sensitive go to secureStorage. Writes are skipped if nothing
 * in that category is present.
 *
 * Clears the load cache on success so the next `loadPluginOptions` sees fresh.
 */
function savePluginOptions(pluginId, values, schema) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var nonSensitive = {};
    var sensitive = {};
    for (var _i = 0, _j = Object.entries(values); _i < _j.length; _i++) {
        var _k = _j[_i], key = _k[0], value = _k[1];
        if (((_a = schema[key]) === null || _a === void 0 ? void 0 : _a.sensitive) === true) {
            sensitive[key] = String(value);
        }
        else {
            nonSensitive[key] = value;
        }
    }
    // Scrub sets — see saveMcpServerUserConfig (mcpbHandler.ts) for the
    // rationale. Only keys in THIS save are scrubbed from the other store,
    // so partial reconfigures don't lose data.
    var sensitiveKeysInThisSave = new Set(Object.keys(sensitive));
    var nonSensitiveKeysInThisSave = new Set(Object.keys(nonSensitive));
    // secureStorage FIRST — if keychain fails, throw before touching
    // settings.json so old plaintext (if any) stays as fallback.
    var storage = (0, index_js_1.getSecureStorage)();
    var existingInSecureStorage = (_d = (_c = (_b = storage.read()) === null || _b === void 0 ? void 0 : _b.pluginSecrets) === null || _c === void 0 ? void 0 : _c[pluginId]) !== null && _d !== void 0 ? _d : undefined;
    var secureScrubbed = existingInSecureStorage
        ? Object.fromEntries(Object.entries(existingInSecureStorage).filter(function (_a) {
            var k = _a[0];
            return !nonSensitiveKeysInThisSave.has(k);
        }))
        : undefined;
    var needSecureScrub = secureScrubbed &&
        existingInSecureStorage &&
        Object.keys(secureScrubbed).length !==
            Object.keys(existingInSecureStorage).length;
    if (Object.keys(sensitive).length > 0 || needSecureScrub) {
        var existing = (_e = storage.read()) !== null && _e !== void 0 ? _e : {};
        if (!existing.pluginSecrets) {
            existing.pluginSecrets = {};
        }
        existing.pluginSecrets[pluginId] = __assign(__assign({}, secureScrubbed), sensitive);
        var result = storage.update(existing);
        if (!result.success) {
            var err = new Error("Failed to save sensitive plugin options for ".concat(pluginId, " to secure storage"));
            (0, log_js_1.logError)(err);
            throw err;
        }
        if (result.warning) {
            (0, debug_js_1.logForDebugging)("Plugin secrets save warning: ".concat(result.warning), {
                level: 'warn',
            });
        }
    }
    // settings.json AFTER secureStorage — scrub sensitive keys via explicit
    // undefined (mergeWith deletion pattern).
    //
    // TODO: getSettings_DEPRECATED returns MERGED settings across all scopes.
    // Mutating that and writing to userSettings can leak project-scope
    // pluginConfigs into ~/.claude/settings.json. Same pattern exists in
    // saveMcpServerUserConfig. Safe today since pluginConfigs is only ever
    // written here (user-scope), but will bite if we add project-scoped
    // plugin options.
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var existingInSettings = (_h = (_g = (_f = settings.pluginConfigs) === null || _f === void 0 ? void 0 : _f[pluginId]) === null || _g === void 0 ? void 0 : _g.options) !== null && _h !== void 0 ? _h : {};
    var keysToScrubFromSettings = Object.keys(existingInSettings).filter(function (k) {
        return sensitiveKeysInThisSave.has(k);
    });
    if (Object.keys(nonSensitive).length > 0 ||
        keysToScrubFromSettings.length > 0) {
        if (!settings.pluginConfigs) {
            settings.pluginConfigs = {};
        }
        if (!settings.pluginConfigs[pluginId]) {
            settings.pluginConfigs[pluginId] = {};
        }
        var scrubbed = Object.fromEntries(keysToScrubFromSettings.map(function (k) { return [k, undefined]; }));
        settings.pluginConfigs[pluginId].options = __assign(__assign({}, nonSensitive), scrubbed);
        var result = (0, settings_js_1.updateSettingsForSource)('userSettings', settings);
        if (result.error) {
            (0, log_js_1.logError)(result.error);
            throw new Error("Failed to save plugin options for ".concat(pluginId, ": ").concat(result.error.message));
        }
    }
    clearPluginOptionsCache();
}
/**
 * Delete all stored option values for a plugin — both the non-sensitive
 * `settings.pluginConfigs[pluginId]` entry and the sensitive
 * `secureStorage.pluginSecrets[pluginId]` entry.
 *
 * Call this when the LAST installation of a plugin is uninstalled (i.e.,
 * alongside `markPluginVersionOrphaned`). Don't call on every uninstall —
 * a plugin can be installed in multiple scopes and the user's config should
 * survive removing it from one scope while it remains in another.
 *
 * Best-effort: keychain write failure is logged but doesn't throw, since
 * the uninstall itself succeeded and we don't want to surface a confusing
 * "uninstall failed" message for a cleanup side-effect.
 */
function deletePluginOptions(pluginId) {
    var _a;
    var _b;
    // Settings side — also wipes the legacy mcpServers sub-key (same story:
    // orphaned on uninstall, never cleaned up before this PR).
    //
    // Use `undefined` (not `delete`) because `updateSettingsForSource` merges
    // via `mergeWith` — absent keys are ignored, only `undefined` triggers
    // removal. Cast is deliberate (CLAUDE.md's 10% case): adding z.undefined()
    // to the schema instead (like enabledPlugins:466 does) leaks
    // `| {[k: string]: unknown}` into the public SDK type, which subsumes the
    // real object arm and kills excess-property checks for SDK consumers. The
    // mergeWith-deletion contract is internal plumbing — it shouldn't shape
    // the Zod schema. enabledPlugins gets away with it only because its other
    // arms (string[] | boolean) are non-objects that stay distinct.
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    if ((_b = settings.pluginConfigs) === null || _b === void 0 ? void 0 : _b[pluginId]) {
        // Partial<Record<K,V>> = Record<K, V | undefined> — gives us the widening
        // for the undefined value, and Partial-of-X overlaps with X so the cast
        // is a narrowing TS accepts (same approach as marketplaceManager.ts:1795).
        var pluginConfigs = (_a = {}, _a[pluginId] = undefined, _a);
        var error = (0, settings_js_1.updateSettingsForSource)('userSettings', {
            pluginConfigs: pluginConfigs,
        }).error;
        if (error) {
            (0, debug_js_1.logForDebugging)("deletePluginOptions: failed to clear settings.pluginConfigs[".concat(pluginId, "]: ").concat(error.message), { level: 'warn' });
        }
    }
    // Secure storage side — delete both the top-level pluginSecrets[pluginId]
    // and any per-server composite keys `${pluginId}/${server}` (from
    // saveMcpServerUserConfig's sensitive split). `/` prefix match is safe:
    // plugin IDs are `name@marketplace`, never contain `/`, so
    // startsWith(`${id}/`) can't false-positive on a different plugin.
    var storage = (0, index_js_1.getSecureStorage)();
    var existing = storage.read();
    if (existing === null || existing === void 0 ? void 0 : existing.pluginSecrets) {
        var prefix_1 = "".concat(pluginId, "/");
        var survivingEntries = Object.entries(existing.pluginSecrets).filter(function (_a) {
            var k = _a[0];
            return k !== pluginId && !k.startsWith(prefix_1);
        });
        if (survivingEntries.length !== Object.keys(existing.pluginSecrets).length) {
            var result = storage.update(__assign(__assign({}, existing), { pluginSecrets: survivingEntries.length > 0
                    ? Object.fromEntries(survivingEntries)
                    : undefined }));
            if (!result.success) {
                (0, debug_js_1.logForDebugging)("deletePluginOptions: failed to clear pluginSecrets for ".concat(pluginId, " from keychain"), { level: 'warn' });
            }
        }
    }
    clearPluginOptionsCache();
}
/**
 * Find option keys whose saved values don't satisfy the schema — i.e., what to
 * prompt for. Returns the schema slice for those keys, or empty if everything
 * validates. Empty manifest.userConfig → empty result.
 *
 * Used by PluginOptionsFlow to decide whether to show the prompt after enable.
 */
function getUnconfiguredOptions(plugin) {
    var _a, _b;
    var manifestSchema = plugin.manifest.userConfig;
    if (!manifestSchema || Object.keys(manifestSchema).length === 0) {
        return {};
    }
    var saved = (0, exports.loadPluginOptions)(getPluginStorageId(plugin));
    var validation = (0, mcpbHandler_js_1.validateUserConfig)(saved, manifestSchema);
    if (validation.valid) {
        return {};
    }
    // Return only the fields that failed. validateUserConfig reports errors as
    // strings keyed by title/key — simpler to just re-check each field here than
    // parse error strings.
    var unconfigured = {};
    for (var _i = 0, _c = Object.entries(manifestSchema); _i < _c.length; _i++) {
        var _d = _c[_i], key = _d[0], fieldSchema = _d[1];
        var single = (0, mcpbHandler_js_1.validateUserConfig)((_a = {}, _a[key] = saved[key], _a), (_b = {}, _b[key] = fieldSchema, _b));
        if (!single.valid) {
            unconfigured[key] = fieldSchema;
        }
    }
    return unconfigured;
}
/**
 * Substitute ${CLAUDE_PLUGIN_ROOT} and ${CLAUDE_PLUGIN_DATA} with their paths.
 * On Windows, normalizes backslashes to forward slashes so shell commands
 * don't interpret them as escape characters.
 *
 * ${CLAUDE_PLUGIN_ROOT} — version-scoped install dir (recreated on update)
 * ${CLAUDE_PLUGIN_DATA} — persistent state dir (survives updates)
 *
 * Both patterns use the function-replacement form of .replace(): ROOT so
 * `$`-patterns in NTFS paths ($$, $', $`, $&) aren't interpreted; DATA so
 * getPluginDataDir (which lazily mkdirs) only runs when actually present.
 *
 * Used in MCP/LSP server command/args/env, hook commands, skill/agent content.
 */
function substitutePluginVariables(value, plugin) {
    var normalize = function (p) {
        return process.platform === 'win32' ? p.replace(/\\/g, '/') : p;
    };
    var out = value.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function () {
        return normalize(plugin.path);
    });
    // source can be absent (e.g. hooks where pluginRoot is a skill root without
    // a plugin context). In that case ${CLAUDE_PLUGIN_DATA} is left literal.
    if (plugin.source) {
        var source_1 = plugin.source;
        out = out.replace(/\$\{CLAUDE_PLUGIN_DATA\}/g, function () {
            return normalize((0, pluginDirectories_js_1.getPluginDataDir)(source_1));
        });
    }
    return out;
}
/**
 * Substitute ${user_config.KEY} with saved option values.
 *
 * Throws on missing keys — callers pass this only after `validateUserConfig`
 * succeeded, so a miss here means a plugin references a key it never declared
 * in its schema. That's a plugin authoring bug; failing loud surfaces it.
 *
 * Use `substituteUserConfigInContent` for skill/agent prose — it handles
 * missing keys and sensitive-filtering instead of throwing.
 */
function substituteUserConfigVariables(value, userConfig) {
    return value.replace(/\$\{user_config\.([^}]+)\}/g, function (_match, key) {
        var configValue = userConfig[key];
        if (configValue === undefined) {
            throw new Error("Missing required user configuration value: ".concat(key, ". ") +
                "This should have been validated before variable substitution.");
        }
        return String(configValue);
    });
}
/**
 * Content-safe variant for skill/agent prose. Differences from
 * `substituteUserConfigVariables`:
 *
 *   - Sensitive-marked keys substitute to a descriptive placeholder instead of
 *     the actual value — skill/agent content goes to the model prompt, and
 *     we don't put secrets in the model's context.
 *   - Unknown keys stay literal (no throw) — matches how `${VAR}` env refs
 *     behave today when the var is unset.
 *
 * A ref to a sensitive key produces obvious-looking output so plugin authors
 * notice and move the ref into a hook/MCP env instead.
 */
function substituteUserConfigInContent(content, options, schema) {
    return content.replace(/\$\{user_config\.([^}]+)\}/g, function (match, key) {
        var _a;
        if (((_a = schema[key]) === null || _a === void 0 ? void 0 : _a.sensitive) === true) {
            return "[sensitive option '".concat(key, "' not available in skill content]");
        }
        var value = options[key];
        if (value === undefined) {
            return match;
        }
        return String(value);
    });
}
