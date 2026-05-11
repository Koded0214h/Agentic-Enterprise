"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = exports.migration007 = exports.migration006 = exports.migration005 = exports.migration004 = exports.migration003 = exports.migration002 = exports.migration001 = exports.MigrationRunner = void 0;
// Re-export MigrationRunner for SessionStore migration extraction
var runner_js_1 = require("./migrations/runner.js");
Object.defineProperty(exports, "MigrationRunner", { enumerable: true, get: function () { return runner_js_1.MigrationRunner; } });
/**
 * Initial schema migration - creates all core tables
 */
exports.migration001 = {
    version: 1,
    up: function (db) {
        // Sessions table - core session tracking
        db.run("\n      CREATE TABLE IF NOT EXISTS sessions (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        session_id TEXT UNIQUE NOT NULL,\n        project TEXT NOT NULL,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        source TEXT NOT NULL DEFAULT 'compress',\n        archive_path TEXT,\n        archive_bytes INTEGER,\n        archive_checksum TEXT,\n        archived_at TEXT,\n        metadata_json TEXT\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project);\n      CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at_epoch DESC);\n      CREATE INDEX IF NOT EXISTS idx_sessions_project_created ON sessions(project, created_at_epoch DESC);\n    ");
        // Memories table - compressed memory chunks
        db.run("\n      CREATE TABLE IF NOT EXISTS memories (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        session_id TEXT NOT NULL,\n        text TEXT NOT NULL,\n        document_id TEXT UNIQUE,\n        keywords TEXT,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        project TEXT NOT NULL,\n        archive_basename TEXT,\n        origin TEXT NOT NULL DEFAULT 'transcript',\n        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_memories_session ON memories(session_id);\n      CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project);\n      CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at_epoch DESC);\n      CREATE INDEX IF NOT EXISTS idx_memories_project_created ON memories(project, created_at_epoch DESC);\n      CREATE INDEX IF NOT EXISTS idx_memories_document_id ON memories(document_id);\n      CREATE INDEX IF NOT EXISTS idx_memories_origin ON memories(origin);\n    ");
        // Overviews table - session summaries (one per project)
        db.run("\n      CREATE TABLE IF NOT EXISTS overviews (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        session_id TEXT NOT NULL,\n        content TEXT NOT NULL,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        project TEXT NOT NULL,\n        origin TEXT NOT NULL DEFAULT 'claude',\n        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_overviews_session ON overviews(session_id);\n      CREATE INDEX IF NOT EXISTS idx_overviews_project ON overviews(project);\n      CREATE INDEX IF NOT EXISTS idx_overviews_created_at ON overviews(created_at_epoch DESC);\n      CREATE INDEX IF NOT EXISTS idx_overviews_project_created ON overviews(project, created_at_epoch DESC);\n      CREATE UNIQUE INDEX IF NOT EXISTS idx_overviews_project_latest ON overviews(project, created_at_epoch DESC);\n    ");
        // Diagnostics table - system health and debug info
        db.run("\n      CREATE TABLE IF NOT EXISTS diagnostics (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        session_id TEXT,\n        message TEXT NOT NULL,\n        severity TEXT NOT NULL DEFAULT 'info',\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        project TEXT NOT NULL,\n        origin TEXT NOT NULL DEFAULT 'system',\n        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_diagnostics_session ON diagnostics(session_id);\n      CREATE INDEX IF NOT EXISTS idx_diagnostics_project ON diagnostics(project);\n      CREATE INDEX IF NOT EXISTS idx_diagnostics_severity ON diagnostics(severity);\n      CREATE INDEX IF NOT EXISTS idx_diagnostics_created ON diagnostics(created_at_epoch DESC);\n    ");
        // Transcript events table - raw conversation events
        db.run("\n      CREATE TABLE IF NOT EXISTS transcript_events (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        session_id TEXT NOT NULL,\n        project TEXT,\n        event_index INTEGER NOT NULL,\n        event_type TEXT,\n        raw_json TEXT NOT NULL,\n        captured_at TEXT NOT NULL,\n        captured_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,\n        UNIQUE(session_id, event_index)\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_transcript_events_session ON transcript_events(session_id, event_index);\n      CREATE INDEX IF NOT EXISTS idx_transcript_events_project ON transcript_events(project);\n      CREATE INDEX IF NOT EXISTS idx_transcript_events_type ON transcript_events(event_type);\n      CREATE INDEX IF NOT EXISTS idx_transcript_events_captured ON transcript_events(captured_at_epoch DESC);\n    ");
        console.log('✅ Created all database tables successfully');
    },
    down: function (db) {
        db.run("\n      DROP TABLE IF EXISTS transcript_events;\n      DROP TABLE IF EXISTS diagnostics;\n      DROP TABLE IF EXISTS overviews;\n      DROP TABLE IF EXISTS memories;\n      DROP TABLE IF EXISTS sessions;\n    ");
    }
};
/**
 * Migration 002 - Add hierarchical memory fields (v2 format)
 */
