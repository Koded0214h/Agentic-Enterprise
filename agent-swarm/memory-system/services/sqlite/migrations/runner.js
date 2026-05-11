"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = void 0;
var logger_js_1 = require("../../../utils/logger.js");
/**
 * MigrationRunner handles all database schema migrations
 * Extracted from SessionStore to separate concerns
 */
var MigrationRunner = /** @class */ (function () {
    function MigrationRunner(db) {
        this.db = db;
    }
    /**
     * Run all migrations in order
     * This is the only public method - all migrations are internal
     */
    MigrationRunner.prototype.runAllMigrations = function () {
        this.initializeSchema();
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
    };
    /**
     * Initialize database schema (migration004)
     *
     * ALWAYS creates core tables using CREATE TABLE IF NOT EXISTS — safe to run
     * regardless of schema_versions state.  This fixes issue #979 where the old
     * DatabaseManager migration system (versions 1-7) shared the schema_versions
     * table, causing maxApplied > 0 and skipping core table creation entirely.
     */
    MigrationRunner.prototype.initializeSchema = function () {
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
    MigrationRunner.prototype.ensureWorkerPortColumn = function () {
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
    MigrationRunner.prototype.ensurePromptTrackingColumns = function () {
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
    MigrationRunner.prototype.removeSessionSummariesUniqueConstraint = function () {
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
    MigrationRunner.prototype.addObservationHierarchicalFields = function () {
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
    MigrationRunner.prototype.makeObservationsTextNullable = function () {
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
    MigrationRunner.prototype.createUserPromptsTable = function () {
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
    MigrationRunner.prototype.ensureDiscoveryTokensColumn = function () {
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
    MigrationRunner.prototype.createPendingMessagesTable = function () {
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
     * - claude_session_id -> content_session_id (user's observed session)
     * - sdk_session_id -> memory_session_id (memory agent's session for resume)
     *
     * IDEMPOTENT: Checks each table individually before renaming.
     * This handles databases in any intermediate state (partial migration, fresh install, etc.)
     */
    MigrationRunner.prototype.renameSessionIdColumns = function () {
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
    MigrationRunner.prototype.repairSessionIdColumnRename = function () {
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
    MigrationRunner.prototype.addFailedAtEpochColumn = function () {
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
    MigrationRunner.prototype.addOnUpdateCascadeToForeignKeys = function () {
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
     * Prevents duplicate observations from being stored when the same content is processed multiple times.
     * Backfills existing rows with unique random hashes so they don't block new inserts.
     */
    MigrationRunner.prototype.addObservationContentHashColumn = function () {
        // Check actual schema first — cross-machine DB sync can leave schema_versions
        // claiming this migration ran while the column is actually missing (e.g. migration 21
        // recreated the table without content_hash on the synced machine).
        var tableInfo = this.db.query('PRAGMA table_info(observations)').all();
        var hasColumn = tableInfo.some(function (col) { return col.name === 'content_hash'; });
        if (hasColumn) {
            // Column exists — just ensure version record is present
            this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(22, new Date().toISOString());
            return;
        }
        this.db.run('ALTER TABLE observations ADD COLUMN content_hash TEXT');
        // Backfill existing rows with unique random hashes
        this.db.run("UPDATE observations SET content_hash = substr(hex(randomblob(8)), 1, 16) WHERE content_hash IS NULL");
        // Index for fast dedup lookups
        this.db.run('CREATE INDEX IF NOT EXISTS idx_observations_content_hash ON observations(content_hash, created_at_epoch)');
        logger_js_1.logger.debug('DB', 'Added content_hash column to observations table with backfill and index');
        this.db.prepare('INSERT OR IGNORE INTO schema_versions (version, applied_at) VALUES (?, ?)').run(22, new Date().toISOString());
    };
    /**
     * Add custom_title column to sdk_sessions for agent attribution (migration 23)
     * Allows callers (e.g. Maestro agents) to label sessions with a human-readable name.
     */
    MigrationRunner.prototype.addSessionCustomTitleColumn = function () {
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
    return MigrationRunner;
}());
exports.MigrationRunner = MigrationRunner;
