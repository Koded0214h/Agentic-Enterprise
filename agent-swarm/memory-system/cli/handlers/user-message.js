"use strict";
/**
 * User Message Handler - SessionStart (parallel)
 *
 * Displays context info to user via stderr.
 * Uses exit code 0 (SUCCESS) - stderr is not shown to Claude with exit 0.
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
exports.userMessageHandler = void 0;
var path_1 = require("path");
var worker_utils_js_1 = require("../../shared/worker-utils.js");
var hook_constants_js_1 = require("../../shared/hook-constants.js");
exports.userMessageHandler = {
    execute: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var workerReady, port, project, response, output, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, worker_utils_js_1.ensureWorkerRunning)()];
                    case 1:
                        workerReady = _b.sent();
                        if (!workerReady) {
                            // Worker not available — skip user message gracefully
                            return [2 /*return*/, { exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        port = (0, worker_utils_js_1.getWorkerPort)();
                        project = (0, path_1.basename)((_a = input.cwd) !== null && _a !== void 0 ? _a : process.cwd());
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)("/api/context/inject?project=".concat(encodeURIComponent(project), "&colors=true"))];
                    case 3:
                        response = _b.sent();
                        if (!response.ok) {
                            // Don't throw - context fetch failure should not block the user's prompt
                            return [2 /*return*/, { exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        return [4 /*yield*/, response.text()];
                    case 4:
                        output = _b.sent();
                        // Write to stderr for user visibility
                        // Note: Using process.stderr.write instead of console.error to avoid
                        // Claude Code treating this as a hook error. The actual hook output
                        // goes to stdout via hook-command.ts JSON serialization.
                        process.stderr.write("\n\n" + String.fromCodePoint(0x1F4DD) + " Claude-Mem Context Loaded\n\n" +
                            output +
                            "\n\n" + String.fromCodePoint(0x1F4A1) + " Wrap any message with <private> ... </private> to prevent storing sensitive information.\n" +
                            "\n" + String.fromCodePoint(0x1F4AC) + " Community https://discord.gg/J4wttp9vDu" +
                            "\n" + String.fromCodePoint(0x1F4FA) + " Watch live in browser http://localhost:".concat(port, "/\n"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, { exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                }
            });
        });
    }
};
