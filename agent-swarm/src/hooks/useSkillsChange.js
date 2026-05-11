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
exports.useSkillsChange = useSkillsChange;
var react_1 = require("react");
var commands_js_1 = require("../commands.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var log_js_1 = require("../utils/log.js");
var skillChangeDetector_js_1 = require("../utils/skills/skillChangeDetector.js");
/**
 * Keep the commands list fresh across two triggers:
 *
 * 1. Skill file changes (watcher) — full cache clear + disk re-scan, since
 *    skill content changed on disk.
 * 2. GrowthBook init/refresh — memo-only clear, since only `isEnabled()`
 *    predicates may have changed. Handles commands like /btw whose gate
 *    reads a flag that isn't in the disk cache yet on first session after
 *    a flag rename: getCommands() runs before GB init (main.tsx:2855 vs
 *    showSetupScreens at :3106), so the memoized list is baked with the
 *    default. Once init populates remoteEvalFeatureValues, re-filter.
 */
function useSkillsChange(cwd, onCommandsChange) {
    var _this = this;
    var handleChange = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var commands, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!cwd)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Clear all command caches to ensure fresh load
                    (0, commands_js_1.clearCommandsCache)();
                    return [4 /*yield*/, (0, commands_js_1.getCommands)(cwd)];
                case 2:
                    commands = _a.sent();
                    onCommandsChange(commands);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    // Errors during reload are non-fatal - log and continue
                    if (error_1 instanceof Error) {
                        (0, log_js_1.logError)(error_1);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [cwd, onCommandsChange]);
    (0, react_1.useEffect)(function () { return skillChangeDetector_js_1.skillChangeDetector.subscribe(handleChange); }, [handleChange]);
    var handleGrowthBookRefresh = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var commands, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!cwd)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    (0, commands_js_1.clearCommandMemoizationCaches)();
                    return [4 /*yield*/, (0, commands_js_1.getCommands)(cwd)];
                case 2:
                    commands = _a.sent();
                    onCommandsChange(commands);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    if (error_2 instanceof Error) {
                        (0, log_js_1.logError)(error_2);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [cwd, onCommandsChange]);
    (0, react_1.useEffect)(function () { return (0, growthbook_js_1.onGrowthBookRefresh)(handleGrowthBookRefresh); }, [handleGrowthBookRefresh]);
}
