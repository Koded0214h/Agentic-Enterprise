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
exports._resetLspManagerForTesting = _resetLspManagerForTesting;
exports.getLspServerManager = getLspServerManager;
exports.getInitializationStatus = getInitializationStatus;
exports.isLspConnected = isLspConnected;
exports.waitForInitialization = waitForInitialization;
exports.initializeLspServerManager = initializeLspServerManager;
exports.reinitializeLspServerManager = reinitializeLspServerManager;
exports.shutdownLspServerManager = shutdownLspServerManager;
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var LSPServerManager_js_1 = require("./LSPServerManager.js");
var passiveFeedback_js_1 = require("./passiveFeedback.js");
/**
 * Global singleton instance of the LSP server manager.
 * Initialized during Claude Code startup.
 */
var lspManagerInstance;
/**
 * Current initialization state
 */
var initializationState = 'not-started';
/**
 * Error from last initialization attempt, if any
 */
var initializationError;
/**
 * Generation counter to prevent stale initialization promises from updating state
 */
var initializationGeneration = 0;
/**
 * Promise that resolves when initialization completes (success or failure)
 */
var initializationPromise;
/**
 * Test-only sync reset. shutdownLspServerManager() is async and tears down
 * real connections; this only clears the module-scope singleton state so
 * reinitializeLspServerManager() early-returns on 'not-started' in downstream
 * tests on the same shard.
 */
function _resetLspManagerForTesting() {
    initializationState = 'not-started';
    initializationError = undefined;
    initializationPromise = undefined;
    initializationGeneration++;
}
/**
 * Get the singleton LSP server manager instance.
 * Returns undefined if not yet initialized, initialization failed, or still pending.
 *
 * Callers should check for undefined and handle gracefully, as initialization happens
 * asynchronously during Claude Code startup. Use getInitializationStatus() to
 * distinguish between pending, failed, and not-started states.
 */
function getLspServerManager() {
    // Don't return a broken instance if initialization failed
    if (initializationState === 'failed') {
        return undefined;
    }
    return lspManagerInstance;
}
/**
 * Get the current initialization status of the LSP server manager.
 *
 * @returns Status object with current state and error (if failed)
 */
function getInitializationStatus() {
    if (initializationState === 'failed') {
        return {
            status: 'failed',
            error: initializationError || new Error('Initialization failed'),
        };
    }
    if (initializationState === 'not-started') {
        return { status: 'not-started' };
    }
    if (initializationState === 'pending') {
        return { status: 'pending' };
    }
    return { status: 'success' };
}
/**
 * Check whether at least one language server is connected and healthy.
 * Backs LSPTool.isEnabled().
 */
function isLspConnected() {
    if (initializationState === 'failed')
        return false;
    var manager = getLspServerManager();
    if (!manager)
        return false;
    var servers = manager.getAllServers();
    if (servers.size === 0)
        return false;
    for (var _i = 0, _a = servers.values(); _i < _a.length; _i++) {
        var server = _a[_i];
        if (server.state !== 'error')
            return true;
    }
    return false;
}
/**
 * Wait for LSP server manager initialization to complete.
 *
 * Returns immediately if initialization has already completed (success or failure).
 * If initialization is pending, waits for it to complete.
 * If initialization hasn't started, returns immediately.
 *
 * @returns Promise that resolves when initialization is complete
 */
function waitForInitialization() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If already initialized or failed, return immediately
                    if (initializationState === 'success' || initializationState === 'failed') {
                        return [2 /*return*/];
                    }
                    if (!(initializationState === 'pending' && initializationPromise)) return [3 /*break*/, 2];
                    return [4 /*yield*/, initializationPromise];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Initialize the LSP server manager singleton.
 *
 * This function is called during Claude Code startup. It synchronously creates
 * the manager instance, then starts async initialization (loading LSP configs)
 * in the background without blocking the startup process.
 *
 * Safe to call multiple times - will only initialize once (idempotent).
 * However, if initialization previously failed, calling again will retry.
 */
