"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSandboxProperties = buildSandboxProperties;
exports.buildIDEProperties = buildIDEProperties;
exports.buildMcpProperties = buildMcpProperties;
exports.buildMemoryDiagnostics = buildMemoryDiagnostics;
exports.buildSettingSourcesProperties = buildSettingSourcesProperties;
exports.buildInstallationDiagnostics = buildInstallationDiagnostics;
exports.buildInstallationHealthDiagnostics = buildInstallationHealthDiagnostics;
exports.buildAccountProperties = buildAccountProperties;
exports.buildAPIProviderProperties = buildAPIProviderProperties;
exports.getModelDisplayLabel = getModelDisplayLabel;
var chalk_1 = require("chalk");
var figures_1 = require("figures");
var React = require("react");
var ink_js_1 = require("../ink.js");
var auth_js_1 = require("./auth.js");
var claudemd_js_1 = require("./claudemd.js");
var doctorDiagnostic_js_1 = require("./doctorDiagnostic.js");
var envUtils_js_1 = require("./envUtils.js");
var file_js_1 = require("./file.js");
var format_js_1 = require("./format.js");
var ide_js_1 = require("./ide.js");
var model_js_1 = require("./model/model.js");
var providers_js_1 = require("./model/providers.js");
var mtls_js_1 = require("./mtls.js");
var index_js_1 = require("./nativeInstaller/index.js");
var proxy_js_1 = require("./proxy.js");
var sandbox_adapter_js_1 = require("./sandbox/sandbox-adapter.js");
var allErrors_js_1 = require("./settings/allErrors.js");
var constants_js_1 = require("./settings/constants.js");
var settings_js_1 = require("./settings/settings.js");
function buildSandboxProperties() {
    if ("external" !== 'ant') {
        return [];
    }
    var isSandboxed = sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled();
    return [{
            label: 'Bash Sandbox',
            value: isSandboxed ? 'Enabled' : 'Disabled'
        }];
}
function buildIDEProperties(mcpClients, ideInstallationStatus, theme) {
    var _a, _b, _c;
    if (ideInstallationStatus === void 0) { ideInstallationStatus = null; }
    var ideClient = mcpClients === null || mcpClients === void 0 ? void 0 : mcpClients.find(function (client) { return client.name === 'ide'; });
    if (ideInstallationStatus) {
        var ideName = (0, ide_js_1.toIDEDisplayName)(ideInstallationStatus.ideType);
        var pluginOrExtension = (0, ide_js_1.isJetBrainsIde)(ideInstallationStatus.ideType) ? 'plugin' : 'extension';
        if (ideInstallationStatus.error) {
            return [{
                    label: 'IDE',
                    value: <ink_js_1.Text>
              {(0, ink_js_1.color)('error', theme)(figures_1.default.cross)} Error installing {ideName}{' '}
              {pluginOrExtension}: {ideInstallationStatus.error}
              {'\n'}Please restart your IDE and try again.
            </ink_js_1.Text>
                }];
        }
        if (ideInstallationStatus.installed) {
            if (ideClient && ideClient.type === 'connected') {
                if (ideInstallationStatus.installedVersion !== ((_a = ideClient.serverInfo) === null || _a === void 0 ? void 0 : _a.version)) {
                    return [{
                            label: 'IDE',
                            value: "Connected to ".concat(ideName, " ").concat(pluginOrExtension, " version ").concat(ideInstallationStatus.installedVersion, " (server version: ").concat((_b = ideClient.serverInfo) === null || _b === void 0 ? void 0 : _b.version, ")")
                        }];
                }
                else {
                    return [{
                            label: 'IDE',
                            value: "Connected to ".concat(ideName, " ").concat(pluginOrExtension, " version ").concat(ideInstallationStatus.installedVersion)
                        }];
                }
            }
            else {
                return [{
                        label: 'IDE',
                        value: "Installed ".concat(ideName, " ").concat(pluginOrExtension)
                    }];
            }
        }
    }
    else if (ideClient) {
        var ideName = (_c = (0, ide_js_1.getIdeClientName)(ideClient)) !== null && _c !== void 0 ? _c : 'IDE';
        if (ideClient.type === 'connected') {
            return [{
                    label: 'IDE',
                    value: "Connected to ".concat(ideName, " extension")
                }];
        }
        else {
            return [{
                    label: 'IDE',
                    value: "".concat((0, ink_js_1.color)('error', theme)(figures_1.default.cross), " Not connected to ").concat(ideName)
                }];
        }
    }
    return [];
}
function buildMcpProperties(clients, theme) {
    if (clients === void 0) { clients = []; }
    var servers = clients.filter(function (client) { return client.name !== 'ide'; });
    if (!servers.length) {
        return [];
    }
    // Summary instead of a full server list — 20+ servers wrapped onto many
    // rows, dominating the Status pane. Show counts by state + /mcp hint.
    var byState = {
        connected: 0,
        pending: 0,
        needsAuth: 0,
        failed: 0
    };
    for (var _i = 0, servers_1 = servers; _i < servers_1.length; _i++) {
        var s = servers_1[_i];
        if (s.type === 'connected')
            byState.connected++;
        else if (s.type === 'pending')
            byState.pending++;
        else if (s.type === 'needs-auth')
            byState.needsAuth++;
        else
            byState.failed++;
    }
    var parts = [];
    if (byState.connected)
        parts.push((0, ink_js_1.color)('success', theme)("".concat(byState.connected, " connected")));
    if (byState.needsAuth)
        parts.push((0, ink_js_1.color)('warning', theme)("".concat(byState.needsAuth, " need auth")));
    if (byState.pending)
        parts.push((0, ink_js_1.color)('inactive', theme)("".concat(byState.pending, " pending")));
    if (byState.failed)
        parts.push((0, ink_js_1.color)('error', theme)("".concat(byState.failed, " failed")));
    return [{
            label: 'MCP servers',
            value: "".concat(parts.join(', '), " ").concat((0, ink_js_1.color)('inactive', theme)('· /mcp'))
        }];
}
function buildMemoryDiagnostics() {
    return __awaiter(this, void 0, void 0, function () {
        var files, largeFiles, diagnostics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, claudemd_js_1.getMemoryFiles)()];
                case 1:
                    files = _a.sent();
                    largeFiles = (0, claudemd_js_1.getLargeMemoryFiles)(files);
                    diagnostics = [];
                    largeFiles.forEach(function (file) {
                        var displayPath = (0, file_js_1.getDisplayPath)(file.path);
                        diagnostics.push("Large ".concat(displayPath, " will impact performance (").concat((0, format_js_1.formatNumber)(file.content.length), " chars > ").concat((0, format_js_1.formatNumber)(claudemd_js_1.MAX_MEMORY_CHARACTER_COUNT), ")"));
                    });
                    return [2 /*return*/, diagnostics];
            }
        });
    });
}
function buildSettingSourcesProperties() {
    var enabledSources = (0, constants_js_1.getEnabledSettingSources)();
    // Filter to only sources that actually have settings loaded
    var sourcesWithSettings = enabledSources.filter(function (source) {
        var settings = (0, settings_js_1.getSettingsForSource)(source);
        return settings !== null && Object.keys(settings).length > 0;
    });
    // Map internal names to user-friendly names
    // For policySettings, distinguish between remote and local (or skip if neither exists)
    var sourceNames = sourcesWithSettings.map(function (source) {
        if (source === 'policySettings') {
            var origin_1 = (0, settings_js_1.getPolicySettingsOrigin)();
            if (origin_1 === null) {
                return null; // Skip - no policy settings exist
            }
            switch (origin_1) {
                case 'remote':
                    return 'Enterprise managed settings (remote)';
                case 'plist':
                    return 'Enterprise managed settings (plist)';
                case 'hklm':
                    return 'Enterprise managed settings (HKLM)';
                case 'file':
                    {
                        var _a = (0, settings_js_1.getManagedFileSettingsPresence)(), hasBase = _a.hasBase, hasDropIns = _a.hasDropIns;
                        if (hasBase && hasDropIns) {
                            return 'Enterprise managed settings (file + drop-ins)';
                        }
                        if (hasDropIns) {
                            return 'Enterprise managed settings (drop-ins)';
                        }
                        return 'Enterprise managed settings (file)';
                    }
                case 'hkcu':
                    return 'Enterprise managed settings (HKCU)';
            }
        }
        return (0, constants_js_1.getSettingSourceDisplayNameCapitalized)(source);
    }).filter(function (name) { return name !== null; });
    return [{
            label: 'Setting sources',
            value: sourceNames
        }];
}
function buildInstallationDiagnostics() {
    return __awaiter(this, void 0, void 0, function () {
        var installWarnings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, index_js_1.checkInstall)()];
                case 1:
                    installWarnings = _a.sent();
                    return [2 /*return*/, installWarnings.map(function (warning) { return warning.message; })];
            }
        });
    });
}
function buildInstallationHealthDiagnostics() {
    return __awaiter(this, void 0, void 0, function () {
        var diagnostic, items, validationErrors, invalidFiles, fileList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, doctorDiagnostic_js_1.getDoctorDiagnostic)()];
                case 1:
                    diagnostic = _a.sent();
                    items = [];
                    validationErrors = (0, allErrors_js_1.getSettingsWithAllErrors)().errors;
                    if (validationErrors.length > 0) {
                        invalidFiles = Array.from(new Set(validationErrors.map(function (error) { return error.file; })));
                        fileList = invalidFiles.join(', ');
                        items.push("Found invalid settings files: ".concat(fileList, ". They will be ignored."));
                    }
                    // Add warnings from doctor diagnostic (includes leftover installations, config mismatches, etc.)
                    diagnostic.warnings.forEach(function (warning) {
                        items.push(warning.issue);
                    });
                    if (diagnostic.hasUpdatePermissions === false) {
                        items.push('No write permissions for auto-updates (requires sudo)');
                    }
                    return [2 /*return*/, items];
            }
        });
    });
}
function buildAccountProperties() {
    var accountInfo = (0, auth_js_1.getAccountInformation)();
    if (!accountInfo) {
        return [];
    }
    var properties = [];
    if (accountInfo.subscription) {
        properties.push({
            label: 'Login method',
            value: "".concat(accountInfo.subscription, " Account")
        });
    }
    if (accountInfo.tokenSource) {
        properties.push({
            label: 'Auth token',
            value: accountInfo.tokenSource
        });
    }
    if (accountInfo.apiKeySource) {
        properties.push({
            label: 'API key',
            value: accountInfo.apiKeySource
        });
    }
    // Hide sensitive account info in demo mode
    if (accountInfo.organization && !process.env.IS_DEMO) {
        properties.push({
            label: 'Organization',
            value: accountInfo.organization
        });
    }
    if (accountInfo.email && !process.env.IS_DEMO) {
        properties.push({
            label: 'Email',
            value: accountInfo.email
        });
    }
    return properties;
}
function buildAPIProviderProperties() {
    var apiProvider = (0, providers_js_1.getAPIProvider)();
    var properties = [];
    if (apiProvider !== 'firstParty') {
        var providerLabel = {
            bedrock: 'AWS Bedrock',
            vertex: 'Google Vertex AI',
            foundry: 'Microsoft Foundry'
        }[apiProvider];
        properties.push({
            label: 'API provider',
            value: providerLabel
        });
    }
    if (apiProvider === 'firstParty') {
        var anthropicBaseUrl = process.env.ANTHROPIC_BASE_URL;
        if (anthropicBaseUrl) {
            properties.push({
                label: 'Anthropic base URL',
                value: anthropicBaseUrl
            });
        }
    }
    else if (apiProvider === 'bedrock') {
        var bedrockBaseUrl = process.env.BEDROCK_BASE_URL;
        if (bedrockBaseUrl) {
            properties.push({
                label: 'Bedrock base URL',
                value: bedrockBaseUrl
            });
        }
        properties.push({
            label: 'AWS region',
            value: (0, envUtils_js_1.getAWSRegion)()
        });
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_BEDROCK_AUTH)) {
            properties.push({
                value: 'AWS auth skipped'
            });
        }
    }
    else if (apiProvider === 'vertex') {
        var vertexBaseUrl = process.env.VERTEX_BASE_URL;
        if (vertexBaseUrl) {
            properties.push({
                label: 'Vertex base URL',
                value: vertexBaseUrl
            });
        }
        var gcpProject = process.env.ANTHROPIC_VERTEX_PROJECT_ID;
        if (gcpProject) {
            properties.push({
                label: 'GCP project',
                value: gcpProject
            });
        }
        properties.push({
            label: 'Default region',
            value: (0, envUtils_js_1.getDefaultVertexRegion)()
        });
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_VERTEX_AUTH)) {
            properties.push({
                value: 'GCP auth skipped'
            });
        }
    }
    else if (apiProvider === 'foundry') {
        var foundryBaseUrl = process.env.ANTHROPIC_FOUNDRY_BASE_URL;
        if (foundryBaseUrl) {
            properties.push({
                label: 'Microsoft Foundry base URL',
                value: foundryBaseUrl
            });
        }
        var foundryResource = process.env.ANTHROPIC_FOUNDRY_RESOURCE;
        if (foundryResource) {
            properties.push({
                label: 'Microsoft Foundry resource',
                value: foundryResource
            });
        }
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_FOUNDRY_AUTH)) {
            properties.push({
                value: 'Microsoft Foundry auth skipped'
            });
        }
    }
    var proxyUrl = (0, proxy_js_1.getProxyUrl)();
    if (proxyUrl) {
        properties.push({
            label: 'Proxy',
            value: proxyUrl
        });
    }
    var mtlsConfig = (0, mtls_js_1.getMTLSConfig)();
    if (process.env.NODE_EXTRA_CA_CERTS) {
        properties.push({
            label: 'Additional CA cert(s)',
            value: process.env.NODE_EXTRA_CA_CERTS
        });
    }
    if (mtlsConfig) {
        if (mtlsConfig.cert && process.env.CLAUDE_CODE_CLIENT_CERT) {
            properties.push({
                label: 'mTLS client cert',
                value: process.env.CLAUDE_CODE_CLIENT_CERT
            });
        }
        if (mtlsConfig.key && process.env.CLAUDE_CODE_CLIENT_KEY) {
            properties.push({
                label: 'mTLS client key',
                value: process.env.CLAUDE_CODE_CLIENT_KEY
            });
        }
    }
    return properties;
}
function getModelDisplayLabel(mainLoopModel) {
    var modelLabel = (0, model_js_1.modelDisplayString)(mainLoopModel);
    if (mainLoopModel === null && (0, auth_js_1.isClaudeAISubscriber)()) {
        var description = (0, model_js_1.getClaudeAiUserDefaultModelDescription)();
        modelLabel = "".concat(chalk_1.default.bold('Default'), " ").concat(description);
    }
    return modelLabel;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsImZpZ3VyZXMiLCJSZWFjdCIsImNvbG9yIiwiVGV4dCIsIk1DUFNlcnZlckNvbm5lY3Rpb24iLCJnZXRBY2NvdW50SW5mb3JtYXRpb24iLCJpc0NsYXVkZUFJU3Vic2NyaWJlciIsImdldExhcmdlTWVtb3J5RmlsZXMiLCJnZXRNZW1vcnlGaWxlcyIsIk1BWF9NRU1PUllfQ0hBUkFDVEVSX0NPVU5UIiwiZ2V0RG9jdG9yRGlhZ25vc3RpYyIsImdldEFXU1JlZ2lvbiIsImdldERlZmF1bHRWZXJ0ZXhSZWdpb24iLCJpc0VudlRydXRoeSIsImdldERpc3BsYXlQYXRoIiwiZm9ybWF0TnVtYmVyIiwiZ2V0SWRlQ2xpZW50TmFtZSIsIklERUV4dGVuc2lvbkluc3RhbGxhdGlvblN0YXR1cyIsImlzSmV0QnJhaW5zSWRlIiwidG9JREVEaXNwbGF5TmFtZSIsImdldENsYXVkZUFpVXNlckRlZmF1bHRNb2RlbERlc2NyaXB0aW9uIiwibW9kZWxEaXNwbGF5U3RyaW5nIiwiZ2V0QVBJUHJvdmlkZXIiLCJnZXRNVExTQ29uZmlnIiwiY2hlY2tJbnN0YWxsIiwiZ2V0UHJveHlVcmwiLCJTYW5kYm94TWFuYWdlciIsImdldFNldHRpbmdzV2l0aEFsbEVycm9ycyIsImdldEVuYWJsZWRTZXR0aW5nU291cmNlcyIsImdldFNldHRpbmdTb3VyY2VEaXNwbGF5TmFtZUNhcGl0YWxpemVkIiwiZ2V0TWFuYWdlZEZpbGVTZXR0aW5nc1ByZXNlbmNlIiwiZ2V0UG9saWN5U2V0dGluZ3NPcmlnaW4iLCJnZXRTZXR0aW5nc0ZvclNvdXJjZSIsIlRoZW1lTmFtZSIsIlByb3BlcnR5IiwibGFiZWwiLCJ2YWx1ZSIsIlJlYWN0Tm9kZSIsIkFycmF5IiwiRGlhZ25vc3RpYyIsImJ1aWxkU2FuZGJveFByb3BlcnRpZXMiLCJpc1NhbmRib3hlZCIsImlzU2FuZGJveGluZ0VuYWJsZWQiLCJidWlsZElERVByb3BlcnRpZXMiLCJtY3BDbGllbnRzIiwiaWRlSW5zdGFsbGF0aW9uU3RhdHVzIiwidGhlbWUiLCJpZGVDbGllbnQiLCJmaW5kIiwiY2xpZW50IiwibmFtZSIsImlkZU5hbWUiLCJpZGVUeXBlIiwicGx1Z2luT3JFeHRlbnNpb24iLCJlcnJvciIsImNyb3NzIiwiaW5zdGFsbGVkIiwidHlwZSIsImluc3RhbGxlZFZlcnNpb24iLCJzZXJ2ZXJJbmZvIiwidmVyc2lvbiIsImJ1aWxkTWNwUHJvcGVydGllcyIsImNsaWVudHMiLCJzZXJ2ZXJzIiwiZmlsdGVyIiwibGVuZ3RoIiwiYnlTdGF0ZSIsImNvbm5lY3RlZCIsInBlbmRpbmciLCJuZWVkc0F1dGgiLCJmYWlsZWQiLCJzIiwicGFydHMiLCJwdXNoIiwiam9pbiIsImJ1aWxkTWVtb3J5RGlhZ25vc3RpY3MiLCJQcm9taXNlIiwiZmlsZXMiLCJsYXJnZUZpbGVzIiwiZGlhZ25vc3RpY3MiLCJmb3JFYWNoIiwiZmlsZSIsImRpc3BsYXlQYXRoIiwicGF0aCIsImNvbnRlbnQiLCJidWlsZFNldHRpbmdTb3VyY2VzUHJvcGVydGllcyIsImVuYWJsZWRTb3VyY2VzIiwic291cmNlc1dpdGhTZXR0aW5ncyIsInNvdXJjZSIsInNldHRpbmdzIiwiT2JqZWN0Iiwia2V5cyIsInNvdXJjZU5hbWVzIiwibWFwIiwib3JpZ2luIiwiaGFzQmFzZSIsImhhc0Ryb3BJbnMiLCJidWlsZEluc3RhbGxhdGlvbkRpYWdub3N0aWNzIiwiaW5zdGFsbFdhcm5pbmdzIiwid2FybmluZyIsIm1lc3NhZ2UiLCJidWlsZEluc3RhbGxhdGlvbkhlYWx0aERpYWdub3N0aWNzIiwiZGlhZ25vc3RpYyIsIml0ZW1zIiwiZXJyb3JzIiwidmFsaWRhdGlvbkVycm9ycyIsImludmFsaWRGaWxlcyIsImZyb20iLCJTZXQiLCJmaWxlTGlzdCIsIndhcm5pbmdzIiwiaXNzdWUiLCJoYXNVcGRhdGVQZXJtaXNzaW9ucyIsImJ1aWxkQWNjb3VudFByb3BlcnRpZXMiLCJhY2NvdW50SW5mbyIsInByb3BlcnRpZXMiLCJzdWJzY3JpcHRpb24iLCJ0b2tlblNvdXJjZSIsImFwaUtleVNvdXJjZSIsIm9yZ2FuaXphdGlvbiIsInByb2Nlc3MiLCJlbnYiLCJJU19ERU1PIiwiZW1haWwiLCJidWlsZEFQSVByb3ZpZGVyUHJvcGVydGllcyIsImFwaVByb3ZpZGVyIiwicHJvdmlkZXJMYWJlbCIsImJlZHJvY2siLCJ2ZXJ0ZXgiLCJmb3VuZHJ5IiwiYW50aHJvcGljQmFzZVVybCIsIkFOVEhST1BJQ19CQVNFX1VSTCIsImJlZHJvY2tCYXNlVXJsIiwiQkVEUk9DS19CQVNFX1VSTCIsIkNMQVVERV9DT0RFX1NLSVBfQkVEUk9DS19BVVRIIiwidmVydGV4QmFzZVVybCIsIlZFUlRFWF9CQVNFX1VSTCIsImdjcFByb2plY3QiLCJBTlRIUk9QSUNfVkVSVEVYX1BST0pFQ1RfSUQiLCJDTEFVREVfQ09ERV9TS0lQX1ZFUlRFWF9BVVRIIiwiZm91bmRyeUJhc2VVcmwiLCJBTlRIUk9QSUNfRk9VTkRSWV9CQVNFX1VSTCIsImZvdW5kcnlSZXNvdXJjZSIsIkFOVEhST1BJQ19GT1VORFJZX1JFU09VUkNFIiwiQ0xBVURFX0NPREVfU0tJUF9GT1VORFJZX0FVVEgiLCJwcm94eVVybCIsIm10bHNDb25maWciLCJOT0RFX0VYVFJBX0NBX0NFUlRTIiwiY2VydCIsIkNMQVVERV9DT0RFX0NMSUVOVF9DRVJUIiwia2V5IiwiQ0xBVURFX0NPREVfQ0xJRU5UX0tFWSIsImdldE1vZGVsRGlzcGxheUxhYmVsIiwibWFpbkxvb3BNb2RlbCIsIm1vZGVsTGFiZWwiLCJkZXNjcmlwdGlvbiIsImJvbGQiXSwic291cmNlcyI6WyJzdGF0dXMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsaydcbmltcG9ydCBmaWd1cmVzIGZyb20gJ2ZpZ3VyZXMnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGNvbG9yLCBUZXh0IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHR5cGUgeyBNQ1BTZXJ2ZXJDb25uZWN0aW9uIH0gZnJvbSAnLi4vc2VydmljZXMvbWNwL3R5cGVzLmpzJ1xuaW1wb3J0IHsgZ2V0QWNjb3VudEluZm9ybWF0aW9uLCBpc0NsYXVkZUFJU3Vic2NyaWJlciB9IGZyb20gJy4vYXV0aC5qcydcbmltcG9ydCB7XG4gIGdldExhcmdlTWVtb3J5RmlsZXMsXG4gIGdldE1lbW9yeUZpbGVzLFxuICBNQVhfTUVNT1JZX0NIQVJBQ1RFUl9DT1VOVCxcbn0gZnJvbSAnLi9jbGF1ZGVtZC5qcydcbmltcG9ydCB7IGdldERvY3RvckRpYWdub3N0aWMgfSBmcm9tICcuL2RvY3RvckRpYWdub3N0aWMuanMnXG5pbXBvcnQge1xuICBnZXRBV1NSZWdpb24sXG4gIGdldERlZmF1bHRWZXJ0ZXhSZWdpb24sXG4gIGlzRW52VHJ1dGh5LFxufSBmcm9tICcuL2VudlV0aWxzLmpzJ1xuaW1wb3J0IHsgZ2V0RGlzcGxheVBhdGggfSBmcm9tICcuL2ZpbGUuanMnXG5pbXBvcnQgeyBmb3JtYXROdW1iZXIgfSBmcm9tICcuL2Zvcm1hdC5qcydcbmltcG9ydCB7XG4gIGdldElkZUNsaWVudE5hbWUsXG4gIHR5cGUgSURFRXh0ZW5zaW9uSW5zdGFsbGF0aW9uU3RhdHVzLFxuICBpc0pldEJyYWluc0lkZSxcbiAgdG9JREVEaXNwbGF5TmFtZSxcbn0gZnJvbSAnLi9pZGUuanMnXG5pbXBvcnQge1xuICBnZXRDbGF1ZGVBaVVzZXJEZWZhdWx0TW9kZWxEZXNjcmlwdGlvbixcbiAgbW9kZWxEaXNwbGF5U3RyaW5nLFxufSBmcm9tICcuL21vZGVsL21vZGVsLmpzJ1xuaW1wb3J0IHsgZ2V0QVBJUHJvdmlkZXIgfSBmcm9tICcuL21vZGVsL3Byb3ZpZGVycy5qcydcbmltcG9ydCB7IGdldE1UTFNDb25maWcgfSBmcm9tICcuL210bHMuanMnXG5pbXBvcnQgeyBjaGVja0luc3RhbGwgfSBmcm9tICcuL25hdGl2ZUluc3RhbGxlci9pbmRleC5qcydcbmltcG9ydCB7IGdldFByb3h5VXJsIH0gZnJvbSAnLi9wcm94eS5qcydcbmltcG9ydCB7IFNhbmRib3hNYW5hZ2VyIH0gZnJvbSAnLi9zYW5kYm94L3NhbmRib3gtYWRhcHRlci5qcydcbmltcG9ydCB7IGdldFNldHRpbmdzV2l0aEFsbEVycm9ycyB9IGZyb20gJy4vc2V0dGluZ3MvYWxsRXJyb3JzLmpzJ1xuaW1wb3J0IHtcbiAgZ2V0RW5hYmxlZFNldHRpbmdTb3VyY2VzLFxuICBnZXRTZXR0aW5nU291cmNlRGlzcGxheU5hbWVDYXBpdGFsaXplZCxcbn0gZnJvbSAnLi9zZXR0aW5ncy9jb25zdGFudHMuanMnXG5pbXBvcnQge1xuICBnZXRNYW5hZ2VkRmlsZVNldHRpbmdzUHJlc2VuY2UsXG4gIGdldFBvbGljeVNldHRpbmdzT3JpZ2luLFxuICBnZXRTZXR0aW5nc0ZvclNvdXJjZSxcbn0gZnJvbSAnLi9zZXR0aW5ncy9zZXR0aW5ncy5qcydcbmltcG9ydCB0eXBlIHsgVGhlbWVOYW1lIH0gZnJvbSAnLi90aGVtZS5qcydcblxuZXhwb3J0IHR5cGUgUHJvcGVydHkgPSB7XG4gIGxhYmVsPzogc3RyaW5nXG4gIHZhbHVlOiBSZWFjdC5SZWFjdE5vZGUgfCBBcnJheTxzdHJpbmc+XG59XG5cbmV4cG9ydCB0eXBlIERpYWdub3N0aWMgPSBSZWFjdC5SZWFjdE5vZGVcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkU2FuZGJveFByb3BlcnRpZXMoKTogUHJvcGVydHlbXSB7XG4gIGlmIChcImV4dGVybmFsXCIgIT09ICdhbnQnKSB7XG4gICAgcmV0dXJuIFtdXG4gIH1cblxuICBjb25zdCBpc1NhbmRib3hlZCA9IFNhbmRib3hNYW5hZ2VyLmlzU2FuZGJveGluZ0VuYWJsZWQoKVxuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbGFiZWw6ICdCYXNoIFNhbmRib3gnLFxuICAgICAgdmFsdWU6IGlzU2FuZGJveGVkID8gJ0VuYWJsZWQnIDogJ0Rpc2FibGVkJyxcbiAgICB9LFxuICBdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZElERVByb3BlcnRpZXMoXG4gIG1jcENsaWVudHM6IE1DUFNlcnZlckNvbm5lY3Rpb25bXSxcbiAgaWRlSW5zdGFsbGF0aW9uU3RhdHVzOiBJREVFeHRlbnNpb25JbnN0YWxsYXRpb25TdGF0dXMgfCBudWxsID0gbnVsbCxcbiAgdGhlbWU6IFRoZW1lTmFtZSxcbik6IFByb3BlcnR5W10ge1xuICBjb25zdCBpZGVDbGllbnQgPSBtY3BDbGllbnRzPy5maW5kKGNsaWVudCA9PiBjbGllbnQubmFtZSA9PT0gJ2lkZScpXG5cbiAgaWYgKGlkZUluc3RhbGxhdGlvblN0YXR1cykge1xuICAgIGNvbnN0IGlkZU5hbWUgPSB0b0lERURpc3BsYXlOYW1lKGlkZUluc3RhbGxhdGlvblN0YXR1cy5pZGVUeXBlKVxuICAgIGNvbnN0IHBsdWdpbk9yRXh0ZW5zaW9uID0gaXNKZXRCcmFpbnNJZGUoaWRlSW5zdGFsbGF0aW9uU3RhdHVzLmlkZVR5cGUpXG4gICAgICA/ICdwbHVnaW4nXG4gICAgICA6ICdleHRlbnNpb24nXG5cbiAgICBpZiAoaWRlSW5zdGFsbGF0aW9uU3RhdHVzLmVycm9yKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdJREUnLFxuICAgICAgICAgIHZhbHVlOiAoXG4gICAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgICAge2NvbG9yKCdlcnJvcicsIHRoZW1lKShmaWd1cmVzLmNyb3NzKX0gRXJyb3IgaW5zdGFsbGluZyB7aWRlTmFtZX17JyAnfVxuICAgICAgICAgICAgICB7cGx1Z2luT3JFeHRlbnNpb259OiB7aWRlSW5zdGFsbGF0aW9uU3RhdHVzLmVycm9yfVxuICAgICAgICAgICAgICB7J1xcbid9UGxlYXNlIHJlc3RhcnQgeW91ciBJREUgYW5kIHRyeSBhZ2Fpbi5cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICApLFxuICAgICAgICB9LFxuICAgICAgXVxuICAgIH1cblxuICAgIGlmIChpZGVJbnN0YWxsYXRpb25TdGF0dXMuaW5zdGFsbGVkKSB7XG4gICAgICBpZiAoaWRlQ2xpZW50ICYmIGlkZUNsaWVudC50eXBlID09PSAnY29ubmVjdGVkJykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaWRlSW5zdGFsbGF0aW9uU3RhdHVzLmluc3RhbGxlZFZlcnNpb24gIT09XG4gICAgICAgICAgaWRlQ2xpZW50LnNlcnZlckluZm8/LnZlcnNpb25cbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6ICdJREUnLFxuICAgICAgICAgICAgICB2YWx1ZTogYENvbm5lY3RlZCB0byAke2lkZU5hbWV9ICR7cGx1Z2luT3JFeHRlbnNpb259IHZlcnNpb24gJHtpZGVJbnN0YWxsYXRpb25TdGF0dXMuaW5zdGFsbGVkVmVyc2lvbn0gKHNlcnZlciB2ZXJzaW9uOiAke2lkZUNsaWVudC5zZXJ2ZXJJbmZvPy52ZXJzaW9ufSlgLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6ICdJREUnLFxuICAgICAgICAgICAgICB2YWx1ZTogYENvbm5lY3RlZCB0byAke2lkZU5hbWV9ICR7cGx1Z2luT3JFeHRlbnNpb259IHZlcnNpb24gJHtpZGVJbnN0YWxsYXRpb25TdGF0dXMuaW5zdGFsbGVkVmVyc2lvbn1gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdJREUnLFxuICAgICAgICAgICAgdmFsdWU6IGBJbnN0YWxsZWQgJHtpZGVOYW1lfSAke3BsdWdpbk9yRXh0ZW5zaW9ufWAsXG4gICAgICAgICAgfSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChpZGVDbGllbnQpIHtcbiAgICBjb25zdCBpZGVOYW1lID0gZ2V0SWRlQ2xpZW50TmFtZShpZGVDbGllbnQpID8/ICdJREUnXG4gICAgaWYgKGlkZUNsaWVudC50eXBlID09PSAnY29ubmVjdGVkJykge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnSURFJyxcbiAgICAgICAgICB2YWx1ZTogYENvbm5lY3RlZCB0byAke2lkZU5hbWV9IGV4dGVuc2lvbmAsXG4gICAgICAgIH0sXG4gICAgICBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0lERScsXG4gICAgICAgICAgdmFsdWU6IGAke2NvbG9yKCdlcnJvcicsIHRoZW1lKShmaWd1cmVzLmNyb3NzKX0gTm90IGNvbm5lY3RlZCB0byAke2lkZU5hbWV9YCxcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gW11cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTWNwUHJvcGVydGllcyhcbiAgY2xpZW50czogTUNQU2VydmVyQ29ubmVjdGlvbltdID0gW10sXG4gIHRoZW1lOiBUaGVtZU5hbWUsXG4pOiBQcm9wZXJ0eVtdIHtcbiAgY29uc3Qgc2VydmVycyA9IGNsaWVudHMuZmlsdGVyKGNsaWVudCA9PiBjbGllbnQubmFtZSAhPT0gJ2lkZScpXG4gIGlmICghc2VydmVycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIC8vIFN1bW1hcnkgaW5zdGVhZCBvZiBhIGZ1bGwgc2VydmVyIGxpc3Qg4oCUIDIwKyBzZXJ2ZXJzIHdyYXBwZWQgb250byBtYW55XG4gIC8vIHJvd3MsIGRvbWluYXRpbmcgdGhlIFN0YXR1cyBwYW5lLiBTaG93IGNvdW50cyBieSBzdGF0ZSArIC9tY3AgaGludC5cbiAgY29uc3QgYnlTdGF0ZSA9IHsgY29ubmVjdGVkOiAwLCBwZW5kaW5nOiAwLCBuZWVkc0F1dGg6IDAsIGZhaWxlZDogMCB9XG4gIGZvciAoY29uc3QgcyBvZiBzZXJ2ZXJzKSB7XG4gICAgaWYgKHMudHlwZSA9PT0gJ2Nvbm5lY3RlZCcpIGJ5U3RhdGUuY29ubmVjdGVkKytcbiAgICBlbHNlIGlmIChzLnR5cGUgPT09ICdwZW5kaW5nJykgYnlTdGF0ZS5wZW5kaW5nKytcbiAgICBlbHNlIGlmIChzLnR5cGUgPT09ICduZWVkcy1hdXRoJykgYnlTdGF0ZS5uZWVkc0F1dGgrK1xuICAgIGVsc2UgYnlTdGF0ZS5mYWlsZWQrK1xuICB9XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGlmIChieVN0YXRlLmNvbm5lY3RlZClcbiAgICBwYXJ0cy5wdXNoKGNvbG9yKCdzdWNjZXNzJywgdGhlbWUpKGAke2J5U3RhdGUuY29ubmVjdGVkfSBjb25uZWN0ZWRgKSlcbiAgaWYgKGJ5U3RhdGUubmVlZHNBdXRoKVxuICAgIHBhcnRzLnB1c2goY29sb3IoJ3dhcm5pbmcnLCB0aGVtZSkoYCR7YnlTdGF0ZS5uZWVkc0F1dGh9IG5lZWQgYXV0aGApKVxuICBpZiAoYnlTdGF0ZS5wZW5kaW5nKVxuICAgIHBhcnRzLnB1c2goY29sb3IoJ2luYWN0aXZlJywgdGhlbWUpKGAke2J5U3RhdGUucGVuZGluZ30gcGVuZGluZ2ApKVxuICBpZiAoYnlTdGF0ZS5mYWlsZWQpXG4gICAgcGFydHMucHVzaChjb2xvcignZXJyb3InLCB0aGVtZSkoYCR7YnlTdGF0ZS5mYWlsZWR9IGZhaWxlZGApKVxuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbGFiZWw6ICdNQ1Agc2VydmVycycsXG4gICAgICB2YWx1ZTogYCR7cGFydHMuam9pbignLCAnKX0gJHtjb2xvcignaW5hY3RpdmUnLCB0aGVtZSkoJ8K3IC9tY3AnKX1gLFxuICAgIH0sXG4gIF1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkTWVtb3J5RGlhZ25vc3RpY3MoKTogUHJvbWlzZTxEaWFnbm9zdGljW10+IHtcbiAgY29uc3QgZmlsZXMgPSBhd2FpdCBnZXRNZW1vcnlGaWxlcygpXG4gIGNvbnN0IGxhcmdlRmlsZXMgPSBnZXRMYXJnZU1lbW9yeUZpbGVzKGZpbGVzKVxuXG4gIGNvbnN0IGRpYWdub3N0aWNzOiBEaWFnbm9zdGljW10gPSBbXVxuXG4gIGxhcmdlRmlsZXMuZm9yRWFjaChmaWxlID0+IHtcbiAgICBjb25zdCBkaXNwbGF5UGF0aCA9IGdldERpc3BsYXlQYXRoKGZpbGUucGF0aClcbiAgICBkaWFnbm9zdGljcy5wdXNoKFxuICAgICAgYExhcmdlICR7ZGlzcGxheVBhdGh9IHdpbGwgaW1wYWN0IHBlcmZvcm1hbmNlICgke2Zvcm1hdE51bWJlcihmaWxlLmNvbnRlbnQubGVuZ3RoKX0gY2hhcnMgPiAke2Zvcm1hdE51bWJlcihNQVhfTUVNT1JZX0NIQVJBQ1RFUl9DT1VOVCl9KWAsXG4gICAgKVxuICB9KVxuXG4gIHJldHVybiBkaWFnbm9zdGljc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTZXR0aW5nU291cmNlc1Byb3BlcnRpZXMoKTogUHJvcGVydHlbXSB7XG4gIGNvbnN0IGVuYWJsZWRTb3VyY2VzID0gZ2V0RW5hYmxlZFNldHRpbmdTb3VyY2VzKClcblxuICAvLyBGaWx0ZXIgdG8gb25seSBzb3VyY2VzIHRoYXQgYWN0dWFsbHkgaGF2ZSBzZXR0aW5ncyBsb2FkZWRcbiAgY29uc3Qgc291cmNlc1dpdGhTZXR0aW5ncyA9IGVuYWJsZWRTb3VyY2VzLmZpbHRlcihzb3VyY2UgPT4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gZ2V0U2V0dGluZ3NGb3JTb3VyY2Uoc291cmNlKVxuICAgIHJldHVybiBzZXR0aW5ncyAhPT0gbnVsbCAmJiBPYmplY3Qua2V5cyhzZXR0aW5ncykubGVuZ3RoID4gMFxuICB9KVxuXG4gIC8vIE1hcCBpbnRlcm5hbCBuYW1lcyB0byB1c2VyLWZyaWVuZGx5IG5hbWVzXG4gIC8vIEZvciBwb2xpY3lTZXR0aW5ncywgZGlzdGluZ3Vpc2ggYmV0d2VlbiByZW1vdGUgYW5kIGxvY2FsIChvciBza2lwIGlmIG5laXRoZXIgZXhpc3RzKVxuICBjb25zdCBzb3VyY2VOYW1lcyA9IHNvdXJjZXNXaXRoU2V0dGluZ3NcbiAgICAubWFwKHNvdXJjZSA9PiB7XG4gICAgICBpZiAoc291cmNlID09PSAncG9saWN5U2V0dGluZ3MnKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IGdldFBvbGljeVNldHRpbmdzT3JpZ2luKClcbiAgICAgICAgaWYgKG9yaWdpbiA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBudWxsIC8vIFNraXAgLSBubyBwb2xpY3kgc2V0dGluZ3MgZXhpc3RcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKG9yaWdpbikge1xuICAgICAgICAgIGNhc2UgJ3JlbW90ZSc6XG4gICAgICAgICAgICByZXR1cm4gJ0VudGVycHJpc2UgbWFuYWdlZCBzZXR0aW5ncyAocmVtb3RlKSdcbiAgICAgICAgICBjYXNlICdwbGlzdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VudGVycHJpc2UgbWFuYWdlZCBzZXR0aW5ncyAocGxpc3QpJ1xuICAgICAgICAgIGNhc2UgJ2hrbG0nOlxuICAgICAgICAgICAgcmV0dXJuICdFbnRlcnByaXNlIG1hbmFnZWQgc2V0dGluZ3MgKEhLTE0pJ1xuICAgICAgICAgIGNhc2UgJ2ZpbGUnOiB7XG4gICAgICAgICAgICBjb25zdCB7IGhhc0Jhc2UsIGhhc0Ryb3BJbnMgfSA9IGdldE1hbmFnZWRGaWxlU2V0dGluZ3NQcmVzZW5jZSgpXG4gICAgICAgICAgICBpZiAoaGFzQmFzZSAmJiBoYXNEcm9wSW5zKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnRW50ZXJwcmlzZSBtYW5hZ2VkIHNldHRpbmdzIChmaWxlICsgZHJvcC1pbnMpJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0Ryb3BJbnMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdFbnRlcnByaXNlIG1hbmFnZWQgc2V0dGluZ3MgKGRyb3AtaW5zKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnRW50ZXJwcmlzZSBtYW5hZ2VkIHNldHRpbmdzIChmaWxlKSdcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAnaGtjdSc6XG4gICAgICAgICAgICByZXR1cm4gJ0VudGVycHJpc2UgbWFuYWdlZCBzZXR0aW5ncyAoSEtDVSknXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBnZXRTZXR0aW5nU291cmNlRGlzcGxheU5hbWVDYXBpdGFsaXplZChzb3VyY2UpXG4gICAgfSlcbiAgICAuZmlsdGVyKChuYW1lKTogbmFtZSBpcyBzdHJpbmcgPT4gbmFtZSAhPT0gbnVsbClcblxuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGxhYmVsOiAnU2V0dGluZyBzb3VyY2VzJyxcbiAgICAgIHZhbHVlOiBzb3VyY2VOYW1lcyxcbiAgICB9LFxuICBdXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZEluc3RhbGxhdGlvbkRpYWdub3N0aWNzKCk6IFByb21pc2U8RGlhZ25vc3RpY1tdPiB7XG4gIGNvbnN0IGluc3RhbGxXYXJuaW5ncyA9IGF3YWl0IGNoZWNrSW5zdGFsbCgpXG4gIHJldHVybiBpbnN0YWxsV2FybmluZ3MubWFwKHdhcm5pbmcgPT4gd2FybmluZy5tZXNzYWdlKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRJbnN0YWxsYXRpb25IZWFsdGhEaWFnbm9zdGljcygpOiBQcm9taXNlPFxuICBEaWFnbm9zdGljW11cbj4ge1xuICBjb25zdCBkaWFnbm9zdGljID0gYXdhaXQgZ2V0RG9jdG9yRGlhZ25vc3RpYygpXG4gIGNvbnN0IGl0ZW1zOiBEaWFnbm9zdGljW10gPSBbXVxuXG4gIGNvbnN0IHsgZXJyb3JzOiB2YWxpZGF0aW9uRXJyb3JzIH0gPSBnZXRTZXR0aW5nc1dpdGhBbGxFcnJvcnMoKVxuICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgaW52YWxpZEZpbGVzID0gQXJyYXkuZnJvbShcbiAgICAgIG5ldyBTZXQodmFsaWRhdGlvbkVycm9ycy5tYXAoZXJyb3IgPT4gZXJyb3IuZmlsZSkpLFxuICAgIClcbiAgICBjb25zdCBmaWxlTGlzdCA9IGludmFsaWRGaWxlcy5qb2luKCcsICcpXG5cbiAgICBpdGVtcy5wdXNoKFxuICAgICAgYEZvdW5kIGludmFsaWQgc2V0dGluZ3MgZmlsZXM6ICR7ZmlsZUxpc3R9LiBUaGV5IHdpbGwgYmUgaWdub3JlZC5gLFxuICAgIClcbiAgfVxuXG4gIC8vIEFkZCB3YXJuaW5ncyBmcm9tIGRvY3RvciBkaWFnbm9zdGljIChpbmNsdWRlcyBsZWZ0b3ZlciBpbnN0YWxsYXRpb25zLCBjb25maWcgbWlzbWF0Y2hlcywgZXRjLilcbiAgZGlhZ25vc3RpYy53YXJuaW5ncy5mb3JFYWNoKHdhcm5pbmcgPT4ge1xuICAgIGl0ZW1zLnB1c2god2FybmluZy5pc3N1ZSlcbiAgfSlcblxuICBpZiAoZGlhZ25vc3RpYy5oYXNVcGRhdGVQZXJtaXNzaW9ucyA9PT0gZmFsc2UpIHtcbiAgICBpdGVtcy5wdXNoKCdObyB3cml0ZSBwZXJtaXNzaW9ucyBmb3IgYXV0by11cGRhdGVzIChyZXF1aXJlcyBzdWRvKScpXG4gIH1cblxuICByZXR1cm4gaXRlbXNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQWNjb3VudFByb3BlcnRpZXMoKTogUHJvcGVydHlbXSB7XG4gIGNvbnN0IGFjY291bnRJbmZvID0gZ2V0QWNjb3VudEluZm9ybWF0aW9uKClcbiAgaWYgKCFhY2NvdW50SW5mbykge1xuICAgIHJldHVybiBbXVxuICB9XG5cbiAgY29uc3QgcHJvcGVydGllczogUHJvcGVydHlbXSA9IFtdXG5cbiAgaWYgKGFjY291bnRJbmZvLnN1YnNjcmlwdGlvbikge1xuICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICBsYWJlbDogJ0xvZ2luIG1ldGhvZCcsXG4gICAgICB2YWx1ZTogYCR7YWNjb3VudEluZm8uc3Vic2NyaXB0aW9ufSBBY2NvdW50YCxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGFjY291bnRJbmZvLnRva2VuU291cmNlKSB7XG4gICAgcHJvcGVydGllcy5wdXNoKHtcbiAgICAgIGxhYmVsOiAnQXV0aCB0b2tlbicsXG4gICAgICB2YWx1ZTogYWNjb3VudEluZm8udG9rZW5Tb3VyY2UsXG4gICAgfSlcbiAgfVxuXG4gIGlmIChhY2NvdW50SW5mby5hcGlLZXlTb3VyY2UpIHtcbiAgICBwcm9wZXJ0aWVzLnB1c2goe1xuICAgICAgbGFiZWw6ICdBUEkga2V5JyxcbiAgICAgIHZhbHVlOiBhY2NvdW50SW5mby5hcGlLZXlTb3VyY2UsXG4gICAgfSlcbiAgfVxuXG4gIC8vIEhpZGUgc2Vuc2l0aXZlIGFjY291bnQgaW5mbyBpbiBkZW1vIG1vZGVcbiAgaWYgKGFjY291bnRJbmZvLm9yZ2FuaXphdGlvbiAmJiAhcHJvY2Vzcy5lbnYuSVNfREVNTykge1xuICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICBsYWJlbDogJ09yZ2FuaXphdGlvbicsXG4gICAgICB2YWx1ZTogYWNjb3VudEluZm8ub3JnYW5pemF0aW9uLFxuICAgIH0pXG4gIH1cbiAgaWYgKGFjY291bnRJbmZvLmVtYWlsICYmICFwcm9jZXNzLmVudi5JU19ERU1PKSB7XG4gICAgcHJvcGVydGllcy5wdXNoKHtcbiAgICAgIGxhYmVsOiAnRW1haWwnLFxuICAgICAgdmFsdWU6IGFjY291bnRJbmZvLmVtYWlsLFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gcHJvcGVydGllc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBUElQcm92aWRlclByb3BlcnRpZXMoKTogUHJvcGVydHlbXSB7XG4gIGNvbnN0IGFwaVByb3ZpZGVyID0gZ2V0QVBJUHJvdmlkZXIoKVxuXG4gIGNvbnN0IHByb3BlcnRpZXM6IFByb3BlcnR5W10gPSBbXVxuXG4gIGlmIChhcGlQcm92aWRlciAhPT0gJ2ZpcnN0UGFydHknKSB7XG4gICAgY29uc3QgcHJvdmlkZXJMYWJlbCA9IHtcbiAgICAgIGJlZHJvY2s6ICdBV1MgQmVkcm9jaycsXG4gICAgICB2ZXJ0ZXg6ICdHb29nbGUgVmVydGV4IEFJJyxcbiAgICAgIGZvdW5kcnk6ICdNaWNyb3NvZnQgRm91bmRyeScsXG4gICAgfVthcGlQcm92aWRlcl1cblxuICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICBsYWJlbDogJ0FQSSBwcm92aWRlcicsXG4gICAgICB2YWx1ZTogcHJvdmlkZXJMYWJlbCxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGFwaVByb3ZpZGVyID09PSAnZmlyc3RQYXJ0eScpIHtcbiAgICBjb25zdCBhbnRocm9waWNCYXNlVXJsID0gcHJvY2Vzcy5lbnYuQU5USFJPUElDX0JBU0VfVVJMXG4gICAgaWYgKGFudGhyb3BpY0Jhc2VVcmwpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICAgIGxhYmVsOiAnQW50aHJvcGljIGJhc2UgVVJMJyxcbiAgICAgICAgdmFsdWU6IGFudGhyb3BpY0Jhc2VVcmwsXG4gICAgICB9KVxuICAgIH1cbiAgfSBlbHNlIGlmIChhcGlQcm92aWRlciA9PT0gJ2JlZHJvY2snKSB7XG4gICAgY29uc3QgYmVkcm9ja0Jhc2VVcmwgPSBwcm9jZXNzLmVudi5CRURST0NLX0JBU0VfVVJMXG4gICAgaWYgKGJlZHJvY2tCYXNlVXJsKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2goe1xuICAgICAgICBsYWJlbDogJ0JlZHJvY2sgYmFzZSBVUkwnLFxuICAgICAgICB2YWx1ZTogYmVkcm9ja0Jhc2VVcmwsXG4gICAgICB9KVxuICAgIH1cblxuICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICBsYWJlbDogJ0FXUyByZWdpb24nLFxuICAgICAgdmFsdWU6IGdldEFXU1JlZ2lvbigpLFxuICAgIH0pXG5cbiAgICBpZiAoaXNFbnZUcnV0aHkocHJvY2Vzcy5lbnYuQ0xBVURFX0NPREVfU0tJUF9CRURST0NLX0FVVEgpKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2goe1xuICAgICAgICB2YWx1ZTogJ0FXUyBhdXRoIHNraXBwZWQnLFxuICAgICAgfSlcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXBpUHJvdmlkZXIgPT09ICd2ZXJ0ZXgnKSB7XG4gICAgY29uc3QgdmVydGV4QmFzZVVybCA9IHByb2Nlc3MuZW52LlZFUlRFWF9CQVNFX1VSTFxuICAgIGlmICh2ZXJ0ZXhCYXNlVXJsKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2goe1xuICAgICAgICBsYWJlbDogJ1ZlcnRleCBiYXNlIFVSTCcsXG4gICAgICAgIHZhbHVlOiB2ZXJ0ZXhCYXNlVXJsLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBnY3BQcm9qZWN0ID0gcHJvY2Vzcy5lbnYuQU5USFJPUElDX1ZFUlRFWF9QUk9KRUNUX0lEXG4gICAgaWYgKGdjcFByb2plY3QpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICAgIGxhYmVsOiAnR0NQIHByb2plY3QnLFxuICAgICAgICB2YWx1ZTogZ2NwUHJvamVjdCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcHJvcGVydGllcy5wdXNoKHtcbiAgICAgIGxhYmVsOiAnRGVmYXVsdCByZWdpb24nLFxuICAgICAgdmFsdWU6IGdldERlZmF1bHRWZXJ0ZXhSZWdpb24oKSxcbiAgICB9KVxuXG4gICAgaWYgKGlzRW52VHJ1dGh5KHByb2Nlc3MuZW52LkNMQVVERV9DT0RFX1NLSVBfVkVSVEVYX0FVVEgpKSB7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2goe1xuICAgICAgICB2YWx1ZTogJ0dDUCBhdXRoIHNraXBwZWQnLFxuICAgICAgfSlcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXBpUHJvdmlkZXIgPT09ICdmb3VuZHJ5Jykge1xuICAgIGNvbnN0IGZvdW5kcnlCYXNlVXJsID0gcHJvY2Vzcy5lbnYuQU5USFJPUElDX0ZPVU5EUllfQkFTRV9VUkxcbiAgICBpZiAoZm91bmRyeUJhc2VVcmwpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICAgIGxhYmVsOiAnTWljcm9zb2Z0IEZvdW5kcnkgYmFzZSBVUkwnLFxuICAgICAgICB2YWx1ZTogZm91bmRyeUJhc2VVcmwsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGZvdW5kcnlSZXNvdXJjZSA9IHByb2Nlc3MuZW52LkFOVEhST1BJQ19GT1VORFJZX1JFU09VUkNFXG4gICAgaWYgKGZvdW5kcnlSZXNvdXJjZSkge1xuICAgICAgcHJvcGVydGllcy5wdXNoKHtcbiAgICAgICAgbGFiZWw6ICdNaWNyb3NvZnQgRm91bmRyeSByZXNvdXJjZScsXG4gICAgICAgIHZhbHVlOiBmb3VuZHJ5UmVzb3VyY2UsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChpc0VudlRydXRoeShwcm9jZXNzLmVudi5DTEFVREVfQ09ERV9TS0lQX0ZPVU5EUllfQVVUSCkpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICAgIHZhbHVlOiAnTWljcm9zb2Z0IEZvdW5kcnkgYXV0aCBza2lwcGVkJyxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcHJveHlVcmwgPSBnZXRQcm94eVVybCgpXG4gIGlmIChwcm94eVVybCkge1xuICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICBsYWJlbDogJ1Byb3h5JyxcbiAgICAgIHZhbHVlOiBwcm94eVVybCxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgbXRsc0NvbmZpZyA9IGdldE1UTFNDb25maWcoKVxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FWFRSQV9DQV9DRVJUUykge1xuICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICBsYWJlbDogJ0FkZGl0aW9uYWwgQ0EgY2VydChzKScsXG4gICAgICB2YWx1ZTogcHJvY2Vzcy5lbnYuTk9ERV9FWFRSQV9DQV9DRVJUUyxcbiAgICB9KVxuICB9XG4gIGlmIChtdGxzQ29uZmlnKSB7XG4gICAgaWYgKG10bHNDb25maWcuY2VydCAmJiBwcm9jZXNzLmVudi5DTEFVREVfQ09ERV9DTElFTlRfQ0VSVCkge1xuICAgICAgcHJvcGVydGllcy5wdXNoKHtcbiAgICAgICAgbGFiZWw6ICdtVExTIGNsaWVudCBjZXJ0JyxcbiAgICAgICAgdmFsdWU6IHByb2Nlc3MuZW52LkNMQVVERV9DT0RFX0NMSUVOVF9DRVJULFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAobXRsc0NvbmZpZy5rZXkgJiYgcHJvY2Vzcy5lbnYuQ0xBVURFX0NPREVfQ0xJRU5UX0tFWSkge1xuICAgICAgcHJvcGVydGllcy5wdXNoKHtcbiAgICAgICAgbGFiZWw6ICdtVExTIGNsaWVudCBrZXknLFxuICAgICAgICB2YWx1ZTogcHJvY2Vzcy5lbnYuQ0xBVURFX0NPREVfQ0xJRU5UX0tFWSxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb3BlcnRpZXNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vZGVsRGlzcGxheUxhYmVsKG1haW5Mb29wTW9kZWw6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcge1xuICBsZXQgbW9kZWxMYWJlbCA9IG1vZGVsRGlzcGxheVN0cmluZyhtYWluTG9vcE1vZGVsKVxuXG4gIGlmIChtYWluTG9vcE1vZGVsID09PSBudWxsICYmIGlzQ2xhdWRlQUlTdWJzY3JpYmVyKCkpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGdldENsYXVkZUFpVXNlckRlZmF1bHRNb2RlbERlc2NyaXB0aW9uKClcblxuICAgIG1vZGVsTGFiZWwgPSBgJHtjaGFsay5ib2xkKCdEZWZhdWx0Jyl9ICR7ZGVzY3JpcHRpb259YFxuICB9XG5cbiAgcmV0dXJuIG1vZGVsTGFiZWxcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsS0FBSyxNQUFNLE9BQU87QUFDekIsT0FBT0MsT0FBTyxNQUFNLFNBQVM7QUFDN0IsT0FBTyxLQUFLQyxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxLQUFLLEVBQUVDLElBQUksUUFBUSxXQUFXO0FBQ3ZDLGNBQWNDLG1CQUFtQixRQUFRLDBCQUEwQjtBQUNuRSxTQUFTQyxxQkFBcUIsRUFBRUMsb0JBQW9CLFFBQVEsV0FBVztBQUN2RSxTQUNFQyxtQkFBbUIsRUFDbkJDLGNBQWMsRUFDZEMsMEJBQTBCLFFBQ3JCLGVBQWU7QUFDdEIsU0FBU0MsbUJBQW1CLFFBQVEsdUJBQXVCO0FBQzNELFNBQ0VDLFlBQVks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
