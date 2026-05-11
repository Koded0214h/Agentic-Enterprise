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
exports.loadPluginHooks = void 0;
exports.clearPluginHookCache = clearPluginHookCache;
exports.pruneRemovedPluginHooks = pruneRemovedPluginHooks;
exports.resetHotReloadState = resetHotReloadState;
exports.getPluginAffectingSettingsSnapshot = getPluginAffectingSettingsSnapshot;
exports.setupPluginHookHotReload = setupPluginHookHotReload;
var memoize_js_1 = require("lodash-es/memoize.js");
var state_js_1 = require("../../bootstrap/state.js");
var debug_js_1 = require("../debug.js");
var changeDetector_js_1 = require("../settings/changeDetector.js");
var settings_js_1 = require("../settings/settings.js");
var slowOperations_js_1 = require("../slowOperations.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
// Track if hot reload subscription is set up
var hotReloadSubscribed = false;
// Snapshot of enabledPlugins for change detection in hot reload
var lastPluginSettingsSnapshot;
/**
 * Convert plugin hooks configuration to native matchers with plugin context
 */
function convertPluginHooksToMatchers(plugin) {
    var pluginMatchers = {
        PreToolUse: [],
        PostToolUse: [],
        PostToolUseFailure: [],
        PermissionDenied: [],
        Notification: [],
        UserPromptSubmit: [],
        SessionStart: [],
        SessionEnd: [],
        Stop: [],
        StopFailure: [],
        SubagentStart: [],
        SubagentStop: [],
        PreCompact: [],
        PostCompact: [],
        PermissionRequest: [],
        Setup: [],
        TeammateIdle: [],
        TaskCreated: [],
        TaskCompleted: [],
        Elicitation: [],
        ElicitationResult: [],
        ConfigChange: [],
        WorktreeCreate: [],
        WorktreeRemove: [],
        InstructionsLoaded: [],
        CwdChanged: [],
        FileChanged: [],
    };
    if (!plugin.hooksConfig) {
        return pluginMatchers;
    }
    // Process each hook event - pass through all hook types with plugin context
    for (var _i = 0, _a = Object.entries(plugin.hooksConfig); _i < _a.length; _i++) {
        var _b = _a[_i], event_1 = _b[0], matchers = _b[1];
        var hookEvent = event_1;
        if (!pluginMatchers[hookEvent]) {
            continue;
        }
        for (var _c = 0, matchers_1 = matchers; _c < matchers_1.length; _c++) {
            var matcher = matchers_1[_c];
            if (matcher.hooks.length > 0) {
                pluginMatchers[hookEvent].push({
                    matcher: matcher.matcher,
                    hooks: matcher.hooks,
                    pluginRoot: plugin.path,
                    pluginName: plugin.name,
                    pluginId: plugin.source,
                });
            }
        }
    }
    return pluginMatchers;
}
/**
 * Load and register hooks from all enabled plugins
 */
exports.loadPluginHooks = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var enabled, allPluginHooks, _i, enabled_1, plugin, pluginMatchers, _a, _b, event_2, totalHooks;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()];
            case 1:
                enabled = (_d.sent()).enabled;
                allPluginHooks = {
                    PreToolUse: [],
                    PostToolUse: [],
                    PostToolUseFailure: [],
                    PermissionDenied: [],
                    Notification: [],
                    UserPromptSubmit: [],
                    SessionStart: [],
                    SessionEnd: [],
                    Stop: [],
                    StopFailure: [],
                    SubagentStart: [],
                    SubagentStop: [],
                    PreCompact: [],
                    PostCompact: [],
                    PermissionRequest: [],
                    Setup: [],
                    TeammateIdle: [],
                    TaskCreated: [],
                    TaskCompleted: [],
                    Elicitation: [],
                    ElicitationResult: [],
                    ConfigChange: [],
                    WorktreeCreate: [],
                    WorktreeRemove: [],
                    InstructionsLoaded: [],
                    CwdChanged: [],
                    FileChanged: [],
                };
                // Process each enabled plugin
                for (_i = 0, enabled_1 = enabled; _i < enabled_1.length; _i++) {
                    plugin = enabled_1[_i];
                    if (!plugin.hooksConfig) {
                        continue;
                    }
                    (0, debug_js_1.logForDebugging)("Loading hooks from plugin: ".concat(plugin.name));
                    pluginMatchers = convertPluginHooksToMatchers(plugin);
                    // Merge plugin hooks into the main collection
                    for (_a = 0, _b = Object.keys(pluginMatchers); _a < _b.length; _a++) {
                        event_2 = _b[_a];
                        (_c = allPluginHooks[event_2]).push.apply(_c, pluginMatchers[event_2]);
                    }
                }
                // Clear-then-register as an atomic pair. Previously the clear lived in
                // clearPluginHookCache(), which meant any clearAllCaches() call (from
                // /plugins UI, pluginInstallationHelpers, thinkback, etc.) wiped plugin
                // hooks from STATE.registeredHooks and left them wiped until someone
                // happened to call loadPluginHooks() again. SessionStart explicitly awaits
                // loadPluginHooks() before firing so it always re-registered; Stop has no
                // such guard, so plugin Stop hooks silently never fired after any plugin
                // management operation (gh-29767). Doing the clear here makes the swap
                // atomic — old hooks stay valid until this point, new hooks take over.
                (0, state_js_1.clearRegisteredPluginHooks)();
                (0, state_js_1.registerHookCallbacks)(allPluginHooks);
                totalHooks = Object.values(allPluginHooks).reduce(function (sum, matchers) { return sum + matchers.reduce(function (s, m) { return s + m.hooks.length; }, 0); }, 0);
                (0, debug_js_1.logForDebugging)("Registered ".concat(totalHooks, " hooks from ").concat(enabled.length, " plugins"));
                return [2 /*return*/];
        }
    });
}); });
function clearPluginHookCache() {
    var _a, _b;
    // Only invalidate the memoize — do NOT wipe STATE.registeredHooks here.
    // Wiping here left plugin hooks dead between clearAllCaches() and the next
    // loadPluginHooks() call, which for Stop hooks might never happen
    // (gh-29767). The clear now lives inside loadPluginHooks() as an atomic
    // clear-then-register, so old hooks stay valid until the fresh load swaps
    // them out.
    (_b = (_a = exports.loadPluginHooks.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Remove hooks from plugins no longer in the enabled set, without adding
 * hooks from newly-enabled plugins. Called from clearAllCaches() so
 * uninstalled/disabled plugins stop firing hooks immediately (gh-36995),
 * while newly-enabled plugins wait for /reload-plugins — consistent with
 * how commands/agents/MCP behave.
 *
 * The full swap (clear + register all) still happens via loadPluginHooks(),
 * which /reload-plugins awaits.
 */
function pruneRemovedPluginHooks() {
    return __awaiter(this, void 0, void 0, function () {
        var enabled, enabledRoots, current, survivors, _i, _a, _b, event_3, matchers, kept;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Early return when nothing to prune — avoids seeding the loadAllPluginsCacheOnly
                    // memoize in test/preload.ts beforeEach (which clears registeredHooks).
                    if (!(0, state_js_1.getRegisteredHooks)())
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()];
                case 1:
                    enabled = (_c.sent()).enabled;
                    enabledRoots = new Set(enabled.map(function (p) { return p.path; }));
                    current = (0, state_js_1.getRegisteredHooks)();
                    if (!current)
                        return [2 /*return*/];
                    survivors = {};
                    for (_i = 0, _a = Object.entries(current); _i < _a.length; _i++) {
                        _b = _a[_i], event_3 = _b[0], matchers = _b[1];
                        kept = matchers.filter(function (m) {
                            return 'pluginRoot' in m && enabledRoots.has(m.pluginRoot);
                        });
                        if (kept.length > 0)
                            survivors[event_3] = kept;
                    }
                    (0, state_js_1.clearRegisteredPluginHooks)();
                    (0, state_js_1.registerHookCallbacks)(survivors);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Reset hot reload subscription state. Only for testing.
 */
function resetHotReloadState() {
    hotReloadSubscribed = false;
    lastPluginSettingsSnapshot = undefined;
}
/**
 * Build a stable string snapshot of the settings that feed into
 * `loadAllPluginsCacheOnly()` for change detection. Sorts keys so comparison is
 * deterministic regardless of insertion order.
 *
 * Hashes FOUR fields — not just enabledPlugins — because the memoized
 * loadAllPluginsCacheOnly() also reads strictKnownMarketplaces, blockedMarketplaces
 * (pluginLoader.ts:1933 via getBlockedMarketplaces), and
 * extraKnownMarketplaces. If remote managed settings set only one of
 * these (no enabledPlugins), a snapshot keyed only on enabledPlugins
 * would never diff, the listener would skip, and the memoized result
 * would retain the pre-remote marketplace allow/blocklist.
 * See #23085 / #23152 poisoned-cache discussion (Slack C09N89L3VNJ).
 */
// Exported for testing — the listener at setupPluginHookHotReload uses this
// for change detection; tests verify it diffs on the fields that matter.
function getPluginAffectingSettingsSnapshot() {
    var _a, _b;
    var merged = (0, settings_js_1.getSettings_DEPRECATED)();
    var policy = (0, settings_js_1.getSettingsForSource)('policySettings');
    // Key-sort the two Record fields so insertion order doesn't flap the hash.
    // Array fields (strictKnownMarketplaces, blockedMarketplaces) have
    // schema-stable order.
    var sortKeys = function (o) {
        return o ? Object.fromEntries(Object.entries(o).sort()) : {};
    };
    return (0, slowOperations_js_1.jsonStringify)({
        enabledPlugins: sortKeys(merged.enabledPlugins),
        extraKnownMarketplaces: sortKeys(merged.extraKnownMarketplaces),
        strictKnownMarketplaces: (_a = policy === null || policy === void 0 ? void 0 : policy.strictKnownMarketplaces) !== null && _a !== void 0 ? _a : [],
        blockedMarketplaces: (_b = policy === null || policy === void 0 ? void 0 : policy.blockedMarketplaces) !== null && _b !== void 0 ? _b : [],
    });
}
/**
 * Set up hot reload for plugin hooks when remote settings change.
 * When policySettings changes (e.g., from remote managed settings),
 * compares the plugin-affecting settings snapshot and only reloads if it
 * actually changed.
 */
function setupPluginHookHotReload() {
    if (hotReloadSubscribed) {
        return;
    }
    hotReloadSubscribed = true;
    // Capture the initial snapshot so the first policySettings change can compare
    lastPluginSettingsSnapshot = getPluginAffectingSettingsSnapshot();
    changeDetector_js_1.settingsChangeDetector.subscribe(function (source) {
        if (source === 'policySettings') {
            var newSnapshot = getPluginAffectingSettingsSnapshot();
            if (newSnapshot === lastPluginSettingsSnapshot) {
                (0, debug_js_1.logForDebugging)('Plugin hooks: skipping reload, plugin-affecting settings unchanged');
                return;
            }
            lastPluginSettingsSnapshot = newSnapshot;
            (0, debug_js_1.logForDebugging)('Plugin hooks: reloading due to plugin-affecting settings change');
            // Clear all plugin-related caches
            (0, pluginLoader_js_1.clearPluginCache)('loadPluginHooks: plugin-affecting settings changed');
            clearPluginHookCache();
            // Reload hooks (fire-and-forget, don't block)
            void (0, exports.loadPluginHooks)();
        }
    });
}
