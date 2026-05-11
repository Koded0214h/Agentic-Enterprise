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
exports.safeFilenameId = safeFilenameId;
exports.createSessionSpawner = createSessionSpawner;
exports._extractActivitiesForTesting = extractActivities;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var readline_1 = require("readline");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var debugUtils_js_1 = require("./debugUtils.js");
var MAX_ACTIVITIES = 10;
var MAX_STDERR_LINES = 10;
/**
 * Sanitize a session ID for use in file names.
 * Strips any characters that could cause path traversal (e.g. `../`, `/`)
 * or other filesystem issues, replacing them with underscores.
 */
function safeFilenameId(id) {
    return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}
/** Map tool names to human-readable verbs for the status display. */
var TOOL_VERBS = {
    Read: 'Reading',
    Write: 'Writing',
    Edit: 'Editing',
    MultiEdit: 'Editing',
    Bash: 'Running',
    Glob: 'Searching',
    Grep: 'Searching',
    WebFetch: 'Fetching',
    WebSearch: 'Searching',
    Task: 'Running task',
    FileReadTool: 'Reading',
    FileWriteTool: 'Writing',
    FileEditTool: 'Editing',
    GlobTool: 'Searching',
    GrepTool: 'Searching',
    BashTool: 'Running',
    NotebookEditTool: 'Editing notebook',
    LSP: 'LSP',
};
function toolSummary(name, input) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var verb = (_a = TOOL_VERBS[name]) !== null && _a !== void 0 ? _a : name;
    var target = (_h = (_g = (_f = (_d = (_c = (_b = input.file_path) !== null && _b !== void 0 ? _b : input.filePath) !== null && _c !== void 0 ? _c : input.pattern) !== null && _d !== void 0 ? _d : (_e = input.command) === null || _e === void 0 ? void 0 : _e.slice(0, 60)) !== null && _f !== void 0 ? _f : input.url) !== null && _g !== void 0 ? _g : input.query) !== null && _h !== void 0 ? _h : '';
    if (target) {
        return "".concat(verb, " ").concat(target);
    }
    return verb;
}
function extractActivities(line, sessionId, onDebug) {
    var _a, _b, _c, _d;
    var parsed;
    try {
        parsed = (0, slowOperations_js_1.jsonParse)(line);
    }
    catch (_e) {
        return [];
    }
    if (!parsed || typeof parsed !== 'object') {
        return [];
    }
    var msg = parsed;
    var activities = [];
    var now = Date.now();
    switch (msg.type) {
        case 'assistant': {
            var message = msg.message;
            if (!message)
                break;
            var content = message.content;
            if (!Array.isArray(content))
                break;
            for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
                var block = content_1[_i];
                if (!block || typeof block !== 'object')
                    continue;
                var b = block;
                if (b.type === 'tool_use') {
                    var name_1 = (_a = b.name) !== null && _a !== void 0 ? _a : 'Tool';
                    var input = (_b = b.input) !== null && _b !== void 0 ? _b : {};
                    var summary = toolSummary(name_1, input);
                    activities.push({
                        type: 'tool_start',
                        summary: summary,
                        timestamp: now,
                    });
                    onDebug("[bridge:activity] sessionId=".concat(sessionId, " tool_use name=").concat(name_1, " ").concat(inputPreview(input)));
                }
                else if (b.type === 'text') {
                    var text = (_c = b.text) !== null && _c !== void 0 ? _c : '';
                    if (text.length > 0) {
                        activities.push({
                            type: 'text',
                            summary: text.slice(0, 80),
                            timestamp: now,
                        });
                        onDebug("[bridge:activity] sessionId=".concat(sessionId, " text \"").concat(text.slice(0, 100), "\""));
                    }
                }
            }
            break;
        }
        case 'result': {
            var subtype = msg.subtype;
            if (subtype === 'success') {
                activities.push({
                    type: 'result',
                    summary: 'Session completed',
                    timestamp: now,
                });
                onDebug("[bridge:activity] sessionId=".concat(sessionId, " result subtype=success"));
            }
            else if (subtype) {
                var errors = msg.errors;
                var errorSummary = (_d = errors === null || errors === void 0 ? void 0 : errors[0]) !== null && _d !== void 0 ? _d : "Error: ".concat(subtype);
                activities.push({
                    type: 'error',
                    summary: errorSummary,
                    timestamp: now,
                });
                onDebug("[bridge:activity] sessionId=".concat(sessionId, " result subtype=").concat(subtype, " error=\"").concat(errorSummary, "\""));
            }
            else {
                onDebug("[bridge:activity] sessionId=".concat(sessionId, " result subtype=undefined"));
            }
            break;
        }
        default:
            break;
    }
    return activities;
}
/**
 * Extract plain text from a replayed SDKUserMessage NDJSON line. Returns the
 * trimmed text if this looks like a real human-authored message, otherwise
 * undefined so the caller keeps waiting for the first real message.
 */
