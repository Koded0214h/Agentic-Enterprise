"use strict";
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
exports.deduplicateSessionBranches = deduplicateSessionBranches;
exports.detectMultiClauding = detectMultiClauding;
exports.buildExportData = buildExportData;
exports.generateUsageReport = generateUsageReport;
var child_process_1 = require("child_process");
var diff_1 = require("diff");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var claude_js_1 = require("../services/api/claude.js");
var constants_js_1 = require("../tools/AgentTool/constants.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var execFileNoThrow_js_1 = require("../utils/execFileNoThrow.js");
var log_js_1 = require("../utils/log.js");
var messages_js_1 = require("../utils/messages.js");
var model_js_1 = require("../utils/model/model.js");
var sessionStorage_js_1 = require("../utils/sessionStorage.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var stringUtils_js_1 = require("../utils/stringUtils.js");
var systemPromptType_js_1 = require("../utils/systemPromptType.js");
var xml_js_1 = require("../utils/xml.js");
// Model for facet extraction and summarization (Opus - best quality)
function getAnalysisModel() {
    return (0, model_js_1.getDefaultOpusModel)();
}
// Model for narrative insights (Opus - best quality)
function getInsightsModel() {
    return (0, model_js_1.getDefaultOpusModel)();
}
/* eslint-disable custom-rules/no-process-env-top-level */
var getRunningRemoteHosts = process.env.USER_TYPE === 'ant'
    ? function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, stdout, code, workspaces;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('coder', ['list', '-o', 'json'], { timeout: 30000 })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    if (code !== 0)
                        return [2 /*return*/, []];
                    try {
                        workspaces = (0, slowOperations_js_1.jsonParse)(stdout);
                        return [2 /*return*/, workspaces
                                .filter(function (w) { var _a; return ((_a = w.latest_build) === null || _a === void 0 ? void 0 : _a.status) === 'running'; })
                                .map(function (w) { return w.name; })];
                    }
                    catch (_c) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/];
            }
        });
    }); }
    : function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, []];
    }); }); };
var getRemoteHostSessionCount = process.env.USER_TYPE === 'ant'
    ? function (homespace) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, stdout, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('ssh', [
                        "".concat(homespace, ".coder"),
                        'find /root/.claude/projects -name "*.jsonl" 2>/dev/null | wc -l',
                    ], { timeout: 30000 })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    if (code !== 0)
                        return [2 /*return*/, 0];
                    return [2 /*return*/, parseInt(stdout.trim(), 10) || 0];
            }
        });
    }); }
    : function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, 0];
    }); }); };
var collectFromRemoteHost = process.env.USER_TYPE === 'ant'
    ? function (homespace, destDir) { return __awaiter(void 0, void 0, void 0, function () {
        var result, tempDir, scpResult, projectsDir_1, projectDirents, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    result = { copied: 0, skipped: 0 };
                    return [4 /*yield*/, (0, promises_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), 'claude-hs-'))];
                case 1:
                    tempDir = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, , 9, 13]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('scp', ['-rq', "".concat(homespace, ".coder:/root/.claude/projects/"), tempDir], { timeout: 300000 })];
                case 3:
                    scpResult = _c.sent();
                    if (scpResult.code !== 0) {
                        // SCP failed
                        return [2 /*return*/, result];
                    }
                    projectsDir_1 = (0, path_1.join)(tempDir, 'projects');
                    projectDirents = void 0;
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir_1, { withFileTypes: true })];
                case 5:
                    projectDirents = _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = _c.sent();
                    return [2 /*return*/, result];
                case 7: 
                // Merge into destination (parallel per project directory)
                return [4 /*yield*/, Promise.all(projectDirents.map(function (dirent) { return __awaiter(void 0, void 0, void 0, function () {
                        var projectName, projectPath, destProjectName, destProjectPath, _a, files, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    projectName = dirent.name;
                                    projectPath = (0, path_1.join)(projectsDir_1, projectName);
                                    // Skip if not a directory
                                    if (!dirent.isDirectory())
                                        return [2 /*return*/];
                                    destProjectName = "".concat(projectName, "__").concat(homespace);
                                    destProjectPath = (0, path_1.join)(destDir, destProjectName);
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, promises_1.mkdir)(destProjectPath, { recursive: true })];
                                case 2:
                                    _c.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    _a = _c.sent();
                                    return [3 /*break*/, 4];
                                case 4:
                                    _c.trys.push([4, 6, , 7]);
                                    return [4 /*yield*/, (0, promises_1.readdir)(projectPath, { withFileTypes: true })];
                                case 5:
                                    files = _c.sent();
                                    return [3 /*break*/, 7];
                                case 6:
                                    _b = _c.sent();
                                    return [2 /*return*/];
                                case 7: return [4 /*yield*/, Promise.all(files.map(function (fileDirent) { return __awaiter(void 0, void 0, void 0, function () {
                                        var fileName, srcFile, destFile, _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    fileName = fileDirent.name;
                                                    if (!fileName.endsWith('.jsonl'))
                                                        return [2 /*return*/];
                                                    srcFile = (0, path_1.join)(projectPath, fileName);
                                                    destFile = (0, path_1.join)(destProjectPath, fileName);
                                                    _b.label = 1;
                                                case 1:
                                                    _b.trys.push([1, 3, , 4]);
                                                    return [4 /*yield*/, (0, promises_1.copyFile)(srcFile, destFile, fs_1.constants.COPYFILE_EXCL)];
                                                case 2:
                                                    _b.sent();
                                                    result.copied++;
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    _a = _b.sent();
                                                    // EEXIST from COPYFILE_EXCL means dest already exists
                                                    result.skipped++;
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                                case 8:
                                    _c.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 8:
                    // Merge into destination (parallel per project directory)
                    _c.sent();
                    return [3 /*break*/, 13];
                case 9:
                    _c.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, promises_1.rm)(tempDir, { recursive: true, force: true })];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _b = _c.sent();
                    return [3 /*break*/, 12];
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/, result];
            }
        });
    }); }
    : function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ copied: 0, skipped: 0 })];
    }); }); };
var collectAllRemoteHostData = process.env.USER_TYPE === 'ant'
    ? function (destDir) { return __awaiter(void 0, void 0, void 0, function () {
        var rHosts, result, totalCopied, totalSkipped, hostResults, _i, hostResults_1, hr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRunningRemoteHosts()];
                case 1:
                    rHosts = _a.sent();
                    result = [];
                    totalCopied = 0;
                    totalSkipped = 0;
                    return [4 /*yield*/, Promise.all(rHosts.map(function (hs) { return __awaiter(void 0, void 0, void 0, function () {
                            var sessionCount, _a, copied, skipped;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, getRemoteHostSessionCount(hs)];
                                    case 1:
                                        sessionCount = _b.sent();
                                        if (!(sessionCount > 0)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, collectFromRemoteHost(hs, destDir)];
                                    case 2:
                                        _a = _b.sent(), copied = _a.copied, skipped = _a.skipped;
                                        return [2 /*return*/, { name: hs, sessionCount: sessionCount, copied: copied, skipped: skipped }];
                                    case 3: return [2 /*return*/, { name: hs, sessionCount: sessionCount, copied: 0, skipped: 0 }];
                                }
                            });
                        }); }))];
                case 2:
                    hostResults = _a.sent();
                    for (_i = 0, hostResults_1 = hostResults; _i < hostResults_1.length; _i++) {
                        hr = hostResults_1[_i];
                        result.push({ name: hr.name, sessionCount: hr.sessionCount });
                        totalCopied += hr.copied;
                        totalSkipped += hr.skipped;
                    }
                    return [2 /*return*/, { hosts: result, totalCopied: totalCopied, totalSkipped: totalSkipped }];
            }
        });
    }); }
    : function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, ({ hosts: [], totalCopied: 0, totalSkipped: 0 })
            /* eslint-enable custom-rules/no-process-env-top-level */
            // ============================================================================
            // Types
            // ============================================================================
        ];
    }); }); };
