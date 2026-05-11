"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginErrorMessage = getPluginErrorMessage;
/**
 * Helper function to get a display message from any PluginError
 * Useful for logging and simple error displays
 */
function getPluginErrorMessage(error) {
    var _a, _b;
    switch (error.type) {
        case 'generic-error':
            return error.error;
        case 'path-not-found':
            return "Path not found: ".concat(error.path, " (").concat(error.component, ")");
        case 'git-auth-failed':
            return "Git authentication failed (".concat(error.authType, "): ").concat(error.gitUrl);
        case 'git-timeout':
            return "Git ".concat(error.operation, " timeout: ").concat(error.gitUrl);
        case 'network-error':
            return "Network error: ".concat(error.url).concat(error.details ? " - ".concat(error.details) : '');
        case 'manifest-parse-error':
            return "Manifest parse error: ".concat(error.parseError);
        case 'manifest-validation-error':
            return "Manifest validation failed: ".concat(error.validationErrors.join(', '));
        case 'plugin-not-found':
            return "Plugin ".concat(error.pluginId, " not found in marketplace ").concat(error.marketplace);
        case 'marketplace-not-found':
            return "Marketplace ".concat(error.marketplace, " not found");
        case 'marketplace-load-failed':
            return "Marketplace ".concat(error.marketplace, " failed to load: ").concat(error.reason);
        case 'mcp-config-invalid':
            return "MCP server ".concat(error.serverName, " invalid: ").concat(error.validationError);
        case 'mcp-server-suppressed-duplicate': {
            var dup = error.duplicateOf.startsWith('plugin:')
                ? "server provided by plugin \"".concat((_a = error.duplicateOf.split(':')[1]) !== null && _a !== void 0 ? _a : '?', "\"")
                : "already-configured \"".concat(error.duplicateOf, "\"");
            return "MCP server \"".concat(error.serverName, "\" skipped \u2014 same command/URL as ").concat(dup);
        }
        case 'hook-load-failed':
            return "Hook load failed: ".concat(error.reason);
        case 'component-load-failed':
            return "".concat(error.component, " load failed from ").concat(error.path, ": ").concat(error.reason);
        case 'mcpb-download-failed':
            return "Failed to download MCPB from ".concat(error.url, ": ").concat(error.reason);
        case 'mcpb-extract-failed':
            return "Failed to extract MCPB ".concat(error.mcpbPath, ": ").concat(error.reason);
        case 'mcpb-invalid-manifest':
            return "MCPB manifest invalid at ".concat(error.mcpbPath, ": ").concat(error.validationError);
        case 'lsp-config-invalid':
            return "Plugin \"".concat(error.plugin, "\" has invalid LSP server config for \"").concat(error.serverName, "\": ").concat(error.validationError);
        case 'lsp-server-start-failed':
            return "Plugin \"".concat(error.plugin, "\" failed to start LSP server \"").concat(error.serverName, "\": ").concat(error.reason);
        case 'lsp-server-crashed':
            if (error.signal) {
                return "Plugin \"".concat(error.plugin, "\" LSP server \"").concat(error.serverName, "\" crashed with signal ").concat(error.signal);
            }
            return "Plugin \"".concat(error.plugin, "\" LSP server \"").concat(error.serverName, "\" crashed with exit code ").concat((_b = error.exitCode) !== null && _b !== void 0 ? _b : 'unknown');
        case 'lsp-request-timeout':
            return "Plugin \"".concat(error.plugin, "\" LSP server \"").concat(error.serverName, "\" timed out on ").concat(error.method, " request after ").concat(error.timeoutMs, "ms");
        case 'lsp-request-failed':
            return "Plugin \"".concat(error.plugin, "\" LSP server \"").concat(error.serverName, "\" ").concat(error.method, " request failed: ").concat(error.error);
        case 'marketplace-blocked-by-policy':
            if (error.blockedByBlocklist) {
                return "Marketplace '".concat(error.marketplace, "' is blocked by enterprise policy");
            }
            return "Marketplace '".concat(error.marketplace, "' is not in the allowed marketplace list");
        case 'dependency-unsatisfied': {
            var hint = error.reason === 'not-enabled'
                ? 'disabled — enable it or remove the dependency'
                : 'not found in any configured marketplace';
            return "Dependency \"".concat(error.dependency, "\" is ").concat(hint);
        }
        case 'plugin-cache-miss':
            return "Plugin \"".concat(error.plugin, "\" not cached at ").concat(error.installPath, " \u2014 run /plugins to refresh");
    }
}
