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
exports.ensureBackendsRegistered = ensureBackendsRegistered;
exports.registerTmuxBackend = registerTmuxBackend;
exports.registerITermBackend = registerITermBackend;
exports.detectAndGetBackend = detectAndGetBackend;
exports.getBackendByType = getBackendByType;
exports.getCachedBackend = getCachedBackend;
exports.getCachedDetectionResult = getCachedDetectionResult;
exports.markInProcessFallback = markInProcessFallback;
exports.isInProcessEnabled = isInProcessEnabled;
exports.getResolvedTeammateMode = getResolvedTeammateMode;
exports.getInProcessBackend = getInProcessBackend;
exports.getTeammateExecutor = getTeammateExecutor;
exports.resetBackendDetection = resetBackendDetection;
var state_js_1 = require("../../../bootstrap/state.js");
var debug_js_1 = require("../../../utils/debug.js");
var platform_js_1 = require("../../../utils/platform.js");
var detection_js_1 = require("./detection.js");
var InProcessBackend_js_1 = require("./InProcessBackend.js");
var it2Setup_js_1 = require("./it2Setup.js");
var PaneBackendExecutor_js_1 = require("./PaneBackendExecutor.js");
var teammateModeSnapshot_js_1 = require("./teammateModeSnapshot.js");
/**
 * Cached backend detection result.
 * Once detected, the backend selection is fixed for the lifetime of the process.
 */
var cachedBackend = null;
/**
 * Cached detection result with additional metadata.
 */
var cachedDetectionResult = null;
/**
 * Flag to track if backends have been registered.
 */
var backendsRegistered = false;
/**
 * Cached in-process backend instance.
 */
var cachedInProcessBackend = null;
/**
 * Cached pane backend executor instance.
 * Wraps the detected PaneBackend to provide TeammateExecutor interface.
 */
var cachedPaneBackendExecutor = null;
/**
 * Tracks whether spawn fell back to in-process mode because no pane backend
 * was available (e.g., iTerm2 without it2 or tmux installed). Once set,
 * isInProcessEnabled() returns true so UI (banner, teams menu) reflects reality.
 */
var inProcessFallbackActive = false;
/**
 * Placeholder for TmuxBackend - will be replaced with actual implementation.
 * This allows the registry to compile before the backend implementations exist.
 */
var TmuxBackendClass = null;
/**
 * Placeholder for ITermBackend - will be replaced with actual implementation.
 * This allows the registry to compile before the backend implementations exist.
 */
var ITermBackendClass = null;
/**
 * Ensures backend classes are dynamically imported so getBackendByType() can
 * construct them. Unlike detectAndGetBackend(), this never spawns subprocesses
 * and never throws — it's the lightweight option when you only need class
 * registration (e.g., killing a pane by its stored backendType).
 */
function ensureBackendsRegistered() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (backendsRegistered)
                        return [2 /*return*/];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./TmuxBackend.js'); })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./ITermBackend.js'); })];
                case 2:
                    _a.sent();
                    backendsRegistered = true;
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Registers the TmuxBackend class with the registry.
 * Called by TmuxBackend.ts to avoid circular dependencies.
 */
function registerTmuxBackend(backendClass) {
    TmuxBackendClass = backendClass;
}
/**
 * Registers the ITermBackend class with the registry.
 * Called by ITermBackend.ts to avoid circular dependencies.
 */
function registerITermBackend(backendClass) {
    (0, debug_js_1.logForDebugging)("[registry] registerITermBackend called, class=".concat((backendClass === null || backendClass === void 0 ? void 0 : backendClass.name) || 'undefined'));
    ITermBackendClass = backendClass;
}
/**
 * Creates a TmuxBackend instance.
 * Throws if TmuxBackend hasn't been registered.
 */
function createTmuxBackend() {
    if (!TmuxBackendClass) {
        throw new Error('TmuxBackend not registered. Import TmuxBackend.ts before using the registry.');
    }
    return new TmuxBackendClass();
}
/**
 * Creates an ITermBackend instance.
 * Throws if ITermBackend hasn't been registered.
 */
