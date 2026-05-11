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
exports.getToolSearchOrReadInfo = getToolSearchOrReadInfo;
exports.getSearchOrReadFromContent = getSearchOrReadFromContent;
exports.getToolUseIdsFromCollapsedGroup = getToolUseIdsFromCollapsedGroup;
exports.hasAnyToolInProgress = hasAnyToolInProgress;
exports.getDisplayMessageFromCollapsed = getDisplayMessageFromCollapsed;
exports.collapseReadSearchGroups = collapseReadSearchGroups;
exports.getSearchReadSummaryText = getSearchReadSummaryText;
exports.summarizeRecentActivities = summarizeRecentActivities;
var bun_bundle_1 = require("bun:bundle");
var Tool_js_1 = require("../Tool.js");
var commentLabel_js_1 = require("../tools/BashTool/commentLabel.js");
var toolName_js_1 = require("../tools/BashTool/toolName.js");
var constants_js_1 = require("../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../tools/FileWriteTool/prompt.js");
var constants_js_2 = require("../tools/REPLTool/constants.js");
var primitiveTools_js_1 = require("../tools/REPLTool/primitiveTools.js");
var gitOperationTracking_js_1 = require("../tools/shared/gitOperationTracking.js");
var prompt_js_2 = require("../tools/ToolSearchTool/prompt.js");
var file_js_1 = require("./file.js");
var fullscreen_js_1 = require("./fullscreen.js");
var memoryFileDetection_js_1 = require("./memoryFileDetection.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemOps = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('./teamMemoryOps.js')
    : null;
var SNIP_TOOL_NAME = (0, bun_bundle_1.feature)('HISTORY_SNIP')
    ? require('../tools/SnipTool/prompt.js').SNIP_TOOL_NAME
    : null;
/**
 * Extract the primary file/directory path from a tool_use input.
 * Handles both `file_path` (Read/Write/Edit) and `path` (Grep/Glob).
 */
function getFilePathFromToolInput(toolInput) {
    var _a;
    var input = toolInput;
    return (_a = input === null || input === void 0 ? void 0 : input.file_path) !== null && _a !== void 0 ? _a : input === null || input === void 0 ? void 0 : input.path;
}
/**
 * Check if a search tool use targets memory files by examining its path, pattern, and glob.
 */
function isMemorySearch(toolInput) {
    var input = toolInput;
    if (!input) {
        return false;
    }
    // Check if the search path targets a memory file or directory (Grep/Glob tools)
    if (input.path) {
        if ((0, memoryFileDetection_js_1.isAutoManagedMemoryFile)(input.path) || (0, memoryFileDetection_js_1.isMemoryDirectory)(input.path)) {
            return true;
        }
    }
    // Check glob patterns that indicate memory file access
    if (input.glob && (0, memoryFileDetection_js_1.isAutoManagedMemoryPattern)(input.glob)) {
        return true;
    }
    // For shell commands (bash grep/rg, PowerShell Select-String, etc.),
    // check if the command targets memory paths
    if (input.command && (0, memoryFileDetection_js_1.isShellCommandTargetingMemory)(input.command)) {
        return true;
    }
    return false;
}
/**
 * Check if a Write or Edit tool use targets a memory file and should be collapsed.
 */
function isMemoryWriteOrEdit(toolName, toolInput) {
    if (toolName !== prompt_js_1.FILE_WRITE_TOOL_NAME && toolName !== constants_js_1.FILE_EDIT_TOOL_NAME) {
        return false;
    }
    var filePath = getFilePathFromToolInput(toolInput);
    return filePath !== undefined && (0, memoryFileDetection_js_1.isAutoManagedMemoryFile)(filePath);
}
// ~5 lines × ~60 cols. Generous static cap — the renderer lets Ink wrap.
var MAX_HINT_CHARS = 300;
/**
 * Format a bash command for the ⎿ hint. Drops blank lines, collapses runs of
 * inline whitespace, then caps total length. Newlines are preserved so the
 * renderer can indent continuation lines under ⎿.
 */
function commandAsHint(command) {
    var cleaned = '$ ' +
        command
            .split('\n')
            .map(function (l) { return l.replace(/\s+/g, ' ').trim(); })
            .filter(function (l) { return l !== ''; })
            .join('\n');
    return cleaned.length > MAX_HINT_CHARS
        ? cleaned.slice(0, MAX_HINT_CHARS - 1) + '…'
        : cleaned;
}
/**
 * Checks if a tool is a search/read operation using the tool's isSearchOrReadCommand method.
 * Also treats Write/Edit of memory files as collapsible.
 * Returns detailed information about whether it's a search or read operation.
 */
function getToolSearchOrReadInfo(toolName, toolInput, tools) {
    var _a, _b, _c;
    // REPL is absorbed silently — its inner tool calls are emitted as virtual
    // messages (isVirtual: true) via newMessages and flow through this function
    // as regular Read/Grep/Bash messages. The REPL wrapper itself contributes
    // no counts and doesn't break the group, so consecutive REPL calls merge.
    if (toolName === constants_js_2.REPL_TOOL_NAME) {
        return {
            isCollapsible: true,
            isSearch: false,
            isRead: false,
            isList: false,
            isREPL: true,
            isMemoryWrite: false,
            isAbsorbedSilently: true,
        };
    }
    // Memory file writes/edits are collapsible
    if (isMemoryWriteOrEdit(toolName, toolInput)) {
        return {
            isCollapsible: true,
            isSearch: false,
            isRead: false,
            isList: false,
            isREPL: false,
            isMemoryWrite: true,
            isAbsorbedSilently: false,
        };
    }
    // Meta-operations absorbed silently: Snip (context cleanup) and ToolSearch
    // (lazy tool schema loading). Neither should break a collapse group or
    // contribute to its count, but both stay visible in verbose mode.
    if (((0, bun_bundle_1.feature)('HISTORY_SNIP') && toolName === SNIP_TOOL_NAME) ||
        ((0, fullscreen_js_1.isFullscreenEnvEnabled)() && toolName === prompt_js_2.TOOL_SEARCH_TOOL_NAME)) {
        return {
            isCollapsible: true,
            isSearch: false,
            isRead: false,
            isList: false,
            isREPL: false,
            isMemoryWrite: false,
            isAbsorbedSilently: true,
        };
    }
    // Fallback to REPL primitives: in REPL mode, Bash/Read/Grep/etc. are
    // stripped from the execution tools list, but REPL emits them as virtual
    // messages. Without the fallback they'd return isCollapsible: false and
    // vanish from the summary line.
    var tool = (_a = (0, Tool_js_1.findToolByName)(tools, toolName)) !== null && _a !== void 0 ? _a : (0, Tool_js_1.findToolByName)((0, primitiveTools_js_1.getReplPrimitiveTools)(), toolName);
    if (!(tool === null || tool === void 0 ? void 0 : tool.isSearchOrReadCommand)) {
        return {
            isCollapsible: false,
            isSearch: false,
            isRead: false,
            isList: false,
            isREPL: false,
            isMemoryWrite: false,
            isAbsorbedSilently: false,
        };
    }
    // The tool's isSearchOrReadCommand method handles its own input validation via safeParse,
    // so passing the raw input is safe. The type assertion is necessary because Tool[] uses
    // the default generic which expects { [x: string]: any }, but we receive unknown at runtime.
    var result = tool.isSearchOrReadCommand(toolInput);
    var isList = (_b = result.isList) !== null && _b !== void 0 ? _b : false;
    var isCollapsible = result.isSearch || result.isRead || isList;
    // Under fullscreen mode, non-search/read Bash commands are also collapsible
    // as their own category — "Ran N bash commands" instead of breaking the group.
    return __assign(__assign({ isCollapsible: isCollapsible ||
            ((0, fullscreen_js_1.isFullscreenEnvEnabled)() ? toolName === toolName_js_1.BASH_TOOL_NAME : false), isSearch: result.isSearch, isRead: result.isRead, isList: isList, isREPL: false, isMemoryWrite: false, isAbsorbedSilently: false }, (tool.isMcp && { mcpServerName: (_c = tool.mcpInfo) === null || _c === void 0 ? void 0 : _c.serverName })), { isBash: (0, fullscreen_js_1.isFullscreenEnvEnabled)()
            ? !isCollapsible && toolName === toolName_js_1.BASH_TOOL_NAME
            : undefined });
}
/**
 * Check if a tool_use content block is a search/read operation.
 * Returns { isSearch, isRead, isREPL } if it's a collapsible search/read, null otherwise.
 */
function getSearchOrReadFromContent(content, tools) {
    if ((content === null || content === void 0 ? void 0 : content.type) === 'tool_use' && content.name) {
        var info = getToolSearchOrReadInfo(content.name, content.input, tools);
        if (info.isCollapsible || info.isREPL) {
            return {
                isSearch: info.isSearch,
                isRead: info.isRead,
                isList: info.isList,
                isREPL: info.isREPL,
                isMemoryWrite: info.isMemoryWrite,
                isAbsorbedSilently: info.isAbsorbedSilently,
                mcpServerName: info.mcpServerName,
                isBash: info.isBash,
            };
        }
    }
    return null;
}
/**
 * Checks if a tool is a search/read operation (for backwards compatibility).
 */
function isToolSearchOrRead(toolName, toolInput, tools) {
    return getToolSearchOrReadInfo(toolName, toolInput, tools).isCollapsible;
}
/**
 * Get the tool name, input, and search/read info from a message if it's a collapsible tool use.
 * Returns null if the message is not a collapsible tool use.
 */
function getCollapsibleToolInfo(msg, tools) {
    var _a;
    if (msg.type === 'assistant') {
        var content = msg.message.content[0];
        var info = getSearchOrReadFromContent(content, tools);
        if (info && (content === null || content === void 0 ? void 0 : content.type) === 'tool_use') {
            return __assign({ name: content.name, input: content.input }, info);
        }
    }
    if (msg.type === 'grouped_tool_use') {
        // For grouped tool uses, check the first message's input
        var firstContent = (_a = msg.messages[0]) === null || _a === void 0 ? void 0 : _a.message.content[0];
        var info = getSearchOrReadFromContent(firstContent
            ? { type: 'tool_use', name: msg.toolName, input: firstContent.input }
            : undefined, tools);
        if (info && (firstContent === null || firstContent === void 0 ? void 0 : firstContent.type) === 'tool_use') {
            return __assign({ name: msg.toolName, input: firstContent.input }, info);
        }
    }
    return null;
}
/**
 * Check if a message is assistant text that should break a group.
 */
function isTextBreaker(msg) {
    if (msg.type === 'assistant') {
        var content = msg.message.content[0];
        if ((content === null || content === void 0 ? void 0 : content.type) === 'text' && content.text.trim().length > 0) {
            return true;
        }
    }
    return false;
}
/**
 * Check if a message is a non-collapsible tool use that should break a group.
 * This includes tool uses like Edit, Write, etc.
 */
function isNonCollapsibleToolUse(msg, tools) {
    var _a;
    if (msg.type === 'assistant') {
        var content = msg.message.content[0];
        if ((content === null || content === void 0 ? void 0 : content.type) === 'tool_use' &&
            !isToolSearchOrRead(content.name, content.input, tools)) {
            return true;
        }
    }
    if (msg.type === 'grouped_tool_use') {
        var firstContent = (_a = msg.messages[0]) === null || _a === void 0 ? void 0 : _a.message.content[0];
        if ((firstContent === null || firstContent === void 0 ? void 0 : firstContent.type) === 'tool_use' &&
            !isToolSearchOrRead(msg.toolName, firstContent.input, tools)) {
            return true;
        }
    }
    return false;
}
function isPreToolHookSummary(msg) {
    return (msg.type === 'system' &&
        msg.subtype === 'stop_hook_summary' &&
        msg.hookLabel === 'PreToolUse');
}
/**
 * Check if a message should be skipped (not break the group, just passed through).
 * This includes thinking blocks, redacted thinking, attachments, etc.
 */
function shouldSkipMessage(msg) {
    if (msg.type === 'assistant') {
        var content = msg.message.content[0];
        // Skip thinking blocks and other non-text, non-tool content
        if ((content === null || content === void 0 ? void 0 : content.type) === 'thinking' || (content === null || content === void 0 ? void 0 : content.type) === 'redacted_thinking') {
            return true;
        }
    }
    // Skip attachment messages
    if (msg.type === 'attachment') {
        return true;
    }
    // Skip system messages
    if (msg.type === 'system') {
        return true;
    }
    return false;
}
/**
 * Type predicate: Check if a message is a collapsible tool use.
 */
function isCollapsibleToolUse(msg, tools) {
    var _a;
    if (msg.type === 'assistant') {
        var content = msg.message.content[0];
        return ((content === null || content === void 0 ? void 0 : content.type) === 'tool_use' &&
            isToolSearchOrRead(content.name, content.input, tools));
    }
    if (msg.type === 'grouped_tool_use') {
        var firstContent = (_a = msg.messages[0]) === null || _a === void 0 ? void 0 : _a.message.content[0];
        return ((firstContent === null || firstContent === void 0 ? void 0 : firstContent.type) === 'tool_use' &&
            isToolSearchOrRead(msg.toolName, firstContent.input, tools));
    }
    return false;
}
/**
 * Type predicate: Check if a message is a tool result for collapsible tools.
 * Returns true if ALL tool results in the message are for tracked collapsible tools.
 */
function isCollapsibleToolResult(msg, collapsibleToolUseIds) {
    if (msg.type === 'user') {
        var toolResults = msg.message.content.filter(function (c) {
            return c.type === 'tool_result';
        });
        // Only return true if there are tool results AND all of them are for collapsible tools
        return (toolResults.length > 0 &&
            toolResults.every(function (r) { return collapsibleToolUseIds.has(r.tool_use_id); }));
    }
    return false;
}
/**
 * Get all tool use IDs from a single message (handles grouped tool uses).
 */
function getToolUseIdsFromMessage(msg) {
    if (msg.type === 'assistant') {
        var content = msg.message.content[0];
        if ((content === null || content === void 0 ? void 0 : content.type) === 'tool_use') {
            return [content.id];
        }
    }
    if (msg.type === 'grouped_tool_use') {
        return msg.messages
            .map(function (m) {
            var content = m.message.content[0];
            return content.type === 'tool_use' ? content.id : '';
        })
            .filter(Boolean);
    }
    return [];
}
/**
 * Get all tool use IDs from a collapsed read/search group.
 */
function getToolUseIdsFromCollapsedGroup(message) {
    var ids = [];
    for (var _i = 0, _a = message.messages; _i < _a.length; _i++) {
        var msg = _a[_i];
        ids.push.apply(ids, getToolUseIdsFromMessage(msg));
    }
    return ids;
}
/**
 * Check if any tool in a collapsed group is in progress.
 */
function hasAnyToolInProgress(message, inProgressToolUseIDs) {
    return getToolUseIdsFromCollapsedGroup(message).some(function (id) {
        return inProgressToolUseIDs.has(id);
    });
}
/**
 * Get the underlying NormalizedMessage for display (timestamp/model).
 * Handles nested GroupedToolUseMessage within collapsed groups.
 * Returns a NormalizedAssistantMessage or NormalizedUserMessage (never GroupedToolUseMessage).
 */
function getDisplayMessageFromCollapsed(message) {
    var firstMsg = message.displayMessage;
    if (firstMsg.type === 'grouped_tool_use') {
        return firstMsg.displayMessage;
    }
    return firstMsg;
}
/**
 * Count the number of tool uses in a message (handles grouped tool uses).
 */
function countToolUses(msg) {
    if (msg.type === 'grouped_tool_use') {
        return msg.messages.length;
    }
    return 1;
}
/**
 * Extract file paths from read tool inputs in a message.
 * Returns an array of file paths (may have duplicates if same file is read multiple times in one grouped message).
 */
function getFilePathsFromReadMessage(msg) {
    var paths = [];
    if (msg.type === 'assistant') {
        var content = msg.message.content[0];
        if ((content === null || content === void 0 ? void 0 : content.type) === 'tool_use') {
            var input = content.input;
            if (input === null || input === void 0 ? void 0 : input.file_path) {
                paths.push(input.file_path);
            }
        }
    }
    else if (msg.type === 'grouped_tool_use') {
        for (var _i = 0, _a = msg.messages; _i < _a.length; _i++) {
            var m = _a[_i];
            var content = m.message.content[0];
            if ((content === null || content === void 0 ? void 0 : content.type) === 'tool_use') {
                var input = content.input;
                if (input === null || input === void 0 ? void 0 : input.file_path) {
                    paths.push(input.file_path);
                }
            }
        }
    }
    return paths;
}
/**
 * Scan a bash tool result for commit SHAs and PR URLs and push them into the
 * group accumulator. Called only for results whose tool_use_id was recorded
 * in bashCommands (non-search/read bash).
 */
function scanBashResultForGitOps(msg, group) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (msg.type !== 'user')
        return;
    var out = msg.toolUseResult;
    if (!(out === null || out === void 0 ? void 0 : out.stdout) && !(out === null || out === void 0 ? void 0 : out.stderr))
        return;
    // git push writes the ref update to stderr — scan both streams.
    var combined = ((_a = out.stdout) !== null && _a !== void 0 ? _a : '') + '\n' + ((_b = out.stderr) !== null && _b !== void 0 ? _b : '');
    for (var _i = 0, _j = msg.message.content; _i < _j.length; _i++) {
        var c = _j[_i];
        if (c.type !== 'tool_result')
            continue;
        var command = (_c = group.bashCommands) === null || _c === void 0 ? void 0 : _c.get(c.tool_use_id);
        if (!command)
            continue;
        var _k = (0, gitOperationTracking_js_1.detectGitOperation)(command, combined), commit = _k.commit, push = _k.push, branch = _k.branch, pr = _k.pr;
        if (commit)
            (_d = group.commits) === null || _d === void 0 ? void 0 : _d.push(commit);
        if (push)
            (_e = group.pushes) === null || _e === void 0 ? void 0 : _e.push(push);
        if (branch)
            (_f = group.branches) === null || _f === void 0 ? void 0 : _f.push(branch);
        if (pr)
            (_g = group.prs) === null || _g === void 0 ? void 0 : _g.push(pr);
        if (commit || push || branch || pr) {
            group.gitOpBashCount = ((_h = group.gitOpBashCount) !== null && _h !== void 0 ? _h : 0) + 1;
        }
    }
}
function createEmptyGroup() {
    var group = {
        messages: [],
        searchCount: 0,
        readFilePaths: new Set(),
        readOperationCount: 0,
        listCount: 0,
        toolUseIds: new Set(),
        memorySearchCount: 0,
        memoryReadFilePaths: new Set(),
        memoryWriteCount: 0,
        nonMemSearchArgs: [],
        latestDisplayHint: undefined,
        hookTotalMs: 0,
        hookCount: 0,
        hookInfos: [],
    };
    if ((0, bun_bundle_1.feature)('TEAMMEM')) {
        group.teamMemorySearchCount = 0;
        group.teamMemoryReadFilePaths = new Set();
        group.teamMemoryWriteCount = 0;
    }
    group.mcpCallCount = 0;
    group.mcpServerNames = new Set();
    if ((0, fullscreen_js_1.isFullscreenEnvEnabled)()) {
        group.bashCount = 0;
        group.bashCommands = new Map();
        group.commits = [];
        group.pushes = [];
        group.branches = [];
        group.prs = [];
        group.gitOpBashCount = 0;
    }
    return group;
}
function createCollapsedGroup(group) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var firstMsg = group.messages[0];
    // When file-path-based reads exist, use unique file count (Set.size) only.
    // Adding bash operation count on top would double-count — e.g. Read(README.md)
    // followed by Bash(wc -l README.md) should still show as 1 file, not 2.
    // Fall back to operation count only when there are no file-path reads (bash-only).
    var totalReadCount = group.readFilePaths.size > 0
        ? group.readFilePaths.size
        : group.readOperationCount;
    // memoryReadFilePaths ⊆ readFilePaths (both populated from Read tool calls),
    // so this count is safe to subtract from totalReadCount at readCount below.
    // Absorbed relevant_memories attachments are NOT in readFilePaths — added
    // separately after the subtraction so readCount stays correct.
    var toolMemoryReadCount = group.memoryReadFilePaths.size;
    var memoryReadCount = toolMemoryReadCount + ((_b = (_a = group.relevantMemories) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
    // Non-memory read file paths: exclude memory and team memory paths
    var teamMemReadPaths = (0, bun_bundle_1.feature)('TEAMMEM')
        ? group.teamMemoryReadFilePaths
        : undefined;
    var nonMemReadFilePaths = __spreadArray([], group.readFilePaths, true).filter(function (p) { var _a; return !group.memoryReadFilePaths.has(p) && !((_a = teamMemReadPaths === null || teamMemReadPaths === void 0 ? void 0 : teamMemReadPaths.has(p)) !== null && _a !== void 0 ? _a : false); });
    var teamMemSearchCount = (0, bun_bundle_1.feature)('TEAMMEM')
        ? ((_c = group.teamMemorySearchCount) !== null && _c !== void 0 ? _c : 0)
        : 0;
    var teamMemReadCount = (0, bun_bundle_1.feature)('TEAMMEM')
        ? ((_e = (_d = group.teamMemoryReadFilePaths) === null || _d === void 0 ? void 0 : _d.size) !== null && _e !== void 0 ? _e : 0)
        : 0;
    var teamMemWriteCount = (0, bun_bundle_1.feature)('TEAMMEM')
        ? ((_f = group.teamMemoryWriteCount) !== null && _f !== void 0 ? _f : 0)
        : 0;
    var result = {
        type: 'collapsed_read_search',
        // Subtract memory + team memory counts so regular counts only reflect non-memory operations
        searchCount: Math.max(0, group.searchCount - group.memorySearchCount - teamMemSearchCount),
        readCount: Math.max(0, totalReadCount - toolMemoryReadCount - teamMemReadCount),
        listCount: group.listCount,
        // REPL operations are intentionally not collapsed (see isCollapsible: false at line 32),
        // so replCount in collapsed groups is always 0. The replCount field is kept for
        // sub-agent progress display in AgentTool/UI.tsx which has a separate code path.
        replCount: 0,
        memorySearchCount: group.memorySearchCount,
        memoryReadCount: memoryReadCount,
        memoryWriteCount: group.memoryWriteCount,
        readFilePaths: nonMemReadFilePaths,
        searchArgs: group.nonMemSearchArgs,
        latestDisplayHint: group.latestDisplayHint,
        messages: group.messages,
        displayMessage: firstMsg,
        uuid: "collapsed-".concat(firstMsg.uuid),
        timestamp: firstMsg.timestamp,
    };
    if ((0, bun_bundle_1.feature)('TEAMMEM')) {
        result.teamMemorySearchCount = teamMemSearchCount;
        result.teamMemoryReadCount = teamMemReadCount;
        result.teamMemoryWriteCount = teamMemWriteCount;
    }
    if (((_g = group.mcpCallCount) !== null && _g !== void 0 ? _g : 0) > 0) {
        result.mcpCallCount = group.mcpCallCount;
        result.mcpServerNames = __spreadArray([], ((_h = group.mcpServerNames) !== null && _h !== void 0 ? _h : []), true);
    }
    if ((0, fullscreen_js_1.isFullscreenEnvEnabled)()) {
        if (((_j = group.bashCount) !== null && _j !== void 0 ? _j : 0) > 0) {
            result.bashCount = group.bashCount;
            result.gitOpBashCount = group.gitOpBashCount;
        }
        if (((_l = (_k = group.commits) === null || _k === void 0 ? void 0 : _k.length) !== null && _l !== void 0 ? _l : 0) > 0)
            result.commits = group.commits;
        if (((_o = (_m = group.pushes) === null || _m === void 0 ? void 0 : _m.length) !== null && _o !== void 0 ? _o : 0) > 0)
            result.pushes = group.pushes;
        if (((_q = (_p = group.branches) === null || _p === void 0 ? void 0 : _p.length) !== null && _q !== void 0 ? _q : 0) > 0)
            result.branches = group.branches;
        if (((_s = (_r = group.prs) === null || _r === void 0 ? void 0 : _r.length) !== null && _s !== void 0 ? _s : 0) > 0)
            result.prs = group.prs;
    }
    if (group.hookCount > 0) {
        result.hookTotalMs = group.hookTotalMs;
        result.hookCount = group.hookCount;
        result.hookInfos = group.hookInfos;
    }
    if (group.relevantMemories && group.relevantMemories.length > 0) {
        result.relevantMemories = group.relevantMemories;
    }
    return result;
}
/**
 * Collapse consecutive Read/Search operations into summary groups.
 *
 * Rules:
 * - Groups consecutive search/read tool uses (Grep, Glob, Read, and Bash search/read commands)
 * - Includes their corresponding tool results in the group
 * - Breaks groups when assistant text appears
 */
function collapseReadSearchGroups(messages, tools) {
    var _a, _b;
    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var result = [];
    var currentGroup = createEmptyGroup();
    var deferredSkippable = [];
    function flushGroup() {
        if (currentGroup.messages.length === 0) {
            return;
        }
        result.push(createCollapsedGroup(currentGroup));
        for (var _i = 0, deferredSkippable_1 = deferredSkippable; _i < deferredSkippable_1.length; _i++) {
            var deferred = deferredSkippable_1[_i];
            result.push(deferred);
        }
        deferredSkippable = [];
        currentGroup = createEmptyGroup();
    }
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        if (isCollapsibleToolUse(msg, tools)) {
            // This is a collapsible tool use - type predicate narrows to CollapsibleMessage
            var toolInfo = getCollapsibleToolInfo(msg, tools);
            if (toolInfo.isMemoryWrite) {
                // Memory file write/edit — check if it's team memory
                var count = countToolUses(msg);
                if ((0, bun_bundle_1.feature)('TEAMMEM') &&
                    (teamMemOps === null || teamMemOps === void 0 ? void 0 : teamMemOps.isTeamMemoryWriteOrEdit(toolInfo.name, toolInfo.input))) {
                    currentGroup.teamMemoryWriteCount =
                        ((_c = currentGroup.teamMemoryWriteCount) !== null && _c !== void 0 ? _c : 0) + count;
                }
                else {
                    currentGroup.memoryWriteCount += count;
                }
            }
            else if (toolInfo.isAbsorbedSilently) {
                // Snip/ToolSearch absorbed silently — no count, no summary text.
                // Hidden from the default view but still shown in verbose mode
                // (Ctrl+O) via the groupMessages iteration in CollapsedReadSearchContent.
            }
            else if (toolInfo.mcpServerName) {
                // MCP search/read — counted separately so the summary says
                // "Queried slack N times" instead of "Read N files".
                var count = countToolUses(msg);
                currentGroup.mcpCallCount = ((_d = currentGroup.mcpCallCount) !== null && _d !== void 0 ? _d : 0) + count;
                (_e = currentGroup.mcpServerNames) === null || _e === void 0 ? void 0 : _e.add(toolInfo.mcpServerName);
                var input = toolInfo.input;
                if (input === null || input === void 0 ? void 0 : input.query) {
                    currentGroup.latestDisplayHint = "\"".concat(input.query, "\"");
                }
            }
            else if ((0, fullscreen_js_1.isFullscreenEnvEnabled)() && toolInfo.isBash) {
                // Non-search/read Bash command — counted separately so the summary
                // says "Ran N bash commands" instead of breaking the group.
                var count = countToolUses(msg);
                currentGroup.bashCount = ((_f = currentGroup.bashCount) !== null && _f !== void 0 ? _f : 0) + count;
                var input = toolInfo.input;
                if (input === null || input === void 0 ? void 0 : input.command) {
                    // Prefer the stripped `# comment` if present (it's what Claude wrote
                    // for the human — same trigger as the comment-as-label tool-use render).
                    currentGroup.latestDisplayHint =
                        (_g = (0, commentLabel_js_1.extractBashCommentLabel)(input.command)) !== null && _g !== void 0 ? _g : commandAsHint(input.command);
                    // Remember tool_use_id → command so the result (arriving next) can
                    // be scanned for commit SHA / PR URL.
                    for (var _p = 0, _q = getToolUseIdsFromMessage(msg); _p < _q.length; _p++) {
                        var id = _q[_p];
                        (_h = currentGroup.bashCommands) === null || _h === void 0 ? void 0 : _h.set(id, input.command);
                    }
                }
            }
            else if (toolInfo.isList) {
                // Directory-listing bash commands (ls, tree, du) — counted separately
                // so the summary says "Listed N directories" instead of "Read N files".
                currentGroup.listCount += countToolUses(msg);
                var input = toolInfo.input;
                if (input === null || input === void 0 ? void 0 : input.command) {
                    currentGroup.latestDisplayHint = commandAsHint(input.command);
                }
            }
            else if (toolInfo.isSearch) {
                // Use the isSearch flag from the tool to properly categorize bash search commands
                var count = countToolUses(msg);
                currentGroup.searchCount += count;
                // Check if the search targets memory files (via path or glob pattern)
                if ((0, bun_bundle_1.feature)('TEAMMEM') &&
                    (teamMemOps === null || teamMemOps === void 0 ? void 0 : teamMemOps.isTeamMemorySearch(toolInfo.input))) {
                    currentGroup.teamMemorySearchCount =
                        ((_j = currentGroup.teamMemorySearchCount) !== null && _j !== void 0 ? _j : 0) + count;
                }
                else if (isMemorySearch(toolInfo.input)) {
                    currentGroup.memorySearchCount += count;
                }
                else {
                    // Regular (non-memory) search — collect pattern for display
                    var input = toolInfo.input;
                    if (input === null || input === void 0 ? void 0 : input.pattern) {
                        currentGroup.nonMemSearchArgs.push(input.pattern);
                        currentGroup.latestDisplayHint = "\"".concat(input.pattern, "\"");
                    }
                }
            }
            else {
                // For reads, track unique file paths instead of counting operations
                var filePaths = getFilePathsFromReadMessage(msg);
                for (var _r = 0, filePaths_1 = filePaths; _r < filePaths_1.length; _r++) {
                    var filePath = filePaths_1[_r];
                    currentGroup.readFilePaths.add(filePath);
                    if ((0, bun_bundle_1.feature)('TEAMMEM') && (teamMemOps === null || teamMemOps === void 0 ? void 0 : teamMemOps.isTeamMemFile(filePath))) {
                        (_k = currentGroup.teamMemoryReadFilePaths) === null || _k === void 0 ? void 0 : _k.add(filePath);
                    }
                    else if ((0, memoryFileDetection_js_1.isAutoManagedMemoryFile)(filePath)) {
                        currentGroup.memoryReadFilePaths.add(filePath);
                    }
                    else {
                        // Non-memory file read — update display hint
                        currentGroup.latestDisplayHint = (0, file_js_1.getDisplayPath)(filePath);
                    }
                }
                // If no file paths found (e.g., Bash read commands like ls, cat), count the operations
                if (filePaths.length === 0) {
                    currentGroup.readOperationCount += countToolUses(msg);
                    // Use the Bash command as the display hint (truncated for readability)
                    var input = toolInfo.input;
                    if (input === null || input === void 0 ? void 0 : input.command) {
                        currentGroup.latestDisplayHint = commandAsHint(input.command);
                    }
                }
            }
            // Track tool use IDs for matching results
            for (var _s = 0, _t = getToolUseIdsFromMessage(msg); _s < _t.length; _s++) {
                var id = _t[_s];
                currentGroup.toolUseIds.add(id);
            }
            currentGroup.messages.push(msg);
        }
        else if (isCollapsibleToolResult(msg, currentGroup.toolUseIds)) {
            currentGroup.messages.push(msg);
            // Scan bash results for commit SHAs / PR URLs to surface in the summary
            if ((0, fullscreen_js_1.isFullscreenEnvEnabled)() && ((_l = currentGroup.bashCommands) === null || _l === void 0 ? void 0 : _l.size)) {
                scanBashResultForGitOps(msg, currentGroup);
            }
        }
        else if (currentGroup.messages.length > 0 && isPreToolHookSummary(msg)) {
            // Absorb PreToolUse hook summaries into the group instead of deferring
            currentGroup.hookCount += msg.hookCount;
            currentGroup.hookTotalMs +=
                (_m = msg.totalDurationMs) !== null && _m !== void 0 ? _m : msg.hookInfos.reduce(function (sum, h) { var _a; return sum + ((_a = h.durationMs) !== null && _a !== void 0 ? _a : 0); }, 0);
            (_a = currentGroup.hookInfos).push.apply(_a, msg.hookInfos);
        }
        else if (currentGroup.messages.length > 0 &&
            msg.type === 'attachment' &&
            msg.attachment.type === 'relevant_memories') {
            // Absorb auto-injected memory attachments so "recalled N memories"
            // renders inline with "ran N bash commands" instead of as a separate
            // ⏺ block. Do NOT add paths to readFilePaths/memoryReadFilePaths —
            // that would poison the readOperationCount fallback (bash-only reads
            // have no paths; adding memory paths makes readFilePaths.size > 0 and
            // suppresses the fallback). createCollapsedGroup adds .length to
            // memoryReadCount after the readCount subtraction instead.
            (_o = currentGroup.relevantMemories) !== null && _o !== void 0 ? _o : (currentGroup.relevantMemories = []);
            (_b = currentGroup.relevantMemories).push.apply(_b, msg.attachment.memories);
        }
        else if (shouldSkipMessage(msg)) {
            // Don't flush the group for skippable messages (thinking, attachments, system)
            // If a group is in progress, defer these messages to output after the collapsed group
            // This preserves the visual ordering where the collapsed badge appears at the position
            // of the first tool use, not displaced by intervening skippable messages.
            // Exception: nested_memory attachments are pushed through even during a group so
            // ⎿ Loaded lines cluster tightly instead of being split by the badge's marginTop.
            if (currentGroup.messages.length > 0 &&
                !(msg.type === 'attachment' && msg.attachment.type === 'nested_memory')) {
                deferredSkippable.push(msg);
            }
            else {
                result.push(msg);
            }
        }
        else if (isTextBreaker(msg)) {
            // Assistant text breaks the group
            flushGroup();
            result.push(msg);
        }
        else if (isNonCollapsibleToolUse(msg, tools)) {
            // Non-collapsible tool use breaks the group
            flushGroup();
            result.push(msg);
        }
        else {
            // User messages with non-collapsible tool results break the group
            flushGroup();
            result.push(msg);
        }
    }
    flushGroup();
    return result;
}
/**
 * Generate a summary text for search/read/REPL counts.
 * @param searchCount Number of search operations
 * @param readCount Number of read operations
 * @param isActive Whether the group is still in progress (use present tense) or completed (use past tense)
 * @param replCount Number of REPL executions (optional)
 * @param memoryCounts Optional memory file operation counts
 * @returns Summary text like "Searching for 3 patterns, reading 2 files, REPL'd 5 times…"
 */
