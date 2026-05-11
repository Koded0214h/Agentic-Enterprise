"use strict";
/**
 * EnvManager - Centralized environment variable management for claude-mem
 *
 * Provides isolated credential storage in ~/.claude-mem/.env
 * This ensures claude-mem uses its own configured credentials,
 * not random ANTHROPIC_API_KEY values from project .env files.
 *
 * Issue #733: SDK was auto-discovering API keys from user's shell environment,
 * causing memory operations to bill personal API accounts instead of CLI subscription.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANAGED_CREDENTIAL_KEYS = exports.ENV_FILE_PATH = void 0;
exports.loadClaudeMemEnv = loadClaudeMemEnv;
exports.saveClaudeMemEnv = saveClaudeMemEnv;
exports.buildIsolatedEnv = buildIsolatedEnv;
exports.getCredential = getCredential;
exports.setCredential = setCredential;
exports.hasAnthropicApiKey = hasAnthropicApiKey;
exports.getAuthMethodDescription = getAuthMethodDescription;
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var logger_js_1 = require("../utils/logger.js");
// Path to claude-mem's centralized .env file
var DATA_DIR = (0, path_1.join)((0, os_1.homedir)(), '.claude-mem');
exports.ENV_FILE_PATH = (0, path_1.join)(DATA_DIR, '.env');
// Environment variables to STRIP from subprocess environment (blocklist approach)
// Only ANTHROPIC_API_KEY is stripped because it's the specific variable that causes
// Issue #733: project .env files set ANTHROPIC_API_KEY which the SDK auto-discovers,
// causing memory operations to bill personal API accounts instead of CLI subscription.
//
// All other env vars (ANTHROPIC_AUTH_TOKEN, ANTHROPIC_BASE_URL, system vars, etc.)
// are passed through to avoid breaking CLI authentication, proxies, and platform features.
var BLOCKED_ENV_VARS = [
    'ANTHROPIC_API_KEY', // Issue #733: Prevent auto-discovery from project .env files
    'CLAUDECODE', // Prevent "cannot be launched inside another Claude Code session" error
];
// Credential keys that claude-mem manages
exports.MANAGED_CREDENTIAL_KEYS = [
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'OPENROUTER_API_KEY',
];
/**
 * Parse a .env file content into key-value pairs
 */
