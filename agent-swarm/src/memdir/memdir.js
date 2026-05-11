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
exports.DIRS_EXIST_GUIDANCE = exports.DIR_EXISTS_GUIDANCE = exports.MAX_ENTRYPOINT_BYTES = exports.MAX_ENTRYPOINT_LINES = exports.ENTRYPOINT_NAME = void 0;
exports.truncateEntrypointContent = truncateEntrypointContent;
exports.ensureMemoryDirExists = ensureMemoryDirExists;
exports.buildMemoryLines = buildMemoryLines;
exports.buildMemoryPrompt = buildMemoryPrompt;
exports.buildSearchingPastContextSection = buildSearchingPastContextSection;
exports.loadMemoryPrompt = loadMemoryPrompt;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var fsOperations_js_1 = require("../utils/fsOperations.js");
var paths_js_1 = require("./paths.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemPaths = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('./teamMemPaths.js')
    : null;
var state_js_1 = require("../bootstrap/state.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var index_js_1 = require("../services/analytics/index.js");
var prompt_js_1 = require("../tools/GrepTool/prompt.js");
var constants_js_1 = require("../tools/REPLTool/constants.js");
var debug_js_1 = require("../utils/debug.js");
var embeddedTools_js_1 = require("../utils/embeddedTools.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var format_js_1 = require("../utils/format.js");
var sessionStorage_js_1 = require("../utils/sessionStorage.js");
var settings_js_1 = require("../utils/settings/settings.js");
var memoryTypes_js_1 = require("./memoryTypes.js");
exports.ENTRYPOINT_NAME = 'MEMORY.md';
exports.MAX_ENTRYPOINT_LINES = 200;
// ~125 chars/line at 200 lines. At p97 today; catches long-line indexes that
// slip past the line cap (p100 observed: 197KB under 200 lines).
exports.MAX_ENTRYPOINT_BYTES = 25000;
var AUTO_MEM_DISPLAY_NAME = 'auto memory';
/**
 * Truncate MEMORY.md content to the line AND byte caps, appending a warning
 * that names which cap fired. Line-truncates first (natural boundary), then
 * byte-truncates at the last newline before the cap so we don't cut mid-line.
 *
 * Shared by buildMemoryPrompt and claudemd getMemoryFiles (previously
 * duplicated the line-only logic).
 */
function truncateEntrypointContent(raw) {
    var trimmed = raw.trim();
    var contentLines = trimmed.split('\n');
    var lineCount = contentLines.length;
    var byteCount = trimmed.length;
    var wasLineTruncated = lineCount > exports.MAX_ENTRYPOINT_LINES;
    // Check original byte count — long lines are the failure mode the byte cap
    // targets, so post-line-truncation size would understate the warning.
    var wasByteTruncated = byteCount > exports.MAX_ENTRYPOINT_BYTES;
    if (!wasLineTruncated && !wasByteTruncated) {
        return {
            content: trimmed,
            lineCount: lineCount,
            byteCount: byteCount,
            wasLineTruncated: wasLineTruncated,
            wasByteTruncated: wasByteTruncated,
        };
    }
    var truncated = wasLineTruncated
        ? contentLines.slice(0, exports.MAX_ENTRYPOINT_LINES).join('\n')
        : trimmed;
    if (truncated.length > exports.MAX_ENTRYPOINT_BYTES) {
        var cutAt = truncated.lastIndexOf('\n', exports.MAX_ENTRYPOINT_BYTES);
        truncated = truncated.slice(0, cutAt > 0 ? cutAt : exports.MAX_ENTRYPOINT_BYTES);
    }
    var reason = wasByteTruncated && !wasLineTruncated
        ? "".concat((0, format_js_1.formatFileSize)(byteCount), " (limit: ").concat((0, format_js_1.formatFileSize)(exports.MAX_ENTRYPOINT_BYTES), ") \u2014 index entries are too long")
        : wasLineTruncated && !wasByteTruncated
            ? "".concat(lineCount, " lines (limit: ").concat(exports.MAX_ENTRYPOINT_LINES, ")")
            : "".concat(lineCount, " lines and ").concat((0, format_js_1.formatFileSize)(byteCount));
    return {
        content: truncated +
            "\n\n> WARNING: ".concat(exports.ENTRYPOINT_NAME, " is ").concat(reason, ". Only part of it was loaded. Keep index entries to one line under ~200 chars; move detail into topic files."),
        lineCount: lineCount,
        byteCount: byteCount,
        wasLineTruncated: wasLineTruncated,
        wasByteTruncated: wasByteTruncated,
    };
}
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemPrompts = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('./teamMemPrompts.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Shared guidance text appended to each memory directory prompt line.
 * Shipped because Claude was burning turns on `ls`/`mkdir -p` before writing.
 * Harness guarantees the directory exists via ensureMemoryDirExists().
 */
exports.DIR_EXISTS_GUIDANCE = 'This directory already exists — write to it directly with the Write tool (do not run mkdir or check for its existence).';
exports.DIRS_EXIST_GUIDANCE = 'Both directories already exist — write to them directly with the Write tool (do not run mkdir or check for their existence).';
/**
 * Ensure a memory directory exists. Idempotent — called from loadMemoryPrompt
 * (once per session via systemPromptSection cache) so the model can always
 * write without checking existence first. FsOperations.mkdir is recursive
 * by default and already swallows EEXIST, so the full parent chain
 * (~/.claude/projects/<slug>/memory/) is created in one call with no
 * try/catch needed for the happy path.
 */
function ensureMemoryDirExists(memoryDir) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, e_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.mkdir(memoryDir)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    code = e_1 instanceof Error && 'code' in e_1 && typeof e_1.code === 'string'
                        ? e_1.code
                        : undefined;
                    (0, debug_js_1.logForDebugging)("ensureMemoryDirExists failed for ".concat(memoryDir, ": ").concat(code !== null && code !== void 0 ? code : String(e_1)), { level: 'debug' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Log memory directory file/subdir counts asynchronously.
 * Fire-and-forget — doesn't block prompt building.
 */
function logMemoryDirCounts(memoryDir, baseMetadata) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    void fs.readdir(memoryDir).then(function (dirents) {
        var fileCount = 0;
        var subdirCount = 0;
        for (var _i = 0, dirents_1 = dirents; _i < dirents_1.length; _i++) {
            var d = dirents_1[_i];
            if (d.isFile()) {
                fileCount++;
            }
            else if (d.isDirectory()) {
                subdirCount++;
            }
        }
        (0, index_js_1.logEvent)('tengu_memdir_loaded', __assign(__assign({}, baseMetadata), { total_file_count: fileCount, total_subdir_count: subdirCount }));
    }, function () {
        // Directory unreadable — log without counts
        (0, index_js_1.logEvent)('tengu_memdir_loaded', baseMetadata);
    });
}
/**
 * Build the typed-memory behavioral instructions (without MEMORY.md content).
 * Constrains memories to a closed four-type taxonomy (user / feedback / project /
 * reference) — content that is derivable from the current project state (code
 * patterns, architecture, git history) is explicitly excluded.
 *
 * Individual-only variant: no `## Memory scope` section, no <scope> tags
 * in type blocks, and team/private qualifiers stripped from examples.
 *
 * Used by both buildMemoryPrompt (agent memory, includes content) and
 * loadMemoryPrompt (system prompt, content injected via user context instead).
 */
function buildMemoryLines(displayName, memoryDir, extraGuidelines, skipIndex) {
    if (skipIndex === void 0) { skipIndex = false; }
    var howToSave = skipIndex
        ? __spreadArray(__spreadArray([
            '## How to save memories',
            '',
            'Write each memory to its own file (e.g., `user_role.md`, `feedback_testing.md`) using this frontmatter format:',
            ''
        ], memoryTypes_js_1.MEMORY_FRONTMATTER_EXAMPLE, true), [
            '',
            '- Keep the name, description, and type fields in memory files up-to-date with the content',
            '- Organize memory semantically by topic, not chronologically',
            '- Update or remove memories that turn out to be wrong or outdated',
            '- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.',
        ], false) : __spreadArray(__spreadArray([
        '## How to save memories',
        '',
        'Saving a memory is a two-step process:',
        '',
        '**Step 1** — write the memory to its own file (e.g., `user_role.md`, `feedback_testing.md`) using this frontmatter format:',
        ''
    ], memoryTypes_js_1.MEMORY_FRONTMATTER_EXAMPLE, true), [
        '',
        "**Step 2** \u2014 add a pointer to that file in `".concat(exports.ENTRYPOINT_NAME, "`. `").concat(exports.ENTRYPOINT_NAME, "` is an index, not a memory \u2014 each entry should be one line, under ~150 characters: `- [Title](file.md) \u2014 one-line hook`. It has no frontmatter. Never write memory content directly into `").concat(exports.ENTRYPOINT_NAME, "`."),
        '',
        "- `".concat(exports.ENTRYPOINT_NAME, "` is always loaded into your conversation context \u2014 lines after ").concat(exports.MAX_ENTRYPOINT_LINES, " will be truncated, so keep the index concise"),
        '- Keep the name, description, and type fields in memory files up-to-date with the content',
        '- Organize memory semantically by topic, not chronologically',
        '- Update or remove memories that turn out to be wrong or outdated',
        '- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.',
    ], false);
    var lines = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        "# ".concat(displayName),
        '',
        "You have a persistent, file-based memory system at `".concat(memoryDir, "`. ").concat(exports.DIR_EXISTS_GUIDANCE),
        '',
        "You should build up this memory system over time so that future conversations can have a complete picture of who the user is, how they'd like to collaborate with you, what behaviors to avoid or repeat, and the context behind the work the user gives you.",
        '',
        'If the user explicitly asks you to remember something, save it immediately as whichever type fits best. If they ask you to forget something, find and remove the relevant entry.',
        ''
    ], memoryTypes_js_1.TYPES_SECTION_INDIVIDUAL, true), memoryTypes_js_1.WHAT_NOT_TO_SAVE_SECTION, true), [
        ''
    ], false), howToSave, true), [
        ''
    ], false), memoryTypes_js_1.WHEN_TO_ACCESS_SECTION, true), [
        ''
    ], false), memoryTypes_js_1.TRUSTING_RECALL_SECTION, true), [
        '',
        '## Memory and other forms of persistence',
        'Memory is one of several persistence mechanisms available to you as you assist the user in a given conversation. The distinction is often that memory can be recalled in future conversations and should not be used for persisting information that is only useful within the scope of the current conversation.',
        '- When to use or update a plan instead of memory: If you are about to start a non-trivial implementation task and would like to reach alignment with the user on your approach you should use a Plan rather than saving this information to memory. Similarly, if you already have a plan within the conversation and you have changed your approach persist that change by updating the plan rather than saving a memory.',
        '- When to use or update tasks instead of memory: When you need to break your work in current conversation into discrete steps or keep track of your progress use tasks instead of saving to memory. Tasks are great for persisting information about the work that needs to be done in the current conversation, but memory should be reserved for information that will be useful in future conversations.',
        ''
    ], false), (extraGuidelines !== null && extraGuidelines !== void 0 ? extraGuidelines : []), true), [
        '',
    ], false);
    lines.push.apply(lines, buildSearchingPastContextSection(memoryDir));
    return lines;
}
/**
 * Build the typed-memory prompt with MEMORY.md content included.
 * Used by agent memory (which has no getClaudeMds() equivalent).
 */
