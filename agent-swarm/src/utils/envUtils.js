"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaudeConfigHomeDir = void 0;
exports.getTeamsDir = getTeamsDir;
exports.hasNodeOption = hasNodeOption;
exports.isEnvTruthy = isEnvTruthy;
exports.isEnvDefinedFalsy = isEnvDefinedFalsy;
exports.isBareMode = isBareMode;
exports.parseEnvVars = parseEnvVars;
exports.getAWSRegion = getAWSRegion;
exports.getDefaultVertexRegion = getDefaultVertexRegion;
exports.shouldMaintainProjectWorkingDir = shouldMaintainProjectWorkingDir;
exports.isRunningOnHomespace = isRunningOnHomespace;
exports.isInProtectedNamespace = isInProtectedNamespace;
exports.getVertexRegionForModel = getVertexRegionForModel;
var memoize_js_1 = require("lodash-es/memoize.js");
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
// Initialize workspace local .swarm storage
var workspaceRoot = process.cwd();
var swarmStorageDir = node_path_1.default.join(workspaceRoot, '.swarm');
if (!node_fs_1.default.existsSync(swarmStorageDir)) {
    node_fs_1.default.mkdirSync(swarmStorageDir, { recursive: true });
    node_fs_1.default.writeFileSync(node_path_1.default.join(swarmStorageDir, '.gitignore'), "*\n!.gitignore\n");
}
process.env.SWARM_WORKSPACE_ROOT = workspaceRoot;
process.env.SWARM_STORAGE_DIR = swarmStorageDir;
var os_1 = require("os");
var path_1 = require("path");
// Memoized: 150+ callers, many on hot paths. Keyed off CLAUDE_CONFIG_DIR so
// tests that change the env var get a fresh value without explicit cache.clear.
exports.getClaudeConfigHomeDir = (0, memoize_js_1.default)(function () {
    var _a;
    return ((_a = process.env.CLAUDE_CONFIG_DIR) !== null && _a !== void 0 ? _a : (0, path_1.join)((0, os_1.homedir)(), '.claude')).normalize('NFC');
}, function () { return process.env.CLAUDE_CONFIG_DIR; });
function getTeamsDir() {
    return (0, path_1.join)((0, exports.getClaudeConfigHomeDir)(), 'teams');
}
/**
 * Check if NODE_OPTIONS contains a specific flag.
 * Splits on whitespace and checks for exact match to avoid false positives.
 */
function hasNodeOption(flag) {
    var nodeOptions = process.env.NODE_OPTIONS;
    if (!nodeOptions) {
        return false;
    }
    return nodeOptions.split(/\s+/).includes(flag);
}
function isEnvTruthy(envVar) {
    if (!envVar)
        return false;
    if (typeof envVar === 'boolean')
        return envVar;
    var normalizedValue = envVar.toLowerCase().trim();
    return ['1', 'true', 'yes', 'on'].includes(normalizedValue);
}
function isEnvDefinedFalsy(envVar) {
    if (envVar === undefined)
        return false;
    if (typeof envVar === 'boolean')
        return !envVar;
    if (!envVar)
        return false;
    var normalizedValue = envVar.toLowerCase().trim();
    return ['0', 'false', 'no', 'off'].includes(normalizedValue);
}
/**
 * --bare / CLAUDE_CODE_SIMPLE — skip hooks, LSP, plugin sync, skill dir-walk,
 * attribution, background prefetches, and ALL keychain/credential reads.
 * Auth is strictly ANTHROPIC_API_KEY env or apiKeyHelper from --settings.
 * Explicit CLI flags (--plugin-dir, --add-dir, --mcp-config) still honored.
 * ~30 gates across the codebase.
 *
 * Checks argv directly (in addition to the env var) because several gates
 * run before main.tsx's action handler sets CLAUDE_CODE_SIMPLE=1 from --bare
 * — notably startKeychainPrefetch() at main.tsx top-level.
 */
function isBareMode() {
    return (isEnvTruthy(process.env.CLAUDE_CODE_SIMPLE) ||
        process.argv.includes('--bare'));
}
/**
 * Parses an array of environment variable strings into a key-value object
 * @param envVars Array of strings in KEY=VALUE format
 * @returns Object with key-value pairs
 */
