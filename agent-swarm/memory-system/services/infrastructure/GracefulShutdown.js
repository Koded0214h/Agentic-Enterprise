"use strict";
/**
 * GracefulShutdown - Cleanup utilities for graceful exit
 *
 * Extracted from worker-service.ts to provide centralized shutdown coordination.
 * Handles:
 * - HTTP server closure (with Windows-specific delays)
 * - Session manager shutdown coordination
 * - Child process cleanup (Windows zombie port fix)
 */
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
exports.performGracefulShutdown = performGracefulShutdown;
var logger_js_1 = require("../../utils/logger.js");
var index_js_1 = require("../../supervisor/index.js");
/**
 * Perform graceful shutdown of all services
 *
 * IMPORTANT: On Windows, we must kill all child processes before exiting
 * to prevent zombie ports. The socket handle can be inherited by children,
 * and if not properly closed, the port stays bound after process death.
 */
function performGracefulShutdown(config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_js_1.logger.info('SYSTEM', 'Shutdown initiated');
                    if (!config.server) return [3 /*break*/, 2];
                    return [4 /*yield*/, closeHttpServer(config.server)];
                case 1:
                    _a.sent();
                    logger_js_1.logger.info('SYSTEM', 'HTTP server closed');
                    _a.label = 2;
                case 2: 
                // STEP 2: Shutdown active sessions
                return [4 /*yield*/, config.sessionManager.shutdownAll()];
                case 3:
                    // STEP 2: Shutdown active sessions
                    _a.sent();
                    if (!config.mcpClient) return [3 /*break*/, 5];
                    return [4 /*yield*/, config.mcpClient.close()];
                case 4:
                    _a.sent();
                    logger_js_1.logger.info('SYSTEM', 'MCP client closed');
                    _a.label = 5;
                case 5:
                    if (!config.chromaMcpManager) return [3 /*break*/, 7];
                    logger_js_1.logger.info('SHUTDOWN', 'Stopping Chroma MCP connection...');
                    return [4 /*yield*/, config.chromaMcpManager.stop()];
                case 6:
                    _a.sent();
                    logger_js_1.logger.info('SHUTDOWN', 'Chroma MCP connection stopped');
                    _a.label = 7;
                case 7:
                    if (!config.dbManager) return [3 /*break*/, 9];
                    return [4 /*yield*/, config.dbManager.close()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: 
                // STEP 6: Supervisor handles tracked child termination, PID cleanup, and stale sockets.
                return [4 /*yield*/, (0, index_js_1.stopSupervisor)()];
                case 10:
                    // STEP 6: Supervisor handles tracked child termination, PID cleanup, and stale sockets.
                    _a.sent();
                    logger_js_1.logger.info('SYSTEM', 'Worker shutdown complete');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Close HTTP server with Windows-specific delays
 * Windows needs extra time to release sockets properly
 */
function closeHttpServer(server) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Close all active connections
                    server.closeAllConnections();
                    if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: 
                // Close the server
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        server.close(function (err) { return err ? reject(err) : resolve(); });
                    })];
                case 3:
                    // Close the server
                    _a.sent();
                    if (!(process.platform === 'win32')) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                case 4:
                    _a.sent();
                    logger_js_1.logger.info('SYSTEM', 'Waited for Windows port cleanup');
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