// ============================================================================
// Constants
// ============================================================================
var EXTENSION_TO_LANGUAGE = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.md': 'Markdown',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.sh': 'Shell',
    '.css': 'CSS',
    '.html': 'HTML',
};
// Label map for cleaning up category names (matching Python reference)
var LABEL_MAP = {
    // Goal categories
    debug_investigate: 'Debug/Investigate',
    implement_feature: 'Implement Feature',
    fix_bug: 'Fix Bug',
    write_script_tool: 'Write Script/Tool',
    refactor_code: 'Refactor Code',
    configure_system: 'Configure System',
    create_pr_commit: 'Create PR/Commit',
    analyze_data: 'Analyze Data',
    understand_codebase: 'Understand Codebase',
    write_tests: 'Write Tests',
    write_docs: 'Write Docs',
    deploy_infra: 'Deploy/Infra',
    warmup_minimal: 'Cache Warmup',
    // Success factors
    fast_accurate_search: 'Fast/Accurate Search',
    correct_code_edits: 'Correct Code Edits',
    good_explanations: 'Good Explanations',
    proactive_help: 'Proactive Help',
    multi_file_changes: 'Multi-file Changes',
    handled_complexity: 'Multi-file Changes',
    good_debugging: 'Good Debugging',
    // Friction types
    misunderstood_request: 'Misunderstood Request',
    wrong_approach: 'Wrong Approach',
    buggy_code: 'Buggy Code',
    user_rejected_action: 'User Rejected Action',
    claude_got_blocked: 'Claude Got Blocked',
    user_stopped_early: 'User Stopped Early',
    wrong_file_or_location: 'Wrong File/Location',
    excessive_changes: 'Excessive Changes',
    slow_or_verbose: 'Slow/Verbose',
    tool_failed: 'Tool Failed',
    user_unclear: 'User Unclear',
    external_issue: 'External Issue',
    // Satisfaction labels
    frustrated: 'Frustrated',
    dissatisfied: 'Dissatisfied',
    likely_satisfied: 'Likely Satisfied',
    satisfied: 'Satisfied',
    happy: 'Happy',
    unsure: 'Unsure',
    neutral: 'Neutral',
    delighted: 'Delighted',
    // Session types
    single_task: 'Single Task',
    multi_task: 'Multi Task',
    iterative_refinement: 'Iterative Refinement',
    exploration: 'Exploration',
    quick_question: 'Quick Question',
    // Outcomes
    fully_achieved: 'Fully Achieved',
    mostly_achieved: 'Mostly Achieved',
    partially_achieved: 'Partially Achieved',
    not_achieved: 'Not Achieved',
    unclear_from_transcript: 'Unclear',
    // Helpfulness
    unhelpful: 'Unhelpful',
    slightly_helpful: 'Slightly Helpful',
    moderately_helpful: 'Moderately Helpful',
    very_helpful: 'Very Helpful',
    essential: 'Essential',
};
// Lazy getters: getClaudeConfigHomeDir() is memoized and reads process.env.
// Calling it at module scope would populate the memoize cache before
// entrypoints can set CLAUDE_CONFIG_DIR, breaking all 150+ other callers.
function getDataDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'usage-data');
}
function getFacetsDir() {
    return (0, path_1.join)(getDataDir(), 'facets');
}
function getSessionMetaDir() {
    return (0, path_1.join)(getDataDir(), 'session-meta');
}
var FACET_EXTRACTION_PROMPT = "Analyze this Claude Code session and extract structured facets.\n\nCRITICAL GUIDELINES:\n\n1. **goal_categories**: Count ONLY what the USER explicitly asked for.\n   - DO NOT count Claude's autonomous codebase exploration\n   - DO NOT count work Claude decided to do on its own\n   - ONLY count when user says \"can you...\", \"please...\", \"I need...\", \"let's...\"\n\n2. **user_satisfaction_counts**: Base ONLY on explicit user signals.\n   - \"Yay!\", \"great!\", \"perfect!\" \u2192 happy\n   - \"thanks\", \"looks good\", \"that works\" \u2192 satisfied\n   - \"ok, now let's...\" (continuing without complaint) \u2192 likely_satisfied\n   - \"that's not right\", \"try again\" \u2192 dissatisfied\n   - \"this is broken\", \"I give up\" \u2192 frustrated\n\n3. **friction_counts**: Be specific about what went wrong.\n   - misunderstood_request: Claude interpreted incorrectly\n   - wrong_approach: Right goal, wrong solution method\n   - buggy_code: Code didn't work correctly\n   - user_rejected_action: User said no/stop to a tool call\n   - excessive_changes: Over-engineered or changed too much\n\n4. If very short or just warmup, use warmup_minimal for goal_category\n\nSESSION:\n";
// ============================================================================
// Helper Functions
// ============================================================================
function getLanguageFromPath(filePath) {
    var ext = (0, path_1.extname)(filePath).toLowerCase();
    return EXTENSION_TO_LANGUAGE[ext] || null;
}
function extractToolStats(log) {
    var toolCounts = {};
    var languages = {};
    var gitCommits = 0;
    var gitPushes = 0;
    var inputTokens = 0;
    var outputTokens = 0;
    // New stats
    var userInterruptions = 0;
    var userResponseTimes = [];
    var toolErrors = 0;
    var toolErrorCategories = {};
    var usesTaskAgent = false;
    // Additional stats
    var linesAdded = 0;
    var linesRemoved = 0;
    var filesModified = new Set();
    var messageHours = [];
    var userMessageTimestamps = []; // For multi-clauding detection
    var usesMcp = false;
    var usesWebSearch = false;
    var usesWebFetch = false;
    var lastAssistantTimestamp = null;
    for (var _i = 0, _a = log.messages; _i < _a.length; _i++) {
        var msg = _a[_i];
        // Get message timestamp for response time calculation
        var msgTimestamp = msg.timestamp;
        if (msg.type === 'assistant' && msg.message) {
            // Track timestamp for response time calculation
            if (msgTimestamp) {
                lastAssistantTimestamp = msgTimestamp;
            }
            var usage = msg.message.usage;
            if (usage) {
                inputTokens += usage.input_tokens || 0;
                outputTokens += usage.output_tokens || 0;
            }
            var content = msg.message.content;
            if (Array.isArray(content)) {
                for (var _b = 0, content_1 = content; _b < content_1.length; _b++) {
                    var block = content_1[_b];
                    if (block.type === 'tool_use' && 'name' in block) {
                        var toolName = block.name;
                        toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
                        // Check for special tool usage
                        if (toolName === constants_js_1.AGENT_TOOL_NAME ||
                            toolName === constants_js_1.LEGACY_AGENT_TOOL_NAME)
                            usesTaskAgent = true;
                        if (toolName.startsWith('mcp__'))
                            usesMcp = true;
                        if (toolName === 'WebSearch')
                            usesWebSearch = true;
                        if (toolName === 'WebFetch')
                            usesWebFetch = true;
                        var input = block.input;
                        if (input) {
                            var filePath = input.file_path || '';
                            if (filePath) {
                                var lang = getLanguageFromPath(filePath);
                                if (lang) {
                                    languages[lang] = (languages[lang] || 0) + 1;
                                }
                                // Track files modified by Edit/Write tools
                                if (toolName === 'Edit' || toolName === 'Write') {
                                    filesModified.add(filePath);
                                }
                            }
                            if (toolName === 'Edit') {
                                var oldString = input.old_string || '';
                                var newString = input.new_string || '';
                                for (var _c = 0, _d = (0, diff_1.diffLines)(oldString, newString); _c < _d.length; _c++) {
                                    var change = _d[_c];
                                    if (change.added)
                                        linesAdded += change.count || 0;
                                    if (change.removed)
                                        linesRemoved += change.count || 0;
                                }
                            }
                            // Track lines from Write tool (all added)
                            if (toolName === 'Write') {
                                var writeContent = input.content || '';
                                if (writeContent) {
                                    linesAdded += (0, stringUtils_js_1.countCharInString)(writeContent, '\n') + 1;
                                }
                            }
                            var command = input.command || '';
                            if (command.includes('git commit'))
                                gitCommits++;
                            if (command.includes('git push'))
                                gitPushes++;
                        }
                    }
                }
            }
        }
        // Check user messages
        if (msg.type === 'user' && msg.message) {
            var content = msg.message.content;
            // Check if this is an actual human message (has text) vs just tool_result
            // matching Python reference logic
            var isHumanMessage = false;
            if (typeof content === 'string' && content.trim()) {
                isHumanMessage = true;
            }
            else if (Array.isArray(content)) {
                for (var _e = 0, content_2 = content; _e < content_2.length; _e++) {
                    var block = content_2[_e];
                    if (block.type === 'text' && 'text' in block) {
                        isHumanMessage = true;
                        break;
                    }
                }
            }
            // Only track message hours and response times for actual human messages
            if (isHumanMessage) {
                // Track message hour for time-of-day analysis and timestamp for multi-clauding
                if (msgTimestamp) {
                    try {
                        var msgDate = new Date(msgTimestamp);
                        var hour = msgDate.getHours(); // Local hour 0-23
                        messageHours.push(hour);
                        // Collect timestamp for multi-clauding detection (matching Python)
                        userMessageTimestamps.push(msgTimestamp);
                    }
                    catch (_f) {
                        // Skip invalid timestamps
                    }
                }
                // Calculate response time (time from last assistant message to this user message)
                // Only count gaps > 2 seconds (real user think time, not tool results)
                if (lastAssistantTimestamp && msgTimestamp) {
                    var assistantTime = new Date(lastAssistantTimestamp).getTime();
                    var userTime = new Date(msgTimestamp).getTime();
                    var responseTimeSec = (userTime - assistantTime) / 1000;
                    // Only count reasonable response times (2s-1 hour) matching Python
                    if (responseTimeSec > 2 && responseTimeSec < 3600) {
                        userResponseTimes.push(responseTimeSec);
                    }
                }
            }
            // Process tool results (for error tracking)
            if (Array.isArray(content)) {
                for (var _g = 0, content_3 = content; _g < content_3.length; _g++) {
                    var block = content_3[_g];
                    if (block.type === 'tool_result' && 'content' in block) {
                        var isError = block.is_error;
                        // Count and categorize tool errors (matching Python reference logic)
                        if (isError) {
                            toolErrors++;
                            var resultContent = block.content;
                            var category = 'Other';
                            if (typeof resultContent === 'string') {
                                var lowerContent = resultContent.toLowerCase();
                                if (lowerContent.includes('exit code')) {
                                    category = 'Command Failed';
                                }
                                else if (lowerContent.includes('rejected') ||
                                    lowerContent.includes("doesn't want")) {
                                    category = 'User Rejected';
                                }
                                else if (lowerContent.includes('string to replace not found') ||
                                    lowerContent.includes('no changes')) {
                                    category = 'Edit Failed';
                                }
                                else if (lowerContent.includes('modified since read')) {
                                    category = 'File Changed';
                                }
                                else if (lowerContent.includes('exceeds maximum') ||
                                    lowerContent.includes('too large')) {
                                    category = 'File Too Large';
                                }
                                else if (lowerContent.includes('file not found') ||
                                    lowerContent.includes('does not exist')) {
                                    category = 'File Not Found';
                                }
                            }
                            toolErrorCategories[category] =
                                (toolErrorCategories[category] || 0) + 1;
                        }
                    }
                }
            }
            // Check for interruptions (matching Python reference)
            if (typeof content === 'string') {
                if (content.includes('[Request interrupted by user')) {
                    userInterruptions++;
                }
            }
            else if (Array.isArray(content)) {
                for (var _h = 0, content_4 = content; _h < content_4.length; _h++) {
                    var block = content_4[_h];
                    if (block.type === 'text' &&
                        'text' in block &&
                        block.text.includes('[Request interrupted by user')) {
                        userInterruptions++;
                        break;
                    }
                }
            }
        }
    }
    return {
        toolCounts: toolCounts,
        languages: languages,
        gitCommits: gitCommits,
        gitPushes: gitPushes,
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        // New stats
        userInterruptions: userInterruptions,
        userResponseTimes: userResponseTimes,
        toolErrors: toolErrors,
        toolErrorCategories: toolErrorCategories,
        usesTaskAgent: usesTaskAgent,
        usesMcp: usesMcp,
        usesWebSearch: usesWebSearch,
        usesWebFetch: usesWebFetch,
        // Additional stats
        linesAdded: linesAdded,
        linesRemoved: linesRemoved,
        filesModified: filesModified,
        messageHours: messageHours,
        userMessageTimestamps: userMessageTimestamps,
    };
}
function hasValidDates(log) {
    return (!Number.isNaN(log.created.getTime()) &&
        !Number.isNaN(log.modified.getTime()));
}
function logToSessionMeta(log) {
    var stats = extractToolStats(log);
    var sessionId = (0, sessionStorage_js_1.getSessionIdFromLog)(log) || 'unknown';
    var startTime = log.created.toISOString();
    var durationMinutes = Math.round((log.modified.getTime() - log.created.getTime()) / 1000 / 60);
    var userMessageCount = 0;
    var assistantMessageCount = 0;
    for (var _i = 0, _a = log.messages; _i < _a.length; _i++) {
        var msg = _a[_i];
        if (msg.type === 'assistant')
            assistantMessageCount++;
        // Only count user messages that have actual text content (human messages)
        // not just tool_result messages (matching Python reference)
        if (msg.type === 'user' && msg.message) {
            var content = msg.message.content;
            var isHumanMessage = false;
            if (typeof content === 'string' && content.trim()) {
                isHumanMessage = true;
            }
            else if (Array.isArray(content)) {
                for (var _b = 0, content_5 = content; _b < content_5.length; _b++) {
                    var block = content_5[_b];
                    if (block.type === 'text' && 'text' in block) {
                        isHumanMessage = true;
                        break;
                    }
                }
            }
            if (isHumanMessage) {
                userMessageCount++;
            }
        }
    }
    return {
        session_id: sessionId,
        project_path: log.projectPath || '',
        start_time: startTime,
        duration_minutes: durationMinutes,
        user_message_count: userMessageCount,
        assistant_message_count: assistantMessageCount,
        tool_counts: stats.toolCounts,
        languages: stats.languages,
        git_commits: stats.gitCommits,
        git_pushes: stats.gitPushes,
        input_tokens: stats.inputTokens,
        output_tokens: stats.outputTokens,
        first_prompt: log.firstPrompt || '',
        summary: log.summary,
        // New stats
        user_interruptions: stats.userInterruptions,
        user_response_times: stats.userResponseTimes,
        tool_errors: stats.toolErrors,
        tool_error_categories: stats.toolErrorCategories,
        uses_task_agent: stats.usesTaskAgent,
        uses_mcp: stats.usesMcp,
        uses_web_search: stats.usesWebSearch,
        uses_web_fetch: stats.usesWebFetch,
        // Additional stats
        lines_added: stats.linesAdded,
        lines_removed: stats.linesRemoved,
        files_modified: stats.filesModified.size,
        message_hours: stats.messageHours,
        user_message_timestamps: stats.userMessageTimestamps,
    };
}
/**
 * Deduplicate conversation branches within the same session.
 *
 * When a session file has multiple leaf messages (from retries or branching),
 * loadAllLogsFromSessionFile produces one LogOption per leaf. Each branch
 * shares the same root message, so its duration overlaps with sibling
 * branches. This keeps only the branch with the most user messages
 * (tie-break by longest duration) per session_id.
 */
function deduplicateSessionBranches(entries) {
    var bestBySession = new Map();
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        var id = entry.meta.session_id;
        var existing = bestBySession.get(id);
        if (!existing ||
            entry.meta.user_message_count > existing.meta.user_message_count ||
            (entry.meta.user_message_count === existing.meta.user_message_count &&
                entry.meta.duration_minutes > existing.meta.duration_minutes)) {
            bestBySession.set(id, entry);
        }
    }
    return __spreadArray([], bestBySession.values(), true);
}
function formatTranscriptForFacets(log) {
    var lines = [];
    var meta = logToSessionMeta(log);
    lines.push("Session: ".concat(meta.session_id.slice(0, 8)));
    lines.push("Date: ".concat(meta.start_time));
    lines.push("Project: ".concat(meta.project_path));
    lines.push("Duration: ".concat(meta.duration_minutes, " min"));
    lines.push('');
    for (var _i = 0, _a = log.messages; _i < _a.length; _i++) {
        var msg = _a[_i];
        if (msg.type === 'user' && msg.message) {
            var content = msg.message.content;
            if (typeof content === 'string') {
                lines.push("[User]: ".concat(content.slice(0, 500)));
            }
            else if (Array.isArray(content)) {
                for (var _b = 0, content_6 = content; _b < content_6.length; _b++) {
                    var block = content_6[_b];
                    if (block.type === 'text' && 'text' in block) {
                        lines.push("[User]: ".concat(block.text.slice(0, 500)));
                    }
                }
            }
        }
        else if (msg.type === 'assistant' && msg.message) {
            var content = msg.message.content;
            if (Array.isArray(content)) {
                for (var _c = 0, content_7 = content; _c < content_7.length; _c++) {
                    var block = content_7[_c];
                    if (block.type === 'text' && 'text' in block) {
                        lines.push("[Assistant]: ".concat(block.text.slice(0, 300)));
                    }
                    else if (block.type === 'tool_use' && 'name' in block) {
                        lines.push("[Tool: ".concat(block.name, "]"));
                    }
                }
            }
        }
    }
    return lines.join('\n');
}
var SUMMARIZE_CHUNK_PROMPT = "Summarize this portion of a Claude Code session transcript. Focus on:\n1. What the user asked for\n2. What Claude did (tools used, files modified)\n3. Any friction or issues\n4. The outcome\n\nKeep it concise - 3-5 sentences. Preserve specific details like file names, error messages, and user feedback.\n\nTRANSCRIPT CHUNK:\n";
function summarizeTranscriptChunk(chunk) {
    return __awaiter(this, void 0, void 0, function () {
        var result, text, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, claude_js_1.queryWithModel)({
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([]),
                            userPrompt: SUMMARIZE_CHUNK_PROMPT + chunk,
                            signal: new AbortController().signal,
                            options: {
                                model: getAnalysisModel(),
                                querySource: 'insights',
                                agents: [],
                                isNonInteractiveSession: true,
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                                maxOutputTokensOverride: 500,
                            },
                        })];
                case 1:
                    result = _b.sent();
                    text = (0, messages_js_1.extractTextContent)(result.message.content);
                    return [2 /*return*/, text || chunk.slice(0, 2000)];
                case 2:
                    _a = _b.sent();
                    // On error, just return truncated chunk
                    return [2 /*return*/, chunk.slice(0, 2000)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function formatTranscriptWithSummarization(log) {
    return __awaiter(this, void 0, void 0, function () {
        var fullTranscript, CHUNK_SIZE, chunks, i, summaries, meta, header;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fullTranscript = formatTranscriptForFacets(log);
                    // If under 30k chars, use as-is
                    if (fullTranscript.length <= 30000) {
                        return [2 /*return*/, fullTranscript];
                    }
                    CHUNK_SIZE = 25000;
                    chunks = [];
                    for (i = 0; i < fullTranscript.length; i += CHUNK_SIZE) {
                        chunks.push(fullTranscript.slice(i, i + CHUNK_SIZE));
                    }
                    return [4 /*yield*/, Promise.all(chunks.map(summarizeTranscriptChunk))
                        // Combine summaries with session header
                    ];
                case 1:
                    summaries = _a.sent();
                    meta = logToSessionMeta(log);
                    header = [
                        "Session: ".concat(meta.session_id.slice(0, 8)),
                        "Date: ".concat(meta.start_time),
                        "Project: ".concat(meta.project_path),
                        "Duration: ".concat(meta.duration_minutes, " min"),
                        "[Long session - ".concat(chunks.length, " parts summarized]"),
                        '',
                    ].join('\n');
                    return [2 /*return*/, header + summaries.join('\n\n---\n\n')];
            }
        });
    });
}
function loadCachedFacets(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var facetPath, content, parsed, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    facetPath = (0, path_1.join)(getFacetsDir(), "".concat(sessionId, ".json"));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.readFile)(facetPath, { encoding: 'utf-8' })];
                case 2:
                    content = _c.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    if (!!isValidSessionFacets(parsed)) return [3 /*break*/, 7];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.unlink)(facetPath)];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, null];
                case 7: return [2 /*return*/, parsed];
                case 8:
                    _b = _c.sent();
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function saveFacets(facets) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, facetPath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(getFacetsDir(), { recursive: true })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3:
                    facetPath = (0, path_1.join)(getFacetsDir(), "".concat(facets.session_id, ".json"));
                    return [4 /*yield*/, (0, promises_1.writeFile)(facetPath, (0, slowOperations_js_1.jsonStringify)(facets, null, 2), {
                            encoding: 'utf-8',
                            mode: 384,
                        })];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function loadCachedSessionMeta(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var metaPath, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    metaPath = (0, path_1.join)(getSessionMetaDir(), "".concat(sessionId, ".json"));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(metaPath, { encoding: 'utf-8' })];
                case 2:
                    content = _b.sent();
                    return [2 /*return*/, (0, slowOperations_js_1.jsonParse)(content)];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function saveSessionMeta(meta) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, metaPath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(getSessionMetaDir(), { recursive: true })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3:
                    metaPath = (0, path_1.join)(getSessionMetaDir(), "".concat(meta.session_id, ".json"));
                    return [4 /*yield*/, (0, promises_1.writeFile)(metaPath, (0, slowOperations_js_1.jsonStringify)(meta, null, 2), {
                            encoding: 'utf-8',
                            mode: 384,
                        })];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function extractFacetsFromAPI(log, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var transcript, jsonPrompt, result, text, jsonMatch, parsed, facets, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, formatTranscriptWithSummarization(log)
                        // Build prompt asking for JSON directly (no tool use)
                    ];
                case 1:
                    transcript = _a.sent();
                    jsonPrompt = "".concat(FACET_EXTRACTION_PROMPT).concat(transcript, "\n\nRESPOND WITH ONLY A VALID JSON OBJECT matching this schema:\n{\n  \"underlying_goal\": \"What the user fundamentally wanted to achieve\",\n  \"goal_categories\": {\"category_name\": count, ...},\n  \"outcome\": \"fully_achieved|mostly_achieved|partially_achieved|not_achieved|unclear_from_transcript\",\n  \"user_satisfaction_counts\": {\"level\": count, ...},\n  \"claude_helpfulness\": \"unhelpful|slightly_helpful|moderately_helpful|very_helpful|essential\",\n  \"session_type\": \"single_task|multi_task|iterative_refinement|exploration|quick_question\",\n  \"friction_counts\": {\"friction_type\": count, ...},\n  \"friction_detail\": \"One sentence describing friction or empty\",\n  \"primary_success\": \"none|fast_accurate_search|correct_code_edits|good_explanations|proactive_help|multi_file_changes|good_debugging\",\n  \"brief_summary\": \"One sentence: what user wanted and whether they got it\"\n}");
                    return [4 /*yield*/, (0, claude_js_1.queryWithModel)({
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([]),
                            userPrompt: jsonPrompt,
                            signal: new AbortController().signal,
                            options: {
                                model: getAnalysisModel(),
                                querySource: 'insights',
                                agents: [],
                                isNonInteractiveSession: true,
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                                maxOutputTokensOverride: 4096,
                            },
                        })];
                case 2:
                    result = _a.sent();
                    text = (0, messages_js_1.extractTextContent)(result.message.content);
                    jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (!jsonMatch)
                        return [2 /*return*/, null];
                    parsed = (0, slowOperations_js_1.jsonParse)(jsonMatch[0]);
                    if (!isValidSessionFacets(parsed))
                        return [2 /*return*/, null];
                    facets = __assign(__assign({}, parsed), { session_id: sessionId });
                    return [2 /*return*/, facets];
                case 3:
                    err_1 = _a.sent();
                    (0, log_js_1.logError)(new Error("Facet extraction failed: ".concat((0, errors_js_1.toError)(err_1).message)));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Detects multi-clauding (using multiple Claude sessions concurrently).
 * Uses a sliding window to find the pattern: session1 -> session2 -> session1
 * within a 30-minute window.
 */
