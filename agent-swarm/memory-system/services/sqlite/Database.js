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
exports.MigrationRunner = exports.Database = exports.DatabaseManager = exports.ClaudeMemDatabase = void 0;
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
var bun_sqlite_1 = require("bun:sqlite");
Object.defineProperty(exports, "Database", { enumerable: true, get: function () { return bun_sqlite_1.Database; } });
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var paths_js_1 = require("../../shared/paths.js");
var logger_js_1 = require("../../utils/logger.js");
var runner_js_1 = require("./migrations/runner.js");
// SQLite configuration constants
var SQLITE_MMAP_SIZE_BYTES = 256 * 1024 * 1024; // 256MB
var SQLITE_CACHE_SIZE_PAGES = 10000;
var dbInstance = null;
/**
 * Repair malformed database schema before migrations run.
 *
 * This handles the case where a database is synced between machines running
 * different claude-mem versions. A newer version may have added columns and
 * indexes that an older version (or even the same version on a fresh install)
 * cannot process. SQLite throws "malformed database schema" when it encounters
 * an index referencing a non-existent column, which prevents ALL queries —
 * including the migrations that would fix the schema.
 *
 * The fix: use Python's sqlite3 module (which supports writable_schema) to
 * drop the orphaned schema objects, then let the migration system recreate
 * them properly. bun:sqlite doesn't allow DELETE FROM sqlite_master even
 * with writable_schema = ON.
 */
function repairMalformedSchema(db) {
    try {
        // Quick test: if we can query sqlite_master, the schema is fine
        db.query('SELECT name FROM sqlite_master WHERE type = "table" LIMIT 1').all();
        return;
    }
    catch (error) {
        var message = error instanceof Error ? error.message : String(error);
        if (!message.includes('malformed database schema')) {
            throw error;
        }
        logger_js_1.logger.warn('DB', 'Detected malformed database schema, attempting repair', { error: message });
        // Extract the problematic object name from the error message
        // Format: "malformed database schema (object_name) - details"
        var match = message.match(/malformed database schema \(([^)]+)\)/);
        if (!match) {
            logger_js_1.logger.error('DB', 'Could not parse malformed schema error, cannot auto-repair', { error: message });
            throw error;
        }
        var objectName = match[1];
        logger_js_1.logger.info('DB', "Dropping malformed schema object: ".concat(objectName));
        // Get the DB file path. For file-based DBs, we can use Python to repair.
        // For in-memory DBs, we can't shell out — just re-throw.
        var dbPath = db.filename;
        if (!dbPath || dbPath === ':memory:' || dbPath === '') {
            logger_js_1.logger.error('DB', 'Cannot auto-repair in-memory database');
            throw error;
        }
        // Close the connection so Python can safely modify the file
        db.close();
        // Use Python's sqlite3 module to drop the orphaned object and reset
        // related migration versions so they re-run and recreate things properly.
        // bun:sqlite doesn't support DELETE FROM sqlite_master even with writable_schema.
        //
        // We write a temp script rather than using -c to avoid shell escaping issues
        // with paths containing spaces or special characters. execFileSync passes
        // args directly without a shell, so dbPath and objectName are safe.
        var scriptPath = (0, path_1.join)((0, os_1.tmpdir)(), "claude-mem-repair-".concat(Date.now(), ".py"));
        try {
            (0, fs_1.writeFileSync)(scriptPath, "\nimport sqlite3, sys\ndb_path = sys.argv[1]\nobj_name = sys.argv[2]\nc = sqlite3.connect(db_path)\nc.execute('PRAGMA writable_schema = ON')\nc.execute('DELETE FROM sqlite_master WHERE name = ?', (obj_name,))\nc.execute('PRAGMA writable_schema = OFF')\n# Reset migration versions so affected migrations re-run.\n# Guard with existence check: schema_versions may not exist on a very fresh DB.\nhas_sv = c.execute(\n  \"SELECT count(*) FROM sqlite_master WHERE type='table' AND name='schema_versions'\"\n).fetchone()[0]\nif has_sv:\n  c.execute('DELETE FROM schema_versions')\nc.commit()\nc.close()\n");
            (0, child_process_1.execFileSync)('python3', [scriptPath, dbPath, objectName], { timeout: 10000 });
            logger_js_1.logger.info('DB', "Dropped orphaned schema object \"".concat(objectName, "\" and reset migration versions via Python sqlite3. All migrations will re-run (they are idempotent)."));
        }
        catch (pyError) {
            var pyMessage = pyError instanceof Error ? pyError.message : String(pyError);
            logger_js_1.logger.error('DB', 'Python sqlite3 repair failed', { error: pyMessage });
            throw new Error("Schema repair failed: ".concat(message, ". Python repair error: ").concat(pyMessage));
        }
        finally {
            if ((0, fs_1.existsSync)(scriptPath))
                (0, fs_1.unlinkSync)(scriptPath);
        }
    }
}
/**
 * Wrapper that handles the close/reopen cycle needed for schema repair.
 * Returns a (possibly new) Database connection.
 */
