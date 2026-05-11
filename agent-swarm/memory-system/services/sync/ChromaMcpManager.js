"use strict";
/**
 * ChromaMcpManager - Singleton managing a persistent MCP connection to chroma-mcp via uvx
 *
 * Replaces ChromaServerManager (which spawned `npx chroma run`) with a stdio-based
 * MCP client that communicates with chroma-mcp as a subprocess. The chroma-mcp server
 * handles its own embedding and persistent storage, eliminating the need for a separate
 * HTTP server, chromadb npm package, and ONNX/WASM embedding dependencies.
 *
 * Lifecycle: lazy-connects on first callTool() use, maintains a single persistent
 * connection per worker lifetime, and auto-reconnects if the subprocess dies.
 *
 * Cross-platform: Linux, macOS, Windows
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromaMcpManager = void 0;
var index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
var child_process_1 = require("child_process");
var path_1 = require("path");
var os_1 = require("os");
var fs_1 = require("fs");
var logger_js_1 = require("../../utils/logger.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../shared/paths.js");
var env_sanitizer_js_1 = require("../../supervisor/env-sanitizer.js");
var index_js_2 = require("../../supervisor/index.js");
var CHROMA_MCP_CLIENT_NAME = 'claude-mem-chroma';
var CHROMA_MCP_CLIENT_VERSION = '1.0.0';
var MCP_CONNECTION_TIMEOUT_MS = 30000;
var RECONNECT_BACKOFF_MS = 10000; // Don't retry connections faster than this after failure
var DEFAULT_CHROMA_DATA_DIR = path_1.default.join(os_1.default.homedir(), '.claude-mem', 'chroma');
var CHROMA_SUPERVISOR_ID = 'chroma-mcp';
var ChromaMcpManager = /** @class */ (function () {
    function ChromaMcpManager() {
        this.client = null;
        this.transport = null;
        this.connected = false;
        this.lastConnectionFailureTimestamp = 0;
        this.connecting = null;
    }
    /**
     * Get or create the singleton instance
     */
    ChromaMcpManager.getInstance = function () {
        if (!ChromaMcpManager.instance) {
            ChromaMcpManager.instance = new ChromaMcpManager();
        }
        return ChromaMcpManager.instance;
    };
    /**
     * Ensure the MCP client is connected to chroma-mcp.
     * Uses a connection lock to prevent concurrent connection attempts.
     * If the subprocess has died since the last use, reconnects transparently.
     */
    ChromaMcpManager.prototype.ensureConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            var timeSinceLastFailure, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.connected && this.client) {
                            return [2 /*return*/];
                        }
                        timeSinceLastFailure = Date.now() - this.lastConnectionFailureTimestamp;
                        if (this.lastConnectionFailureTimestamp > 0 && timeSinceLastFailure < RECONNECT_BACKOFF_MS) {
                            throw new Error("chroma-mcp connection in backoff (".concat(Math.ceil((RECONNECT_BACKOFF_MS - timeSinceLastFailure) / 1000), "s remaining)"));
                        }
                        if (!this.connecting) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connecting];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        this.connecting = this.connectInternal();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, 6, 7]);
                        return [4 /*yield*/, this.connecting];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        error_1 = _a.sent();
                        this.lastConnectionFailureTimestamp = Date.now();
                        throw error_1;
                    case 6:
                        this.connecting = null;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Internal connection logic - spawns uvx chroma-mcp and performs MCP handshake.
     * Called behind the connection lock to ensure only one connection attempt at a time.
     */
    ChromaMcpManager.prototype.connectInternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, commandArgs, spawnEnvironment, isWindows, uvxSpawnCommand, uvxSpawnArgs, mcpConnectionPromise, timeoutId, timeoutPromise, connectionError_1, _c, _d, currentTransport;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.transport) return [3 /*break*/, 4];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.transport.close()];
                    case 2:
                        _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _e.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!this.client) return [3 /*break*/, 8];
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.client.close()];
                    case 6:
                        _e.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = _e.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        this.client = null;
                        this.transport = null;
                        this.connected = false;
                        commandArgs = this.buildCommandArgs();
                        spawnEnvironment = this.getSpawnEnv();
                        (0, index_js_2.getSupervisor)().assertCanSpawn('chroma mcp');
                        isWindows = process.platform === 'win32';
                        uvxSpawnCommand = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'uvx';
                        uvxSpawnArgs = isWindows ? __spreadArray(['/c', 'uvx'], commandArgs, true) : commandArgs;
                        logger_js_1.logger.info('CHROMA_MCP', 'Connecting to chroma-mcp via MCP stdio', {
                            command: uvxSpawnCommand,
                            args: uvxSpawnArgs.join(' ')
                        });
                        this.transport = new stdio_js_1.StdioClientTransport({
                            command: uvxSpawnCommand,
                            args: uvxSpawnArgs,
                            env: spawnEnvironment,
                            stderr: 'pipe'
                        });
                        this.client = new index_js_1.Client({ name: CHROMA_MCP_CLIENT_NAME, version: CHROMA_MCP_CLIENT_VERSION }, { capabilities: {} });
                        mcpConnectionPromise = this.client.connect(this.transport);
                        timeoutPromise = new Promise(function (_, reject) {
                            timeoutId = setTimeout(function () { return reject(new Error("MCP connection to chroma-mcp timed out after ".concat(MCP_CONNECTION_TIMEOUT_MS, "ms"))); }, MCP_CONNECTION_TIMEOUT_MS);
                        });
                        _e.label = 9;
                    case 9:
                        _e.trys.push([9, 11, , 19]);
                        return [4 /*yield*/, Promise.race([mcpConnectionPromise, timeoutPromise])];
                    case 10:
                        _e.sent();
                        return [3 /*break*/, 19];
                    case 11:
                        connectionError_1 = _e.sent();
                        // Connection failed or timed out - kill the subprocess to prevent zombies
                        clearTimeout(timeoutId);
                        logger_js_1.logger.warn('CHROMA_MCP', 'Connection failed, killing subprocess to prevent zombie', {
                            error: connectionError_1 instanceof Error ? connectionError_1.message : String(connectionError_1)
                        });
                        _e.label = 12;
                    case 12:
                        _e.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this.transport.close()];
                    case 13:
                        _e.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        _c = _e.sent();
                        return [3 /*break*/, 15];
                    case 15:
                        _e.trys.push([15, 17, , 18]);
                        return [4 /*yield*/, this.client.close()];
                    case 16:
                        _e.sent();
                        return [3 /*break*/, 18];
                    case 17:
                        _d = _e.sent();
                        return [3 /*break*/, 18];
                    case 18:
                        this.client = null;
                        this.transport = null;
                        this.connected = false;
                        throw connectionError_1;
                    case 19:
                        clearTimeout(timeoutId);
                        this.connected = true;
                        this.registerManagedProcess();
                        logger_js_1.logger.info('CHROMA_MCP', 'Connected to chroma-mcp successfully');
                        currentTransport = this.transport;
                        this.transport.onclose = function () {
                            if (_this.transport !== currentTransport) {
                                logger_js_1.logger.debug('CHROMA_MCP', 'Ignoring stale onclose from previous transport');
                                return;
                            }
                            logger_js_1.logger.warn('CHROMA_MCP', 'chroma-mcp subprocess closed unexpectedly, applying reconnect backoff');
                            _this.connected = false;
                            (0, index_js_2.getSupervisor)().unregisterProcess(CHROMA_SUPERVISOR_ID);
                            _this.client = null;
                            _this.transport = null;
                            _this.lastConnectionFailureTimestamp = Date.now();
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build the uvx command arguments based on current settings.
     * In local mode: uses persistent client with local data directory.
     * In remote mode: uses http client with configured host/port/auth.
     */
    ChromaMcpManager.prototype.buildCommandArgs = function () {
        var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
        var chromaMode = settings.CLAUDE_MEM_CHROMA_MODE || 'local';
        var pythonVersion = process.env.CLAUDE_MEM_PYTHON_VERSION || settings.CLAUDE_MEM_PYTHON_VERSION || '3.13';
        if (chromaMode === 'remote') {
            var chromaHost = settings.CLAUDE_MEM_CHROMA_HOST || '127.0.0.1';
            var chromaPort = settings.CLAUDE_MEM_CHROMA_PORT || '8000';
            var chromaSsl = settings.CLAUDE_MEM_CHROMA_SSL === 'true';
            var chromaTenant = settings.CLAUDE_MEM_CHROMA_TENANT || 'default_tenant';
            var chromaDatabase = settings.CLAUDE_MEM_CHROMA_DATABASE || 'default_database';
            var chromaApiKey = settings.CLAUDE_MEM_CHROMA_API_KEY || '';
            var args = [
                '--python', pythonVersion,
                'chroma-mcp',
                '--client-type', 'http',
                '--host', chromaHost,
                '--port', chromaPort
            ];
            args.push('--ssl', chromaSsl ? 'true' : 'false');
            if (chromaTenant !== 'default_tenant') {
                args.push('--tenant', chromaTenant);
            }
            if (chromaDatabase !== 'default_database') {
                args.push('--database', chromaDatabase);
            }
            if (chromaApiKey) {
                args.push('--api-key', chromaApiKey);
            }
            return args;
        }
        // Local mode: persistent client with data directory
        return [
            '--python', pythonVersion,
            'chroma-mcp',
            '--client-type', 'persistent',
            '--data-dir', DEFAULT_CHROMA_DATA_DIR.replace(/\\/g, '/')
        ];
    };
    /**
     * Call a chroma-mcp tool by name with the given arguments.
     * Lazily connects on first call. Reconnects if the subprocess has died.
     *
     * @param toolName - The chroma-mcp tool name (e.g. 'chroma_query_documents')
     * @param toolArguments - The tool arguments as a plain object
     * @returns The parsed JSON result from the tool's text output
     */
    ChromaMcpManager.prototype.callTool = function (toolName, toolArguments) {
        return __awaiter(this, void 0, void 0, function () {
            var result, transportError_1, retryError_1, errorText, contentArray, firstTextContent;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.ensureConnected()];
                    case 1:
                        _c.sent();
                        logger_js_1.logger.debug('CHROMA_MCP', "Calling tool: ".concat(toolName), {
                            arguments: JSON.stringify(toolArguments).slice(0, 200)
                        });
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, this.client.callTool({
                                name: toolName,
                                arguments: toolArguments
                            })];
                    case 3:
                        result = _c.sent();
                        return [3 /*break*/, 10];
                    case 4:
                        transportError_1 = _c.sent();
                        // Transport error: chroma-mcp subprocess likely died (e.g., killed by orphan reaper,
                        // HNSW index corruption). Mark connection dead and retry once after reconnect (#1131).
                        // Without this retry, callers see a one-shot error even though reconnect would succeed.
                        this.connected = false;
                        this.client = null;
                        this.transport = null;
                        logger_js_1.logger.warn('CHROMA_MCP', "Transport error during \"".concat(toolName, "\", reconnecting and retrying once"), {
                            error: transportError_1 instanceof Error ? transportError_1.message : String(transportError_1)
                        });
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, this.ensureConnected()];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, this.client.callTool({
                                name: toolName,
                                arguments: toolArguments
                            })];
                    case 7:
                        result = _c.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        retryError_1 = _c.sent();
                        this.connected = false;
                        throw new Error("chroma-mcp transport error during \"".concat(toolName, "\" (retry failed): ").concat(retryError_1 instanceof Error ? retryError_1.message : String(retryError_1)));
                    case 9: return [3 /*break*/, 10];
                    case 10:
                        // MCP tools signal errors via isError flag on the CallToolResult
                        if (result.isError) {
                            errorText = ((_b = (_a = result.content) === null || _a === void 0 ? void 0 : _a.find(function (item) { return item.type === 'text'; })) === null || _b === void 0 ? void 0 : _b.text) || 'Unknown chroma-mcp error';
                            throw new Error("chroma-mcp tool \"".concat(toolName, "\" returned error: ").concat(errorText));
                        }
                        contentArray = result.content;
                        if (!contentArray || contentArray.length === 0) {
                            return [2 /*return*/, null];
                        }
                        firstTextContent = contentArray.find(function (item) { return item.type === 'text' && item.text; });
                        if (!firstTextContent || !firstTextContent.text) {
                            return [2 /*return*/, null];
                        }
                        // chroma-mcp returns JSON for query/get results, but plain text for
                        // mutating operations (e.g. "Successfully created collection ...").
                        // Try JSON parse first; if it fails, return the raw text for non-error responses.
                        try {
                            return [2 /*return*/, JSON.parse(firstTextContent.text)];
                        }
                        catch (_d) {
                            // Plain text response (e.g. "Successfully created collection cm__foo")
                            // Return null for void-like success messages, callers don't need the text
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if the MCP connection is alive by calling chroma_list_collections.
     * Returns true if the connection is healthy, false otherwise.
     */
    ChromaMcpManager.prototype.isHealthy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.callTool('chroma_list_collections', { limit: 1 })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gracefully stop the MCP connection and kill the chroma-mcp subprocess.
     * client.close() sends stdin close -> SIGTERM -> SIGKILL to the subprocess.
     */
    ChromaMcpManager.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.client) {
                            logger_js_1.logger.debug('CHROMA_MCP', 'No active MCP connection to stop');
                            return [2 /*return*/];
                        }
                        logger_js_1.logger.info('CHROMA_MCP', 'Stopping chroma-mcp MCP connection');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.close()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        logger_js_1.logger.debug('CHROMA_MCP', 'Error during client close (subprocess may already be dead)', {}, error_2);
                        return [3 /*break*/, 4];
                    case 4:
                        (0, index_js_2.getSupervisor)().unregisterProcess(CHROMA_SUPERVISOR_ID);
                        this.client = null;
                        this.transport = null;
                        this.connected = false;
                        this.connecting = null;
                        logger_js_1.logger.info('CHROMA_MCP', 'chroma-mcp MCP connection stopped');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset the singleton instance (for testing).
     * Awaits stop() to prevent dual subprocesses.
     */
    ChromaMcpManager.reset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!ChromaMcpManager.instance) return [3 /*break*/, 2];
                        return [4 /*yield*/, ChromaMcpManager.instance.stop()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        ChromaMcpManager.instance = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get or create a combined SSL certificate bundle for Zscaler/corporate proxy environments.
     * On macOS, combines the Python certifi CA bundle with any Zscaler certificates from
     * the system keychain. Caches the result for 24 hours at ~/.claude-mem/combined_certs.pem.
     *
     * Returns the path to the combined cert file, or undefined if not needed/available.
     */
    ChromaMcpManager.prototype.getCombinedCertPath = function () {
        var combinedCertPath = path_1.default.join(os_1.default.homedir(), '.claude-mem', 'combined_certs.pem');
        if (fs_1.default.existsSync(combinedCertPath)) {
            var stats = fs_1.default.statSync(combinedCertPath);
            var ageMs = Date.now() - stats.mtimeMs;
            if (ageMs < 24 * 60 * 60 * 1000) {
                return combinedCertPath;
            }
        }
        if (process.platform !== 'darwin') {
            return undefined;
        }
        try {
            var certifiPath = void 0;
            try {
                certifiPath = (0, child_process_1.execSync)('uvx --with certifi python -c "import certifi; print(certifi.where())"', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 10000 }).trim();
            }
            catch (_a) {
                return undefined;
            }
            if (!certifiPath || !fs_1.default.existsSync(certifiPath)) {
                return undefined;
            }
            var zscalerCert = '';
            try {
                zscalerCert = (0, child_process_1.execSync)('security find-certificate -a -c "Zscaler" -p /Library/Keychains/System.keychain', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 5000 });
            }
            catch (_b) {
                return undefined;
            }
            if (!zscalerCert ||
                !zscalerCert.includes('-----BEGIN CERTIFICATE-----') ||
                !zscalerCert.includes('-----END CERTIFICATE-----')) {
                return undefined;
            }
            var certifiContent = fs_1.default.readFileSync(certifiPath, 'utf8');
            var tempPath = combinedCertPath + '.tmp';
            fs_1.default.writeFileSync(tempPath, certifiContent + '\n' + zscalerCert);
            fs_1.default.renameSync(tempPath, combinedCertPath);
            logger_js_1.logger.info('CHROMA_MCP', 'Created combined SSL certificate bundle for Zscaler', {
                path: combinedCertPath
            });
            return combinedCertPath;
        }
        catch (error) {
            logger_js_1.logger.debug('CHROMA_MCP', 'Could not create combined cert bundle', {}, error);
            return undefined;
        }
    };
    /**
     * Build subprocess environment with SSL certificate overrides for enterprise proxy compatibility.
     * If a combined cert bundle exists (Zscaler), injects SSL_CERT_FILE, REQUESTS_CA_BUNDLE, etc.
     * Otherwise returns a plain string-keyed copy of process.env.
     */
    ChromaMcpManager.prototype.getSpawnEnv = function () {
        var baseEnv = {};
        for (var _i = 0, _a = Object.entries((0, env_sanitizer_js_1.sanitizeEnv)(process.env)); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (value !== undefined) {
                baseEnv[key] = value;
            }
        }
        var combinedCertPath = this.getCombinedCertPath();
        if (!combinedCertPath) {
            return baseEnv;
        }
        logger_js_1.logger.info('CHROMA_MCP', 'Using combined SSL certificates for enterprise compatibility', {
            certPath: combinedCertPath
        });
        return __assign(__assign({}, baseEnv), { SSL_CERT_FILE: combinedCertPath, REQUESTS_CA_BUNDLE: combinedCertPath, CURL_CA_BUNDLE: combinedCertPath, NODE_EXTRA_CA_CERTS: combinedCertPath });
    };
    ChromaMcpManager.prototype.registerManagedProcess = function () {
        var chromaProcess = this.transport._process;
        if (!(chromaProcess === null || chromaProcess === void 0 ? void 0 : chromaProcess.pid)) {
            return;
        }
        (0, index_js_2.getSupervisor)().registerProcess(CHROMA_SUPERVISOR_ID, {
            pid: chromaProcess.pid,
            type: 'chroma',
            startedAt: new Date().toISOString()
        }, chromaProcess);
        chromaProcess.once('exit', function () {
            (0, index_js_2.getSupervisor)().unregisterProcess(CHROMA_SUPERVISOR_ID);
        });
    };
    ChromaMcpManager.instance = null;
    return ChromaMcpManager;
}());
exports.ChromaMcpManager = ChromaMcpManager;
