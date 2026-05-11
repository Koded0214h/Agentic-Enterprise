"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCR_SESSION_INGRESS_TOKEN_PATH = exports.CCR_API_KEY_PATH = exports.CCR_OAUTH_TOKEN_PATH = void 0;
exports.maybePersistTokenForSubprocesses = maybePersistTokenForSubprocesses;
exports.readTokenFromWellKnownFile = readTokenFromWellKnownFile;
exports.getOAuthTokenFromFileDescriptor = getOAuthTokenFromFileDescriptor;
exports.getApiKeyFromFileDescriptor = getApiKeyFromFileDescriptor;
var fs_1 = require("fs");
var state_js_1 = require("../bootstrap/state.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var fsOperations_js_1 = require("./fsOperations.js");
/**
 * Well-known token file locations in CCR. The Go environment-manager creates
 * /home/claude/.claude/remote/ and will (eventually) write these files too.
 * Until then, this module writes them on successful FD read so subprocesses
 * spawned inside the CCR container can find the token without inheriting
 * the FD — which they can't: pipe FDs don't cross tmux/shell boundaries.
 */
var CCR_TOKEN_DIR = '/home/claude/.claude/remote';
exports.CCR_OAUTH_TOKEN_PATH = "".concat(CCR_TOKEN_DIR, "/.oauth_token");
exports.CCR_API_KEY_PATH = "".concat(CCR_TOKEN_DIR, "/.api_key");
exports.CCR_SESSION_INGRESS_TOKEN_PATH = "".concat(CCR_TOKEN_DIR, "/.session_ingress_token");
/**
 * Best-effort write of the token to a well-known location for subprocess
 * access. CCR-gated: outside CCR there's no /home/claude/ and no reason to
 * put a token on disk that the FD was meant to keep off disk.
 */
function maybePersistTokenForSubprocesses(path, token, tokenName) {
    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)) {
        return;
    }
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs -- one-shot startup write in CCR, caller is sync
        (0, fs_1.mkdirSync)(CCR_TOKEN_DIR, { recursive: true, mode: 448 });
        // eslint-disable-next-line custom-rules/no-sync-fs -- one-shot startup write in CCR, caller is sync
        (0, fs_1.writeFileSync)(path, token, { encoding: 'utf8', mode: 384 });
        (0, debug_js_1.logForDebugging)("Persisted ".concat(tokenName, " to ").concat(path, " for subprocess access"));
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to persist ".concat(tokenName, " to disk (non-fatal): ").concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
    }
}
/**
 * Fallback read from a well-known file. The path only exists in CCR (env-manager
 * creates the directory), so file-not-found is the expected outcome everywhere
 * else — treated as "no fallback", not an error.
 */
function readTokenFromWellKnownFile(path, tokenName) {
    try {
        var fsOps = (0, fsOperations_js_1.getFsImplementation)();
        // eslint-disable-next-line custom-rules/no-sync-fs -- fallback read for CCR subprocess path, one-shot at startup, caller is sync
        var token = fsOps.readFileSync(path, { encoding: 'utf8' }).trim();
        if (!token) {
            return null;
        }
        (0, debug_js_1.logForDebugging)("Read ".concat(tokenName, " from well-known file ").concat(path));
        return token;
    }
    catch (error) {
        // ENOENT is the expected outcome outside CCR — stay silent. Anything
        // else (EACCES from perm misconfig, etc.) is worth surfacing in the
        // debug log so subprocess auth failures aren't mysterious.
        if (!(0, errors_js_1.isENOENT)(error)) {
            (0, debug_js_1.logForDebugging)("Failed to read ".concat(tokenName, " from ").concat(path, ": ").concat((0, errors_js_1.errorMessage)(error)), { level: 'debug' });
        }
        return null;
    }
}
/**
 * Shared FD-or-well-known-file credential reader.
 *
 * Priority order:
 *  1. File descriptor (legacy path) — env var points at a pipe FD passed by
 *     the Go env-manager via cmd.ExtraFiles. Pipe is drained on first read
 *     and doesn't cross exec/tmux boundaries.
 *  2. Well-known file — written by this function on successful FD read (and
 *     eventually by the env-manager directly). Covers subprocesses that can't
 *     inherit the FD.
 *
 * Returns null if neither source has a credential. Cached in global state.
 */
function getCredentialFromFd(_a) {
    var envVar = _a.envVar, wellKnownPath = _a.wellKnownPath, label = _a.label, getCached = _a.getCached, setCached = _a.setCached;
    var cached = getCached();
    if (cached !== undefined) {
        return cached;
    }
    var fdEnv = process.env[envVar];
    if (!fdEnv) {
        // No FD env var — either we're not in CCR, or we're a subprocess whose
        // parent stripped the (useless) FD env var. Try the well-known file.
        var fromFile = readTokenFromWellKnownFile(wellKnownPath, label);
        setCached(fromFile);
        return fromFile;
    }
    var fd = parseInt(fdEnv, 10);
    if (Number.isNaN(fd)) {
        (0, debug_js_1.logForDebugging)("".concat(envVar, " must be a valid file descriptor number, got: ").concat(fdEnv), { level: 'error' });
        setCached(null);
        return null;
    }
    try {
        // Use /dev/fd on macOS/BSD, /proc/self/fd on Linux
        var fsOps = (0, fsOperations_js_1.getFsImplementation)();
        var fdPath = process.platform === 'darwin' || process.platform === 'freebsd'
            ? "/dev/fd/".concat(fd)
            : "/proc/self/fd/".concat(fd);
        // eslint-disable-next-line custom-rules/no-sync-fs -- legacy FD path, read once at startup, caller is sync
        var token = fsOps.readFileSync(fdPath, { encoding: 'utf8' }).trim();
        if (!token) {
            (0, debug_js_1.logForDebugging)("File descriptor contained empty ".concat(label), {
                level: 'error',
            });
            setCached(null);
            return null;
        }
        (0, debug_js_1.logForDebugging)("Successfully read ".concat(label, " from file descriptor ").concat(fd));
        setCached(token);
        maybePersistTokenForSubprocesses(wellKnownPath, token, label);
        return token;
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to read ".concat(label, " from file descriptor ").concat(fd, ": ").concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
        // FD env var was set but read failed — typically a subprocess that
        // inherited the env var but not the FD (ENXIO). Try the well-known file.
        var fromFile = readTokenFromWellKnownFile(wellKnownPath, label);
        setCached(fromFile);
        return fromFile;
    }
}
/**
 * Get the CCR-injected OAuth token. See getCredentialFromFd for FD-vs-disk
 * rationale. Env var: CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR.
 * Well-known file: /home/claude/.claude/remote/.oauth_token.
 */
function getOAuthTokenFromFileDescriptor() {
    return getCredentialFromFd({
        envVar: 'CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR',
        wellKnownPath: exports.CCR_OAUTH_TOKEN_PATH,
        label: 'OAuth token',
        getCached: state_js_1.getOauthTokenFromFd,
        setCached: state_js_1.setOauthTokenFromFd,
    });
}
/**
 * Get the CCR-injected API key. See getCredentialFromFd for FD-vs-disk
 * rationale. Env var: CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR.
 * Well-known file: /home/claude/.claude/remote/.api_key.
 */
function getApiKeyFromFileDescriptor() {
    return getCredentialFromFd({
        envVar: 'CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR',
        wellKnownPath: exports.CCR_API_KEY_PATH,
        label: 'API key',
        getCached: state_js_1.getApiKeyFromFd,
        setCached: state_js_1.setApiKeyFromFd,
    });
}