function buildMemoryPrompt(params) {
    var displayName = params.displayName, memoryDir = params.memoryDir, extraGuidelines = params.extraGuidelines;
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var entrypoint = memoryDir + exports.ENTRYPOINT_NAME;
    // Directory creation is the caller's responsibility (loadMemoryPrompt /
    // loadAgentMemoryPrompt). Builders only read, they don't mkdir.
    // Read existing memory entrypoint (sync: prompt building is synchronous)
    var entrypointContent = '';
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs
        entrypointContent = fs.readFileSync(entrypoint, { encoding: 'utf-8' });
    }
    catch (_a) {
        // No memory file yet
    }
    var lines = buildMemoryLines(displayName, memoryDir, extraGuidelines);
    if (entrypointContent.trim()) {
        var t = truncateEntrypointContent(entrypointContent);
        var memoryType = displayName === AUTO_MEM_DISPLAY_NAME ? 'auto' : 'agent';
        logMemoryDirCounts(memoryDir, {
            content_length: t.byteCount,
            line_count: t.lineCount,
            was_truncated: t.wasLineTruncated,
            was_byte_truncated: t.wasByteTruncated,
            memory_type: memoryType,
        });
        lines.push("## ".concat(exports.ENTRYPOINT_NAME), '', t.content);
    }
    else {
        lines.push("## ".concat(exports.ENTRYPOINT_NAME), '', "Your ".concat(exports.ENTRYPOINT_NAME, " is currently empty. When you save new memories, they will appear here."));
    }
    return lines.join('\n');
}
/**
 * Assistant-mode daily-log prompt. Gated behind feature('KAIROS').
 *
 * Assistant sessions are effectively perpetual, so the agent writes memories
 * append-only to a date-named log file rather than maintaining MEMORY.md as
 * a live index. A separate nightly /dream skill distills logs into topic
 * files + MEMORY.md. MEMORY.md is still loaded into context (via claudemd.ts)
 * as the distilled index — this prompt only changes where NEW memories go.
 */
