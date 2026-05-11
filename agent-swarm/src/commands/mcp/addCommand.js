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
exports.registerMcpAddCommand = registerMcpAddCommand;
/**
 * MCP add CLI subcommand
 *
 * Extracted from main.tsx to enable direct testing.
 */
var extra_typings_1 = require("@commander-js/extra-typings");
var exit_js_1 = require("../../cli/exit.js");
var index_js_1 = require("../../services/analytics/index.js");
var auth_js_1 = require("../../services/mcp/auth.js");
var config_js_1 = require("../../services/mcp/config.js");
var utils_js_1 = require("../../services/mcp/utils.js");
var xaaIdpLogin_js_1 = require("../../services/mcp/xaaIdpLogin.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
/**
 * Registers the `mcp add` subcommand on the given Commander command.
 */
function registerMcpAddCommand(mcp) {
    var _this = this;
    mcp
        .command('add <name> <commandOrUrl> [args...]')
        .description('Add an MCP server to Claude Code.\n\n' +
        'Examples:\n' +
        '  # Add HTTP server:\n' +
        '  claude mcp add --transport http sentry https://mcp.sentry.dev/mcp\n\n' +
        '  # Add HTTP server with headers:\n' +
        '  claude mcp add --transport http corridor https://app.corridor.dev/api/mcp --header "Authorization: Bearer ..."\n\n' +
        '  # Add stdio server with environment variables:\n' +
        '  claude mcp add -e API_KEY=xxx my-server -- npx my-mcp-server\n\n' +
        '  # Add stdio server with subprocess flags:\n' +
        '  claude mcp add my-server -- my-command --some-flag arg1')
        .option('-s, --scope <scope>', 'Configuration scope (local, user, or project)', 'local')
        .option('-t, --transport <transport>', 'Transport type (stdio, sse, http). Defaults to stdio if not specified.')
        .option('-e, --env <env...>', 'Set environment variables (e.g. -e KEY=value)')
        .option('-H, --header <header...>', 'Set WebSocket headers (e.g. -H "X-Api-Key: abc123" -H "X-Custom: value")')
        .option('--client-id <clientId>', 'OAuth client ID for HTTP/SSE servers')
        .option('--client-secret', 'Prompt for OAuth client secret (or set MCP_CLIENT_SECRET env var)')
        .option('--callback-port <port>', 'Fixed port for OAuth callback (for servers requiring pre-registered redirect URIs)')
        .helpOption('-h, --help', 'Display help for command')
        .addOption(new extra_typings_1.Option('--xaa', "Enable XAA (SEP-990) for this server. Requires 'claude mcp xaa setup' first. Also requires --client-id and --client-secret (for the MCP server's AS).").hideHelp(!(0, xaaIdpLogin_js_1.isXaaEnabled)()))
        .action(function (name, commandOrUrl, args, options) { return __awaiter(_this, void 0, void 0, function () {
        var actualCommand, actualArgs, scope, transport, xaa, missing, transportExplicit, looksLikeUrl, headers, callbackPort, oauth, clientSecret, _a, serverConfig, headers, callbackPort, oauth, clientSecret, _b, serverConfig, env, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    actualCommand = commandOrUrl;
                    actualArgs = args;
                    // If no name is provided, error
                    if (!name) {
                        (0, exit_js_1.cliError)('Error: Server name is required.\n' +
                            'Usage: claude mcp add <name> <command> [args...]');
                    }
                    else if (!actualCommand) {
                        (0, exit_js_1.cliError)('Error: Command is required when server name is provided.\n' +
                            'Usage: claude mcp add <name> <command> [args...]');
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 14, , 15]);
                    scope = (0, utils_js_1.ensureConfigScope)(options.scope);
                    transport = (0, utils_js_1.ensureTransport)(options.transport);
                    // XAA fail-fast: validate at add-time, not auth-time.
                    if (options.xaa && !(0, xaaIdpLogin_js_1.isXaaEnabled)()) {
                        (0, exit_js_1.cliError)('Error: --xaa requires CLAUDE_CODE_ENABLE_XAA=1 in your environment');
                    }
                    xaa = Boolean(options.xaa);
                    if (xaa) {
                        missing = [];
                        if (!options.clientId)
                            missing.push('--client-id');
                        if (!options.clientSecret)
                            missing.push('--client-secret');
                        if (!(0, xaaIdpLogin_js_1.getXaaIdpSettings)()) {
                            missing.push("'claude mcp xaa setup' (settings.xaaIdp not configured)");
                        }
                        if (missing.length) {
                            (0, exit_js_1.cliError)("Error: --xaa requires: ".concat(missing.join(', ')));
                        }
                    }
                    transportExplicit = options.transport !== undefined;
                    looksLikeUrl = actualCommand.startsWith('http://') ||
                        actualCommand.startsWith('https://') ||
                        actualCommand.startsWith('localhost') ||
                        actualCommand.endsWith('/sse') ||
                        actualCommand.endsWith('/mcp');
                    (0, index_js_1.logEvent)('tengu_mcp_add', {
                        type: transport,
                        scope: scope,
                        source: 'command',
                        transport: transport,
                        transportExplicit: transportExplicit,
                        looksLikeUrl: looksLikeUrl,
                    });
                    if (!(transport === 'sse')) return [3 /*break*/, 6];
                    if (!actualCommand) {
                        (0, exit_js_1.cliError)('Error: URL is required for SSE transport.');
                    }
                    headers = options.header
                        ? (0, utils_js_1.parseHeaders)(options.header)
                        : undefined;
                    callbackPort = options.callbackPort
                        ? parseInt(options.callbackPort, 10)
                        : undefined;
                    oauth = options.clientId || callbackPort || xaa
                        ? __assign(__assign(__assign({}, (options.clientId ? { clientId: options.clientId } : {})), (callbackPort ? { callbackPort: callbackPort } : {})), (xaa ? { xaa: true } : {})) : undefined;
                    if (!(options.clientSecret && options.clientId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, auth_js_1.readClientSecret)()];
                case 2:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = undefined;
                    _c.label = 4;
                case 4:
                    clientSecret = _a;
                    serverConfig = {
                        type: 'sse',
                        url: actualCommand,
                        headers: headers,
                        oauth: oauth,
                    };
                    return [4 /*yield*/, (0, config_js_1.addMcpConfig)(name, serverConfig, scope)];
                case 5:
                    _c.sent();
                    if (clientSecret) {
                        (0, auth_js_1.saveMcpClientSecret)(name, serverConfig, clientSecret);
                    }
                    process.stdout.write("Added SSE MCP server ".concat(name, " with URL: ").concat(actualCommand, " to ").concat(scope, " config\n"));
                    if (headers) {
                        process.stdout.write("Headers: ".concat((0, slowOperations_js_1.jsonStringify)(headers, null, 2), "\n"));
                    }
                    return [3 /*break*/, 13];
                case 6:
                    if (!(transport === 'http')) return [3 /*break*/, 11];
                    if (!actualCommand) {
                        (0, exit_js_1.cliError)('Error: URL is required for HTTP transport.');
                    }
                    headers = options.header
                        ? (0, utils_js_1.parseHeaders)(options.header)
                        : undefined;
                    callbackPort = options.callbackPort
                        ? parseInt(options.callbackPort, 10)
                        : undefined;
                    oauth = options.clientId || callbackPort || xaa
                        ? __assign(__assign(__assign({}, (options.clientId ? { clientId: options.clientId } : {})), (callbackPort ? { callbackPort: callbackPort } : {})), (xaa ? { xaa: true } : {})) : undefined;
                    if (!(options.clientSecret && options.clientId)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, auth_js_1.readClientSecret)()];
                case 7:
                    _b = _c.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _b = undefined;
                    _c.label = 9;
                case 9:
                    clientSecret = _b;
                    serverConfig = {
                        type: 'http',
                        url: actualCommand,
                        headers: headers,
                        oauth: oauth,
                    };
                    return [4 /*yield*/, (0, config_js_1.addMcpConfig)(name, serverConfig, scope)];
                case 10:
                    _c.sent();
                    if (clientSecret) {
                        (0, auth_js_1.saveMcpClientSecret)(name, serverConfig, clientSecret);
                    }
                    process.stdout.write("Added HTTP MCP server ".concat(name, " with URL: ").concat(actualCommand, " to ").concat(scope, " config\n"));
                    if (headers) {
                        process.stdout.write("Headers: ".concat((0, slowOperations_js_1.jsonStringify)(headers, null, 2), "\n"));
                    }
                    return [3 /*break*/, 13];
                case 11:
                    if (options.clientId ||
                        options.clientSecret ||
                        options.callbackPort ||
                        options.xaa) {
                        process.stderr.write("Warning: --client-id, --client-secret, --callback-port, and --xaa are only supported for HTTP/SSE transports and will be ignored for stdio.\n");
                    }
                    // Warn if this looks like a URL but transport wasn't explicitly specified
                    if (!transportExplicit && looksLikeUrl) {
                        process.stderr.write("\nWarning: The command \"".concat(actualCommand, "\" looks like a URL, but is being interpreted as a stdio server as --transport was not specified.\n"));
                        process.stderr.write("If this is an HTTP server, use: claude mcp add --transport http ".concat(name, " ").concat(actualCommand, "\n"));
                        process.stderr.write("If this is an SSE server, use: claude mcp add --transport sse ".concat(name, " ").concat(actualCommand, "\n"));
                    }
                    env = (0, envUtils_js_1.parseEnvVars)(options.env);
                    return [4 /*yield*/, (0, config_js_1.addMcpConfig)(name, { type: 'stdio', command: actualCommand, args: actualArgs, env: env }, scope)];
                case 12:
                    _c.sent();
                    process.stdout.write("Added stdio MCP server ".concat(name, " with command: ").concat(actualCommand, " ").concat(actualArgs.join(' '), " to ").concat(scope, " config\n"));
                    _c.label = 13;
                case 13:
                    (0, exit_js_1.cliOk)("File modified: ".concat((0, utils_js_1.describeMcpConfigFilePath)(scope)));
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _c.sent();
                    (0, exit_js_1.cliError)(error_1.message);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    }); });
}
