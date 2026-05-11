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
exports.TranscriptEventProcessor = void 0;
var session_init_js_1 = require("../../cli/handlers/session-init.js");
var observation_js_1 = require("../../cli/handlers/observation.js");
var file_edit_js_1 = require("../../cli/handlers/file-edit.js");
var session_complete_js_1 = require("../../cli/handlers/session-complete.js");
var worker_utils_js_1 = require("../../shared/worker-utils.js");
var logger_js_1 = require("../../utils/logger.js");
var project_name_js_1 = require("../../utils/project-name.js");
var agents_md_utils_js_1 = require("../../utils/agents-md-utils.js");
var field_utils_js_1 = require("./field-utils.js");
var config_js_1 = require("./config.js");
var TranscriptEventProcessor = /** @class */ (function () {
    function TranscriptEventProcessor() {
        this.sessions = new Map();
    }
    TranscriptEventProcessor.prototype.processEntry = function (entry, watch, schema, sessionIdOverride) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, event_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = schema.events;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        event_1 = _a[_i];
                        if (!(0, field_utils_js_1.matchesRule)(entry, event_1.match, schema))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleEvent(entry, watch, schema, event_1, sessionIdOverride !== null && sessionIdOverride !== void 0 ? sessionIdOverride : undefined)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.getSessionKey = function (watch, sessionId) {
        return "".concat(watch.name, ":").concat(sessionId);
    };
    TranscriptEventProcessor.prototype.getOrCreateSession = function (watch, sessionId) {
        var key = this.getSessionKey(watch, sessionId);
        var session = this.sessions.get(key);
        if (!session) {
            session = {
                sessionId: sessionId,
                pendingTools: new Map()
            };
            this.sessions.set(key, session);
        }
        return session;
    };
    TranscriptEventProcessor.prototype.resolveSessionId = function (entry, watch, schema, event, sessionIdOverride) {
        var _a, _b;
        var ctx = { watch: watch, schema: schema };
        var fieldSpec = (_b = (_a = event.fields) === null || _a === void 0 ? void 0 : _a.sessionId) !== null && _b !== void 0 ? _b : (schema.sessionIdPath ? { path: schema.sessionIdPath } : undefined);
        var resolved = (0, field_utils_js_1.resolveFieldSpec)(fieldSpec, entry, ctx);
        if (typeof resolved === 'string' && resolved.trim())
            return resolved;
        if (typeof resolved === 'number')
            return String(resolved);
        if (sessionIdOverride && sessionIdOverride.trim())
            return sessionIdOverride;
        return null;
    };
    TranscriptEventProcessor.prototype.resolveCwd = function (entry, watch, schema, event, session) {
        var _a, _b;
        var ctx = { watch: watch, schema: schema, session: session };
        var fieldSpec = (_b = (_a = event.fields) === null || _a === void 0 ? void 0 : _a.cwd) !== null && _b !== void 0 ? _b : (schema.cwdPath ? { path: schema.cwdPath } : undefined);
        var resolved = (0, field_utils_js_1.resolveFieldSpec)(fieldSpec, entry, ctx);
        if (typeof resolved === 'string' && resolved.trim())
            return resolved;
        if (watch.workspace)
            return watch.workspace;
        return session.cwd;
    };
    TranscriptEventProcessor.prototype.resolveProject = function (entry, watch, schema, event, session) {
        var _a, _b;
        var ctx = { watch: watch, schema: schema, session: session };
        var fieldSpec = (_b = (_a = event.fields) === null || _a === void 0 ? void 0 : _a.project) !== null && _b !== void 0 ? _b : (schema.projectPath ? { path: schema.projectPath } : undefined);
        var resolved = (0, field_utils_js_1.resolveFieldSpec)(fieldSpec, entry, ctx);
        if (typeof resolved === 'string' && resolved.trim())
            return resolved;
        if (watch.project)
            return watch.project;
        if (session.cwd)
            return (0, project_name_js_1.getProjectName)(session.cwd);
        return session.project;
    };
    TranscriptEventProcessor.prototype.handleEvent = function (entry, watch, schema, event, sessionIdOverride) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, session, cwd, project, fields, _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        sessionId = this.resolveSessionId(entry, watch, schema, event, sessionIdOverride);
                        if (!sessionId) {
                            logger_js_1.logger.debug('TRANSCRIPT', 'Skipping event without sessionId', { event: event.name, watch: watch.name });
                            return [2 /*return*/];
                        }
                        session = this.getOrCreateSession(watch, sessionId);
                        cwd = this.resolveCwd(entry, watch, schema, event, session);
                        if (cwd)
                            session.cwd = cwd;
                        project = this.resolveProject(entry, watch, schema, event, session);
                        if (project)
                            session.project = project;
                        fields = (0, field_utils_js_1.resolveFields)(event.fields, entry, { watch: watch, schema: schema, session: session });
                        _a = event.action;
                        switch (_a) {
                            case 'session_context': return [3 /*break*/, 1];
                            case 'session_init': return [3 /*break*/, 2];
                            case 'user_message': return [3 /*break*/, 6];
                            case 'assistant_message': return [3 /*break*/, 7];
                            case 'tool_use': return [3 /*break*/, 8];
                            case 'tool_result': return [3 /*break*/, 10];
                            case 'observation': return [3 /*break*/, 12];
                            case 'file_edit': return [3 /*break*/, 14];
                            case 'session_end': return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 18];
                    case 1:
                        this.applySessionContext(session, fields);
                        return [3 /*break*/, 19];
                    case 2: return [4 /*yield*/, this.handleSessionInit(session, fields)];
                    case 3:
                        _d.sent();
                        if (!((_c = (_b = watch.context) === null || _b === void 0 ? void 0 : _b.updateOn) === null || _c === void 0 ? void 0 : _c.includes('session_start'))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.updateContext(session, watch)];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [3 /*break*/, 19];
                    case 6:
                        if (typeof fields.message === 'string')
                            session.lastUserMessage = fields.message;
                        if (typeof fields.prompt === 'string')
                            session.lastUserMessage = fields.prompt;
                        return [3 /*break*/, 19];
                    case 7:
                        if (typeof fields.message === 'string')
                            session.lastAssistantMessage = fields.message;
                        return [3 /*break*/, 19];
                    case 8: return [4 /*yield*/, this.handleToolUse(session, fields)];
                    case 9:
                        _d.sent();
                        return [3 /*break*/, 19];
                    case 10: return [4 /*yield*/, this.handleToolResult(session, fields)];
                    case 11:
                        _d.sent();
                        return [3 /*break*/, 19];
                    case 12: return [4 /*yield*/, this.sendObservation(session, fields)];
                    case 13:
                        _d.sent();
                        return [3 /*break*/, 19];
                    case 14: return [4 /*yield*/, this.sendFileEdit(session, fields)];
                    case 15:
                        _d.sent();
                        return [3 /*break*/, 19];
                    case 16: return [4 /*yield*/, this.handleSessionEnd(session, watch)];
                    case 17:
                        _d.sent();
                        return [3 /*break*/, 19];
                    case 18: return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.applySessionContext = function (session, fields) {
        var cwd = typeof fields.cwd === 'string' ? fields.cwd : undefined;
        var project = typeof fields.project === 'string' ? fields.project : undefined;
        if (cwd)
            session.cwd = cwd;
        if (project)
            session.project = project;
    };
    TranscriptEventProcessor.prototype.handleSessionInit = function (session, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, cwd;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        prompt = typeof fields.prompt === 'string' ? fields.prompt : '';
                        cwd = (_a = session.cwd) !== null && _a !== void 0 ? _a : process.cwd();
                        if (prompt) {
                            session.lastUserMessage = prompt;
                        }
                        return [4 /*yield*/, session_init_js_1.sessionInitHandler.execute({
                                sessionId: session.sessionId,
                                cwd: cwd,
                                prompt: prompt,
                                platform: 'transcript'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.handleToolUse = function (session, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var toolId, toolName, toolInput, toolResponse, pending, files, _i, files_1, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toolId = typeof fields.toolId === 'string' ? fields.toolId : undefined;
                        toolName = typeof fields.toolName === 'string' ? fields.toolName : undefined;
                        toolInput = this.maybeParseJson(fields.toolInput);
                        toolResponse = this.maybeParseJson(fields.toolResponse);
                        pending = { id: toolId, name: toolName, input: toolInput, response: toolResponse };
                        if (toolId) {
                            session.pendingTools.set(toolId, { name: pending.name, input: pending.input });
                        }
                        if (!(toolName === 'apply_patch' && typeof toolInput === 'string')) return [3 /*break*/, 4];
                        files = this.parseApplyPatchFiles(toolInput);
                        _i = 0, files_1 = files;
                        _a.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 4];
                        filePath = files_1[_i];
                        return [4 /*yield*/, this.sendFileEdit(session, {
                                filePath: filePath,
                                edits: [{ type: 'apply_patch', patch: toolInput }]
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!(toolResponse !== undefined && toolName)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.sendObservation(session, {
                                toolName: toolName,
                                toolInput: toolInput,
                                toolResponse: toolResponse
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.handleToolResult = function (session, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var toolId, toolName, toolResponse, toolInput, name, pending;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        toolId = typeof fields.toolId === 'string' ? fields.toolId : undefined;
                        toolName = typeof fields.toolName === 'string' ? fields.toolName : undefined;
                        toolResponse = this.maybeParseJson(fields.toolResponse);
                        toolInput = this.maybeParseJson(fields.toolInput);
                        name = toolName;
                        if (toolId && session.pendingTools.has(toolId)) {
                            pending = session.pendingTools.get(toolId);
                            toolInput = (_a = pending.input) !== null && _a !== void 0 ? _a : toolInput;
                            name = name !== null && name !== void 0 ? name : pending.name;
                            session.pendingTools.delete(toolId);
                        }
                        if (!name) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendObservation(session, {
                                toolName: name,
                                toolInput: toolInput,
                                toolResponse: toolResponse
                            })];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.sendObservation = function (session, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var toolName;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        toolName = typeof fields.toolName === 'string' ? fields.toolName : undefined;
                        if (!toolName)
                            return [2 /*return*/];
                        return [4 /*yield*/, observation_js_1.observationHandler.execute({
                                sessionId: session.sessionId,
                                cwd: (_a = session.cwd) !== null && _a !== void 0 ? _a : process.cwd(),
                                toolName: toolName,
                                toolInput: this.maybeParseJson(fields.toolInput),
                                toolResponse: this.maybeParseJson(fields.toolResponse),
                                platform: 'transcript'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.sendFileEdit = function (session, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        filePath = typeof fields.filePath === 'string' ? fields.filePath : undefined;
                        if (!filePath)
                            return [2 /*return*/];
                        return [4 /*yield*/, file_edit_js_1.fileEditHandler.execute({
                                sessionId: session.sessionId,
                                cwd: (_a = session.cwd) !== null && _a !== void 0 ? _a : process.cwd(),
                                filePath: filePath,
                                edits: Array.isArray(fields.edits) ? fields.edits : undefined,
                                platform: 'transcript'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.maybeParseJson = function (value) {
        if (typeof value !== 'string')
            return value;
        var trimmed = value.trim();
        if (!trimmed)
            return value;
        if (!(trimmed.startsWith('{') || trimmed.startsWith('[')))
            return value;
        try {
            return JSON.parse(trimmed);
        }
        catch (_a) {
            return value;
        }
    };
    TranscriptEventProcessor.prototype.parseApplyPatchFiles = function (patch) {
        var files = [];
        var lines = patch.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var trimmed = line.trim();
            if (trimmed.startsWith('*** Update File: ')) {
                files.push(trimmed.replace('*** Update File: ', '').trim());
            }
            else if (trimmed.startsWith('*** Add File: ')) {
                files.push(trimmed.replace('*** Add File: ', '').trim());
            }
            else if (trimmed.startsWith('*** Delete File: ')) {
                files.push(trimmed.replace('*** Delete File: ', '').trim());
            }
            else if (trimmed.startsWith('*** Move to: ')) {
                files.push(trimmed.replace('*** Move to: ', '').trim());
            }
            else if (trimmed.startsWith('+++ ')) {
                var path = trimmed.replace('+++ ', '').replace(/^b\//, '').trim();
                if (path && path !== '/dev/null')
                    files.push(path);
            }
        }
        return Array.from(new Set(files));
    };
    TranscriptEventProcessor.prototype.handleSessionEnd = function (session, watch) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.queueSummary(session)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, session_complete_js_1.sessionCompleteHandler.execute({
                                sessionId: session.sessionId,
                                cwd: (_a = session.cwd) !== null && _a !== void 0 ? _a : process.cwd(),
                                platform: 'transcript'
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.updateContext(session, watch)];
                    case 3:
                        _b.sent();
                        session.pendingTools.clear();
                        key = this.getSessionKey(watch, session.sessionId);
                        this.sessions.delete(key);
                        return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.queueSummary = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var workerReady, lastAssistantMessage, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, worker_utils_js_1.ensureWorkerRunning)()];
                    case 1:
                        workerReady = _b.sent();
                        if (!workerReady)
                            return [2 /*return*/];
                        lastAssistantMessage = (_a = session.lastAssistantMessage) !== null && _a !== void 0 ? _a : '';
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)('/api/sessions/summarize', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contentSessionId: session.sessionId,
                                    last_assistant_message: lastAssistantMessage
                                })
                            })];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        logger_js_1.logger.warn('TRANSCRIPT', 'Summary request failed', {
                            error: error_1 instanceof Error ? error_1.message : String(error_1)
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptEventProcessor.prototype.updateContext = function (session, watch) {
        return __awaiter(this, void 0, void 0, function () {
            var workerReady, cwd, context, projectsParam, response, content, agentsPath, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!watch.context)
                            return [2 /*return*/];
                        if (watch.context.mode !== 'agents')
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, worker_utils_js_1.ensureWorkerRunning)()];
                    case 1:
                        workerReady = _c.sent();
                        if (!workerReady)
                            return [2 /*return*/];
                        cwd = (_a = session.cwd) !== null && _a !== void 0 ? _a : watch.workspace;
                        if (!cwd)
                            return [2 /*return*/];
                        context = (0, project_name_js_1.getProjectContext)(cwd);
                        projectsParam = context.allProjects.join(',');
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)("/api/context/inject?projects=".concat(encodeURIComponent(projectsParam)))];
                    case 3:
                        response = _c.sent();
                        if (!response.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, response.text()];
                    case 4:
                        content = (_c.sent()).trim();
                        if (!content)
                            return [2 /*return*/];
                        agentsPath = (0, config_js_1.expandHomePath)((_b = watch.context.path) !== null && _b !== void 0 ? _b : "".concat(cwd, "/AGENTS.md"));
                        (0, agents_md_utils_js_1.writeAgentsMd)(agentsPath, content);
                        logger_js_1.logger.debug('TRANSCRIPT', 'Updated AGENTS.md context', { agentsPath: agentsPath, watch: watch.name });
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _c.sent();
                        logger_js_1.logger.warn('TRANSCRIPT', 'Failed to update AGENTS.md context', {
                            error: error_2 instanceof Error ? error_2.message : String(error_2)
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return TranscriptEventProcessor;
}());
exports.TranscriptEventProcessor = TranscriptEventProcessor;