function buildAssistantDailyLogPrompt(skipIndex) {
    if (skipIndex === void 0) { skipIndex = false; }
    var memoryDir = (0, paths_js_1.getAutoMemPath)();
    // Describe the path as a pattern rather than inlining today's literal path:
    // this prompt is cached by systemPromptSection('memory', ...) and NOT
    // invalidated on date change. The model derives the current date from the
    // date_change attachment (appended at the tail on midnight rollover) rather
    // than the user-context message — the latter is intentionally left stale to
    // preserve the prompt cache prefix across midnight.
    var logPathPattern = (0, path_1.join)(memoryDir, 'logs', 'YYYY', 'MM', 'YYYY-MM-DD.md');
    var lines = __spreadArray(__spreadArray(__spreadArray(__spreadArray([
        '# auto memory',
        '',
        "You have a persistent, file-based memory system found at: `".concat(memoryDir, "`"),
        '',
        "This session is long-lived. As you work, record anything worth remembering by **appending** to today's daily log file:",
        '',
        "`".concat(logPathPattern, "`"),
        '',
        "Substitute today's date (from `currentDate` in your context) for `YYYY-MM-DD`. When the date rolls over mid-session, start appending to the new day's file.",
        '',
        'Write each entry as a short timestamped bullet. Create the file (and parent directories) on first write if it does not exist. Do not rewrite or reorganize the log — it is append-only. A separate nightly process distills these logs into `MEMORY.md` and topic files.',
        '',
        '## What to log',
        '- User corrections and preferences ("use bun, not npm"; "stop summarizing diffs")',
        '- Facts about the user, their role, or their goals',
        '- Project context that is not derivable from the code (deadlines, incidents, decisions and their rationale)',
        '- Pointers to external systems (dashboards, Linear projects, Slack channels)',
        '- Anything the user explicitly asks you to remember',
        ''
    ], memoryTypes_js_1.WHAT_NOT_TO_SAVE_SECTION, true), [
        ''
    ], false), (skipIndex
        ? []
        : [
            "## ".concat(exports.ENTRYPOINT_NAME),
            "`".concat(exports.ENTRYPOINT_NAME, "` is the distilled index (maintained nightly from your logs) and is loaded into your context automatically. Read it for orientation, but do not edit it directly \u2014 record new information in today's log instead."),
            '',
        ]), true), buildSearchingPastContextSection(memoryDir), true);
    return lines.join('\n');
}
/**
 * Build the "Searching past context" section if the feature gate is enabled.
 */
