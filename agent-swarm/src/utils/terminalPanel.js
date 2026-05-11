"use strict";
/**
 * Built-in terminal panel toggled with Meta+J.
 *
 * Uses tmux for shell persistence: a separate tmux server with a per-instance
 * socket (e.g., "claude-panel-a1b2c3d4") holds the shell session. Each Claude
 * Code instance gets its own isolated terminal panel that persists within the
 * session but is destroyed when the instance exits.
 *
 * Meta+J is bound to detach-client inside tmux, so pressing it returns to
 * Claude Code while the shell keeps running. Next toggle re-attaches to the
 * same session.
 *
 * When tmux is not available, falls back to a non-persistent shell via spawnSync.
 *
 * Uses the same suspend-Ink pattern as the external editor (promptEditor.ts).
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTerminalPanelSocket = getTerminalPanelSocket;
exports.getTerminalPanel = getTerminalPanel;
var child_process_1 = require("child_process");
var state_js_1 = require("../bootstrap/state.js");
var instances_js_1 = require("../ink/instances.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var TMUX_SESSION = 'panel';
/**
 * Get the tmux socket name for the terminal panel.
 * Uses a unique socket per Claude Code instance (based on session ID)
 * so that each instance has its own isolated terminal panel.
 */
function getTerminalPanelSocket() {
    // Use first 8 chars of session UUID for uniqueness while keeping name short
    var sessionId = (0, state_js_1.getSessionId)();
    return "claude-panel-".concat(sessionId.slice(0, 8));
}
var instance;
/**
 * Return the singleton TerminalPanel, creating it lazily on first use.
 */
function getTerminalPanel() {
    if (!instance) {
        instance = new TerminalPanel();
    }
    return instance;
}
var TerminalPanel = /** @class */ (function () {
    function TerminalPanel() {
        this.cleanupRegistered = false;
    }
    // ── public API ────────────────────────────────────────────────────
    TerminalPanel.prototype.toggle = function () {
        this.showShell();
    };
    // ── tmux helpers ──────────────────────────────────────────────────
    TerminalPanel.prototype.checkTmux = function () {
        if (this.hasTmux !== undefined)
            return this.hasTmux;
        var result = (0, child_process_1.spawnSync)('tmux', ['-V'], { encoding: 'utf-8' });
        this.hasTmux = result.status === 0;
        if (!this.hasTmux) {
            (0, debug_js_1.logForDebugging)('Terminal panel: tmux not found, falling back to non-persistent shell');
        }
        return this.hasTmux;
    };
    TerminalPanel.prototype.hasSession = function () {
        var result = (0, child_process_1.spawnSync)('tmux', ['-L', getTerminalPanelSocket(), 'has-session', '-t', TMUX_SESSION], { encoding: 'utf-8' });
        return result.status === 0;
    };
    TerminalPanel.prototype.createSession = function () {
        var _this = this;
        var shell = process.env.SHELL || '/bin/bash';
        var cwd = (0, cwd_js_1.pwd)();
        var socket = getTerminalPanelSocket();
        var result = (0, child_process_1.spawnSync)('tmux', [
            '-L',
            socket,
            'new-session',
            '-d',
            '-s',
            TMUX_SESSION,
            '-c',
            cwd,
            shell,
            '-l',
        ], { encoding: 'utf-8' });
        if (result.status !== 0) {
            (0, debug_js_1.logForDebugging)("Terminal panel: failed to create tmux session: ".concat(result.stderr));
            return false;
        }
        // Bind Meta+J (toggles back to Claude Code from inside the terminal)
        // and configure the status bar hint. Chained with ';' to collapse
        // 5 spawnSync calls into 1.
        // biome-ignore format: one tmux command per line
        (0, child_process_1.spawnSync)('tmux', [
            '-L', socket,
            'bind-key', '-n', 'M-j', 'detach-client', ';',
            'set-option', '-g', 'status-style', 'bg=default', ';',
            'set-option', '-g', 'status-left', '', ';',
            'set-option', '-g', 'status-right', ' Alt+J to return to Claude ', ';',
            'set-option', '-g', 'status-right-style', 'fg=brightblack',
        ]);
        if (!this.cleanupRegistered) {
            this.cleanupRegistered = true;
            (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Detached async spawn — spawnSync here would block the event loop
                    // and serialize the entire cleanup Promise.all in gracefulShutdown.
                    // .on('error') swallows ENOENT if tmux disappears between session
                    // creation and cleanup — prevents spurious uncaughtException noise.
                    (0, child_process_1.spawn)('tmux', ['-L', socket, 'kill-server'], {
                        detached: true,
                        stdio: 'ignore',
                    })
                        .on('error', function () { })
                        .unref();
                    return [2 /*return*/];
                });
            }); });
        }
        return true;
    };
    TerminalPanel.prototype.attachSession = function () {
        (0, child_process_1.spawnSync)('tmux', ['-L', getTerminalPanelSocket(), 'attach-session', '-t', TMUX_SESSION], { stdio: 'inherit' });
    };
    // ── show shell ────────────────────────────────────────────────────
    TerminalPanel.prototype.showShell = function () {
        var inkInstance = instances_js_1.default.get(process.stdout);
        if (!inkInstance) {
            (0, debug_js_1.logForDebugging)('Terminal panel: no Ink instance found, aborting');
            return;
        }
        inkInstance.enterAlternateScreen();
        try {
            if (this.checkTmux() && this.ensureSession()) {
                this.attachSession();
            }
            else {
                this.runShellDirect();
            }
        }
        finally {
            inkInstance.exitAlternateScreen();
        }
    };
    // ── helpers ───────────────────────────────────────────────────────
    /** Ensure a tmux session exists, creating one if needed. */
    TerminalPanel.prototype.ensureSession = function () {
        if (this.hasSession())
            return true;
        return this.createSession();
    };
    /** Fallback when tmux is not available — runs a non-persistent shell. */
    TerminalPanel.prototype.runShellDirect = function () {
        var shell = process.env.SHELL || '/bin/bash';
        var cwd = (0, cwd_js_1.pwd)();
        (0, child_process_1.spawnSync)(shell, ['-i', '-l'], {
            stdio: 'inherit',
            cwd: cwd,
            env: process.env,
        });
    };
    return TerminalPanel;
}());