function parseEnvVars(rawEnvArgs) {
    var parsedEnv = {};
    // Parse individual env vars
    if (rawEnvArgs) {
        for (var _i = 0, rawEnvArgs_1 = rawEnvArgs; _i < rawEnvArgs_1.length; _i++) {
            var envStr = rawEnvArgs_1[_i];
            var _a = envStr.split('='), key = _a[0], valueParts = _a.slice(1);
            if (!key || valueParts.length === 0) {
                throw new Error("Invalid environment variable format: ".concat(envStr, ", environment variables should be added as: -e KEY1=value1 -e KEY2=value2"));
            }
            parsedEnv[key] = valueParts.join('=');
        }
    }
    return parsedEnv;
}
/**
 * Get the AWS region with fallback to default
 * Matches the Anthropic Bedrock SDK's region behavior
 */
function getAWSRegion() {
    return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
}
/**
 * Get the default Vertex AI region
 */
function getDefaultVertexRegion() {
    return process.env.CLOUD_ML_REGION || 'us-east5';
}
/**
 * Check if bash commands should maintain project working directory (reset to original after each command)
 * @returns true if CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR is set to a truthy value
 */
function shouldMaintainProjectWorkingDir() {
    return isEnvTruthy(process.env.CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR);
}
/**
 * Check if running on Homespace (ant-internal cloud environment)
 */
function isRunningOnHomespace() {
    return (process.env.USER_TYPE === 'ant' &&
        isEnvTruthy(process.env.COO_RUNNING_ON_HOMESPACE));
}
/**
 * Conservative check for whether Claude Code is running inside a protected
 * (privileged or ASL3+) COO namespace or cluster.
 *
 * Conservative means: when signals are ambiguous, assume protected. We would
 * rather over-report protected usage than miss it. Unprotected environments
 * are homespace, namespaces on the open allowlist, and no k8s/COO signals
 * at all (laptop/local dev).
 *
 * Used for telemetry to measure auto-mode usage in sensitive environments.
 */
function isInProtectedNamespace() {
    // USER_TYPE is build-time --define'd; in external builds this block is
    // DCE'd so the require() and namespace allowlist never appear in the bundle.
    if (process.env.USER_TYPE === 'ant') {
        /* eslint-disable @typescript-eslint/no-require-imports */
        return require('./protectedNamespace.js').checkProtectedNamespace();
        /* eslint-enable @typescript-eslint/no-require-imports */
    }
    return false;
}
// @[MODEL LAUNCH]: Add a Vertex region override env var for the new model.
/**
 * Model prefix → env var for Vertex region overrides.
 * Order matters: more specific prefixes must come before less specific ones
 * (e.g., 'claude-opus-4-1' before 'claude-opus-4').
 */
var VERTEX_REGION_OVERRIDES = [
    ['claude-haiku-4-5', 'VERTEX_REGION_CLAUDE_HAIKU_4_5'],
    ['claude-3-5-haiku', 'VERTEX_REGION_CLAUDE_3_5_HAIKU'],
    ['claude-3-5-sonnet', 'VERTEX_REGION_CLAUDE_3_5_SONNET'],
    ['claude-3-7-sonnet', 'VERTEX_REGION_CLAUDE_3_7_SONNET'],
    ['claude-opus-4-1', 'VERTEX_REGION_CLAUDE_4_1_OPUS'],
    ['claude-opus-4', 'VERTEX_REGION_CLAUDE_4_0_OPUS'],
    ['claude-sonnet-4-6', 'VERTEX_REGION_CLAUDE_4_6_SONNET'],
    ['claude-sonnet-4-5', 'VERTEX_REGION_CLAUDE_4_5_SONNET'],
    ['claude-sonnet-4', 'VERTEX_REGION_CLAUDE_4_0_SONNET'],
];
/**
 * Get the Vertex AI region for a specific model.
 * Different models may be available in different regions.
 */
function getVertexRegionForModel(model) {
    if (model) {
        var match = VERTEX_REGION_OVERRIDES.find(function (_a) {
            var prefix = _a[0];
            return model.startsWith(prefix);
        });
        if (match) {
            return process.env[match[1]] || getDefaultVertexRegion();
        }
    }
    return getDefaultVertexRegion();
}