function buildSearchingPastContextSection(autoMemDir) {
    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_coral_fern', false)) {
        return [];
    }
    var projectDir = (0, sessionStorage_js_1.getProjectDir)((0, state_js_1.getOriginalCwd)());
    // Ant-native builds alias grep to embedded ugrep and remove the dedicated
    // Grep tool, so give the model a real shell invocation there.
    // In REPL mode, both Grep and Bash are hidden from direct use — the model
    // calls them from inside REPL scripts, so the grep shell form is what it
    // will write in the script anyway.
    var embedded = (0, embeddedTools_js_1.hasEmbeddedSearchTools)() || (0, constants_js_1.isReplModeEnabled)();
    var memSearch = embedded
        ? "grep -rn \"<search term>\" ".concat(autoMemDir, " --include=\"*.md\"")
        : "".concat(prompt_js_1.GREP_TOOL_NAME, " with pattern=\"<search term>\" path=\"").concat(autoMemDir, "\" glob=\"*.md\"");
    var transcriptSearch = embedded
        ? "grep -rn \"<search term>\" ".concat(projectDir, "/ --include=\"*.jsonl\"")
        : "".concat(prompt_js_1.GREP_TOOL_NAME, " with pattern=\"<search term>\" path=\"").concat(projectDir, "/\" glob=\"*.jsonl\"");
    return [
        '## Searching past context',
        '',
        'When looking for past context:',
        '1. Search topic files in your memory directory:',
        '```',
        memSearch,
        '```',
        '2. Session transcript logs (last resort — large files, slow):',
        '```',
        transcriptSearch,
        '```',
        'Use narrow search terms (error messages, file paths, function names) rather than broad keywords.',
        '',
    ];
}
/**
 * Load the unified memory prompt for inclusion in the system prompt.
 * Dispatches based on which memory systems are enabled:
 *   - auto + team: combined prompt (both directories)
 *   - auto only: memory lines (single directory)
 * Team memory requires auto memory (enforced by isTeamMemoryEnabled), so
 * there is no team-only branch.
 *
 * Returns null when auto memory is disabled.
 */
