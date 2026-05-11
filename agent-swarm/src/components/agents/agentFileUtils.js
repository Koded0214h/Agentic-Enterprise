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
exports.formatAgentAsMarkdown = formatAgentAsMarkdown;
exports.getNewAgentFilePath = getNewAgentFilePath;
exports.getActualAgentFilePath = getActualAgentFilePath;
exports.getNewRelativeAgentFilePath = getNewRelativeAgentFilePath;
exports.getActualRelativeAgentFilePath = getActualRelativeAgentFilePath;
exports.saveAgentToFile = saveAgentToFile;
exports.updateAgentFile = updateAgentFile;
exports.deleteAgentFromFile = deleteAgentFromFile;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var managedPath_js_1 = require("src/utils/settings/managedPath.js");
var loadAgentsDir_js_1 = require("../../tools/AgentTool/loadAgentsDir.js");
var cwd_js_1 = require("../../utils/cwd.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var types_js_1 = require("./types.js");
/**
 * Formats agent data as markdown file content
 */
function formatAgentAsMarkdown(agentType, whenToUse, tools, systemPrompt, color, model, memory, effort) {
    // For YAML double-quoted strings, we need to escape:
    // - Backslashes: \ -> \\
    // - Double quotes: " -> \"
    // - Newlines: \n -> \\n (so yaml reads it as literal backslash-n, not newline)
    var escapedWhenToUse = whenToUse
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/"/g, '\\"') // Escape double quotes
        .replace(/\n/g, '\\\\n'); // Escape newlines as \\n so yaml preserves them as \n
    // Omit tools field entirely when tools is undefined or ['*'] (all tools allowed)
    var isAllTools = tools === undefined || (tools.length === 1 && tools[0] === '*');
    var toolsLine = isAllTools ? '' : "\ntools: ".concat(tools.join(', '));
    var modelLine = model ? "\nmodel: ".concat(model) : '';
    var effortLine = effort !== undefined ? "\neffort: ".concat(effort) : '';
    var colorLine = color ? "\ncolor: ".concat(color) : '';
    var memoryLine = memory ? "\nmemory: ".concat(memory) : '';
    return "---\nname: ".concat(agentType, "\ndescription: \"").concat(escapedWhenToUse, "\"").concat(toolsLine).concat(modelLine).concat(effortLine).concat(colorLine).concat(memoryLine, "\n---\n\n").concat(systemPrompt, "\n");
}
/**
 * Gets the directory path for an agent location
 */
function getAgentDirectoryPath(location) {
    switch (location) {
        case 'flagSettings':
            throw new Error("Cannot get directory path for ".concat(location, " agents"));
        case 'userSettings':
            return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), types_js_1.AGENT_PATHS.AGENTS_DIR);
        case 'projectSettings':
            return (0, path_1.join)((0, cwd_js_1.getCwd)(), types_js_1.AGENT_PATHS.FOLDER_NAME, types_js_1.AGENT_PATHS.AGENTS_DIR);
        case 'policySettings':
            return (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), types_js_1.AGENT_PATHS.FOLDER_NAME, types_js_1.AGENT_PATHS.AGENTS_DIR);
        case 'localSettings':
            return (0, path_1.join)((0, cwd_js_1.getCwd)(), types_js_1.AGENT_PATHS.FOLDER_NAME, types_js_1.AGENT_PATHS.AGENTS_DIR);
    }
}
function getRelativeAgentDirectoryPath(location) {
    switch (location) {
        case 'projectSettings':
            return (0, path_1.join)('.', types_js_1.AGENT_PATHS.FOLDER_NAME, types_js_1.AGENT_PATHS.AGENTS_DIR);
        default:
            return getAgentDirectoryPath(location);
    }
}
/**
 * Gets the file path for a new agent based on its name
 * Used when creating new agent files
 */
function getNewAgentFilePath(agent) {
    var dirPath = getAgentDirectoryPath(agent.source);
    return (0, path_1.join)(dirPath, "".concat(agent.agentType, ".md"));
}
/**
 * Gets the actual file path for an agent (handles filename vs agentType mismatch)
 * Always use this for existing agents to get their real file location
 */