function createITermBackend() {
    if (!ITermBackendClass) {
        throw new Error('ITermBackend not registered. Import ITermBackend.ts before using the registry.');
    }
    return new ITermBackendClass();
}
/**
 * Detection priority flow:
 * 1. If inside tmux, always use tmux (even in iTerm2)
 * 2. If in iTerm2 with it2 available, use iTerm2 backend
 * 3. If in iTerm2 without it2, return result indicating setup needed
 * 4. If tmux available, use tmux (creates external session)
 * 5. Otherwise, throw error with instructions
 */
function detectAndGetBackend() {
    return __awaiter(this, void 0, void 0, function () {
        var insideTmux, inITerm2, backend, preferTmux, it2Available, backend, tmuxAvailable_1, backend, tmuxAvailable, backend;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Ensure backends are registered before detection
                return [4 /*yield*/, ensureBackendsRegistered()
                    // Return cached result if available
                ];
                case 1:
                    // Ensure backends are registered before detection
                    _a.sent();
                    // Return cached result if available
                    if (cachedDetectionResult) {
                        (0, debug_js_1.logForDebugging)("[BackendRegistry] Using cached backend: ".concat(cachedDetectionResult.backend.type));
                        return [2 /*return*/, cachedDetectionResult];
                    }
                    (0, debug_js_1.logForDebugging)('[BackendRegistry] Starting backend detection...');
                    return [4 /*yield*/, (0, detection_js_1.isInsideTmux)()];
                case 2:
                    insideTmux = _a.sent();
                    inITerm2 = (0, detection_js_1.isInITerm2)();
                    (0, debug_js_1.logForDebugging)("[BackendRegistry] Environment: insideTmux=".concat(insideTmux, ", inITerm2=").concat(inITerm2));
                    // Priority 1: If inside tmux, always use tmux
                    if (insideTmux) {
                        (0, debug_js_1.logForDebugging)('[BackendRegistry] Selected: tmux (running inside tmux session)');
                        backend = createTmuxBackend();
                        cachedBackend = backend;
                        cachedDetectionResult = {
                            backend: backend,
                            isNative: true,
                            needsIt2Setup: false,
                        };
                        return [2 /*return*/, cachedDetectionResult];
                    }
                    if (!inITerm2) return [3 /*break*/, 7];
                    preferTmux = (0, it2Setup_js_1.getPreferTmuxOverIterm2)();
                    if (!preferTmux) return [3 /*break*/, 3];
                    (0, debug_js_1.logForDebugging)('[BackendRegistry] User prefers tmux over iTerm2, skipping iTerm2 detection');
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, detection_js_1.isIt2CliAvailable)()];
                case 4:
                    it2Available = _a.sent();
                    (0, debug_js_1.logForDebugging)("[BackendRegistry] iTerm2 detected, it2 CLI available: ".concat(it2Available));
                    if (it2Available) {
                        (0, debug_js_1.logForDebugging)('[BackendRegistry] Selected: iterm2 (native iTerm2 with it2 CLI)');
                        backend = createITermBackend();
                        cachedBackend = backend;
                        cachedDetectionResult = {
                            backend: backend,
                            isNative: true,
                            needsIt2Setup: false,
                        };
                        return [2 /*return*/, cachedDetectionResult];
                    }
                    _a.label = 5;
                case 5: return [4 /*yield*/, (0, detection_js_1.isTmuxAvailable)()];
                case 6:
                    tmuxAvailable_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[BackendRegistry] it2 not available, tmux available: ".concat(tmuxAvailable_1));
                    if (tmuxAvailable_1) {
                        (0, debug_js_1.logForDebugging)('[BackendRegistry] Selected: tmux (fallback in iTerm2, it2 setup recommended)');
                        backend = createTmuxBackend();
                        cachedBackend = backend;
                        cachedDetectionResult = {
                            backend: backend,
                            isNative: false,
                            needsIt2Setup: !preferTmux,
                        };
                        return [2 /*return*/, cachedDetectionResult];
                    }
                    // In iTerm2 with no it2 and no tmux - it2 setup is required
                    (0, debug_js_1.logForDebugging)('[BackendRegistry] ERROR: iTerm2 detected but no it2 CLI and no tmux');
                    throw new Error('iTerm2 detected but it2 CLI not installed. Install it2 with: pip install it2');
                case 7: return [4 /*yield*/, (0, detection_js_1.isTmuxAvailable)()];
                case 8:
                    tmuxAvailable = _a.sent();
                    (0, debug_js_1.logForDebugging)("[BackendRegistry] Not in tmux or iTerm2, tmux available: ".concat(tmuxAvailable));
                    if (tmuxAvailable) {
                        (0, debug_js_1.logForDebugging)('[BackendRegistry] Selected: tmux (external session mode)');
                        backend = createTmuxBackend();
                        cachedBackend = backend;
                        cachedDetectionResult = {
                            backend: backend,
                            isNative: false,
                            needsIt2Setup: false,
                        };
                        return [2 /*return*/, cachedDetectionResult];
                    }
                    // No backend available - tmux is not installed
                    (0, debug_js_1.logForDebugging)('[BackendRegistry] ERROR: No pane backend available');
                    throw new Error(getTmuxInstallInstructions());
            }
        });
    });
}
/**
 * Returns platform-specific tmux installation instructions.
 */