function extractUserMessageText(msg) {
    // Skip tool-result user messages (wrapped subagent results) and synthetic
    // caveat messages — neither is human-authored.
    if (msg.parent_tool_use_id != null || msg.isSynthetic || msg.isReplay)
        return undefined;
    var message = msg.message;
    var content = message === null || message === void 0 ? void 0 : message.content;
    var text;
    if (typeof content === 'string') {
        text = content;
    }
    else if (Array.isArray(content)) {
        for (var _i = 0, content_2 = content; _i < content_2.length; _i++) {
            var block = content_2[_i];
            if (block &&
                typeof block === 'object' &&
                block.type === 'text') {
                text = block.text;
                break;
            }
        }
    }
    text = text === null || text === void 0 ? void 0 : text.trim();
    return text ? text : undefined;
}
/** Build a short preview of tool input for debug logging. */
function inputPreview(input) {
    var parts = [];
    for (var _i = 0, _a = Object.entries(input); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], val = _b[1];
        if (typeof val === 'string') {
            parts.push("".concat(key, "=\"").concat(val.slice(0, 100), "\""));
        }
        if (parts.length >= 3)
            break;
    }
    return parts.join(' ');
}
function createSessionSpawner(deps) {
    return {
        spawn: function (opts, dir) {
            // Debug file resolution:
            // 1. If deps.debugFile is provided, use it with session ID suffix for uniqueness
            // 2. If verbose or ant build, auto-generate a temp file path
            // 3. Otherwise, no debug file
            var safeId = safeFilenameId(opts.sessionId);
            var debugFile;
            if (deps.debugFile) {
                var ext = deps.debugFile.lastIndexOf('.');
                if (ext > 0) {
                    debugFile = "".concat(deps.debugFile.slice(0, ext), "-").concat(safeId).concat(deps.debugFile.slice(ext));
                }
                else {
                    debugFile = "".concat(deps.debugFile, "-").concat(safeId);
                }
            }
            else if (deps.verbose || process.env.USER_TYPE === 'ant') {
                debugFile = (0, path_1.join)((0, os_1.tmpdir)(), 'claude', "bridge-session-".concat(safeId, ".log"));
            }
            // Transcript file: write raw NDJSON lines for post-hoc analysis.
            // Placed alongside the debug file when one is configured.
            var transcriptStream = null;
            var transcriptPath;
            if (deps.debugFile) {
                transcriptPath = (0, path_1.join)((0, path_1.dirname)(deps.debugFile), "bridge-transcript-".concat(safeId, ".jsonl"));
                transcriptStream = (0, fs_1.createWriteStream)(transcriptPath, { flags: 'a' });
                transcriptStream.on('error', function (err) {
                    deps.onDebug("[bridge:session] Transcript write error: ".concat(err.message));
                    transcriptStream = null;
                });
                deps.onDebug("[bridge:session] Transcript log: ".concat(transcriptPath));
            }
            var args = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], deps.scriptArgs, true), [
                '--print',
                '--sdk-url',
                opts.sdkUrl,
                '--session-id',
                opts.sessionId,
                '--input-format',
                'stream-json',
                '--output-format',
                'stream-json',
                '--replay-user-messages'
            ], false), (deps.verbose ? ['--verbose'] : []), true), (debugFile ? ['--debug-file', debugFile] : []), true), (deps.permissionMode
                ? ['--permission-mode', deps.permissionMode]
                : []), true);
            var env = __assign(__assign(__assign(__assign(__assign({}, deps.env), { 
                // Strip the bridge's OAuth token so the child CC process uses
                // the session access token for inference instead.
                CLAUDE_CODE_OAUTH_TOKEN: undefined, CLAUDE_CODE_ENVIRONMENT_KIND: 'bridge' }), (deps.sandbox && { CLAUDE_CODE_FORCE_SANDBOX: '1' })), { CLAUDE_CODE_SESSION_ACCESS_TOKEN: opts.accessToken, 
                // v1: HybridTransport (WS reads + POST writes) to Session-Ingress.
                // Harmless in v2 mode — transportUtils checks CLAUDE_CODE_USE_CCR_V2 first.
                CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V2: '1' }), (opts.useCcrV2 && {
                CLAUDE_CODE_USE_CCR_V2: '1',
                CLAUDE_CODE_WORKER_EPOCH: String(opts.workerEpoch),
            }));
            deps.onDebug("[bridge:session] Spawning sessionId=".concat(opts.sessionId, " sdkUrl=").concat(opts.sdkUrl, " accessToken=").concat(opts.accessToken ? 'present' : 'MISSING'));
            deps.onDebug("[bridge:session] Child args: ".concat(args.join(' ')));
            if (debugFile) {
                deps.onDebug("[bridge:session] Debug log: ".concat(debugFile));
            }
            // Pipe all three streams: stdin for control, stdout for NDJSON parsing,
            // stderr for error capture and diagnostics.
            var child = (0, child_process_1.spawn)(deps.execPath, args, {
                cwd: dir,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: env,
                windowsHide: true,
            });
            deps.onDebug("[bridge:session] sessionId=".concat(opts.sessionId, " pid=").concat(child.pid));
            var activities = [];
            var currentActivity = null;
            var lastStderr = [];
            var sigkillSent = false;
            var firstUserMessageSeen = false;
            // Buffer stderr for error diagnostics
            if (child.stderr) {
                var stderrRl = (0, readline_1.createInterface)({ input: child.stderr });
                stderrRl.on('line', function (line) {
                    // Forward stderr to bridge's stderr in verbose mode
                    if (deps.verbose) {
                        process.stderr.write(line + '\n');
                    }
                    // Ring buffer of last N lines
                    if (lastStderr.length >= MAX_STDERR_LINES) {
                        lastStderr.shift();
                    }
                    lastStderr.push(line);
                });
            }
            // Parse NDJSON from child stdout
            if (child.stdout) {
                var rl = (0, readline_1.createInterface)({ input: child.stdout });
                rl.on('line', function (line) {
                    var _a;
                    // Write raw NDJSON to transcript file
                    if (transcriptStream) {
                        transcriptStream.write(line + '\n');
                    }
                    // Log all messages flowing from the child CLI to the bridge
                    deps.onDebug("[bridge:ws] sessionId=".concat(opts.sessionId, " <<< ").concat((0, debugUtils_js_1.debugTruncate)(line)));
                    // In verbose mode, forward raw output to stderr
                    if (deps.verbose) {
                        process.stderr.write(line + '\n');
                    }
                    var extracted = extractActivities(line, opts.sessionId, deps.onDebug);
                    for (var _i = 0, extracted_1 = extracted; _i < extracted_1.length; _i++) {
                        var activity = extracted_1[_i];
                        // Maintain ring buffer
                        if (activities.length >= MAX_ACTIVITIES) {
                            activities.shift();
                        }
                        activities.push(activity);
                        currentActivity = activity;
                        (_a = deps.onActivity) === null || _a === void 0 ? void 0 : _a.call(deps, opts.sessionId, activity);
                    }
                    // Detect control_request and replayed user messages.
                    // extractActivities parses the same line but swallows parse errors
                    // and skips 'user' type — re-parse here is cheap (NDJSON lines are
                    // small) and keeps each path self-contained.
                    {
                        var parsed = void 0;
                        try {
                            parsed = (0, slowOperations_js_1.jsonParse)(line);
                        }
                        catch (_b) {
                            // Non-JSON line, skip detection
                        }
                        if (parsed && typeof parsed === 'object') {
                            var msg = parsed;
                            if (msg.type === 'control_request') {
                                var request = msg.request;
                                if ((request === null || request === void 0 ? void 0 : request.subtype) === 'can_use_tool' &&
                                    deps.onPermissionRequest) {
                                    deps.onPermissionRequest(opts.sessionId, parsed, opts.accessToken);
                                }
                                // interrupt is turn-level; the child handles it internally (print.ts)
                            }
                            else if (msg.type === 'user' &&
                                !firstUserMessageSeen &&
                                opts.onFirstUserMessage) {
                                var text = extractUserMessageText(msg);
                                if (text) {
                                    firstUserMessageSeen = true;
                                    opts.onFirstUserMessage(text);
                                }
                            }
                        }
                    }
                });
            }
            var done = new Promise(function (resolve) {
                child.on('close', function (code, signal) {
                    // Close transcript stream on exit
                    if (transcriptStream) {
                        transcriptStream.end();
                        transcriptStream = null;
                    }
                    if (signal === 'SIGTERM' || signal === 'SIGINT') {
                        deps.onDebug("[bridge:session] sessionId=".concat(opts.sessionId, " interrupted signal=").concat(signal, " pid=").concat(child.pid));
                        resolve('interrupted');
                    }
                    else if (code === 0) {
                        deps.onDebug("[bridge:session] sessionId=".concat(opts.sessionId, " completed exit_code=0 pid=").concat(child.pid));
                        resolve('completed');
                    }
                    else {
                        deps.onDebug("[bridge:session] sessionId=".concat(opts.sessionId, " failed exit_code=").concat(code, " pid=").concat(child.pid));
                        resolve('failed');
                    }
                });
                child.on('error', function (err) {
                    deps.onDebug("[bridge:session] sessionId=".concat(opts.sessionId, " spawn error: ").concat(err.message));
                    resolve('failed');
                });
            });
            var handle = {
                sessionId: opts.sessionId,
                done: done,
                activities: activities,
                accessToken: opts.accessToken,
                lastStderr: lastStderr,
                get currentActivity() {
                    return currentActivity;
                },
                kill: function () {
                    if (!child.killed) {
                        deps.onDebug("[bridge:session] Sending SIGTERM to sessionId=".concat(opts.sessionId, " pid=").concat(child.pid));
                        // On Windows, child.kill('SIGTERM') throws; use default signal.
                        if (process.platform === 'win32') {
                            child.kill();
                        }
                        else {
                            child.kill('SIGTERM');
                        }
                    }
                },
                forceKill: function () {
                    // Use separate flag because child.killed is set when kill() is called,
                    // not when the process exits. We need to send SIGKILL even after SIGTERM.
                    if (!sigkillSent && child.pid) {
                        sigkillSent = true;
                        deps.onDebug("[bridge:session] Sending SIGKILL to sessionId=".concat(opts.sessionId, " pid=").concat(child.pid));
                        if (process.platform === 'win32') {
                            child.kill();
                        }
                        else {
                            child.kill('SIGKILL');
                        }
                    }
                },
                writeStdin: function (data) {
                    if (child.stdin && !child.stdin.destroyed) {
                        deps.onDebug("[bridge:ws] sessionId=".concat(opts.sessionId, " >>> ").concat((0, debugUtils_js_1.debugTruncate)(data)));
                        child.stdin.write(data);
                    }
                },
                updateAccessToken: function (token) {
                    handle.accessToken = token;
                    // Send the fresh token to the child process via stdin. The child's
                    // StructuredIO handles update_environment_variables messages by
                    // setting process.env directly, so getSessionIngressAuthToken()
                    // picks up the new token on the next refreshHeaders call.
                    handle.writeStdin((0, slowOperations_js_1.jsonStringify)({
                        type: 'update_environment_variables',
                        variables: { CLAUDE_CODE_SESSION_ACCESS_TOKEN: token },
                    }) + '\n');
                    deps.onDebug("[bridge:session] Sent token refresh via stdin for sessionId=".concat(opts.sessionId));
                },
            };
            return handle;
        },
    };
}
