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
exports.createBridgeLogger = createBridgeLogger;
var chalk_1 = require("chalk");
var qrcode_1 = require("qrcode");
var figures_js_1 = require("../constants/figures.js");
var stringWidth_js_1 = require("../ink/stringWidth.js");
var debug_js_1 = require("../utils/debug.js");
var bridgeStatusUtil_js_1 = require("./bridgeStatusUtil.js");
var QR_OPTIONS = {
    type: 'utf8',
    errorCorrectionLevel: 'L',
    small: true,
};
/** Generate a QR code and return its lines. */
function generateQr(url) {
    return __awaiter(this, void 0, void 0, function () {
        var qr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, qrcode_1.toString)(url, QR_OPTIONS)];
                case 1:
                    qr = _a.sent();
                    return [2 /*return*/, qr.split('\n').filter(function (line) { return line.length > 0; })];
            }
        });
    });
}
function createBridgeLogger(options) {
    var _a;
    var write = (_a = options.write) !== null && _a !== void 0 ? _a : (function (s) { return process.stdout.write(s); });
    var verbose = options.verbose;
    // Track how many status lines are currently displayed at the bottom
    var statusLineCount = 0;
    // Status state machine
    var currentState = 'idle';
    var currentStateText = 'Ready';
    var repoName = '';
    var branch = '';
    var debugLogPath = '';
    // Connect URL (built in printBanner with correct base for staging/prod)
    var connectUrl = '';
    var cachedIngressUrl = '';
    var cachedEnvironmentId = '';
    var activeSessionUrl = null;
    // QR code lines for the current URL
    var qrLines = [];
    var qrVisible = false;
    // Tool activity for the second status line
    var lastToolSummary = null;
    var lastToolTime = 0;
    // Session count indicator (shown when multi-session mode is enabled)
    var sessionActive = 0;
    var sessionMax = 1;
    // Spawn mode shown in the session-count line + gates the `w` hint
    var spawnModeDisplay = null;
    var spawnMode = 'single-session';
    // Per-session display info for the multi-session bullet list (keyed by compat sessionId)
    var sessionDisplayInfo = new Map();
    // Connecting spinner state
    var connectingTimer = null;
    var connectingTick = 0;
    /**
     * Count how many visual terminal rows a string occupies, accounting for
     * line wrapping. Each `\n` is one row, and content wider than the terminal
     * wraps to additional rows.
     */
    function countVisualLines(text) {
        // eslint-disable-next-line custom-rules/prefer-use-terminal-size
        var cols = process.stdout.columns || 80; // non-React CLI context
        var count = 0;
        // Split on newlines to get logical lines
        for (var _i = 0, _a = text.split('\n'); _i < _a.length; _i++) {
            var logical = _a[_i];
            if (logical.length === 0) {
                // Empty segment between consecutive \n — counts as 1 row
                count++;
                continue;
            }
            var width = (0, stringWidth_js_1.stringWidth)(logical);
            count += Math.max(1, Math.ceil(width / cols));
        }
        // The trailing \n in "line\n" produces an empty last element — don't count it
        // because the cursor sits at the start of the next line, not a new visual row.
        if (text.endsWith('\n')) {
            count--;
        }
        return count;
    }
    /** Write a status line and track its visual line count. */
    function writeStatus(text) {
        write(text);
        statusLineCount += countVisualLines(text);
    }
    /** Clear any currently displayed status lines. */
    function clearStatusLines() {
        if (statusLineCount <= 0)
            return;
        (0, debug_js_1.logForDebugging)("[bridge:ui] clearStatusLines count=".concat(statusLineCount));
        // Move cursor up to the start of the status block, then erase everything below
        write("\u001B[".concat(statusLineCount, "A")); // cursor up N lines
        write('\x1b[J'); // erase from cursor to end of screen
        statusLineCount = 0;
    }
    /** Print a permanent log line, clearing status first and restoring after. */
    function printLog(line) {
        clearStatusLines();
        write(line);
    }
    /** Regenerate the QR code with the given URL. */
    function regenerateQr(url) {
        generateQr(url)
            .then(function (lines) {
            qrLines = lines;
            renderStatusLine();
        })
            .catch(function (e) {
            (0, debug_js_1.logForDebugging)("QR code generation failed: ".concat(e), { level: 'error' });
        });
    }
    /** Render the connecting spinner line (shown before first updateIdleStatus). */
    function renderConnectingLine() {
        clearStatusLines();
        var frame = figures_js_1.BRIDGE_SPINNER_FRAMES[connectingTick % figures_js_1.BRIDGE_SPINNER_FRAMES.length];
        var suffix = '';
        if (repoName) {
            suffix += chalk_1.default.dim(' \u00b7 ') + chalk_1.default.dim(repoName);
        }
        if (branch) {
            suffix += chalk_1.default.dim(' \u00b7 ') + chalk_1.default.dim(branch);
        }
        writeStatus("".concat(chalk_1.default.yellow(frame), " ").concat(chalk_1.default.yellow('Connecting')).concat(suffix, "\n"));
    }
    /** Start the connecting spinner. Stopped by first updateIdleStatus(). */
    function startConnecting() {
        stopConnecting();
        renderConnectingLine();
        connectingTimer = setInterval(function () {
            connectingTick++;
            renderConnectingLine();
        }, 150);
    }
    /** Stop the connecting spinner. */
    function stopConnecting() {
        if (connectingTimer) {
            clearInterval(connectingTimer);
            connectingTimer = null;
        }
    }
    /** Render and write the current status lines based on state. */
    function renderStatusLine() {
        if (currentState === 'reconnecting' || currentState === 'failed') {
            // These states are handled separately (updateReconnectingStatus /
            // updateFailedStatus). Return before clearing so callers like toggleQr
            // and setSpawnModeDisplay don't blank the display during these states.
            return;
        }
        clearStatusLines();
        var isIdle = currentState === 'idle';
        // QR code above the status line
        if (qrVisible) {
            for (var _i = 0, qrLines_1 = qrLines; _i < qrLines_1.length; _i++) {
                var line = qrLines_1[_i];
                writeStatus("".concat(chalk_1.default.dim(line), "\n"));
            }
        }
        // Determine indicator and colors based on state
        var indicator = figures_js_1.BRIDGE_READY_INDICATOR;
        var indicatorColor = isIdle ? chalk_1.default.green : chalk_1.default.cyan;
        var baseColor = isIdle ? chalk_1.default.green : chalk_1.default.cyan;
        var stateText = baseColor(currentStateText);
        // Build the suffix with repo and branch
        var suffix = '';
        if (repoName) {
            suffix += chalk_1.default.dim(' \u00b7 ') + chalk_1.default.dim(repoName);
        }
        // In worktree mode each session gets its own branch, so showing the
        // bridge's branch would be misleading.
        if (branch && spawnMode !== 'worktree') {
            suffix += chalk_1.default.dim(' \u00b7 ') + chalk_1.default.dim(branch);
        }
        if (process.env.USER_TYPE === 'ant' && debugLogPath) {
            writeStatus("".concat(chalk_1.default.yellow('[ANT-ONLY] Logs:'), " ").concat(chalk_1.default.dim(debugLogPath), "\n"));
        }
        writeStatus("".concat(indicatorColor(indicator), " ").concat(stateText).concat(suffix, "\n"));
        // Session count and per-session list (multi-session mode only)
        if (sessionMax > 1) {
            var modeHint = spawnMode === 'worktree'
                ? 'New sessions will be created in an isolated worktree'
                : 'New sessions will be created in the current directory';
            writeStatus("    ".concat(chalk_1.default.dim("Capacity: ".concat(sessionActive, "/").concat(sessionMax, " \u00B7 ").concat(modeHint)), "\n"));
            for (var _a = 0, sessionDisplayInfo_1 = sessionDisplayInfo; _a < sessionDisplayInfo_1.length; _a++) {
                var _b = sessionDisplayInfo_1[_a], info = _b[1];
                var titleText = info.title
                    ? (0, bridgeStatusUtil_js_1.truncatePrompt)(info.title, 35)
                    : chalk_1.default.dim('Attached');
                var titleLinked = (0, bridgeStatusUtil_js_1.wrapWithOsc8Link)(titleText, info.url);
                var act = info.activity;
                var showAct = act && act.type !== 'result' && act.type !== 'error';
                var actText = showAct
                    ? chalk_1.default.dim(" ".concat((0, bridgeStatusUtil_js_1.truncatePrompt)(act.summary, 40)))
                    : '';
                writeStatus("    ".concat(titleLinked).concat(actText, "\n"));
            }
        }
        // Mode line for spawn modes with a single slot (or true single-session mode)
        if (sessionMax === 1) {
            var modeText = spawnMode === 'single-session'
                ? 'Single session \u00b7 exits when complete'
                : spawnMode === 'worktree'
                    ? "Capacity: ".concat(sessionActive, "/1 \u00B7 New sessions will be created in an isolated worktree")
                    : "Capacity: ".concat(sessionActive, "/1 \u00B7 New sessions will be created in the current directory");
            writeStatus("    ".concat(chalk_1.default.dim(modeText), "\n"));
        }
        // Tool activity line for single-session mode
        if (sessionMax === 1 &&
            !isIdle &&
            lastToolSummary &&
            Date.now() - lastToolTime < bridgeStatusUtil_js_1.TOOL_DISPLAY_EXPIRY_MS) {
            writeStatus("  ".concat(chalk_1.default.dim((0, bridgeStatusUtil_js_1.truncatePrompt)(lastToolSummary, 60)), "\n"));
        }
        // Blank line separator before footer
        var url = activeSessionUrl !== null && activeSessionUrl !== void 0 ? activeSessionUrl : connectUrl;
        if (url) {
            writeStatus('\n');
            var footerText = isIdle
                ? (0, bridgeStatusUtil_js_1.buildIdleFooterText)(url)
                : (0, bridgeStatusUtil_js_1.buildActiveFooterText)(url);
            var qrHint = qrVisible
                ? chalk_1.default.dim.italic('space to hide QR code')
                : chalk_1.default.dim.italic('space to show QR code');
            var toggleHint = spawnModeDisplay
                ? chalk_1.default.dim.italic(' \u00b7 w to toggle spawn mode')
                : '';
            writeStatus("".concat(chalk_1.default.dim(footerText), "\n"));
            writeStatus("".concat(qrHint).concat(toggleHint, "\n"));
        }
    }
    return {
        printBanner: function (config, environmentId) {
            cachedIngressUrl = config.sessionIngressUrl;
            cachedEnvironmentId = environmentId;
            connectUrl = (0, bridgeStatusUtil_js_1.buildBridgeConnectUrl)(environmentId, cachedIngressUrl);
            regenerateQr(connectUrl);
            if (verbose) {
                write(chalk_1.default.dim("Remote Control") + " v".concat(MACRO.VERSION, "\n"));
            }
            if (verbose) {
                if (config.spawnMode !== 'single-session') {
                    write(chalk_1.default.dim("Spawn mode: ") + "".concat(config.spawnMode, "\n"));
                    write(chalk_1.default.dim("Max concurrent sessions: ") + "".concat(config.maxSessions, "\n"));
                }
                write(chalk_1.default.dim("Environment ID: ") + "".concat(environmentId, "\n"));
            }
            if (config.sandbox) {
                write(chalk_1.default.dim("Sandbox: ") + "".concat(chalk_1.default.green('Enabled'), "\n"));
            }
            write('\n');
            // Start connecting spinner — first updateIdleStatus() will stop it
            startConnecting();
        },
        logSessionStart: function (sessionId, prompt) {
            if (verbose) {
                var short = (0, bridgeStatusUtil_js_1.truncatePrompt)(prompt, 80);
                printLog(chalk_1.default.dim("[".concat((0, bridgeStatusUtil_js_1.timestamp)(), "]")) +
                    " Session started: ".concat(chalk_1.default.white("\"".concat(short, "\"")), " (").concat(chalk_1.default.dim(sessionId), ")\n"));
            }
        },
        logSessionComplete: function (sessionId, durationMs) {
            printLog(chalk_1.default.dim("[".concat((0, bridgeStatusUtil_js_1.timestamp)(), "]")) +
                " Session ".concat(chalk_1.default.green('completed'), " (").concat((0, bridgeStatusUtil_js_1.formatDuration)(durationMs), ") ").concat(chalk_1.default.dim(sessionId), "\n"));
        },
        logSessionFailed: function (sessionId, error) {
            printLog(chalk_1.default.dim("[".concat((0, bridgeStatusUtil_js_1.timestamp)(), "]")) +
                " Session ".concat(chalk_1.default.red('failed'), ": ").concat(error, " ").concat(chalk_1.default.dim(sessionId), "\n"));
        },
        logStatus: function (message) {
            printLog(chalk_1.default.dim("[".concat((0, bridgeStatusUtil_js_1.timestamp)(), "]")) + " ".concat(message, "\n"));
        },
        logVerbose: function (message) {
            if (verbose) {
                printLog(chalk_1.default.dim("[".concat((0, bridgeStatusUtil_js_1.timestamp)(), "] ").concat(message)) + '\n');
            }
        },
        logError: function (message) {
            printLog(chalk_1.default.red("[".concat((0, bridgeStatusUtil_js_1.timestamp)(), "] Error: ").concat(message)) + '\n');
        },
        logReconnected: function (disconnectedMs) {
            printLog(chalk_1.default.dim("[".concat((0, bridgeStatusUtil_js_1.timestamp)(), "]")) +
                " ".concat(chalk_1.default.green('Reconnected'), " after ").concat((0, bridgeStatusUtil_js_1.formatDuration)(disconnectedMs), "\n"));
        },
        setRepoInfo: function (repo, branchName) {
            repoName = repo;
            branch = branchName;
        },
        setDebugLogPath: function (path) {
            debugLogPath = path;
        },
        updateIdleStatus: function () {
            stopConnecting();
            currentState = 'idle';
            currentStateText = 'Ready';
            lastToolSummary = null;
            lastToolTime = 0;
            activeSessionUrl = null;
            regenerateQr(connectUrl);
            renderStatusLine();
        },
        setAttached: function (sessionId) {
            stopConnecting();
            currentState = 'attached';
            currentStateText = 'Connected';
            lastToolSummary = null;
            lastToolTime = 0;
            // Multi-session: keep footer/QR on the environment connect URL so users
            // can spawn more sessions. Per-session links are in the bullet list.
            if (sessionMax <= 1) {
                activeSessionUrl = (0, bridgeStatusUtil_js_1.buildBridgeSessionUrl)(sessionId, cachedEnvironmentId, cachedIngressUrl);
                regenerateQr(activeSessionUrl);
            }
            renderStatusLine();
        },
        updateReconnectingStatus: function (delayStr, elapsedStr) {
            stopConnecting();
            clearStatusLines();
            currentState = 'reconnecting';
            // QR code above the status line
            if (qrVisible) {
                for (var _i = 0, qrLines_2 = qrLines; _i < qrLines_2.length; _i++) {
                    var line = qrLines_2[_i];
                    writeStatus("".concat(chalk_1.default.dim(line), "\n"));
                }
            }
            var frame = figures_js_1.BRIDGE_SPINNER_FRAMES[connectingTick % figures_js_1.BRIDGE_SPINNER_FRAMES.length];
            connectingTick++;
            writeStatus("".concat(chalk_1.default.yellow(frame), " ").concat(chalk_1.default.yellow('Reconnecting'), " ").concat(chalk_1.default.dim('\u00b7'), " ").concat(chalk_1.default.dim("retrying in ".concat(delayStr)), " ").concat(chalk_1.default.dim('\u00b7'), " ").concat(chalk_1.default.dim("disconnected ".concat(elapsedStr)), "\n"));
        },
        updateFailedStatus: function (error) {
            stopConnecting();
            clearStatusLines();
            currentState = 'failed';
            var suffix = '';
            if (repoName) {
                suffix += chalk_1.default.dim(' \u00b7 ') + chalk_1.default.dim(repoName);
            }
            if (branch) {
                suffix += chalk_1.default.dim(' \u00b7 ') + chalk_1.default.dim(branch);
            }
            writeStatus("".concat(chalk_1.default.red(figures_js_1.BRIDGE_FAILED_INDICATOR), " ").concat(chalk_1.default.red('Remote Control Failed')).concat(suffix, "\n"));
            writeStatus("".concat(chalk_1.default.dim(bridgeStatusUtil_js_1.FAILED_FOOTER_TEXT), "\n"));
            if (error) {
                writeStatus("".concat(chalk_1.default.red(error), "\n"));
            }
        },
        updateSessionStatus: function (_sessionId, _elapsed, activity, _trail) {
            // Cache tool activity for the second status line
            if (activity.type === 'tool_start') {
                lastToolSummary = activity.summary;
                lastToolTime = Date.now();
            }
            renderStatusLine();
        },
        clearStatus: function () {
            stopConnecting();
            clearStatusLines();
        },
        toggleQr: function () {
            qrVisible = !qrVisible;
            renderStatusLine();
        },
        updateSessionCount: function (active, max, mode) {
            if (sessionActive === active && sessionMax === max && spawnMode === mode)
                return;
            sessionActive = active;
            sessionMax = max;
            spawnMode = mode;
            // Don't re-render here — the status ticker calls renderStatusLine
            // on its own cadence, and the next tick will pick up the new values.
        },
        setSpawnModeDisplay: function (mode) {
            if (spawnModeDisplay === mode)
                return;
            spawnModeDisplay = mode;
            // Also sync the #21118-added spawnMode so the next render shows correct
            // mode hint + branch visibility. Don't render here — matches
            // updateSessionCount: called before printBanner (initial setup) and
            // again from the `w` handler (which follows with refreshDisplay).
            if (mode)
                spawnMode = mode;
        },
        addSession: function (sessionId, url) {
            sessionDisplayInfo.set(sessionId, { url: url });
        },
        updateSessionActivity: function (sessionId, activity) {
            var info = sessionDisplayInfo.get(sessionId);
            if (!info)
                return;
            info.activity = activity;
        },
        setSessionTitle: function (sessionId, title) {
            var info = sessionDisplayInfo.get(sessionId);
            if (!info)
                return;
            info.title = title;
            // Guard against reconnecting/failed — renderStatusLine clears then returns
            // early for those states, which would erase the spinner/error.
            if (currentState === 'reconnecting' || currentState === 'failed')
                return;
            if (sessionMax === 1) {
                // Single-session: show title in the main status line too.
                currentState = 'titled';
                currentStateText = (0, bridgeStatusUtil_js_1.truncatePrompt)(title, 40);
            }
            renderStatusLine();
        },
        removeSession: function (sessionId) {
            sessionDisplayInfo.delete(sessionId);
        },
        refreshDisplay: function () {
            // Skip during reconnecting/failed — renderStatusLine clears then returns
            // early for those states, which would erase the spinner/error.
            if (currentState === 'reconnecting' || currentState === 'failed')
                return;
            renderStatusLine();
        },
    };
}