function getSearchReadSummaryText(searchCount, readCount, isActive, replCount, memoryCounts, listCount) {
    if (replCount === void 0) { replCount = 0; }
    if (listCount === void 0) { listCount = 0; }
    var parts = [];
    // Memory operations first
    if (memoryCounts) {
        var memorySearchCount = memoryCounts.memorySearchCount, memoryReadCount = memoryCounts.memoryReadCount, memoryWriteCount = memoryCounts.memoryWriteCount;
        if (memoryReadCount > 0) {
            var verb = isActive
                ? parts.length === 0
                    ? 'Recalling'
                    : 'recalling'
                : parts.length === 0
                    ? 'Recalled'
                    : 'recalled';
            parts.push("".concat(verb, " ").concat(memoryReadCount, " ").concat(memoryReadCount === 1 ? 'memory' : 'memories'));
        }
        if (memorySearchCount > 0) {
            var verb = isActive
                ? parts.length === 0
                    ? 'Searching'
                    : 'searching'
                : parts.length === 0
                    ? 'Searched'
                    : 'searched';
            parts.push("".concat(verb, " memories"));
        }
        if (memoryWriteCount > 0) {
            var verb = isActive
                ? parts.length === 0
                    ? 'Writing'
                    : 'writing'
                : parts.length === 0
                    ? 'Wrote'
                    : 'wrote';
            parts.push("".concat(verb, " ").concat(memoryWriteCount, " ").concat(memoryWriteCount === 1 ? 'memory' : 'memories'));
        }
        // Team memory operations
        if ((0, bun_bundle_1.feature)('TEAMMEM') && teamMemOps) {
            teamMemOps.appendTeamMemorySummaryParts(memoryCounts, isActive, parts);
        }
    }
    if (searchCount > 0) {
        var searchVerb = isActive
            ? parts.length === 0
                ? 'Searching for'
                : 'searching for'
            : parts.length === 0
                ? 'Searched for'
                : 'searched for';
        parts.push("".concat(searchVerb, " ").concat(searchCount, " ").concat(searchCount === 1 ? 'pattern' : 'patterns'));
    }
    if (readCount > 0) {
        var readVerb = isActive
            ? parts.length === 0
                ? 'Reading'
                : 'reading'
            : parts.length === 0
                ? 'Read'
                : 'read';
        parts.push("".concat(readVerb, " ").concat(readCount, " ").concat(readCount === 1 ? 'file' : 'files'));
    }
    if (listCount > 0) {
        var listVerb = isActive
            ? parts.length === 0
                ? 'Listing'
                : 'listing'
            : parts.length === 0
                ? 'Listed'
                : 'listed';
        parts.push("".concat(listVerb, " ").concat(listCount, " ").concat(listCount === 1 ? 'directory' : 'directories'));
    }
    if (replCount > 0) {
        var replVerb = isActive ? "REPL'ing" : "REPL'd";
        parts.push("".concat(replVerb, " ").concat(replCount, " ").concat(replCount === 1 ? 'time' : 'times'));
    }
    var text = parts.join(', ');
    return isActive ? "".concat(text, "\u2026") : text;
}
/**
 * Summarize a list of recent tool activities into a compact description.
 * Rolls up trailing consecutive search/read operations using pre-computed
 * isSearch/isRead classifications from recording time. Falls back to the
 * last activity's description for non-collapsible tool uses.
 */
function summarizeRecentActivities(activities) {
    var _a;
    if (activities.length === 0) {
        return undefined;
    }
    // Count trailing search/read activities from the end of the list
    var searchCount = 0;
    var readCount = 0;
    for (var i = activities.length - 1; i >= 0; i--) {
        var activity = activities[i];
        if (activity.isSearch) {
            searchCount++;
        }
        else if (activity.isRead) {
            readCount++;
        }
        else {
            break;
        }
    }
    var collapsibleCount = searchCount + readCount;
    if (collapsibleCount >= 2) {
        return getSearchReadSummaryText(searchCount, readCount, true);
    }
    // Fall back to most recent activity with a description (some tools like
    // SendMessage don't implement getActivityDescription, so search backward)
    for (var i = activities.length - 1; i >= 0; i--) {
        if ((_a = activities[i]) === null || _a === void 0 ? void 0 : _a.activityDescription) {
            return activities[i].activityDescription;
        }
    }
    return undefined;
}