function repairMalformedSchemaWithReopen(dbPath, db) {
    try {
        db.query('SELECT name FROM sqlite_master WHERE type = "table" LIMIT 1').all();
        return db;
    }
    catch (error) {
        var message = error instanceof Error ? error.message : String(error);
        if (!message.includes('malformed database schema')) {
            throw error;
        }
        // repairMalformedSchema closes the DB internally for Python access
        repairMalformedSchema(db);
        // Reopen and check for additional malformed objects
        var newDb = new bun_sqlite_1.Database(dbPath, { create: true, readwrite: true });
        return repairMalformedSchemaWithReopen(dbPath, newDb);
    }
}
/**
 * ClaudeMemDatabase - New entry point for the sqlite module
 *
 * Replaces SessionStore as the database coordinator.
 * Sets up bun:sqlite with optimized settings and runs all migrations.
 *
 * Usage:
 *   const db = new ClaudeMemDatabase();  // uses default DB_PATH
 *   const db = new ClaudeMemDatabase('/path/to/db.sqlite');
 *   const db = new ClaudeMemDatabase(':memory:');  // for tests
 */
var ClaudeMemDatabase = /** @class */ (function () {
    function ClaudeMemDatabase(dbPath) {
        if (dbPath === void 0) { dbPath = paths_js_1.DB_PATH; }
        // Ensure data directory exists (skip for in-memory databases)
        if (dbPath !== ':memory:') {
            (0, paths_js_1.ensureDir)(paths_js_1.DATA_DIR);
        }
        // Create database connection
        this.db = new bun_sqlite_1.Database(dbPath, { create: true, readwrite: true });
        // Repair any malformed schema before applying settings or running migrations.
        // Must happen first — even PRAGMA calls can fail on a corrupted schema.
        // This may close and reopen the connection if repair is needed.
        this.db = repairMalformedSchemaWithReopen(dbPath, this.db);
        // Apply optimized SQLite settings
        this.db.run('PRAGMA journal_mode = WAL');
        this.db.run('PRAGMA synchronous = NORMAL');
        this.db.run('PRAGMA foreign_keys = ON');
        this.db.run('PRAGMA temp_store = memory');
        this.db.run("PRAGMA mmap_size = ".concat(SQLITE_MMAP_SIZE_BYTES));
        this.db.run("PRAGMA cache_size = ".concat(SQLITE_CACHE_SIZE_PAGES));
        // Run all migrations
        var migrationRunner = new runner_js_1.MigrationRunner(this.db);
        migrationRunner.runAllMigrations();
    }
    /**
     * Close the database connection
     */
    ClaudeMemDatabase.prototype.close = function () {
        this.db.close();
    };
    return ClaudeMemDatabase;
}());
exports.ClaudeMemDatabase = ClaudeMemDatabase;
/**
 * SQLite Database singleton with migration support and optimized settings
 * @deprecated Use ClaudeMemDatabase instead for new code
 */