function detectMultiClauding(sessions) {
    var OVERLAP_WINDOW_MS = 30 * 60000;
    var allSessionMessages = [];
    for (var _i = 0, sessions_1 = sessions; _i < sessions_1.length; _i++) {
        var session = sessions_1[_i];
        for (var _a = 0, _b = session.user_message_timestamps; _a < _b.length; _a++) {
            var timestamp = _b[_a];
            try {
                var ts = new Date(timestamp).getTime();
                allSessionMessages.push({ ts: ts, sessionId: session.session_id });
            }
            catch (_c) {
                // Skip invalid timestamps
            }
        }
    }
    allSessionMessages.sort(function (a, b) { return a.ts - b.ts; });
    var multiClaudeSessionPairs = new Set();
    var messagesDuringMulticlaude = new Set();
    // Sliding window: sessionLastIndex tracks the most recent index for each session
    var windowStart = 0;
    var sessionLastIndex = new Map();
    for (var i = 0; i < allSessionMessages.length; i++) {
        var msg = allSessionMessages[i];
        // Shrink window from the left
        while (windowStart < i &&
            msg.ts - allSessionMessages[windowStart].ts > OVERLAP_WINDOW_MS) {
            var expiring = allSessionMessages[windowStart];
            if (sessionLastIndex.get(expiring.sessionId) === windowStart) {
                sessionLastIndex.delete(expiring.sessionId);
            }
            windowStart++;
        }
        // Check if this session appeared earlier in the window (pattern: s1 -> s2 -> s1)
        var prevIndex = sessionLastIndex.get(msg.sessionId);
        if (prevIndex !== undefined) {
            for (var j = prevIndex + 1; j < i; j++) {
                var between = allSessionMessages[j];
                if (between.sessionId !== msg.sessionId) {
                    var pair = [msg.sessionId, between.sessionId].sort().join(':');
                    multiClaudeSessionPairs.add(pair);
                    messagesDuringMulticlaude.add("".concat(allSessionMessages[prevIndex].ts, ":").concat(msg.sessionId));
                    messagesDuringMulticlaude.add("".concat(between.ts, ":").concat(between.sessionId));
                    messagesDuringMulticlaude.add("".concat(msg.ts, ":").concat(msg.sessionId));
                    break;
                }
            }
        }
        sessionLastIndex.set(msg.sessionId, i);
    }
    var sessionsWithOverlaps = new Set();
    for (var _d = 0, multiClaudeSessionPairs_1 = multiClaudeSessionPairs; _d < multiClaudeSessionPairs_1.length; _d++) {
        var pair = multiClaudeSessionPairs_1[_d];
        var _e = pair.split(':'), s1 = _e[0], s2 = _e[1];
        if (s1)
            sessionsWithOverlaps.add(s1);
        if (s2)
            sessionsWithOverlaps.add(s2);
    }
    return {
        overlap_events: multiClaudeSessionPairs.size,
        sessions_involved: sessionsWithOverlaps.size,
        user_messages_during: messagesDuringMulticlaude.size,
    };
}
function aggregateData(sessions, facets) {
    var _a, _b;
    var result = {
        total_sessions: sessions.length,
        sessions_with_facets: facets.size,
        date_range: { start: '', end: '' },
        total_messages: 0,
        total_duration_hours: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        tool_counts: {},
        languages: {},
        git_commits: 0,
        git_pushes: 0,
        projects: {},
        goal_categories: {},
        outcomes: {},
        satisfaction: {},
        helpfulness: {},
        session_types: {},
        friction: {},
        success: {},
        session_summaries: [],
        // New stats
        total_interruptions: 0,
        total_tool_errors: 0,
        tool_error_categories: {},
        user_response_times: [],
        median_response_time: 0,
        avg_response_time: 0,
        sessions_using_task_agent: 0,
        sessions_using_mcp: 0,
        sessions_using_web_search: 0,
        sessions_using_web_fetch: 0,
        // Additional stats
        total_lines_added: 0,
        total_lines_removed: 0,
        total_files_modified: 0,
        days_active: 0,
        messages_per_day: 0,
        message_hours: [],
        // Multi-clauding stats (matching Python reference)
        multi_clauding: {
            overlap_events: 0,
            sessions_involved: 0,
            user_messages_during: 0,
        },
    };
    var dates = [];
    var allResponseTimes = [];
    var allMessageHours = [];
    for (var _i = 0, sessions_2 = sessions; _i < sessions_2.length; _i++) {
        var session = sessions_2[_i];
        dates.push(session.start_time);
        result.total_messages += session.user_message_count;
        result.total_duration_hours += session.duration_minutes / 60;
        result.total_input_tokens += session.input_tokens;
        result.total_output_tokens += session.output_tokens;
        result.git_commits += session.git_commits;
        result.git_pushes += session.git_pushes;
        // New stats aggregation
        result.total_interruptions += session.user_interruptions;
        result.total_tool_errors += session.tool_errors;
        for (var _c = 0, _d = Object.entries(session.tool_error_categories); _c < _d.length; _c++) {
            var _e = _d[_c], cat = _e[0], count = _e[1];
            result.tool_error_categories[cat] =
                (result.tool_error_categories[cat] || 0) + count;
        }
        allResponseTimes.push.apply(allResponseTimes, session.user_response_times);
        if (session.uses_task_agent)
            result.sessions_using_task_agent++;
        if (session.uses_mcp)
            result.sessions_using_mcp++;
        if (session.uses_web_search)
            result.sessions_using_web_search++;
        if (session.uses_web_fetch)
            result.sessions_using_web_fetch++;
        // Additional stats aggregation
        result.total_lines_added += session.lines_added;
        result.total_lines_removed += session.lines_removed;
        result.total_files_modified += session.files_modified;
        allMessageHours.push.apply(allMessageHours, session.message_hours);
        for (var _f = 0, _g = Object.entries(session.tool_counts); _f < _g.length; _f++) {
            var _h = _g[_f], tool = _h[0], count = _h[1];
            result.tool_counts[tool] = (result.tool_counts[tool] || 0) + count;
        }
        for (var _j = 0, _k = Object.entries(session.languages); _j < _k.length; _j++) {
            var _l = _k[_j], lang = _l[0], count = _l[1];
            result.languages[lang] = (result.languages[lang] || 0) + count;
        }
        if (session.project_path) {
            result.projects[session.project_path] =
                (result.projects[session.project_path] || 0) + 1;
        }
        var sessionFacets = facets.get(session.session_id);
        if (sessionFacets) {
            // Goal categories
            for (var _m = 0, _o = safeEntries(sessionFacets.goal_categories); _m < _o.length; _m++) {
                var _p = _o[_m], cat = _p[0], count = _p[1];
                if (count > 0) {
                    result.goal_categories[cat] =
                        (result.goal_categories[cat] || 0) + count;
                }
            }
            // Outcomes
            result.outcomes[sessionFacets.outcome] =
                (result.outcomes[sessionFacets.outcome] || 0) + 1;
            // Satisfaction counts
            for (var _q = 0, _r = safeEntries(sessionFacets.user_satisfaction_counts); _q < _r.length; _q++) {
                var _s = _r[_q], level = _s[0], count = _s[1];
                if (count > 0) {
                    result.satisfaction[level] = (result.satisfaction[level] || 0) + count;
                }
            }
            // Helpfulness
            result.helpfulness[sessionFacets.claude_helpfulness] =
                (result.helpfulness[sessionFacets.claude_helpfulness] || 0) + 1;
            // Session types
            result.session_types[sessionFacets.session_type] =
                (result.session_types[sessionFacets.session_type] || 0) + 1;
            // Friction counts
            for (var _t = 0, _u = safeEntries(sessionFacets.friction_counts); _t < _u.length; _t++) {
                var _v = _u[_t], type = _v[0], count = _v[1];
                if (count > 0) {
                    result.friction[type] = (result.friction[type] || 0) + count;
                }
            }
            // Success factors
            if (sessionFacets.primary_success !== 'none') {
                result.success[sessionFacets.primary_success] =
                    (result.success[sessionFacets.primary_success] || 0) + 1;
            }
        }
        if (result.session_summaries.length < 50) {
            result.session_summaries.push({
                id: session.session_id.slice(0, 8),
                date: session.start_time.split('T')[0] || '',
                summary: session.summary || session.first_prompt.slice(0, 100),
                goal: sessionFacets === null || sessionFacets === void 0 ? void 0 : sessionFacets.underlying_goal,
            });
        }
    }
    dates.sort();
    result.date_range.start = ((_a = dates[0]) === null || _a === void 0 ? void 0 : _a.split('T')[0]) || '';
    result.date_range.end = ((_b = dates[dates.length - 1]) === null || _b === void 0 ? void 0 : _b.split('T')[0]) || '';
    // Calculate response time stats
    result.user_response_times = allResponseTimes;
    if (allResponseTimes.length > 0) {
        var sorted = __spreadArray([], allResponseTimes, true).sort(function (a, b) { return a - b; });
        result.median_response_time = sorted[Math.floor(sorted.length / 2)] || 0;
        result.avg_response_time =
            allResponseTimes.reduce(function (a, b) { return a + b; }, 0) / allResponseTimes.length;
    }
    // Calculate days active and messages per day
    var uniqueDays = new Set(dates.map(function (d) { return d.split('T')[0]; }));
    result.days_active = uniqueDays.size;
    result.messages_per_day =
        result.days_active > 0
            ? Math.round((result.total_messages / result.days_active) * 10) / 10
            : 0;
    // Store message hours for time-of-day chart
    result.message_hours = allMessageHours;
    result.multi_clauding = detectMultiClauding(sessions);
    return result;
}
// Sections that run in parallel first
var INSIGHT_SECTIONS = __spreadArray(__spreadArray([
    {
        name: 'project_areas',
        prompt: "Analyze this Claude Code usage data and identify project areas.\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"areas\": [\n    {\"name\": \"Area name\", \"session_count\": N, \"description\": \"2-3 sentences about what was worked on and how Claude Code was used.\"}\n  ]\n}\n\nInclude 4-5 areas. Skip internal CC operations.",
        maxTokens: 8192,
    },
    {
        name: 'interaction_style',
        prompt: "Analyze this Claude Code usage data and describe the user's interaction style.\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"narrative\": \"2-3 paragraphs analyzing HOW the user interacts with Claude Code. Use second person 'you'. Describe patterns: iterate quickly vs detailed upfront specs? Interrupt often or let Claude run? Include specific examples. Use **bold** for key insights.\",\n  \"key_pattern\": \"One sentence summary of most distinctive interaction style\"\n}",
        maxTokens: 8192,
    },
    {
        name: 'what_works',
        prompt: "Analyze this Claude Code usage data and identify what's working well for this user. Use second person (\"you\").\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"intro\": \"1 sentence of context\",\n  \"impressive_workflows\": [\n    {\"title\": \"Short title (3-6 words)\", \"description\": \"2-3 sentences describing the impressive workflow or approach. Use 'you' not 'the user'.\"}\n  ]\n}\n\nInclude 3 impressive workflows.",
        maxTokens: 8192,
    },
    {
        name: 'friction_analysis',
        prompt: "Analyze this Claude Code usage data and identify friction points for this user. Use second person (\"you\").\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"intro\": \"1 sentence summarizing friction patterns\",\n  \"categories\": [\n    {\"category\": \"Concrete category name\", \"description\": \"1-2 sentences explaining this category and what could be done differently. Use 'you' not 'the user'.\", \"examples\": [\"Specific example with consequence\", \"Another example\"]}\n  ]\n}\n\nInclude 3 friction categories with 2 examples each.",
        maxTokens: 8192,
    },
    {
        name: 'suggestions',
        prompt: "Analyze this Claude Code usage data and suggest improvements.\n\n## CC FEATURES REFERENCE (pick from these for features_to_try):\n1. **MCP Servers**: Connect Claude to external tools, databases, and APIs via Model Context Protocol.\n   - How to use: Run `claude mcp add <server-name> -- <command>`\n   - Good for: database queries, Slack integration, GitHub issue lookup, connecting to internal APIs\n\n2. **Custom Skills**: Reusable prompts you define as markdown files that run with a single /command.\n   - How to use: Create `.claude/skills/commit/SKILL.md` with instructions. Then type `/commit` to run it.\n   - Good for: repetitive workflows - /commit, /review, /test, /deploy, /pr, or complex multi-step workflows\n\n3. **Hooks**: Shell commands that auto-run at specific lifecycle events.\n   - How to use: Add to `.claude/settings.json` under \"hooks\" key.\n   - Good for: auto-formatting code, running type checks, enforcing conventions\n\n4. **Headless Mode**: Run Claude non-interactively from scripts and CI/CD.\n   - How to use: `claude -p \"fix lint errors\" --allowedTools \"Edit,Read,Bash\"`\n   - Good for: CI/CD integration, batch code fixes, automated reviews\n\n5. **Task Agents**: Claude spawns focused sub-agents for complex exploration or parallel work.\n   - How to use: Claude auto-invokes when helpful, or ask \"use an agent to explore X\"\n   - Good for: codebase exploration, understanding complex systems\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"claude_md_additions\": [\n    {\"addition\": \"A specific line or block to add to CLAUDE.md based on workflow patterns. E.g., 'Always run tests after modifying auth-related files'\", \"why\": \"1 sentence explaining why this would help based on actual sessions\", \"prompt_scaffold\": \"Instructions for where to add this in CLAUDE.md. E.g., 'Add under ## Testing section'\"}\n  ],\n  \"features_to_try\": [\n    {\"feature\": \"Feature name from CC FEATURES REFERENCE above\", \"one_liner\": \"What it does\", \"why_for_you\": \"Why this would help YOU based on your sessions\", \"example_code\": \"Actual command or config to copy\"}\n  ],\n  \"usage_patterns\": [\n    {\"title\": \"Short title\", \"suggestion\": \"1-2 sentence summary\", \"detail\": \"3-4 sentences explaining how this applies to YOUR work\", \"copyable_prompt\": \"A specific prompt to copy and try\"}\n  ]\n}\n\nIMPORTANT for claude_md_additions: PRIORITIZE instructions that appear MULTIPLE TIMES in the user data. If user told Claude the same thing in 2+ sessions (e.g., 'always run tests', 'use TypeScript'), that's a PRIME candidate - they shouldn't have to repeat themselves.\n\nIMPORTANT for features_to_try: Pick 2-3 from the CC FEATURES REFERENCE above. Include 2-3 items for each category.",
        maxTokens: 8192,
    },
    {
        name: 'on_the_horizon',
        prompt: "Analyze this Claude Code usage data and identify future opportunities.\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"intro\": \"1 sentence about evolving AI-assisted development\",\n  \"opportunities\": [\n    {\"title\": \"Short title (4-8 words)\", \"whats_possible\": \"2-3 ambitious sentences about autonomous workflows\", \"how_to_try\": \"1-2 sentences mentioning relevant tooling\", \"copyable_prompt\": \"Detailed prompt to try\"}\n  ]\n}\n\nInclude 3 opportunities. Think BIG - autonomous workflows, parallel agents, iterating against tests.",
        maxTokens: 8192,
    }
], (process.env.USER_TYPE === 'ant'
    ? [
        {
            name: 'cc_team_improvements',
            prompt: "Analyze this Claude Code usage data and suggest product improvements for the CC team.\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"improvements\": [\n    {\"title\": \"Product/tooling improvement\", \"detail\": \"3-4 sentences describing the improvement\", \"evidence\": \"3-4 sentences with specific session examples\"}\n  ]\n}\n\nInclude 2-3 improvements based on friction patterns observed.",
            maxTokens: 8192,
        },
        {
            name: 'model_behavior_improvements',
            prompt: "Analyze this Claude Code usage data and suggest model behavior improvements.\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"improvements\": [\n    {\"title\": \"Model behavior change\", \"detail\": \"3-4 sentences describing what the model should do differently\", \"evidence\": \"3-4 sentences with specific examples\"}\n  ]\n}\n\nInclude 2-3 improvements based on friction patterns observed.",
            maxTokens: 8192,
        },
    ]
    : []), true), [
    {
        name: 'fun_ending',
        prompt: "Analyze this Claude Code usage data and find a memorable moment.\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"headline\": \"A memorable QUALITATIVE moment from the transcripts - not a statistic. Something human, funny, or surprising.\",\n  \"detail\": \"Brief context about when/where this happened\"\n}\n\nFind something genuinely interesting or amusing from the session summaries.",
        maxTokens: 8192,
    },
], false);
function generateSectionInsight(section, dataContext) {
    return __awaiter(this, void 0, void 0, function () {
        var result, text, jsonMatch, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, claude_js_1.queryWithModel)({
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([]),
                            userPrompt: section.prompt + '\n\nDATA:\n' + dataContext,
                            signal: new AbortController().signal,
                            options: {
                                model: getInsightsModel(),
                                querySource: 'insights',
                                agents: [],
                                isNonInteractiveSession: true,
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                                maxOutputTokensOverride: section.maxTokens,
                            },
                        })];
                case 1:
                    result = _a.sent();
                    text = (0, messages_js_1.extractTextContent)(result.message.content);
                    if (text) {
                        jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try {
                                return [2 /*return*/, { name: section.name, result: (0, slowOperations_js_1.jsonParse)(jsonMatch[0]) }];
                            }
                            catch (_b) {
                                return [2 /*return*/, { name: section.name, result: null }];
                            }
                        }
                    }
                    return [2 /*return*/, { name: section.name, result: null }];
                case 2:
                    err_2 = _a.sent();
                    (0, log_js_1.logError)(new Error("".concat(section.name, " failed: ").concat((0, errors_js_1.toError)(err_2).message)));
                    return [2 /*return*/, { name: section.name, result: null }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function generateParallelInsights(data, facets) {
    return __awaiter(this, void 0, void 0, function () {
        var facetSummaries, frictionDetails, userInstructions, dataContext, fullContext, results, insights, _i, results_1, _a, name_1, result, projectAreasText, bigWinsText, frictionText, featuresText, patternsText, horizonText, atAGlancePrompt, atAGlanceSection, atAGlanceResult;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    facetSummaries = Array.from(facets.values())
                        .slice(0, 50)
                        .map(function (f) { return "- ".concat(f.brief_summary, " (").concat(f.outcome, ", ").concat(f.claude_helpfulness, ")"); })
                        .join('\n');
                    frictionDetails = Array.from(facets.values())
                        .filter(function (f) { return f.friction_detail; })
                        .slice(0, 20)
                        .map(function (f) { return "- ".concat(f.friction_detail); })
                        .join('\n');
                    userInstructions = Array.from(facets.values())
                        .flatMap(function (f) { return f.user_instructions_to_claude || []; })
                        .slice(0, 15)
                        .map(function (i) { return "- ".concat(i); })
                        .join('\n');
                    dataContext = (0, slowOperations_js_1.jsonStringify)({
                        sessions: data.total_sessions,
                        analyzed: data.sessions_with_facets,
                        date_range: data.date_range,
                        messages: data.total_messages,
                        hours: Math.round(data.total_duration_hours),
                        commits: data.git_commits,
                        top_tools: Object.entries(data.tool_counts)
                            .sort(function (a, b) { return b[1] - a[1]; })
                            .slice(0, 8),
                        top_goals: Object.entries(data.goal_categories)
                            .sort(function (a, b) { return b[1] - a[1]; })
                            .slice(0, 8),
                        outcomes: data.outcomes,
                        satisfaction: data.satisfaction,
                        friction: data.friction,
                        success: data.success,
                        languages: data.languages,
                    }, null, 2);
                    fullContext = dataContext +
                        '\n\nSESSION SUMMARIES:\n' +
                        facetSummaries +
                        '\n\nFRICTION DETAILS:\n' +
                        frictionDetails +
                        '\n\nUSER INSTRUCTIONS TO CLAUDE:\n' +
                        (userInstructions || 'None captured');
                    return [4 /*yield*/, Promise.all(INSIGHT_SECTIONS.map(function (section) {
                            return generateSectionInsight(section, fullContext);
                        }))
                        // Combine results
                    ];
                case 1:
                    results = _p.sent();
                    insights = {};
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        _a = results_1[_i], name_1 = _a.name, result = _a.result;
                        if (result) {
                            ;
                            insights[name_1] = result;
                        }
                    }
                    projectAreasText = ((_c = (_b = insights.project_areas) === null || _b === void 0 ? void 0 : _b.areas) === null || _c === void 0 ? void 0 : _c.map(function (a) { return "- ".concat(a.name, ": ").concat(a.description); }).join('\n')) || '';
                    bigWinsText = ((_e = (_d = insights.what_works) === null || _d === void 0 ? void 0 : _d.impressive_workflows) === null || _e === void 0 ? void 0 : _e.map(function (w) { return "- ".concat(w.title, ": ").concat(w.description); }).join('\n')) || '';
                    frictionText = ((_g = (_f = insights.friction_analysis) === null || _f === void 0 ? void 0 : _f.categories) === null || _g === void 0 ? void 0 : _g.map(function (c) { return "- ".concat(c.category, ": ").concat(c.description); }).join('\n')) || '';
                    featuresText = ((_j = (_h = insights.suggestions) === null || _h === void 0 ? void 0 : _h.features_to_try) === null || _j === void 0 ? void 0 : _j.map(function (f) { return "- ".concat(f.feature, ": ").concat(f.one_liner); }).join('\n')) || '';
                    patternsText = ((_l = (_k = insights.suggestions) === null || _k === void 0 ? void 0 : _k.usage_patterns) === null || _l === void 0 ? void 0 : _l.map(function (p) { return "- ".concat(p.title, ": ").concat(p.suggestion); }).join('\n')) || '';
                    horizonText = ((_o = (_m = insights.on_the_horizon) === null || _m === void 0 ? void 0 : _m.opportunities) === null || _o === void 0 ? void 0 : _o.map(function (o) { return "- ".concat(o.title, ": ").concat(o.whats_possible); }).join('\n')) || '';
                    atAGlancePrompt = "You're writing an \"At a Glance\" summary for a Claude Code usage insights report for Claude Code users. The goal is to help them understand their usage and improve how they can use Claude better, especially as models improve.\n\nUse this 4-part structure:\n\n1. **What's working** - What is the user's unique style of interacting with Claude and what are some impactful things they've done? You can include one or two details, but keep it high level since things might not be fresh in the user's memory. Don't be fluffy or overly complimentary. Also, don't focus on the tool calls they use.\n\n2. **What's hindering you** - Split into (a) Claude's fault (misunderstandings, wrong approaches, bugs) and (b) user-side friction (not providing enough context, environment issues -- ideally more general than just one project). Be honest but constructive.\n\n3. **Quick wins to try** - Specific Claude Code features they could try from the examples below, or a workflow technique if you think it's really compelling. (Avoid stuff like \"Ask Claude to confirm before taking actions\" or \"Type out more context up front\" which are less compelling.)\n\n4. **Ambitious workflows for better models** - As we move to much more capable models over the next 3-6 months, what should they prepare for? What workflows that seem impossible now will become possible? Draw from the appropriate section below.\n\nKeep each section to 2-3 not-too-long sentences. Don't overwhelm the user. Don't mention specific numerical stats or underlined_categories from the session data below. Use a coaching tone.\n\nRESPOND WITH ONLY A VALID JSON OBJECT:\n{\n  \"whats_working\": \"(refer to instructions above)\",\n  \"whats_hindering\": \"(refer to instructions above)\",\n  \"quick_wins\": \"(refer to instructions above)\",\n  \"ambitious_workflows\": \"(refer to instructions above)\"\n}\n\nSESSION DATA:\n".concat(fullContext, "\n\n## Project Areas (what user works on)\n").concat(projectAreasText, "\n\n## Big Wins (impressive accomplishments)\n").concat(bigWinsText, "\n\n## Friction Categories (where things go wrong)\n").concat(frictionText, "\n\n## Features to Try\n").concat(featuresText, "\n\n## Usage Patterns to Adopt\n").concat(patternsText, "\n\n## On the Horizon (ambitious workflows for better models)\n").concat(horizonText);
                    atAGlanceSection = {
                        name: 'at_a_glance',
                        prompt: atAGlancePrompt,
                        maxTokens: 8192,
                    };
                    return [4 /*yield*/, generateSectionInsight(atAGlanceSection, '')];
                case 2:
                    atAGlanceResult = _p.sent();
                    if (atAGlanceResult.result) {
                        insights.at_a_glance = atAGlanceResult.result;
                    }
                    return [2 /*return*/, insights];
            }
        });
    });
}
// Escape HTML but render **bold** as <strong>
function escapeHtmlWithBold(text) {
    var escaped = (0, xml_js_1.escapeXmlAttr)(text);
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
// Fixed orderings for specific charts (matching Python reference)
var SATISFACTION_ORDER = [
    'frustrated',
    'dissatisfied',
    'likely_satisfied',
    'satisfied',
    'happy',
    'unsure',
];
var OUTCOME_ORDER = [
    'not_achieved',
    'partially_achieved',
    'mostly_achieved',
    'fully_achieved',
    'unclear_from_transcript',
];
function generateBarChart(data, color, maxItems, fixedOrder) {
    if (maxItems === void 0) { maxItems = 6; }
    var entries;
    if (fixedOrder) {
        // Use fixed order, only including items that exist in data
        entries = fixedOrder
            .filter(function (key) { var _a; return key in data && ((_a = data[key]) !== null && _a !== void 0 ? _a : 0) > 0; })
            .map(function (key) { var _a; return [key, (_a = data[key]) !== null && _a !== void 0 ? _a : 0]; });
    }
    else {
        // Sort by count descending
        entries = Object.entries(data)
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, maxItems);
    }
    if (entries.length === 0)
        return '<p class="empty">No data</p>';
    var maxVal = Math.max.apply(Math, entries.map(function (e) { return e[1]; }));
    return entries
        .map(function (_a) {
        var label = _a[0], count = _a[1];
        var pct = (count / maxVal) * 100;
        // Use LABEL_MAP if available, otherwise clean up underscores and title case
        var cleanLabel = LABEL_MAP[label] ||
            label.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        return "<div class=\"bar-row\">\n        <div class=\"bar-label\">".concat((0, xml_js_1.escapeXmlAttr)(cleanLabel), "</div>\n        <div class=\"bar-track\"><div class=\"bar-fill\" style=\"width:").concat(pct, "%;background:").concat(color, "\"></div></div>\n        <div class=\"bar-value\">").concat(count, "</div>\n      </div>");
    })
        .join('\n');
}
function generateResponseTimeHistogram(times) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (times.length === 0)
        return '<p class="empty">No response time data</p>';
    // Create buckets (matching Python reference)
    var buckets = {
        '2-10s': 0,
        '10-30s': 0,
        '30s-1m': 0,
        '1-2m': 0,
        '2-5m': 0,
        '5-15m': 0,
        '>15m': 0,
    };
    for (var _i = 0, times_1 = times; _i < times_1.length; _i++) {
        var t = times_1[_i];
        if (t < 10)
            buckets['2-10s'] = ((_a = buckets['2-10s']) !== null && _a !== void 0 ? _a : 0) + 1;
        else if (t < 30)
            buckets['10-30s'] = ((_b = buckets['10-30s']) !== null && _b !== void 0 ? _b : 0) + 1;
        else if (t < 60)
            buckets['30s-1m'] = ((_c = buckets['30s-1m']) !== null && _c !== void 0 ? _c : 0) + 1;
        else if (t < 120)
            buckets['1-2m'] = ((_d = buckets['1-2m']) !== null && _d !== void 0 ? _d : 0) + 1;
        else if (t < 300)
            buckets['2-5m'] = ((_e = buckets['2-5m']) !== null && _e !== void 0 ? _e : 0) + 1;
        else if (t < 900)
            buckets['5-15m'] = ((_f = buckets['5-15m']) !== null && _f !== void 0 ? _f : 0) + 1;
        else
            buckets['>15m'] = ((_g = buckets['>15m']) !== null && _g !== void 0 ? _g : 0) + 1;
    }
    var maxVal = Math.max.apply(Math, Object.values(buckets));
    if (maxVal === 0)
        return '<p class="empty">No response time data</p>';
    return Object.entries(buckets)
        .map(function (_a) {
        var label = _a[0], count = _a[1];
        var pct = (count / maxVal) * 100;
        return "<div class=\"bar-row\">\n        <div class=\"bar-label\">".concat(label, "</div>\n        <div class=\"bar-track\"><div class=\"bar-fill\" style=\"width:").concat(pct, "%;background:#6366f1\"></div></div>\n        <div class=\"bar-value\">").concat(count, "</div>\n      </div>");
    })
        .join('\n');
}
function generateTimeOfDayChart(messageHours) {
    if (messageHours.length === 0)
        return '<p class="empty">No time data</p>';
    // Group into time periods
    var periods = [
        { label: 'Morning (6-12)', range: [6, 7, 8, 9, 10, 11] },
        { label: 'Afternoon (12-18)', range: [12, 13, 14, 15, 16, 17] },
        { label: 'Evening (18-24)', range: [18, 19, 20, 21, 22, 23] },
        { label: 'Night (0-6)', range: [0, 1, 2, 3, 4, 5] },
    ];
    var hourCounts = {};
    for (var _i = 0, messageHours_1 = messageHours; _i < messageHours_1.length; _i++) {
        var h = messageHours_1[_i];
        hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    var periodCounts = periods.map(function (p) { return ({
        label: p.label,
        count: p.range.reduce(function (sum, h) { return sum + (hourCounts[h] || 0); }, 0),
    }); });
    var maxVal = Math.max.apply(Math, periodCounts.map(function (p) { return p.count; })) || 1;
    var barsHtml = periodCounts
        .map(function (p) { return "\n      <div class=\"bar-row\">\n        <div class=\"bar-label\">".concat(p.label, "</div>\n        <div class=\"bar-track\"><div class=\"bar-fill\" style=\"width:").concat((p.count / maxVal) * 100, "%;background:#8b5cf6\"></div></div>\n        <div class=\"bar-value\">").concat(p.count, "</div>\n      </div>"); })
        .join('\n');
    return "<div id=\"hour-histogram\">".concat(barsHtml, "</div>");
}
function getHourCountsJson(messageHours) {
    var hourCounts = {};
    for (var _i = 0, messageHours_2 = messageHours; _i < messageHours_2.length; _i++) {
        var h = messageHours_2[_i];
        hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    return (0, slowOperations_js_1.jsonStringify)(hourCounts);
}
function generateHtmlReport(data, insights) {
    var _a, _b, _c;
    var markdownToHtml = function (md) {
        if (!md)
            return '';
        return md
            .split('\n\n')
            .map(function (p) {
            var html = (0, xml_js_1.escapeXmlAttr)(p);
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/^- /gm, '• ');
            html = html.replace(/\n/g, '<br>');
            return "<p>".concat(html, "</p>");
        })
            .join('\n');
    };
    // Build At a Glance section (new 4-part format with links to sections)
    var atAGlance = insights.at_a_glance;
    var atAGlanceHtml = atAGlance
        ? "\n    <div class=\"at-a-glance\">\n      <div class=\"glance-title\">At a Glance</div>\n      <div class=\"glance-sections\">\n        ".concat(atAGlance.whats_working ? "<div class=\"glance-section\"><strong>What's working:</strong> ".concat(escapeHtmlWithBold(atAGlance.whats_working), " <a href=\"#section-wins\" class=\"see-more\">Impressive Things You Did \u2192</a></div>") : '', "\n        ").concat(atAGlance.whats_hindering ? "<div class=\"glance-section\"><strong>What's hindering you:</strong> ".concat(escapeHtmlWithBold(atAGlance.whats_hindering), " <a href=\"#section-friction\" class=\"see-more\">Where Things Go Wrong \u2192</a></div>") : '', "\n        ").concat(atAGlance.quick_wins ? "<div class=\"glance-section\"><strong>Quick wins to try:</strong> ".concat(escapeHtmlWithBold(atAGlance.quick_wins), " <a href=\"#section-features\" class=\"see-more\">Features to Try \u2192</a></div>") : '', "\n        ").concat(atAGlance.ambitious_workflows ? "<div class=\"glance-section\"><strong>Ambitious workflows:</strong> ".concat(escapeHtmlWithBold(atAGlance.ambitious_workflows), " <a href=\"#section-horizon\" class=\"see-more\">On the Horizon \u2192</a></div>") : '', "\n      </div>\n    </div>\n    ")
        : '';
    // Build project areas section
    var projectAreas = ((_a = insights.project_areas) === null || _a === void 0 ? void 0 : _a.areas) || [];
    var projectAreasHtml = projectAreas.length > 0
        ? "\n    <h2 id=\"section-work\">What You Work On</h2>\n    <div class=\"project-areas\">\n      ".concat(projectAreas
            .map(function (area) { return "\n        <div class=\"project-area\">\n          <div class=\"area-header\">\n            <span class=\"area-name\">".concat((0, xml_js_1.escapeXmlAttr)(area.name), "</span>\n            <span class=\"area-count\">~").concat(area.session_count, " sessions</span>\n          </div>\n          <div class=\"area-desc\">").concat((0, xml_js_1.escapeXmlAttr)(area.description), "</div>\n        </div>\n      "); })
            .join(''), "\n    </div>\n    ")
        : '';
    // Build interaction style section
    var interactionStyle = insights.interaction_style;
    var interactionHtml = (interactionStyle === null || interactionStyle === void 0 ? void 0 : interactionStyle.narrative)
        ? "\n    <h2 id=\"section-usage\">How You Use Claude Code</h2>\n    <div class=\"narrative\">\n      ".concat(markdownToHtml(interactionStyle.narrative), "\n      ").concat(interactionStyle.key_pattern ? "<div class=\"key-insight\"><strong>Key pattern:</strong> ".concat((0, xml_js_1.escapeXmlAttr)(interactionStyle.key_pattern), "</div>") : '', "\n    </div>\n    ")
        : '';
    // Build what works section
    var whatWorks = insights.what_works;
    var whatWorksHtml = (whatWorks === null || whatWorks === void 0 ? void 0 : whatWorks.impressive_workflows) && whatWorks.impressive_workflows.length > 0
        ? "\n    <h2 id=\"section-wins\">Impressive Things You Did</h2>\n    ".concat(whatWorks.intro ? "<p class=\"section-intro\">".concat((0, xml_js_1.escapeXmlAttr)(whatWorks.intro), "</p>") : '', "\n    <div class=\"big-wins\">\n      ").concat(whatWorks.impressive_workflows
            .map(function (wf) { return "\n        <div class=\"big-win\">\n          <div class=\"big-win-title\">".concat((0, xml_js_1.escapeXmlAttr)(wf.title || ''), "</div>\n          <div class=\"big-win-desc\">").concat((0, xml_js_1.escapeXmlAttr)(wf.description || ''), "</div>\n        </div>\n      "); })
            .join(''), "\n    </div>\n    ")
        : '';
    // Build friction section
    var frictionAnalysis = insights.friction_analysis;
    var frictionHtml = (frictionAnalysis === null || frictionAnalysis === void 0 ? void 0 : frictionAnalysis.categories) && frictionAnalysis.categories.length > 0
        ? "\n    <h2 id=\"section-friction\">Where Things Go Wrong</h2>\n    ".concat(frictionAnalysis.intro ? "<p class=\"section-intro\">".concat((0, xml_js_1.escapeXmlAttr)(frictionAnalysis.intro), "</p>") : '', "\n    <div class=\"friction-categories\">\n      ").concat(frictionAnalysis.categories
            .map(function (cat) { return "\n        <div class=\"friction-category\">\n          <div class=\"friction-title\">".concat((0, xml_js_1.escapeXmlAttr)(cat.category || ''), "</div>\n          <div class=\"friction-desc\">").concat((0, xml_js_1.escapeXmlAttr)(cat.description || ''), "</div>\n          ").concat(cat.examples ? "<ul class=\"friction-examples\">".concat(cat.examples.map(function (ex) { return "<li>".concat((0, xml_js_1.escapeXmlAttr)(ex), "</li>"); }).join(''), "</ul>") : '', "\n        </div>\n      "); })
            .join(''), "\n    </div>\n    ")
        : '';
    // Build suggestions section
    var suggestions = insights.suggestions;
    var suggestionsHtml = suggestions
        ? "\n    ".concat(suggestions.claude_md_additions &&
            suggestions.claude_md_additions.length > 0
            ? "\n    <h2 id=\"section-features\">Existing CC Features to Try</h2>\n    <div class=\"claude-md-section\">\n      <h3>Suggested CLAUDE.md Additions</h3>\n      <p style=\"font-size: 12px; color: #64748b; margin-bottom: 12px;\">Just copy this into Claude Code to add it to your CLAUDE.md.</p>\n      <div class=\"claude-md-actions\">\n        <button class=\"copy-all-btn\" onclick=\"copyAllCheckedClaudeMd()\">Copy All Checked</button>\n      </div>\n      ".concat(suggestions.claude_md_additions
                .map(function (add, i) { return "\n        <div class=\"claude-md-item\">\n          <input type=\"checkbox\" id=\"cmd-".concat(i, "\" class=\"cmd-checkbox\" checked data-text=\"").concat((0, xml_js_1.escapeXmlAttr)(add.prompt_scaffold || add.where || 'Add to CLAUDE.md'), "\\n\\n").concat((0, xml_js_1.escapeXmlAttr)(add.addition), "\">\n          <label for=\"cmd-").concat(i, "\">\n            <code class=\"cmd-code\">").concat((0, xml_js_1.escapeXmlAttr)(add.addition), "</code>\n            <button class=\"copy-btn\" onclick=\"copyCmdItem(").concat(i, ")\">Copy</button>\n          </label>\n          <div class=\"cmd-why\">").concat((0, xml_js_1.escapeXmlAttr)(add.why), "</div>\n        </div>\n      "); })
                .join(''), "\n    </div>\n    ")
            : '', "\n    ").concat(suggestions.features_to_try && suggestions.features_to_try.length > 0
            ? "\n    <p style=\"font-size: 13px; color: #64748b; margin-bottom: 12px;\">Just copy this into Claude Code and it'll set it up for you.</p>\n    <div class=\"features-section\">\n      ".concat(suggestions.features_to_try
                .map(function (feat) { return "\n        <div class=\"feature-card\">\n          <div class=\"feature-title\">".concat((0, xml_js_1.escapeXmlAttr)(feat.feature || ''), "</div>\n          <div class=\"feature-oneliner\">").concat((0, xml_js_1.escapeXmlAttr)(feat.one_liner || ''), "</div>\n          <div class=\"feature-why\"><strong>Why for you:</strong> ").concat((0, xml_js_1.escapeXmlAttr)(feat.why_for_you || ''), "</div>\n          ").concat(feat.example_code
                ? "\n          <div class=\"feature-examples\">\n            <div class=\"feature-example\">\n              <div class=\"example-code-row\">\n                <code class=\"example-code\">".concat((0, xml_js_1.escapeXmlAttr)(feat.example_code), "</code>\n                <button class=\"copy-btn\" onclick=\"copyText(this)\">Copy</button>\n              </div>\n            </div>\n          </div>\n          ")
                : '', "\n        </div>\n      "); })
                .join(''), "\n    </div>\n    ")
            : '', "\n    ").concat(suggestions.usage_patterns && suggestions.usage_patterns.length > 0
            ? "\n    <h2 id=\"section-patterns\">New Ways to Use Claude Code</h2>\n    <p style=\"font-size: 13px; color: #64748b; margin-bottom: 12px;\">Just copy this into Claude Code and it'll walk you through it.</p>\n    <div class=\"patterns-section\">\n      ".concat(suggestions.usage_patterns
                .map(function (pat) { return "\n        <div class=\"pattern-card\">\n          <div class=\"pattern-title\">".concat((0, xml_js_1.escapeXmlAttr)(pat.title || ''), "</div>\n          <div class=\"pattern-summary\">").concat((0, xml_js_1.escapeXmlAttr)(pat.suggestion || ''), "</div>\n          ").concat(pat.detail ? "<div class=\"pattern-detail\">".concat((0, xml_js_1.escapeXmlAttr)(pat.detail), "</div>") : '', "\n          ").concat(pat.copyable_prompt
                ? "\n          <div class=\"copyable-prompt-section\">\n            <div class=\"prompt-label\">Paste into Claude Code:</div>\n            <div class=\"copyable-prompt-row\">\n              <code class=\"copyable-prompt\">".concat((0, xml_js_1.escapeXmlAttr)(pat.copyable_prompt), "</code>\n              <button class=\"copy-btn\" onclick=\"copyText(this)\">Copy</button>\n            </div>\n          </div>\n          ")
                : '', "\n        </div>\n      "); })
                .join(''), "\n    </div>\n    ")
            : '', "\n    ")
        : '';
    // Build On the Horizon section
    var horizonData = insights.on_the_horizon;
    var horizonHtml = (horizonData === null || horizonData === void 0 ? void 0 : horizonData.opportunities) && horizonData.opportunities.length > 0
        ? "\n    <h2 id=\"section-horizon\">On the Horizon</h2>\n    ".concat(horizonData.intro ? "<p class=\"section-intro\">".concat((0, xml_js_1.escapeXmlAttr)(horizonData.intro), "</p>") : '', "\n    <div class=\"horizon-section\">\n      ").concat(horizonData.opportunities
            .map(function (opp) { return "\n        <div class=\"horizon-card\">\n          <div class=\"horizon-title\">".concat((0, xml_js_1.escapeXmlAttr)(opp.title || ''), "</div>\n          <div class=\"horizon-possible\">").concat((0, xml_js_1.escapeXmlAttr)(opp.whats_possible || ''), "</div>\n          ").concat(opp.how_to_try ? "<div class=\"horizon-tip\"><strong>Getting started:</strong> ".concat((0, xml_js_1.escapeXmlAttr)(opp.how_to_try), "</div>") : '', "\n          ").concat(opp.copyable_prompt ? "<div class=\"pattern-prompt\"><div class=\"prompt-label\">Paste into Claude Code:</div><code>".concat((0, xml_js_1.escapeXmlAttr)(opp.copyable_prompt), "</code><button class=\"copy-btn\" onclick=\"copyText(this)\">Copy</button></div>") : '', "\n        </div>\n      "); })
            .join(''), "\n    </div>\n    ")
        : '';
    // Build Team Feedback section (collapsible, ant-only)
    var ccImprovements = process.env.USER_TYPE === 'ant'
        ? ((_b = insights.cc_team_improvements) === null || _b === void 0 ? void 0 : _b.improvements) || []
        : [];
    var modelImprovements = process.env.USER_TYPE === 'ant'
        ? ((_c = insights.model_behavior_improvements) === null || _c === void 0 ? void 0 : _c.improvements) || []
        : [];
    var teamFeedbackHtml = ccImprovements.length > 0 || modelImprovements.length > 0
        ? "\n    <h2 id=\"section-feedback\" class=\"feedback-header\">Closing the Loop: Feedback for Other Teams</h2>\n    <p class=\"feedback-intro\">Suggestions for the CC product and model teams based on your usage patterns. Click to expand.</p>\n    ".concat(ccImprovements.length > 0
            ? "\n    <div class=\"collapsible-section\">\n      <div class=\"collapsible-header\" onclick=\"toggleCollapsible(this)\">\n        <span class=\"collapsible-arrow\">\u25B6</span>\n        <h3>Product Improvements for CC Team</h3>\n      </div>\n      <div class=\"collapsible-content\">\n        <div class=\"suggestions-section\">\n          ".concat(ccImprovements
                .map(function (imp) { return "\n            <div class=\"feedback-card team-card\">\n              <div class=\"feedback-title\">".concat((0, xml_js_1.escapeXmlAttr)(imp.title || ''), "</div>\n              <div class=\"feedback-detail\">").concat((0, xml_js_1.escapeXmlAttr)(imp.detail || ''), "</div>\n              ").concat(imp.evidence ? "<div class=\"feedback-evidence\"><em>Evidence:</em> ".concat((0, xml_js_1.escapeXmlAttr)(imp.evidence), "</div>") : '', "\n            </div>\n          "); })
                .join(''), "\n        </div>\n      </div>\n    </div>\n    ")
            : '', "\n    ").concat(modelImprovements.length > 0
            ? "\n    <div class=\"collapsible-section\">\n      <div class=\"collapsible-header\" onclick=\"toggleCollapsible(this)\">\n        <span class=\"collapsible-arrow\">\u25B6</span>\n        <h3>Model Behavior Improvements</h3>\n      </div>\n      <div class=\"collapsible-content\">\n        <div class=\"suggestions-section\">\n          ".concat(modelImprovements
                .map(function (imp) { return "\n            <div class=\"feedback-card model-card\">\n              <div class=\"feedback-title\">".concat((0, xml_js_1.escapeXmlAttr)(imp.title || ''), "</div>\n              <div class=\"feedback-detail\">").concat((0, xml_js_1.escapeXmlAttr)(imp.detail || ''), "</div>\n              ").concat(imp.evidence ? "<div class=\"feedback-evidence\"><em>Evidence:</em> ".concat((0, xml_js_1.escapeXmlAttr)(imp.evidence), "</div>") : '', "\n            </div>\n          "); })
                .join(''), "\n        </div>\n      </div>\n    </div>\n    ")
            : '', "\n    ")
        : '';
    // Build Fun Ending section
    var funEnding = insights.fun_ending;
    var funEndingHtml = (funEnding === null || funEnding === void 0 ? void 0 : funEnding.headline)
        ? "\n    <div class=\"fun-ending\">\n      <div class=\"fun-headline\">\"".concat((0, xml_js_1.escapeXmlAttr)(funEnding.headline), "\"</div>\n      ").concat(funEnding.detail ? "<div class=\"fun-detail\">".concat((0, xml_js_1.escapeXmlAttr)(funEnding.detail), "</div>") : '', "\n    </div>\n    ")
        : '';
    var css = "\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #334155; line-height: 1.65; padding: 48px 24px; }\n    .container { max-width: 800px; margin: 0 auto; }\n    h1 { font-size: 32px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }\n    h2 { font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 48px; margin-bottom: 16px; }\n    .subtitle { color: #64748b; font-size: 15px; margin-bottom: 32px; }\n    .nav-toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 32px 0; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }\n    .nav-toc a { font-size: 12px; color: #64748b; text-decoration: none; padding: 6px 12px; border-radius: 6px; background: #f1f5f9; transition: all 0.15s; }\n    .nav-toc a:hover { background: #e2e8f0; color: #334155; }\n    .stats-row { display: flex; gap: 24px; margin-bottom: 40px; padding: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }\n    .stat { text-align: center; }\n    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }\n    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; }\n    .at-a-glance { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }\n    .glance-title { font-size: 16px; font-weight: 700; color: #92400e; margin-bottom: 16px; }\n    .glance-sections { display: flex; flex-direction: column; gap: 12px; }\n    .glance-section { font-size: 14px; color: #78350f; line-height: 1.6; }\n    .glance-section strong { color: #92400e; }\n    .see-more { color: #b45309; text-decoration: none; font-size: 13px; white-space: nowrap; }\n    .see-more:hover { text-decoration: underline; }\n    .project-areas { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }\n    .project-area { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }\n    .area-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }\n    .area-name { font-weight: 600; font-size: 15px; color: #0f172a; }\n    .area-count { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }\n    .area-desc { font-size: 14px; color: #475569; line-height: 1.5; }\n    .narrative { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }\n    .narrative p { margin-bottom: 12px; font-size: 14px; color: #475569; line-height: 1.7; }\n    .key-insight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-top: 12px; font-size: 14px; color: #166534; }\n    .section-intro { font-size: 14px; color: #64748b; margin-bottom: 16px; }\n    .big-wins { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }\n    .big-win { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; }\n    .big-win-title { font-weight: 600; font-size: 15px; color: #166534; margin-bottom: 8px; }\n    .big-win-desc { font-size: 14px; color: #15803d; line-height: 1.5; }\n    .friction-categories { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }\n    .friction-category { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; }\n    .friction-title { font-weight: 600; font-size: 15px; color: #991b1b; margin-bottom: 6px; }\n    .friction-desc { font-size: 13px; color: #7f1d1d; margin-bottom: 10px; }\n    .friction-examples { margin: 0 0 0 20px; font-size: 13px; color: #334155; }\n    .friction-examples li { margin-bottom: 4px; }\n    .claude-md-section { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 20px; }\n    .claude-md-section h3 { font-size: 14px; font-weight: 600; color: #1e40af; margin: 0 0 12px 0; }\n    .claude-md-actions { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #dbeafe; }\n    .copy-all-btn { background: #2563eb; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 500; transition: all 0.2s; }\n    .copy-all-btn:hover { background: #1d4ed8; }\n    .copy-all-btn.copied { background: #16a34a; }\n    .claude-md-item { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; padding: 10px 0; border-bottom: 1px solid #dbeafe; }\n    .claude-md-item:last-child { border-bottom: none; }\n    .cmd-checkbox { margin-top: 2px; }\n    .cmd-code { background: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #1e40af; border: 1px solid #bfdbfe; font-family: monospace; display: block; white-space: pre-wrap; word-break: break-word; flex: 1; }\n    .cmd-why { font-size: 12px; color: #64748b; width: 100%; padding-left: 24px; margin-top: 4px; }\n    .features-section, .patterns-section { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; }\n    .feature-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; }\n    .pattern-card { background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 8px; padding: 16px; }\n    .feature-title, .pattern-title { font-weight: 600; font-size: 15px; color: #0f172a; margin-bottom: 6px; }\n    .feature-oneliner { font-size: 14px; color: #475569; margin-bottom: 8px; }\n    .pattern-summary { font-size: 14px; color: #475569; margin-bottom: 8px; }\n    .feature-why, .pattern-detail { font-size: 13px; color: #334155; line-height: 1.5; }\n    .feature-examples { margin-top: 12px; }\n    .feature-example { padding: 8px 0; border-top: 1px solid #d1fae5; }\n    .feature-example:first-child { border-top: none; }\n    .example-desc { font-size: 13px; color: #334155; margin-bottom: 6px; }\n    .example-code-row { display: flex; align-items: flex-start; gap: 8px; }\n    .example-code { flex: 1; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; overflow-x: auto; white-space: pre-wrap; }\n    .copyable-prompt-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }\n    .copyable-prompt-row { display: flex; align-items: flex-start; gap: 8px; }\n    .copyable-prompt { flex: 1; background: #f8fafc; padding: 10px 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5; }\n    .feature-code { background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border: 1px solid #e2e8f0; display: flex; align-items: flex-start; gap: 8px; }\n    .feature-code code { flex: 1; font-family: monospace; font-size: 12px; color: #334155; white-space: pre-wrap; }\n    .pattern-prompt { background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 12px; border: 1px solid #e2e8f0; }\n    .pattern-prompt code { font-family: monospace; font-size: 12px; color: #334155; display: block; white-space: pre-wrap; margin-bottom: 8px; }\n    .prompt-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }\n    .copy-btn { background: #e2e8f0; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; color: #475569; flex-shrink: 0; }\n    .copy-btn:hover { background: #cbd5e1; }\n    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }\n    .chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }\n    .chart-title { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 12px; }\n    .bar-row { display: flex; align-items: center; margin-bottom: 6px; }\n    .bar-label { width: 100px; font-size: 11px; color: #475569; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n    .bar-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; margin: 0 8px; }\n    .bar-fill { height: 100%; border-radius: 3px; }\n    .bar-value { width: 28px; font-size: 11px; font-weight: 500; color: #64748b; text-align: right; }\n    .empty { color: #94a3b8; font-size: 13px; }\n    .horizon-section { display: flex; flex-direction: column; gap: 16px; }\n    .horizon-card { background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%); border: 1px solid #c4b5fd; border-radius: 8px; padding: 16px; }\n    .horizon-title { font-weight: 600; font-size: 15px; color: #5b21b6; margin-bottom: 8px; }\n    .horizon-possible { font-size: 14px; color: #334155; margin-bottom: 10px; line-height: 1.5; }\n    .horizon-tip { font-size: 13px; color: #6b21a8; background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 4px; }\n    .feedback-header { margin-top: 48px; color: #64748b; font-size: 16px; }\n    .feedback-intro { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }\n    .feedback-section { margin-top: 16px; }\n    .feedback-section h3 { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 12px; }\n    .feedback-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }\n    .feedback-card.team-card { background: #eff6ff; border-color: #bfdbfe; }\n    .feedback-card.model-card { background: #faf5ff; border-color: #e9d5ff; }\n    .feedback-title { font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 6px; }\n    .feedback-detail { font-size: 13px; color: #475569; line-height: 1.5; }\n    .feedback-evidence { font-size: 12px; color: #64748b; margin-top: 8px; }\n    .fun-ending { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 24px; margin-top: 40px; text-align: center; }\n    .fun-headline { font-size: 18px; font-weight: 600; color: #78350f; margin-bottom: 8px; }\n    .fun-detail { font-size: 14px; color: #92400e; }\n    .collapsible-section { margin-top: 16px; }\n    .collapsible-header { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }\n    .collapsible-header h3 { margin: 0; font-size: 14px; font-weight: 600; color: #475569; }\n    .collapsible-arrow { font-size: 12px; color: #94a3b8; transition: transform 0.2s; }\n    .collapsible-content { display: none; padding-top: 16px; }\n    .collapsible-content.open { display: block; }\n    .collapsible-header.open .collapsible-arrow { transform: rotate(90deg); }\n    @media (max-width: 640px) { .charts-row { grid-template-columns: 1fr; } .stats-row { justify-content: center; } }\n  ";
    var hourCountsJson = getHourCountsJson(data.message_hours);
    var js = "\n    function toggleCollapsible(header) {\n      header.classList.toggle('open');\n      const content = header.nextElementSibling;\n      content.classList.toggle('open');\n    }\n    function copyText(btn) {\n      const code = btn.previousElementSibling;\n      navigator.clipboard.writeText(code.textContent).then(() => {\n        btn.textContent = 'Copied!';\n        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);\n      });\n    }\n    function copyCmdItem(idx) {\n      const checkbox = document.getElementById('cmd-' + idx);\n      if (checkbox) {\n        const text = checkbox.dataset.text;\n        navigator.clipboard.writeText(text).then(() => {\n          const btn = checkbox.nextElementSibling.querySelector('.copy-btn');\n          if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }\n        });\n      }\n    }\n    function copyAllCheckedClaudeMd() {\n      const checkboxes = document.querySelectorAll('.cmd-checkbox:checked');\n      const texts = [];\n      checkboxes.forEach(cb => {\n        if (cb.dataset.text) { texts.push(cb.dataset.text); }\n      });\n      const combined = texts.join('\\n');\n      const btn = document.querySelector('.copy-all-btn');\n      if (btn) {\n        navigator.clipboard.writeText(combined).then(() => {\n          btn.textContent = 'Copied ' + texts.length + ' items!';\n          btn.classList.add('copied');\n          setTimeout(() => { btn.textContent = 'Copy All Checked'; btn.classList.remove('copied'); }, 2000);\n        });\n      }\n    }\n    // Timezone selector for time of day chart (data is from our own analytics, not user input)\n    const rawHourCounts = ".concat(hourCountsJson, ";\n    function updateHourHistogram(offsetFromPT) {\n      const periods = [\n        { label: \"Morning (6-12)\", range: [6,7,8,9,10,11] },\n        { label: \"Afternoon (12-18)\", range: [12,13,14,15,16,17] },\n        { label: \"Evening (18-24)\", range: [18,19,20,21,22,23] },\n        { label: \"Night (0-6)\", range: [0,1,2,3,4,5] }\n      ];\n      const adjustedCounts = {};\n      for (const [hour, count] of Object.entries(rawHourCounts)) {\n        const newHour = (parseInt(hour) + offsetFromPT + 24) % 24;\n        adjustedCounts[newHour] = (adjustedCounts[newHour] || 0) + count;\n      }\n      const periodCounts = periods.map(p => ({\n        label: p.label,\n        count: p.range.reduce((sum, h) => sum + (adjustedCounts[h] || 0), 0)\n      }));\n      const maxCount = Math.max(...periodCounts.map(p => p.count)) || 1;\n      const container = document.getElementById('hour-histogram');\n      container.textContent = '';\n      periodCounts.forEach(p => {\n        const row = document.createElement('div');\n        row.className = 'bar-row';\n        const label = document.createElement('div');\n        label.className = 'bar-label';\n        label.textContent = p.label;\n        const track = document.createElement('div');\n        track.className = 'bar-track';\n        const fill = document.createElement('div');\n        fill.className = 'bar-fill';\n        fill.style.width = (p.count / maxCount) * 100 + '%';\n        fill.style.background = '#8b5cf6';\n        track.appendChild(fill);\n        const value = document.createElement('div');\n        value.className = 'bar-value';\n        value.textContent = p.count;\n        row.appendChild(label);\n        row.appendChild(track);\n        row.appendChild(value);\n        container.appendChild(row);\n      });\n    }\n    document.getElementById('timezone-select').addEventListener('change', function() {\n      const customInput = document.getElementById('custom-offset');\n      if (this.value === 'custom') {\n        customInput.style.display = 'inline-block';\n        customInput.focus();\n      } else {\n        customInput.style.display = 'none';\n        updateHourHistogram(parseInt(this.value));\n      }\n    });\n    document.getElementById('custom-offset').addEventListener('change', function() {\n      const offset = parseInt(this.value) + 8;\n      updateHourHistogram(offset);\n    });\n  ");
    return "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Claude Code Insights</title>\n  <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">\n  <style>".concat(css, "</style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>Claude Code Insights</h1>\n    <p class=\"subtitle\">").concat(data.total_messages.toLocaleString(), " messages across ").concat(data.total_sessions, " sessions").concat(data.total_sessions_scanned && data.total_sessions_scanned > data.total_sessions ? " (".concat(data.total_sessions_scanned.toLocaleString(), " total)") : '', " | ").concat(data.date_range.start, " to ").concat(data.date_range.end, "</p>\n\n    ").concat(atAGlanceHtml, "\n\n    <nav class=\"nav-toc\">\n      <a href=\"#section-work\">What You Work On</a>\n      <a href=\"#section-usage\">How You Use CC</a>\n      <a href=\"#section-wins\">Impressive Things</a>\n      <a href=\"#section-friction\">Where Things Go Wrong</a>\n      <a href=\"#section-features\">Features to Try</a>\n      <a href=\"#section-patterns\">New Usage Patterns</a>\n      <a href=\"#section-horizon\">On the Horizon</a>\n      <a href=\"#section-feedback\">Team Feedback</a>\n    </nav>\n\n    <div class=\"stats-row\">\n      <div class=\"stat\"><div class=\"stat-value\">").concat(data.total_messages.toLocaleString(), "</div><div class=\"stat-label\">Messages</div></div>\n      <div class=\"stat\"><div class=\"stat-value\">+").concat(data.total_lines_added.toLocaleString(), "/-").concat(data.total_lines_removed.toLocaleString(), "</div><div class=\"stat-label\">Lines</div></div>\n      <div class=\"stat\"><div class=\"stat-value\">").concat(data.total_files_modified, "</div><div class=\"stat-label\">Files</div></div>\n      <div class=\"stat\"><div class=\"stat-value\">").concat(data.days_active, "</div><div class=\"stat-label\">Days</div></div>\n      <div class=\"stat\"><div class=\"stat-value\">").concat(data.messages_per_day, "</div><div class=\"stat-label\">Msgs/Day</div></div>\n    </div>\n\n    ").concat(projectAreasHtml, "\n\n    <div class=\"charts-row\">\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">What You Wanted</div>\n        ").concat(generateBarChart(data.goal_categories, '#2563eb'), "\n      </div>\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">Top Tools Used</div>\n        ").concat(generateBarChart(data.tool_counts, '#0891b2'), "\n      </div>\n    </div>\n\n    <div class=\"charts-row\">\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">Languages</div>\n        ").concat(generateBarChart(data.languages, '#10b981'), "\n      </div>\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">Session Types</div>\n        ").concat(generateBarChart(data.session_types || {}, '#8b5cf6'), "\n      </div>\n    </div>\n\n    ").concat(interactionHtml, "\n\n    <!-- Response Time Distribution -->\n    <div class=\"chart-card\" style=\"margin: 24px 0;\">\n      <div class=\"chart-title\">User Response Time Distribution</div>\n      ").concat(generateResponseTimeHistogram(data.user_response_times), "\n      <div style=\"font-size: 12px; color: #64748b; margin-top: 8px;\">\n        Median: ").concat(data.median_response_time.toFixed(1), "s &bull; Average: ").concat(data.avg_response_time.toFixed(1), "s\n      </div>\n    </div>\n\n    <!-- Multi-clauding Section (matching Python reference) -->\n    <div class=\"chart-card\" style=\"margin: 24px 0;\">\n      <div class=\"chart-title\">Multi-Clauding (Parallel Sessions)</div>\n      ").concat(data.multi_clauding.overlap_events === 0
        ? "\n        <p style=\"font-size: 14px; color: #64748b; padding: 8px 0;\">\n          No parallel session usage detected. You typically work with one Claude Code session at a time.\n        </p>\n      "
        : "\n        <div style=\"display: flex; gap: 24px; margin: 12px 0;\">\n          <div style=\"text-align: center;\">\n            <div style=\"font-size: 24px; font-weight: 700; color: #7c3aed;\">".concat(data.multi_clauding.overlap_events, "</div>\n            <div style=\"font-size: 11px; color: #64748b; text-transform: uppercase;\">Overlap Events</div>\n          </div>\n          <div style=\"text-align: center;\">\n            <div style=\"font-size: 24px; font-weight: 700; color: #7c3aed;\">").concat(data.multi_clauding.sessions_involved, "</div>\n            <div style=\"font-size: 11px; color: #64748b; text-transform: uppercase;\">Sessions Involved</div>\n          </div>\n          <div style=\"text-align: center;\">\n            <div style=\"font-size: 24px; font-weight: 700; color: #7c3aed;\">").concat(data.total_messages > 0 ? Math.round((100 * data.multi_clauding.user_messages_during) / data.total_messages) : 0, "%</div>\n            <div style=\"font-size: 11px; color: #64748b; text-transform: uppercase;\">Of Messages</div>\n          </div>\n        </div>\n        <p style=\"font-size: 13px; color: #475569; margin-top: 12px;\">\n          You run multiple Claude Code sessions simultaneously. Multi-clauding is detected when sessions\n          overlap in time, suggesting parallel workflows.\n        </p>\n      "), "\n    </div>\n\n    <!-- Time of Day & Tool Errors -->\n    <div class=\"charts-row\">\n      <div class=\"chart-card\">\n        <div class=\"chart-title\" style=\"display: flex; align-items: center; gap: 12px;\">\n          User Messages by Time of Day\n          <select id=\"timezone-select\" style=\"font-size: 12px; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0;\">\n            <option value=\"0\">PT (UTC-8)</option>\n            <option value=\"3\">ET (UTC-5)</option>\n            <option value=\"8\">London (UTC)</option>\n            <option value=\"9\">CET (UTC+1)</option>\n            <option value=\"17\">Tokyo (UTC+9)</option>\n            <option value=\"custom\">Custom offset...</option>\n          </select>\n          <input type=\"number\" id=\"custom-offset\" placeholder=\"UTC offset\" style=\"display: none; width: 80px; font-size: 12px; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;\">\n        </div>\n        ").concat(generateTimeOfDayChart(data.message_hours), "\n      </div>\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">Tool Errors Encountered</div>\n        ").concat(Object.keys(data.tool_error_categories).length > 0 ? generateBarChart(data.tool_error_categories, '#dc2626') : '<p class="empty">No tool errors</p>', "\n      </div>\n    </div>\n\n    ").concat(whatWorksHtml, "\n\n    <div class=\"charts-row\">\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">What Helped Most (Claude's Capabilities)</div>\n        ").concat(generateBarChart(data.success, '#16a34a'), "\n      </div>\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">Outcomes</div>\n        ").concat(generateBarChart(data.outcomes, '#8b5cf6', 6, OUTCOME_ORDER), "\n      </div>\n    </div>\n\n    ").concat(frictionHtml, "\n\n    <div class=\"charts-row\">\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">Primary Friction Types</div>\n        ").concat(generateBarChart(data.friction, '#dc2626'), "\n      </div>\n      <div class=\"chart-card\">\n        <div class=\"chart-title\">Inferred Satisfaction (model-estimated)</div>\n        ").concat(generateBarChart(data.satisfaction, '#eab308', 6, SATISFACTION_ORDER), "\n      </div>\n    </div>\n\n    ").concat(suggestionsHtml, "\n\n    ").concat(horizonHtml, "\n\n    ").concat(funEndingHtml, "\n\n    ").concat(teamFeedbackHtml, "\n  </div>\n  <script>").concat(js, "</script>\n</body>\n</html>");
}
/**
 * Build export data from already-computed values.
 * Used by background upload to S3.
 */
function buildExportData(data, insights, facets, remoteStats) {
    var version = typeof MACRO !== 'undefined' ? MACRO.VERSION : 'unknown';
    var remote_hosts_collected = remoteStats === null || remoteStats === void 0 ? void 0 : remoteStats.hosts.filter(function (h) { return h.sessionCount > 0; }).map(function (h) { return h.name; });
    var facets_summary = {
        total: facets.size,
        goal_categories: {},
        outcomes: {},
        satisfaction: {},
        friction: {},
    };
    for (var _i = 0, _a = facets.values(); _i < _a.length; _i++) {
        var f = _a[_i];
        for (var _b = 0, _c = safeEntries(f.goal_categories); _b < _c.length; _b++) {
            var _d = _c[_b], cat = _d[0], count = _d[1];
            if (count > 0) {
                facets_summary.goal_categories[cat] =
                    (facets_summary.goal_categories[cat] || 0) + count;
            }
        }
        facets_summary.outcomes[f.outcome] =
            (facets_summary.outcomes[f.outcome] || 0) + 1;
        for (var _e = 0, _f = safeEntries(f.user_satisfaction_counts); _e < _f.length; _e++) {
            var _g = _f[_e], level = _g[0], count = _g[1];
            if (count > 0) {
                facets_summary.satisfaction[level] =
                    (facets_summary.satisfaction[level] || 0) + count;
            }
        }
        for (var _h = 0, _j = safeEntries(f.friction_counts); _h < _j.length; _h++) {
            var _k = _j[_h], type = _k[0], count = _k[1];
            if (count > 0) {
                facets_summary.friction[type] =
                    (facets_summary.friction[type] || 0) + count;
            }
        }
    }
    return {
        metadata: __assign({ username: process.env.SAFEUSER || process.env.USER || 'unknown', generated_at: new Date().toISOString(), claude_code_version: version, date_range: data.date_range, session_count: data.total_sessions }, (remote_hosts_collected &&
            remote_hosts_collected.length > 0 && {
            remote_hosts_collected: remote_hosts_collected,
        })),
        aggregated_data: data,
        insights: insights,
        facets_summary: facets_summary,
    };
}
/**
 * Scans all project directories using filesystem metadata only (no JSONL parsing).
 * Returns a list of session file info sorted by mtime descending.
 * Yields to the event loop between project directories to keep the UI responsive.
 */
function scanAllSessions() {
    return __awaiter(this, void 0, void 0, function () {
        var projectsDir, dirents, _a, projectDirs, allSessions, i, sessionFiles, _i, sessionFiles_1, _b, sessionId, fileInfo;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    projectsDir = (0, sessionStorage_js_1.getProjectsDir)();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir, { withFileTypes: true })];
                case 2:
                    dirents = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [2 /*return*/, []];
                case 4:
                    projectDirs = dirents
                        .filter(function (dirent) { return dirent.isDirectory(); })
                        .map(function (dirent) { return (0, path_1.join)(projectsDir, dirent.name); });
                    allSessions = [];
                    i = 0;
                    _c.label = 5;
                case 5:
                    if (!(i < projectDirs.length)) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, sessionStorage_js_1.getSessionFilesWithMtime)(projectDirs[i])];
                case 6:
                    sessionFiles = _c.sent();
                    for (_i = 0, sessionFiles_1 = sessionFiles; _i < sessionFiles_1.length; _i++) {
                        _b = sessionFiles_1[_i], sessionId = _b[0], fileInfo = _b[1];
                        allSessions.push({
                            sessionId: sessionId,
                            path: fileInfo.path,
                            mtime: fileInfo.mtime,
                            size: fileInfo.size,
                        });
                    }
                    if (!(i % 10 === 9)) return [3 /*break*/, 8];
                    return [4 /*yield*/, new Promise(function (resolve) { return setImmediate(resolve); })];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 5];
                case 9:
                    // Sort by mtime descending (most recent first)
                    allSessions.sort(function (a, b) { return b.mtime - a.mtime; });
                    return [2 /*return*/, allSessions];
            }
        });
    });
}
// ============================================================================
// Main Function
// ============================================================================
function generateUsageReport(options) {
    return __awaiter(this, void 0, void 0, function () {
        var remoteStats, destDir, _a, hosts, totalCopied, allScannedSessions, totalSessionsScanned, META_BATCH_SIZE, MAX_SESSIONS_TO_LOAD, allMetas, uncachedSessions, i, batch, results, _i, results_2, _b, sessionInfo, cached, logsForFacets, isMetaSession, LOAD_BATCH_SIZE, i, batch, batchResults, metasToSave, _c, batchResults_1, logs, _d, logs_1, log, meta, bestBySession, _e, allMetas_1, meta, existing, keptSessionIds, _f, _g, sessionId, isSubstantiveSession, substantiveMetas, facets, toExtract, MAX_FACET_EXTRACTIONS, cachedFacetResults, _h, cachedFacetResults_1, _j, sessionId, cached, log, CONCURRENCY, i, batch, results, facetsToSave, _k, results_3, _l, sessionId, newFacets, isMinimalSession, substantiveSessions, substantiveFacets, _m, facets_1, _o, sessionId, f, aggregated, insights, htmlReport, _p, htmlPath;
        var _this = this;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    if (!(process.env.USER_TYPE === 'ant' && (options === null || options === void 0 ? void 0 : options.collectRemote))) return [3 /*break*/, 2];
                    destDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'projects');
                    return [4 /*yield*/, collectAllRemoteHostData(destDir)];
                case 1:
                    _a = _q.sent(), hosts = _a.hosts, totalCopied = _a.totalCopied;
                    remoteStats = { hosts: hosts, totalCopied: totalCopied };
                    _q.label = 2;
                case 2: return [4 /*yield*/, scanAllSessions()];
                case 3:
                    allScannedSessions = _q.sent();
                    totalSessionsScanned = allScannedSessions.length;
                    META_BATCH_SIZE = 50;
                    MAX_SESSIONS_TO_LOAD = 200;
                    allMetas = [];
                    uncachedSessions = [];
                    i = 0;
                    _q.label = 4;
                case 4:
                    if (!(i < allScannedSessions.length)) return [3 /*break*/, 7];
                    batch = allScannedSessions.slice(i, i + META_BATCH_SIZE);
                    return [4 /*yield*/, Promise.all(batch.map(function (sessionInfo) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {
                                            sessionInfo: sessionInfo
                                        };
                                        return [4 /*yield*/, loadCachedSessionMeta(sessionInfo.sessionId)];
                                    case 1: return [2 /*return*/, (_a.cached = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 5:
                    results = _q.sent();
                    for (_i = 0, results_2 = results; _i < results_2.length; _i++) {
                        _b = results_2[_i], sessionInfo = _b.sessionInfo, cached = _b.cached;
                        if (cached) {
                            allMetas.push(cached);
                        }
                        else if (uncachedSessions.length < MAX_SESSIONS_TO_LOAD) {
                            uncachedSessions.push(sessionInfo);
                        }
                    }
                    _q.label = 6;
                case 6:
                    i += META_BATCH_SIZE;
                    return [3 /*break*/, 4];
                case 7:
                    logsForFacets = new Map();
                    isMetaSession = function (log) {
                        for (var _i = 0, _a = log.messages.slice(0, 5); _i < _a.length; _i++) {
                            var msg = _a[_i];
                            if (msg.type === 'user' && msg.message) {
                                var content = msg.message.content;
                                if (typeof content === 'string') {
                                    if (content.includes('RESPOND WITH ONLY A VALID JSON OBJECT') ||
                                        content.includes('record_facets')) {
                                        return true;
                                    }
                                }
                            }
                        }
                        return false;
                    };
                    LOAD_BATCH_SIZE = 10;
                    i = 0;
                    _q.label = 8;
                case 8:
                    if (!(i < uncachedSessions.length)) return [3 /*break*/, 12];
                    batch = uncachedSessions.slice(i, i + LOAD_BATCH_SIZE);
                    return [4 /*yield*/, Promise.all(batch.map(function (sessionInfo) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, sessionStorage_js_1.loadAllLogsFromSessionFile)(sessionInfo.path)];
                                    case 1: return [2 /*return*/, _b.sent()];
                                    case 2:
                                        _a = _b.sent();
                                        return [2 /*return*/, []];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))
                        // Collect metas synchronously, then save them in parallel (independent writes)
                    ];
                case 9:
                    batchResults = _q.sent();
                    metasToSave = [];
                    for (_c = 0, batchResults_1 = batchResults; _c < batchResults_1.length; _c++) {
                        logs = batchResults_1[_c];
                        for (_d = 0, logs_1 = logs; _d < logs_1.length; _d++) {
                            log = logs_1[_d];
                            if (isMetaSession(log) || !hasValidDates(log))
                                continue;
                            meta = logToSessionMeta(log);
                            allMetas.push(meta);
                            metasToSave.push(meta);
                            // Keep the log around for potential facet extraction
                            logsForFacets.set(meta.session_id, log);
                        }
                    }
                    return [4 /*yield*/, Promise.all(metasToSave.map(function (meta) { return saveSessionMeta(meta); }))];
                case 10:
                    _q.sent();
                    _q.label = 11;
                case 11:
                    i += LOAD_BATCH_SIZE;
                    return [3 /*break*/, 8];
                case 12:
                    bestBySession = new Map();
                    for (_e = 0, allMetas_1 = allMetas; _e < allMetas_1.length; _e++) {
                        meta = allMetas_1[_e];
                        existing = bestBySession.get(meta.session_id);
                        if (!existing ||
                            meta.user_message_count > existing.user_message_count ||
                            (meta.user_message_count === existing.user_message_count &&
                                meta.duration_minutes > existing.duration_minutes)) {
                            bestBySession.set(meta.session_id, meta);
                        }
                    }
                    keptSessionIds = new Set(bestBySession.keys());
                    allMetas = __spreadArray([], bestBySession.values(), true);
                    for (_f = 0, _g = logsForFacets.keys(); _f < _g.length; _f++) {
                        sessionId = _g[_f];
                        if (!keptSessionIds.has(sessionId)) {
                            logsForFacets.delete(sessionId);
                        }
                    }
                    // Sort all metas by start_time descending (most recent first)
                    allMetas.sort(function (a, b) { return b.start_time.localeCompare(a.start_time); });
                    isSubstantiveSession = function (meta) {
                        // Skip sessions with very few user messages
                        if (meta.user_message_count < 2)
                            return false;
                        // Skip very short sessions (< 1 minute)
                        if (meta.duration_minutes < 1)
                            return false;
                        return true;
                    };
                    substantiveMetas = allMetas.filter(isSubstantiveSession);
                    facets = new Map();
                    toExtract = [];
                    MAX_FACET_EXTRACTIONS = 50;
                    return [4 /*yield*/, Promise.all(substantiveMetas.map(function (meta) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {
                                            sessionId: meta.session_id
                                        };
                                        return [4 /*yield*/, loadCachedFacets(meta.session_id)];
                                    case 1: return [2 /*return*/, (_a.cached = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 13:
                    cachedFacetResults = _q.sent();
                    for (_h = 0, cachedFacetResults_1 = cachedFacetResults; _h < cachedFacetResults_1.length; _h++) {
                        _j = cachedFacetResults_1[_h], sessionId = _j.sessionId, cached = _j.cached;
                        if (cached) {
                            facets.set(sessionId, cached);
                        }
                        else {
                            log = logsForFacets.get(sessionId);
                            if (log && toExtract.length < MAX_FACET_EXTRACTIONS) {
                                toExtract.push({ log: log, sessionId: sessionId });
                            }
                        }
                    }
                    CONCURRENCY = 50;
                    i = 0;
                    _q.label = 14;
                case 14:
                    if (!(i < toExtract.length)) return [3 /*break*/, 18];
                    batch = toExtract.slice(i, i + CONCURRENCY);
                    return [4 /*yield*/, Promise.all(batch.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var newFacets;
                            var log = _b.log, sessionId = _b.sessionId;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, extractFacetsFromAPI(log, sessionId)];
                                    case 1:
                                        newFacets = _c.sent();
                                        return [2 /*return*/, { sessionId: sessionId, newFacets: newFacets }];
                                }
                            });
                        }); }))
                        // Collect facets synchronously, save in parallel (independent writes)
                    ];
                case 15:
                    results = _q.sent();
                    facetsToSave = [];
                    for (_k = 0, results_3 = results; _k < results_3.length; _k++) {
                        _l = results_3[_k], sessionId = _l.sessionId, newFacets = _l.newFacets;
                        if (newFacets) {
                            facets.set(sessionId, newFacets);
                            facetsToSave.push(newFacets);
                        }
                    }
                    return [4 /*yield*/, Promise.all(facetsToSave.map(function (f) { return saveFacets(f); }))];
                case 16:
                    _q.sent();
                    _q.label = 17;
                case 17:
                    i += CONCURRENCY;
                    return [3 /*break*/, 14];
                case 18:
                    isMinimalSession = function (sessionId) {
                        var sessionFacets = facets.get(sessionId);
                        if (!sessionFacets)
                            return false;
                        var cats = sessionFacets.goal_categories;
                        var catKeys = safeKeys(cats).filter(function (k) { var _a; return ((_a = cats[k]) !== null && _a !== void 0 ? _a : 0) > 0; });
                        return catKeys.length === 1 && catKeys[0] === 'warmup_minimal';
                    };
                    substantiveSessions = substantiveMetas.filter(function (s) { return !isMinimalSession(s.session_id); });
                    substantiveFacets = new Map();
                    for (_m = 0, facets_1 = facets; _m < facets_1.length; _m++) {
                        _o = facets_1[_m], sessionId = _o[0], f = _o[1];
                        if (!isMinimalSession(sessionId)) {
                            substantiveFacets.set(sessionId, f);
                        }
                    }
                    aggregated = aggregateData(substantiveSessions, substantiveFacets);
                    aggregated.total_sessions_scanned = totalSessionsScanned;
                    return [4 /*yield*/, generateParallelInsights(aggregated, facets)
                        // Generate HTML report
                    ];
                case 19:
                    insights = _q.sent();
                    htmlReport = generateHtmlReport(aggregated, insights);
                    _q.label = 20;
                case 20:
                    _q.trys.push([20, 22, , 23]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(getDataDir(), { recursive: true })];
                case 21:
                    _q.sent();
                    return [3 /*break*/, 23];
                case 22:
                    _p = _q.sent();
                    return [3 /*break*/, 23];
                case 23:
                    htmlPath = (0, path_1.join)(getDataDir(), 'report.html');
                    return [4 /*yield*/, (0, promises_1.writeFile)(htmlPath, htmlReport, {
                            encoding: 'utf-8',
                            mode: 384,
                        })];
                case 24:
                    _q.sent();
                    return [2 /*return*/, {
                            insights: insights,
                            htmlPath: htmlPath,
                            data: aggregated,
                            remoteStats: remoteStats,
                            facets: substantiveFacets,
                        }];
            }
        });
    });
}
function safeEntries(obj) {
    return obj ? Object.entries(obj) : [];
}
function safeKeys(obj) {
    return obj ? Object.keys(obj) : [];
}
// ============================================================================
// Command Definition
// ============================================================================
var usageReport = {
    type: 'prompt',
    name: 'insights',
    description: 'Generate a report analyzing your Claude Code sessions',
    contentLength: 0, // Dynamic content
    progressMessage: 'analyzing your sessions',
    source: 'builtin',
    getPromptForCommand: function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var collectRemote, remoteHosts, hasRemoteHosts, _a, insights, htmlPath, data, remoteStats, reportUrl, uploadHint, timestamp, username, filename, s3Path, s3Url, sessionLabel, stats, remoteInfo, hsNames, atAGlance, summaryText, header, userSummary;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        collectRemote = false;
                        remoteHosts = [];
                        hasRemoteHosts = false;
                        if (!(process.env.USER_TYPE === 'ant')) return [3 /*break*/, 2];
                        // Parse --homespaces flag
                        collectRemote = (_b = args === null || args === void 0 ? void 0 : args.includes('--homespaces')) !== null && _b !== void 0 ? _b : false;
                        return [4 /*yield*/, getRunningRemoteHosts()];
                    case 1:
                        // Check for available remote hosts
                        remoteHosts = _c.sent();
                        hasRemoteHosts = remoteHosts.length > 0;
                        // Show collection message if collecting
                        if (collectRemote && hasRemoteHosts) {
                            // biome-ignore lint/suspicious/noConsole: intentional
                            console.error("Collecting sessions from ".concat(remoteHosts.length, " homespace(s): ").concat(remoteHosts.join(', '), "..."));
                        }
                        _c.label = 2;
                    case 2: return [4 /*yield*/, generateUsageReport({ collectRemote: collectRemote })];
                    case 3:
                        _a = _c.sent(), insights = _a.insights, htmlPath = _a.htmlPath, data = _a.data, remoteStats = _a.remoteStats;
                        reportUrl = "file://".concat(htmlPath);
                        uploadHint = '';
                        if (process.env.USER_TYPE === 'ant') {
                            timestamp = new Date()
                                .toISOString()
                                .replace(/[-:]/g, '')
                                .replace('T', '_')
                                .slice(0, 15);
                            username = process.env.SAFEUSER || process.env.USER || 'unknown';
                            filename = "".concat(username, "_insights_").concat(timestamp, ".html");
                            s3Path = "s3://anthropic-serve/atamkin/cc-user-reports/".concat(filename);
                            s3Url = "https://s3-frontend.infra.ant.dev/anthropic-serve/atamkin/cc-user-reports/".concat(filename);
                            reportUrl = s3Url;
                            try {
                                (0, child_process_1.execFileSync)('ff', ['cp', htmlPath, s3Path], {
                                    timeout: 60000,
                                    stdio: 'pipe', // Suppress output
                                });
                            }
                            catch (_d) {
                                // Upload failed - fall back to local file and show upload command
                                reportUrl = "file://".concat(htmlPath);
                                uploadHint = "\nAutomatic upload failed. Are you on the boron namespace? Try `use-bo` and ensure you've run `sso`.\nTo share, run: ff cp ".concat(htmlPath, " ").concat(s3Path, "\nThen access at: ").concat(s3Url);
                            }
                        }
                        sessionLabel = data.total_sessions_scanned &&
                            data.total_sessions_scanned > data.total_sessions
                            ? "".concat(data.total_sessions_scanned.toLocaleString(), " sessions total \u00B7 ").concat(data.total_sessions, " analyzed")
                            : "".concat(data.total_sessions, " sessions");
                        stats = [
                            sessionLabel,
                            "".concat(data.total_messages.toLocaleString(), " messages"),
                            "".concat(Math.round(data.total_duration_hours), "h"),
                            "".concat(data.git_commits, " commits"),
                        ].join(' · ');
                        remoteInfo = '';
                        if (process.env.USER_TYPE === 'ant') {
                            if (remoteStats && remoteStats.totalCopied > 0) {
                                hsNames = remoteStats.hosts
                                    .filter(function (h) { return h.sessionCount > 0; })
                                    .map(function (h) { return h.name; })
                                    .join(', ');
                                remoteInfo = "\n_Collected ".concat(remoteStats.totalCopied, " new sessions from: ").concat(hsNames, "_\n");
                            }
                            else if (!collectRemote && hasRemoteHosts) {
                                // Suggest using --homespaces if they have remote hosts but didn't use the flag
                                remoteInfo = "\n_Tip: Run `/insights --homespaces` to include sessions from your ".concat(remoteHosts.length, " running homespace(s)_\n");
                            }
                        }
                        atAGlance = insights.at_a_glance;
                        summaryText = atAGlance
                            ? "## At a Glance\n\n".concat(atAGlance.whats_working ? "**What's working:** ".concat(atAGlance.whats_working, " See _Impressive Things You Did_.") : '', "\n\n").concat(atAGlance.whats_hindering ? "**What's hindering you:** ".concat(atAGlance.whats_hindering, " See _Where Things Go Wrong_.") : '', "\n\n").concat(atAGlance.quick_wins ? "**Quick wins to try:** ".concat(atAGlance.quick_wins, " See _Features to Try_.") : '', "\n\n").concat(atAGlance.ambitious_workflows ? "**Ambitious workflows:** ".concat(atAGlance.ambitious_workflows, " See _On the Horizon_.") : '')
                            : '_No insights generated_';
                        header = "# Claude Code Insights\n\n".concat(stats, "\n").concat(data.date_range.start, " to ").concat(data.date_range.end, "\n").concat(remoteInfo, "\n");
                        userSummary = "".concat(header).concat(summaryText, "\n\nYour full shareable insights report is ready: ").concat(reportUrl).concat(uploadHint);
                        // Return prompt for Claude to respond to
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: "The user just ran /insights to generate a usage report analyzing their Claude Code sessions.\n\nHere is the full insights data:\n".concat((0, slowOperations_js_1.jsonStringify)(insights, null, 2), "\n\nReport URL: ").concat(reportUrl, "\nHTML file: ").concat(htmlPath, "\nFacets directory: ").concat(getFacetsDir(), "\n\nHere is what the user sees:\n").concat(userSummary, "\n\nNow output the following message exactly:\n\n<message>\nYour shareable insights report is ready:\n").concat(reportUrl).concat(uploadHint, "\n\nWant to dig into any section or try one of the suggestions?\n</message>"),
                                },
                            ]];
                }
            });
        });
    },
};
function isValidSessionFacets(obj) {
    if (!obj || typeof obj !== 'object')
        return false;
    var o = obj;
    return (typeof o.underlying_goal === 'string' &&
        typeof o.outcome === 'string' &&
        typeof o.brief_summary === 'string' &&
        o.goal_categories !== null &&
        typeof o.goal_categories === 'object' &&
        o.user_satisfaction_counts !== null &&
        typeof o.user_satisfaction_counts === 'object' &&
        o.friction_counts !== null &&
        typeof o.friction_counts === 'object');
}
exports.default = usageReport;
