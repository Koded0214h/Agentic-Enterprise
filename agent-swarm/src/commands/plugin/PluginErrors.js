"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatErrorMessage = formatErrorMessage;
exports.getErrorGuidance = getErrorGuidance;
var plugin_js_1 = require("../../types/plugin.js");
function formatErrorMessage(error) {
    var _a, _b;
    switch (error.type) {
        case 'path-not-found':
            return "".concat(error.component, " path not found: ").concat(error.path);
        case 'git-auth-failed':
            return "Git ".concat(error.authType.toUpperCase(), " authentication failed for ").concat(error.gitUrl);
        case 'git-timeout':
            return "Git ".concat(error.operation, " timed out for ").concat(error.gitUrl);
        case 'network-error':
            return "Network error accessing ".concat(error.url).concat(error.details ? ": ".concat(error.details) : '');
        case 'manifest-parse-error':
            return "Failed to parse manifest at ".concat(error.manifestPath, ": ").concat(error.parseError);
        case 'manifest-validation-error':
            return "Invalid manifest at ".concat(error.manifestPath, ": ").concat(error.validationErrors.join(', '));
        case 'plugin-not-found':
            return "Plugin \"".concat(error.pluginId, "\" not found in marketplace \"").concat(error.marketplace, "\"");
        case 'marketplace-not-found':
            return "Marketplace \"".concat(error.marketplace, "\" not found");
        case 'marketplace-load-failed':
            return "Failed to load marketplace \"".concat(error.marketplace, "\": ").concat(error.reason);
        case 'mcp-config-invalid':
            return "Invalid MCP server config for \"".concat(error.serverName, "\": ").concat(error.validationError);
        case 'mcp-server-suppressed-duplicate':
            {
                var dup = error.duplicateOf.startsWith('plugin:') ? "server provided by plugin \"".concat((_a = error.duplicateOf.split(':')[1]) !== null && _a !== void 0 ? _a : '?', "\"") : "already-configured \"".concat(error.duplicateOf, "\"");
                return "MCP server \"".concat(error.serverName, "\" skipped \u2014 same command/URL as ").concat(dup);
            }
        case 'hook-load-failed':
            return "Failed to load hooks from ".concat(error.hookPath, ": ").concat(error.reason);
        case 'component-load-failed':
            return "Failed to load ".concat(error.component, " from ").concat(error.path, ": ").concat(error.reason);
        case 'mcpb-download-failed':
            return "Failed to download MCPB from ".concat(error.url, ": ").concat(error.reason);
        case 'mcpb-extract-failed':
            return "Failed to extract MCPB ".concat(error.mcpbPath, ": ").concat(error.reason);
        case 'mcpb-invalid-manifest':
            return "MCPB manifest invalid at ".concat(error.mcpbPath, ": ").concat(error.validationError);
        case 'marketplace-blocked-by-policy':
            return error.blockedByBlocklist ? "Marketplace \"".concat(error.marketplace, "\" is blocked by enterprise policy") : "Marketplace \"".concat(error.marketplace, "\" is not in the allowed marketplace list");
        case 'dependency-unsatisfied':
            return error.reason === 'not-enabled' ? "Dependency \"".concat(error.dependency, "\" is disabled") : "Dependency \"".concat(error.dependency, "\" is not installed");
        case 'lsp-config-invalid':
            return "Invalid LSP server config for \"".concat(error.serverName, "\": ").concat(error.validationError);
        case 'lsp-server-start-failed':
            return "LSP server \"".concat(error.serverName, "\" failed to start: ").concat(error.reason);
        case 'lsp-server-crashed':
            return error.signal ? "LSP server \"".concat(error.serverName, "\" crashed with signal ").concat(error.signal) : "LSP server \"".concat(error.serverName, "\" crashed with exit code ").concat((_b = error.exitCode) !== null && _b !== void 0 ? _b : 'unknown');
        case 'lsp-request-timeout':
            return "LSP server \"".concat(error.serverName, "\" timed out on ").concat(error.method, " after ").concat(error.timeoutMs, "ms");
        case 'lsp-request-failed':
            return "LSP server \"".concat(error.serverName, "\" ").concat(error.method, " failed: ").concat(error.error);
        case 'plugin-cache-miss':
            return "Plugin \"".concat(error.plugin, "\" not cached at ").concat(error.installPath);
        case 'generic-error':
            return error.error;
    }
    var _exhaustive = error;
    return (0, plugin_js_1.getPluginErrorMessage)(_exhaustive);
}
function getErrorGuidance(error) {
    var _a;
    switch (error.type) {
        case 'path-not-found':
            return 'Check that the path in your manifest or marketplace config is correct';
        case 'git-auth-failed':
            return error.authType === 'ssh' ? 'Configure SSH keys or use HTTPS URL instead' : 'Configure credentials or use SSH URL instead';
        case 'git-timeout':
        case 'network-error':
            return 'Check your internet connection and try again';
        case 'manifest-parse-error':
            return 'Check manifest file syntax in the plugin directory';
        case 'manifest-validation-error':
            return 'Check manifest file follows the required schema';
        case 'plugin-not-found':
            return "Plugin may not exist in marketplace \"".concat(error.marketplace, "\"");
        case 'marketplace-not-found':
            return error.availableMarketplaces.length > 0 ? "Available marketplaces: ".concat(error.availableMarketplaces.join(', ')) : 'Add the marketplace first using /plugin marketplace add';
        case 'mcp-config-invalid':
            return 'Check MCP server configuration in .mcp.json or manifest';
        case 'mcp-server-suppressed-duplicate':
            {
                // duplicateOf is "plugin:name:srv" when another plugin won dedup —
                // users can't remove plugin-provided servers from their MCP config,
                // so point them at the winning plugin instead.
                if (error.duplicateOf.startsWith('plugin:')) {
                    var winningPlugin = (_a = error.duplicateOf.split(':')[1]) !== null && _a !== void 0 ? _a : 'the other plugin';
                    return "Disable plugin \"".concat(winningPlugin, "\" if you want this plugin's version instead");
                }
                return "Remove \"".concat(error.duplicateOf, "\" from your MCP config if you want the plugin's version instead");
            }
        case 'hook-load-failed':
            return 'Check hooks.json file syntax and structure';
        case 'component-load-failed':
            return "Check ".concat(error.component, " directory structure and file permissions");
        case 'mcpb-download-failed':
            return 'Check your internet connection and URL accessibility';
        case 'mcpb-extract-failed':
            return 'Verify the MCPB file is valid and not corrupted';
        case 'mcpb-invalid-manifest':
            return 'Contact the plugin author about the invalid manifest';
        case 'marketplace-blocked-by-policy':
            if (error.blockedByBlocklist) {
                return 'This marketplace source is explicitly blocked by your administrator';
            }
            return error.allowedSources.length > 0 ? "Allowed sources: ".concat(error.allowedSources.join(', ')) : 'Contact your administrator to configure allowed marketplace sources';
        case 'dependency-unsatisfied':
            return error.reason === 'not-enabled' ? "Enable \"".concat(error.dependency, "\" or uninstall \"").concat(error.plugin, "\"") : "Install \"".concat(error.dependency, "\" or uninstall \"").concat(error.plugin, "\"");
        case 'lsp-config-invalid':
            return 'Check LSP server configuration in the plugin manifest';
        case 'lsp-server-start-failed':
        case 'lsp-server-crashed':
        case 'lsp-request-timeout':
        case 'lsp-request-failed':
            return 'Check LSP server logs with --debug for details';
        case 'plugin-cache-miss':
            return 'Run /plugins to refresh the plugin cache';
        case 'marketplace-load-failed':
        case 'generic-error':
            return null;
    }
    var _exhaustive = error;
    return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRQbHVnaW5FcnJvck1lc3NhZ2UiLCJQbHVnaW5FcnJvciIsImZvcm1hdEVycm9yTWVzc2FnZSIsImVycm9yIiwidHlwZSIsImNvbXBvbmVudCIsInBhdGgiLCJhdXRoVHlwZSIsInRvVXBwZXJDYXNlIiwiZ2l0VXJsIiwib3BlcmF0aW9uIiwidXJsIiwiZGV0YWlscyIsIm1hbmlmZXN0UGF0aCIsInBhcnNlRXJyb3IiLCJ2YWxpZGF0aW9uRXJyb3JzIiwiam9pbiIsInBsdWdpbklkIiwibWFya2V0cGxhY2UiLCJyZWFzb24iLCJzZXJ2ZXJOYW1lIiwidmFsaWRhdGlvbkVycm9yIiwiZHVwIiwiZHVwbGljYXRlT2YiLCJzdGFydHNXaXRoIiwic3BsaXQiLCJob29rUGF0aCIsIm1jcGJQYXRoIiwiYmxvY2tlZEJ5QmxvY2tsaXN0IiwiZGVwZW5kZW5jeSIsInNpZ25hbCIsImV4aXRDb2RlIiwibWV0aG9kIiwidGltZW91dE1zIiwicGx1Z2luIiwiaW5zdGFsbFBhdGgiLCJfZXhoYXVzdGl2ZSIsImdldEVycm9yR3VpZGFuY2UiLCJhdmFpbGFibGVNYXJrZXRwbGFjZXMiLCJsZW5ndGgiLCJ3aW5uaW5nUGx1Z2luIiwiYWxsb3dlZFNvdXJjZXMiXSwic291cmNlcyI6WyJQbHVnaW5FcnJvcnMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFBsdWdpbkVycm9yTWVzc2FnZSwgdHlwZSBQbHVnaW5FcnJvciB9IGZyb20gJy4uLy4uL3R5cGVzL3BsdWdpbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEVycm9yTWVzc2FnZShlcnJvcjogUGx1Z2luRXJyb3IpOiBzdHJpbmcge1xuICBzd2l0Y2ggKGVycm9yLnR5cGUpIHtcbiAgICBjYXNlICdwYXRoLW5vdC1mb3VuZCc6XG4gICAgICByZXR1cm4gYCR7ZXJyb3IuY29tcG9uZW50fSBwYXRoIG5vdCBmb3VuZDogJHtlcnJvci5wYXRofWBcbiAgICBjYXNlICdnaXQtYXV0aC1mYWlsZWQnOlxuICAgICAgcmV0dXJuIGBHaXQgJHtlcnJvci5hdXRoVHlwZS50b1VwcGVyQ2FzZSgpfSBhdXRoZW50aWNhdGlvbiBmYWlsZWQgZm9yICR7ZXJyb3IuZ2l0VXJsfWBcbiAgICBjYXNlICdnaXQtdGltZW91dCc6XG4gICAgICByZXR1cm4gYEdpdCAke2Vycm9yLm9wZXJhdGlvbn0gdGltZWQgb3V0IGZvciAke2Vycm9yLmdpdFVybH1gXG4gICAgY2FzZSAnbmV0d29yay1lcnJvcic6XG4gICAgICByZXR1cm4gYE5ldHdvcmsgZXJyb3IgYWNjZXNzaW5nICR7ZXJyb3IudXJsfSR7ZXJyb3IuZGV0YWlscyA/IGA6ICR7ZXJyb3IuZGV0YWlsc31gIDogJyd9YFxuICAgIGNhc2UgJ21hbmlmZXN0LXBhcnNlLWVycm9yJzpcbiAgICAgIHJldHVybiBgRmFpbGVkIHRvIHBhcnNlIG1hbmlmZXN0IGF0ICR7ZXJyb3IubWFuaWZlc3RQYXRofTogJHtlcnJvci5wYXJzZUVycm9yfWBcbiAgICBjYXNlICdtYW5pZmVzdC12YWxpZGF0aW9uLWVycm9yJzpcbiAgICAgIHJldHVybiBgSW52YWxpZCBtYW5pZmVzdCBhdCAke2Vycm9yLm1hbmlmZXN0UGF0aH06ICR7ZXJyb3IudmFsaWRhdGlvbkVycm9ycy5qb2luKCcsICcpfWBcbiAgICBjYXNlICdwbHVnaW4tbm90LWZvdW5kJzpcbiAgICAgIHJldHVybiBgUGx1Z2luIFwiJHtlcnJvci5wbHVnaW5JZH1cIiBub3QgZm91bmQgaW4gbWFya2V0cGxhY2UgXCIke2Vycm9yLm1hcmtldHBsYWNlfVwiYFxuICAgIGNhc2UgJ21hcmtldHBsYWNlLW5vdC1mb3VuZCc6XG4gICAgICByZXR1cm4gYE1hcmtldHBsYWNlIFwiJHtlcnJvci5tYXJrZXRwbGFjZX1cIiBub3QgZm91bmRgXG4gICAgY2FzZSAnbWFya2V0cGxhY2UtbG9hZC1mYWlsZWQnOlxuICAgICAgcmV0dXJuIGBGYWlsZWQgdG8gbG9hZCBtYXJrZXRwbGFjZSBcIiR7ZXJyb3IubWFya2V0cGxhY2V9XCI6ICR7ZXJyb3IucmVhc29ufWBcbiAgICBjYXNlICdtY3AtY29uZmlnLWludmFsaWQnOlxuICAgICAgcmV0dXJuIGBJbnZhbGlkIE1DUCBzZXJ2ZXIgY29uZmlnIGZvciBcIiR7ZXJyb3Iuc2VydmVyTmFtZX1cIjogJHtlcnJvci52YWxpZGF0aW9uRXJyb3J9YFxuICAgIGNhc2UgJ21jcC1zZXJ2ZXItc3VwcHJlc3NlZC1kdXBsaWNhdGUnOiB7XG4gICAgICBjb25zdCBkdXAgPSBlcnJvci5kdXBsaWNhdGVPZi5zdGFydHNXaXRoKCdwbHVnaW46JylcbiAgICAgICAgPyBgc2VydmVyIHByb3ZpZGVkIGJ5IHBsdWdpbiBcIiR7ZXJyb3IuZHVwbGljYXRlT2Yuc3BsaXQoJzonKVsxXSA/PyAnPyd9XCJgXG4gICAgICAgIDogYGFscmVhZHktY29uZmlndXJlZCBcIiR7ZXJyb3IuZHVwbGljYXRlT2Z9XCJgXG4gICAgICByZXR1cm4gYE1DUCBzZXJ2ZXIgXCIke2Vycm9yLnNlcnZlck5hbWV9XCIgc2tpcHBlZCDigJQgc2FtZSBjb21tYW5kL1VSTCBhcyAke2R1cH1gXG4gICAgfVxuICAgIGNhc2UgJ2hvb2stbG9hZC1mYWlsZWQnOlxuICAgICAgcmV0dXJuIGBGYWlsZWQgdG8gbG9hZCBob29rcyBmcm9tICR7ZXJyb3IuaG9va1BhdGh9OiAke2Vycm9yLnJlYXNvbn1gXG4gICAgY2FzZSAnY29tcG9uZW50LWxvYWQtZmFpbGVkJzpcbiAgICAgIHJldHVybiBgRmFpbGVkIHRvIGxvYWQgJHtlcnJvci5jb21wb25lbnR9IGZyb20gJHtlcnJvci5wYXRofTogJHtlcnJvci5yZWFzb259YFxuICAgIGNhc2UgJ21jcGItZG93bmxvYWQtZmFpbGVkJzpcbiAgICAgIHJldHVybiBgRmFpbGVkIHRvIGRvd25sb2FkIE1DUEIgZnJvbSAke2Vycm9yLnVybH06ICR7ZXJyb3IucmVhc29ufWBcbiAgICBjYXNlICdtY3BiLWV4dHJhY3QtZmFpbGVkJzpcbiAgICAgIHJldHVybiBgRmFpbGVkIHRvIGV4dHJhY3QgTUNQQiAke2Vycm9yLm1jcGJQYXRofTogJHtlcnJvci5yZWFzb259YFxuICAgIGNhc2UgJ21jcGItaW52YWxpZC1tYW5pZmVzdCc6XG4gICAgICByZXR1cm4gYE1DUEIgbWFuaWZlc3QgaW52YWxpZCBhdCAke2Vycm9yLm1jcGJQYXRofTogJHtlcnJvci52YWxpZGF0aW9uRXJyb3J9YFxuICAgIGNhc2UgJ21hcmtldHBsYWNlLWJsb2NrZWQtYnktcG9saWN5JzpcbiAgICAgIHJldHVybiBlcnJvci5ibG9ja2VkQnlCbG9ja2xpc3RcbiAgICAgICAgPyBgTWFya2V0cGxhY2UgXCIke2Vycm9yLm1hcmtldHBsYWNlfVwiIGlzIGJsb2NrZWQgYnkgZW50ZXJwcmlzZSBwb2xpY3lgXG4gICAgICAgIDogYE1hcmtldHBsYWNlIFwiJHtlcnJvci5tYXJrZXRwbGFjZX1cIiBpcyBub3QgaW4gdGhlIGFsbG93ZWQgbWFya2V0cGxhY2UgbGlzdGBcbiAgICBjYXNlICdkZXBlbmRlbmN5LXVuc2F0aXNmaWVkJzpcbiAgICAgIHJldHVybiBlcnJvci5yZWFzb24gPT09ICdub3QtZW5hYmxlZCdcbiAgICAgICAgPyBgRGVwZW5kZW5jeSBcIiR7ZXJyb3IuZGVwZW5kZW5jeX1cIiBpcyBkaXNhYmxlZGBcbiAgICAgICAgOiBgRGVwZW5kZW5jeSBcIiR7ZXJyb3IuZGVwZW5kZW5jeX1cIiBpcyBub3QgaW5zdGFsbGVkYFxuICAgIGNhc2UgJ2xzcC1jb25maWctaW52YWxpZCc6XG4gICAgICByZXR1cm4gYEludmFsaWQgTFNQIHNlcnZlciBjb25maWcgZm9yIFwiJHtlcnJvci5zZXJ2ZXJOYW1lfVwiOiAke2Vycm9yLnZhbGlkYXRpb25FcnJvcn1gXG4gICAgY2FzZSAnbHNwLXNlcnZlci1zdGFydC1mYWlsZWQnOlxuICAgICAgcmV0dXJuIGBMU1Agc2VydmVyIFwiJHtlcnJvci5zZXJ2ZXJOYW1lfVwiIGZhaWxlZCB0byBzdGFydDogJHtlcnJvci5yZWFzb259YFxuICAgIGNhc2UgJ2xzcC1zZXJ2ZXItY3Jhc2hlZCc6XG4gICAgICByZXR1cm4gZXJyb3Iuc2lnbmFsXG4gICAgICAgID8gYExTUCBzZXJ2ZXIgXCIke2Vycm9yLnNlcnZlck5hbWV9XCIgY3Jhc2hlZCB3aXRoIHNpZ25hbCAke2Vycm9yLnNpZ25hbH1gXG4gICAgICAgIDogYExTUCBzZXJ2ZXIgXCIke2Vycm9yLnNlcnZlck5hbWV9XCIgY3Jhc2hlZCB3aXRoIGV4aXQgY29kZSAke2Vycm9yLmV4aXRDb2RlID8/ICd1bmtub3duJ31gXG4gICAgY2FzZSAnbHNwLXJlcXVlc3QtdGltZW91dCc6XG4gICAgICByZXR1cm4gYExTUCBzZXJ2ZXIgXCIke2Vycm9yLnNlcnZlck5hbWV9XCIgdGltZWQgb3V0IG9uICR7ZXJyb3IubWV0aG9kfSBhZnRlciAke2Vycm9yLnRpbWVvdXRNc31tc2BcbiAgICBjYXNlICdsc3AtcmVxdWVzdC1mYWlsZWQnOlxuICAgICAgcmV0dXJuIGBMU1Agc2VydmVyIFwiJHtlcnJvci5zZXJ2ZXJOYW1lfVwiICR7ZXJyb3IubWV0aG9kfSBmYWlsZWQ6ICR7ZXJyb3IuZXJyb3J9YFxuICAgIGNhc2UgJ3BsdWdpbi1jYWNoZS1taXNzJzpcbiAgICAgIHJldHVybiBgUGx1Z2luIFwiJHtlcnJvci5wbHVnaW59XCIgbm90IGNhY2hlZCBhdCAke2Vycm9yLmluc3RhbGxQYXRofWBcbiAgICBjYXNlICdnZW5lcmljLWVycm9yJzpcbiAgICAgIHJldHVybiBlcnJvci5lcnJvclxuICB9XG4gIGNvbnN0IF9leGhhdXN0aXZlOiBuZXZlciA9IGVycm9yXG4gIHJldHVybiBnZXRQbHVnaW5FcnJvck1lc3NhZ2UoX2V4aGF1c3RpdmUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFcnJvckd1aWRhbmNlKGVycm9yOiBQbHVnaW5FcnJvcik6IHN0cmluZyB8IG51bGwge1xuICBzd2l0Y2ggKGVycm9yLnR5cGUpIHtcbiAgICBjYXNlICdwYXRoLW5vdC1mb3VuZCc6XG4gICAgICByZXR1cm4gJ0NoZWNrIHRoYXQgdGhlIHBhdGggaW4geW91ciBtYW5pZmVzdCBvciBtYXJrZXRwbGFjZSBjb25maWcgaXMgY29ycmVjdCdcbiAgICBjYXNlICdnaXQtYXV0aC1mYWlsZWQnOlxuICAgICAgcmV0dXJuIGVycm9yLmF1dGhUeXBlID09PSAnc3NoJ1xuICAgICAgICA/ICdDb25maWd1cmUgU1NIIGtleXMgb3IgdXNlIEhUVFBTIFVSTCBpbnN0ZWFkJ1xuICAgICAgICA6ICdDb25maWd1cmUgY3JlZGVudGlhbHMgb3IgdXNlIFNTSCBVUkwgaW5zdGVhZCdcbiAgICBjYXNlICdnaXQtdGltZW91dCc6XG4gICAgY2FzZSAnbmV0d29yay1lcnJvcic6XG4gICAgICByZXR1cm4gJ0NoZWNrIHlvdXIgaW50ZXJuZXQgY29ubmVjdGlvbiBhbmQgdHJ5IGFnYWluJ1xuICAgIGNhc2UgJ21hbmlmZXN0LXBhcnNlLWVycm9yJzpcbiAgICAgIHJldHVybiAnQ2hlY2sgbWFuaWZlc3QgZmlsZSBzeW50YXggaW4gdGhlIHBsdWdpbiBkaXJlY3RvcnknXG4gICAgY2FzZSAnbWFuaWZlc3QtdmFsaWRhdGlvbi1lcnJvcic6XG4gICAgICByZXR1cm4gJ0NoZWNrIG1hbmlmZXN0IGZpbGUgZm9sbG93cyB0aGUgcmVxdWlyZWQgc2NoZW1hJ1xuICAgIGNhc2UgJ3BsdWdpbi1ub3QtZm91bmQnOlxuICAgICAgcmV0dXJuIGBQbHVnaW4gbWF5IG5vdCBleGlzdCBpbiBtYXJrZXRwbGFjZSBcIiR7ZXJyb3IubWFya2V0cGxhY2V9XCJgXG4gICAgY2FzZSAnbWFya2V0cGxhY2Utbm90LWZvdW5kJzpcbiAgICAgIHJldHVybiBlcnJvci5hdmFpbGFibGVNYXJrZXRwbGFjZXMubGVuZ3RoID4gMFxuICAgICAgICA/IGBBdmFpbGFibGUgbWFya2V0cGxhY2VzOiAke2Vycm9yLmF2YWlsYWJsZU1hcmtldHBsYWNlcy5qb2luKCcsICcpfWBcbiAgICAgICAgOiAnQWRkIHRoZSBtYXJrZXRwbGFjZSBmaXJzdCB1c2luZyAvcGx1Z2luIG1hcmtldHBsYWNlIGFkZCdcbiAgICBjYXNlICdtY3AtY29uZmlnLWludmFsaWQnOlxuICAgICAgcmV0dXJuICdDaGVjayBNQ1Agc2VydmVyIGNvbmZpZ3VyYXRpb24gaW4gLm1jcC5qc29uIG9yIG1hbmlmZXN0J1xuICAgIGNhc2UgJ21jcC1zZXJ2ZXItc3VwcHJlc3NlZC1kdXBsaWNhdGUnOiB7XG4gICAgICAvLyBkdXBsaWNhdGVPZiBpcyBcInBsdWdpbjpuYW1lOnNydlwiIHdoZW4gYW5vdGhlciBwbHVnaW4gd29uIGRlZHVwIOKAlFxuICAgICAgLy8gdXNlcnMgY2FuJ3QgcmVtb3ZlIHBsdWdpbi1wcm92aWRlZCBzZXJ2ZXJzIGZyb20gdGhlaXIgTUNQIGNvbmZpZyxcbiAgICAgIC8vIHNvIHBvaW50IHRoZW0gYXQgdGhlIHdpbm5pbmcgcGx1Z2luIGluc3RlYWQuXG4gICAgICBpZiAoZXJyb3IuZHVwbGljYXRlT2Yuc3RhcnRzV2l0aCgncGx1Z2luOicpKSB7XG4gICAgICAgIGNvbnN0IHdpbm5pbmdQbHVnaW4gPVxuICAgICAgICAgIGVycm9yLmR1cGxpY2F0ZU9mLnNwbGl0KCc6JylbMV0gPz8gJ3RoZSBvdGhlciBwbHVnaW4nXG4gICAgICAgIHJldHVybiBgRGlzYWJsZSBwbHVnaW4gXCIke3dpbm5pbmdQbHVnaW59XCIgaWYgeW91IHdhbnQgdGhpcyBwbHVnaW4ncyB2ZXJzaW9uIGluc3RlYWRgXG4gICAgICB9XG4gICAgICByZXR1cm4gYFJlbW92ZSBcIiR7ZXJyb3IuZHVwbGljYXRlT2Z9XCIgZnJvbSB5b3VyIE1DUCBjb25maWcgaWYgeW91IHdhbnQgdGhlIHBsdWdpbidzIHZlcnNpb24gaW5zdGVhZGBcbiAgICB9XG4gICAgY2FzZSAnaG9vay1sb2FkLWZhaWxlZCc6XG4gICAgICByZXR1cm4gJ0NoZWNrIGhvb2tzLmpzb24gZmlsZSBzeW50YXggYW5kIHN0cnVjdHVyZSdcbiAgICBjYXNlICdjb21wb25lbnQtbG9hZC1mYWlsZWQnOlxuICAgICAgcmV0dXJuIGBDaGVjayAke2Vycm9yLmNvbXBvbmVudH0gZGlyZWN0b3J5IHN0cnVjdHVyZSBhbmQgZmlsZSBwZXJtaXNzaW9uc2BcbiAgICBjYXNlICdtY3BiLWRvd25sb2FkLWZhaWxlZCc6XG4gICAgICByZXR1cm4gJ0NoZWNrIHlvdXIgaW50ZXJuZXQgY29ubmVjdGlvbiBhbmQgVVJMIGFjY2Vzc2liaWxpdHknXG4gICAgY2FzZSAnbWNwYi1leHRyYWN0LWZhaWxlZCc6XG4gICAgICByZXR1cm4gJ1ZlcmlmeSB0aGUgTUNQQiBmaWxlIGlzIHZhbGlkIGFuZCBub3QgY29ycnVwdGVkJ1xuICAgIGNhc2UgJ21jcGItaW52YWxpZC1tYW5pZmVzdCc6XG4gICAgICByZXR1cm4gJ0NvbnRhY3QgdGhlIHBsdWdpbiBhdXRob3IgYWJvdXQgdGhlIGludmFsaWQgbWFuaWZlc3QnXG4gICAgY2FzZSAnbWFya2V0cGxhY2UtYmxvY2tlZC1ieS1wb2xpY3knOlxuICAgICAgaWYgKGVycm9yLmJsb2NrZWRCeUJsb2NrbGlzdCkge1xuICAgICAgICByZXR1cm4gJ1RoaXMgbWFya2V0cGxhY2Ugc291cmNlIGlzIGV4cGxpY2l0bHkgYmxvY2tlZCBieSB5b3VyIGFkbWluaXN0cmF0b3InXG4gICAgICB9XG4gICAgICByZXR1cm4gZXJyb3IuYWxsb3dlZFNvdXJjZXMubGVuZ3RoID4gMFxuICAgICAgICA/IGBBbGxvd2VkIHNvdXJjZXM6ICR7ZXJyb3IuYWxsb3dlZFNvdXJjZXMuam9pbignLCAnKX1gXG4gICAgICAgIDogJ0NvbnRhY3QgeW91ciBhZG1pbmlzdHJhdG9yIHRvIGNvbmZpZ3VyZSBhbGxvd2VkIG1hcmtldHBsYWNlIHNvdXJjZXMnXG4gICAgY2FzZSAnZGVwZW5kZW5jeS11bnNhdGlzZmllZCc6XG4gICAgICByZXR1cm4gZXJyb3IucmVhc29uID09PSAnbm90LWVuYWJsZWQnXG4gICAgICAgID8gYEVuYWJsZSBcIiR7ZXJyb3IuZGVwZW5kZW5jeX1cIiBvciB1bmluc3RhbGwgXCIke2Vycm9yLnBsdWdpbn1cImBcbiAgICAgICAgOiBgSW5zdGFsbCBcIiR7ZXJyb3IuZGVwZW5kZW5jeX1cIiBvciB1bmluc3RhbGwgXCIke2Vycm9yLnBsdWdpbn1cImBcbiAgICBjYXNlICdsc3AtY29uZmlnLWludmFsaWQnOlxuICAgICAgcmV0dXJuICdDaGVjayBMU1Agc2VydmVyIGNvbmZpZ3VyYXRpb24gaW4gdGhlIHBsdWdpbiBtYW5pZmVzdCdcbiAgICBjYXNlICdsc3Atc2VydmVyLXN0YXJ0LWZhaWxlZCc6XG4gICAgY2FzZSAnbHNwLXNlcnZlci1jcmFzaGVkJzpcbiAgICBjYXNlICdsc3AtcmVxdWVzdC10aW1lb3V0JzpcbiAgICBjYXNlICdsc3AtcmVxdWVzdC1mYWlsZWQnOlxuICAgICAgcmV0dXJuICdDaGVjayBMU1Agc2VydmVyIGxvZ3Mgd2l0aCAtLWRlYnVnIGZvciBkZXRhaWxzJ1xuICAgIGNhc2UgJ3BsdWdpbi1jYWNoZS1taXNzJzpcbiAgICAgIHJldHVybiAnUnVuIC9wbHVnaW5zIHRvIHJlZnJlc2ggdGhlIHBsdWdpbiBjYWNoZSdcbiAgICBjYXNlICdtYXJrZXRwbGFjZS1sb2FkLWZhaWxlZCc6XG4gICAgY2FzZSAnZ2VuZXJpYy1lcnJvcic6XG4gICAgICByZXR1cm4gbnVsbFxuICB9XG4gIGNvbnN0IF9leGhhdXN0aXZlOiBuZXZlciA9IGVycm9yXG4gIHJldHVybiBudWxsXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLHFCQUFxQixFQUFFLEtBQUtDLFdBQVcsUUFBUSx1QkFBdUI7QUFFL0UsT0FBTyxTQUFTQyxrQkFBa0JBLENBQUNDLEtBQUssRUFBRUYsV0FBVyxDQUFDLEVBQUUsTUFBTSxDQUFDO0VBQzdELFFBQVFFLEtBQUssQ0FBQ0MsSUFBSTtJQUNoQixLQUFLLGdCQUFnQjtNQUNuQixPQUFPLEdBQUdELEtBQUssQ0FBQ0UsU0FBUyxvQkFBb0JGLEtBQUssQ0FBQ0csSUFBSSxFQUFFO0lBQzNELEtBQUssaUJBQWlCO01BQ3BCLE9BQU8sT0FBT0gsS0FBSyxDQUFDSSxRQUFRLENBQUNDLFdBQVcsQ0FBQyxDQUFDLDhCQUE4QkwsS0FBSyxDQUFDTSxNQUFNLEVBQUU7SUFDeEYsS0FBSyxh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