function parseEnvFile(content) {
    var result = {};
    for (var _i = 0, _a = content.split('\n'); _i < _a.length; _i++) {
        var line = _a[_i];
        var trimmed = line.trim();
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        // Parse KEY=value format
        var eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1)
            continue;
        var key = trimmed.slice(0, eqIndex).trim();
        var value = trimmed.slice(eqIndex + 1).trim();
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (key) {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Serialize key-value pairs to .env file format
 */
function serializeEnvFile(env) {
    var lines = [
        '# claude-mem credentials',
        '# This file stores API keys for claude-mem memory agent',
        '# Edit this file or use claude-mem settings to configure',
        '',
    ];
    for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value) {
            // Quote values that contain spaces or special characters
            var needsQuotes = /[\s#=]/.test(value);
            lines.push("".concat(key, "=").concat(needsQuotes ? "\"".concat(value, "\"") : value));
        }
    }
    return lines.join('\n') + '\n';
}
/**
 * Load credentials from ~/.claude-mem/.env
 * Returns empty object if file doesn't exist (means use CLI billing)
 */
function loadClaudeMemEnv() {
    if (!(0, fs_1.existsSync)(exports.ENV_FILE_PATH)) {
        return {};
    }
    try {
        var content = (0, fs_1.readFileSync)(exports.ENV_FILE_PATH, 'utf-8');
        var parsed = parseEnvFile(content);
        // Only return managed credential keys
        var result = {};
        if (parsed.ANTHROPIC_API_KEY)
            result.ANTHROPIC_API_KEY = parsed.ANTHROPIC_API_KEY;
        if (parsed.GEMINI_API_KEY)
            result.GEMINI_API_KEY = parsed.GEMINI_API_KEY;
        if (parsed.OPENROUTER_API_KEY)
            result.OPENROUTER_API_KEY = parsed.OPENROUTER_API_KEY;
        return result;
    }
    catch (error) {
        logger_js_1.logger.warn('ENV', 'Failed to load .env file', { path: exports.ENV_FILE_PATH }, error);
        return {};
    }
}
/**
 * Save credentials to ~/.claude-mem/.env
 */
function saveClaudeMemEnv(env) {
    try {
        // Ensure directory exists
        if (!(0, fs_1.existsSync)(DATA_DIR)) {
            (0, fs_1.mkdirSync)(DATA_DIR, { recursive: true });
        }
        // Load existing to preserve any extra keys
        var existing = (0, fs_1.existsSync)(exports.ENV_FILE_PATH)
            ? parseEnvFile((0, fs_1.readFileSync)(exports.ENV_FILE_PATH, 'utf-8'))
            : {};
        // Update with new values
        var updated = __assign({}, existing);
        // Only update managed keys
        if (env.ANTHROPIC_API_KEY !== undefined) {
            if (env.ANTHROPIC_API_KEY) {
                updated.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
            }
            else {
                delete updated.ANTHROPIC_API_KEY;
            }
        }
        if (env.GEMINI_API_KEY !== undefined) {
            if (env.GEMINI_API_KEY) {
                updated.GEMINI_API_KEY = env.GEMINI_API_KEY;
            }
            else {
                delete updated.GEMINI_API_KEY;
            }
        }
        if (env.OPENROUTER_API_KEY !== undefined) {
            if (env.OPENROUTER_API_KEY) {
                updated.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
            }
            else {
                delete updated.OPENROUTER_API_KEY;
            }
        }
        (0, fs_1.writeFileSync)(exports.ENV_FILE_PATH, serializeEnvFile(updated), 'utf-8');
    }
    catch (error) {
        logger_js_1.logger.error('ENV', 'Failed to save .env file', { path: exports.ENV_FILE_PATH }, error);
        throw error;
    }
}
/**
 * Build a clean environment for spawning SDK subprocesses
 *
 * Uses a BLOCKLIST approach: inherits the full process environment but strips
 * only ANTHROPIC_API_KEY to prevent Issue #733 (accidental billing from project .env files).
 *
 * All other variables pass through, including:
 * - ANTHROPIC_AUTH_TOKEN (CLI subscription auth)
 * - ANTHROPIC_BASE_URL (custom proxy endpoints)
 * - Platform-specific vars (USERPROFILE, XDG_*, etc.)
 *
 * If claude-mem has an explicit ANTHROPIC_API_KEY in ~/.claude-mem/.env, it's re-injected
 * after stripping, so the managed credential takes precedence over any ambient value.
 *
 * @param includeCredentials - Whether to include API keys from ~/.claude-mem/.env (default: true)
 */
function buildIsolatedEnv(includeCredentials) {
    if (includeCredentials === void 0) { includeCredentials = true; }
    // 1. Start with full process environment
    var isolatedEnv = {};
    for (var _i = 0, _a = Object.entries(process.env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value !== undefined && !BLOCKED_ENV_VARS.includes(key)) {
            isolatedEnv[key] = value;
        }
    }
    // 2. Override SDK entrypoint marker
    isolatedEnv.CLAUDE_CODE_ENTRYPOINT = 'sdk-ts';
    // 3. Re-inject managed credentials from claude-mem's .env file
    if (includeCredentials) {
        var credentials = loadClaudeMemEnv();
        // Only add ANTHROPIC_API_KEY if explicitly configured in claude-mem
        // If not configured, CLI billing will be used (via ANTHROPIC_AUTH_TOKEN passthrough)
        if (credentials.ANTHROPIC_API_KEY) {
            isolatedEnv.ANTHROPIC_API_KEY = credentials.ANTHROPIC_API_KEY;
        }
        // Note: GEMINI_API_KEY and OPENROUTER_API_KEY pass through from process.env,
        // but claude-mem's .env takes precedence if configured
        if (credentials.GEMINI_API_KEY) {
            isolatedEnv.GEMINI_API_KEY = credentials.GEMINI_API_KEY;
        }
        if (credentials.OPENROUTER_API_KEY) {
            isolatedEnv.OPENROUTER_API_KEY = credentials.OPENROUTER_API_KEY;
        }
        // 4. Pass through Claude CLI's OAuth token if available (fallback for CLI subscription billing)
        // When no ANTHROPIC_API_KEY is configured, the spawned CLI uses subscription billing
        // which requires either ~/.claude/.credentials.json or CLAUDE_CODE_OAUTH_TOKEN.
        // The worker inherits this token from the Claude Code session that started it.
        if (!isolatedEnv.ANTHROPIC_API_KEY && process.env.CLAUDE_CODE_OAUTH_TOKEN) {
            isolatedEnv.CLAUDE_CODE_OAUTH_TOKEN = process.env.CLAUDE_CODE_OAUTH_TOKEN;
        }
    }
    return isolatedEnv;
}
/**
 * Get a specific credential from claude-mem's .env
 * Returns undefined if not set (which means use default/CLI billing)
 */
function getCredential(key) {
    var env = loadClaudeMemEnv();
    return env[key];
}
/**
 * Set a specific credential in claude-mem's .env
 * Pass empty string to remove the credential
 */
function setCredential(key, value) {
    var env = loadClaudeMemEnv();
    env[key] = value || undefined;
    saveClaudeMemEnv(env);
}
/**
 * Check if claude-mem has an Anthropic API key configured
 * If false, it means CLI billing should be used
 */
function hasAnthropicApiKey() {
    var env = loadClaudeMemEnv();
    return !!env.ANTHROPIC_API_KEY;
}
/**
 * Get auth method description for logging
 */
function getAuthMethodDescription() {
    if (hasAnthropicApiKey()) {
        return 'API key (from ~/.claude-mem/.env)';
    }
    if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
        return 'Claude Code OAuth token (from parent process)';
    }
    return 'Claude Code CLI (subscription billing)';
}