exports.migration002 = {
    version: 2,
    up: function (db) {
        // Add new columns for hierarchical memory structure
        db.run("\n      ALTER TABLE memories ADD COLUMN title TEXT;\n      ALTER TABLE memories ADD COLUMN subtitle TEXT;\n      ALTER TABLE memories ADD COLUMN facts TEXT;\n      ALTER TABLE memories ADD COLUMN concepts TEXT;\n      ALTER TABLE memories ADD COLUMN files_touched TEXT;\n    ");
        // Create indexes for the new fields to improve search performance
        db.run("\n      CREATE INDEX IF NOT EXISTS idx_memories_title ON memories(title);\n      CREATE INDEX IF NOT EXISTS idx_memories_concepts ON memories(concepts);\n    ");
        console.log('✅ Added hierarchical memory fields to memories table');
    },
    down: function (_db) {
        // Note: SQLite doesn't support DROP COLUMN in all versions
        // In production, we'd need to recreate the table without these columns
        // For now, we'll just log a warning
        console.log('⚠️  Warning: SQLite ALTER TABLE DROP COLUMN not fully supported');
        console.log('⚠️  To rollback, manually recreate the memories table');
    }
};
/**
 * Migration 003 - Add streaming_sessions table for real-time session tracking
 */
exports.migration003 = {
    version: 3,
    up: function (db) {
        // Streaming sessions table - tracks active SDK compression sessions
        db.run("\n      CREATE TABLE IF NOT EXISTS streaming_sessions (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        content_session_id TEXT UNIQUE NOT NULL,\n        memory_session_id TEXT,\n        project TEXT NOT NULL,\n        title TEXT,\n        subtitle TEXT,\n        user_prompt TEXT,\n        started_at TEXT NOT NULL,\n        started_at_epoch INTEGER NOT NULL,\n        updated_at TEXT,\n        updated_at_epoch INTEGER,\n        completed_at TEXT,\n        completed_at_epoch INTEGER,\n        status TEXT NOT NULL DEFAULT 'active'\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_streaming_sessions_claude_id ON streaming_sessions(content_session_id);\n      CREATE INDEX IF NOT EXISTS idx_streaming_sessions_sdk_id ON streaming_sessions(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_streaming_sessions_project ON streaming_sessions(project);\n      CREATE INDEX IF NOT EXISTS idx_streaming_sessions_status ON streaming_sessions(status);\n      CREATE INDEX IF NOT EXISTS idx_streaming_sessions_started ON streaming_sessions(started_at_epoch DESC);\n    ");
        console.log('✅ Created streaming_sessions table for real-time session tracking');
    },
    down: function (db) {
        db.run("\n      DROP TABLE IF EXISTS streaming_sessions;\n    ");
    }
};
/**
 * Migration 004 - Add SDK agent architecture tables
 * Implements the refactor plan for hook-driven memory with SDK agent synthesis
 */
