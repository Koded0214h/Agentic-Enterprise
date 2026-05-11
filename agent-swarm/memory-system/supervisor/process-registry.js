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
exports.ProcessRegistry = void 0;
exports.isPidAlive = isPidAlive;
exports.getProcessRegistry = getProcessRegistry;
exports.createProcessRegistry = createProcessRegistry;
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var logger_js_1 = require("../utils/logger.js");
var REAP_SESSION_SIGTERM_TIMEOUT_MS = 5000;
var REAP_SESSION_SIGKILL_TIMEOUT_MS = 1000;
var DATA_DIR = path_1.default.join((0, os_1.homedir)(), '.claude-mem');
var DEFAULT_REGISTRY_PATH = path_1.default.join(DATA_DIR, 'supervisor.json');
function isPidAlive(pid) {
    if (!Number.isInteger(pid) || pid < 0)
        return false;
    if (pid === 0)
        return false;
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (error) {
        var code = error.code;
        return code === 'EPERM';
    }
}
var ProcessRegistry = /** @class */ (function () {
    function ProcessRegistry(registryPath) {
        if (registryPath === void 0) { registryPath = DEFAULT_REGISTRY_PATH; }
        this.entries = new Map();
        this.runtimeProcesses = new Map();
        this.initialized = false;
        this.registryPath = registryPath;
    }
    ProcessRegistry.prototype.initialize = function () {
        var _a;
        if (this.initialized)
            return;
        this.initialized = true;
        (0, fs_1.mkdirSync)(path_1.default.dirname(this.registryPath), { recursive: true });
        if (!(0, fs_1.existsSync)(this.registryPath)) {
            this.persist();
            return;
        }
        try {
            var raw = JSON.parse((0, fs_1.readFileSync)(this.registryPath, 'utf-8'));
            var processes = (_a = raw.processes) !== null && _a !== void 0 ? _a : {};
            for (var _i = 0, _b = Object.entries(processes); _i < _b.length; _i++) {
                var _c = _b[_i], id = _c[0], info = _c[1];
                this.entries.set(id, info);
            }
        }
        catch (error) {
            logger_js_1.logger.warn('SYSTEM', 'Failed to parse supervisor registry, rebuilding', {
                path: this.registryPath
            }, error);
            this.entries.clear();
        }
        var removed = this.pruneDeadEntries();
        if (removed > 0) {
            logger_js_1.logger.info('SYSTEM', 'Removed dead processes from supervisor registry', { removed: removed });
        }
        this.persist();
    };
    ProcessRegistry.prototype.register = function (id, processInfo, processRef) {
        this.initialize();
        this.entries.set(id, processInfo);
        if (processRef) {
            this.runtimeProcesses.set(id, processRef);
        }
        this.persist();
    };
    ProcessRegistry.prototype.unregister = function (id) {
        this.initialize();
        this.entries.delete(id);
        this.runtimeProcesses.delete(id);
        this.persist();
    };
    ProcessRegistry.prototype.clear = function () {
        this.entries.clear();
        this.runtimeProcesses.clear();
        this.persist();
    };
    ProcessRegistry.prototype.getAll = function () {
        this.initialize();
        return Array.from(this.entries.entries())
            .map(function (_a) {
            var id = _a[0], info = _a[1];
            return (__assign({ id: id }, info));
        })
            .sort(function (a, b) {
            var left = Date.parse(a.startedAt);
            var right = Date.parse(b.startedAt);
            return (Number.isNaN(left) ? 0 : left) - (Number.isNaN(right) ? 0 : right);
        });
    };
    ProcessRegistry.prototype.getBySession = function (sessionId) {
        var normalized = String(sessionId);
        return this.getAll().filter(function (record) { return record.sessionId !== undefined && String(record.sessionId) === normalized; });
    };
    ProcessRegistry.prototype.getRuntimeProcess = function (id) {
        return this.runtimeProcesses.get(id);
    };
    ProcessRegistry.prototype.getByPid = function (pid) {
        return this.getAll().filter(function (record) { return record.pid === pid; });
    };
    ProcessRegistry.prototype.pruneDeadEntries = function () {
        this.initialize();
        var removed = 0;
        for (var _i = 0, _a = this.entries; _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], info = _b[1];
            if (isPidAlive(info.pid))
                continue;
            this.entries.delete(id);
            this.runtimeProcesses.delete(id);
            removed += 1;
        }
        if (removed > 0) {
            this.persist();
        }
        return removed;
    };
    /**
     * Kill and unregister all processes tagged with the given sessionId.
     * Sends SIGTERM first, waits up to 5s, then SIGKILL for survivors.
     * Called when a session is deleted to prevent leaked child processes (#1351).
     */
    ProcessRegistry.prototype.reapSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionRecords, sessionIdNum, aliveRecords, _i, aliveRecords_1, record, code, deadline, survivors_2, survivors, _a, survivors_1, record, code, sigkillDeadline, remaining, _b, sessionRecords_1, record;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.initialize();
                        sessionRecords = this.getBySession(sessionId);
                        if (sessionRecords.length === 0) {
                            return [2 /*return*/, 0];
                        }
                        sessionIdNum = typeof sessionId === 'number' ? sessionId : Number(sessionId) || undefined;
                        logger_js_1.logger.info('SYSTEM', "Reaping ".concat(sessionRecords.length, " process(es) for session ").concat(sessionId), {
                            sessionId: sessionIdNum,
                            pids: sessionRecords.map(function (r) { return r.pid; })
                        });
                        aliveRecords = sessionRecords.filter(function (r) { return isPidAlive(r.pid); });
                        for (_i = 0, aliveRecords_1 = aliveRecords; _i < aliveRecords_1.length; _i++) {
                            record = aliveRecords_1[_i];
                            try {
                                process.kill(record.pid, 'SIGTERM');
                            }
                            catch (error) {
                                code = error.code;
                                if (code !== 'ESRCH') {
                                    logger_js_1.logger.debug('SYSTEM', "Failed to SIGTERM session process PID ".concat(record.pid), {
                                        pid: record.pid
                                    }, error);
                                }
                            }
                        }
                        deadline = Date.now() + REAP_SESSION_SIGTERM_TIMEOUT_MS;
                        _c.label = 1;
                    case 1:
                        if (!(Date.now() < deadline)) return [3 /*break*/, 3];
                        survivors_2 = aliveRecords.filter(function (r) { return isPidAlive(r.pid); });
                        if (survivors_2.length === 0)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        survivors = aliveRecords.filter(function (r) { return isPidAlive(r.pid); });
                        for (_a = 0, survivors_1 = survivors; _a < survivors_1.length; _a++) {
                            record = survivors_1[_a];
                            logger_js_1.logger.warn('SYSTEM', "Session process PID ".concat(record.pid, " did not exit after SIGTERM, sending SIGKILL"), {
                                pid: record.pid,
                                sessionId: sessionIdNum
                            });
                            try {
                                process.kill(record.pid, 'SIGKILL');
                            }
                            catch (error) {
                                code = error.code;
                                if (code !== 'ESRCH') {
                                    logger_js_1.logger.debug('SYSTEM', "Failed to SIGKILL session process PID ".concat(record.pid), {
                                        pid: record.pid
                                    }, error);
                                }
                            }
                        }
                        if (!(survivors.length > 0)) return [3 /*break*/, 6];
                        sigkillDeadline = Date.now() + REAP_SESSION_SIGKILL_TIMEOUT_MS;
                        _c.label = 4;
                    case 4:
                        if (!(Date.now() < sigkillDeadline)) return [3 /*break*/, 6];
                        remaining = survivors.filter(function (r) { return isPidAlive(r.pid); });
                        if (remaining.length === 0)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 6:
                        // Phase 4: Unregister all session records
                        for (_b = 0, sessionRecords_1 = sessionRecords; _b < sessionRecords_1.length; _b++) {
                            record = sessionRecords_1[_b];
                            this.entries.delete(record.id);
                            this.runtimeProcesses.delete(record.id);
                        }
                        this.persist();
                        logger_js_1.logger.info('SYSTEM', "Reaped ".concat(sessionRecords.length, " process(es) for session ").concat(sessionId), {
                            sessionId: sessionIdNum,
                            reaped: sessionRecords.length
                        });
                        return [2 /*return*/, sessionRecords.length];
                }
            });
        });
    };
    ProcessRegistry.prototype.persist = function () {
        var payload = {
            processes: Object.fromEntries(this.entries.entries())
        };
        (0, fs_1.mkdirSync)(path_1.default.dirname(this.registryPath), { recursive: true });
        (0, fs_1.writeFileSync)(this.registryPath, JSON.stringify(payload, null, 2));
    };
    return ProcessRegistry;
}());
exports.ProcessRegistry = ProcessRegistry;
var registrySingleton = null;
function getProcessRegistry() {
    if (!registrySingleton) {
        registrySingleton = new ProcessRegistry();
    }
    return registrySingleton;
}
function createProcessRegistry(registryPath) {
    return new ProcessRegistry(registryPath);
}
