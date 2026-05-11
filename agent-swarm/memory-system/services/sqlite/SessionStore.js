"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStore = void 0;
var bun_sqlite_1 = require("bun:sqlite");
var paths_js_1 = require("../../shared/paths.js");
var logger_js_1 = require("../../utils/logger.js");
var store_js_1 = require("./observations/store.js");
/**
 * Session data store for SDK sessions, observations, and summaries
 * Provides simple, synchronous CRUD operations for session-based memory
 */
var SessionStore = /** @class */ (function () {
    function SessionStore(dbPath) {
        if (dbPath === void 0) { dbPath = paths_js_1.DB_PATH; }
        if (dbPath !== ':memory:') {
            (0, paths_js_1.ensureDir)(paths_js_1.DATA_DIR);
        }
        this.db = new bun_sqlite_1.Database(dbPath);
        // Ensure optimized settings
        this.db.run('PRAGMA journal_mode = WAL');
        this.db.run('PRAGMA synchronous = NORMAL');
        this.db.run('PRAGMA foreign_keys = ON');
        // Initialize schema if needed (fresh database)
        this.initializeSchema();
        // Run migrations
        this.ensureWorkerPortColumn();
        this.ensurePromptTrackingColumns();
        this.removeSessionSummariesUniqueConstraint();
        this.addObservationHierarchicalFields();
        this.makeObservationsTextNullable();
        this.createUserPromptsTable();
        this.ensureDiscoveryTokensColumn();
        this.createPendingMessagesTable();
        this.renameSessionIdColumns();
        this.repairSessionIdColumnRename();
        this.addFailedAtEpochColumn();
        this.addOnUpdateCascadeToForeignKeys();
        this.addObservationContentHashColumn();
        this.addSessionCustomTitleColumn();
    }
    /**
     * Initialize database schema (migration004)
     *
     * ALWAYS creates core tables using CREATE TABLE IF NOT EXISTS — safe to run
     * regardless of schema_versions state.  This fixes issue #979 where the old
     * DatabaseManager migration system (versions 1-7) shared the schema_versions
     * table, causing maxApplied > 0 and skipping core table creation entirely.
     */
    SessionStore.prototype.initializeSchema = function () {
        // Create schema_versions table if it doesn't exist
        this.db.run("\n      CREATE TABLE IF NOT EXISTS schema_versions (\n        id INTEGER PRIMARY KEY,\n        version INTEGER UNIQUE NOT NULL,\n        applied_at TEXT NOT NULL\n      )\n    ");
        // Always create core tables — IF NOT EXISTS makes this idempotent
        this.db.run("\n      CREATE TABLE IF NOT EXISTS sdk_sessions (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        content_session_id TEXT UNIQUE NOT NULL,\n        memory_session_id TEXT UNIQUE,\n        project TEXT NOT NULL,\n        user_prompt TEXT,\n        started_at TEXT NOT NULL,\n        started_at_epoch INTEGER NOT NULL,\n        completed_at TEXT,\n        completed_at_epoch INTEGER,\n        status TEXT CHECK(status IN ('active', 'completed', 'failed')) NOT NULL DEFAULT 'active'\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_claude_id ON sdk_sessions(content_session_id);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_sdk_id ON sdk_sessions(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_project ON sdk_sessions(project);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_status ON sdk_sessions(status);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_started ON sdk_sessions(started_at_epoch DESC);\n\n      CREATE TABLE IF NOT EXISTS observations (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT NOT NULL,\n        project TEXT NOT NULL,\n        text TEXT NOT NULL,\n        type TEXT NOT NULL,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_observations_sdk_session ON observations(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_observations_project ON observations(project);\n      CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);\n      CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at_epoch DESC);\n\n      CREATE TABLE IF NOT EXISTS session_summaries (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT UNIQUE NOT NULL,\n        project TEXT NOT NULL,\n        request TEXT,\n        investigated TEXT,\n        learned TEXT,\n        completed TEXT,\n        next_steps TEXT,\n        files_read TEXT,\n        files_edited TEXT,\n        notes TEXT,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_session_summaries_sdk_session ON session_summaries(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_session_summaries_project ON session_summaries(project);\n      CREATE INDEX IF NOT EXISTS idx_session_summaries_created ON session_summaries(created_at_epoch DESC);\n    ");
        // Record migration004 as applied (OR IGNORE handles re-runs safely)
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(4, new Date().toISOString());
    };
    /**
     * Ensure worker_port column exists (migration 5)
     *
     * NOTE: Version 5 conflicts with old DatabaseManager migration005 (which drops orphaned tables).
     * We check actual column state rather than relying solely on version tracking.
     */
    SessionStore.prototype.ensureWorkerPortColumn = function () {
        // Check actual column existence — don't rely on version tracking alone (issue #979)
        var tableInfo = this.db.query('PRAGMA table_info(sdk_sessions)').all();
        var hasWorkerPort = tableInfo.some(function (col) { return col.name === 'worker_port'; });
        if (!hasWorkerPort) {
            this.db.run('ALTER TABLE sdk_sessions ADD COLUMN worker_port INTEGER');
            logger_js_1.logger.debug('DB', 'Added worker_port column to sdk_sessions table');
        }
        // Record migration
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(5, new Date().toISOString());
    };
    /**
     * Ensure prompt tracking columns exist (migration 6)
     *
     * NOTE: Version 6 conflicts with old DatabaseManager migration006 (which creates FTS5 tables).
     * We check actual column state rather than relying solely on version tracking.
     */
    SessionStore.prototype.ensurePromptTrackingColumns = function () {
        // Check actual column existence — don't rely on version tracking alone (issue #979)
        // Check sdk_sessions for prompt_counter
        var sessionsInfo = this.db.query('PRAGMA table_info(sdk_sessions)').all();
        var hasPromptCounter = sessionsInfo.some(function (col) { return col.name === 'prompt_counter'; });
        if (!hasPromptCounter) {
            this.db.run('ALTER TABLE sdk_sessions ADD COLUMN prompt_counter INTEGER DEFAULT 0');
            logger_js_1.logger.debug('DB', 'Added prompt_counter column to sdk_sessions table');
        }
        // Check observations for prompt_number
        var observationsInfo = this.db.query('PRAGMA table_info(observations)').all();
        var obsHasPromptNumber = observationsInfo.some(function (col) { return col.name === 'prompt_number'; });
        if (!obsHasPromptNumber) {
            this.db.run('ALTER TABLE observations ADD COLUMN prompt_number INTEGER');
            logger_js_1.logger.debug('DB', 'Added prompt_number column to observations table');
        }
        // Check session_summaries for prompt_number
        var summariesInfo = this.db.query('PRAGMA table_info(session_summaries)').all();
        var sumHasPromptNumber = summariesInfo.some(function (col) { return col.name === 'prompt_number'; });
        if (!sumHasPromptNumber) {
            this.db.run('ALTER TABLE session_summaries ADD COLUMN prompt_number INTEGER');
            logger_js_1.logger.debug('DB', 'Added prompt_number column to session_summaries table');
        }
        // Record migration
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(6, new Date().toISOString());
    };
    /**
     * Remove UNIQUE constraint from session_summaries.memory_session_id (migration 7)
     *
     * NOTE: Version 7 conflicts with old DatabaseManager migration007 (which adds discovery_tokens).
     * We check actual constraint state rather than relying solely on version tracking.
     */
    SessionStore.prototype.removeSessionSummariesUniqueConstraint = function () {
        // Check actual constraint state — don't rely on version tracking alone (issue #979)
        var summariesIndexes = this.db.query('PRAGMA index_list(session_summaries)').all();
        var hasUniqueConstraint = summariesIndexes.some(function (idx) { return idx.unique === 1; });
        if (!hasUniqueConstraint) {
            // Already migrated (no constraint exists)
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(7, new Date().toISOString());
            return;
        }
        logger_js_1.logger.debug('DB', 'Removing UNIQUE constraint from session_summaries.memory_session_id');
        // Begin transaction
        this.db.run('BEGIN TRANSACTION');
        // Clean up leftover temp table from a previously-crashed run
        this.db.run('DROP TABLE IF EXISTS session_summaries_new');
        // Create new table without UNIQUE constraint
        this.db.run("\n      CREATE TABLE session_summaries_new (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT NOT NULL,\n        project TEXT NOT NULL,\n        request TEXT,\n        investigated TEXT,\n        learned TEXT,\n        completed TEXT,\n        next_steps TEXT,\n        files_read TEXT,\n        files_edited TEXT,\n        notes TEXT,\n        prompt_number INTEGER,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE\n      )\n    ");
        // Copy data from old table
        this.db.run("\n      INSERT INTO session_summaries_new\n      SELECT id, memory_session_id, project, request, investigated, learned,\n             completed, next_steps, files_read, files_edited, notes,\n             prompt_number, created_at, created_at_epoch\n      FROM session_summaries\n    ");
        // Drop old table
        this.db.run('DROP TABLE session_summaries');
        // Rename new table
        this.db.run('ALTER TABLE session_summaries_new RENAME TO session_summaries');
        // Recreate indexes
        this.db.run("\n      CREATE INDEX idx_session_summaries_sdk_session ON session_summaries(memory_session_id);\n      CREATE INDEX idx_session_summaries_project ON session_summaries(project);\n      CREATE INDEX idx_session_summaries_created ON session_summaries(created_at_epoch DESC);\n    ");
        // Commit transaction
        this.db.run('COMMIT');
        // Record migration
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(7, new Date().toISOString());
        logger_js_1.logger.debug('DB', 'Successfully removed UNIQUE constraint from session_summaries.memory_session_id');
    };
    /**
     * Add hierarchical fields to observations table (migration 8)
     */
    SessionStore.prototype.addObservationHierarchicalFields = function () {
        // Check if migration already applied
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(8);
        if (applied)
            return;
        // Check if new fields already exist
        var tableInfo = this.db.query('PRAGMA table_info(observations)').all();
        var hasTitle = tableInfo.some(function (col) { return col.name === 'title'; });
        if (hasTitle) {
            // Already migrated
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(8, new Date().toISOString());
            return;
        }
        logger_js_1.logger.debug('DB', 'Adding hierarchical fields to observations table');
        // Add new columns
        this.db.run("\n      ALTER TABLE observations ADD COLUMN title TEXT;\n      ALTER TABLE observations ADD COLUMN subtitle TEXT;\n      ALTER TABLE observations ADD COLUMN facts TEXT;\n      ALTER TABLE observations ADD COLUMN narrative TEXT;\n      ALTER TABLE observations ADD COLUMN concepts TEXT;\n      ALTER TABLE observations ADD COLUMN files_read TEXT;\n      ALTER TABLE observations ADD COLUMN files_modified TEXT;\n    ");
        // Record migration
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(8, new Date().toISOString());
        logger_js_1.logger.debug('DB', 'Successfully added hierarchical fields to observations table');
    };
    /**
     * Make observations.text nullable (migration 9)
     * The text field is deprecated in favor of structured fields (title, subtitle, narrative, etc.)
     */
    SessionStore.prototype.makeObservationsTextNullable = function () {
        // Check if migration already applied
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(9);
        if (applied)
            return;
        // Check if text column is already nullable
        var tableInfo = this.db.query('PRAGMA table_info(observations)').all();
        var textColumn = tableInfo.find(function (col) { return col.name === 'text'; });
        if (!textColumn || textColumn.notnull === 0) {
            // Already migrated or text column doesn't exist
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(9, new Date().toISOString());
            return;
        }
        logger_js_1.logger.debug('DB', 'Making observations.text nullable');
        // Begin transaction
        this.db.run('BEGIN TRANSACTION');
        // Clean up leftover temp table from a previously-crashed run
        this.db.run('DROP TABLE IF EXISTS observations_new');
        // Create new table with text as nullable
        this.db.run("\n      CREATE TABLE observations_new (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT NOT NULL,\n        project TEXT NOT NULL,\n        text TEXT,\n        type TEXT NOT NULL,\n        title TEXT,\n        subtitle TEXT,\n        facts TEXT,\n        narrative TEXT,\n        concepts TEXT,\n        files_read TEXT,\n        files_modified TEXT,\n        prompt_number INTEGER,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE\n      )\n    ");
        // Copy data from old table (all existing columns)
        this.db.run("\n      INSERT INTO observations_new\n      SELECT id, memory_session_id, project, text, type, title, subtitle, facts,\n             narrative, concepts, files_read, files_modified, prompt_number,\n             created_at, created_at_epoch\n      FROM observations\n    ");
        // Drop old table
        this.db.run('DROP TABLE observations');
        // Rename new table
        this.db.run('ALTER TABLE observations_new RENAME TO observations');
        // Recreate indexes
        this.db.run("\n      CREATE INDEX idx_observations_sdk_session ON observations(memory_session_id);\n      CREATE INDEX idx_observations_project ON observations(project);\n      CREATE INDEX idx_observations_type ON observations(type);\n      CREATE INDEX idx_observations_created ON observations(created_at_epoch DESC);\n    ");
        // Commit transaction
        this.db.run('COMMIT');
        // Record migration
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(9, new Date().toISOString());
        logger_js_1.logger.debug('DB', 'Successfully made observations.text nullable');
    };
    /**
     * Create user_prompts table with FTS5 support (migration 10)
     */
    SessionStore.prototype.createUserPromptsTable = function () {
        // Check if migration already applied
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(10);
        if (applied)
            return;
        // Check if table already exists
        var tableInfo = this.db.query('PRAGMA table_info(user_prompts)').all();
        if (tableInfo.length > 0) {
            // Already migrated
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(10, new Date().toISOString());
            return;
        }
        logger_js_1.logger.debug('DB', 'Creating user_prompts table with FTS5 support');
        // Begin transaction
        this.db.run('BEGIN TRANSACTION');
        // Create main table (using content_session_id since memory_session_id is set asynchronously by worker)
        this.db.run("\n      CREATE TABLE user_prompts (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        content_session_id TEXT NOT NULL,\n        prompt_number INTEGER NOT NULL,\n        prompt_text TEXT NOT NULL,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY(content_session_id) REFERENCES sdk_sessions(content_session_id) ON DELETE CASCADE\n      );\n\n      CREATE INDEX idx_user_prompts_claude_session ON user_prompts(content_session_id);\n      CREATE INDEX idx_user_prompts_created ON user_prompts(created_at_epoch DESC);\n      CREATE INDEX idx_user_prompts_prompt_number ON user_prompts(prompt_number);\n      CREATE INDEX idx_user_prompts_lookup ON user_prompts(content_session_id, prompt_number);\n    ");
        // Create FTS5 virtual table — skip if FTS5 is unavailable (e.g., Bun on Windows #791).
        // The user_prompts table itself is still created; only FTS indexing is skipped.
        try {
            this.db.run("\n        CREATE VIRTUAL TABLE user_prompts_fts USING fts5(\n          prompt_text,\n          content='user_prompts',\n          content_rowid='id'\n        );\n      ");
            // Create triggers to sync FTS5
            this.db.run("\n        CREATE TRIGGER user_prompts_ai AFTER INSERT ON user_prompts BEGIN\n          INSERT INTO user_prompts_fts(rowid, prompt_text)\n          VALUES (new.id, new.prompt_text);\n        END;\n\n        CREATE TRIGGER user_prompts_ad AFTER DELETE ON user_prompts BEGIN\n          INSERT INTO user_prompts_fts(user_prompts_fts, rowid, prompt_text)\n          VALUES('delete', old.id, old.prompt_text);\n        END;\n\n        CREATE TRIGGER user_prompts_au AFTER UPDATE ON user_prompts BEGIN\n          INSERT INTO user_prompts_fts(user_prompts_fts, rowid, prompt_text)\n          VALUES('delete', old.id, old.prompt_text);\n          INSERT INTO user_prompts_fts(rowid, prompt_text)\n          VALUES (new.id, new.prompt_text);\n        END;\n      ");
        }
        catch (ftsError) {
            logger_js_1.logger.warn('DB', 'FTS5 not available — user_prompts_fts skipped (search uses ChromaDB)', {}, ftsError);
        }
        // Commit transaction
        this.db.run('COMMIT');
        // Record migration
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(10, new Date().toISOString());
        logger_js_1.logger.debug('DB', 'Successfully created user_prompts table');
    };
    /**
     * Ensure discovery_tokens column exists (migration 11)
     * CRITICAL: This migration was incorrectly using version 7 (which was already taken by removeSessionSummariesUniqueConstraint)
     * The duplicate version number may have caused migration tracking issues in some databases
     */
    SessionStore.prototype.ensureDiscoveryTokensColumn = function () {
        // Check if migration already applied to avoid unnecessary re-runs
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(11);
        if (applied)
            return;
        // Check if discovery_tokens column exists in observations table
        var observationsInfo = this.db.query('PRAGMA table_info(observations)').all();
        var obsHasDiscoveryTokens = observationsInfo.some(function (col) { return col.name === 'discovery_tokens'; });
        if (!obsHasDiscoveryTokens) {
            this.db.run('ALTER TABLE observations ADD COLUMN discovery_tokens INTEGER DEFAULT 0');
            logger_js_1.logger.debug('DB', 'Added discovery_tokens column to observations table');
        }
        // Check if discovery_tokens column exists in session_summaries table
        var summariesInfo = this.db.query('PRAGMA table_info(session_summaries)').all();
        var sumHasDiscoveryTokens = summariesInfo.some(function (col) { return col.name === 'discovery_tokens'; });
        if (!sumHasDiscoveryTokens) {
            this.db.run('ALTER TABLE session_summaries ADD COLUMN discovery_tokens INTEGER DEFAULT 0');
            logger_js_1.logger.debug('DB', 'Added discovery_tokens column to session_summaries table');
        }
        // Record migration only after successful column verification/addition
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(11, new Date().toISOString());
    };
    /**
     * Create pending_messages table for persistent work queue (migration 16)
     * Messages are persisted before processing and deleted after success.
     * Enables recovery from SDK hangs and worker crashes.
     */
    SessionStore.prototype.createPendingMessagesTable = function () {
        // Check if migration already applied
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(16);
        if (applied)
            return;
        // Check if table already exists
        var tables = this.db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='pending_messages'").all();
        if (tables.length > 0) {
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(16, new Date().toISOString());
            return;
        }
        logger_js_1.logger.debug('DB', 'Creating pending_messages table');
        this.db.run("\n      CREATE TABLE pending_messages (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        session_db_id INTEGER NOT NULL,\n        content_session_id TEXT NOT NULL,\n        message_type TEXT NOT NULL CHECK(message_type IN ('observation', 'summarize')),\n        tool_name TEXT,\n        tool_input TEXT,\n        tool_response TEXT,\n        cwd TEXT,\n        last_user_message TEXT,\n        last_assistant_message TEXT,\n        prompt_number INTEGER,\n        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'processed', 'failed')),\n        retry_count INTEGER NOT NULL DEFAULT 0,\n        created_at_epoch INTEGER NOT NULL,\n        started_processing_at_epoch INTEGER,\n        completed_at_epoch INTEGER,\n        FOREIGN KEY (session_db_id) REFERENCES sdk_sessions(id) ON DELETE CASCADE\n      )\n    ");
        this.db.run('CREATE INDEX IF NOT EXISTS idx_pending_messages_session ON pending_messages(session_db_id)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_pending_messages_status ON pending_messages(status)');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_pending_messages_claude_session ON pending_messages(content_session_id)');
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(16, new Date().toISOString());
        logger_js_1.logger.debug('DB', 'pending_messages table created successfully');
    };
    /**
     * Rename session ID columns for semantic clarity (migration 17)
     * - claude_session_id → content_session_id (user's observed session)
     * - sdk_session_id → memory_session_id (memory agent's session for resume)
     *
     * IDEMPOTENT: Checks each table individually before renaming.
     * This handles databases in any intermediate state (partial migration, fresh install, etc.)
     */
    SessionStore.prototype.renameSessionIdColumns = function () {
        var _this = this;
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(17);
        if (applied)
            return;
        logger_js_1.logger.debug('DB', 'Checking session ID columns for semantic clarity rename');
        var renamesPerformed = 0;
        // Helper to safely rename a column if it exists
        var safeRenameColumn = function (table, oldCol, newCol) {
            var tableInfo = _this.db.query("PRAGMA table_info(".concat(table, ")")).all();
            var hasOldCol = tableInfo.some(function (col) { return col.name === oldCol; });
            var hasNewCol = tableInfo.some(function (col) { return col.name === newCol; });
            if (hasNewCol) {
                // Already renamed, nothing to do
                return false;
            }
            if (hasOldCol) {
                // SQLite 3.25+ supports ALTER TABLE RENAME COLUMN
                _this.db.run("ALTER TABLE ".concat(table, " RENAME COLUMN ").concat(oldCol, " TO ").concat(newCol));
                logger_js_1.logger.debug('DB', "Renamed ".concat(table, ".").concat(oldCol, " to ").concat(newCol));
                return true;
            }
            // Neither column exists - table might not exist or has different schema
            logger_js_1.logger.warn('DB', "Column ".concat(oldCol, " not found in ").concat(table, ", skipping rename"));
            return false;
        };
        // Rename in sdk_sessions table
        if (safeRenameColumn('sdk_sessions', 'claude_session_id', 'content_session_id'))
            renamesPerformed++;
        if (safeRenameColumn('sdk_sessions', 'sdk_session_id', 'memory_session_id'))
            renamesPerformed++;
        // Rename in pending_messages table
        if (safeRenameColumn('pending_messages', 'claude_session_id', 'content_session_id'))
            renamesPerformed++;
        // Rename in observations table
        if (safeRenameColumn('observations', 'sdk_session_id', 'memory_session_id'))
            renamesPerformed++;
        // Rename in session_summaries table
        if (safeRenameColumn('session_summaries', 'sdk_session_id', 'memory_session_id'))
            renamesPerformed++;
        // Rename in user_prompts table
        if (safeRenameColumn('user_prompts', 'claude_session_id', 'content_session_id'))
            renamesPerformed++;
        // Record migration
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(17, new Date().toISOString());
        if (renamesPerformed > 0) {
            logger_js_1.logger.debug('DB', "Successfully renamed ".concat(renamesPerformed, " session ID columns"));
        }
        else {
            logger_js_1.logger.debug('DB', 'No session ID column renames needed (already up to date)');
        }
    };
    /**
     * Repair session ID column renames (migration 19)
     * DEPRECATED: Migration 17 is now fully idempotent and handles all cases.
     * This migration is kept for backwards compatibility but does nothing.
     */
    SessionStore.prototype.repairSessionIdColumnRename = function () {
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(19);
        if (applied)
            return;
        // Migration 17 now handles all column rename cases idempotently.
        // Just record this migration as applied.
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(19, new Date().toISOString());
    };
    /**
     * Add failed_at_epoch column to pending_messages (migration 20)
     * Used by markSessionMessagesFailed() for error recovery tracking
     */
    SessionStore.prototype.addFailedAtEpochColumn = function () {
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(20);
        if (applied)
            return;
        var tableInfo = this.db.query('PRAGMA table_info(pending_messages)').all();
        var hasColumn = tableInfo.some(function (col) { return col.name === 'failed_at_epoch'; });
        if (!hasColumn) {
            this.db.run('ALTER TABLE pending_messages ADD COLUMN failed_at_epoch INTEGER');
            logger_js_1.logger.debug('DB', 'Added failed_at_epoch column to pending_messages table');
        }
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(20, new Date().toISOString());
    };
    /**
     * Add ON UPDATE CASCADE to FK constraints on observations and session_summaries (migration 21)
     *
     * Both tables have FK(memory_session_id) -> sdk_sessions(memory_session_id) with ON DELETE CASCADE
     * but missing ON UPDATE CASCADE. This causes FK constraint violations when code updates
     * sdk_sessions.memory_session_id while child rows still reference the old value.
     *
     * SQLite doesn't support ALTER TABLE for FK changes, so we recreate both tables.
     */
    SessionStore.prototype.addOnUpdateCascadeToForeignKeys = function () {
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(21);
        if (applied)
            return;
        logger_js_1.logger.debug('DB', 'Adding ON UPDATE CASCADE to FK constraints on observations and session_summaries');
        // PRAGMA foreign_keys must be set outside a transaction
        this.db.run('PRAGMA foreign_keys = OFF');
        this.db.run('BEGIN TRANSACTION');
        try {
            // ==========================================
            // 1. Recreate observations table
            // ==========================================
            // Drop FTS triggers first (they reference the observations table)
            this.db.run('DROP TRIGGER IF EXISTS observations_ai');
            this.db.run('DROP TRIGGER IF EXISTS observations_ad');
            this.db.run('DROP TRIGGER IF EXISTS observations_au');
            // Clean up leftover temp table from a previously-crashed run
            this.db.run('DROP TABLE IF EXISTS observations_new');
            this.db.run("\n        CREATE TABLE observations_new (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          memory_session_id TEXT NOT NULL,\n          project TEXT NOT NULL,\n          text TEXT,\n          type TEXT NOT NULL,\n          title TEXT,\n          subtitle TEXT,\n          facts TEXT,\n          narrative TEXT,\n          concepts TEXT,\n          files_read TEXT,\n          files_modified TEXT,\n          prompt_number INTEGER,\n          discovery_tokens INTEGER DEFAULT 0,\n          created_at TEXT NOT NULL,\n          created_at_epoch INTEGER NOT NULL,\n          FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE\n        )\n      ");
            this.db.run("\n        INSERT INTO observations_new\n        SELECT id, memory_session_id, project, text, type, title, subtitle, facts,\n               narrative, concepts, files_read, files_modified, prompt_number,\n               discovery_tokens, created_at, created_at_epoch\n        FROM observations\n      ");
            this.db.run('DROP TABLE observations');
            this.db.run('ALTER TABLE observations_new RENAME TO observations');
            // Recreate indexes
            this.db.run("\n        CREATE INDEX idx_observations_sdk_session ON observations(memory_session_id);\n        CREATE INDEX idx_observations_project ON observations(project);\n        CREATE INDEX idx_observations_type ON observations(type);\n        CREATE INDEX idx_observations_created ON observations(created_at_epoch DESC);\n      ");
            // Recreate FTS triggers only if observations_fts exists
            // (SessionSearch.ensureFTSTables creates it on first use with IF NOT EXISTS)
            var hasFTS = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='observations_fts'").all().length > 0;
            if (hasFTS) {
                this.db.run("\n          CREATE TRIGGER IF NOT EXISTS observations_ai AFTER INSERT ON observations BEGIN\n            INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n            VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);\n          END;\n\n          CREATE TRIGGER IF NOT EXISTS observations_ad AFTER DELETE ON observations BEGIN\n            INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)\n            VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);\n          END;\n\n          CREATE TRIGGER IF NOT EXISTS observations_au AFTER UPDATE ON observations BEGIN\n            INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)\n            VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);\n            INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n            VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);\n          END;\n        ");
            }
            // ==========================================
            // 2. Recreate session_summaries table
            // ==========================================
            // Clean up leftover temp table from a previously-crashed run
            this.db.run('DROP TABLE IF EXISTS session_summaries_new');
            this.db.run("\n        CREATE TABLE session_summaries_new (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          memory_session_id TEXT NOT NULL,\n          project TEXT NOT NULL,\n          request TEXT,\n          investigated TEXT,\n          learned TEXT,\n          completed TEXT,\n          next_steps TEXT,\n          files_read TEXT,\n          files_edited TEXT,\n          notes TEXT,\n          prompt_number INTEGER,\n          discovery_tokens INTEGER DEFAULT 0,\n          created_at TEXT NOT NULL,\n          created_at_epoch INTEGER NOT NULL,\n          FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE ON UPDATE CASCADE\n        )\n      ");
            this.db.run("\n        INSERT INTO session_summaries_new\n        SELECT id, memory_session_id, project, request, investigated, learned,\n               completed, next_steps, files_read, files_edited, notes,\n               prompt_number, discovery_tokens, created_at, created_at_epoch\n        FROM session_summaries\n      ");
            // Drop session_summaries FTS triggers before dropping the table
            this.db.run('DROP TRIGGER IF EXISTS session_summaries_ai');
            this.db.run('DROP TRIGGER IF EXISTS session_summaries_ad');
            this.db.run('DROP TRIGGER IF EXISTS session_summaries_au');
            this.db.run('DROP TABLE session_summaries');
            this.db.run('ALTER TABLE session_summaries_new RENAME TO session_summaries');
            // Recreate indexes
            this.db.run("\n        CREATE INDEX idx_session_summaries_sdk_session ON session_summaries(memory_session_id);\n        CREATE INDEX idx_session_summaries_project ON session_summaries(project);\n        CREATE INDEX idx_session_summaries_created ON session_summaries(created_at_epoch DESC);\n      ");
            // Recreate session_summaries FTS triggers if FTS table exists
            var hasSummariesFTS = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='session_summaries_fts'").all().length > 0;
            if (hasSummariesFTS) {
                this.db.run("\n          CREATE TRIGGER IF NOT EXISTS session_summaries_ai AFTER INSERT ON session_summaries BEGIN\n            INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n            VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);\n          END;\n\n          CREATE TRIGGER IF NOT EXISTS session_summaries_ad AFTER DELETE ON session_summaries BEGIN\n            INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)\n            VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);\n          END;\n\n          CREATE TRIGGER IF NOT EXISTS session_summaries_au AFTER UPDATE ON session_summaries BEGIN\n            INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)\n            VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);\n            INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n            VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);\n          END;\n        ");
            }
            // Record migration
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(21, new Date().toISOString());
            this.db.run('COMMIT');
            this.db.run('PRAGMA foreign_keys = ON');
            logger_js_1.logger.debug('DB', 'Successfully added ON UPDATE CASCADE to FK constraints');
        }
        catch (error) {
            this.db.run('ROLLBACK');
            this.db.run('PRAGMA foreign_keys = ON');
            throw error;
        }
    };
    /**
     * Add content_hash column to observations for deduplication (migration 22)
     */
    SessionStore.prototype.addObservationContentHashColumn = function () {
        // Check actual schema first — cross-machine DB sync can leave schema_versions
        // claiming this migration ran while the column is actually missing.
        var tableInfo = this.db.query('PRAGMA table_info(observations)').all();
        var hasColumn = tableInfo.some(function (col) { return col.name === 'content_hash'; });
        if (hasColumn) {
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(22, new Date().toISOString());
            return;
        }
        this.db.run('ALTER TABLE observations ADD COLUMN content_hash TEXT');
        this.db.run("UPDATE observations SET content_hash = substr(hex(randomblob(8)), 1, 16) WHERE content_hash IS NULL");
        this.db.run('CREATE INDEX IF NOT EXISTS idx_observations_content_hash ON observations(content_hash, created_at_epoch)');
        logger_js_1.logger.debug('DB', 'Added content_hash column to observations table with backfill and index');
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(22, new Date().toISOString());
    };
    /**
     * Add custom_title column to sdk_sessions for agent attribution (migration 23)
     */
    SessionStore.prototype.addSessionCustomTitleColumn = function () {
        var applied = this.db.prepare('SELECT version FROM schema_versions WHERE version = ?').get(23);
        if (applied)
            return;
        var tableInfo = this.db.query('PRAGMA table_info(sdk_sessions)').all();
        var hasColumn = tableInfo.some(function (col) { return col.name === 'custom_title'; });
        if (!hasColumn) {
            this.db.run('ALTER TABLE sdk_sessions ADD COLUMN custom_title TEXT');
            logger_js_1.logger.debug('DB', 'Added custom_title column to sdk_sessions table');
        }
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(23, new Date().toISOString());
    };
    /**
     * Update the memory session ID for a session
     * Called by SDKAgent when it captures the session ID from the first SDK message
     * Also used to RESET to null on stale resume failures (worker-service.ts)
     */
    SessionStore.prototype.updateMemorySessionId = function (sessionDbId, memorySessionId) {
        this.db.prepare("\n      UPDATE sdk_sessions\n      SET memory_session_id = ?\n      WHERE id = ?\n    ").run(memorySessionId, sessionDbId);
    };
    /**
     * Ensures memory_session_id is registered in sdk_sessions before FK-constrained INSERT.
     * This fixes Issue #846 where observations fail after worker restart because the
     * SDK generates a new memory_session_id but it's not registered in the parent table
     * before child records try to reference it.
     *
     * @param sessionDbId - The database ID of the session
     * @param memorySessionId - The memory session ID to ensure is registered
     */
    SessionStore.prototype.ensureMemorySessionIdRegistered = function (sessionDbId, memorySessionId) {
        var session = this.db.prepare("\n      SELECT id, memory_session_id FROM sdk_sessions WHERE id = ?\n    ").get(sessionDbId);
        if (!session) {
            throw new Error("Session ".concat(sessionDbId, " not found in sdk_sessions"));
        }
        if (session.memory_session_id !== memorySessionId) {
            this.db.prepare("\n        UPDATE sdk_sessions SET memory_session_id = ? WHERE id = ?\n      ").run(memorySessionId, sessionDbId);
            logger_js_1.logger.info('DB', 'Registered memory_session_id before storage (FK fix)', {
                sessionDbId: sessionDbId,
                oldId: session.memory_session_id,
                newId: memorySessionId
            });
        }
    };
    /**
     * Get recent session summaries for a project
     */
    SessionStore.prototype.getRecentSummaries = function (project, limit) {
        if (limit === void 0) { limit = 10; }
        var stmt = this.db.prepare("\n      SELECT\n        request, investigated, learned, completed, next_steps,\n        files_read, files_edited, notes, prompt_number, created_at\n      FROM session_summaries\n      WHERE project = ?\n      ORDER BY created_at_epoch DESC\n      LIMIT ?\n    ");
        return stmt.all(project, limit);
    };
    /**
     * Get recent summaries with session info for context display
     */
    SessionStore.prototype.getRecentSummariesWithSessionInfo = function (project, limit) {
        if (limit === void 0) { limit = 3; }
        var stmt = this.db.prepare("\n      SELECT\n        memory_session_id, request, learned, completed, next_steps,\n        prompt_number, created_at\n      FROM session_summaries\n      WHERE project = ?\n      ORDER BY created_at_epoch DESC\n      LIMIT ?\n    ");
        return stmt.all(project, limit);
    };
    /**
     * Get recent observations for a project
     */
    SessionStore.prototype.getRecentObservations = function (project, limit) {
        if (limit === void 0) { limit = 20; }
        var stmt = this.db.prepare("\n      SELECT type, text, prompt_number, created_at\n      FROM observations\n      WHERE project = ?\n      ORDER BY created_at_epoch DESC\n      LIMIT ?\n    ");
        return stmt.all(project, limit);
    };
    /**
     * Get recent observations across all projects (for web UI)
     */
    SessionStore.prototype.getAllRecentObservations = function (limit) {
        if (limit === void 0) { limit = 100; }
        var stmt = this.db.prepare("\n      SELECT id, type, title, subtitle, text, project, prompt_number, created_at, created_at_epoch\n      FROM observations\n      ORDER BY created_at_epoch DESC\n      LIMIT ?\n    ");
        return stmt.all(limit);
    };
    /**
     * Get recent summaries across all projects (for web UI)
     */
    SessionStore.prototype.getAllRecentSummaries = function (limit) {
        if (limit === void 0) { limit = 50; }
        var stmt = this.db.prepare("\n      SELECT id, request, investigated, learned, completed, next_steps,\n             files_read, files_edited, notes, project, prompt_number,\n             created_at, created_at_epoch\n      FROM session_summaries\n      ORDER BY created_at_epoch DESC\n      LIMIT ?\n    ");
        return stmt.all(limit);
    };
    /**
     * Get recent user prompts across all sessions (for web UI)
     */
    SessionStore.prototype.getAllRecentUserPrompts = function (limit) {
        if (limit === void 0) { limit = 100; }
        var stmt = this.db.prepare("\n      SELECT\n        up.id,\n        up.content_session_id,\n        s.project,\n        up.prompt_number,\n        up.prompt_text,\n        up.created_at,\n        up.created_at_epoch\n      FROM user_prompts up\n      LEFT JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n      ORDER BY up.created_at_epoch DESC\n      LIMIT ?\n    ");
        return stmt.all(limit);
    };
    /**
     * Get all unique projects from the database (for web UI project filter)
     */
    SessionStore.prototype.getAllProjects = function () {
        var stmt = this.db.prepare("\n      SELECT DISTINCT project\n      FROM sdk_sessions\n      WHERE project IS NOT NULL AND project != ''\n      ORDER BY project ASC\n    ");
        var rows = stmt.all();
        return rows.map(function (row) { return row.project; });
    };
    /**
     * Get latest user prompt with session info for a Claude session
     * Used for syncing prompts to Chroma during session initialization
     */
    SessionStore.prototype.getLatestUserPrompt = function (contentSessionId) {
        var stmt = this.db.prepare("\n      SELECT\n        up.*,\n        s.memory_session_id,\n        s.project\n      FROM user_prompts up\n      JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n      WHERE up.content_session_id = ?\n      ORDER BY up.created_at_epoch DESC\n      LIMIT 1\n    ");
        return stmt.get(contentSessionId);
    };
    /**
     * Get recent sessions with their status and summary info
     */
    SessionStore.prototype.getRecentSessionsWithStatus = function (project, limit) {
        if (limit === void 0) { limit = 3; }
        var stmt = this.db.prepare("\n      SELECT * FROM (\n        SELECT\n          s.memory_session_id,\n          s.status,\n          s.started_at,\n          s.started_at_epoch,\n          s.user_prompt,\n          CASE WHEN sum.memory_session_id IS NOT NULL THEN 1 ELSE 0 END as has_summary\n        FROM sdk_sessions s\n        LEFT JOIN session_summaries sum ON s.memory_session_id = sum.memory_session_id\n        WHERE s.project = ? AND s.memory_session_id IS NOT NULL\n        GROUP BY s.memory_session_id\n        ORDER BY s.started_at_epoch DESC\n        LIMIT ?\n      )\n      ORDER BY started_at_epoch ASC\n    ");
        return stmt.all(project, limit);
    };
    /**
     * Get observations for a specific session
     */
    SessionStore.prototype.getObservationsForSession = function (memorySessionId) {
        var stmt = this.db.prepare("\n      SELECT title, subtitle, type, prompt_number\n      FROM observations\n      WHERE memory_session_id = ?\n      ORDER BY created_at_epoch ASC\n    ");
        return stmt.all(memorySessionId);
    };
    /**
     * Get a single observation by ID
     */
    SessionStore.prototype.getObservationById = function (id) {
        var stmt = this.db.prepare("\n      SELECT *\n      FROM observations\n      WHERE id = ?\n    ");
        return stmt.get(id) || null;
    };
    /**
     * Get observations by array of IDs with ordering and limit
     */
    SessionStore.prototype.getObservationsByIds = function (ids, options) {
        if (options === void 0) { options = {}; }
        if (ids.length === 0)
            return [];
        var _a = options.orderBy, orderBy = _a === void 0 ? 'date_desc' : _a, limit = options.limit, project = options.project, type = options.type, concepts = options.concepts, files = options.files;
        var orderClause = orderBy === 'date_asc' ? 'ASC' : 'DESC';
        var limitClause = limit ? "LIMIT ".concat(limit) : '';
        // Build placeholders for IN clause
        var placeholders = ids.map(function () { return '?'; }).join(',');
        var params = __spreadArray([], ids, true);
        var additionalConditions = [];
        // Apply project filter
        if (project) {
            additionalConditions.push('project = ?');
            params.push(project);
        }
        // Apply type filter
        if (type) {
            if (Array.isArray(type)) {
                var typePlaceholders = type.map(function () { return '?'; }).join(',');
                additionalConditions.push("type IN (".concat(typePlaceholders, ")"));
                params.push.apply(params, type);
            }
            else {
                additionalConditions.push('type = ?');
                params.push(type);
            }
        }
        // Apply concepts filter
        if (concepts) {
            var conceptsList = Array.isArray(concepts) ? concepts : [concepts];
            var conceptConditions = conceptsList.map(function () {
                return 'EXISTS (SELECT 1 FROM json_each(concepts) WHERE value = ?)';
            });
            params.push.apply(params, conceptsList);
            additionalConditions.push("(".concat(conceptConditions.join(' OR '), ")"));
        }
        // Apply files filter
        if (files) {
            var filesList = Array.isArray(files) ? files : [files];
            var fileConditions = filesList.map(function () {
                return '(EXISTS (SELECT 1 FROM json_each(files_read) WHERE value LIKE ?) OR EXISTS (SELECT 1 FROM json_each(files_modified) WHERE value LIKE ?))';
            });
            filesList.forEach(function (file) {
                params.push("%".concat(file, "%"), "%".concat(file, "%"));
            });
            additionalConditions.push("(".concat(fileConditions.join(' OR '), ")"));
        }
        var whereClause = additionalConditions.length > 0
            ? "WHERE id IN (".concat(placeholders, ") AND ").concat(additionalConditions.join(' AND '))
            : "WHERE id IN (".concat(placeholders, ")");
        var stmt = this.db.prepare("\n      SELECT *\n      FROM observations\n      ".concat(whereClause, "\n      ORDER BY created_at_epoch ").concat(orderClause, "\n      ").concat(limitClause, "\n    "));
        return stmt.all.apply(stmt, params);
    };
    /**
     * Get summary for a specific session
     */
    SessionStore.prototype.getSummaryForSession = function (memorySessionId) {
        var stmt = this.db.prepare("\n      SELECT\n        request, investigated, learned, completed, next_steps,\n        files_read, files_edited, notes, prompt_number, created_at,\n        created_at_epoch\n      FROM session_summaries\n      WHERE memory_session_id = ?\n      ORDER BY created_at_epoch DESC\n      LIMIT 1\n    ");
        return stmt.get(memorySessionId) || null;
    };
    /**
     * Get aggregated files from all observations for a session
     */
    SessionStore.prototype.getFilesForSession = function (memorySessionId) {
        var stmt = this.db.prepare("\n      SELECT files_read, files_modified\n      FROM observations\n      WHERE memory_session_id = ?\n    ");
        var rows = stmt.all(memorySessionId);
        var filesReadSet = new Set();
        var filesModifiedSet = new Set();
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var row = rows_1[_i];
            // Parse files_read
            if (row.files_read) {
                var files = JSON.parse(row.files_read);
                if (Array.isArray(files)) {
                    files.forEach(function (f) { return filesReadSet.add(f); });
                }
            }
            // Parse files_modified
            if (row.files_modified) {
                var files = JSON.parse(row.files_modified);
                if (Array.isArray(files)) {
                    files.forEach(function (f) { return filesModifiedSet.add(f); });
                }
            }
        }
        return {
            filesRead: Array.from(filesReadSet),
            filesModified: Array.from(filesModifiedSet)
        };
    };
    /**
     * Get session by ID
     */
    SessionStore.prototype.getSessionById = function (id) {
        var stmt = this.db.prepare("\n      SELECT id, content_session_id, memory_session_id, project, user_prompt, custom_title\n      FROM sdk_sessions\n      WHERE id = ?\n      LIMIT 1\n    ");
        return stmt.get(id) || null;
    };
    /**
     * Get SDK sessions by SDK session IDs
     * Used for exporting session metadata
     */
    SessionStore.prototype.getSdkSessionsBySessionIds = function (memorySessionIds) {
        if (memorySessionIds.length === 0)
            return [];
        var placeholders = memorySessionIds.map(function () { return '?'; }).join(',');
        var stmt = this.db.prepare("\n      SELECT id, content_session_id, memory_session_id, project, user_prompt, custom_title,\n             started_at, started_at_epoch, completed_at, completed_at_epoch, status\n      FROM sdk_sessions\n      WHERE memory_session_id IN (".concat(placeholders, ")\n      ORDER BY started_at_epoch DESC\n    "));
        return stmt.all.apply(stmt, memorySessionIds);
    };
    /**
     * Get current prompt number by counting user_prompts for this session
     * Replaces the prompt_counter column which is no longer maintained
     */
    SessionStore.prototype.getPromptNumberFromUserPrompts = function (contentSessionId) {
        var result = this.db.prepare("\n      SELECT COUNT(*) as count FROM user_prompts WHERE content_session_id = ?\n    ").get(contentSessionId);
        return result.count;
    };
    /**
     * Create a new SDK session (idempotent - returns existing session ID if already exists)
     *
     * CRITICAL ARCHITECTURE: Session ID Threading
     * ============================================
     * This function is the KEY to how claude-mem stays unified across hooks:
     *
     * - NEW hook calls: createSDKSession(session_id, project, prompt)
     * - SAVE hook calls: createSDKSession(session_id, '', '')
     * - Both use the SAME session_id from Claude Code's hook context
     *
     * IDEMPOTENT BEHAVIOR (INSERT OR IGNORE):
     * - Prompt #1: session_id not in database → INSERT creates new row
     * - Prompt #2+: session_id exists → INSERT ignored, fetch existing ID
     * - Result: Same database ID returned for all prompts in conversation
     *
     * Pure get-or-create: never modifies memory_session_id.
     * Multi-terminal isolation is handled by ON UPDATE CASCADE at the schema level.
     */
    SessionStore.prototype.createSDKSession = function (contentSessionId, project, userPrompt, customTitle) {
        var now = new Date();
        var nowEpoch = now.getTime();
        // Session reuse: Return existing session ID if already created for this contentSessionId.
        var existing = this.db.prepare("\n      SELECT id FROM sdk_sessions WHERE content_session_id = ?\n    ").get(contentSessionId);
        if (existing) {
            // Backfill project if session was created by another hook with empty project
            if (project) {
                this.db.prepare("\n          UPDATE sdk_sessions SET project = ?\n          WHERE content_session_id = ? AND (project IS NULL OR project = '')\n        ").run(project, contentSessionId);
            }
            // Backfill custom_title if provided and not yet set
            if (customTitle) {
                this.db.prepare("\n          UPDATE sdk_sessions SET custom_title = ?\n          WHERE content_session_id = ? AND custom_title IS NULL\n        ").run(customTitle, contentSessionId);
            }
            return existing.id;
        }
        // New session - insert fresh row
        // NOTE: memory_session_id starts as NULL. It is captured by SDKAgent from the first SDK
        // response and stored via ensureMemorySessionIdRegistered(). CRITICAL: memory_session_id
        // must NEVER equal contentSessionId - that would inject memory messages into the user's transcript!
        this.db.prepare("\n      INSERT INTO sdk_sessions\n      (content_session_id, memory_session_id, project, user_prompt, custom_title, started_at, started_at_epoch, status)\n      VALUES (?, NULL, ?, ?, ?, ?, ?, 'active')\n    ").run(contentSessionId, project, userPrompt, customTitle || null, now.toISOString(), nowEpoch);
        // Return new ID
        var row = this.db.prepare('SELECT id FROM sdk_sessions WHERE content_session_id = ?')
            .get(contentSessionId);
        return row.id;
    };
    /**
     * Save a user prompt
     */
    SessionStore.prototype.saveUserPrompt = function (contentSessionId, promptNumber, promptText) {
        var now = new Date();
        var nowEpoch = now.getTime();
        var stmt = this.db.prepare("\n      INSERT INTO user_prompts\n      (content_session_id, prompt_number, prompt_text, created_at, created_at_epoch)\n      VALUES (?, ?, ?, ?, ?)\n    ");
        var result = stmt.run(contentSessionId, promptNumber, promptText, now.toISOString(), nowEpoch);
        return result.lastInsertRowid;
    };
    /**
     * Get user prompt by session ID and prompt number
     * Returns the prompt text, or null if not found
     */
    SessionStore.prototype.getUserPrompt = function (contentSessionId, promptNumber) {
        var _a;
        var stmt = this.db.prepare("\n      SELECT prompt_text\n      FROM user_prompts\n      WHERE content_session_id = ? AND prompt_number = ?\n      LIMIT 1\n    ");
        var result = stmt.get(contentSessionId, promptNumber);
        return (_a = result === null || result === void 0 ? void 0 : result.prompt_text) !== null && _a !== void 0 ? _a : null;
    };
    /**
     * Store an observation (from SDK parsing)
     * Assumes session already exists (created by hook)
     * Performs content-hash deduplication: skips INSERT if an identical observation exists within 30s
     */
    SessionStore.prototype.storeObservation = function (memorySessionId, project, observation, promptNumber, discoveryTokens, overrideTimestampEpoch) {
        if (discoveryTokens === void 0) { discoveryTokens = 0; }
        // Use override timestamp if provided (for processing backlog messages with original timestamps)
        var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
        var timestampIso = new Date(timestampEpoch).toISOString();
        // Content-hash deduplication
        var contentHash = (0, store_js_1.computeObservationContentHash)(memorySessionId, observation.title, observation.narrative);
        var existing = (0, store_js_1.findDuplicateObservation)(this.db, contentHash, timestampEpoch);
        if (existing) {
            return { id: existing.id, createdAtEpoch: existing.created_at_epoch };
        }
        var stmt = this.db.prepare("\n      INSERT INTO observations\n      (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,\n       files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch)\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ");
        var result = stmt.run(memorySessionId, project, observation.type, observation.title, observation.subtitle, JSON.stringify(observation.facts), observation.narrative, JSON.stringify(observation.concepts), JSON.stringify(observation.files_read), JSON.stringify(observation.files_modified), promptNumber || null, discoveryTokens, contentHash, timestampIso, timestampEpoch);
        return {
            id: Number(result.lastInsertRowid),
            createdAtEpoch: timestampEpoch
        };
    };
    /**
     * Store a session summary (from SDK parsing)
     * Assumes session already exists - will fail with FK error if not
     */
    SessionStore.prototype.storeSummary = function (memorySessionId, project, summary, promptNumber, discoveryTokens, overrideTimestampEpoch) {
        if (discoveryTokens === void 0) { discoveryTokens = 0; }
        // Use override timestamp if provided (for processing backlog messages with original timestamps)
        var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
        var timestampIso = new Date(timestampEpoch).toISOString();
        var stmt = this.db.prepare("\n      INSERT INTO session_summaries\n      (memory_session_id, project, request, investigated, learned, completed,\n       next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ");
        var result = stmt.run(memorySessionId, project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.notes, promptNumber || null, discoveryTokens, timestampIso, timestampEpoch);
        return {
            id: Number(result.lastInsertRowid),
            createdAtEpoch: timestampEpoch
        };
    };
    /**
     * ATOMIC: Store observations + summary (no message tracking)
     *
     * Simplified version for use with claim-and-delete queue pattern.
     * Messages are deleted from queue immediately on claim, so there's no
     * message completion to track. This just stores observations and summary.
     *
     * @param memorySessionId - SDK memory session ID
     * @param project - Project name
     * @param observations - Array of observations to store (can be empty)
     * @param summary - Optional summary to store
     * @param promptNumber - Optional prompt number
     * @param discoveryTokens - Discovery tokens count
     * @param overrideTimestampEpoch - Optional override timestamp
     * @returns Object with observation IDs, optional summary ID, and timestamp
     */
    SessionStore.prototype.storeObservations = function (memorySessionId, project, observations, summary, promptNumber, discoveryTokens, overrideTimestampEpoch) {
        var _this = this;
        if (discoveryTokens === void 0) { discoveryTokens = 0; }
        // Use override timestamp if provided
        var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
        var timestampIso = new Date(timestampEpoch).toISOString();
        // Create transaction that wraps all operations
        var storeTx = this.db.transaction(function () {
            var observationIds = [];
            // 1. Store all observations (with content-hash deduplication)
            var obsStmt = _this.db.prepare("\n        INSERT INTO observations\n        (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,\n         files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch)\n        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n      ");
            for (var _i = 0, observations_1 = observations; _i < observations_1.length; _i++) {
                var observation = observations_1[_i];
                // Content-hash deduplication (same logic as storeObservation singular)
                var contentHash = (0, store_js_1.computeObservationContentHash)(memorySessionId, observation.title, observation.narrative);
                var existing = (0, store_js_1.findDuplicateObservation)(_this.db, contentHash, timestampEpoch);
                if (existing) {
                    observationIds.push(existing.id);
                    continue;
                }
                var result = obsStmt.run(memorySessionId, project, observation.type, observation.title, observation.subtitle, JSON.stringify(observation.facts), observation.narrative, JSON.stringify(observation.concepts), JSON.stringify(observation.files_read), JSON.stringify(observation.files_modified), promptNumber || null, discoveryTokens, contentHash, timestampIso, timestampEpoch);
                observationIds.push(Number(result.lastInsertRowid));
            }
            // 2. Store summary if provided
            var summaryId = null;
            if (summary) {
                var summaryStmt = _this.db.prepare("\n          INSERT INTO session_summaries\n          (memory_session_id, project, request, investigated, learned, completed,\n           next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)\n          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n        ");
                var result = summaryStmt.run(memorySessionId, project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.notes, promptNumber || null, discoveryTokens, timestampIso, timestampEpoch);
                summaryId = Number(result.lastInsertRowid);
            }
            return { observationIds: observationIds, summaryId: summaryId, createdAtEpoch: timestampEpoch };
        });
        // Execute the transaction and return results
        return storeTx();
    };
    /**
     * @deprecated Use storeObservations instead. This method is kept for backwards compatibility.
     *
     * ATOMIC: Store observations + summary + mark pending message as processed
     *
     * This method wraps observation storage, summary storage, and message completion
     * in a single database transaction to prevent race conditions. If the worker crashes
     * during processing, either all operations succeed together or all fail together.
     *
     * This fixes the observation duplication bug where observations were stored but
     * the message wasn't marked complete, causing reprocessing on crash recovery.
     *
     * @param memorySessionId - SDK memory session ID
     * @param project - Project name
     * @param observations - Array of observations to store (can be empty)
     * @param summary - Optional summary to store
     * @param messageId - Pending message ID to mark as processed
     * @param pendingStore - PendingMessageStore instance for marking complete
     * @param promptNumber - Optional prompt number
     * @param discoveryTokens - Discovery tokens count
     * @param overrideTimestampEpoch - Optional override timestamp
     * @returns Object with observation IDs, optional summary ID, and timestamp
     */
    SessionStore.prototype.storeObservationsAndMarkComplete = function (memorySessionId, project, observations, summary, messageId, _pendingStore, promptNumber, discoveryTokens, overrideTimestampEpoch) {
        var _this = this;
        if (discoveryTokens === void 0) { discoveryTokens = 0; }
        // Use override timestamp if provided
        var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
        var timestampIso = new Date(timestampEpoch).toISOString();
        // Create transaction that wraps all operations
        var storeAndMarkTx = this.db.transaction(function () {
            var observationIds = [];
            // 1. Store all observations (with content-hash deduplication)
            var obsStmt = _this.db.prepare("\n        INSERT INTO observations\n        (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,\n         files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch)\n        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n      ");
            for (var _i = 0, observations_2 = observations; _i < observations_2.length; _i++) {
                var observation = observations_2[_i];
                // Content-hash deduplication (same logic as storeObservation singular)
                var contentHash = (0, store_js_1.computeObservationContentHash)(memorySessionId, observation.title, observation.narrative);
                var existing = (0, store_js_1.findDuplicateObservation)(_this.db, contentHash, timestampEpoch);
                if (existing) {
                    observationIds.push(existing.id);
                    continue;
                }
                var result = obsStmt.run(memorySessionId, project, observation.type, observation.title, observation.subtitle, JSON.stringify(observation.facts), observation.narrative, JSON.stringify(observation.concepts), JSON.stringify(observation.files_read), JSON.stringify(observation.files_modified), promptNumber || null, discoveryTokens, contentHash, timestampIso, timestampEpoch);
                observationIds.push(Number(result.lastInsertRowid));
            }
            // 2. Store summary if provided
            var summaryId;
            if (summary) {
                var summaryStmt = _this.db.prepare("\n          INSERT INTO session_summaries\n          (memory_session_id, project, request, investigated, learned, completed,\n           next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)\n          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n        ");
                var result = summaryStmt.run(memorySessionId, project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.notes, promptNumber || null, discoveryTokens, timestampIso, timestampEpoch);
                summaryId = Number(result.lastInsertRowid);
            }
            // 3. Mark pending message as processed
            // This UPDATE is part of the same transaction, so if it fails,
            // observations and summary will be rolled back
            var updateStmt = _this.db.prepare("\n        UPDATE pending_messages\n        SET\n          status = 'processed',\n          completed_at_epoch = ?,\n          tool_input = NULL,\n          tool_response = NULL\n        WHERE id = ? AND status = 'processing'\n      ");
            updateStmt.run(timestampEpoch, messageId);
            return { observationIds: observationIds, summaryId: summaryId, createdAtEpoch: timestampEpoch };
        });
        // Execute the transaction and return results
        return storeAndMarkTx();
    };
    // REMOVED: cleanupOrphanedSessions - violates "EVERYTHING SHOULD SAVE ALWAYS"
    // There's no such thing as an "orphaned" session. Sessions are created by hooks
    // and managed by Claude Code's lifecycle. Worker restarts don't invalidate them.
    // Marking all active sessions as 'failed' on startup destroys the user's current work.
    /**
     * Get session summaries by IDs (for hybrid Chroma search)
     * Returns summaries in specified temporal order
     */
    SessionStore.prototype.getSessionSummariesByIds = function (ids, options) {
        if (options === void 0) { options = {}; }
        if (ids.length === 0)
            return [];
        var _a = options.orderBy, orderBy = _a === void 0 ? 'date_desc' : _a, limit = options.limit, project = options.project;
        var orderClause = orderBy === 'date_asc' ? 'ASC' : 'DESC';
        var limitClause = limit ? "LIMIT ".concat(limit) : '';
        var placeholders = ids.map(function () { return '?'; }).join(',');
        var params = __spreadArray([], ids, true);
        // Apply project filter
        var whereClause = project
            ? "WHERE id IN (".concat(placeholders, ") AND project = ?")
            : "WHERE id IN (".concat(placeholders, ")");
        if (project)
            params.push(project);
        var stmt = this.db.prepare("\n      SELECT * FROM session_summaries\n      ".concat(whereClause, "\n      ORDER BY created_at_epoch ").concat(orderClause, "\n      ").concat(limitClause, "\n    "));
        return stmt.all.apply(stmt, params);
    };
    /**
     * Get user prompts by IDs (for hybrid Chroma search)
     * Returns prompts in specified temporal order
     */
    SessionStore.prototype.getUserPromptsByIds = function (ids, options) {
        if (options === void 0) { options = {}; }
        if (ids.length === 0)
            return [];
        var _a = options.orderBy, orderBy = _a === void 0 ? 'date_desc' : _a, limit = options.limit, project = options.project;
        var orderClause = orderBy === 'date_asc' ? 'ASC' : 'DESC';
        var limitClause = limit ? "LIMIT ".concat(limit) : '';
        var placeholders = ids.map(function () { return '?'; }).join(',');
        var params = __spreadArray([], ids, true);
        // Apply project filter
        var projectFilter = project ? 'AND s.project = ?' : '';
        if (project)
            params.push(project);
        var stmt = this.db.prepare("\n      SELECT\n        up.*,\n        s.project,\n        s.memory_session_id\n      FROM user_prompts up\n      JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n      WHERE up.id IN (".concat(placeholders, ") ").concat(projectFilter, "\n      ORDER BY up.created_at_epoch ").concat(orderClause, "\n      ").concat(limitClause, "\n    "));
        return stmt.all.apply(stmt, params);
    };
    /**
     * Get a unified timeline of all records (observations, sessions, prompts) around an anchor point
     * @param anchorEpoch The anchor timestamp (epoch milliseconds)
     * @param depthBefore Number of records to retrieve before anchor (any type)
     * @param depthAfter Number of records to retrieve after anchor (any type)
     * @param project Optional project filter
     * @returns Object containing observations, sessions, and prompts for the specified window
     */
    SessionStore.prototype.getTimelineAroundTimestamp = function (anchorEpoch, depthBefore, depthAfter, project) {
        if (depthBefore === void 0) { depthBefore = 10; }
        if (depthAfter === void 0) { depthAfter = 10; }
        return this.getTimelineAroundObservation(null, anchorEpoch, depthBefore, depthAfter, project);
    };
    /**
     * Get timeline around a specific observation ID
     * Uses observation ID offsets to determine time boundaries, then fetches all record types in that window
     */
    SessionStore.prototype.getTimelineAroundObservation = function (anchorObservationId, anchorEpoch, depthBefore, depthAfter, project) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (depthBefore === void 0) { depthBefore = 10; }
        if (depthAfter === void 0) { depthAfter = 10; }
        var projectFilter = project ? 'AND project = ?' : '';
        var projectParams = project ? [project] : [];
        var startEpoch;
        var endEpoch;
        if (anchorObservationId !== null) {
            // Get boundary observations by ID offset
            var beforeQuery = "\n        SELECT id, created_at_epoch\n        FROM observations\n        WHERE id <= ? ".concat(projectFilter, "\n        ORDER BY id DESC\n        LIMIT ?\n      ");
            var afterQuery = "\n        SELECT id, created_at_epoch\n        FROM observations\n        WHERE id >= ? ".concat(projectFilter, "\n        ORDER BY id ASC\n        LIMIT ?\n      ");
            try {
                var beforeRecords = (_a = this.db.prepare(beforeQuery)).all.apply(_a, __spreadArray(__spreadArray([anchorObservationId], projectParams, false), [depthBefore + 1], false));
                var afterRecords = (_b = this.db.prepare(afterQuery)).all.apply(_b, __spreadArray(__spreadArray([anchorObservationId], projectParams, false), [depthAfter + 1], false));
                // Get the earliest and latest timestamps from boundary observations
                if (beforeRecords.length === 0 && afterRecords.length === 0) {
                    return { observations: [], sessions: [], prompts: [] };
                }
                startEpoch = beforeRecords.length > 0 ? beforeRecords[beforeRecords.length - 1].created_at_epoch : anchorEpoch;
                endEpoch = afterRecords.length > 0 ? afterRecords[afterRecords.length - 1].created_at_epoch : anchorEpoch;
            }
            catch (err) {
                logger_js_1.logger.error('DB', 'Error getting boundary observations', undefined, { error: err, project: project });
                return { observations: [], sessions: [], prompts: [] };
            }
        }
        else {
            // For timestamp-based anchors, use time-based boundaries
            // Get observations to find the time window
            var beforeQuery = "\n        SELECT created_at_epoch\n        FROM observations\n        WHERE created_at_epoch <= ? ".concat(projectFilter, "\n        ORDER BY created_at_epoch DESC\n        LIMIT ?\n      ");
            var afterQuery = "\n        SELECT created_at_epoch\n        FROM observations\n        WHERE created_at_epoch >= ? ".concat(projectFilter, "\n        ORDER BY created_at_epoch ASC\n        LIMIT ?\n      ");
            try {
                var beforeRecords = (_c = this.db.prepare(beforeQuery)).all.apply(_c, __spreadArray(__spreadArray([anchorEpoch], projectParams, false), [depthBefore], false));
                var afterRecords = (_d = this.db.prepare(afterQuery)).all.apply(_d, __spreadArray(__spreadArray([anchorEpoch], projectParams, false), [depthAfter + 1], false));
                if (beforeRecords.length === 0 && afterRecords.length === 0) {
                    return { observations: [], sessions: [], prompts: [] };
                }
                startEpoch = beforeRecords.length > 0 ? beforeRecords[beforeRecords.length - 1].created_at_epoch : anchorEpoch;
                endEpoch = afterRecords.length > 0 ? afterRecords[afterRecords.length - 1].created_at_epoch : anchorEpoch;
            }
            catch (err) {
                logger_js_1.logger.error('DB', 'Error getting boundary timestamps', undefined, { error: err, project: project });
                return { observations: [], sessions: [], prompts: [] };
            }
        }
        // Now query ALL record types within the time window
        var obsQuery = "\n      SELECT *\n      FROM observations\n      WHERE created_at_epoch >= ? AND created_at_epoch <= ? ".concat(projectFilter, "\n      ORDER BY created_at_epoch ASC\n    ");
        var sessQuery = "\n      SELECT *\n      FROM session_summaries\n      WHERE created_at_epoch >= ? AND created_at_epoch <= ? ".concat(projectFilter, "\n      ORDER BY created_at_epoch ASC\n    ");
        var promptQuery = "\n      SELECT up.*, s.project, s.memory_session_id\n      FROM user_prompts up\n      JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n      WHERE up.created_at_epoch >= ? AND up.created_at_epoch <= ? ".concat(projectFilter.replace('project', 's.project'), "\n      ORDER BY up.created_at_epoch ASC\n    ");
        var observations = (_e = this.db.prepare(obsQuery)).all.apply(_e, __spreadArray([startEpoch, endEpoch], projectParams, false));
        var sessions = (_f = this.db.prepare(sessQuery)).all.apply(_f, __spreadArray([startEpoch, endEpoch], projectParams, false));
        var prompts = (_g = this.db.prepare(promptQuery)).all.apply(_g, __spreadArray([startEpoch, endEpoch], projectParams, false));
        return {
            observations: observations,
            sessions: sessions.map(function (s) { return ({
                id: s.id,
                memory_session_id: s.memory_session_id,
                project: s.project,
                request: s.request,
                completed: s.completed,
                next_steps: s.next_steps,
                created_at: s.created_at,
                created_at_epoch: s.created_at_epoch
            }); }),
            prompts: prompts.map(function (p) { return ({
                id: p.id,
                content_session_id: p.content_session_id,
                prompt_number: p.prompt_number,
                prompt_text: p.prompt_text,
                project: p.project,
                created_at: p.created_at,
                created_at_epoch: p.created_at_epoch
            }); })
        };
    };
    /**
     * Get a single user prompt by ID
     */
    SessionStore.prototype.getPromptById = function (id) {
        var stmt = this.db.prepare("\n      SELECT\n        p.id,\n        p.content_session_id,\n        p.prompt_number,\n        p.prompt_text,\n        s.project,\n        p.created_at,\n        p.created_at_epoch\n      FROM user_prompts p\n      LEFT JOIN sdk_sessions s ON p.content_session_id = s.content_session_id\n      WHERE p.id = ?\n      LIMIT 1\n    ");
        return stmt.get(id) || null;
    };
    /**
     * Get multiple user prompts by IDs
     */
    SessionStore.prototype.getPromptsByIds = function (ids) {
        if (ids.length === 0)
            return [];
        var placeholders = ids.map(function () { return '?'; }).join(',');
        var stmt = this.db.prepare("\n      SELECT\n        p.id,\n        p.content_session_id,\n        p.prompt_number,\n        p.prompt_text,\n        s.project,\n        p.created_at,\n        p.created_at_epoch\n      FROM user_prompts p\n      LEFT JOIN sdk_sessions s ON p.content_session_id = s.content_session_id\n      WHERE p.id IN (".concat(placeholders, ")\n      ORDER BY p.created_at_epoch DESC\n    "));
        return stmt.all.apply(stmt, ids);
    };
    /**
     * Get full session summary by ID (includes request_summary and learned_summary)
     */
    SessionStore.prototype.getSessionSummaryById = function (id) {
        var stmt = this.db.prepare("\n      SELECT\n        id,\n        memory_session_id,\n        content_session_id,\n        project,\n        user_prompt,\n        request_summary,\n        learned_summary,\n        status,\n        created_at,\n        created_at_epoch\n      FROM sdk_sessions\n      WHERE id = ?\n      LIMIT 1\n    ");
        return stmt.get(id) || null;
    };
    /**
     * Get or create a manual session for storing user-created observations
     * Manual sessions use a predictable ID format: "manual-{project}"
     */
    SessionStore.prototype.getOrCreateManualSession = function (project) {
        var memorySessionId = "manual-".concat(project);
        var contentSessionId = "manual-content-".concat(project);
        var existing = this.db.prepare('SELECT memory_session_id FROM sdk_sessions WHERE memory_session_id = ?').get(memorySessionId);
        if (existing) {
            return memorySessionId;
        }
        // Create new manual session
        var now = new Date();
        this.db.prepare("\n      INSERT INTO sdk_sessions (memory_session_id, content_session_id, project, started_at, started_at_epoch, status)\n      VALUES (?, ?, ?, ?, ?, 'active')\n    ").run(memorySessionId, contentSessionId, project, now.toISOString(), now.getTime());
        logger_js_1.logger.info('SESSION', 'Created manual session', { memorySessionId: memorySessionId, project: project });
        return memorySessionId;
    };
    /**
     * Close the database connection
     */
    SessionStore.prototype.close = function () {
        this.db.close();
    };
    // ===========================================
    // Import Methods (for import-memories script)
    // ===========================================
    /**
     * Import SDK session with duplicate checking
     * Returns: { imported: boolean, id: number }
     */
    SessionStore.prototype.importSdkSession = function (session) {
        // Check if session already exists
        var existing = this.db.prepare('SELECT id FROM sdk_sessions WHERE content_session_id = ?').get(session.content_session_id);
        if (existing) {
            return { imported: false, id: existing.id };
        }
        var stmt = this.db.prepare("\n      INSERT INTO sdk_sessions (\n        content_session_id, memory_session_id, project, user_prompt,\n        started_at, started_at_epoch, completed_at, completed_at_epoch, status\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ");
        var result = stmt.run(session.content_session_id, session.memory_session_id, session.project, session.user_prompt, session.started_at, session.started_at_epoch, session.completed_at, session.completed_at_epoch, session.status);
        return { imported: true, id: result.lastInsertRowid };
    };
    /**
     * Import session summary with duplicate checking
     * Returns: { imported: boolean, id: number }
     */
    SessionStore.prototype.importSessionSummary = function (summary) {
        // Check if summary already exists for this session
        var existing = this.db.prepare('SELECT id FROM session_summaries WHERE memory_session_id = ?').get(summary.memory_session_id);
        if (existing) {
            return { imported: false, id: existing.id };
        }
        var stmt = this.db.prepare("\n      INSERT INTO session_summaries (\n        memory_session_id, project, request, investigated, learned,\n        completed, next_steps, files_read, files_edited, notes,\n        prompt_number, discovery_tokens, created_at, created_at_epoch\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ");
        var result = stmt.run(summary.memory_session_id, summary.project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.files_read, summary.files_edited, summary.notes, summary.prompt_number, summary.discovery_tokens || 0, summary.created_at, summary.created_at_epoch);
        return { imported: true, id: result.lastInsertRowid };
    };
    /**
     * Import observation with duplicate checking
     * Duplicates are identified by memory_session_id + title + created_at_epoch
     * Returns: { imported: boolean, id: number }
     */
    SessionStore.prototype.importObservation = function (obs) {
        // Check if observation already exists
        var existing = this.db.prepare("\n      SELECT id FROM observations\n      WHERE memory_session_id = ? AND title = ? AND created_at_epoch = ?\n    ").get(obs.memory_session_id, obs.title, obs.created_at_epoch);
        if (existing) {
            return { imported: false, id: existing.id };
        }
        var stmt = this.db.prepare("\n      INSERT INTO observations (\n        memory_session_id, project, text, type, title, subtitle,\n        facts, narrative, concepts, files_read, files_modified,\n        prompt_number, discovery_tokens, created_at, created_at_epoch\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ");
        var result = stmt.run(obs.memory_session_id, obs.project, obs.text, obs.type, obs.title, obs.subtitle, obs.facts, obs.narrative, obs.concepts, obs.files_read, obs.files_modified, obs.prompt_number, obs.discovery_tokens || 0, obs.created_at, obs.created_at_epoch);
        return { imported: true, id: result.lastInsertRowid };
    };
    /**
     * Import user prompt with duplicate checking
     * Duplicates are identified by content_session_id + prompt_number
     * Returns: { imported: boolean, id: number }
     */
    SessionStore.prototype.importUserPrompt = function (prompt) {
        // Check if prompt already exists
        var existing = this.db.prepare("\n      SELECT id FROM user_prompts\n      WHERE content_session_id = ? AND prompt_number = ?\n    ").get(prompt.content_session_id, prompt.prompt_number);
        if (existing) {
            return { imported: false, id: existing.id };
        }
        var stmt = this.db.prepare("\n      INSERT INTO user_prompts (\n        content_session_id, prompt_number, prompt_text,\n        created_at, created_at_epoch\n      ) VALUES (?, ?, ?, ?, ?)\n    ");
        var result = stmt.run(prompt.content_session_id, prompt.prompt_number, prompt.prompt_text, prompt.created_at, prompt.created_at_epoch);
        return { imported: true, id: result.lastInsertRowid };
    };
    return SessionStore;
}());
exports.SessionStore = SessionStore;
