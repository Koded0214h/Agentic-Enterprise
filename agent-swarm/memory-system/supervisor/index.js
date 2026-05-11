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
exports.startSupervisor = startSupervisor;
exports.stopSupervisor = stopSupervisor;
exports.getSupervisor = getSupervisor;
exports.configureSupervisorSignalHandlers = configureSupervisorSignalHandlers;
exports.validateWorkerPidFile = validateWorkerPidFile;
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var logger_js_1 = require("../utils/logger.js");
var process_registry_js_1 = require("./process-registry.js");
var shutdown_js_1 = require("./shutdown.js");
var health_checker_js_1 = require("./health-checker.js");
var DATA_DIR = path_1.default.join((0, os_1.homedir)(), '.claude-mem');
var PID_FILE = path_1.default.join(DATA_DIR, 'worker.pid');
var Supervisor = /** @class */ (function () {
    function Supervisor(registry) {
        this.started = false;
        this.stopPromise = null;
        this.signalHandlersRegistered = false;
        this.shutdownInitiated = false;
        this.shutdownHandler = null;
        this.registry = registry;
    }
    Supervisor.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pidStatus;
            return __generator(this, function (_a) {
                if (this.started)
                    return [2 /*return*/];
                this.registry.initialize();
                pidStatus = validateWorkerPidFile({ logAlive: false });
                if (pidStatus === 'alive') {
                    throw new Error('Worker already running');
                }
                this.started = true;
                (0, health_checker_js_1.startHealthChecker)();
                return [2 /*return*/];
            });
        });
    };
    Supervisor.prototype.configureSignalHandlers = function (shutdownHandler) {
        var _this = this;
        this.shutdownHandler = shutdownHandler;
        if (this.signalHandlersRegistered)
            return;
        this.signalHandlersRegistered = true;
        var handleSignal = function (signal) { return __awaiter(_this, void 0, void 0, function () {
            var error_1, stopError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.shutdownInitiated) {
                            logger_js_1.logger.warn('SYSTEM', "Received ".concat(signal, " but shutdown already in progress"));
                            return [2 /*return*/];
                        }
                        this.shutdownInitiated = true;
                        logger_js_1.logger.info('SYSTEM', "Received ".concat(signal, ", shutting down..."));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 11]);
                        if (!this.shutdownHandler) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.shutdownHandler()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.stop()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 11];
                    case 6:
                        error_1 = _a.sent();
                        logger_js_1.logger.error('SYSTEM', 'Error during shutdown', {}, error_1);
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.stop()];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        stopError_1 = _a.sent();
                        logger_js_1.logger.debug('SYSTEM', 'Supervisor shutdown fallback failed', {}, stopError_1);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 11];
                    case 11:
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        }); };
        process.on('SIGTERM', function () { return void handleSignal('SIGTERM'); });
        process.on('SIGINT', function () { return void handleSignal('SIGINT'); });
        if (process.platform !== 'win32') {
            if (process.argv.includes('--daemon')) {
                process.on('SIGHUP', function () {
                    logger_js_1.logger.debug('SYSTEM', 'Ignoring SIGHUP in daemon mode');
                });
            }
            else {
                process.on('SIGHUP', function () { return void handleSignal('SIGHUP'); });
            }
        }
    };
    Supervisor.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.stopPromise) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.stopPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        (0, health_checker_js_1.stopHealthChecker)();
                        this.stopPromise = (0, shutdown_js_1.runShutdownCascade)({
                            registry: this.registry,
                            currentPid: process.pid
                        }).finally(function () {
                            _this.started = false;
                            _this.stopPromise = null;
                        });
                        return [4 /*yield*/, this.stopPromise];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Supervisor.prototype.assertCanSpawn = function (type) {
        if (this.stopPromise !== null) {
            throw new Error("Supervisor is shutting down, refusing to spawn ".concat(type));
        }
    };
    Supervisor.prototype.registerProcess = function (id, processInfo, processRef) {
        this.registry.register(id, processInfo, processRef);
    };
    Supervisor.prototype.unregisterProcess = function (id) {
        this.registry.unregister(id);
    };
    Supervisor.prototype.getRegistry = function () {
        return this.registry;
    };
    return Supervisor;
}());
var supervisorSingleton = new Supervisor((0, process_registry_js_1.getProcessRegistry)());
function startSupervisor() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supervisorSingleton.start()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function stopSupervisor() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supervisorSingleton.stop()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getSupervisor() {
    return supervisorSingleton;
}
function configureSupervisorSignalHandlers(shutdownHandler) {
    supervisorSingleton.configureSignalHandlers(shutdownHandler);
}
function validateWorkerPidFile(options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var pidFilePath = (_a = options.pidFilePath) !== null && _a !== void 0 ? _a : PID_FILE;
    if (!(0, fs_1.existsSync)(pidFilePath)) {
        return 'missing';
    }
    var pidInfo = null;
    try {
        pidInfo = JSON.parse((0, fs_1.readFileSync)(pidFilePath, 'utf-8'));
    }
    catch (error) {
        logger_js_1.logger.warn('SYSTEM', 'Failed to parse worker PID file, removing it', { path: pidFilePath }, error);
        (0, fs_1.rmSync)(pidFilePath, { force: true });
        return 'invalid';
    }
    if ((0, process_registry_js_1.isPidAlive)(pidInfo.pid)) {
        if ((_b = options.logAlive) !== null && _b !== void 0 ? _b : true) {
            logger_js_1.logger.info('SYSTEM', 'Worker already running (PID alive)', {
                existingPid: pidInfo.pid,
                existingPort: pidInfo.port,
                startedAt: pidInfo.startedAt
            });
        }
        return 'alive';
    }
    logger_js_1.logger.info('SYSTEM', 'Removing stale PID file (worker process is dead)', {
        pid: pidInfo.pid,
        port: pidInfo.port,
        startedAt: pidInfo.startedAt
    });
    (0, fs_1.rmSync)(pidFilePath, { force: true });
    return 'stale';
}
