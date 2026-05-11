"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = exports.TeleportOperationError = exports.ShellError = exports.ConfigParseError = exports.AbortError = exports.MalformedCommandError = exports.ClaudeError = void 0;
exports.isAbortError = isAbortError;
exports.hasExactErrorMessage = hasExactErrorMessage;
exports.toError = toError;
exports.errorMessage = errorMessage;
exports.getErrnoCode = getErrnoCode;
exports.isENOENT = isENOENT;
exports.getErrnoPath = getErrnoPath;
exports.shortErrorStack = shortErrorStack;
exports.isFsInaccessible = isFsInaccessible;
exports.classifyAxiosError = classifyAxiosError;
var sdk_1 = require("@anthropic-ai/sdk");
var ClaudeError = /** @class */ (function (_super) {
    __extends(ClaudeError, _super);
    function ClaudeError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        return _this;
    }
    return ClaudeError;
}(Error));
exports.ClaudeError = ClaudeError;
var MalformedCommandError = /** @class */ (function (_super) {
    __extends(MalformedCommandError, _super);
    function MalformedCommandError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MalformedCommandError;
}(Error));
exports.MalformedCommandError = MalformedCommandError;
var AbortError = /** @class */ (function (_super) {
    __extends(AbortError, _super);
    function AbortError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'AbortError';
        return _this;
    }
    return AbortError;
}(Error));
exports.AbortError = AbortError;
/**
 * True iff `e` is any of the abort-shaped errors the codebase encounters:
 * our AbortError class, a DOMException from AbortController.abort()
 * (.name === 'AbortError'), or the SDK's APIUserAbortError. The SDK class
 * is checked via instanceof because minified builds mangle class names —
 * constructor.name becomes something like 'nJT' and the SDK never sets
 * this.name, so string matching silently fails in production.
 */
function isAbortError(e) {
    return (e instanceof AbortError ||
        e instanceof sdk_1.APIUserAbortError ||
        (e instanceof Error && e.name === 'AbortError'));
}
/**
 * Custom error class for configuration file parsing errors
 * Includes the file path and the default configuration that should be used
 */
var ConfigParseError = /** @class */ (function (_super) {
    __extends(ConfigParseError, _super);
    function ConfigParseError(message, filePath, defaultConfig) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ConfigParseError';
        _this.filePath = filePath;
        _this.defaultConfig = defaultConfig;
        return _this;
    }
    return ConfigParseError;
}(Error));
exports.ConfigParseError = ConfigParseError;
var ShellError = /** @class */ (function (_super) {
    __extends(ShellError, _super);
    function ShellError(stdout, stderr, code, interrupted) {
        var _this = _super.call(this, 'Shell command failed') || this;
        _this.stdout = stdout;
        _this.stderr = stderr;
        _this.code = code;
        _this.interrupted = interrupted;
        _this.name = 'ShellError';
        return _this;
    }
    return ShellError;
}(Error));
exports.ShellError = ShellError;
var TeleportOperationError = /** @class */ (function (_super) {
    __extends(TeleportOperationError, _super);
    function TeleportOperationError(message, formattedMessage) {
        var _this = _super.call(this, message) || this;
        _this.formattedMessage = formattedMessage;
        _this.name = 'TeleportOperationError';
        return _this;
    }
    return TeleportOperationError;
}(Error));
exports.TeleportOperationError = TeleportOperationError;
/**
 * Error with a message that is safe to log to telemetry.
 * Use the long name to confirm you've verified the message contains no
 * sensitive data (file paths, URLs, code snippets).
 *
 * Single-arg: same message for user and telemetry
 * Two-arg: different messages (e.g., full message has file path, telemetry doesn't)
 *
 * @example
 * // Same message for both
 * throw new TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(
 *   'MCP server "slack" connection timed out'
 * )
 *
 * // Different messages
 * throw new TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(
 *   `MCP tool timed out after ${ms}ms`,  // Full message for logs/user
 *   'MCP tool timed out'                  // Telemetry message
 * )
 */
var TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = /** @class */ (function (_super) {
    __extends(TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS, _super);
    function TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(message, telemetryMessage) {
        var _this = _super.call(this, message) || this;
        _this.name = 'TelemetrySafeError';
        _this.telemetryMessage = telemetryMessage !== null && telemetryMessage !== void 0 ? telemetryMessage : message;
        return _this;
    }
    return TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS;
}(Error));
exports.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS;
function hasExactErrorMessage(error, message) {
    return error instanceof Error && error.message === message;
}
/**
 * Normalize an unknown value into an Error.
 * Use at catch-site boundaries when you need an Error instance.
 */
