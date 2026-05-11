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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidationTip = getValidationTip;
var DOCUMENTATION_BASE = 'https://code.claude.com/docs/en';
var TIP_MATCHERS = [
    {
        matches: function (ctx) {
            return ctx.path === 'permissions.defaultMode' && ctx.code === 'invalid_value';
        },
        tip: {
            suggestion: 'Valid modes: "acceptEdits" (ask before file changes), "plan" (analysis only), "bypassPermissions" (auto-accept all), or "default" (standard behavior)',
            docLink: "".concat(DOCUMENTATION_BASE, "/iam#permission-modes"),
        },
    },
    {
        matches: function (ctx) {
            return ctx.path === 'apiKeyHelper' && ctx.code === 'invalid_type';
        },
        tip: {
            suggestion: 'Provide a shell command that outputs your API key to stdout. The script should output only the API key. Example: "/bin/generate_temp_api_key.sh"',
        },
    },
    {
        matches: function (ctx) {
            return ctx.path === 'cleanupPeriodDays' &&
                ctx.code === 'too_small' &&
                ctx.expected === '0';
        },
        tip: {
            suggestion: 'Must be 0 or greater. Set a positive number for days to retain transcripts (default is 30). Setting 0 disables session persistence entirely: no transcripts are written and existing transcripts are deleted at startup.',
        },
    },
    {
        matches: function (ctx) {
            return ctx.path.startsWith('env.') && ctx.code === 'invalid_type';
        },
        tip: {
            suggestion: 'Environment variables must be strings. Wrap numbers and booleans in quotes. Example: "DEBUG": "true", "PORT": "3000"',
            docLink: "".concat(DOCUMENTATION_BASE, "/settings#environment-variables"),
        },
    },
    {
        matches: function (ctx) {
            return (ctx.path === 'permissions.allow' || ctx.path === 'permissions.deny') &&
                ctx.code === 'invalid_type' &&
                ctx.expected === 'array';
        },
        tip: {
            suggestion: 'Permission rules must be in an array. Format: ["Tool(specifier)"]. Examples: ["Bash(npm run build)", "Edit(docs/**)", "Read(~/.zshrc)"]. Use * for wildcards.',
        },
    },
    {
        matches: function (ctx) {
            return ctx.path.includes('hooks') && ctx.code === 'invalid_type';
        },
        tip: {
            suggestion: 
            // gh-31187 / CC-282: prior example showed {"matcher": {"tools": ["BashTool"]}}
            // — an object format that never existed in the schema (matcher is z.string(),
            // always has been). Users copied the tip's example and got the same validation
            // error again. See matchesPattern() in hooks.ts: matcher is exact-match,
            // pipe-separated ("Edit|Write"), or regex. Empty/"*" matches all.
            'Hooks use a matcher + hooks array. The matcher is a string: a tool name ("Bash"), pipe-separated list ("Edit|Write"), or empty to match all. Example: {"PostToolUse": [{"matcher": "Edit|Write", "hooks": [{"type": "command", "command": "echo Done"}]}]}',
        },
    },
    {
        matches: function (ctx) {
            return ctx.code === 'invalid_type' && ctx.expected === 'boolean';
        },
        tip: {
            suggestion: 'Use true or false without quotes. Example: "includeCoAuthoredBy": true',
        },
    },
    {
        matches: function (ctx) { return ctx.code === 'unrecognized_keys'; },
        tip: {
            suggestion: 'Check for typos or refer to the documentation for valid fields',
            docLink: "".concat(DOCUMENTATION_BASE, "/settings"),
        },
    },
    {
        matches: function (ctx) {
            return ctx.code === 'invalid_value' && ctx.enumValues !== undefined;
        },
        tip: {
            suggestion: undefined,
        },
    },
    {
        matches: function (ctx) {
            return ctx.code === 'invalid_type' &&
                ctx.expected === 'object' &&
                ctx.received === null &&
                ctx.path === '';
        },
        tip: {
            suggestion: 'Check for missing commas, unmatched brackets, or trailing commas. Use a JSON validator to identify the exact syntax error.',
        },
    },
    {
        matches: function (ctx) {
            return ctx.path === 'permissions.additionalDirectories' &&
                ctx.code === 'invalid_type';
        },
        tip: {
            suggestion: 'Must be an array of directory paths. Example: ["~/projects", "/tmp/workspace"]. You can also use --add-dir flag or /add-dir command',
            docLink: "".concat(DOCUMENTATION_BASE, "/iam#working-directories"),
        },
    },
];
var PATH_DOC_LINKS = {
    permissions: "".concat(DOCUMENTATION_BASE, "/iam#configuring-permissions"),
    env: "".concat(DOCUMENTATION_BASE, "/settings#environment-variables"),
    hooks: "".concat(DOCUMENTATION_BASE, "/hooks"),
};
function getValidationTip(context) {
    var matcher = TIP_MATCHERS.find(function (m) { return m.matches(context); });
    if (!matcher)
        return null;
    var tip = __assign({}, matcher.tip);
    if (context.code === 'invalid_value' &&
        context.enumValues &&
        !tip.suggestion) {
        tip.suggestion = "Valid values: ".concat(context.enumValues.map(function (v) { return "\"".concat(v, "\""); }).join(', '));
    }
    // Add documentation link based on path prefix
    if (!tip.docLink && context.path) {
        var pathPrefix = context.path.split('.')[0];
        if (pathPrefix) {
            tip.docLink = PATH_DOC_LINKS[pathPrefix];
        }
    }
    return tip;
}
