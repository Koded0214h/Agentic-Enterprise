"use strict";
/**
 * Plugin dependency resolution — pure functions, no I/O.
 *
 * Semantics are `apt`-style: a dependency is a *presence guarantee*, not a
 * module graph. Plugin A depending on Plugin B means "B's namespaced
 * components (MCP servers, commands, agents) must be available when A runs."
 *
 * Two entry points:
 *  - `resolveDependencyClosure` — install-time DFS walk, cycle detection
 *  - `verifyAndDemote` — load-time fixed-point check, demotes plugins with
 *    unsatisfied deps (session-local, does NOT write settings)
 */
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
exports.qualifyDependency = qualifyDependency;
exports.resolveDependencyClosure = resolveDependencyClosure;
exports.verifyAndDemote = verifyAndDemote;
exports.findReverseDependents = findReverseDependents;
exports.getEnabledPluginIdsForScope = getEnabledPluginIdsForScope;
exports.formatDependencyCountSuffix = formatDependencyCountSuffix;
exports.formatReverseDependentsSuffix = formatReverseDependentsSuffix;
var settings_js_1 = require("../settings/settings.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
/**
 * Synthetic marketplace sentinel for `--plugin-dir` plugins (pluginLoader.ts
 * sets `source = "{name}@inline"`). Not a real marketplace — bare deps from
 * these plugins cannot meaningfully inherit it.
 */
var INLINE_MARKETPLACE = 'inline';
/**
 * Normalize a dependency reference to fully-qualified "name@marketplace" form.
 * Bare names (no @) inherit the marketplace of the plugin declaring them —
 * cross-marketplace deps are blocked anyway, so the @-suffix is boilerplate
 * in the common case.
 *
 * EXCEPTION: if the declaring plugin is @inline (loaded via --plugin-dir),
 * bare deps are returned unchanged. `inline` is a synthetic sentinel, not a
 * real marketplace — fabricating "dep@inline" would never match anything.
 * verifyAndDemote handles bare deps via name-only matching.
 */
function qualifyDependency(dep, declaringPluginId) {
    if ((0, pluginIdentifier_js_1.parsePluginIdentifier)(dep).marketplace)
        return dep;
    var mkt = (0, pluginIdentifier_js_1.parsePluginIdentifier)(declaringPluginId).marketplace;
    if (!mkt || mkt === INLINE_MARKETPLACE)
        return dep;
    return "".concat(dep, "@").concat(mkt);
}
/**
 * Walk the transitive dependency closure of `rootId` via DFS.
 *
 * The returned `closure` ALWAYS contains `rootId`, plus every transitive
 * dependency that is NOT in `alreadyEnabled`. Already-enabled deps are
 * skipped (not recursed into) — this avoids surprise settings writes when a
 * dep is already installed at a different scope. The root is never skipped,
 * even if already enabled, so re-installing a plugin always re-caches it.
 *
 * Cross-marketplace dependencies are BLOCKED by default: a plugin in
 * marketplace A cannot auto-install a plugin from marketplace B. This is
 * a security boundary — installing from a trusted marketplace shouldn't
 * silently pull from an untrusted one. Two escapes: (1) install the
 * cross-mkt dep yourself first (already-enabled deps are skipped, so the
 * closure won't touch it), or (2) the ROOT marketplace's
 * `allowCrossMarketplaceDependenciesOn` allowlist — only the root's list
 * applies for the whole walk (no transitive trust: if A allows B, B's
 * plugin depending on C is still blocked unless A also allows C).
 *
 * @param rootId Root plugin to resolve from (format: "name@marketplace")
 * @param lookup Async lookup returning `{dependencies}` or `null` if not found
 * @param alreadyEnabled Plugin IDs to skip (deps only, root is never skipped)
 * @param allowedCrossMarketplaces Marketplace names the root trusts for
 *   auto-install (from the root marketplace's manifest)
 * @returns Closure to install, or a cycle/not-found/cross-marketplace error
 */
function resolveDependencyClosure(rootId_1, lookup_1, alreadyEnabled_1) {
    return __awaiter(this, arguments, void 0, function (rootId, lookup, alreadyEnabled, allowedCrossMarketplaces) {
        function walk(id, requiredBy) {
            return __awaiter(this, void 0, void 0, function () {
                var idMarketplace, entry, _i, _a, rawDep, dep, err_1;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            // Skip already-enabled DEPENDENCIES (avoids surprise settings writes),
                            // but NEVER skip the root: installing an already-enabled plugin must
                            // still cache/register it. Without this guard, re-installing a plugin
                            // that's in settings but missing from disk (e.g., cache cleared,
                            // installed_plugins.json stale) would return an empty closure and
                            // `cacheAndRegisterPlugin` would never fire — user sees
                            // "✔ Successfully installed" but nothing materializes.
                            if (id !== rootId && alreadyEnabled.has(id))
                                return [2 /*return*/, null
                                    // Security: block auto-install across marketplace boundaries. Runs AFTER
                                    // the alreadyEnabled check — if the user manually installed a cross-mkt
                                    // dep, it's in alreadyEnabled and we never reach this.
                                ];
                            idMarketplace = (0, pluginIdentifier_js_1.parsePluginIdentifier)(id).marketplace;
                            if (idMarketplace !== rootMarketplace &&
                                !(idMarketplace && allowedCrossMarketplaces.has(idMarketplace))) {
                                return [2 /*return*/, {
                                        ok: false,
                                        reason: 'cross-marketplace',
                                        dependency: id,
                                        requiredBy: requiredBy,
                                    }];
                            }
                            if (stack.includes(id)) {
                                return [2 /*return*/, { ok: false, reason: 'cycle', chain: __spreadArray(__spreadArray([], stack, true), [id], false) }];
                            }
                            if (visited.has(id))
                                return [2 /*return*/, null];
                            visited.add(id);
                            return [4 /*yield*/, lookup(id)];
                        case 1:
                            entry = _c.sent();
                            if (!entry) {
                                return [2 /*return*/, { ok: false, reason: 'not-found', missing: id, requiredBy: requiredBy }];
                            }
                            stack.push(id);
                            _i = 0, _a = (_b = entry.dependencies) !== null && _b !== void 0 ? _b : [];
                            _c.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            rawDep = _a[_i];
                            dep = qualifyDependency(rawDep, id);
                            return [4 /*yield*/, walk(dep, id)];
                        case 3:
                            err_1 = _c.sent();
                            if (err_1)
                                return [2 /*return*/, err_1];
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            stack.pop();
                            closure.push(id);
                            return [2 /*return*/, null];
                    }
                });
            });
        }
        var rootMarketplace, closure, visited, stack, err;
        if (allowedCrossMarketplaces === void 0) { allowedCrossMarketplaces = new Set(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rootMarketplace = (0, pluginIdentifier_js_1.parsePluginIdentifier)(rootId).marketplace;
                    closure = [];
                    visited = new Set();
                    stack = [];
                    return [4 /*yield*/, walk(rootId, rootId)];
                case 1:
                    err = _a.sent();
                    if (err)
                        return [2 /*return*/, err];
                    return [2 /*return*/, { ok: true, closure: closure }];
            }
        });
    });
}
/**
 * Load-time safety net: for each enabled plugin, verify all manifest
 * dependencies are also in the enabled set. Demote any that fail.
 *
 * Fixed-point loop: demoting plugin A may break plugin B that depends on A,
 * so we iterate until nothing changes.
 *
 * The `reason` field distinguishes:
 *  - `'not-enabled'` — dep exists in the loaded set but is disabled
 *  - `'not-found'` — dep is entirely absent (not in any marketplace)
 *
 * Does NOT mutate input. Returns the set of plugin IDs (sources) to demote.
 *
 * @param plugins All loaded plugins (enabled + disabled)
 * @returns Set of pluginIds to demote, plus errors for `/doctor`
 */
