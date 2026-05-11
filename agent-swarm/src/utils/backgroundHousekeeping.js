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
exports.startBackgroundHousekeeping = startBackgroundHousekeeping;
var bun_bundle_1 = require("bun:bundle");
var autoDream_js_1 = require("../services/autoDream/autoDream.js");
var magicDocs_js_1 = require("../services/MagicDocs/magicDocs.js");
var skillImprovement_js_1 = require("./hooks/skillImprovement.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var extractMemoriesModule = (0, bun_bundle_1.feature)('EXTRACT_MEMORIES')
    ? require('../services/extractMemories/extractMemories.js')
    : null;
var registerProtocolModule = (0, bun_bundle_1.feature)('LODESTONE')
    ? require('./deepLink/registerProtocol.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var state_js_1 = require("../bootstrap/state.js");
var cleanup_js_1 = require("./cleanup.js");
var index_js_1 = require("./nativeInstaller/index.js");
var pluginAutoupdate_js_1 = require("./plugins/pluginAutoupdate.js");
// 24 hours in milliseconds
var RECURRING_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
// 10 minutes after start.
var DELAY_VERY_SLOW_OPERATIONS_THAT_HAPPEN_EVERY_SESSION = 10 * 60 * 1000;
function startBackgroundHousekeeping() {
    void (0, magicDocs_js_1.initMagicDocs)();
    void (0, skillImprovement_js_1.initSkillImprovement)();
    if ((0, bun_bundle_1.feature)('EXTRACT_MEMORIES')) {
        extractMemoriesModule.initExtractMemories();
    }
    (0, autoDream_js_1.initAutoDream)();
    void (0, pluginAutoupdate_js_1.autoUpdateMarketplacesAndPluginsInBackground)();
    if ((0, bun_bundle_1.feature)('LODESTONE') && (0, state_js_1.getIsInteractive)()) {
        void registerProtocolModule.ensureDeepLinkProtocolRegistered();
    }
    var needsCleanup = true;
    function runVerySlowOps() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the user did something in the last minute, don't make them wait for these slow operations to run.
                        if ((0, state_js_1.getIsInteractive)() &&
                            (0, state_js_1.getLastInteractionTime)() > Date.now() - 1000 * 60) {
                            setTimeout(runVerySlowOps, DELAY_VERY_SLOW_OPERATIONS_THAT_HAPPEN_EVERY_SESSION).unref();
                            return [2 /*return*/];
                        }
                        if (!needsCleanup) return [3 /*break*/, 2];
                        needsCleanup = false;
                        return [4 /*yield*/, (0, cleanup_js_1.cleanupOldMessageFilesInBackground)()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // If the user did something in the last minute, don't make them wait for these slow operations to run.
                        if ((0, state_js_1.getIsInteractive)() &&
                            (0, state_js_1.getLastInteractionTime)() > Date.now() - 1000 * 60) {
                            setTimeout(runVerySlowOps, DELAY_VERY_SLOW_OPERATIONS_THAT_HAPPEN_EVERY_SESSION).unref();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, index_js_1.cleanupOldVersions)()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    setTimeout(runVerySlowOps, DELAY_VERY_SLOW_OPERATIONS_THAT_HAPPEN_EVERY_SESSION).unref();
    // For long-running sessions, schedule recurring cleanup every 24 hours.
    // Both cleanup functions use marker files and locks to throttle to once per day
    // and skip immediately if another process holds the lock.
    if (process.env.USER_TYPE === 'ant') {
        var interval = setInterval(function () {
            void (0, cleanup_js_1.cleanupNpmCacheForAnthropicPackages)();
            void (0, cleanup_js_1.cleanupOldVersionsThrottled)();
        }, RECURRING_CLEANUP_INTERVAL_MS);
        // Don't let this interval keep the process alive
        interval.unref();
    }
}
