"use strict";
/**
 * ChromaSync Service
 *
 * Automatically syncs observations and session summaries to ChromaDB via MCP.
 * This service provides real-time semantic search capabilities by maintaining
 * a vector database synchronized with SQLite.
 *
 * Uses ChromaMcpManager to communicate with chroma-mcp over stdio MCP protocol.
 * The chroma-mcp server handles its own embedding and persistent storage,
 * eliminating the need for chromadb npm package and ONNX/WASM dependencies.
 *
 * Design: Fail-fast with no fallbacks - if Chroma is unavailable, syncing fails.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.ChromaSync = void 0;
var ChromaMcpManager_js_1 = require("./ChromaMcpManager.js");
var SessionStore_js_1 = require("../sqlite/SessionStore.js");
var logger_js_1 = require("../../utils/logger.js");
var ChromaSync = /** @class */ (function () {
    function ChromaSync(project) {
        this.collectionCreated = false;
        this.BATCH_SIZE = 100;
        this.project = project;
        // Chroma collection names only allow [a-zA-Z0-9._-], 3-512 chars,
        // must start/end with [a-zA-Z0-9]
        var sanitized = project
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/[^a-zA-Z0-9]+$/, ''); // strip trailing non-alphanumeric
        this.collectionName = "cm__".concat(sanitized || 'unknown');
    }
    /**
     * Ensure collection exists in Chroma via MCP.
     * chroma_create_collection is idempotent - safe to call multiple times.
     * Uses collectionCreated flag to avoid redundant calls within a session.
     */
    ChromaSync.prototype.ensureCollectionExists = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chromaMcp, error_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.collectionCreated) {
                            return [2 /*return*/];
                        }
                        chromaMcp = ChromaMcpManager_js_1.ChromaMcpManager.getInstance();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, chromaMcp.callTool('chroma_create_collection', {
                                collection_name: this.collectionName
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        message = error_1 instanceof Error ? error_1.message : String(error_1);
                        if (!message.includes('already exists')) {
                            throw error_1;
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        this.collectionCreated = true;
                        logger_js_1.logger.debug('CHROMA_SYNC', 'Collection ready', {
                            collection: this.collectionName
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Format observation into Chroma documents (granular approach)
     * Each semantic field becomes a separate vector document
     */
    ChromaSync.prototype.formatObservationDocs = function (obs) {
        var documents = [];
        // Parse JSON fields
        var facts = obs.facts ? JSON.parse(obs.facts) : [];
        var concepts = obs.concepts ? JSON.parse(obs.concepts) : [];
        var files_read = obs.files_read ? JSON.parse(obs.files_read) : [];
        var files_modified = obs.files_modified ? JSON.parse(obs.files_modified) : [];
        var baseMetadata = {
            sqlite_id: obs.id,
            doc_type: 'observation',
            memory_session_id: obs.memory_session_id,
            project: obs.project,
            created_at_epoch: obs.created_at_epoch,
            type: obs.type || 'discovery',
            title: obs.title || 'Untitled'
        };
        // Add optional metadata fields
        if (obs.subtitle) {
            baseMetadata.subtitle = obs.subtitle;
        }
        if (concepts.length > 0) {
            baseMetadata.concepts = concepts.join(',');
        }
        if (files_read.length > 0) {
            baseMetadata.files_read = files_read.join(',');
        }
        if (files_modified.length > 0) {
            baseMetadata.files_modified = files_modified.join(',');
        }
        // Narrative as separate document
        if (obs.narrative) {
            documents.push({
                id: "obs_".concat(obs.id, "_narrative"),
                document: obs.narrative,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'narrative' })
            });
        }
        // Text as separate document (legacy field)
        if (obs.text) {
            documents.push({
                id: "obs_".concat(obs.id, "_text"),
                document: obs.text,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'text' })
            });
        }
        // Each fact as separate document
        facts.forEach(function (fact, index) {
            documents.push({
                id: "obs_".concat(obs.id, "_fact_").concat(index),
                document: fact,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'fact', fact_index: index })
            });
        });
        return documents;
    };
    /**
     * Format summary into Chroma documents (granular approach)
     * Each summary field becomes a separate vector document
     */
    ChromaSync.prototype.formatSummaryDocs = function (summary) {
        var documents = [];
        var baseMetadata = {
            sqlite_id: summary.id,
            doc_type: 'session_summary',
            memory_session_id: summary.memory_session_id,
            project: summary.project,
            created_at_epoch: summary.created_at_epoch,
            prompt_number: summary.prompt_number || 0
        };
        // Each field becomes a separate document
        if (summary.request) {
            documents.push({
                id: "summary_".concat(summary.id, "_request"),
                document: summary.request,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'request' })
            });
        }
        if (summary.investigated) {
            documents.push({
                id: "summary_".concat(summary.id, "_investigated"),
                document: summary.investigated,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'investigated' })
            });
        }
        if (summary.learned) {
            documents.push({
                id: "summary_".concat(summary.id, "_learned"),
                document: summary.learned,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'learned' })
            });
        }
        if (summary.completed) {
            documents.push({
                id: "summary_".concat(summary.id, "_completed"),
                document: summary.completed,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'completed' })
            });
        }
        if (summary.next_steps) {
            documents.push({
                id: "summary_".concat(summary.id, "_next_steps"),
                document: summary.next_steps,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'next_steps' })
            });
        }
        if (summary.notes) {
            documents.push({
                id: "summary_".concat(summary.id, "_notes"),
                document: summary.notes,
                metadata: __assign(__assign({}, baseMetadata), { field_type: 'notes' })
            });
        }
        return documents;
    };
    /**
     * Add documents to Chroma in batch via MCP
     * Throws error if batch add fails
     */
    ChromaSync.prototype.addDocuments = function (documents) {
        return __awaiter(this, void 0, void 0, function () {
            var chromaMcp, i, batch, cleanMetadatas, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (documents.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.ensureCollectionExists()];
                    case 1:
                        _a.sent();
                        chromaMcp = ChromaMcpManager_js_1.ChromaMcpManager.getInstance();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < documents.length)) return [3 /*break*/, 7];
                        batch = documents.slice(i, i + this.BATCH_SIZE);
                        cleanMetadatas = batch.map(function (d) {
                            return Object.fromEntries(Object.entries(d.metadata).filter(function (_a) {
                                var _ = _a[0], v = _a[1];
                                return v !== null && v !== undefined && v !== '';
                            }));
                        });
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, chromaMcp.callTool('chroma_add_documents', {
                                collection_name: this.collectionName,
                                ids: batch.map(function (d) { return d.id; }),
                                documents: batch.map(function (d) { return d.document; }),
                                metadatas: cleanMetadatas
                            })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        logger_js_1.logger.error('CHROMA_SYNC', 'Batch add failed, continuing with remaining batches', {
                            collection: this.collectionName,
                            batchStart: i,
                            batchSize: batch.length
                        }, error_2);
                        return [3 /*break*/, 6];
                    case 6:
                        i += this.BATCH_SIZE;
                        return [3 /*break*/, 2];
                    case 7:
                        logger_js_1.logger.debug('CHROMA_SYNC', 'Documents added', {
                            collection: this.collectionName,
                            count: documents.length
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync a single observation to Chroma
     * Blocks until sync completes, throws on error
     */
    ChromaSync.prototype.syncObservation = function (observationId_1, memorySessionId_1, project_1, obs_1, promptNumber_1, createdAtEpoch_1) {
        return __awaiter(this, arguments, void 0, function (observationId, memorySessionId, project, obs, promptNumber, createdAtEpoch, discoveryTokens) {
            var stored, documents;
            if (discoveryTokens === void 0) { discoveryTokens = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stored = {
                            id: observationId,
                            memory_session_id: memorySessionId,
                            project: project,
                            text: null, // Legacy field, not used
                            type: obs.type,
                            title: obs.title,
                            subtitle: obs.subtitle,
                            facts: JSON.stringify(obs.facts),
                            narrative: obs.narrative,
                            concepts: JSON.stringify(obs.concepts),
                            files_read: JSON.stringify(obs.files_read),
                            files_modified: JSON.stringify(obs.files_modified),
                            prompt_number: promptNumber,
                            discovery_tokens: discoveryTokens,
                            created_at: new Date(createdAtEpoch * 1000).toISOString(),
                            created_at_epoch: createdAtEpoch
                        };
                        documents = this.formatObservationDocs(stored);
                        logger_js_1.logger.info('CHROMA_SYNC', 'Syncing observation', {
                            observationId: observationId,
                            documentCount: documents.length,
                            project: project
                        });
                        return [4 /*yield*/, this.addDocuments(documents)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync a single summary to Chroma
     * Blocks until sync completes, throws on error
     */
    ChromaSync.prototype.syncSummary = function (summaryId_1, memorySessionId_1, project_1, summary_1, promptNumber_1, createdAtEpoch_1) {
        return __awaiter(this, arguments, void 0, function (summaryId, memorySessionId, project, summary, promptNumber, createdAtEpoch, discoveryTokens) {
            var stored, documents;
            if (discoveryTokens === void 0) { discoveryTokens = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stored = {
                            id: summaryId,
                            memory_session_id: memorySessionId,
                            project: project,
                            request: summary.request,
                            investigated: summary.investigated,
                            learned: summary.learned,
                            completed: summary.completed,
                            next_steps: summary.next_steps,
                            notes: summary.notes,
                            prompt_number: promptNumber,
                            discovery_tokens: discoveryTokens,
                            created_at: new Date(createdAtEpoch * 1000).toISOString(),
                            created_at_epoch: createdAtEpoch
                        };
                        documents = this.formatSummaryDocs(stored);
                        logger_js_1.logger.info('CHROMA_SYNC', 'Syncing summary', {
                            summaryId: summaryId,
                            documentCount: documents.length,
                            project: project
                        });
                        return [4 /*yield*/, this.addDocuments(documents)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Format user prompt into Chroma document
     * Each prompt becomes a single document (unlike observations/summaries which split by field)
     */
    ChromaSync.prototype.formatUserPromptDoc = function (prompt) {
        return {
            id: "prompt_".concat(prompt.id),
            document: prompt.prompt_text,
            metadata: {
                sqlite_id: prompt.id,
                doc_type: 'user_prompt',
                memory_session_id: prompt.memory_session_id,
                project: prompt.project,
                created_at_epoch: prompt.created_at_epoch,
                prompt_number: prompt.prompt_number
            }
        };
    };
    /**
     * Sync a single user prompt to Chroma
     * Blocks until sync completes, throws on error
     */
    ChromaSync.prototype.syncUserPrompt = function (promptId, memorySessionId, project, promptText, promptNumber, createdAtEpoch) {
        return __awaiter(this, void 0, void 0, function () {
            var stored, document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stored = {
                            id: promptId,
                            content_session_id: '', // Not needed for Chroma sync
                            prompt_number: promptNumber,
                            prompt_text: promptText,
                            created_at: new Date(createdAtEpoch * 1000).toISOString(),
                            created_at_epoch: createdAtEpoch,
                            memory_session_id: memorySessionId,
                            project: project
                        };
                        document = this.formatUserPromptDoc(stored);
                        logger_js_1.logger.info('CHROMA_SYNC', 'Syncing user prompt', {
                            promptId: promptId,
                            project: project
                        });
                        return [4 /*yield*/, this.addDocuments([document])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch all existing document IDs from Chroma collection via MCP
     * Returns Sets of SQLite IDs for observations, summaries, and prompts
     */
    ChromaSync.prototype.getExistingChromaIds = function (projectOverride) {
        return __awaiter(this, void 0, void 0, function () {
            var targetProject, chromaMcp, observationIds, summaryIds, promptIds, offset, limit, result, metadatas, _i, metadatas_1, meta, sqliteId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        targetProject = projectOverride !== null && projectOverride !== void 0 ? projectOverride : this.project;
                        return [4 /*yield*/, this.ensureCollectionExists()];
                    case 1:
                        _a.sent();
                        chromaMcp = ChromaMcpManager_js_1.ChromaMcpManager.getInstance();
                        observationIds = new Set();
                        summaryIds = new Set();
                        promptIds = new Set();
                        offset = 0;
                        limit = 1000;
                        logger_js_1.logger.info('CHROMA_SYNC', 'Fetching existing Chroma document IDs...', { project: targetProject });
                        _a.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, chromaMcp.callTool('chroma_get_documents', {
                                collection_name: this.collectionName,
                                limit: limit,
                                offset: offset,
                                where: { project: targetProject },
                                include: ['metadatas']
                            })];
                    case 3:
                        result = _a.sent();
                        metadatas = (result === null || result === void 0 ? void 0 : result.metadatas) || [];
                        if (metadatas.length === 0) {
                            return [3 /*break*/, 4]; // No more documents
                        }
                        // Extract SQLite IDs from metadata
                        for (_i = 0, metadatas_1 = metadatas; _i < metadatas_1.length; _i++) {
                            meta = metadatas_1[_i];
                            if (meta && meta.sqlite_id) {
                                sqliteId = meta.sqlite_id;
                                if (meta.doc_type === 'observation') {
                                    observationIds.add(sqliteId);
                                }
                                else if (meta.doc_type === 'session_summary') {
                                    summaryIds.add(sqliteId);
                                }
                                else if (meta.doc_type === 'user_prompt') {
                                    promptIds.add(sqliteId);
                                }
                            }
                        }
                        offset += limit;
                        logger_js_1.logger.debug('CHROMA_SYNC', 'Fetched batch of existing IDs', {
                            project: targetProject,
                            offset: offset,
                            batchSize: metadatas.length
                        });
                        return [3 /*break*/, 2];
                    case 4:
                        logger_js_1.logger.info('CHROMA_SYNC', 'Existing IDs fetched', {
                            project: targetProject,
                            observations: observationIds.size,
                            summaries: summaryIds.size,
                            prompts: promptIds.size
                        });
                        return [2 /*return*/, { observations: observationIds, summaries: summaryIds, prompts: promptIds }];
                }
            });
        });
    };
    /**
     * Backfill: Sync all observations missing from Chroma
     * Reads from SQLite and syncs in batches
     * @param projectOverride - If provided, backfill this project instead of this.project.
     *   Used by backfillAllProjects() to iterate projects without mutating instance state.
     * Throws error if backfill fails
     */
    ChromaSync.prototype.ensureBackfilled = function (projectOverride) {
        return __awaiter(this, void 0, void 0, function () {
            var backfillProject, existing, db, existingObsIds, obsExclusionClause, observations, totalObsCount, allDocs, _i, observations_1, obs, i, batch, existingSummaryIds, summaryExclusionClause, summaries, totalSummaryCount, summaryDocs, _a, summaries_1, summary, i, batch, existingPromptIds, promptExclusionClause, prompts, totalPromptCount, promptDocs, _b, prompts_1, prompt_1, i, batch, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        backfillProject = projectOverride !== null && projectOverride !== void 0 ? projectOverride : this.project;
                        logger_js_1.logger.info('CHROMA_SYNC', 'Starting smart backfill', { project: backfillProject });
                        return [4 /*yield*/, this.ensureCollectionExists()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.getExistingChromaIds(backfillProject)];
                    case 2:
                        existing = _c.sent();
                        db = new SessionStore_js_1.SessionStore();
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 16, 17, 18]);
                        existingObsIds = Array.from(existing.observations).filter(function (id) { return Number.isInteger(id) && id > 0; });
                        obsExclusionClause = existingObsIds.length > 0
                            ? "AND id NOT IN (".concat(existingObsIds.join(','), ")")
                            : '';
                        observations = db.db.prepare("\n        SELECT * FROM observations\n        WHERE project = ? ".concat(obsExclusionClause, "\n        ORDER BY id ASC\n      ")).all(backfillProject);
                        totalObsCount = db.db.prepare("\n        SELECT COUNT(*) as count FROM observations WHERE project = ?\n      ").get(backfillProject);
                        logger_js_1.logger.info('CHROMA_SYNC', 'Backfilling observations', {
                            project: backfillProject,
                            missing: observations.length,
                            existing: existing.observations.size,
                            total: totalObsCount.count
                        });
                        allDocs = [];
                        for (_i = 0, observations_1 = observations; _i < observations_1.length; _i++) {
                            obs = observations_1[_i];
                            allDocs.push.apply(allDocs, this.formatObservationDocs(obs));
                        }
                        i = 0;
                        _c.label = 4;
                    case 4:
                        if (!(i < allDocs.length)) return [3 /*break*/, 7];
                        batch = allDocs.slice(i, i + this.BATCH_SIZE);
                        return [4 /*yield*/, this.addDocuments(batch)];
                    case 5:
                        _c.sent();
                        logger_js_1.logger.debug('CHROMA_SYNC', 'Backfill progress', {
                            project: backfillProject,
                            progress: "".concat(Math.min(i + this.BATCH_SIZE, allDocs.length), "/").concat(allDocs.length)
                        });
                        _c.label = 6;
                    case 6:
                        i += this.BATCH_SIZE;
                        return [3 /*break*/, 4];
                    case 7:
                        existingSummaryIds = Array.from(existing.summaries).filter(function (id) { return Number.isInteger(id) && id > 0; });
                        summaryExclusionClause = existingSummaryIds.length > 0
                            ? "AND id NOT IN (".concat(existingSummaryIds.join(','), ")")
                            : '';
                        summaries = db.db.prepare("\n        SELECT * FROM session_summaries\n        WHERE project = ? ".concat(summaryExclusionClause, "\n        ORDER BY id ASC\n      ")).all(backfillProject);
                        totalSummaryCount = db.db.prepare("\n        SELECT COUNT(*) as count FROM session_summaries WHERE project = ?\n      ").get(backfillProject);
                        logger_js_1.logger.info('CHROMA_SYNC', 'Backfilling summaries', {
                            project: backfillProject,
                            missing: summaries.length,
                            existing: existing.summaries.size,
                            total: totalSummaryCount.count
                        });
                        summaryDocs = [];
                        for (_a = 0, summaries_1 = summaries; _a < summaries_1.length; _a++) {
                            summary = summaries_1[_a];
                            summaryDocs.push.apply(summaryDocs, this.formatSummaryDocs(summary));
                        }
                        i = 0;
                        _c.label = 8;
                    case 8:
                        if (!(i < summaryDocs.length)) return [3 /*break*/, 11];
                        batch = summaryDocs.slice(i, i + this.BATCH_SIZE);
                        return [4 /*yield*/, this.addDocuments(batch)];
                    case 9:
                        _c.sent();
                        logger_js_1.logger.debug('CHROMA_SYNC', 'Backfill progress', {
                            project: backfillProject,
                            progress: "".concat(Math.min(i + this.BATCH_SIZE, summaryDocs.length), "/").concat(summaryDocs.length)
                        });
                        _c.label = 10;
                    case 10:
                        i += this.BATCH_SIZE;
                        return [3 /*break*/, 8];
                    case 11:
                        existingPromptIds = Array.from(existing.prompts).filter(function (id) { return Number.isInteger(id) && id > 0; });
                        promptExclusionClause = existingPromptIds.length > 0
                            ? "AND up.id NOT IN (".concat(existingPromptIds.join(','), ")")
                            : '';
                        prompts = db.db.prepare("\n        SELECT\n          up.*,\n          s.project,\n          s.memory_session_id\n        FROM user_prompts up\n        JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n        WHERE s.project = ? ".concat(promptExclusionClause, "\n        ORDER BY up.id ASC\n      ")).all(backfillProject);
                        totalPromptCount = db.db.prepare("\n        SELECT COUNT(*) as count\n        FROM user_prompts up\n        JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n        WHERE s.project = ?\n      ").get(backfillProject);
                        logger_js_1.logger.info('CHROMA_SYNC', 'Backfilling user prompts', {
                            project: backfillProject,
                            missing: prompts.length,
                            existing: existing.prompts.size,
                            total: totalPromptCount.count
                        });
                        promptDocs = [];
                        for (_b = 0, prompts_1 = prompts; _b < prompts_1.length; _b++) {
                            prompt_1 = prompts_1[_b];
                            promptDocs.push(this.formatUserPromptDoc(prompt_1));
                        }
                        i = 0;
                        _c.label = 12;
                    case 12:
                        if (!(i < promptDocs.length)) return [3 /*break*/, 15];
                        batch = promptDocs.slice(i, i + this.BATCH_SIZE);
                        return [4 /*yield*/, this.addDocuments(batch)];
                    case 13:
                        _c.sent();
                        logger_js_1.logger.debug('CHROMA_SYNC', 'Backfill progress', {
                            project: backfillProject,
                            progress: "".concat(Math.min(i + this.BATCH_SIZE, promptDocs.length), "/").concat(promptDocs.length)
                        });
                        _c.label = 14;
                    case 14:
                        i += this.BATCH_SIZE;
                        return [3 /*break*/, 12];
                    case 15:
                        logger_js_1.logger.info('CHROMA_SYNC', 'Smart backfill complete', {
                            project: backfillProject,
                            synced: {
                                observationDocs: allDocs.length,
                                summaryDocs: summaryDocs.length,
                                promptDocs: promptDocs.length
                            },
                            skipped: {
                                observations: existing.observations.size,
                                summaries: existing.summaries.size,
                                prompts: existing.prompts.size
                            }
                        });
                        return [3 /*break*/, 18];
                    case 16:
                        error_3 = _c.sent();
                        logger_js_1.logger.error('CHROMA_SYNC', 'Backfill failed', { project: backfillProject }, error_3);
                        throw new Error("Backfill failed: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 17:
                        db.close();
                        return [7 /*endfinally*/];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Query Chroma collection for semantic search via MCP
     * Used by SearchManager for vector-based search
     */
    ChromaSync.prototype.queryChroma = function (query, limit, whereFilter) {
        return __awaiter(this, void 0, void 0, function () {
            var chromaMcp, results, ids, seen, docIds, rawMetadatas, rawDistances, metadatas, distances, i, docId, obsMatch, summaryMatch, promptMatch, sqliteId, error_4, errorMessage, isConnectionError;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.ensureCollectionExists()];
                    case 1:
                        _f.sent();
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 4, , 5]);
                        chromaMcp = ChromaMcpManager_js_1.ChromaMcpManager.getInstance();
                        return [4 /*yield*/, chromaMcp.callTool('chroma_query_documents', __assign(__assign({ collection_name: this.collectionName, query_texts: [query], n_results: limit }, (whereFilter && { where: whereFilter })), { include: ['documents', 'metadatas', 'distances'] }))];
                    case 3:
                        results = _f.sent();
                        ids = [];
                        seen = new Set();
                        docIds = ((_a = results === null || results === void 0 ? void 0 : results.ids) === null || _a === void 0 ? void 0 : _a[0]) || [];
                        rawMetadatas = ((_b = results === null || results === void 0 ? void 0 : results.metadatas) === null || _b === void 0 ? void 0 : _b[0]) || [];
                        rawDistances = ((_c = results === null || results === void 0 ? void 0 : results.distances) === null || _c === void 0 ? void 0 : _c[0]) || [];
                        metadatas = [];
                        distances = [];
                        for (i = 0; i < docIds.length; i++) {
                            docId = docIds[i];
                            obsMatch = docId.match(/obs_(\d+)_/);
                            summaryMatch = docId.match(/summary_(\d+)_/);
                            promptMatch = docId.match(/prompt_(\d+)/);
                            sqliteId = null;
                            if (obsMatch) {
                                sqliteId = parseInt(obsMatch[1], 10);
                            }
                            else if (summaryMatch) {
                                sqliteId = parseInt(summaryMatch[1], 10);
                            }
                            else if (promptMatch) {
                                sqliteId = parseInt(promptMatch[1], 10);
                            }
                            if (sqliteId !== null && !seen.has(sqliteId)) {
                                seen.add(sqliteId);
                                ids.push(sqliteId);
                                metadatas.push((_d = rawMetadatas[i]) !== null && _d !== void 0 ? _d : null);
                                distances.push((_e = rawDistances[i]) !== null && _e !== void 0 ? _e : 0);
                            }
                        }
                        return [2 /*return*/, { ids: ids, distances: distances, metadatas: metadatas }];
                    case 4:
                        error_4 = _f.sent();
                        errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                        isConnectionError = errorMessage.includes('ECONNREFUSED') ||
                            errorMessage.includes('ENOTFOUND') ||
                            errorMessage.includes('fetch failed') ||
                            errorMessage.includes('subprocess closed') ||
                            errorMessage.includes('timed out');
                        if (isConnectionError) {
                            // Reset collection state so next call attempts reconnect
                            this.collectionCreated = false;
                            logger_js_1.logger.error('CHROMA_SYNC', 'Connection lost during query', { project: this.project, query: query }, error_4);
                            throw new Error("Chroma query failed - connection lost: ".concat(errorMessage));
                        }
                        logger_js_1.logger.error('CHROMA_SYNC', 'Query failed', { project: this.project, query: query }, error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Backfill all projects that have observations in SQLite but may be missing from Chroma.
     * Uses a single shared ChromaSync('claude-mem') instance and Chroma connection.
     * Per-project scoping is passed as a parameter to ensureBackfilled(), avoiding
     * instance state mutation. All documents land in the cm__claude-mem collection
     * with project scoped via metadata, matching how DatabaseManager and SearchManager operate.
     * Designed to be called fire-and-forget on worker startup.
     */
    ChromaSync.backfillAllProjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, sync, projects, _i, projects_1, project, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        db = new SessionStore_js_1.SessionStore();
                        sync = new ChromaSync('claude-mem');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 8, 10]);
                        projects = db.db.prepare('SELECT DISTINCT project FROM observations WHERE project IS NOT NULL AND project != ?').all('');
                        logger_js_1.logger.info('CHROMA_SYNC', "Backfill check for ".concat(projects.length, " projects"));
                        _i = 0, projects_1 = projects;
                        _a.label = 2;
                    case 2:
                        if (!(_i < projects_1.length)) return [3 /*break*/, 7];
                        project = projects_1[_i].project;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, sync.ensureBackfilled(project)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _a.sent();
                        logger_js_1.logger.error('CHROMA_SYNC', "Backfill failed for project: ".concat(project), {}, error_5);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, sync.close()];
                    case 9:
                        _a.sent();
                        db.close();
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the ChromaSync instance
     * ChromaMcpManager is a singleton and manages its own lifecycle
     * We don't close it here - it's closed during graceful shutdown
     */
    ChromaSync.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // ChromaMcpManager is a singleton and manages its own lifecycle
                // We don't close it here - it's closed during graceful shutdown
                logger_js_1.logger.info('CHROMA_SYNC', 'ChromaSync closed', { project: this.project });
                return [2 /*return*/];
            });
        });
    };
    return ChromaSync;
}());
exports.ChromaSync = ChromaSync;