function getTmuxInstallInstructions() {
    var platform = (0, platform_js_1.getPlatform)();
    switch (platform) {
        case 'macos':
            return "To use agent swarms, install tmux:\n  brew install tmux\nThen start a tmux session with: tmux new-session -s claude";
        case 'linux':
        case 'wsl':
            return "To use agent swarms, install tmux:\n  sudo apt install tmux    # Ubuntu/Debian\n  sudo dnf install tmux    # Fedora/RHEL\nThen start a tmux session with: tmux new-session -s claude";
        case 'windows':
            return "To use agent swarms, you need tmux which requires WSL (Windows Subsystem for Linux).\nInstall WSL first, then inside WSL run:\n  sudo apt install tmux\nThen start a tmux session with: tmux new-session -s claude";
        default:
            return "To use agent swarms, install tmux using your system's package manager.\nThen start a tmux session with: tmux new-session -s claude";
    }
}
/**
 * Gets a backend by explicit type selection.
 * Useful for testing or when the user has a preference.
 *
 * @param type - The backend type to get
 * @returns The requested backend instance
 * @throws If the requested backend type is not available
 */
function getBackendByType(type) {
    switch (type) {
        case 'tmux':
            return createTmuxBackend();
        case 'iterm2':
            return createITermBackend();
    }
}
/**
 * Gets the currently cached backend, if any.
 * Returns null if no backend has been detected yet.
 */
function getCachedBackend() {
    return cachedBackend;
}
/**
 * Gets the cached backend detection result, if any.
 * Returns null if detection hasn't run yet.
 * Use `isNative` to check if teammates are visible in native panes.
 */
function getCachedDetectionResult() {
    return cachedDetectionResult;
}
/**
 * Records that spawn fell back to in-process mode because no pane backend
 * was available. After this, isInProcessEnabled() returns true and subsequent
 * spawns short-circuit to in-process (the environment won't change mid-session).
 */
function markInProcessFallback() {
    (0, debug_js_1.logForDebugging)('[BackendRegistry] Marking in-process fallback as active');
    inProcessFallbackActive = true;
}
/**
 * Gets the teammate mode for this session.
 * Returns the session snapshot captured at startup, ignoring runtime config changes.
 */
function getTeammateMode() {
    return (0, teammateModeSnapshot_js_1.getTeammateModeFromSnapshot)();
}
/**
 * Checks if in-process teammate execution is enabled.
 *
 * Logic:
 * - If teammateMode is 'in-process', always enabled
 * - If teammateMode is 'tmux', always disabled (use pane backend)
 * - If teammateMode is 'auto' (default), check environment:
 *   - If inside tmux, use pane backend (return false)
 *   - If inside iTerm2, use pane backend (return false) - detectAndGetBackend()
 *     will pick ITermBackend if it2 is available, or fall back to tmux
 *   - Otherwise, use in-process (return true)
 */
