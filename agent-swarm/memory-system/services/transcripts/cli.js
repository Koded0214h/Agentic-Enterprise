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
exports.runTranscriptCommand = runTranscriptCommand;
var config_js_1 = require("./config.js");
var watcher_js_1 = require("./watcher.js");
function getArgValue(args, name) {
    var _a;
    var index = args.indexOf(name);
    if (index === -1)
        return null;
    return (_a = args[index + 1]) !== null && _a !== void 0 ? _a : null;
}
function runTranscriptCommand(subcommand, args) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, configPath, configPath, config, statePath, watcher_1, shutdown, configPath;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _a = subcommand;
                    switch (_a) {
                        case 'init': return [3 /*break*/, 1];
                        case 'watch': return [3 /*break*/, 2];
                        case 'validate': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 6];
                case 1:
                    {
                        configPath = (_b = getArgValue(args, '--config')) !== null && _b !== void 0 ? _b : config_js_1.DEFAULT_CONFIG_PATH;
                        (0, config_js_1.writeSampleConfig)(configPath);
                        console.log("Created sample config: ".concat((0, config_js_1.expandHomePath)(configPath)));
                        return [2 /*return*/, 0];
                    }
                    _f.label = 2;
                case 2:
                    configPath = (_c = getArgValue(args, '--config')) !== null && _c !== void 0 ? _c : config_js_1.DEFAULT_CONFIG_PATH;
                    config = void 0;
                    try {
                        config = (0, config_js_1.loadTranscriptWatchConfig)(configPath);
                    }
                    catch (error) {
                        if (error instanceof Error && error.message.includes('not found')) {
                            (0, config_js_1.writeSampleConfig)(configPath);
                            console.log("Created sample config: ".concat((0, config_js_1.expandHomePath)(configPath)));
                            config = (0, config_js_1.loadTranscriptWatchConfig)(configPath);
                        }
                        else {
                            throw error;
                        }
                    }
                    statePath = (0, config_js_1.expandHomePath)((_d = config.stateFile) !== null && _d !== void 0 ? _d : config_js_1.DEFAULT_STATE_PATH);
                    watcher_1 = new watcher_js_1.TranscriptWatcher(config, statePath);
                    return [4 /*yield*/, watcher_1.start()];
                case 3:
                    _f.sent();
                    console.log('Transcript watcher running. Press Ctrl+C to stop.');
                    shutdown = function () {
                        watcher_1.stop();
                        process.exit(0);
                    };
                    process.on('SIGINT', shutdown);
                    process.on('SIGTERM', shutdown);
                    return [4 /*yield*/, new Promise(function () { return undefined; })];
                case 4: return [2 /*return*/, _f.sent()];
                case 5:
                    {
                        configPath = (_e = getArgValue(args, '--config')) !== null && _e !== void 0 ? _e : config_js_1.DEFAULT_CONFIG_PATH;
                        try {
                            (0, config_js_1.loadTranscriptWatchConfig)(configPath);
                        }
                        catch (error) {
                            if (error instanceof Error && error.message.includes('not found')) {
                                (0, config_js_1.writeSampleConfig)(configPath);
                                console.log("Created sample config: ".concat((0, config_js_1.expandHomePath)(configPath)));
                                (0, config_js_1.loadTranscriptWatchConfig)(configPath);
                            }
                            else {
                                throw error;
                            }
                        }
                        console.log("Config OK: ".concat((0, config_js_1.expandHomePath)(configPath)));
                        return [2 /*return*/, 0];
                    }
                    _f.label = 6;
                case 6:
                    console.log('Usage: claude-mem transcript <init|watch|validate> [--config <path>]');
                    return [2 /*return*/, 1];
            }
        });
    });
}
