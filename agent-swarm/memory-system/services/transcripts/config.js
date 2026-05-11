"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLE_CONFIG = exports.DEFAULT_STATE_PATH = exports.DEFAULT_CONFIG_PATH = void 0;
exports.expandHomePath = expandHomePath;
exports.loadTranscriptWatchConfig = loadTranscriptWatchConfig;
exports.writeSampleConfig = writeSampleConfig;
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
exports.DEFAULT_CONFIG_PATH = (0, path_1.join)((0, os_1.homedir)(), '.claude-mem', 'transcript-watch.json');
exports.DEFAULT_STATE_PATH = (0, path_1.join)((0, os_1.homedir)(), '.claude-mem', 'transcript-watch-state.json');
var CODEX_SAMPLE_SCHEMA = {
    name: 'codex',
    version: '0.2',
    description: 'Schema for Codex session JSONL files under ~/.codex/sessions.',
    events: [
        {
            name: 'session-meta',
            match: { path: 'type', equals: 'session_meta' },
            action: 'session_context',
            fields: {
                sessionId: 'payload.id',
                cwd: 'payload.cwd'
            }
        },
        {
            name: 'turn-context',
            match: { path: 'type', equals: 'turn_context' },
            action: 'session_context',
            fields: {
                cwd: 'payload.cwd'
            }
        },
        {
            name: 'user-message',
            match: { path: 'payload.type', equals: 'user_message' },
            action: 'session_init',
            fields: {
                prompt: 'payload.message'
            }
        },
        {
            name: 'assistant-message',
            match: { path: 'payload.type', equals: 'agent_message' },
            action: 'assistant_message',
            fields: {
                message: 'payload.message'
            }
        },
        {
            name: 'tool-use',
            match: { path: 'payload.type', in: ['function_call', 'custom_tool_call', 'web_search_call'] },
            action: 'tool_use',
            fields: {
                toolId: 'payload.call_id',
                toolName: {
                    coalesce: [
                        'payload.name',
                        { value: 'web_search' }
                    ]
                },
                toolInput: {
                    coalesce: [
                        'payload.arguments',
                        'payload.input',
                        'payload.action'
                    ]
                }
            }
        },
        {
            name: 'tool-result',
            match: { path: 'payload.type', in: ['function_call_output', 'custom_tool_call_output'] },
            action: 'tool_result',
            fields: {
                toolId: 'payload.call_id',
                toolResponse: 'payload.output'
            }
        },
        {
            name: 'session-end',
            match: { path: 'payload.type', equals: 'turn_aborted' },
            action: 'session_end'
        }
    ]
};
exports.SAMPLE_CONFIG = {
    version: 1,
    schemas: {
        codex: CODEX_SAMPLE_SCHEMA
    },
    watches: [
        {
            name: 'codex',
            path: '~/.codex/sessions/**/*.jsonl',
            schema: 'codex',
            startAtEnd: true,
            context: {
                mode: 'agents',
                path: '~/.codex/AGENTS.md',
                updateOn: ['session_start', 'session_end']
            }
        }
    ],
    stateFile: exports.DEFAULT_STATE_PATH
};
function expandHomePath(inputPath) {
    if (!inputPath)
        return inputPath;
    if (inputPath.startsWith('~')) {
        return (0, path_1.join)((0, os_1.homedir)(), inputPath.slice(1));
    }
    return inputPath;
}
function loadTranscriptWatchConfig(path) {
    if (path === void 0) { path = exports.DEFAULT_CONFIG_PATH; }
    var resolvedPath = expandHomePath(path);
    if (!(0, fs_1.existsSync)(resolvedPath)) {
        throw new Error("Transcript watch config not found: ".concat(resolvedPath));
    }
    var raw = (0, fs_1.readFileSync)(resolvedPath, 'utf-8');
    var parsed = JSON.parse(raw);
    if (!parsed.version || !parsed.watches) {
        throw new Error("Invalid transcript watch config: ".concat(resolvedPath));
    }
    if (!parsed.stateFile) {
        parsed.stateFile = exports.DEFAULT_STATE_PATH;
    }
    return parsed;
}
function writeSampleConfig(path) {
    if (path === void 0) { path = exports.DEFAULT_CONFIG_PATH; }
    var resolvedPath = expandHomePath(path);
    var dir = (0, path_1.dirname)(resolvedPath);
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(resolvedPath, JSON.stringify(exports.SAMPLE_CONFIG, null, 2));
}