exports.migration004 = {
    version: 4,
    up: function (db) {
        // SDK sessions table - tracks SDK streaming sessions
        db.run("\n      CREATE TABLE IF NOT EXISTS sdk_sessions (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        content_session_id TEXT UNIQUE NOT NULL,\n        memory_session_id TEXT UNIQUE,\n        project TEXT NOT NULL,\n        user_prompt TEXT,\n        started_at TEXT NOT NULL,\n        started_at_epoch INTEGER NOT NULL,\n        completed_at TEXT,\n        completed_at_epoch INTEGER,\n        status TEXT CHECK(status IN ('active', 'completed', 'failed')) NOT NULL DEFAULT 'active'\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_claude_id ON sdk_sessions(content_session_id);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_sdk_id ON sdk_sessions(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_project ON sdk_sessions(project);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_status ON sdk_sessions(status);\n      CREATE INDEX IF NOT EXISTS idx_sdk_sessions_started ON sdk_sessions(started_at_epoch DESC);\n    ");
        // Observation queue table - tracks pending observations for SDK processing
        db.run("\n      CREATE TABLE IF NOT EXISTS observation_queue (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT NOT NULL,\n        tool_name TEXT NOT NULL,\n        tool_input TEXT NOT NULL,\n        tool_output TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        processed_at_epoch INTEGER,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_observation_queue_sdk_session ON observation_queue(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_observation_queue_processed ON observation_queue(processed_at_epoch);\n      CREATE INDEX IF NOT EXISTS idx_observation_queue_pending ON observation_queue(memory_session_id, processed_at_epoch);\n    ");
        // Observations table - stores extracted observations (what SDK decides is important)
        db.run("\n      CREATE TABLE IF NOT EXISTS observations (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT NOT NULL,\n        project TEXT NOT NULL,\n        text TEXT NOT NULL,\n        type TEXT NOT NULL,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_observations_sdk_session ON observations(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_observations_project ON observations(project);\n      CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);\n      CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at_epoch DESC);\n    ");
        // Session summaries table - stores structured session summaries
        db.run("\n      CREATE TABLE IF NOT EXISTS session_summaries (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT UNIQUE NOT NULL,\n        project TEXT NOT NULL,\n        request TEXT,\n        investigated TEXT,\n        learned TEXT,\n        completed TEXT,\n        next_steps TEXT,\n        files_read TEXT,\n        files_edited TEXT,\n        notes TEXT,\n        created_at TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_session_summaries_sdk_session ON session_summaries(memory_session_id);\n      CREATE INDEX IF NOT EXISTS idx_session_summaries_project ON session_summaries(project);\n      CREATE INDEX IF NOT EXISTS idx_session_summaries_created ON session_summaries(created_at_epoch DESC);\n    ");
        console.log('✅ Created SDK agent architecture tables');
    },
    down: function (db) {
        db.run("\n      DROP TABLE IF EXISTS session_summaries;\n      DROP TABLE IF EXISTS observations;\n      DROP TABLE IF EXISTS observation_queue;\n      DROP TABLE IF EXISTS sdk_sessions;\n    ");
    }
};
/**
 * Migration 005 - Remove orphaned tables
 * Drops streaming_sessions (superseded by sdk_sessions)
 * Drops observation_queue (superseded by Unix socket communication)
 */
exports.migration005 = {
    version: 5,
    up: function (db) {
        // Drop streaming_sessions - superseded by sdk_sessions in migration004
        // This table was from v2 architecture and is no longer used
        db.run("DROP TABLE IF EXISTS streaming_sessions");
        // Drop observation_queue - superseded by Unix socket communication
        // Worker now uses sockets instead of database polling for observations
        db.run("DROP TABLE IF EXISTS observation_queue");
        console.log('✅ Dropped orphaned tables: streaming_sessions, observation_queue');
    },
    down: function (db) {
        // Recreate tables if needed (though they should never be used)
        db.run("\n      CREATE TABLE IF NOT EXISTS streaming_sessions (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        content_session_id TEXT UNIQUE NOT NULL,\n        memory_session_id TEXT,\n        project TEXT NOT NULL,\n        title TEXT,\n        subtitle TEXT,\n        user_prompt TEXT,\n        started_at TEXT NOT NULL,\n        started_at_epoch INTEGER NOT NULL,\n        updated_at TEXT,\n        updated_at_epoch INTEGER,\n        completed_at TEXT,\n        completed_at_epoch INTEGER,\n        status TEXT NOT NULL DEFAULT 'active'\n      )\n    ");
        db.run("\n      CREATE TABLE IF NOT EXISTS observation_queue (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        memory_session_id TEXT NOT NULL,\n        tool_name TEXT NOT NULL,\n        tool_input TEXT NOT NULL,\n        tool_output TEXT NOT NULL,\n        created_at_epoch INTEGER NOT NULL,\n        processed_at_epoch INTEGER,\n        FOREIGN KEY(memory_session_id) REFERENCES sdk_sessions(memory_session_id) ON DELETE CASCADE\n      )\n    ");
        console.log('⚠️  Recreated streaming_sessions and observation_queue (for rollback only)');
    }
};
/**
 * Migration 006 - Add FTS5 full-text search tables
 * Creates virtual tables for fast text search on observations and session_summaries
 */