function getActualAgentFilePath(agent) {
    if (agent.source === 'built-in') {
        return 'Built-in';
    }
    if (agent.source === 'plugin') {
        throw new Error('Cannot get file path for plugin agents');
    }
    var dirPath = getAgentDirectoryPath(agent.source);
    var filename = agent.filename || agent.agentType;
    return (0, path_1.join)(dirPath, "".concat(filename, ".md"));
}
/**
 * Gets the relative file path for a new agent based on its name
 * Used for displaying where new agent files will be created
 */
function getNewRelativeAgentFilePath(agent) {
    if (agent.source === 'built-in') {
        return 'Built-in';
    }
    var dirPath = getRelativeAgentDirectoryPath(agent.source);
    return (0, path_1.join)(dirPath, "".concat(agent.agentType, ".md"));
}
/**
 * Gets the actual relative file path for an agent (handles filename vs agentType mismatch)
 */
function getActualRelativeAgentFilePath(agent) {
    if ((0, loadAgentsDir_js_1.isBuiltInAgent)(agent)) {
        return 'Built-in';
    }
    if ((0, loadAgentsDir_js_1.isPluginAgent)(agent)) {
        return "Plugin: ".concat(agent.plugin || 'Unknown');
    }
    if (agent.source === 'flagSettings') {
        return 'CLI argument';
    }
    var dirPath = getRelativeAgentDirectoryPath(agent.source);
    var filename = agent.filename || agent.agentType;
    return (0, path_1.join)(dirPath, "".concat(filename, ".md"));
}
/**
 * Ensures the directory for an agent location exists
 */
function ensureAgentDirectoryExists(source) {
    return __awaiter(this, void 0, void 0, function () {
        var dirPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirPath = getAgentDirectoryPath(source);
                    return [4 /*yield*/, (0, promises_1.mkdir)(dirPath, { recursive: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, dirPath];
            }
        });
    });
}
/**
 * Saves an agent to the filesystem
 * @param checkExists - If true, throws error if file already exists
 */
function saveAgentToFile(source_1, agentType_1, whenToUse_1, tools_1, systemPrompt_1) {
    return __awaiter(this, arguments, void 0, function (source, agentType, whenToUse, tools, systemPrompt, checkExists, color, model, memory, effort) {
        var filePath, content, e_1;
        if (checkExists === void 0) { checkExists = true; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (source === 'built-in') {
                        throw new Error('Cannot save built-in agents');
                    }
                    return [4 /*yield*/, ensureAgentDirectoryExists(source)];
                case 1:
                    _a.sent();
                    filePath = getNewAgentFilePath({ source: source, agentType: agentType });
                    content = formatAgentAsMarkdown(agentType, whenToUse, tools, systemPrompt, color, model, memory, effort);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, writeFileAndFlush(filePath, content, checkExists ? 'wx' : 'w')];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.getErrnoCode)(e_1) === 'EEXIST') {
                        throw new Error("Agent file already exists: ".concat(filePath));
                    }
                    throw e_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Updates an existing agent file
 */
function updateAgentFile(agent, newWhenToUse, newTools, newSystemPrompt, newColor, newModel, newMemory, newEffort) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (agent.source === 'built-in') {
                        throw new Error('Cannot update built-in agents');
                    }
                    filePath = getActualAgentFilePath(agent);
                    content = formatAgentAsMarkdown(agent.agentType, newWhenToUse, newTools, newSystemPrompt, newColor, newModel, newMemory, newEffort);
                    return [4 /*yield*/, writeFileAndFlush(filePath, content)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Deletes an agent file
 */
function deleteAgentFromFile(agent) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, e_2, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (agent.source === 'built-in') {
                        throw new Error('Cannot delete built-in agents');
                    }
                    filePath = getActualAgentFilePath(agent);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code !== 'ENOENT') {
                        throw e_2;
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function writeFileAndFlush(filePath_1, content_1) {
    return __awaiter(this, arguments, void 0, function (filePath, content, flag) {
        var handle;
        if (flag === void 0) { flag = 'w'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.open)(filePath, flag)];
                case 1:
                    handle = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 5, 7]);
                    return [4 /*yield*/, handle.writeFile(content, { encoding: 'utf-8' })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, handle.datasync()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, handle.close()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