var DatabaseManager = /** @class */ (function () {
    function DatabaseManager() {
        this.db = null;
        this.migrations = [];
    }
    DatabaseManager.getInstance = function () {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    };
    /**
     * Register a migration to be run during initialization
     */
    DatabaseManager.prototype.registerMigration = function (migration) {
        this.migrations.push(migration);
        // Keep migrations sorted by version
        this.migrations.sort(function (a, b) { return a.version - b.version; });
    };
    /**
     * Initialize database connection with optimized settings
     */
    DatabaseManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.db) {
                            return [2 /*return*/, this.db];
                        }
                        // Ensure the data directory exists
                        (0, paths_js_1.ensureDir)(paths_js_1.DATA_DIR);
                        this.db = new bun_sqlite_1.Database(paths_js_1.DB_PATH, { create: true, readwrite: true });
                        // Repair any malformed schema before applying settings or running migrations.
                        // Must happen first — even PRAGMA calls can fail on a corrupted schema.
                        this.db = repairMalformedSchemaWithReopen(paths_js_1.DB_PATH, this.db);
                        // Apply optimized SQLite settings
                        this.db.run('PRAGMA journal_mode = WAL');
                        this.db.run('PRAGMA synchronous = NORMAL');
                        this.db.run('PRAGMA foreign_keys = ON');
                        this.db.run('PRAGMA temp_store = memory');
                        this.db.run("PRAGMA mmap_size = ".concat(SQLITE_MMAP_SIZE_BYTES));
                        this.db.run("PRAGMA cache_size = ".concat(SQLITE_CACHE_SIZE_PAGES));
                        // Initialize schema_versions table
                        this.initializeSchemaVersions();
                        // Run migrations
                        return [4 /*yield*/, this.runMigrations()];
                    case 1:
                        // Run migrations
                        _a.sent();
                        dbInstance = this.db;
                        return [2 /*return*/, this.db];
                }
            });
        });
    };
    /**
     * Get the current database connection
     */
    DatabaseManager.prototype.getConnection = function () {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    };
    /**
     * Execute a function within a transaction
     */
    DatabaseManager.prototype.withTransaction = function (fn) {
        var db = this.getConnection();
        var transaction = db.transaction(fn);
        return transaction(db);
    };
    /**
     * Close the database connection
     */
    DatabaseManager.prototype.close = function () {
        if (this.db) {
            this.db.close();
            this.db = null;
            dbInstance = null;
        }
    };
    /**
     * Initialize the schema_versions table
     */
    DatabaseManager.prototype.initializeSchemaVersions = function () {
        if (!this.db)
            return;
        this.db.run("\n      CREATE TABLE IF NOT EXISTS schema_versions (\n        id INTEGER PRIMARY KEY,\n        version INTEGER UNIQUE NOT NULL,\n        applied_at TEXT NOT NULL\n      )\n    ");
    };
    /**
     * Run all pending migrations
     */
    DatabaseManager.prototype.runMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, appliedVersions, maxApplied, _loop_1, this_1, _i, _a, migration;
            var _this = this;
            return __generator(this, function (_b) {
                if (!this.db)
                    return [2 /*return*/];
                query = this.db.query('SELECT version FROM schema_versions ORDER BY version');
                appliedVersions = query.all().map(function (row) { return row.version; });
                maxApplied = appliedVersions.length > 0 ? Math.max.apply(Math, appliedVersions) : 0;
                _loop_1 = function (migration) {
                    if (migration.version > maxApplied) {
                        logger_js_1.logger.info('DB', "Applying migration ".concat(migration.version));
                        var transaction = this_1.db.transaction(function () {
                            migration.up(_this.db);
                            var insertQuery = _this.db.query('INSERT INTO schema_versions (version, applied_at) VALUES (?, ?)');
                            insertQuery.run(migration.version, new Date().toISOString());
                        });
                        transaction();
                        logger_js_1.logger.info('DB', "Migration ".concat(migration.version, " applied successfully"));
                    }
                };
                this_1 = this;
                for (_i = 0, _a = this.migrations; _i < _a.length; _i++) {
                    migration = _a[_i];
                    _loop_1(migration);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get current schema version
     */
    DatabaseManager.prototype.getCurrentVersion = function () {
        if (!this.db)
            return 0;
        var query = this.db.query('SELECT MAX(version) as version FROM schema_versions');
        var result = query.get();
        return (result === null || result === void 0 ? void 0 : result.version) || 0;
    };
    return DatabaseManager;
}());
exports.DatabaseManager = DatabaseManager;
/**
 * Get the global database instance (for compatibility)
 */
function getDatabase() {
    if (!dbInstance) {
        throw new Error('Database not initialized. Call DatabaseManager.getInstance().initialize() first.');
    }
    return dbInstance;
}
/**
 * Initialize and get database manager
 */
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var manager;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    manager = DatabaseManager.getInstance();
                    return [4 /*yield*/, manager.initialize()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Re-export MigrationRunner for external use
var runner_js_2 = require("./migrations/runner.js");
Object.defineProperty(exports, "MigrationRunner", { enumerable: true, get: function () { return runner_js_2.MigrationRunner; } });
// Re-export all module functions for convenient imports
__exportStar(require("./Sessions.js"), exports);
__exportStar(require("./Observations.js"), exports);
__exportStar(require("./Summaries.js"), exports);
__exportStar(require("./Prompts.js"), exports);
__exportStar(require("./Timeline.js"), exports);
__exportStar(require("./Import.js"), exports);
__exportStar(require("./transactions.js"), exports);
