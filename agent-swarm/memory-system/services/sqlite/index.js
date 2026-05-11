"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeObservationsAndMarkComplete = exports.storeObservations = exports.migrations = exports.SessionSearch = exports.SessionStore = exports.MigrationRunner = exports.initializeDatabase = exports.getDatabase = exports.DatabaseManager = exports.ClaudeMemDatabase = void 0;
// Export main components
var Database_js_1 = require("./Database.js");
Object.defineProperty(exports, "ClaudeMemDatabase", { enumerable: true, get: function () { return Database_js_1.ClaudeMemDatabase; } });
Object.defineProperty(exports, "DatabaseManager", { enumerable: true, get: function () { return Database_js_1.DatabaseManager; } });
Object.defineProperty(exports, "getDatabase", { enumerable: true, get: function () { return Database_js_1.getDatabase; } });
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return Database_js_1.initializeDatabase; } });
Object.defineProperty(exports, "MigrationRunner", { enumerable: true, get: function () { return Database_js_1.MigrationRunner; } });
// Export session store (CRUD operations for sessions, observations, summaries)
// @deprecated Use modular functions from Database.ts instead
var SessionStore_js_1 = require("./SessionStore.js");
Object.defineProperty(exports, "SessionStore", { enumerable: true, get: function () { return SessionStore_js_1.SessionStore; } });
// Export session search (FTS5 and structured search)
var SessionSearch_js_1 = require("./SessionSearch.js");
Object.defineProperty(exports, "SessionSearch", { enumerable: true, get: function () { return SessionSearch_js_1.SessionSearch; } });
// Export types
__exportStar(require("./types.js"), exports);
// Export migrations
var migrations_js_1 = require("./migrations.js");
Object.defineProperty(exports, "migrations", { enumerable: true, get: function () { return migrations_js_1.migrations; } });
// Export transactions
var transactions_js_1 = require("./transactions.js");
Object.defineProperty(exports, "storeObservations", { enumerable: true, get: function () { return transactions_js_1.storeObservations; } });
Object.defineProperty(exports, "storeObservationsAndMarkComplete", { enumerable: true, get: function () { return transactions_js_1.storeObservationsAndMarkComplete; } });
// Re-export all modular functions for convenient access
__exportStar(require("./Sessions.js"), exports);
__exportStar(require("./Observations.js"), exports);
__exportStar(require("./Summaries.js"), exports);
__exportStar(require("./Prompts.js"), exports);
__exportStar(require("./Timeline.js"), exports);
__exportStar(require("./Import.js"), exports);
