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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptWatcher = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var glob_1 = require("glob");
var logger_js_1 = require("../../utils/logger.js");
var config_js_1 = require("./config.js");
var state_js_1 = require("./state.js");
var processor_js_1 = require("./processor.js");
var FileTailer = /** @class */ (function () {
    function FileTailer(filePath, initialOffset, onLine, onOffset) {
        this.filePath = filePath;
        this.onLine = onLine;
        this.onOffset = onOffset;
        this.watcher = null;
        this.tailState = { offset: initialOffset, partial: '' };
    }
    FileTailer.prototype.start = function () {
        var _this = this;
        this.readNewData().catch(function () { return undefined; });
        this.watcher = (0, fs_1.watch)(this.filePath, { persistent: true }, function () {
            _this.readNewData().catch(function () { return undefined; });
        });
    };
    FileTailer.prototype.close = function () {
        var _a;
        (_a = this.watcher) === null || _a === void 0 ? void 0 : _a.close();
        this.watcher = null;
    };
    FileTailer.prototype.readNewData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var size, stream, data, _a, stream_1, stream_1_1, chunk, e_1_1, combined, lines, _i, lines_1, line, trimmed;
            var _b, e_1, _c, _d;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!(0, fs_1.existsSync)(this.filePath))
                            return [2 /*return*/];
                        size = 0;
                        try {
                            size = (0, fs_1.statSync)(this.filePath).size;
                        }
                        catch (_g) {
                            return [2 /*return*/];
                        }
                        if (size < this.tailState.offset) {
                            this.tailState.offset = 0;
                        }
                        if (size === this.tailState.offset)
                            return [2 /*return*/];
                        stream = (0, fs_1.createReadStream)(this.filePath, {
                            start: this.tailState.offset,
                            end: size - 1,
                            encoding: 'utf8'
                        });
                        data = '';
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, 7, 12]);
                        _a = true, stream_1 = __asyncValues(stream);
                        _f.label = 2;
                    case 2: return [4 /*yield*/, stream_1.next()];
                    case 3:
                        if (!(stream_1_1 = _f.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 5];
                        _d = stream_1_1.value;
                        _a = false;
                        chunk = _d;
                        data += chunk;
                        _f.label = 4;
                    case 4:
                        _a = true;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 7:
                        _f.trys.push([7, , 10, 11]);
                        if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 9];
                        return [4 /*yield*/, _c.call(stream_1)];
                    case 8:
                        _f.sent();
                        _f.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 11: return [7 /*endfinally*/];
                    case 12:
                        this.tailState.offset = size;
                        this.onOffset(this.tailState.offset);
                        combined = this.tailState.partial + data;
                        lines = combined.split('\n');
                        this.tailState.partial = (_e = lines.pop()) !== null && _e !== void 0 ? _e : '';
                        _i = 0, lines_1 = lines;
                        _f.label = 13;
                    case 13:
                        if (!(_i < lines_1.length)) return [3 /*break*/, 16];
                        line = lines_1[_i];
                        trimmed = line.trim();
                        if (!trimmed)
                            return [3 /*break*/, 15];
                        return [4 /*yield*/, this.onLine(trimmed)];
                    case 14:
                        _f.sent();
                        _f.label = 15;
                    case 15:
                        _i++;
                        return [3 /*break*/, 13];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return FileTailer;
}());
var TranscriptWatcher = /** @class */ (function () {
    function TranscriptWatcher(config, statePath) {
        this.config = config;
        this.statePath = statePath;
        this.processor = new processor_js_1.TranscriptEventProcessor();
        this.tailers = new Map();
        this.rescanTimers = [];
        this.state = (0, state_js_1.loadWatchState)(statePath);
    }
    TranscriptWatcher.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, watch;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.config.watches;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        watch = _a[_i];
                        return [4 /*yield*/, this.setupWatch(watch)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptWatcher.prototype.stop = function () {
        for (var _i = 0, _a = this.tailers.values(); _i < _a.length; _i++) {
            var tailer = _a[_i];
            tailer.close();
        }
        this.tailers.clear();
        for (var _b = 0, _c = this.rescanTimers; _b < _c.length; _b++) {
            var timer = _c[_b];
            clearInterval(timer);
        }
        this.rescanTimers = [];
    };
    TranscriptWatcher.prototype.setupWatch = function (watch) {
        return __awaiter(this, void 0, void 0, function () {
            var schema, resolvedPath, files, _i, files_1, filePath, rescanIntervalMs, timer;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        schema = this.resolveSchema(watch);
                        if (!schema) {
                            logger_js_1.logger.warn('TRANSCRIPT', 'Missing schema for watch', { watch: watch.name });
                            return [2 /*return*/];
                        }
                        resolvedPath = (0, config_js_1.expandHomePath)(watch.path);
                        files = this.resolveWatchFiles(resolvedPath);
                        _i = 0, files_1 = files;
                        _b.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 4];
                        filePath = files_1[_i];
                        return [4 /*yield*/, this.addTailer(filePath, watch, schema)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        rescanIntervalMs = (_a = watch.rescanIntervalMs) !== null && _a !== void 0 ? _a : 5000;
                        timer = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var newFiles, _i, newFiles_1, filePath;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        newFiles = this.resolveWatchFiles(resolvedPath);
                                        _i = 0, newFiles_1 = newFiles;
                                        _a.label = 1;
                                    case 1:
                                        if (!(_i < newFiles_1.length)) return [3 /*break*/, 4];
                                        filePath = newFiles_1[_i];
                                        if (!!this.tailers.has(filePath)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this.addTailer(filePath, watch, schema)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }, rescanIntervalMs);
                        this.rescanTimers.push(timer);
                        return [2 /*return*/];
                }
            });
        });
    };
    TranscriptWatcher.prototype.resolveSchema = function (watch) {
        var _a, _b;
        if (typeof watch.schema === 'string') {
            return (_b = (_a = this.config.schemas) === null || _a === void 0 ? void 0 : _a[watch.schema]) !== null && _b !== void 0 ? _b : null;
        }
        return watch.schema;
    };
    TranscriptWatcher.prototype.resolveWatchFiles = function (inputPath) {
        if (this.hasGlob(inputPath)) {
            return (0, glob_1.globSync)(inputPath, { nodir: true, absolute: true });
        }
        if ((0, fs_1.existsSync)(inputPath)) {
            try {
                var stat = (0, fs_1.statSync)(inputPath);
                if (stat.isDirectory()) {
                    var pattern = (0, path_1.join)(inputPath, '**', '*.jsonl');
                    return (0, glob_1.globSync)(pattern, { nodir: true, absolute: true });
                }
                return [inputPath];
            }
            catch (_a) {
                return [];
            }
        }
        return [];
    };
    TranscriptWatcher.prototype.hasGlob = function (inputPath) {
        return /[*?[\]{}()]/.test(inputPath);
    };
    TranscriptWatcher.prototype.addTailer = function (filePath, watch, schema) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionIdOverride, offset, tailer;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                if (this.tailers.has(filePath))
                    return [2 /*return*/];
                sessionIdOverride = this.extractSessionIdFromPath(filePath);
                offset = (_a = this.state.offsets[filePath]) !== null && _a !== void 0 ? _a : 0;
                if (offset === 0 && watch.startAtEnd) {
                    try {
                        offset = (0, fs_1.statSync)(filePath).size;
                    }
                    catch (_c) {
                        offset = 0;
                    }
                }
                tailer = new FileTailer(filePath, offset, function (line) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.handleLine(line, watch, schema, filePath, sessionIdOverride)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, function (newOffset) {
                    _this.state.offsets[filePath] = newOffset;
                    (0, state_js_1.saveWatchState)(_this.statePath, _this.state);
                });
                tailer.start();
                this.tailers.set(filePath, tailer);
                logger_js_1.logger.info('TRANSCRIPT', 'Watching transcript file', {
                    file: filePath,
                    watch: watch.name,
                    schema: schema.name
                });
                return [2 /*return*/];
            });
        });
    };
    TranscriptWatcher.prototype.handleLine = function (line, watch, schema, filePath, sessionIdOverride) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        entry = JSON.parse(line);
                        return [4 /*yield*/, this.processor.processEntry(entry, watch, schema, sessionIdOverride !== null && sessionIdOverride !== void 0 ? sessionIdOverride : undefined)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_js_1.logger.debug('TRANSCRIPT', 'Failed to parse transcript line', {
                            watch: watch.name,
                            file: (0, path_1.basename)(filePath)
                        }, error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptWatcher.prototype.extractSessionIdFromPath = function (filePath) {
        var match = filePath.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        return match ? match[0] : null;
    };
    return TranscriptWatcher;
}());
exports.TranscriptWatcher = TranscriptWatcher;