function loadMemoryPrompt() {
    return __awaiter(this, void 0, void 0, function () {
        var autoEnabled, skipIndex, coworkExtraGuidelines, extraGuidelines, autoDir, teamDir, autoDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    autoEnabled = (0, paths_js_1.isAutoMemoryEnabled)();
                    skipIndex = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_moth_copse', false);
                    // KAIROS daily-log mode takes precedence over TEAMMEM: the append-only
                    // log paradigm does not compose with team sync (which expects a shared
                    // MEMORY.md that both sides read + write). Gating on `autoEnabled` here
                    // means the !autoEnabled case falls through to the tengu_memdir_disabled
                    // telemetry block below, matching the non-KAIROS path.
                    if ((0, bun_bundle_1.feature)('KAIROS') && autoEnabled && (0, state_js_1.getKairosActive)()) {
                        logMemoryDirCounts((0, paths_js_1.getAutoMemPath)(), {
                            memory_type: 'auto',
                        });
                        return [2 /*return*/, buildAssistantDailyLogPrompt(skipIndex)];
                    }
                    coworkExtraGuidelines = process.env.CLAUDE_COWORK_MEMORY_EXTRA_GUIDELINES;
                    extraGuidelines = coworkExtraGuidelines && coworkExtraGuidelines.trim().length > 0
                        ? [coworkExtraGuidelines]
                        : undefined;
                    if (!(0, bun_bundle_1.feature)('TEAMMEM')) return [3 /*break*/, 2];
                    if (!teamMemPaths.isTeamMemoryEnabled()) return [3 /*break*/, 2];
                    autoDir = (0, paths_js_1.getAutoMemPath)();
                    teamDir = teamMemPaths.getTeamMemPath();
                    // Harness guarantees these directories exist so the model can write
                    // without checking. The prompt text reflects this ("already exists").
                    // Only creating teamDir is sufficient: getTeamMemPath() is defined as
                    // join(getAutoMemPath(), 'team'), so recursive mkdir of the team dir
                    // creates the auto dir as a side effect. If the team dir ever moves
                    // out from under the auto dir, add a second ensureMemoryDirExists call
                    // for autoDir here.
                    return [4 /*yield*/, ensureMemoryDirExists(teamDir)];
                case 1:
                    // Harness guarantees these directories exist so the model can write
                    // without checking. The prompt text reflects this ("already exists").
                    // Only creating teamDir is sufficient: getTeamMemPath() is defined as
                    // join(getAutoMemPath(), 'team'), so recursive mkdir of the team dir
                    // creates the auto dir as a side effect. If the team dir ever moves
                    // out from under the auto dir, add a second ensureMemoryDirExists call
                    // for autoDir here.
                    _a.sent();
                    logMemoryDirCounts(autoDir, {
                        memory_type: 'auto',
                    });
                    logMemoryDirCounts(teamDir, {
                        memory_type: 'team',
                    });
                    return [2 /*return*/, teamMemPrompts.buildCombinedMemoryPrompt(extraGuidelines, skipIndex)];
                case 2:
                    if (!autoEnabled) return [3 /*break*/, 4];
                    autoDir = (0, paths_js_1.getAutoMemPath)();
                    // Harness guarantees the directory exists so the model can write without
                    // checking. The prompt text reflects this ("already exists").
                    return [4 /*yield*/, ensureMemoryDirExists(autoDir)];
                case 3:
                    // Harness guarantees the directory exists so the model can write without
                    // checking. The prompt text reflects this ("already exists").
                    _a.sent();
                    logMemoryDirCounts(autoDir, {
                        memory_type: 'auto',
                    });
                    return [2 /*return*/, buildMemoryLines('auto memory', autoDir, extraGuidelines, skipIndex).join('\n')];
                case 4:
                    (0, index_js_1.logEvent)('tengu_memdir_disabled', {
                        disabled_by_env_var: (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY),
                        disabled_by_setting: !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY) &&
                            (0, settings_js_1.getInitialSettings)().autoMemoryEnabled === false,
                    });
                    // Gate on the GB flag directly, not isTeamMemoryEnabled() — that function
                    // checks isAutoMemoryEnabled() first, which is definitionally false in this
                    // branch. We want "was this user in the team-memory cohort at all."
                    if ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_herring_clock', false)) {
                        (0, index_js_1.logEvent)('tengu_team_memdir_disabled', {});
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