exports.migration006 = {
    version: 6,
    up: function (db) {
        // FTS5 may be unavailable on some platforms (e.g., Bun on Windows #791).
        // Probe before creating tables — search falls back to ChromaDB when unavailable.
        try {
            db.run('CREATE VIRTUAL TABLE _fts5_probe USING fts5(test_column)');
            db.run('DROP TABLE _fts5_probe');
        }
        catch (_a) {
            console.log('⚠️  FTS5 not available on this platform — skipping FTS migration (search uses ChromaDB)');
            return;
        }
        // FTS5 virtual table for observations
        // Note: This assumes the hierarchical fields (title, subtitle, etc.) already exist
        // from the inline migrations in SessionStore constructor
        db.run("\n      CREATE VIRTUAL TABLE IF NOT EXISTS observations_fts USING fts5(\n        title,\n        subtitle,\n        narrative,\n        text,\n        facts,\n        concepts,\n        content='observations',\n        content_rowid='id'\n      );\n    ");
        // Populate FTS table with existing data
        db.run("\n      INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n      SELECT id, title, subtitle, narrative, text, facts, concepts\n      FROM observations;\n    ");
        // Triggers to keep observations_fts in sync
        db.run("\n      CREATE TRIGGER IF NOT EXISTS observations_ai AFTER INSERT ON observations BEGIN\n        INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n        VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);\n      END;\n\n      CREATE TRIGGER IF NOT EXISTS observations_ad AFTER DELETE ON observations BEGIN\n        INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)\n        VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);\n      END;\n\n      CREATE TRIGGER IF NOT EXISTS observations_au AFTER UPDATE ON observations BEGIN\n        INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)\n        VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);\n        INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n        VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);\n      END;\n    ");
        // FTS5 virtual table for session_summaries
        db.run("\n      CREATE VIRTUAL TABLE IF NOT EXISTS session_summaries_fts USING fts5(\n        request,\n        investigated,\n        learned,\n        completed,\n        next_steps,\n        notes,\n        content='session_summaries',\n        content_rowid='id'\n      );\n    ");
        // Populate FTS table with existing data
        db.run("\n      INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n      SELECT id, request, investigated, learned, completed, next_steps, notes\n      FROM session_summaries;\n    ");
        // Triggers to keep session_summaries_fts in sync
        db.run("\n      CREATE TRIGGER IF NOT EXISTS session_summaries_ai AFTER INSERT ON session_summaries BEGIN\n        INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n        VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);\n      END;\n\n      CREATE TRIGGER IF NOT EXISTS session_summaries_ad AFTER DELETE ON session_summaries BEGIN\n        INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)\n        VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);\n      END;\n\n      CREATE TRIGGER IF NOT EXISTS session_summaries_au AFTER UPDATE ON session_summaries BEGIN\n        INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)\n        VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);\n        INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n        VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);\n      END;\n    ");
        console.log('✅ Created FTS5 virtual tables and triggers for full-text search');
    },
    down: function (db) {
        db.run("\n      DROP TRIGGER IF EXISTS observations_au;\n      DROP TRIGGER IF EXISTS observations_ad;\n      DROP TRIGGER IF EXISTS observations_ai;\n      DROP TABLE IF EXISTS observations_fts;\n\n      DROP TRIGGER IF EXISTS session_summaries_au;\n      DROP TRIGGER IF EXISTS session_summaries_ad;\n      DROP TRIGGER IF EXISTS session_summaries_ai;\n      DROP TABLE IF EXISTS session_summaries_fts;\n    ");
    }
};
/**
 * Migration 007 - Add discovery_tokens column for ROI metrics
 * Tracks token cost of discovering/creating each observation and summary
 */
exports.migration007 = {
    version: 7,
    up: function (db) {
        // Add discovery_tokens to observations table
        db.run("ALTER TABLE observations ADD COLUMN discovery_tokens INTEGER DEFAULT 0");
        // Add discovery_tokens to session_summaries table
        db.run("ALTER TABLE session_summaries ADD COLUMN discovery_tokens INTEGER DEFAULT 0");
        console.log('✅ Added discovery_tokens columns for ROI tracking');
    },
    down: function (db) {
        // Note: SQLite doesn't support DROP COLUMN in all versions
        // In production, would need to recreate tables without these columns
        console.log('⚠️  Warning: SQLite ALTER TABLE DROP COLUMN not fully supported');
        console.log('⚠️  To rollback, manually recreate the observations and session_summaries tables');
    }
};
/**
 * All migrations in order
 */
exports.migrations = [
    exports.migration001,
    exports.migration002,
    exports.migration003,
    exports.migration004,
    exports.migration005,
    exports.migration006,
    exports.migration007
];
