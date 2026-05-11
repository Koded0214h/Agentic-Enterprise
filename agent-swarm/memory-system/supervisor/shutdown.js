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
exports.runShutdownCascade = runShutdownCascade;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var util_1 = require("util");
var logger_js_1 = require("../utils/logger.js");
var hook_constants_js_1 = require("../shared/hook-constants.js");
var process_registry_js_1 = require("./process-registry.js");
var execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
var DATA_DIR = path_1.default.join((0, os_1.homedir)(), '.claude-mem');
var PID_FILE = path_1.default.join(DATA_DIR, 'worker.pid');
function runShutdownCascade(options) {
    return __awaiter(this, void 0, void 0, function () {
        var currentPid, pidFilePath, allRecords, childRecords, _i, childRecords_1, record, error_1, survivors, _a, survivors_1, record, error_2, _b, childRecords_2, record, _c, _d, record;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    currentPid = (_e = options.currentPid) !== null && _e !== void 0 ? _e : process.pid;
                    pidFilePath = (_f = options.pidFilePath) !== null && _f !== void 0 ? _f : PID_FILE;
                    allRecords = options.registry.getAll();
                    childRecords = __spreadArray([], allRecords, true).filter(function (record) { return record.pid !== currentPid; })
                        .sort(function (a, b) { return Date.parse(b.startedAt) - Date.parse(a.startedAt); });
                    _i = 0, childRecords_1 = childRecords;
                    _g.label = 1;
                case 1:
                    if (!(_i < childRecords_1.length)) return [3 /*break*/, 6];
                    record = childRecords_1[_i];
                    if (!(0, process_registry_js_1.isPidAlive)(record.pid)) {
                        options.registry.unregister(record.id);
                        return [3 /*break*/, 5];
                    }
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, signalProcess(record.pid, 'SIGTERM')];
                case 3:
                    _g.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _g.sent();
                    logger_js_1.logger.debug('SYSTEM', 'Failed to send SIGTERM to child process', {
                        pid: record.pid,
                        type: record.type
                    }, error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [4 /*yield*/, waitForExit(childRecords, 5000)];
                case 7:
                    _g.sent();
                    survivors = childRecords.filter(function (record) { return (0, process_registry_js_1.isPidAlive)(record.pid); });
                    _a = 0, survivors_1 = survivors;
                    _g.label = 8;
                case 8:
                    if (!(_a < survivors_1.length)) return [3 /*break*/, 13];
                    record = survivors_1[_a];
                    _g.label = 9;
                case 9:
                    _g.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, signalProcess(record.pid, 'SIGKILL')];
                case 10:
                    _g.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _g.sent();
                    logger_js_1.logger.debug('SYSTEM', 'Failed to force kill child process', {
                        pid: record.pid,
                        type: record.type
                    }, error_2);
                    return [3 /*break*/, 12];
                case 12:
                    _a++;
                    return [3 /*break*/, 8];
                case 13: return [4 /*yield*/, waitForExit(survivors, 1000)];
                case 14:
                    _g.sent();
                    for (_b = 0, childRecords_2 = childRecords; _b < childRecords_2.length; _b++) {
                        record = childRecords_2[_b];
                        options.registry.unregister(record.id);
                    }
                    for (_c = 0, _d = allRecords.filter(function (record) { return record.pid === currentPid; }); _c < _d.length; _c++) {
                        record = _d[_c];
                        options.registry.unregister(record.id);
                    }
                    try {
                        (0, fs_1.rmSync)(pidFilePath, { force: true });
                    }
                    catch (error) {
                        logger_js_1.logger.debug('SYSTEM', 'Failed to remove PID file during shutdown', { pidFilePath: pidFilePath }, error);
                    }
                    options.registry.pruneDeadEntries();
                    return [2 /*return*/];
            }
        });
    });
}
function waitForExit(records, timeoutMs) {
    return __awaiter(this, void 0, void 0, function () {
        var deadline, survivors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deadline = Date.now() + timeoutMs;
                    _a.label = 1;
                case 1:
                    if (!(Date.now() < deadline)) return [3 /*break*/, 3];
                    survivors = records.filter(function (record) { return (0, process_registry_js_1.isPidAlive)(record.pid); });
                    if (survivors.length === 0) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function signalProcess(pid, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var errno, treeKill_1, args, errno;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (signal === 'SIGTERM') {
                        try {
                            process.kill(pid, signal);
                        }
                        catch (error) {
                            errno = error.code;
                            if (errno === 'ESRCH') {
                                return [2 /*return*/];
                            }
                            throw error;
                        }
                        return [2 /*return*/];
                    }
                    if (!(process.platform === 'win32')) return [3 /*break*/, 5];
                    return [4 /*yield*/, loadTreeKill()];
                case 1:
                    treeKill_1 = _a.sent();
                    if (!treeKill_1) return [3 /*break*/, 3];
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            treeKill_1(pid, signal, function (error) {
                                if (!error) {
                                    resolve();
                                    return;
                                }
                                var errno = error.code;
                                if (errno === 'ESRCH') {
                                    resolve();
                                    return;
                                }
                                reject(error);
                            });
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
                case 3:
                    args = ['/PID', String(pid), '/T'];
                    if (signal === 'SIGKILL') {
                        args.push('/F');
                    }
                    return [4 /*yield*/, execFileAsync('taskkill', args, {
                            timeout: hook_constants_js_1.HOOK_TIMEOUTS.POWERSHELL_COMMAND,
                            windowsHide: true
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
                case 5:
                    try {
                        process.kill(pid, signal);
                    }
                    catch (error) {
                        errno = error.code;
                        if (errno === 'ESRCH') {
                            return [2 /*return*/];
                        }
                        throw error;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function loadTreeKill() {
    return __awaiter(this, void 0, void 0, function () {
        var moduleName, treeKillModule, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    moduleName = 'tree-kill';
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.resolve("".concat(moduleName)).then(function (s) { return require(s); })];
                case 2:
                    treeKillModule = _c.sent();
                    return [2 /*return*/, ((_b = treeKillModule.default) !== null && _b !== void 0 ? _b : treeKillModule)];
                case 3:
                    _a = _c.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
