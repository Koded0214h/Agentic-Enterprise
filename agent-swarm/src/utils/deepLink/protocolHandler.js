"use strict";
/**
 * Protocol Handler
 *
 * Entry point for `claude --handle-uri <url>`. When the OS invokes claude
 * with a `claude-cli://` URL, this module:
 *   1. Parses the URI into a structured action
 *   2. Detects the user's terminal emulator
 *   3. Opens a new terminal window running claude with the appropriate args
 *
 * This runs in a headless context (no TTY) because the OS launches the binary
 * directly — there is no terminal attached.
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
exports.handleDeepLinkUri = handleDeepLinkUri;
exports.handleUrlSchemeLaunch = handleUrlSchemeLaunch;
var os_1 = require("os");
var debug_js_1 = require("../debug.js");
var githubRepoPathMapping_js_1 = require("../githubRepoPathMapping.js");
var slowOperations_js_1 = require("../slowOperations.js");
var banner_js_1 = require("./banner.js");
var parseDeepLink_js_1 = require("./parseDeepLink.js");
var registerProtocol_js_1 = require("./registerProtocol.js");
var terminalLauncher_js_1 = require("./terminalLauncher.js");
/**
 * Handle an incoming deep link URI.
 *
 * Called from the CLI entry point when `--handle-uri` is passed.
 * This function parses the URI, resolves the claude binary, and
 * launches it in the user's terminal.
 *
 * @param uri - The raw URI string (e.g., "claude-cli://prompt?q=hello+world")
 * @returns exit code (0 = success)
 */
function handleDeepLinkUri(uri) {
    return __awaiter(this, void 0, void 0, function () {
        var action, message, _a, cwd, resolvedRepo, lastFetch, _b, launched;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("Handling deep link URI: ".concat(uri));
                    try {
                        action = (0, parseDeepLink_js_1.parseDeepLink)(uri);
                    }
                    catch (error) {
                        message = error instanceof Error ? error.message : String(error);
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                        console.error("Deep link error: ".concat(message));
                        return [2 /*return*/, 1];
                    }
                    (0, debug_js_1.logForDebugging)("Parsed deep link action: ".concat((0, slowOperations_js_1.jsonStringify)(action)));
                    return [4 /*yield*/, resolveCwd(action)
                        // Resolve FETCH_HEAD age here, in the trampoline process, so main.tsx
                        // stays await-free — the launched instance receives it as a precomputed
                        // flag instead of statting the filesystem on its own startup path.
                    ];
                case 1:
                    _a = _c.sent(), cwd = _a.cwd, resolvedRepo = _a.resolvedRepo;
                    if (!resolvedRepo) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, banner_js_1.readLastFetchTime)(cwd)];
                case 2:
                    _b = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _b = undefined;
                    _c.label = 4;
                case 4:
                    lastFetch = _b;
                    return [4 /*yield*/, (0, terminalLauncher_js_1.launchInTerminal)(process.execPath, {
                            query: action.query,
                            cwd: cwd,
                            repo: resolvedRepo,
                            lastFetchMs: lastFetch === null || lastFetch === void 0 ? void 0 : lastFetch.getTime(),
                        })];
                case 5:
                    launched = _c.sent();
                    if (!launched) {
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                        console.error('Failed to open a terminal. Make sure a supported terminal emulator is installed.');
                        return [2 /*return*/, 1];
                    }
                    return [2 /*return*/, 0];
            }
        });
    });
}
/**
 * Handle the case where claude was launched as the app bundle's executable
 * by macOS (via URL scheme). Uses the NAPI module to receive the URL from
 * the Apple Event, then handles it normally.
 *
 * @returns exit code (0 = success, 1 = error, null = not a URL launch)
 */
function handleUrlSchemeLaunch() {
    return __awaiter(this, void 0, void 0, function () {
        var waitForUrlEvent, url, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // LaunchServices overwrites __CFBundleIdentifier with the launching bundle's
                    // ID. This is a precise positive signal — it's set to our exact bundle ID
                    // if and only if macOS launched us via the URL handler .app bundle.
                    // (`open` from a terminal passes the caller's env through, so negative
                    // heuristics like !TERM don't work — the terminal's TERM leaks in.)
                    if (process.env.__CFBundleIdentifier !== registerProtocol_js_1.MACOS_BUNDLE_ID) {
                        return [2 /*return*/, null];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('url-handler-napi'); })];
                case 2:
                    waitForUrlEvent = (_b.sent()).waitForUrlEvent;
                    url = waitForUrlEvent(5000);
                    if (!url) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, handleDeepLinkUri(url)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    _a = _b.sent();
                    // NAPI module not available, or handleDeepLinkUri rejected — not a URL launch
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resolve the working directory for the launched Claude instance.
 * Precedence: explicit cwd > repo lookup (MRU clone) > home.
 * A repo that isn't cloned locally is not an error — fall through to home
 * so a web link referencing a repo the user doesn't have still opens Claude.
 *
 * Returns the resolved cwd, and the repo slug if (and only if) the MRU
 * lookup hit — so the launched instance can show which clone was selected
 * and its git freshness.
 */
function resolveCwd(action) {
    return __awaiter(this, void 0, void 0, function () {
        var known, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (action.cwd) {
                        return [2 /*return*/, { cwd: action.cwd }];
                    }
                    if (!action.repo) return [3 /*break*/, 2];
                    known = (0, githubRepoPathMapping_js_1.getKnownPathsForRepo)(action.repo);
                    return [4 /*yield*/, (0, githubRepoPathMapping_js_1.filterExistingPaths)(known)];
                case 1:
                    existing = _a.sent();
                    if (existing[0]) {
                        (0, debug_js_1.logForDebugging)("Resolved repo ".concat(action.repo, " \u2192 ").concat(existing[0]));
                        return [2 /*return*/, { cwd: existing[0], resolvedRepo: action.repo }];
                    }
                    (0, debug_js_1.logForDebugging)("No local clone found for repo ".concat(action.repo, ", falling back to home"));
                    _a.label = 2;
                case 2: return [2 /*return*/, { cwd: (0, os_1.homedir)() }];
            }
        });
    });
}
