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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMemoryFileAccess = isMemoryFileAccess;
exports.registerSessionFileAccessHooks = registerSessionFileAccessHooks;
/**
 * Session file access analytics hooks.
 * Tracks access to session memory and transcript files via Read, Grep, Glob tools.
 * Also tracks memdir file access via Read, Grep, Glob, Edit, and Write tools.
 */
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("../bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var constants_js_1 = require("../tools/FileEditTool/constants.js");
var types_js_1 = require("../tools/FileEditTool/types.js");
var FileReadTool_js_1 = require("../tools/FileReadTool/FileReadTool.js");
var prompt_js_1 = require("../tools/FileReadTool/prompt.js");
var FileWriteTool_js_1 = require("../tools/FileWriteTool/FileWriteTool.js");
var prompt_js_2 = require("../tools/FileWriteTool/prompt.js");
var GlobTool_js_1 = require("../tools/GlobTool/GlobTool.js");
var prompt_js_3 = require("../tools/GlobTool/prompt.js");
var GrepTool_js_1 = require("../tools/GrepTool/GrepTool.js");
var prompt_js_4 = require("../tools/GrepTool/prompt.js");
var memoryFileDetection_js_1 = require("./memoryFileDetection.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemPaths = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('../memdir/teamMemPaths.js')
    : null;
var teamMemWatcher = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('../services/teamMemorySync/watcher.js')
    : null;
var memoryShapeTelemetry = (0, bun_bundle_1.feature)('MEMORY_SHAPE_TELEMETRY')
    ? require('../memdir/memoryShapeTelemetry.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var agentContext_js_1 = require("./agentContext.js");
/**
 * Extract the file path from a tool input for memdir detection.
 * Covers Read (file_path), Edit (file_path), and Write (file_path).
 */
function getFilePathFromInput(toolName, toolInput) {
    switch (toolName) {
        case prompt_js_1.FILE_READ_TOOL_NAME: {
            var parsed = FileReadTool_js_1.FileReadTool.inputSchema.safeParse(toolInput);
            return parsed.success ? parsed.data.file_path : null;
        }
        case constants_js_1.FILE_EDIT_TOOL_NAME: {
            var parsed = (0, types_js_1.inputSchema)().safeParse(toolInput);
            return parsed.success ? parsed.data.file_path : null;
        }
        case prompt_js_2.FILE_WRITE_TOOL_NAME: {
            var parsed = FileWriteTool_js_1.FileWriteTool.inputSchema.safeParse(toolInput);
            return parsed.success ? parsed.data.file_path : null;
        }
        default:
            return null;
    }
}
/**
 * Extract file type from tool input.
 * Returns the detected session file type or null.
 */
function getSessionFileTypeFromInput(toolName, toolInput) {
    switch (toolName) {
        case prompt_js_1.FILE_READ_TOOL_NAME: {
            var parsed = FileReadTool_js_1.FileReadTool.inputSchema.safeParse(toolInput);
            if (!parsed.success)
                return null;
            return (0, memoryFileDetection_js_1.detectSessionFileType)(parsed.data.file_path);
        }
        case prompt_js_4.GREP_TOOL_NAME: {
            var parsed = GrepTool_js_1.GrepTool.inputSchema.safeParse(toolInput);
            if (!parsed.success)
                return null;
            // Check path if provided
            if (parsed.data.path) {
                var pathType = (0, memoryFileDetection_js_1.detectSessionFileType)(parsed.data.path);
                if (pathType)
                    return pathType;
            }
            // Check glob pattern
            if (parsed.data.glob) {
                var globType = (0, memoryFileDetection_js_1.detectSessionPatternType)(parsed.data.glob);
                if (globType)
                    return globType;
            }
            return null;
        }
        case prompt_js_3.GLOB_TOOL_NAME: {
            var parsed = GlobTool_js_1.GlobTool.inputSchema.safeParse(toolInput);
            if (!parsed.success)
                return null;
            // Check path if provided
            if (parsed.data.path) {
                var pathType = (0, memoryFileDetection_js_1.detectSessionFileType)(parsed.data.path);
                if (pathType)
                    return pathType;
            }
            // Check pattern
            var patternType = (0, memoryFileDetection_js_1.detectSessionPatternType)(parsed.data.pattern);
            if (patternType)
                return patternType;
            return null;
        }
        default:
            return null;
    }
}
/**
 * Check if a tool use constitutes a memory file access.
 * Detects session memory (via Read/Grep/Glob) and memdir access (via Read/Edit/Write).
 * Uses the same conditions as the PostToolUse session file access hooks.
 */
function isMemoryFileAccess(toolName, toolInput) {
    if (getSessionFileTypeFromInput(toolName, toolInput) === 'session_memory') {
        return true;
    }
    var filePath = getFilePathFromInput(toolName, toolInput);
    if (filePath &&
        ((0, memoryFileDetection_js_1.isAutoMemFile)(filePath) ||
            ((0, bun_bundle_1.feature)('TEAMMEM') && teamMemPaths.isTeamMemFile(filePath)))) {
        return true;
    }
    return false;
}
/**
 * PostToolUse callback to log session file access events.
 */
function handleSessionFileAccess(input, _toolUseID, _signal) {
    return __awaiter(this, void 0, void 0, function () {
        var fileType, subagentName, subagentProps, filePath, scope;
        return __generator(this, function (_a) {
            if (input.hook_event_name !== 'PostToolUse')
                return [2 /*return*/, {}];
            fileType = getSessionFileTypeFromInput(input.tool_name, input.tool_input);
            subagentName = (0, agentContext_js_1.getSubagentLogName)();
            subagentProps = subagentName ? { subagent_name: subagentName } : {};
            if (fileType === 'session_memory') {
                (0, index_js_1.logEvent)('tengu_session_memory_accessed', __assign({}, subagentProps));
            }
            else if (fileType === 'session_transcript') {
                (0, index_js_1.logEvent)('tengu_transcript_accessed', __assign({}, subagentProps));
            }
            filePath = getFilePathFromInput(input.tool_name, input.tool_input);
            if (filePath && (0, memoryFileDetection_js_1.isAutoMemFile)(filePath)) {
                (0, index_js_1.logEvent)('tengu_memdir_accessed', __assign({ tool: input.tool_name }, subagentProps));
                switch (input.tool_name) {
                    case prompt_js_1.FILE_READ_TOOL_NAME:
                        (0, index_js_1.logEvent)('tengu_memdir_file_read', __assign({}, subagentProps));
                        break;
                    case constants_js_1.FILE_EDIT_TOOL_NAME:
                        (0, index_js_1.logEvent)('tengu_memdir_file_edit', __assign({}, subagentProps));
                        break;
                    case prompt_js_2.FILE_WRITE_TOOL_NAME:
                        (0, index_js_1.logEvent)('tengu_memdir_file_write', __assign({}, subagentProps));
                        break;
                }
            }
            // Team memory access tracking
            if ((0, bun_bundle_1.feature)('TEAMMEM') && filePath && teamMemPaths.isTeamMemFile(filePath)) {
                (0, index_js_1.logEvent)('tengu_team_mem_accessed', __assign({ tool: input.tool_name }, subagentProps));
                switch (input.tool_name) {
                    case prompt_js_1.FILE_READ_TOOL_NAME:
                        (0, index_js_1.logEvent)('tengu_team_mem_file_read', __assign({}, subagentProps));
                        break;
                    case constants_js_1.FILE_EDIT_TOOL_NAME:
                        (0, index_js_1.logEvent)('tengu_team_mem_file_edit', __assign({}, subagentProps));
                        teamMemWatcher === null || teamMemWatcher === void 0 ? void 0 : teamMemWatcher.notifyTeamMemoryWrite();
                        break;
                    case prompt_js_2.FILE_WRITE_TOOL_NAME:
                        (0, index_js_1.logEvent)('tengu_team_mem_file_write', __assign({}, subagentProps));
                        teamMemWatcher === null || teamMemWatcher === void 0 ? void 0 : teamMemWatcher.notifyTeamMemoryWrite();
                        break;
                }
            }
            if ((0, bun_bundle_1.feature)('MEMORY_SHAPE_TELEMETRY') && filePath) {
                scope = (0, memoryFileDetection_js_1.memoryScopeForPath)(filePath);
                if (scope !== null &&
                    (input.tool_name === constants_js_1.FILE_EDIT_TOOL_NAME ||
                        input.tool_name === prompt_js_2.FILE_WRITE_TOOL_NAME)) {
                    memoryShapeTelemetry.logMemoryWriteShape(input.tool_name, input.tool_input, filePath, scope);
                }
            }
            return [2 /*return*/, {}];
        });
    });
}
/**
 * Register session file access tracking hooks.
 * Called during CLI initialization.
 */
function registerSessionFileAccessHooks() {
    var hook = {
        type: 'callback',
        callback: handleSessionFileAccess,
        timeout: 1, // Very short timeout - just logging
        internal: true,
    };
    (0, state_js_1.registerHookCallbacks)({
        PostToolUse: [
            { matcher: prompt_js_1.FILE_READ_TOOL_NAME, hooks: [hook] },
            { matcher: prompt_js_4.GREP_TOOL_NAME, hooks: [hook] },
            { matcher: prompt_js_3.GLOB_TOOL_NAME, hooks: [hook] },
            { matcher: constants_js_1.FILE_EDIT_TOOL_NAME, hooks: [hook] },
            { matcher: prompt_js_2.FILE_WRITE_TOOL_NAME, hooks: [hook] },
        ],
    });
}