function initializeLspServerManager() {
    // --bare / SIMPLE: no LSP. LSP is for editor integration (diagnostics,
    // hover, go-to-def in the REPL). Scripted -p calls have no use for it.
    if ((0, envUtils_js_1.isBareMode)()) {
        return;
    }
    (0, debug_js_1.logForDebugging)('[LSP MANAGER] initializeLspServerManager() called');
    // Skip if already initialized or currently initializing
    if (lspManagerInstance !== undefined && initializationState !== 'failed') {
        (0, debug_js_1.logForDebugging)('[LSP MANAGER] Already initialized or initializing, skipping');
        return;
    }
    // Reset state for retry if previous initialization failed
    if (initializationState === 'failed') {
        lspManagerInstance = undefined;
        initializationError = undefined;
    }
    // Create the manager instance and mark as pending
    lspManagerInstance = (0, LSPServerManager_js_1.createLSPServerManager)();
    initializationState = 'pending';
    (0, debug_js_1.logForDebugging)('[LSP MANAGER] Created manager instance, state=pending');
    // Increment generation to invalidate any pending initializations
    var currentGeneration = ++initializationGeneration;
    (0, debug_js_1.logForDebugging)("[LSP MANAGER] Starting async initialization (generation ".concat(currentGeneration, ")"));
    // Start initialization asynchronously without blocking
    // Store the promise so callers can await it via waitForInitialization()
    initializationPromise = lspManagerInstance
        .initialize()
        .then(function () {
        // Only update state if this is still the current initialization
        if (currentGeneration === initializationGeneration) {
            initializationState = 'success';
            (0, debug_js_1.logForDebugging)('LSP server manager initialized successfully');
            // Register passive notification handlers for diagnostics
            if (lspManagerInstance) {
                (0, passiveFeedback_js_1.registerLSPNotificationHandlers)(lspManagerInstance);
            }
        }
    })
        .catch(function (error) {
        // Only update state if this is still the current initialization
        if (currentGeneration === initializationGeneration) {
            initializationState = 'failed';
            initializationError = error;
            // Clear the instance since it's not usable
            lspManagerInstance = undefined;
            (0, log_js_1.logError)(error);
            (0, debug_js_1.logForDebugging)("Failed to initialize LSP server manager: ".concat((0, errors_js_1.errorMessage)(error)));
        }
    });
}
/**
 * Force re-initialization of the LSP server manager, even after a prior
 * successful init. Called from refreshActivePlugins() after plugin caches
 * are cleared, so newly-loaded plugin LSP servers are picked up.
 *
 * Fixes https://github.com/anthropics/claude-code/issues/15521:
 * loadAllPlugins() is memoized and can be called very early in startup
 * (via getCommands prefetch in setup.ts) before marketplaces are reconciled,
 * caching an empty plugin list. initializeLspServerManager() then reads that
 * stale memoized result and initializes with 0 servers. Unlike commands/agents/
 * hooks/MCP, LSP was never re-initialized on plugin refresh.
 *
 * Safe to call when no LSP plugins changed: initialize() is just config
 * parsing (servers are lazy-started on first use). Also safe during pending
 * init: the generation counter invalidates the in-flight promise.
 */
function reinitializeLspServerManager() {
    if (initializationState === 'not-started') {
        // initializeLspServerManager() was never called (e.g. headless subcommand
        // path). Don't start it now.
        return;
    }
    (0, debug_js_1.logForDebugging)('[LSP MANAGER] reinitializeLspServerManager() called');
    // Best-effort shutdown of any running servers on the old instance so
    // /reload-plugins doesn't leak child processes. Fire-and-forget: the
    // primary use case (issue #15521) has 0 servers so this is usually a no-op.
    if (lspManagerInstance) {
        void lspManagerInstance.shutdown().catch(function (err) {
            (0, debug_js_1.logForDebugging)("[LSP MANAGER] old instance shutdown during reinit failed: ".concat((0, errors_js_1.errorMessage)(err)));
        });
    }
    // Force the idempotence check in initializeLspServerManager() to fall
    // through. Generation counter handles invalidating any in-flight init.
    lspManagerInstance = undefined;
    initializationState = 'not-started';
    initializationError = undefined;
    initializeLspServerManager();
}
/**
 * Shutdown the LSP server manager and clean up resources.
 *
 * This should be called during Claude Code shutdown. Stops all running LSP servers
 * and clears internal state. Safe to call when not initialized (no-op).
 *
 * NOTE: Errors during shutdown are logged for monitoring but NOT propagated to the caller.
 * State is always cleared even if shutdown fails, to prevent resource accumulation.
 * This is acceptable during application exit when recovery is not possible.
 *
 * @returns Promise that resolves when shutdown completes (errors are swallowed)
 */
function shutdownLspServerManager() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (lspManagerInstance === undefined) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, lspManagerInstance.shutdown()];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)('LSP server manager shut down successfully');
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    (0, debug_js_1.logForDebugging)("Failed to shutdown LSP server manager: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    return [3 /*break*/, 5];
                case 4:
                    // Always clear state even if shutdown failed
                    lspManagerInstance = undefined;
                    initializationState = 'not-started';
                    initializationError = undefined;
                    initializationPromise = undefined;
                    // Increment generation to invalidate any pending initializations
                    initializationGeneration++;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