function isInProcessEnabled() {
    // Force in-process mode for non-interactive sessions (-p mode)
    // since tmux-based teammates don't make sense without a terminal UI
    if ((0, state_js_1.getIsNonInteractiveSession)()) {
        (0, debug_js_1.logForDebugging)('[BackendRegistry] isInProcessEnabled: true (non-interactive session)');
        return true;
    }
    var mode = getTeammateMode();
    var enabled;
    if (mode === 'in-process') {
        enabled = true;
    }
    else if (mode === 'tmux') {
        enabled = false;
    }
    else {
        // 'auto' mode - if a prior spawn fell back to in-process because no pane
        // backend was available, stay in-process (scoped to auto mode only so a
        // mid-session Settings change to explicit 'tmux' still takes effect).
        if (inProcessFallbackActive) {
            (0, debug_js_1.logForDebugging)('[BackendRegistry] isInProcessEnabled: true (fallback after pane backend unavailable)');
            return true;
        }
        // Check if a pane backend environment is available
        // If inside tmux or iTerm2, use pane backend; otherwise use in-process
        var insideTmux = (0, detection_js_1.isInsideTmuxSync)();
        var inITerm2 = (0, detection_js_1.isInITerm2)();
        enabled = !insideTmux && !inITerm2;
    }
    (0, debug_js_1.logForDebugging)("[BackendRegistry] isInProcessEnabled: ".concat(enabled, " (mode=").concat(mode, ", insideTmux=").concat((0, detection_js_1.isInsideTmuxSync)(), ", inITerm2=").concat((0, detection_js_1.isInITerm2)(), ")"));
    return enabled;
}
/**
 * Returns the resolved teammate executor mode for this session.
 * Unlike getTeammateModeFromSnapshot which may return 'auto', this returns
 * what 'auto' actually resolves to given the current environment.
 */
function getResolvedTeammateMode() {
    return isInProcessEnabled() ? 'in-process' : 'tmux';
}
/**
 * Gets the InProcessBackend instance.
 * Creates and caches the instance on first call.
 */
function getInProcessBackend() {
    if (!cachedInProcessBackend) {
        cachedInProcessBackend = (0, InProcessBackend_js_1.createInProcessBackend)();
    }
    return cachedInProcessBackend;
}
/**
 * Gets a TeammateExecutor for spawning teammates.
 *
 * Returns either:
 * - InProcessBackend when preferInProcess is true and in-process mode is enabled
 * - PaneBackendExecutor wrapping the detected pane backend otherwise
 *
 * This provides a unified TeammateExecutor interface regardless of execution mode,
 * allowing callers to spawn and manage teammates without knowing the backend details.
 *
 * @param preferInProcess - If true and in-process is enabled, returns InProcessBackend.
 *                          Otherwise returns PaneBackendExecutor.
 * @returns TeammateExecutor instance
 */
function getTeammateExecutor() {
    return __awaiter(this, arguments, void 0, function (preferInProcess) {
        if (preferInProcess === void 0) { preferInProcess = false; }
        return __generator(this, function (_a) {
            if (preferInProcess && isInProcessEnabled()) {
                (0, debug_js_1.logForDebugging)('[BackendRegistry] Using in-process executor');
                return [2 /*return*/, getInProcessBackend()];
            }
            // Return pane backend executor
            (0, debug_js_1.logForDebugging)('[BackendRegistry] Using pane backend executor');
            return [2 /*return*/, getPaneBackendExecutor()];
        });
    });
}
/**
 * Gets the PaneBackendExecutor instance.
 * Creates and caches the instance on first call, detecting the appropriate pane backend.
 */
function getPaneBackendExecutor() {
    return __awaiter(this, void 0, void 0, function () {
        var detection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!cachedPaneBackendExecutor) return [3 /*break*/, 2];
                    return [4 /*yield*/, detectAndGetBackend()];
                case 1:
                    detection = _a.sent();
                    cachedPaneBackendExecutor = (0, PaneBackendExecutor_js_1.createPaneBackendExecutor)(detection.backend);
                    (0, debug_js_1.logForDebugging)("[BackendRegistry] Created PaneBackendExecutor wrapping ".concat(detection.backend.type));
                    _a.label = 2;
                case 2: return [2 /*return*/, cachedPaneBackendExecutor];
            }
        });
    });
}
/**
 * Resets the backend detection cache.
 * Used for testing to allow re-detection.
 */
function resetBackendDetection() {
    cachedBackend = null;
    cachedDetectionResult = null;
    cachedInProcessBackend = null;
    cachedPaneBackendExecutor = null;
    backendsRegistered = false;
    inProcessFallbackActive = false;
}
