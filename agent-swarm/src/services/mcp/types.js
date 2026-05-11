"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpJsonConfigSchema = exports.McpServerConfigSchema = exports.McpClaudeAIProxyServerConfigSchema = exports.McpSdkServerConfigSchema = exports.McpWebSocketServerConfigSchema = exports.McpHTTPServerConfigSchema = exports.McpWebSocketIDEServerConfigSchema = exports.McpSSEIDEServerConfigSchema = exports.McpSSEServerConfigSchema = exports.McpStdioServerConfigSchema = exports.TransportSchema = exports.ConfigScopeSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
// Configuration schemas and types
exports.ConfigScopeSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum([
        'local',
        'user',
        'project',
        'dynamic',
        'enterprise',
        'claudeai',
        'managed',
    ]);
});
exports.TransportSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum(['stdio', 'sse', 'sse-ide', 'http', 'ws', 'sdk']);
});
exports.McpStdioServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('stdio').optional(), // Optional for backwards compatibility
        command: v4_1.z.string().min(1, 'Command cannot be empty'),
        args: v4_1.z.array(v4_1.z.string()).default([]),
        env: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
    });
});
// Cross-App Access (XAA / SEP-990): just a per-server flag. IdP connection
// details (issuer, clientId, callbackPort) come from settings.xaaIdp — configured
// once, shared across all XAA-enabled servers. clientId/clientSecret (parent
// oauth config + keychain slot) are for the MCP server's AS.
var McpXaaConfigSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.boolean(); });
var McpOAuthConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        clientId: v4_1.z.string().optional(),
        callbackPort: v4_1.z.number().int().positive().optional(),
        authServerMetadataUrl: v4_1.z
            .string()
            .url()
            .startsWith('https://', {
            message: 'authServerMetadataUrl must use https://',
        })
            .optional(),
        xaa: McpXaaConfigSchema().optional(),
    });
});
exports.McpSSEServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('sse'),
        url: v4_1.z.string(),
        headers: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
        headersHelper: v4_1.z.string().optional(),
        oauth: McpOAuthConfigSchema().optional(),
    });
});
// Internal-only server type for IDE extensions
exports.McpSSEIDEServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('sse-ide'),
        url: v4_1.z.string(),
        ideName: v4_1.z.string(),
        ideRunningInWindows: v4_1.z.boolean().optional(),
    });
});
// Internal-only server type for IDE extensions
exports.McpWebSocketIDEServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('ws-ide'),
        url: v4_1.z.string(),
        ideName: v4_1.z.string(),
        authToken: v4_1.z.string().optional(),
        ideRunningInWindows: v4_1.z.boolean().optional(),
    });
});
exports.McpHTTPServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('http'),
        url: v4_1.z.string(),
        headers: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
        headersHelper: v4_1.z.string().optional(),
        oauth: McpOAuthConfigSchema().optional(),
    });
});
exports.McpWebSocketServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('ws'),
        url: v4_1.z.string(),
        headers: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
        headersHelper: v4_1.z.string().optional(),
    });
});
exports.McpSdkServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('sdk'),
        name: v4_1.z.string(),
    });
});
// Config type for Claude.ai proxy servers
exports.McpClaudeAIProxyServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        type: v4_1.z.literal('claudeai-proxy'),
        url: v4_1.z.string(),
        id: v4_1.z.string(),
    });
});
exports.McpServerConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        (0, exports.McpStdioServerConfigSchema)(),
        (0, exports.McpSSEServerConfigSchema)(),
        (0, exports.McpSSEIDEServerConfigSchema)(),
        (0, exports.McpWebSocketIDEServerConfigSchema)(),
        (0, exports.McpHTTPServerConfigSchema)(),
        (0, exports.McpWebSocketServerConfigSchema)(),
        (0, exports.McpSdkServerConfigSchema)(),
        (0, exports.McpClaudeAIProxyServerConfigSchema)(),
    ]);
});
exports.McpJsonConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        mcpServers: v4_1.z.record(v4_1.z.string(), (0, exports.McpServerConfigSchema)()),
    });
});