function toError(e) {
    return e instanceof Error ? e : new Error(String(e));
}
/**
 * Extract a string message from an unknown error-like value.
 * Use when you only need the message (e.g., for logging or display).
 */
function errorMessage(e) {
    return e instanceof Error ? e.message : String(e);
}
/**
 * Extract the errno code (e.g., 'ENOENT', 'EACCES') from a caught error.
 * Returns undefined if the error has no code or is not an ErrnoException.
 * Replaces the `(e as NodeJS.ErrnoException).code` cast pattern.
 */
function getErrnoCode(e) {
    if (e && typeof e === 'object' && 'code' in e && typeof e.code === 'string') {
        return e.code;
    }
    return undefined;
}
/**
 * True if the error is ENOENT (file or directory does not exist).
 * Replaces `(e as NodeJS.ErrnoException).code === 'ENOENT'`.
 */
function isENOENT(e) {
    return getErrnoCode(e) === 'ENOENT';
}
/**
 * Extract the errno path (the filesystem path that triggered the error)
 * from a caught error. Returns undefined if the error has no path.
 * Replaces the `(e as NodeJS.ErrnoException).path` cast pattern.
 */
function getErrnoPath(e) {
    if (e && typeof e === 'object' && 'path' in e && typeof e.path === 'string') {
        return e.path;
    }
    return undefined;
}
/**
 * Extract error message + top N stack frames from an unknown error.
 * Use when the error flows to the model as a tool_result — full stack
 * traces are ~500-2000 chars of mostly-irrelevant internal frames and
 * waste context tokens. Keep the full stack in debug logs instead.
 */
function shortErrorStack(e, maxFrames) {
    var _a;
    if (maxFrames === void 0) { maxFrames = 5; }
    if (!(e instanceof Error))
        return String(e);
    if (!e.stack)
        return e.message;
    // V8/Bun stack format: "Name: message\n    at frame1\n    at frame2..."
    // First line is the message; subsequent "    at " lines are frames.
    var lines = e.stack.split('\n');
    var header = (_a = lines[0]) !== null && _a !== void 0 ? _a : e.message;
    var frames = lines.slice(1).filter(function (l) { return l.trim().startsWith('at '); });
    if (frames.length <= maxFrames)
        return e.stack;
    return __spreadArray([header], frames.slice(0, maxFrames), true).join('\n');
}
/**
 * True if the error means the path is missing, inaccessible, or
 * structurally unreachable — use in catch blocks after fs operations to
 * distinguish expected "nothing there / no access" from unexpected errors.
 *
 * Covers:
 *  ENOENT    — path does not exist
 *  EACCES    — permission denied
 *  EPERM     — operation not permitted
 *  ENOTDIR   — a path component is not a directory (e.g. a file named
 *              `.claude` exists where a directory is expected)
 *  ELOOP     — too many symlink levels (circular symlinks)
 */
function isFsInaccessible(e) {
    var code = getErrnoCode(e);
    return (code === 'ENOENT' ||
        code === 'EACCES' ||
        code === 'EPERM' ||
        code === 'ENOTDIR' ||
        code === 'ELOOP');
}
/**
 * Classify a caught error from an axios request into one of a few buckets.
 * Replaces the ~20-line isAxiosError → 401/403 → ECONNABORTED → ECONNREFUSED
 * chain duplicated across sync-style services (settingsSync, policyLimits,
 * remoteManagedSettings, teamMemorySync).
 *
 * Checks the `.isAxiosError` marker property directly (same as
 * axios.isAxiosError()) to keep this module dependency-free.
 */
function classifyAxiosError(e) {
    var _a;
    var message = errorMessage(e);
    if (!e ||
        typeof e !== 'object' ||
        !('isAxiosError' in e) ||
        !e.isAxiosError) {
        return { kind: 'other', message: message };
    }
    var err = e;
    var status = (_a = err.response) === null || _a === void 0 ? void 0 : _a.status;
    if (status === 401 || status === 403)
        return { kind: 'auth', status: status, message: message };
    if (err.code === 'ECONNABORTED')
        return { kind: 'timeout', status: status, message: message };
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return { kind: 'network', status: status, message: message };
    }
    return { kind: 'http', status: status, message: message };
}
