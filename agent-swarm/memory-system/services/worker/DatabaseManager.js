"use strict";
/**
 * DatabaseManager: Single long-lived database connection
 *
 * Responsibility:
 * - Manage single database connection for worker lifetime
 * - Provide centralized access to SessionStore and SessionSearch
 * - High-level database operations
 * - ChromaSync integration
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
exports.DatabaseManager = void 0;
var SessionStore_js_1 = require("../sqlite/SessionStore.js");
var SessionSearch_js_1 = require("../sqlite/SessionSearch.js");
var ChromaSync_js_1 = require("../sync/ChromaSync.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../shared/paths.js");
var logger_js_1 = require("../../utils/logger.js");
var DatabaseManager = /** @class */ (function () {
    function DatabaseManager() {
        this.sessionStore = null;
        this.sessionSearch = null;
        this.chromaSync = null;
    }
    /**
     * Initialize database connection (once, stays open)
     */
    DatabaseManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, chromaEnabled;
            return __generator(this, function (_a) {
                // Open database connection (ONCE)
                this.sessionStore = new SessionStore_js_1.SessionStore();
                this.sessionSearch = new SessionSearch_js_1.SessionSearch();
                settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
                chromaEnabled = settings.CLAUDE_MEM_CHROMA_ENABLED !== 'false';
                if (chromaEnabled) {
                    this.chromaSync = new ChromaSync_js_1.ChromaSync('claude-mem');
                }
                else {
                    logger_js_1.logger.info('DB', 'Chroma disabled via CLAUDE_MEM_CHROMA_ENABLED=false, using SQLite-only search');
                }
                logger_js_1.logger.info('DB', 'Database initialized');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Close database connection and cleanup all resources
     */
    DatabaseManager.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chromaSync.close()];
                    case 1:
                        _a.sent();
                        this.chromaSync = null;
                        _a.label = 2;
                    case 2:
                        if (this.sessionStore) {
                            this.sessionStore.close();
                            this.sessionStore = null;
                        }
                        if (this.sessionSearch) {
                            this.sessionSearch.close();
                            this.sessionSearch = null;
                        }
                        logger_js_1.logger.info('DB', 'Database closed');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get SessionStore instance (throws if not initialized)
     */
    DatabaseManager.prototype.getSessionStore = function () {
        if (!this.sessionStore) {
            throw new Error('Database not initialized');
        }
        return this.sessionStore;
    };
    /**
     * Get SessionSearch instance (throws if not initialized)
     */
    DatabaseManager.prototype.getSessionSearch = function () {
        if (!this.sessionSearch) {
            throw new Error('Database not initialized');
        }
        return this.sessionSearch;
    };
    /**
     * Get ChromaSync instance (returns null if Chroma is disabled)
     */
    DatabaseManager.prototype.getChromaSync = function () {
        return this.chromaSync;
    };
    // REMOVED: cleanupOrphanedSessions - violates "EVERYTHING SHOULD SAVE ALWAYS"
    // Worker restarts don't make sessions orphaned. Sessions are managed by hooks
    // and exist independently of worker state.
    /**
     * Get session by ID (throws if not found)
     */
    DatabaseManager.prototype.getSessionById = function (sessionDbId) {
        var session = this.getSessionStore().getSessionById(sessionDbId);
        if (!session) {
            throw new Error("Session ".concat(sessionDbId, " not found"));
        }
        return session;
    };
    return DatabaseManager;
}());
exports.DatabaseManager = DatabaseManager;