function verifyAndDemote(plugins) {
    var _a, _b, _c, _d;
    var known = new Set(plugins.map(function (p) { return p.source; }));
    var enabled = new Set(plugins.filter(function (p) { return p.enabled; }).map(function (p) { return p.source; }));
    // Name-only indexes for bare deps from --plugin-dir (@inline) plugins:
    // the real marketplace is unknown, so match "B" against any enabled "B@*".
    // enabledByName is a multiset: if B@epic AND B@other are both enabled,
    // demoting one mustn't make "B" disappear from the index.
    var knownByName = new Set(plugins.map(function (p) { return (0, pluginIdentifier_js_1.parsePluginIdentifier)(p.source).name; }));
    var enabledByName = new Map();
    for (var _i = 0, enabled_1 = enabled; _i < enabled_1.length; _i++) {
        var id = enabled_1[_i];
        var n = (0, pluginIdentifier_js_1.parsePluginIdentifier)(id).name;
        enabledByName.set(n, ((_a = enabledByName.get(n)) !== null && _a !== void 0 ? _a : 0) + 1);
    }
    var errors = [];
    var changed = true;
    while (changed) {
        changed = false;
        for (var _e = 0, plugins_1 = plugins; _e < plugins_1.length; _e++) {
            var p = plugins_1[_e];
            if (!enabled.has(p.source))
                continue;
            for (var _f = 0, _g = (_b = p.manifest.dependencies) !== null && _b !== void 0 ? _b : []; _f < _g.length; _f++) {
                var rawDep = _g[_f];
                var dep = qualifyDependency(rawDep, p.source);
                // Bare dep ← @inline plugin: match by name only (see enabledByName)
                var isBare = !(0, pluginIdentifier_js_1.parsePluginIdentifier)(dep).marketplace;
                var satisfied = isBare
                    ? ((_c = enabledByName.get(dep)) !== null && _c !== void 0 ? _c : 0) > 0
                    : enabled.has(dep);
                if (!satisfied) {
                    enabled.delete(p.source);
                    var count = (_d = enabledByName.get(p.name)) !== null && _d !== void 0 ? _d : 0;
                    if (count <= 1)
                        enabledByName.delete(p.name);
                    else
                        enabledByName.set(p.name, count - 1);
                    errors.push({
                        type: 'dependency-unsatisfied',
                        source: p.source,
                        plugin: p.name,
                        dependency: dep,
                        reason: (isBare ? knownByName.has(dep) : known.has(dep))
                            ? 'not-enabled'
                            : 'not-found',
                    });
                    changed = true;
                    break;
                }
            }
        }
    }
    var demoted = new Set(plugins.filter(function (p) { return p.enabled && !enabled.has(p.source); }).map(function (p) { return p.source; }));
    return { demoted: demoted, errors: errors };
}
/**
 * Find all enabled plugins that declare `pluginId` as a dependency.
 * Used to warn on uninstall/disable ("required by: X, Y").
 *
 * @param pluginId The plugin being removed/disabled
 * @param plugins All loaded plugins (only enabled ones are checked)
 * @returns Names of plugins that will break if `pluginId` goes away
 */
