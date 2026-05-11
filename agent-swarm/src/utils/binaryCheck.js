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
exports.isBinaryInstalled = isBinaryInstalled;
exports.clearBinaryCache = clearBinaryCache;
var debug_js_1 = require("./debug.js");
var which_js_1 = require("./which.js");
// Session cache to avoid repeated checks
var binaryCache = new Map();
/**
 * Check if a binary/command is installed and available on the system.
 * Uses 'which' on Unix systems (macOS, Linux, WSL) and 'where' on Windows.
 *
 * @param command - The command name to check (e.g., 'gopls', 'rust-analyzer')
 * @returns Promise<boolean> - true if the command exists, false otherwise
 */
function isBinaryInstalled(command) {
    return __awaiter(this, void 0, void 0, function () {
        var trimmedCommand, cached, exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Edge case: empty or whitespace-only command
                    if (!command || !command.trim()) {
                        (0, debug_js_1.logForDebugging)('[binaryCheck] Empty command provided, returning false');
                        return [2 /*return*/, false];
                    }
                    trimmedCommand = command.trim();
                    cached = binaryCache.get(trimmedCommand);
                    if (cached !== undefined) {
                        (0, debug_js_1.logForDebugging)("[binaryCheck] Cache hit for '".concat(trimmedCommand, "': ").concat(cached));
                        return [2 /*return*/, cached];
                    }
                    exists = false;
                    return [4 /*yield*/, (0, which_js_1.which)(trimmedCommand).catch(function () { return null; })];
                case 1:
                    if (_a.sent()) {
                        exists = true;
                    }
                    // Cache the result
                    binaryCache.set(trimmedCommand, exists);
                    (0, debug_js_1.logForDebugging)("[binaryCheck] Binary '".concat(trimmedCommand, "' ").concat(exists ? 'found' : 'not found'));
                    return [2 /*return*/, exists];
            }
        });
    });
}
/**
 * Clear the binary check cache (useful for testing)
 */
function clearBinaryCache() {
    binaryCache.clear();
}
