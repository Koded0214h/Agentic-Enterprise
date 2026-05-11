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
exports.getPluginSkills = exports.getPluginCommands = void 0;
exports.clearPluginCommandCache = clearPluginCommandCache;
exports.clearPluginSkillsCache = clearPluginSkillsCache;
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var plugin_js_1 = require("../../types/plugin.js");
var argumentSubstitution_js_1 = require("../argumentSubstitution.js");
var debug_js_1 = require("../debug.js");
var effort_js_1 = require("../effort.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var frontmatterParser_js_1 = require("../frontmatterParser.js");
var fsOperations_js_1 = require("../fsOperations.js");
var markdownConfigLoader_js_1 = require("../markdownConfigLoader.js");
var model_js_1 = require("../model/model.js");
var promptShellExecution_js_1 = require("../promptShellExecution.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
var pluginOptionsStorage_js_1 = require("./pluginOptionsStorage.js");
var walkPluginMarkdown_js_1 = require("./walkPluginMarkdown.js");
/**
 * Check if a file path is a skill file (SKILL.md)
 */
function isSkillFile(filePath) {
    return /^skill\.md$/i.test((0, path_1.basename)(filePath));
}
/**
 * Get command name from file path, handling both regular files and skills
 */
function getCommandNameFromFile(filePath, baseDir, pluginName) {
    var isSkill = isSkillFile(filePath);
    if (isSkill) {
        // For skills, use the parent directory name
        var skillDirectory = (0, path_1.dirname)(filePath);
        var parentOfSkillDir = (0, path_1.dirname)(skillDirectory);
        var commandBaseName = (0, path_1.basename)(skillDirectory);
        // Build namespace from parent of skill directory
        var relativePath = parentOfSkillDir.startsWith(baseDir)
            ? parentOfSkillDir.slice(baseDir.length).replace(/^\//, '')
            : '';
        var namespace = relativePath ? relativePath.split('/').join(':') : '';
        return namespace
            ? "".concat(pluginName, ":").concat(namespace, ":").concat(commandBaseName)
            : "".concat(pluginName, ":").concat(commandBaseName);
    }
    else {
        // For regular files, use filename without .md
        var fileDirectory = (0, path_1.dirname)(filePath);
        var commandBaseName = (0, path_1.basename)(filePath).replace(/\.md$/, '');
        // Build namespace from file directory
        var relativePath = fileDirectory.startsWith(baseDir)
            ? fileDirectory.slice(baseDir.length).replace(/^\//, '')
            : '';
        var namespace = relativePath ? relativePath.split('/').join(':') : '';
        return namespace
            ? "".concat(pluginName, ":").concat(namespace, ":").concat(commandBaseName)
            : "".concat(pluginName, ":").concat(commandBaseName);
    }
}
/**
 * Recursively collects all markdown files from a directory
 */
function collectMarkdownFiles(dirPath, baseDir, loadedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var files, fs;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = [];
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, (0, walkPluginMarkdown_js_1.walkPluginMarkdown)(dirPath, function (fullPath) { return __awaiter(_this, void 0, void 0, function () {
                            var content, _a, frontmatter, markdownContent;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if ((0, fsOperations_js_1.isDuplicatePath)(fs, fullPath, loadedPaths))
                                            return [2 /*return*/];
                                        return [4 /*yield*/, fs.readFile(fullPath, { encoding: 'utf-8' })];
                                    case 1:
                                        content = _b.sent();
                                        _a = (0, frontmatterParser_js_1.parseFrontmatter)(content, fullPath), frontmatter = _a.frontmatter, markdownContent = _a.content;
                                        files.push({
                                            filePath: fullPath,
                                            baseDir: baseDir,
                                            frontmatter: frontmatter,
                                            content: markdownContent,
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); }, { stopAtSkillDir: true, logLabel: 'commands' })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, files];
            }
        });
    });
}
/**
 * Transforms plugin markdown files to handle skill directories
 */
function transformPluginSkillFiles(files) {
    var _a;
    var filesByDir = new Map();
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var dir = (0, path_1.dirname)(file.filePath);
        var dirFiles = (_a = filesByDir.get(dir)) !== null && _a !== void 0 ? _a : [];
        dirFiles.push(file);
        filesByDir.set(dir, dirFiles);
    }
    var result = [];
    for (var _b = 0, filesByDir_1 = filesByDir; _b < filesByDir_1.length; _b++) {
        var _c = filesByDir_1[_b], dir = _c[0], dirFiles = _c[1];
        var skillFiles = dirFiles.filter(function (f) { return isSkillFile(f.filePath); });
        if (skillFiles.length > 0) {
            // Use the first skill file if multiple exist
            var skillFile = skillFiles[0];
            if (skillFiles.length > 1) {
                (0, debug_js_1.logForDebugging)("Multiple skill files found in ".concat(dir, ", using ").concat((0, path_1.basename)(skillFile.filePath)));
            }
            // Directory has a skill - only include the skill file
            result.push(skillFile);
        }
        else {
            result.push.apply(result, dirFiles);
        }
    }
    return result;
}
function loadCommandsFromDirectory(commandsPath_1, pluginName_1, sourceName_1, pluginManifest_1, pluginPath_1) {
    return __awaiter(this, arguments, void 0, function (commandsPath, pluginName, sourceName, pluginManifest, pluginPath, config, loadedPaths) {
        var markdownFiles, processedFiles, commands, _i, processedFiles_1, file, commandName, command;
        if (config === void 0) { config = { isSkillMode: false }; }
        if (loadedPaths === void 0) { loadedPaths = new Set(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, collectMarkdownFiles(commandsPath, commandsPath, loadedPaths)
                    // Apply skill transformation
                ];
                case 1:
                    markdownFiles = _a.sent();
                    processedFiles = transformPluginSkillFiles(markdownFiles);
                    commands = [];
                    for (_i = 0, processedFiles_1 = processedFiles; _i < processedFiles_1.length; _i++) {
                        file = processedFiles_1[_i];
                        commandName = getCommandNameFromFile(file.filePath, file.baseDir, pluginName);
                        command = createPluginCommand(commandName, file, sourceName, pluginManifest, pluginPath, isSkillFile(file.filePath), config);
                        if (command) {
                            commands.push(command);
                        }
                    }
                    return [2 /*return*/, commands];
            }
        });
    });
}
/**
 * Create a Command from a plugin markdown file
 */