function findReverseDependents(pluginId, plugins) {
    var targetName = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).name;
    return plugins
        .filter(function (p) {
        var _a;
        return p.enabled &&
            p.source !== pluginId &&
            ((_a = p.manifest.dependencies) !== null && _a !== void 0 ? _a : []).some(function (d) {
                var qualified = qualifyDependency(d, p.source);
                // Bare dep (from @inline plugin): match by name only
                return (0, pluginIdentifier_js_1.parsePluginIdentifier)(qualified).marketplace
                    ? qualified === pluginId
                    : qualified === targetName;
            });
    })
        .map(function (p) { return p.name; });
}
/**
 * Build the set of plugin IDs currently enabled at a given settings scope.
 * Used by install-time resolution to skip already-enabled deps and avoid
 * surprise settings writes.
 *
 * Matches `true` (plain enable) AND array values (version constraints per
 * settings/types.ts:455-463 — a plugin at `"foo@bar": ["^1.0.0"]` IS enabled).
 * Without the array check, a version-pinned dep would be re-added to the
 * closure and the settings write would clobber the constraint with `true`.
 */
function getEnabledPluginIdsForScope(settingSource) {
    var _a, _b;
    return new Set(Object.entries((_b = (_a = (0, settings_js_1.getSettingsForSource)(settingSource)) === null || _a === void 0 ? void 0 : _a.enabledPlugins) !== null && _b !== void 0 ? _b : {})
        .filter(function (_a) {
        var v = _a[1];
        return v === true || Array.isArray(v);
    })
        .map(function (_a) {
        var k = _a[0];
        return k;
    }));
}
/**
 * Format the "(+ N dependencies)" suffix for install success messages.
 * Returns empty string when `installedDeps` is empty.
 */
function formatDependencyCountSuffix(installedDeps) {
    if (installedDeps.length === 0)
        return '';
    var n = installedDeps.length;
    return " (+ ".concat(n, " ").concat(n === 1 ? 'dependency' : 'dependencies', ")");
}
/**
 * Format the "warning: required by X, Y" suffix for uninstall/disable
 * results. Em-dash style for CLI result messages (not the middot style
 * used in the notification UI). Returns empty string when no dependents.
 */
function formatReverseDependentsSuffix(rdeps) {
    if (!rdeps || rdeps.length === 0)
        return '';
    return " \u2014 warning: required by ".concat(rdeps.join(', '));
}
