"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_PRESERVE = exports.ENV_EXACT_MATCHES = exports.ENV_PREFIXES = void 0;
exports.sanitizeEnv = sanitizeEnv;
exports.ENV_PREFIXES = ['CLAUDECODE_', 'CLAUDE_CODE_'];
exports.ENV_EXACT_MATCHES = new Set([
    'CLAUDECODE',
    'CLAUDE_CODE_SESSION',
    'CLAUDE_CODE_ENTRYPOINT',
    'MCP_SESSION_ID',
]);
/** Vars that start with CLAUDE_CODE_ but must be preserved for subprocess auth/tooling */
exports.ENV_PRESERVE = new Set([
    'CLAUDE_CODE_OAUTH_TOKEN',
    'CLAUDE_CODE_GIT_BASH_PATH',
]);
function sanitizeEnv(env) {
    if (env === void 0) { env = process.env; }
    var sanitized = {};
    var _loop_1 = function (key, value) {
        if (value === undefined)
            return "continue";
        if (exports.ENV_PRESERVE.has(key)) {
            sanitized[key] = value;
            return "continue";
        }
        if (exports.ENV_EXACT_MATCHES.has(key))
            return "continue";
        if (exports.ENV_PREFIXES.some(function (prefix) { return key.startsWith(prefix); }))
            return "continue";
        sanitized[key] = value;
    };
    for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        _loop_1(key, value);
    }
    return sanitized;
}
