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
exports.getClaudeDesktopConfigPath = getClaudeDesktopConfigPath;
exports.readClaudeDesktopMcpServers = readClaudeDesktopMcpServers;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var types_js_1 = require("../services/mcp/types.js");
var errors_js_1 = require("./errors.js");
var json_js_1 = require("./json.js");
var log_js_1 = require("./log.js");
var platform_js_1 = require("./platform.js");
function getClaudeDesktopConfigPath() {
    return __awaiter(this, void 0, void 0, function () {
        var platform, windowsHome, wslPath, configPath, _a, usersDir, userDirs, _i, userDirs_1, user, potentialConfigPath, _b, _c, dirError_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    platform = (0, platform_js_1.getPlatform)();
                    if (!platform_js_1.SUPPORTED_PLATFORMS.includes(platform)) {
                        throw new Error("Unsupported platform: ".concat(platform, " - Claude Desktop integration only works on macOS and WSL."));
                    }
                    if (platform === 'macos') {
                        return [2 /*return*/, (0, path_1.join)((0, os_1.homedir)(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')];
                    }
                    windowsHome = process.env.USERPROFILE
                        ? process.env.USERPROFILE.replace(/\\/g, '/') // Convert Windows backslashes to forward slashes
                        : null;
                    if (!windowsHome) return [3 /*break*/, 4];
                    wslPath = windowsHome.replace(/^[A-Z]:/, '');
                    configPath = "/mnt/c".concat(wslPath, "/AppData/Roaming/Claude/claude_desktop_config.json");
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(configPath)];
                case 2:
                    _d.sent();
                    return [2 /*return*/, configPath];
                case 3:
                    _a = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    _d.trys.push([4, 15, , 16]);
                    usersDir = '/mnt/c/Users';
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 13, , 14]);
                    return [4 /*yield*/, (0, promises_1.readdir)(usersDir, { withFileTypes: true })
                        // Look for Claude Desktop config in each user directory
                    ];
                case 6:
                    userDirs = _d.sent();
                    _i = 0, userDirs_1 = userDirs;
                    _d.label = 7;
                case 7:
                    if (!(_i < userDirs_1.length)) return [3 /*break*/, 12];
                    user = userDirs_1[_i];
                    if (user.name === 'Public' ||
                        user.name === 'Default' ||
                        user.name === 'Default User' ||
                        user.name === 'All Users') {
                        return [3 /*break*/, 11]; // Skip system directories
                    }
                    potentialConfigPath = (0, path_1.join)(usersDir, user.name, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, (0, promises_1.stat)(potentialConfigPath)];
                case 9:
                    _d.sent();
                    return [2 /*return*/, potentialConfigPath];
                case 10:
                    _b = _d.sent();
                    return [3 /*break*/, 11];
                case 11:
                    _i++;
                    return [3 /*break*/, 7];
                case 12: return [3 /*break*/, 14];
                case 13:
                    _c = _d.sent();
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 16];
                case 15:
                    dirError_1 = _d.sent();
                    (0, log_js_1.logError)(dirError_1);
                    return [3 /*break*/, 16];
                case 16: throw new Error('Could not find Claude Desktop config file in Windows. Make sure Claude Desktop is installed on Windows.');
            }
        });
    });
}
function readClaudeDesktopMcpServers() {
    return __awaiter(this, void 0, void 0, function () {
        var configPath, configContent, e_1, code, config, mcpServers, servers, _i, _a, _b, name_1, serverConfig, result, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!platform_js_1.SUPPORTED_PLATFORMS.includes((0, platform_js_1.getPlatform)())) {
                        throw new Error('Unsupported platform - Claude Desktop integration only works on macOS and WSL.');
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, getClaudeDesktopConfigPath()];
                case 2:
                    configPath = _c.sent();
                    configContent = void 0;
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.readFile)(configPath, { encoding: 'utf8' })];
                case 4:
                    configContent = _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _c.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, {}];
                    }
                    throw e_1;
                case 6:
                    config = (0, json_js_1.safeParseJSON)(configContent);
                    if (!config || typeof config !== 'object') {
                        return [2 /*return*/, {}];
                    }
                    mcpServers = config.mcpServers;
                    if (!mcpServers || typeof mcpServers !== 'object') {
                        return [2 /*return*/, {}];
                    }
                    servers = {};
                    for (_i = 0, _a = Object.entries(mcpServers); _i < _a.length; _i++) {
                        _b = _a[_i], name_1 = _b[0], serverConfig = _b[1];
                        if (!serverConfig || typeof serverConfig !== 'object') {
                            continue;
                        }
                        result = (0, types_js_1.McpStdioServerConfigSchema)().safeParse(serverConfig);
                        if (result.success) {
                            servers[name_1] = result.data;
                        }
                    }
                    return [2 /*return*/, servers];
                case 7:
                    error_1 = _c.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, {}];
                case 8: return [2 /*return*/];
            }
        });
    });
}
