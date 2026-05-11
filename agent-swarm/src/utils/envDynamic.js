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
exports.envDynamic = void 0;
exports.getTerminalWithJetBrainsDetectionAsync = getTerminalWithJetBrainsDetectionAsync;
exports.getTerminalWithJetBrainsDetection = getTerminalWithJetBrainsDetection;
exports.initJetBrainsDetection = initJetBrainsDetection;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var env_js_1 = require("./env.js");
var envUtils_js_1 = require("./envUtils.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var genericProcessUtils_js_1 = require("./genericProcessUtils.js");
// Functions that require execFileNoThrow and thus cannot be in env.ts
var getIsDocker = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var code;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (process.platform !== 'linux')
                    return [2 /*return*/, false
                        // Check for .dockerenv file
                    ];
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('test', ['-f', '/.dockerenv'])];
            case 1:
                code = (_a.sent()).code;
                return [2 /*return*/, code === 0];
        }
    });
}); });
function getIsBubblewrapSandbox() {
    return (process.platform === 'linux' &&
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_BUBBLEWRAP));
}
// Cache for the runtime musl detection fallback (node/unbundled only).
// In native linux builds, feature flags resolve this at compile time, so the
// cache is only consulted when both IS_LIBC_MUSL and IS_LIBC_GLIBC are false.
var muslRuntimeCache = null;
// Fire-and-forget: populate the musl cache for the node fallback path.
// Native builds never reach this (feature flags short-circuit), so this only
// matters for unbundled node on Linux. Installer calls on native builds are
// unaffected since feature() resolves at compile time.
if (process.platform === 'linux') {
    var muslArch = process.arch === 'x64' ? 'x86_64' : 'aarch64';
    void (0, promises_1.stat)("/lib/libc.musl-".concat(muslArch, ".so.1")).then(function () {
        muslRuntimeCache = true;
    }, function () {
        muslRuntimeCache = false;
    });
}
/**
 * Checks if the system is using MUSL libc instead of glibc.
 * In native linux builds, this is statically known at compile time via IS_LIBC_MUSL/IS_LIBC_GLIBC flags.
 * In node (unbundled), both flags are false and we fall back to a runtime async stat check
 * whose result is cached at module load. If the cache isn't populated yet, returns false.
 */
function isMuslEnvironment() {
    if ((0, bun_bundle_1.feature)('IS_LIBC_MUSL'))
        return true;
    if ((0, bun_bundle_1.feature)('IS_LIBC_GLIBC'))
        return false;
    // Fallback for node: runtime detection via pre-populated cache
    if (process.platform !== 'linux')
        return false;
    return muslRuntimeCache !== null && muslRuntimeCache !== void 0 ? muslRuntimeCache : false;
}
// Cache for async JetBrains detection
var jetBrainsIDECache;
function detectJetBrainsIDEFromParentProcessAsync() {
    return __awaiter(this, void 0, void 0, function () {
        var commands, _i, commands_1, command, lowerCommand, _a, JETBRAINS_IDES_1, ide, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (jetBrainsIDECache !== undefined) {
                        return [2 /*return*/, jetBrainsIDECache];
                    }
                    if (process.platform === 'darwin') {
                        jetBrainsIDECache = null;
                        return [2 /*return*/, null]; // macOS uses bundle ID detection which is already handled
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, genericProcessUtils_js_1.getAncestorCommandsAsync)(process.pid, 10)];
                case 2:
                    commands = _c.sent();
                    for (_i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
                        command = commands_1[_i];
                        lowerCommand = command.toLowerCase();
                        // Check for specific JetBrains IDEs in the command line
                        for (_a = 0, JETBRAINS_IDES_1 = env_js_1.JETBRAINS_IDES; _a < JETBRAINS_IDES_1.length; _a++) {
                            ide = JETBRAINS_IDES_1[_a];
                            if (lowerCommand.includes(ide)) {
                                jetBrainsIDECache = ide;
                                return [2 /*return*/, ide];
                            }
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _b = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    jetBrainsIDECache = null;
                    return [2 /*return*/, null];
            }
        });
    });
}
function getTerminalWithJetBrainsDetectionAsync() {
    return __awaiter(this, void 0, void 0, function () {
        var specificIDE;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm')) return [3 /*break*/, 2];
                    if (!(env_js_1.env.platform !== 'darwin')) return [3 /*break*/, 2];
                    return [4 /*yield*/, detectJetBrainsIDEFromParentProcessAsync()];
                case 1:
                    specificIDE = _a.sent();
                    return [2 /*return*/, specificIDE || 'pycharm'];
                case 2: return [2 /*return*/, env_js_1.env.terminal];
            }
        });
    });
}
// Synchronous version that returns cached result or falls back to env.terminal
// Used for backward compatibility - callers should migrate to async version
function getTerminalWithJetBrainsDetection() {
    // Check for JetBrains terminal on Linux/Windows
    if (process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm') {
        // For macOS, bundle ID detection above already handles JetBrains IDEs
        if (env_js_1.env.platform !== 'darwin') {
            // Return cached value if available, otherwise fall back to generic detection
            // The async version should be called early in app initialization to populate cache
            if (jetBrainsIDECache !== undefined) {
                return jetBrainsIDECache || 'pycharm';
            }
            // Fall back to generic 'pycharm' if cache not populated yet
            return 'pycharm';
        }
    }
    return env_js_1.env.terminal;
}
/**
 * Initialize JetBrains IDE detection asynchronously.
 * Call this early in app initialization to populate the cache.
 * After this resolves, getTerminalWithJetBrainsDetection() will return accurate results.
 */
function initJetBrainsDetection() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm')) return [3 /*break*/, 2];
                    return [4 /*yield*/, detectJetBrainsIDEFromParentProcessAsync()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
// Combined export that includes all env properties plus dynamic functions
exports.envDynamic = __assign(__assign({}, env_js_1.env), { terminal: getTerminalWithJetBrainsDetection(), getIsDocker: getIsDocker, getIsBubblewrapSandbox: getIsBubblewrapSandbox, isMuslEnvironment: isMuslEnvironment, getTerminalWithJetBrainsDetectionAsync: getTerminalWithJetBrainsDetectionAsync, initJetBrainsDetection: initJetBrainsDetection });