function createPluginCommand(commandName, file, sourceName, pluginManifest, pluginPath, isSkill, config) {
    if (config === void 0) { config = { isSkillMode: false }; }
    try {
        var frontmatter = file.frontmatter, content_1 = file.content;
        var validatedDescription = (0, frontmatterParser_js_1.coerceDescriptionToString)(frontmatter.description, commandName);
        var description = validatedDescription !== null && validatedDescription !== void 0 ? validatedDescription : (0, markdownConfigLoader_js_1.extractDescriptionFromMarkdown)(content_1, isSkill ? 'Plugin skill' : 'Plugin command');
        // Substitute ${CLAUDE_PLUGIN_ROOT} in allowed-tools before parsing
        var rawAllowedTools = frontmatter['allowed-tools'];
        var substitutedAllowedTools = typeof rawAllowedTools === 'string'
            ? (0, pluginOptionsStorage_js_1.substitutePluginVariables)(rawAllowedTools, {
                path: pluginPath,
                source: sourceName,
            })
            : Array.isArray(rawAllowedTools)
                ? rawAllowedTools.map(function (tool) {
                    return typeof tool === 'string'
                        ? (0, pluginOptionsStorage_js_1.substitutePluginVariables)(tool, {
                            path: pluginPath,
                            source: sourceName,
                        })
                        : tool;
                })
                : rawAllowedTools;
        var allowedTools_1 = (0, markdownConfigLoader_js_1.parseSlashCommandToolsFromFrontmatter)(substitutedAllowedTools);
        var argumentHint = frontmatter['argument-hint'];
        var argumentNames_1 = (0, argumentSubstitution_js_1.parseArgumentNames)(frontmatter.arguments);
        var whenToUse = frontmatter.when_to_use;
        var version = frontmatter.version;
        var displayName_1 = frontmatter.name;
        // Handle model configuration, resolving aliases like 'haiku', 'sonnet', 'opus'
        var model = frontmatter.model === 'inherit'
            ? undefined
            : frontmatter.model
                ? (0, model_js_1.parseUserSpecifiedModel)(frontmatter.model)
                : undefined;
        var effortRaw = frontmatter['effort'];
        var effort = effortRaw !== undefined ? (0, effort_js_1.parseEffortValue)(effortRaw) : undefined;
        if (effortRaw !== undefined && effort === undefined) {
            (0, debug_js_1.logForDebugging)("Plugin command ".concat(commandName, " has invalid effort '").concat(effortRaw, "'. Valid options: ").concat(effort_js_1.EFFORT_LEVELS.join(', '), " or an integer"));
        }
        var disableModelInvocation = (0, frontmatterParser_js_1.parseBooleanFrontmatter)(frontmatter['disable-model-invocation']);
        var userInvocableValue = frontmatter['user-invocable'];
        var userInvocable = userInvocableValue === undefined
            ? true
            : (0, frontmatterParser_js_1.parseBooleanFrontmatter)(userInvocableValue);
        var shell_1 = (0, frontmatterParser_js_1.parseShellFrontmatter)(frontmatter.shell, commandName);
        return {
            type: 'prompt',
            name: commandName,
            description: description,
            hasUserSpecifiedDescription: validatedDescription !== null,
            allowedTools: allowedTools_1,
            argumentHint: argumentHint,
            argNames: argumentNames_1.length > 0 ? argumentNames_1 : undefined,
            whenToUse: whenToUse,
            version: version,
            model: model,
            effort: effort,
            disableModelInvocation: disableModelInvocation,
            userInvocable: userInvocable,
            contentLength: content_1.length,
            source: 'plugin',
            loadedFrom: isSkill || config.isSkillMode ? 'plugin' : undefined,
            pluginInfo: {
                pluginManifest: pluginManifest,
                repository: sourceName,
            },
            isHidden: !userInvocable,
            progressMessage: isSkill || config.isSkillMode ? 'loading' : 'running',
            userFacingName: function () {
                return displayName_1 || commandName;
            },
            getPromptForCommand: function (args, context) {
                return __awaiter(this, void 0, void 0, function () {
                    var finalContent, rawSkillDir, skillDir;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                finalContent = config.isSkillMode
                                    ? "Base directory for this skill: ".concat((0, path_1.dirname)(file.filePath), "\n\n").concat(content_1)
                                    : content_1;
                                finalContent = (0, argumentSubstitution_js_1.substituteArguments)(finalContent, args, true, argumentNames_1);
                                // Replace ${CLAUDE_PLUGIN_ROOT} and ${CLAUDE_PLUGIN_DATA} with their paths
                                finalContent = (0, pluginOptionsStorage_js_1.substitutePluginVariables)(finalContent, {
                                    path: pluginPath,
                                    source: sourceName,
                                });
                                // Replace ${user_config.X} with saved option values. Sensitive keys
                                // resolve to a descriptive placeholder instead — skill content goes to
                                // the model prompt and we don't put secrets there.
                                if (pluginManifest.userConfig) {
                                    finalContent = (0, pluginOptionsStorage_js_1.substituteUserConfigInContent)(finalContent, (0, pluginOptionsStorage_js_1.loadPluginOptions)(sourceName), pluginManifest.userConfig);
                                }
                                // Replace ${CLAUDE_SKILL_DIR} with this specific skill's directory.
                                // Distinct from ${CLAUDE_PLUGIN_ROOT}: a plugin can contain multiple
                                // skills, so CLAUDE_PLUGIN_ROOT points to the plugin root while
                                // CLAUDE_SKILL_DIR points to the individual skill's subdirectory.
                                if (config.isSkillMode) {
                                    rawSkillDir = (0, path_1.dirname)(file.filePath);
                                    skillDir = process.platform === 'win32'
                                        ? rawSkillDir.replace(/\\/g, '/')
                                        : rawSkillDir;
                                    finalContent = finalContent.replace(/\$\{CLAUDE_SKILL_DIR\}/g, skillDir);
                                }
                                // Replace ${CLAUDE_SESSION_ID} with the current session ID
                                finalContent = finalContent.replace(/\$\{CLAUDE_SESSION_ID\}/g, (0, state_js_1.getSessionId)());
                                return [4 /*yield*/, (0, promptShellExecution_js_1.executeShellCommandsInPrompt)(finalContent, __assign(__assign({}, context), { getAppState: function () {
                                            var appState = context.getAppState();
                                            return __assign(__assign({}, appState), { toolPermissionContext: __assign(__assign({}, appState.toolPermissionContext), { alwaysAllowRules: __assign(__assign({}, appState.toolPermissionContext.alwaysAllowRules), { command: allowedTools_1 }) }) });
                                        } }), "/".concat(commandName), shell_1)];
                            case 1:
                                finalContent = _a.sent();
                                return [2 /*return*/, [{ type: 'text', text: finalContent }]];
                        }
                    });
                });
            },
        };
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to create command from ".concat(file.filePath, ": ").concat(error), {
            level: 'error',
        });
        return null;
    }
}
exports.getPluginCommands = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, enabled, errors, perPluginCommands, allCommands;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // --bare: skip marketplace plugin auto-load. Explicit --plugin-dir still
                // works — getInlinePlugins() is set by main.tsx from --plugin-dir.
                // loadAllPluginsCacheOnly already short-circuits to inline-only when
                // inlinePlugins.length > 0.
                if ((0, envUtils_js_1.isBareMode)() && (0, state_js_1.getInlinePlugins)().length === 0) {
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()];
            case 1:
                _a = _b.sent(), enabled = _a.enabled, errors = _a.errors;
                if (errors.length > 0) {
                    (0, debug_js_1.logForDebugging)("Plugin loading errors: ".concat(errors.map(function (e) { return (0, plugin_js_1.getPluginErrorMessage)(e); }).join(', ')));
                }
                return [4 /*yield*/, Promise.all(enabled.map(function (plugin) { return __awaiter(void 0, void 0, void 0, function () {
                        var loadedPaths, pluginCommands, commands, error_1, pathResults, _i, pathResults_1, commands, _a, _b, _c, name_1, metadata, _d, frontmatter, markdownContent, finalFrontmatter, commandName, file, command;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    loadedPaths = new Set();
                                    pluginCommands = [];
                                    if (!plugin.commandsPath) return [3 /*break*/, 4];
                                    _e.label = 1;
                                case 1:
                                    _e.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, loadCommandsFromDirectory(plugin.commandsPath, plugin.name, plugin.source, plugin.manifest, plugin.path, { isSkillMode: false }, loadedPaths)];
                                case 2:
                                    commands = _e.sent();
                                    pluginCommands.push.apply(pluginCommands, commands);
                                    if (commands.length > 0) {
                                        (0, debug_js_1.logForDebugging)("Loaded ".concat(commands.length, " commands from plugin ").concat(plugin.name, " default directory"));
                                    }
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _e.sent();
                                    (0, debug_js_1.logForDebugging)("Failed to load commands from plugin ".concat(plugin.name, " default directory: ").concat(error_1), { level: 'error' });
                                    return [3 /*break*/, 4];
                                case 4:
                                    if (!plugin.commandsPaths) return [3 /*break*/, 6];
                                    (0, debug_js_1.logForDebugging)("Plugin ".concat(plugin.name, " has commandsPaths: ").concat(plugin.commandsPaths.join(', ')));
                                    return [4 /*yield*/, Promise.all(plugin.commandsPaths.map(function (commandPath) { return __awaiter(void 0, void 0, void 0, function () {
                                            var fs, stats, commands, content, _a, frontmatter, markdownContent, commandName, metadataOverride, _i, _b, _c, name_2, metadata, fullMetadataPath, finalFrontmatter, file, command, error_2;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        _d.trys.push([0, 6, , 7]);
                                                        fs = (0, fsOperations_js_1.getFsImplementation)();
                                                        return [4 /*yield*/, fs.stat(commandPath)];
                                                    case 1:
                                                        stats = _d.sent();
                                                        (0, debug_js_1.logForDebugging)("Checking commandPath ".concat(commandPath, " - isDirectory: ").concat(stats.isDirectory(), ", isFile: ").concat(stats.isFile()));
                                                        if (!stats.isDirectory()) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, loadCommandsFromDirectory(commandPath, plugin.name, plugin.source, plugin.manifest, plugin.path, { isSkillMode: false }, loadedPaths)];
                                                    case 2:
                                                        commands = _d.sent();
                                                        if (commands.length > 0) {
                                                            (0, debug_js_1.logForDebugging)("Loaded ".concat(commands.length, " commands from plugin ").concat(plugin.name, " custom path: ").concat(commandPath));
                                                        }
                                                        else {
                                                            (0, debug_js_1.logForDebugging)("Warning: No commands found in plugin ".concat(plugin.name, " custom directory: ").concat(commandPath, ". Expected .md files or SKILL.md in subdirectories."), { level: 'warn' });
                                                        }
                                                        return [2 /*return*/, commands];
                                                    case 3:
                                                        if (!(stats.isFile() && commandPath.endsWith('.md'))) return [3 /*break*/, 5];
                                                        if ((0, fsOperations_js_1.isDuplicatePath)(fs, commandPath, loadedPaths)) {
                                                            return [2 /*return*/, []];
                                                        }
                                                        return [4 /*yield*/, fs.readFile(commandPath, {
                                                                encoding: 'utf-8',
                                                            })];
                                                    case 4:
                                                        content = _d.sent();
                                                        _a = (0, frontmatterParser_js_1.parseFrontmatter)(content, commandPath), frontmatter = _a.frontmatter, markdownContent = _a.content;
                                                        commandName = void 0;
                                                        metadataOverride = void 0;
                                                        if (plugin.commandsMetadata) {
                                                            // Find metadata by matching the command's absolute path to the metadata source
                                                            // Convert metadata.source (relative to plugin root) to absolute path for comparison
                                                            for (_i = 0, _b = Object.entries(plugin.commandsMetadata); _i < _b.length; _i++) {
                                                                _c = _b[_i], name_2 = _c[0], metadata = _c[1];
                                                                if (metadata.source) {
                                                                    fullMetadataPath = (0, path_1.join)(plugin.path, metadata.source);
                                                                    if (commandPath === fullMetadataPath) {
                                                                        commandName = "".concat(plugin.name, ":").concat(name_2);
                                                                        metadataOverride = metadata;
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        // Fall back to filename-based naming if no metadata
                                                        if (!commandName) {
                                                            commandName = "".concat(plugin.name, ":").concat((0, path_1.basename)(commandPath).replace(/\.md$/, ''));
                                                        }
                                                        finalFrontmatter = metadataOverride
                                                            ? __assign(__assign(__assign(__assign(__assign({}, frontmatter), (metadataOverride.description && {
                                                                description: metadataOverride.description,
                                                            })), (metadataOverride.argumentHint && {
                                                                'argument-hint': metadataOverride.argumentHint,
                                                            })), (metadataOverride.model && {
                                                                model: metadataOverride.model,
                                                            })), (metadataOverride.allowedTools && {
                                                                'allowed-tools': metadataOverride.allowedTools.join(','),
                                                            })) : frontmatter;
                                                        file = {
                                                            filePath: commandPath,
                                                            baseDir: (0, path_1.dirname)(commandPath),
                                                            frontmatter: finalFrontmatter,
                                                            content: markdownContent,
                                                        };
                                                        command = createPluginCommand(commandName, file, plugin.source, plugin.manifest, plugin.path, false);
                                                        if (command) {
                                                            (0, debug_js_1.logForDebugging)("Loaded command from plugin ".concat(plugin.name, " custom file: ").concat(commandPath).concat(metadataOverride ? ' (with metadata override)' : ''));
                                                            return [2 /*return*/, [command]];
                                                        }
                                                        _d.label = 5;
                                                    case 5: return [2 /*return*/, []];
                                                    case 6:
                                                        error_2 = _d.sent();
                                                        (0, debug_js_1.logForDebugging)("Failed to load commands from plugin ".concat(plugin.name, " custom path ").concat(commandPath, ": ").concat(error_2), { level: 'error' });
                                                        return [2 /*return*/, []];
                                                    case 7: return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                case 5:
                                    pathResults = _e.sent();
                                    for (_i = 0, pathResults_1 = pathResults; _i < pathResults_1.length; _i++) {
                                        commands = pathResults_1[_i];
                                        pluginCommands.push.apply(pluginCommands, commands);
                                    }
                                    _e.label = 6;
                                case 6:
                                    // Load commands with inline content (no source file)
                                    // Note: Commands with source files were already loaded in the previous loop
                                    // when iterating through commandsPaths. This loop handles metadata entries
                                    // that specify inline content instead of file references.
                                    if (plugin.commandsMetadata) {
                                        for (_a = 0, _b = Object.entries(plugin.commandsMetadata); _a < _b.length; _a++) {
                                            _c = _b[_a], name_1 = _c[0], metadata = _c[1];
                                            // Only process entries with inline content (no source)
                                            if (metadata.content && !metadata.source) {
                                                try {
                                                    _d = (0, frontmatterParser_js_1.parseFrontmatter)(metadata.content, "<inline:".concat(plugin.name, ":").concat(name_1, ">")), frontmatter = _d.frontmatter, markdownContent = _d.content;
                                                    finalFrontmatter = __assign(__assign(__assign(__assign(__assign({}, frontmatter), (metadata.description && {
                                                        description: metadata.description,
                                                    })), (metadata.argumentHint && {
                                                        'argument-hint': metadata.argumentHint,
                                                    })), (metadata.model && {
                                                        model: metadata.model,
                                                    })), (metadata.allowedTools && {
                                                        'allowed-tools': metadata.allowedTools.join(','),
                                                    }));
                                                    commandName = "".concat(plugin.name, ":").concat(name_1);
                                                    file = {
                                                        filePath: "<inline:".concat(commandName, ">"), // Virtual path for inline content
                                                        baseDir: plugin.path, // Use plugin root as base directory
                                                        frontmatter: finalFrontmatter,
                                                        content: markdownContent,
                                                    };
                                                    command = createPluginCommand(commandName, file, plugin.source, plugin.manifest, plugin.path, false);
                                                    if (command) {
                                                        pluginCommands.push(command);
                                                        (0, debug_js_1.logForDebugging)("Loaded inline content command from plugin ".concat(plugin.name, ": ").concat(commandName));
                                                    }
                                                }
                                                catch (error) {
                                                    (0, debug_js_1.logForDebugging)("Failed to load inline content command ".concat(name_1, " from plugin ").concat(plugin.name, ": ").concat(error), { level: 'error' });
                                                }
                                            }
                                        }
                                    }
                                    return [2 /*return*/, pluginCommands];
                            }
                        });
                    }); }))];
            case 2:
                perPluginCommands = _b.sent();
                allCommands = perPluginCommands.flat();
                (0, debug_js_1.logForDebugging)("Total plugin commands loaded: ".concat(allCommands.length));
                return [2 /*return*/, allCommands];
        }
    });
}); });
function clearPluginCommandCache() {
    var _a, _b;
    (_b = (_a = exports.getPluginCommands.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Loads skills from plugin skills directories
 * Skills are directories containing SKILL.md files
 */
function loadSkillsFromDirectory(skillsPath, pluginName, sourceName, pluginManifest, pluginPath, loadedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, skills, directSkillPath, directSkillContent, e_1, _a, frontmatter, markdownContent, skillName, file, skill, entries, e_2;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    skills = [];
                    directSkillPath = (0, path_1.join)(skillsPath, 'SKILL.md');
                    directSkillContent = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(directSkillPath, {
                            encoding: 'utf-8',
                        })];
                case 2:
                    directSkillContent = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    if (!(0, errors_js_1.isENOENT)(e_1)) {
                        (0, debug_js_1.logForDebugging)("Failed to load skill from ".concat(directSkillPath, ": ").concat(e_1), {
                            level: 'error',
                        });
                        return [2 /*return*/, skills];
                    }
                    return [3 /*break*/, 4];
                case 4:
                    if (directSkillContent !== null) {
                        // This is a direct skill directory, load the skill from here
                        if ((0, fsOperations_js_1.isDuplicatePath)(fs, directSkillPath, loadedPaths)) {
                            return [2 /*return*/, skills];
                        }
                        try {
                            _a = (0, frontmatterParser_js_1.parseFrontmatter)(directSkillContent, directSkillPath), frontmatter = _a.frontmatter, markdownContent = _a.content;
                            skillName = "".concat(pluginName, ":").concat((0, path_1.basename)(skillsPath));
                            file = {
                                filePath: directSkillPath,
                                baseDir: (0, path_1.dirname)(directSkillPath),
                                frontmatter: frontmatter,
                                content: markdownContent,
                            };
                            skill = createPluginCommand(skillName, file, sourceName, pluginManifest, pluginPath, true, // isSkill
                            { isSkillMode: true });
                            if (skill) {
                                skills.push(skill);
                            }
                        }
                        catch (error) {
                            (0, debug_js_1.logForDebugging)("Failed to load skill from ".concat(directSkillPath, ": ").concat(error), {
                                level: 'error',
                            });
                        }
                        return [2 /*return*/, skills];
                    }
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, fs.readdir(skillsPath)];
                case 6:
                    entries = _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_2 = _b.sent();
                    if (!(0, errors_js_1.isENOENT)(e_2)) {
                        (0, debug_js_1.logForDebugging)("Failed to load skills from directory ".concat(skillsPath, ": ").concat(e_2), { level: 'error' });
                    }
                    return [2 /*return*/, skills];
                case 8: return [4 /*yield*/, Promise.all(entries.map(function (entry) { return __awaiter(_this, void 0, void 0, function () {
                        var skillDirPath, skillFilePath, content, e_3, _a, frontmatter, markdownContent, skillName, file, skill;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    // Accept both directories and symlinks (symlinks may point to skill directories)
                                    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
                                        return [2 /*return*/];
                                    }
                                    skillDirPath = (0, path_1.join)(skillsPath, entry.name);
                                    skillFilePath = (0, path_1.join)(skillDirPath, 'SKILL.md');
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, fs.readFile(skillFilePath, { encoding: 'utf-8' })];
                                case 2:
                                    content = _b.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_3 = _b.sent();
                                    if (!(0, errors_js_1.isENOENT)(e_3)) {
                                        (0, debug_js_1.logForDebugging)("Failed to load skill from ".concat(skillFilePath, ": ").concat(e_3), {
                                            level: 'error',
                                        });
                                    }
                                    return [2 /*return*/];
                                case 4:
                                    if ((0, fsOperations_js_1.isDuplicatePath)(fs, skillFilePath, loadedPaths)) {
                                        return [2 /*return*/];
                                    }
                                    try {
                                        _a = (0, frontmatterParser_js_1.parseFrontmatter)(content, skillFilePath), frontmatter = _a.frontmatter, markdownContent = _a.content;
                                        skillName = "".concat(pluginName, ":").concat(entry.name);
                                        file = {
                                            filePath: skillFilePath,
                                            baseDir: (0, path_1.dirname)(skillFilePath),
                                            frontmatter: frontmatter,
                                            content: markdownContent,
                                        };
                                        skill = createPluginCommand(skillName, file, sourceName, pluginManifest, pluginPath, true, // isSkill
                                        { isSkillMode: true });
                                        if (skill) {
                                            skills.push(skill);
                                        }
                                    }
                                    catch (error) {
                                        (0, debug_js_1.logForDebugging)("Failed to load skill from ".concat(skillFilePath, ": ").concat(error), { level: 'error' });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 9:
                    _b.sent();
                    return [2 /*return*/, skills];
            }
        });
    });
}
exports.getPluginSkills = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, enabled, errors, perPluginSkills, allSkills;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // --bare: same gate as getPluginCommands above — honor explicit
                // --plugin-dir, skip marketplace auto-load.
                if ((0, envUtils_js_1.isBareMode)() && (0, state_js_1.getInlinePlugins)().length === 0) {
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()];
            case 1:
                _a = _b.sent(), enabled = _a.enabled, errors = _a.errors;
                if (errors.length > 0) {
                    (0, debug_js_1.logForDebugging)("Plugin loading errors: ".concat(errors.map(function (e) { return (0, plugin_js_1.getPluginErrorMessage)(e); }).join(', ')));
                }
                (0, debug_js_1.logForDebugging)("getPluginSkills: Processing ".concat(enabled.length, " enabled plugins"));
                return [4 /*yield*/, Promise.all(enabled.map(function (plugin) { return __awaiter(void 0, void 0, void 0, function () {
                        var loadedPaths, pluginSkills, skills, error_3, pathResults, _i, pathResults_2, skills;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    loadedPaths = new Set();
                                    pluginSkills = [];
                                    (0, debug_js_1.logForDebugging)("Checking plugin ".concat(plugin.name, ": skillsPath=").concat(plugin.skillsPath ? 'exists' : 'none', ", skillsPaths=").concat(plugin.skillsPaths ? plugin.skillsPaths.length : 0, " paths"));
                                    if (!plugin.skillsPath) return [3 /*break*/, 4];
                                    (0, debug_js_1.logForDebugging)("Attempting to load skills from plugin ".concat(plugin.name, " default skillsPath: ").concat(plugin.skillsPath));
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, loadSkillsFromDirectory(plugin.skillsPath, plugin.name, plugin.source, plugin.manifest, plugin.path, loadedPaths)];
                                case 2:
                                    skills = _a.sent();
                                    pluginSkills.push.apply(pluginSkills, skills);
                                    (0, debug_js_1.logForDebugging)("Loaded ".concat(skills.length, " skills from plugin ").concat(plugin.name, " default directory"));
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_3 = _a.sent();
                                    (0, debug_js_1.logForDebugging)("Failed to load skills from plugin ".concat(plugin.name, " default directory: ").concat(error_3), { level: 'error' });
                                    return [3 /*break*/, 4];
                                case 4:
                                    if (!plugin.skillsPaths) return [3 /*break*/, 6];
                                    (0, debug_js_1.logForDebugging)("Attempting to load skills from plugin ".concat(plugin.name, " skillsPaths: ").concat(plugin.skillsPaths.join(', ')));
                                    return [4 /*yield*/, Promise.all(plugin.skillsPaths.map(function (skillPath) { return __awaiter(void 0, void 0, void 0, function () {
                                            var skills, error_4;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        (0, debug_js_1.logForDebugging)("Loading from skillPath: ".concat(skillPath, " for plugin ").concat(plugin.name));
                                                        return [4 /*yield*/, loadSkillsFromDirectory(skillPath, plugin.name, plugin.source, plugin.manifest, plugin.path, loadedPaths)];
                                                    case 1:
                                                        skills = _a.sent();
                                                        (0, debug_js_1.logForDebugging)("Loaded ".concat(skills.length, " skills from plugin ").concat(plugin.name, " custom path: ").concat(skillPath));
                                                        return [2 /*return*/, skills];
                                                    case 2:
                                                        error_4 = _a.sent();
                                                        (0, debug_js_1.logForDebugging)("Failed to load skills from plugin ".concat(plugin.name, " custom path ").concat(skillPath, ": ").concat(error_4), { level: 'error' });
                                                        return [2 /*return*/, []];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                case 5:
                                    pathResults = _a.sent();
                                    for (_i = 0, pathResults_2 = pathResults; _i < pathResults_2.length; _i++) {
                                        skills = pathResults_2[_i];
                                        pluginSkills.push.apply(pluginSkills, skills);
                                    }
                                    _a.label = 6;
                                case 6: return [2 /*return*/, pluginSkills];
                            }
                        });
                    }); }))];
            case 2:
                perPluginSkills = _b.sent();
                allSkills = perPluginSkills.flat();
                (0, debug_js_1.logForDebugging)("Total plugin skills loaded: ".concat(allSkills.length));
                return [2 /*return*/, allSkills];
        }
    });
}); });
function clearPluginSkillsCache() {
    var _a, _b;
    (_b = (_a = exports.getPluginSkills.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
