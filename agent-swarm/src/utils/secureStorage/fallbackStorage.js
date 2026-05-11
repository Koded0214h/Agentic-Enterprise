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
exports.createFallbackStorage = createFallbackStorage;
/**
 * Creates a fallback storage that tries to use the primary storage first,
 * and if that fails, falls back to the secondary storage
 */
function createFallbackStorage(primary, secondary) {
    return {
        name: "".concat(primary.name, "-with-").concat(secondary.name, "-fallback"),
        read: function () {
            var result = primary.read();
            if (result !== null && result !== undefined) {
                return result;
            }
            return secondary.read() || {};
        },
        readAsync: function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, primary.readAsync()];
                        case 1:
                            result = _a.sent();
                            if (result !== null && result !== undefined) {
                                return [2 /*return*/, result];
                            }
                            return [4 /*yield*/, secondary.readAsync()];
                        case 2: return [2 /*return*/, (_a.sent()) || {}];
                    }
                });
            });
        },
        update: function (data) {
            // Capture state before update
            var primaryDataBefore = primary.read();
            var result = primary.update(data);
            if (result.success) {
                // Delete secondary when migrating to primary for the first time
                // This preserves credentials when sharing .claude between host and containers
                // See: https://github.com/anthropics/claude-code/issues/1414
                if (primaryDataBefore === null) {
                    secondary.delete();
                }
                return result;
            }
            var fallbackResult = secondary.update(data);
            if (fallbackResult.success) {
                // Primary write failed but primary may still hold an *older* valid
                // entry. read() prefers primary whenever it returns non-null, so that
                // stale entry would shadow the fresh data we just wrote to secondary —
                // e.g. a refresh token the server has already rotated away, causing a
                // /login loop (#30337). Best-effort delete; if this also fails the
                // user's keychain is in a bad state we can't fix from here.
                if (primaryDataBefore !== null) {
                    primary.delete();
                }
                return {
                    success: true,
                    warning: fallbackResult.warning,
                };
            }
            return { success: false };
        },
        delete: function () {
            var primarySuccess = primary.delete();
            var secondarySuccess = secondary.delete();
            return primarySuccess || secondarySuccess;
        },
    };
}
