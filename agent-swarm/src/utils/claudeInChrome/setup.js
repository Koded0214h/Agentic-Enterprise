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
exports.shouldEnableClaudeInChrome = shouldEnableClaudeInChrome;
exports.shouldAutoEnableClaudeInChrome = shouldAutoEnableClaudeInChrome;
exports.setupClaudeInChrome = setupClaudeInChrome;
exports.installChromeNativeHostManifest = installChromeNativeHostManifest;
exports.isChromeExtensionInstalled = isChromeExtensionInstalled;
var BROWSER_TOOLS = [
    { name: 'javascript_tool' },
    { name: 'read_page' },
    { name: 'find' },
    { name: 'form_input' },
    { name: 'computer' },
    { name: 'navigate' },
    { name: 'resize_window' },
    { name: 'gif_creator' },
    { name: 'upload_image' },
    { name: 'get_page_text' },
    { name: 'tabs_context_mcp' },
    { name: 'tabs_create_mcp' },
    { name: 'update_plan' },
    { name: 'read_console_messages' },
    { name: 'read_network_requests' },
    { name: 'shortcuts_list' },
    { name: 'shortcuts_execute' }
];
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var url_1 = require("url");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var bundledMode_js_1 = require("../bundledMode.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var platform_js_1 = require("../platform.js");
var slowOperations_js_1 = require("../slowOperations.js");
var common_js_1 = require("./common.js");
var prompt_js_1 = require("./prompt.js");
var setupPortable_js_1 = require("./setupPortable.js");
var CHROME_EXTENSION_RECONNECT_URL = 'https://clau.de/chrome/reconnect';
var NATIVE_HOST_IDENTIFIER = 'com.anthropic.claude_code_browser_extension';
var NATIVE_HOST_MANIFEST_NAME = "".concat(NATIVE_HOST_IDENTIFIER, ".json");
function shouldEnableClaudeInChrome(chromeFlag) {
    // Disable by default in non-interactive sessions (e.g., SDK, CI)
    if ((0, state_js_1.getIsNonInteractiveSession)() && chromeFlag !== true) {
        return false;
    }
    // Check CLI flags
    if (chromeFlag === true) {
        return true;
    }
    if (chromeFlag === false) {
        return false;
    }
    // Check environment variables
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ENABLE_CFC)) {
        return true;
    }
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_ENABLE_CFC)) {
        return false;
    }
    // Check default config settings
    var config = (0, config_js_1.getGlobalConfig)();
    if (config.claudeInChromeDefaultEnabled !== undefined) {
        return config.claudeInChromeDefaultEnabled;
    }
    return false;
}
var shouldAutoEnable = undefined;
function shouldAutoEnableClaudeInChrome() {
    if (shouldAutoEnable !== undefined) {
        return shouldAutoEnable;
    }
    shouldAutoEnable =
        (0, state_js_1.getIsInteractive)() &&
            isChromeExtensionInstalled_CACHED_MAY_BE_STALE() &&
            (process.env.USER_TYPE === 'ant' ||
                (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_chrome_auto_enable', false));
    return shouldAutoEnable;
}
/**
 * Setup Claude in Chrome MCP server and tools
 *
 * @returns MCP config and allowed tools, or throws an error if platform is unsupported
 */
function setupClaudeInChrome() {
    var _a, _b;
    var isNativeBuild = (0, bundledMode_js_1.isInBundledMode)();
    var allowedTools = BROWSER_TOOLS.map(function (tool) { return "mcp__claude-in-chrome__".concat(tool.name); });
    var env = {};
    if ((0, state_js_1.getSessionBypassPermissionsMode)()) {
        env.CLAUDE_CHROME_PERMISSION_MODE = 'skip_all_permission_checks';
    }
    var hasEnv = Object.keys(env).length > 0;
    if (isNativeBuild) {
        // Create a wrapper script that calls the same binary with --chrome-native-host. This
        // is needed because the native host manifest "path" field cannot contain arguments.
        var execCommand = "\"".concat(process.execPath, "\" --chrome-native-host");
        // Run asynchronously without blocking; best-effort so swallow errors
        void createWrapperScript(execCommand)
            .then(function (manifestBinaryPath) {
            return installChromeNativeHostManifest(manifestBinaryPath);
        })
            .catch(function (e) {
            return (0, debug_js_1.logForDebugging)("[Claude in Chrome] Failed to install native host: ".concat(e), { level: 'error' });
        });
        return {
            mcpConfig: (_a = {},
                _a[common_js_1.CLAUDE_IN_CHROME_MCP_SERVER_NAME] = __assign({ type: 'stdio', command: process.execPath, args: ['--claude-in-chrome-mcp'], scope: 'dynamic' }, (hasEnv && { env: env })),
                _a),
            allowedTools: allowedTools,
            systemPrompt: (0, prompt_js_1.getChromeSystemPrompt)(),
        };
    }
    else {
        var __filename_1 = (0, url_1.fileURLToPath)(import.meta.url);
        var __dirname_1 = (0, path_1.join)(__filename_1, '..');
        var cliPath = (0, path_1.join)(__dirname_1, 'cli.js');
        void createWrapperScript("\"".concat(process.execPath, "\" \"").concat(cliPath, "\" --chrome-native-host"))
            .then(function (manifestBinaryPath) {
            return installChromeNativeHostManifest(manifestBinaryPath);
        })
            .catch(function (e) {
            return (0, debug_js_1.logForDebugging)("[Claude in Chrome] Failed to install native host: ".concat(e), { level: 'error' });
        });
        var mcpConfig = (_b = {},
            _b[common_js_1.CLAUDE_IN_CHROME_MCP_SERVER_NAME] = __assign({ type: 'stdio', command: process.execPath, args: ["".concat(cliPath), '--claude-in-chrome-mcp'], scope: 'dynamic' }, (hasEnv && { env: env })),
            _b);
        return {
            mcpConfig: mcpConfig,
            allowedTools: allowedTools,
            systemPrompt: (0, prompt_js_1.getChromeSystemPrompt)(),
        };
    }
}
/**
 * Get native messaging hosts directories for all supported browsers
 * Returns an array of directories where the native host manifest should be installed
 */
function getNativeMessagingHostsDirs() {
    var platform = (0, platform_js_1.getPlatform)();
    if (platform === 'windows') {
        // Windows uses a single location with registry entries pointing to it
        var home = (0, os_1.homedir)();
        var appData = process.env.APPDATA || (0, path_1.join)(home, 'AppData', 'Local');
        return [(0, path_1.join)(appData, 'Claude Code', 'ChromeNativeHost')];
    }
    // macOS and Linux: return all browser native messaging directories
    return (0, common_js_1.getAllNativeMessagingHostsDirs)().map(function (_a) {
        var path = _a.path;
        return path;
    });
}
function installChromeNativeHostManifest(manifestBinaryPath) {
    return __awaiter(this, void 0, void 0, function () {
        var manifestDirs, manifest, manifestContent, anyManifestUpdated, _i, manifestDirs_1, manifestDir, manifestPath, existingContent, error_1, manifestPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    manifestDirs = getNativeMessagingHostsDirs();
                    if (manifestDirs.length === 0) {
                        throw Error('Claude in Chrome Native Host not supported on this platform');
                    }
                    manifest = {
                        name: NATIVE_HOST_IDENTIFIER,
                        description: 'Claude Code Browser Extension Native Host',
                        path: manifestBinaryPath,
                        type: 'stdio',
                        allowed_origins: __spreadArray([
                            "chrome-extension://fcoeoabgfenejglbffodgkkbkcdhcgfn/"
                        ], (process.env.USER_TYPE === 'ant'
                            ? [
                                'chrome-extension://dihbgbndebgnbjfmelmegjepbnkhlgni/', // DEV_EXTENSION_ID
                                'chrome-extension://dngcpimnedloihjnnfngkgjoidhnaolf/', // ANT_EXTENSION_ID
                            ]
                            : []), true),
                    };
                    manifestContent = (0, slowOperations_js_1.jsonStringify)(manifest, null, 2);
                    anyManifestUpdated = false;
                    _i = 0, manifestDirs_1 = manifestDirs;
                    _a.label = 1;
                case 1:
                    if (!(_i < manifestDirs_1.length)) return [3 /*break*/, 8];
                    manifestDir = manifestDirs_1[_i];
                    manifestPath = (0, path_1.join)(manifestDir, NATIVE_HOST_MANIFEST_NAME);
                    return [4 /*yield*/, (0, promises_1.readFile)(manifestPath, 'utf-8').catch(function () { return null; })];
                case 2:
                    existingContent = _a.sent();
                    if (existingContent === manifestContent) {
                        return [3 /*break*/, 7];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(manifestDir, { recursive: true })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(manifestPath, manifestContent)];
                case 5:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[Claude in Chrome] Installed native host manifest at: ".concat(manifestPath));
                    anyManifestUpdated = true;
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    // Log but don't fail - the browser might not be installed
                    (0, debug_js_1.logForDebugging)("[Claude in Chrome] Failed to install manifest at ".concat(manifestPath, ": ").concat(error_1));
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    // Windows requires registry entries pointing to the manifest for each browser
                    if ((0, platform_js_1.getPlatform)() === 'windows') {
                        manifestPath = (0, path_1.join)(manifestDirs[0], NATIVE_HOST_MANIFEST_NAME);
                        registerWindowsNativeHosts(manifestPath);
                    }
                    // Restart the native host if we have rewritten any manifest
                    if (anyManifestUpdated) {
                        void isChromeExtensionInstalled().then(function (isInstalled) {
                            if (isInstalled) {
                                (0, debug_js_1.logForDebugging)("[Claude in Chrome] First-time install detected, opening reconnect page in browser");
                                void (0, common_js_1.openInChrome)(CHROME_EXTENSION_RECONNECT_URL);
                            }
                            else {
                                (0, debug_js_1.logForDebugging)("[Claude in Chrome] First-time install detected, but extension not installed, skipping reconnect");
                            }
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Register the native host in Windows registry for all supported browsers
 */
function registerWindowsNativeHosts(manifestPath) {
    var registryKeys = (0, common_js_1.getAllWindowsRegistryKeys)();
    var _loop_1 = function (browser, key) {
        var fullKey = "".concat(key, "\\").concat(NATIVE_HOST_IDENTIFIER);
        // Use reg.exe to add the registry entry
        // https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging
        void (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('reg', [
            'add',
            fullKey,
            '/ve', // Set the default (unnamed) value
            '/t',
            'REG_SZ',
            '/d',
            manifestPath,
            '/f', // Force overwrite without prompt
        ]).then(function (result) {
            if (result.code === 0) {
                (0, debug_js_1.logForDebugging)("[Claude in Chrome] Registered native host for ".concat(browser, " in Windows registry: ").concat(fullKey));
            }
            else {
                (0, debug_js_1.logForDebugging)("[Claude in Chrome] Failed to register native host for ".concat(browser, " in Windows registry: ").concat(result.stderr));
            }
        });
    };
    for (var _i = 0, registryKeys_1 = registryKeys; _i < registryKeys_1.length; _i++) {
        var _a = registryKeys_1[_i], browser = _a.browser, key = _a.key;
        _loop_1(browser, key);
    }
}
/**
 * Create a wrapper script in ~/.claude/chrome/ that invokes the given command. This is
 * necessary because Chrome's native host manifest "path" field cannot contain arguments.
 *
 * @param command - The full command to execute (e.g., "/path/to/claude --chrome-native-host")
 * @returns The path to the wrapper script
 */
function createWrapperScript(command) {
    return __awaiter(this, void 0, void 0, function () {
        var platform, chromeDir, wrapperPath, scriptContent, existingContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    platform = (0, platform_js_1.getPlatform)();
                    chromeDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'chrome');
                    wrapperPath = platform === 'windows'
                        ? (0, path_1.join)(chromeDir, 'chrome-native-host.bat')
                        : (0, path_1.join)(chromeDir, 'chrome-native-host');
                    scriptContent = platform === 'windows'
                        ? "@echo off\nREM Chrome native host wrapper script\nREM Generated by Claude Code - do not edit manually\n".concat(command, "\n")
                        : "#!/bin/sh\n# Chrome native host wrapper script\n# Generated by Claude Code - do not edit manually\nexec ".concat(command, "\n");
                    return [4 /*yield*/, (0, promises_1.readFile)(wrapperPath, 'utf-8').catch(function () { return null; })];
                case 1:
                    existingContent = _a.sent();
                    if (existingContent === scriptContent) {
                        return [2 /*return*/, wrapperPath];
                    }
                    return [4 /*yield*/, (0, promises_1.mkdir)(chromeDir, { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(wrapperPath, scriptContent)];
                case 3:
                    _a.sent();
                    if (!(platform !== 'windows')) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, promises_1.chmod)(wrapperPath, 493)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    (0, debug_js_1.logForDebugging)("[Claude in Chrome] Created Chrome native host wrapper script: ".concat(wrapperPath));
                    return [2 /*return*/, wrapperPath];
            }
        });
    });
}
/**
 * Get cached value of whether Chrome extension is installed. Returns
 * from disk cache immediately, updates cache in background.
 *
 * Use this for sync/startup-critical paths where blocking on filesystem
 * access is not acceptable. The value may be stale if the cache hasn't
 * been updated recently.
 *
 * Only positive detections are persisted. A negative result from the
 * filesystem scan is not cached, because it may come from a machine that
 * shares ~/.claude.json but has no local Chrome (e.g. a remote dev
 * environment using the bridge), and caching it would permanently poison
 * auto-enable for every session on every machine that reads that config.
 */
function isChromeExtensionInstalled_CACHED_MAY_BE_STALE() {
    // Update cache in background without blocking
    void isChromeExtensionInstalled().then(function (isInstalled) {
        // Only persist positive detections — see docstring. The cost of a stale
        // `true` is one silent MCP connection attempt per session; the cost of a
        // stale `false` is auto-enable never working again without manual repair.
        if (!isInstalled) {
            return;
        }
        var config = (0, config_js_1.getGlobalConfig)();
        if (config.cachedChromeExtensionInstalled !== isInstalled) {
            (0, config_js_1.saveGlobalConfig)(function (prev) { return (__assign(__assign({}, prev), { cachedChromeExtensionInstalled: isInstalled })); });
        }
    });
    // Return cached value immediately from disk
    var cached = (0, config_js_1.getGlobalConfig)().cachedChromeExtensionInstalled;
    return cached !== null && cached !== void 0 ? cached : false;
}
/**
 * Detects if the Claude in Chrome extension is installed by checking the Extensions
 * directory across all supported Chromium-based browsers and their profiles.
 *
 * @returns Object with isInstalled boolean and the browser where the extension was found
 */
function isChromeExtensionInstalled() {
    return __awaiter(this, void 0, void 0, function () {
        var browserPaths;
        return __generator(this, function (_a) {
            browserPaths = (0, common_js_1.getAllBrowserDataPaths)();
            if (browserPaths.length === 0) {
                (0, debug_js_1.logForDebugging)("[Claude in Chrome] Unsupported platform for extension detection: ".concat((0, platform_js_1.getPlatform)()));
                return [2 /*return*/, false];
            }
            return [2 /*return*/, (0, setupPortable_js_1.isChromeExtensionInstalledPortable)(browserPaths, debug_js_1.logForDebugging)];
        });
    });
}
