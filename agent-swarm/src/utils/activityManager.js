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
exports.activityManager = exports.ActivityManager = void 0;
var state_js_1 = require("../bootstrap/state.js");
/**
 * ActivityManager handles generic activity tracking for both user and CLI operations.
 * It automatically deduplicates overlapping activities and provides separate metrics
 * for user vs CLI active time.
 */
var ActivityManager = /** @class */ (function () {
    function ActivityManager(options) {
        var _a, _b;
        this.activeOperations = new Set();
        this.lastUserActivityTime = 0; // Start with 0 to indicate no activity yet
        this.isCLIActive = false;
        this.USER_ACTIVITY_TIMEOUT_MS = 5000; // 5 seconds
        this.getNow = (_a = options === null || options === void 0 ? void 0 : options.getNow) !== null && _a !== void 0 ? _a : (function () { return Date.now(); });
        this.getActiveTimeCounter =
            (_b = options === null || options === void 0 ? void 0 : options.getActiveTimeCounter) !== null && _b !== void 0 ? _b : state_js_1.getActiveTimeCounter;
        this.lastCLIRecordedTime = this.getNow();
    }
    ActivityManager.getInstance = function () {
        if (!ActivityManager.instance) {
            ActivityManager.instance = new ActivityManager();
        }
        return ActivityManager.instance;
    };
    /**
     * Reset the singleton instance (for testing purposes)
     */
    ActivityManager.resetInstance = function () {
        ActivityManager.instance = null;
    };
    /**
     * Create a new instance with custom options (for testing purposes)
     */
    ActivityManager.createInstance = function (options) {
        ActivityManager.instance = new ActivityManager(options);
        return ActivityManager.instance;
    };
    /**
     * Called when user interacts with the CLI (typing, commands, etc.)
     */
    ActivityManager.prototype.recordUserActivity = function () {
        // Don't record user time if CLI is active (CLI takes precedence)
        if (!this.isCLIActive && this.lastUserActivityTime !== 0) {
            var now = this.getNow();
            var timeSinceLastActivity = (now - this.lastUserActivityTime) / 1000;
            if (timeSinceLastActivity > 0) {
                var activeTimeCounter = this.getActiveTimeCounter();
                if (activeTimeCounter) {
                    var timeoutSeconds = this.USER_ACTIVITY_TIMEOUT_MS / 1000;
                    // Only record time if within the timeout window
                    if (timeSinceLastActivity < timeoutSeconds) {
                        activeTimeCounter.add(timeSinceLastActivity, { type: 'user' });
                    }
                }
            }
        }
        // Update the last user activity timestamp
        this.lastUserActivityTime = this.getNow();
    };
    /**
     * Starts tracking CLI activity (tool execution, AI response, etc.)
     */
    ActivityManager.prototype.startCLIActivity = function (operationId) {
        // If operation already exists, it likely means the previous one didn't clean up
        // properly (e.g., component crashed/unmounted without calling end). Force cleanup
        // to avoid overestimating time - better to underestimate than overestimate.
        if (this.activeOperations.has(operationId)) {
            this.endCLIActivity(operationId);
        }
        var wasEmpty = this.activeOperations.size === 0;
        this.activeOperations.add(operationId);
        if (wasEmpty) {
            this.isCLIActive = true;
            this.lastCLIRecordedTime = this.getNow();
        }
    };
    /**
     * Stops tracking CLI activity
     */
    ActivityManager.prototype.endCLIActivity = function (operationId) {
        this.activeOperations.delete(operationId);
        if (this.activeOperations.size === 0) {
            // Last operation ended - CLI becoming inactive
            // Record the CLI time before switching to inactive
            var now = this.getNow();
            var timeSinceLastRecord = (now - this.lastCLIRecordedTime) / 1000;
            if (timeSinceLastRecord > 0) {
                var activeTimeCounter = this.getActiveTimeCounter();
                if (activeTimeCounter) {
                    activeTimeCounter.add(timeSinceLastRecord, { type: 'cli' });
                }
            }
            this.lastCLIRecordedTime = now;
            this.isCLIActive = false;
        }
    };
    /**
     * Convenience method to track an async operation automatically (mainly for testing/debugging)
     */
    ActivityManager.prototype.trackOperation = function (operationId, fn) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.startCLIActivity(operationId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, fn()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        this.endCLIActivity(operationId);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets current activity states (mainly for testing/debugging)
     */
    ActivityManager.prototype.getActivityStates = function () {
        var now = this.getNow();
        var timeSinceUserActivity = (now - this.lastUserActivityTime) / 1000;
        var isUserActive = timeSinceUserActivity < this.USER_ACTIVITY_TIMEOUT_MS / 1000;
        return {
            isUserActive: isUserActive,
            isCLIActive: this.isCLIActive,
            activeOperationCount: this.activeOperations.size,
        };
    };
    ActivityManager.instance = null;
    return ActivityManager;
}());
exports.ActivityManager = ActivityManager;
// Export singleton instance
exports.activityManager = ActivityManager.getInstance();
