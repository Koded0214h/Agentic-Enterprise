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
exports.getCommandDirCommands = exports.getSkillDirCommands = void 0;
exports.getSkillsPath = getSkillsPath;
exports.estimateSkillFrontmatterTokens = estimateSkillFrontmatterTokens;
exports.parseSkillFrontmatterFields = parseSkillFrontmatterFields;
exports.createSkillCommand = createSkillCommand;
exports.clearSkillCaches = clearSkillCaches;
exports.clearCommandCaches = clearSkillCaches;
exports.transformSkillFiles = transformSkillFiles;
exports.onDynamicSkillsLoaded = onDynamicSkillsLoaded;
exports.discoverSkillDirsForPaths = discoverSkillDirsForPaths;
exports.addSkillDirectories = addSkillDirectories;
exports.getDynamicSkills = getDynamicSkills;
exports.activateConditionalSkillsForPaths = activateConditionalSkillsForPaths;
exports.getConditionalSkillCount = getConditionalSkillCount;
exports.clearDynamicSkills = clearDynamicSkills;
var promises_1 = require("fs/promises");
var ignore_1 = require("ignore");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var argumentSubstitution_js_1 = require("../utils/argumentSubstitution.js");
var debug_js_1 = require("../utils/debug.js");
var effort_js_1 = require("../utils/effort.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var frontmatterParser_js_1 = require("../utils/frontmatterParser.js");
var fsOperations_js_1 = require("../utils/fsOperations.js");
var gitignore_js_1 = require("../utils/git/gitignore.js");
var log_js_1 = require("../utils/log.js");
var markdownConfigLoader_js_1 = require("../utils/markdownConfigLoader.js");
var model_js_1 = require("../utils/model/model.js");
var promptShellExecution_js_1 = require("../utils/promptShellExecution.js");
var constants_js_1 = require("../utils/settings/constants.js");
var managedPath_js_1 = require("../utils/settings/managedPath.js");
var pluginOnlyPolicy_js_1 = require("../utils/settings/pluginOnlyPolicy.js");
var types_js_1 = require("../utils/settings/types.js");
var signal_js_1 = require("../utils/signal.js");
var mcpSkillBuilders_js_1 = require("./mcpSkillBuilders.js");
/**
 * Returns a claude config directory path for a given source.
 */
function getSkillsPath(source, dir) {
    switch (source) {
        case 'policySettings':
            return (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), '.claude', dir);
        case 'userSettings':
            return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), dir);
        case 'projectSettings':
            return ".claude/".concat(dir);
        case 'plugin':
            return 'plugin';
        default:
            return '';
    }
}
/**
 * Estimates token count for a skill based on frontmatter only
 * (name, description, whenToUse) since full content is only loaded on invocation.
 */
function estimateSkillFrontmatterTokens(skill) {
    var frontmatterText = [skill.name, skill.description, skill.whenToUse]
        .filter(Boolean)
        .join(' ');
    return (0, tokenEstimation_js_1.roughTokenCountEstimation)(frontmatterText);
}
/**
 * Gets a unique identifier for a file by resolving symlinks to a canonical path.
 * This allows detection of duplicate files accessed through different paths
 * (e.g., via symlinks or overlapping parent directories).
 * Returns null if the file doesn't exist or can't be resolved.
 *
 * Uses realpath to resolve symlinks, which is filesystem-agnostic and avoids
 * issues with filesystems that report unreliable inode values (e.g., inode 0 on
 * some virtual/container/NFS filesystems, or precision loss on ExFAT).
 * See: https://github.com/anthropics/claude-code/issues/13893
 */
function getFileIdentity(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.realpath)(filePath)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Parse and validate hooks from frontmatter.
 * Returns undefined if hooks are not defined or invalid.
 */
function parseHooksFromFrontmatter(frontmatter, skillName) {
    if (!frontmatter.hooks) {
        return undefined;
    }
    var result = (0, types_js_1.HooksSchema)().safeParse(frontmatter.hooks);
    if (!result.success) {
        (0, debug_js_1.logForDebugging)("Invalid hooks in skill '".concat(skillName, "': ").concat(result.error.message));
        return undefined;
    }
    return result.data;
}
/**
 * Parse paths frontmatter from a skill, using the same format as CLAUDE.md rules.
 * Returns undefined if no paths are specified or if all patterns are match-all.
 */
function parseSkillPaths(frontmatter) {
    if (!frontmatter.paths) {
        return undefined;
    }
    var patterns = (0, frontmatterParser_js_1.splitPathInFrontmatter)(frontmatter.paths)
        .map(function (pattern) {
        // Remove /** suffix - ignore library treats 'path' as matching both
        // the path itself and everything inside it
        return pattern.endsWith('/**') ? pattern.slice(0, -3) : pattern;
    })
        .filter(function (p) { return p.length > 0; });
    // If all patterns are ** (match-all), treat as no paths (undefined)
    if (patterns.length === 0 || patterns.every(function (p) { return p === '**'; })) {
        return undefined;
    }
    return patterns;
}
/**
 * Parses all skill frontmatter fields that are shared between file-based and
 * MCP skill loading. Caller supplies the resolved skill name and the
 * source/loadedFrom/baseDir/paths fields separately.
 */
function parseSkillFrontmatterFields(frontmatter, markdownContent, resolvedName, descriptionFallbackLabel) {
    if (descriptionFallbackLabel === void 0) { descriptionFallbackLabel = 'Skill'; }
    var validatedDescription = (0, frontmatterParser_js_1.coerceDescriptionToString)(frontmatter.description, resolvedName);
    var description = validatedDescription !== null && validatedDescription !== void 0 ? validatedDescription : (0, markdownConfigLoader_js_1.extractDescriptionFromMarkdown)(markdownContent, descriptionFallbackLabel);
    var userInvocable = frontmatter['user-invocable'] === undefined
        ? true
        : (0, frontmatterParser_js_1.parseBooleanFrontmatter)(frontmatter['user-invocable']);
    var model = frontmatter.model === 'inherit'
        ? undefined
        : frontmatter.model
            ? (0, model_js_1.parseUserSpecifiedModel)(frontmatter.model)
            : undefined;
    var effortRaw = frontmatter['effort'];
    var effort = effortRaw !== undefined ? (0, effort_js_1.parseEffortValue)(effortRaw) : undefined;
    if (effortRaw !== undefined && effort === undefined) {
        (0, debug_js_1.logForDebugging)("Skill ".concat(resolvedName, " has invalid effort '").concat(effortRaw, "'. Valid options: ").concat(effort_js_1.EFFORT_LEVELS.join(', '), " or an integer"));
    }
    return {
        displayName: frontmatter.name != null ? String(frontmatter.name) : undefined,
        description: description,
        hasUserSpecifiedDescription: validatedDescription !== null,
        allowedTools: (0, markdownConfigLoader_js_1.parseSlashCommandToolsFromFrontmatter)(frontmatter['allowed-tools']),
        argumentHint: frontmatter['argument-hint'] != null
            ? String(frontmatter['argument-hint'])
            : undefined,
        argumentNames: (0, argumentSubstitution_js_1.parseArgumentNames)(frontmatter.arguments),
        whenToUse: frontmatter.when_to_use,
        version: frontmatter.version,
        model: model,
        disableModelInvocation: (0, frontmatterParser_js_1.parseBooleanFrontmatter)(frontmatter['disable-model-invocation']),
        userInvocable: userInvocable,
        hooks: parseHooksFromFrontmatter(frontmatter, resolvedName),
        executionContext: frontmatter.context === 'fork' ? 'fork' : undefined,
        agent: frontmatter.agent,
        effort: effort,
        shell: (0, frontmatterParser_js_1.parseShellFrontmatter)(frontmatter.shell, resolvedName),
    };
}
/**
 * Creates a skill command from parsed data
 */
function createSkillCommand(_a) {
    var skillName = _a.skillName, displayName = _a.displayName, description = _a.description, hasUserSpecifiedDescription = _a.hasUserSpecifiedDescription, markdownContent = _a.markdownContent, allowedTools = _a.allowedTools, argumentHint = _a.argumentHint, argumentNames = _a.argumentNames, whenToUse = _a.whenToUse, version = _a.version, model = _a.model, disableModelInvocation = _a.disableModelInvocation, userInvocable = _a.userInvocable, source = _a.source, baseDir = _a.baseDir, loadedFrom = _a.loadedFrom, hooks = _a.hooks, executionContext = _a.executionContext, agent = _a.agent, paths = _a.paths, effort = _a.effort, shell = _a.shell;
    return {
        type: 'prompt',
        name: skillName,
        description: description,
        hasUserSpecifiedDescription: hasUserSpecifiedDescription,
        allowedTools: allowedTools,
        argumentHint: argumentHint,
        argNames: argumentNames.length > 0 ? argumentNames : undefined,
        whenToUse: whenToUse,
        version: version,
        model: model,
        disableModelInvocation: disableModelInvocation,
        userInvocable: userInvocable,
        context: executionContext,
        agent: agent,
        effort: effort,
        paths: paths,
        contentLength: markdownContent.length,
        isHidden: !userInvocable,
        progressMessage: 'running',
        userFacingName: function () {
            return displayName || skillName;
        },
        source: source,
        loadedFrom: loadedFrom,
        hooks: hooks,
        skillRoot: baseDir,
        getPromptForCommand: function (args, toolUseContext) {
            return __awaiter(this, void 0, void 0, function () {
                var finalContent, skillDir;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            finalContent = baseDir
                                ? "Base directory for this skill: ".concat(baseDir, "\n\n").concat(markdownContent)
                                : markdownContent;
                            finalContent = (0, argumentSubstitution_js_1.substituteArguments)(finalContent, args, true, argumentNames);
                            // Replace ${CLAUDE_SKILL_DIR} with the skill's own directory so bash
                            // injection (!`...`) can reference bundled scripts. Normalize backslashes
                            // to forward slashes on Windows so shell commands don't treat them as escapes.
                            if (baseDir) {
                                skillDir = process.platform === 'win32' ? baseDir.replace(/\\/g, '/') : baseDir;
                                finalContent = finalContent.replace(/\$\{CLAUDE_SKILL_DIR\}/g, skillDir);
                            }
                            // Replace ${CLAUDE_SESSION_ID} with the current session ID
                            finalContent = finalContent.replace(/\$\{CLAUDE_SESSION_ID\}/g, (0, state_js_1.getSessionId)());
                            if (!(loadedFrom !== 'mcp')) return [3 /*break*/, 2];
                            return [4 /*yield*/, (0, promptShellExecution_js_1.executeShellCommandsInPrompt)(finalContent, __assign(__assign({}, toolUseContext), { getAppState: function () {
                                        var appState = toolUseContext.getAppState();
                                        return __assign(__assign({}, appState), { toolPermissionContext: __assign(__assign({}, appState.toolPermissionContext), { alwaysAllowRules: __assign(__assign({}, appState.toolPermissionContext.alwaysAllowRules), { command: allowedTools }) }) });
                                    } }), "/".concat(skillName), shell)];
                        case 1:
                            finalContent = _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/, [{ type: 'text', text: finalContent }]];
                    }
                });
            });
        },
    };
}
/**
 * Loads skills from a /skills/ directory path.
 * Only supports directory format: skill-name/SKILL.md
 */
function loadSkillsFromSkillsDir(basePath, source) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, entries, e_1, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readdir(basePath)];
                case 2:
                    entries = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    if (!(0, errors_js_1.isFsInaccessible)(e_1))
                        (0, log_js_1.logError)(e_1);
                    return [2 /*return*/, []];
                case 4: return [4 /*yield*/, Promise.all(entries.map(function (entry) { return __awaiter(_this, void 0, void 0, function () {
                        var skillDirPath, skillFilePath, content, e_2, _a, frontmatter, markdownContent, skillName, parsed, paths, error_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 5, , 6]);
                                    // Only support directory format: skill-name/SKILL.md
                                    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
                                        // Single .md files are NOT supported in /skills/ directory
                                        return [2 /*return*/, null];
                                    }
                                    skillDirPath = (0, path_1.join)(basePath, entry.name);
                                    skillFilePath = (0, path_1.join)(skillDirPath, 'SKILL.md');
                                    content = void 0;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, fs.readFile(skillFilePath, { encoding: 'utf-8' })];
                                case 2:
                                    content = _b.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_2 = _b.sent();
                                    // SKILL.md doesn't exist, skip this entry. Log non-ENOENT errors
                                    // (EACCES/EPERM/EIO) so permission/IO problems are diagnosable.
                                    if (!(0, errors_js_1.isENOENT)(e_2)) {
                                        (0, debug_js_1.logForDebugging)("[skills] failed to read ".concat(skillFilePath, ": ").concat(e_2), {
                                            level: 'warn',
                                        });
                                    }
                                    return [2 /*return*/, null];
                                case 4:
                                    _a = (0, frontmatterParser_js_1.parseFrontmatter)(content, skillFilePath), frontmatter = _a.frontmatter, markdownContent = _a.content;
                                    skillName = entry.name;
                                    parsed = parseSkillFrontmatterFields(frontmatter, markdownContent, skillName);
                                    paths = parseSkillPaths(frontmatter);
                                    return [2 /*return*/, {
                                            skill: createSkillCommand(__assign(__assign({}, parsed), { skillName: skillName, markdownContent: markdownContent, source: source, baseDir: skillDirPath, loadedFrom: 'skills', paths: paths })),
                                            filePath: skillFilePath,
                                        }];
                                case 5:
                                    error_1 = _b.sent();
                                    (0, log_js_1.logError)(error_1);
                                    return [2 /*return*/, null];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 5:
                    results = _a.sent();
                    return [2 /*return*/, results.filter(function (r) { return r !== null; })];
            }
        });
    });
}
// --- Legacy /commands/ loader ---
function isSkillFile(filePath) {
    return /^skill\.md$/i.test((0, path_1.basename)(filePath));
}
/**
 * Transforms markdown files to handle "skill" commands in legacy /commands/ folder.
 * When a SKILL.md file exists in a directory, only that file is loaded
 * and it takes the name of its parent directory.
 */
function transformSkillFiles(files) {
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
            var skillFile = skillFiles[0];
            if (skillFiles.length > 1) {
                (0, debug_js_1.logForDebugging)("Multiple skill files found in ".concat(dir, ", using ").concat((0, path_1.basename)(skillFile.filePath)));
            }
            result.push(skillFile);
        }
        else {
            result.push.apply(result, dirFiles);
        }
    }
    return result;
}
function buildNamespace(targetDir, baseDir) {
    var normalizedBaseDir = baseDir.endsWith(path_1.sep)
        ? baseDir.slice(0, -1)
        : baseDir;
    if (targetDir === normalizedBaseDir) {
        return '';
    }
    var relativePath = targetDir.slice(normalizedBaseDir.length + 1);
    return relativePath ? relativePath.split(path_1.sep).join(':') : '';
}
function getSkillCommandName(filePath, baseDir) {
    var skillDirectory = (0, path_1.dirname)(filePath);
    var parentOfSkillDir = (0, path_1.dirname)(skillDirectory);
    var commandBaseName = (0, path_1.basename)(skillDirectory);
    var namespace = buildNamespace(parentOfSkillDir, baseDir);
    return namespace ? "".concat(namespace, ":").concat(commandBaseName) : commandBaseName;
}
function getRegularCommandName(filePath, baseDir) {
    var fileName = (0, path_1.basename)(filePath);
    var fileDirectory = (0, path_1.dirname)(filePath);
    var commandBaseName = fileName.replace(/\.md$/, '');
    var namespace = buildNamespace(fileDirectory, baseDir);
    return namespace ? "".concat(namespace, ":").concat(commandBaseName) : commandBaseName;
}
function getCommandName(file) {
    var isSkill = isSkillFile(file.filePath);
    return isSkill
        ? getSkillCommandName(file.filePath, file.baseDir)
        : getRegularCommandName(file.filePath, file.baseDir);
}
/**
 * Loads skills from legacy /commands/ directories.
 * Supports both directory format (SKILL.md) and single .md file format.
 * Commands from /commands/ default to user-invocable: true
 */
function loadSkillsFromCommandsDir(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var markdownFiles, processedFiles, skills, _i, processedFiles_1, _a, baseDir, filePath, frontmatter, content, source, isSkillFormat, skillDirectory, cmdName, parsed, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, markdownConfigLoader_js_1.loadMarkdownFilesForSubdir)('commands', cwd)];
                case 1:
                    markdownFiles = _b.sent();
                    processedFiles = transformSkillFiles(markdownFiles);
                    skills = [];
                    for (_i = 0, processedFiles_1 = processedFiles; _i < processedFiles_1.length; _i++) {
                        _a = processedFiles_1[_i], baseDir = _a.baseDir, filePath = _a.filePath, frontmatter = _a.frontmatter, content = _a.content, source = _a.source;
                        try {
                            isSkillFormat = isSkillFile(filePath);
                            skillDirectory = isSkillFormat ? (0, path_1.dirname)(filePath) : undefined;
                            cmdName = getCommandName({
                                baseDir: baseDir,
                                filePath: filePath,
                                frontmatter: frontmatter,
                                content: content,
                                source: source,
                            });
                            parsed = parseSkillFrontmatterFields(frontmatter, content, cmdName, 'Custom command');
                            skills.push({
                                skill: createSkillCommand(__assign(__assign({}, parsed), { skillName: cmdName, displayName: undefined, markdownContent: content, source: source, baseDir: skillDirectory, loadedFrom: 'commands_DEPRECATED', paths: undefined })),
                                filePath: filePath,
                            });
                        }
                        catch (error) {
                            (0, log_js_1.logError)(error);
                        }
                    }
                    return [2 /*return*/, skills];
                case 2:
                    error_2 = _b.sent();
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Loads all skills from both /skills/ and legacy /commands/ directories.
 *
 * Skills from /skills/ directories:
 * - Only support directory format: skill-name/SKILL.md
 * - Default to user-invocable: true (can opt-out with user-invocable: false)
 *
 * Skills from legacy /commands/ directories:
 * - Support both directory format (SKILL.md) and single .md file format
 * - Default to user-invocable: true (user can type /cmd)
 *
 * @param cwd Current working directory for project directory traversal
 */
exports.getSkillDirCommands = (0, memoize_js_1.default)(function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    var userSkillsDir, managedSkillsDir, projectSkillsDirs, additionalDirs, skillsLocked, projectSettingsEnabled, additionalSkillsNested_1, _a, managedSkills, userSkills, projectSkillsNested, additionalSkillsNested, legacyCommands, allSkillsWithPaths, fileIds, seenFileIds, deduplicatedSkills, i, entry, skill, fileId, existingSource, duplicatesRemoved, unconditionalSkills, newConditionalSkills, _i, deduplicatedSkills_1, skill, _b, newConditionalSkills_1, skill;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                userSkillsDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'skills');
                managedSkillsDir = (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), '.claude', 'skills');
                projectSkillsDirs = (0, markdownConfigLoader_js_1.getProjectDirsUpToHome)('skills', cwd);
                (0, debug_js_1.logForDebugging)("Loading skills from: managed=".concat(managedSkillsDir, ", user=").concat(userSkillsDir, ", project=[").concat(projectSkillsDirs.join(', '), "]"));
                additionalDirs = (0, state_js_1.getAdditionalDirectoriesForClaudeMd)();
                skillsLocked = (0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('skills');
                projectSettingsEnabled = (0, constants_js_1.isSettingSourceEnabled)('projectSettings') && !skillsLocked;
                if (!(0, envUtils_js_1.isBareMode)()) return [3 /*break*/, 2];
                if (additionalDirs.length === 0 || !projectSettingsEnabled) {
                    (0, debug_js_1.logForDebugging)("[bare] Skipping skill dir discovery (".concat(additionalDirs.length === 0 ? 'no --add-dir' : 'projectSettings disabled or skillsLocked', ")"));
                    return [2 /*return*/, []];
                }
                return [4 /*yield*/, Promise.all(additionalDirs.map(function (dir) {
                        return loadSkillsFromSkillsDir((0, path_1.join)(dir, '.claude', 'skills'), 'projectSettings');
                    }))
                    // No dedup needed — explicit dirs, user controls uniqueness.
                ];
            case 1:
                additionalSkillsNested_1 = _c.sent();
                // No dedup needed — explicit dirs, user controls uniqueness.
                return [2 /*return*/, additionalSkillsNested_1.flat().map(function (s) { return s.skill; })];
            case 2: return [4 /*yield*/, Promise.all([
                    (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_POLICY_SKILLS)
                        ? Promise.resolve([])
                        : loadSkillsFromSkillsDir(managedSkillsDir, 'policySettings'),
                    (0, constants_js_1.isSettingSourceEnabled)('userSettings') && !skillsLocked
                        ? loadSkillsFromSkillsDir(userSkillsDir, 'userSettings')
                        : Promise.resolve([]),
                    projectSettingsEnabled
                        ? Promise.all(projectSkillsDirs.map(function (dir) {
                            return loadSkillsFromSkillsDir(dir, 'projectSettings');
                        }))
                        : Promise.resolve([]),
                    projectSettingsEnabled
                        ? Promise.all(additionalDirs.map(function (dir) {
                            return loadSkillsFromSkillsDir((0, path_1.join)(dir, '.claude', 'skills'), 'projectSettings');
                        }))
                        : Promise.resolve([]),
                    // Legacy commands-as-skills goes through markdownConfigLoader with
                    // subdir='commands', which our agents-only guard there skips. Block
                    // here when skills are locked — these ARE skills, regardless of the
                    // directory they load from.
                    skillsLocked ? Promise.resolve([]) : loadSkillsFromCommandsDir(cwd),
                ])
                // Flatten and combine all skills
            ];
            case 3:
                _a = _c.sent(), managedSkills = _a[0], userSkills = _a[1], projectSkillsNested = _a[2], additionalSkillsNested = _a[3], legacyCommands = _a[4];
                allSkillsWithPaths = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], managedSkills, true), userSkills, true), projectSkillsNested.flat(), true), additionalSkillsNested.flat(), true), legacyCommands, true);
                return [4 /*yield*/, Promise.all(allSkillsWithPaths.map(function (_a) {
                        var skill = _a.skill, filePath = _a.filePath;
                        return skill.type === 'prompt'
                            ? getFileIdentity(filePath)
                            : Promise.resolve(null);
                    }))];
            case 4:
                fileIds = _c.sent();
                seenFileIds = new Map();
                deduplicatedSkills = [];
                for (i = 0; i < allSkillsWithPaths.length; i++) {
                    entry = allSkillsWithPaths[i];
                    if (entry === undefined || entry.skill.type !== 'prompt')
                        continue;
                    skill = entry.skill;
                    fileId = fileIds[i];
                    if (fileId === null || fileId === undefined) {
                        deduplicatedSkills.push(skill);
                        continue;
                    }
                    existingSource = seenFileIds.get(fileId);
                    if (existingSource !== undefined) {
                        (0, debug_js_1.logForDebugging)("Skipping duplicate skill '".concat(skill.name, "' from ").concat(skill.source, " (same file already loaded from ").concat(existingSource, ")"));
                        continue;
                    }
                    seenFileIds.set(fileId, skill.source);
                    deduplicatedSkills.push(skill);
                }
                duplicatesRemoved = allSkillsWithPaths.length - deduplicatedSkills.length;
                if (duplicatesRemoved > 0) {
                    (0, debug_js_1.logForDebugging)("Deduplicated ".concat(duplicatesRemoved, " skills (same file)"));
                }
                unconditionalSkills = [];
                newConditionalSkills = [];
                for (_i = 0, deduplicatedSkills_1 = deduplicatedSkills; _i < deduplicatedSkills_1.length; _i++) {
                    skill = deduplicatedSkills_1[_i];
                    if (skill.type === 'prompt' &&
                        skill.paths &&
                        skill.paths.length > 0 &&
                        !activatedConditionalSkillNames.has(skill.name)) {
                        newConditionalSkills.push(skill);
                    }
                    else {
                        unconditionalSkills.push(skill);
                    }
                }
                // Store conditional skills for later activation when matching files are touched
                for (_b = 0, newConditionalSkills_1 = newConditionalSkills; _b < newConditionalSkills_1.length; _b++) {
                    skill = newConditionalSkills_1[_b];
                    conditionalSkills.set(skill.name, skill);
                }
                if (newConditionalSkills.length > 0) {
                    (0, debug_js_1.logForDebugging)("[skills] ".concat(newConditionalSkills.length, " conditional skills stored (activated when matching files are touched)"));
                }
                (0, debug_js_1.logForDebugging)("Loaded ".concat(deduplicatedSkills.length, " unique skills (").concat(unconditionalSkills.length, " unconditional, ").concat(newConditionalSkills.length, " conditional, managed: ").concat(managedSkills.length, ", user: ").concat(userSkills.length, ", project: ").concat(projectSkillsNested.flat().length, ", additional: ").concat(additionalSkillsNested.flat().length, ", legacy commands: ").concat(legacyCommands.length, ")"));
                return [2 /*return*/, unconditionalSkills];
        }
    });
}); });
exports.getCommandDirCommands = exports.getSkillDirCommands;
function clearSkillCaches() {
    var _a, _b, _c, _d;
    (_b = (_a = exports.getSkillDirCommands.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = markdownConfigLoader_js_1.loadMarkdownFilesForSubdir.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    conditionalSkills.clear();
    activatedConditionalSkillNames.clear();
}
// --- Dynamic skill discovery ---
// State for dynamically discovered skills
var dynamicSkillDirs = new Set();
var dynamicSkills = new Map();
// --- Conditional skills (path-filtered) ---
// Skills with paths frontmatter that haven't been activated yet
var conditionalSkills = new Map();
// Names of skills that have been activated (survives cache clears within a session)
var activatedConditionalSkillNames = new Set();
// Signal fired when dynamic skills are loaded
var skillsLoaded = (0, signal_js_1.createSignal)();
/**
 * Register a callback to be invoked when dynamic skills are loaded.
 * Used by other modules to clear caches without creating import cycles.
 * Returns an unsubscribe function.
 */
function onDynamicSkillsLoaded(callback) {
    // Wrap at subscribe time so a throwing listener is logged and skipped
    // rather than aborting skillsLoaded.emit() and breaking skill loading.
    // Same callSafe pattern as growthbook.ts — createSignal.emit() has no
    // per-listener try/catch.
    return skillsLoaded.subscribe(function () {
        try {
            callback();
        }
        catch (error) {
            (0, log_js_1.logError)(error);
        }
    });
}
/**
 * Discovers skill directories by walking up from file paths to cwd.
 * Only discovers directories below cwd (cwd-level skills are loaded at startup).
 *
 * @param filePaths Array of file paths to check
 * @param cwd Current working directory (upper bound for discovery)
 * @returns Array of newly discovered skill directories, sorted deepest first
 */
function discoverSkillDirsForPaths(filePaths, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, resolvedCwd, newDirs, _i, filePaths_1, filePath, currentDir, skillDir, _a, parent_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    resolvedCwd = cwd.endsWith(path_1.sep) ? cwd.slice(0, -1) : cwd;
                    newDirs = [];
                    _i = 0, filePaths_1 = filePaths;
                    _b.label = 1;
                case 1:
                    if (!(_i < filePaths_1.length)) return [3 /*break*/, 9];
                    filePath = filePaths_1[_i];
                    currentDir = (0, path_1.dirname)(filePath);
                    _b.label = 2;
                case 2:
                    if (!currentDir.startsWith(resolvedCwd + path_1.sep)) return [3 /*break*/, 8];
                    skillDir = (0, path_1.join)(currentDir, '.claude', 'skills');
                    if (!!dynamicSkillDirs.has(skillDir)) return [3 /*break*/, 7];
                    dynamicSkillDirs.add(skillDir);
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, fs.stat(skillDir)
                        // Skills dir exists. Before loading, check if the containing dir
                        // is gitignored — blocks e.g. node_modules/pkg/.claude/skills from
                        // loading silently. `git check-ignore` handles nested .gitignore,
                        // .git/info/exclude, and global gitignore. Fails open outside a
                        // git repo (exit 128 → false); the invocation-time trust dialog
                        // is the actual security boundary.
                    ];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, (0, gitignore_js_1.isPathGitignored)(currentDir, resolvedCwd)];
                case 5:
                    // Skills dir exists. Before loading, check if the containing dir
                    // is gitignored — blocks e.g. node_modules/pkg/.claude/skills from
                    // loading silently. `git check-ignore` handles nested .gitignore,
                    // .git/info/exclude, and global gitignore. Fails open outside a
                    // git repo (exit 128 → false); the invocation-time trust dialog
                    // is the actual security boundary.
                    if (_b.sent()) {
                        (0, debug_js_1.logForDebugging)("[skills] Skipped gitignored skills dir: ".concat(skillDir));
                        return [3 /*break*/, 2];
                    }
                    newDirs.push(skillDir);
                    return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 7:
                    parent_1 = (0, path_1.dirname)(currentDir);
                    if (parent_1 === currentDir)
                        return [3 /*break*/, 8]; // Reached root
                    currentDir = parent_1;
                    return [3 /*break*/, 2];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: 
                // Sort by path depth (deepest first) so skills closer to the file take precedence
                return [2 /*return*/, newDirs.sort(function (a, b) { return b.split(path_1.sep).length - a.split(path_1.sep).length; })];
            }
        });
    });
}
/**
 * Loads skills from the given directories and merges them into the dynamic skills map.
 * Skills from directories closer to the file (deeper paths) take precedence.
 *
 * @param dirs Array of skill directories to load from (should be sorted deepest first)
 */
function addSkillDirectories(dirs) {
    return __awaiter(this, void 0, void 0, function () {
        var previousSkillNamesForLogging, loadedSkills, i, _i, _a, skill, newSkillCount, addedSkills;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(0, constants_js_1.isSettingSourceEnabled)('projectSettings') ||
                        (0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('skills')) {
                        (0, debug_js_1.logForDebugging)('[skills] Dynamic skill discovery skipped: projectSettings disabled or plugin-only policy');
                        return [2 /*return*/];
                    }
                    if (dirs.length === 0) {
                        return [2 /*return*/];
                    }
                    previousSkillNamesForLogging = new Set(dynamicSkills.keys());
                    return [4 /*yield*/, Promise.all(dirs.map(function (dir) { return loadSkillsFromSkillsDir(dir, 'projectSettings'); }))
                        // Process in reverse order (shallower first) so deeper paths override
                    ];
                case 1:
                    loadedSkills = _c.sent();
                    // Process in reverse order (shallower first) so deeper paths override
                    for (i = loadedSkills.length - 1; i >= 0; i--) {
                        for (_i = 0, _a = (_b = loadedSkills[i]) !== null && _b !== void 0 ? _b : []; _i < _a.length; _i++) {
                            skill = _a[_i].skill;
                            if (skill.type === 'prompt') {
                                dynamicSkills.set(skill.name, skill);
                            }
                        }
                    }
                    newSkillCount = loadedSkills.flat().length;
                    if (newSkillCount > 0) {
                        addedSkills = __spreadArray([], dynamicSkills.keys(), true).filter(function (n) { return !previousSkillNamesForLogging.has(n); });
                        (0, debug_js_1.logForDebugging)("[skills] Dynamically discovered ".concat(newSkillCount, " skills from ").concat(dirs.length, " directories"));
                        if (addedSkills.length > 0) {
                            (0, index_js_1.logEvent)('tengu_dynamic_skills_changed', {
                                source: 'file_operation',
                                previousCount: previousSkillNamesForLogging.size,
                                newCount: dynamicSkills.size,
                                addedCount: addedSkills.length,
                                directoryCount: dirs.length,
                            });
                        }
                    }
                    // Notify listeners that skills were loaded (so they can clear caches)
                    skillsLoaded.emit();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets all dynamically discovered skills.
 * These are skills discovered from file paths during the session.
 */
function getDynamicSkills() {
    return Array.from(dynamicSkills.values());
}
/**
 * Activates conditional skills (skills with paths frontmatter) whose path
 * patterns match the given file paths. Activated skills are added to the
 * dynamic skills map, making them available to the model.
 *
 * Uses the `ignore` library (gitignore-style matching), matching the behavior
 * of CLAUDE.md conditional rules.
 *
 * @param filePaths Array of file paths being operated on
 * @param cwd Current working directory (paths are matched relative to cwd)
 * @returns Array of newly activated skill names
 */
function activateConditionalSkillsForPaths(filePaths, cwd) {
    if (conditionalSkills.size === 0) {
        return [];
    }
    var activated = [];
    for (var _i = 0, conditionalSkills_1 = conditionalSkills; _i < conditionalSkills_1.length; _i++) {
        var _a = conditionalSkills_1[_i], name_1 = _a[0], skill = _a[1];
        if (skill.type !== 'prompt' || !skill.paths || skill.paths.length === 0) {
            continue;
        }
        var skillIgnore = (0, ignore_1.default)().add(skill.paths);
        for (var _b = 0, filePaths_2 = filePaths; _b < filePaths_2.length; _b++) {
            var filePath = filePaths_2[_b];
            var relativePath = (0, path_1.isAbsolute)(filePath)
                ? (0, path_1.relative)(cwd, filePath)
                : filePath;
            // ignore() throws on empty strings, paths escaping the base (../),
            // and absolute paths (Windows cross-drive relative() returns absolute).
            // Files outside cwd can't match cwd-relative patterns anyway.
            if (!relativePath ||
                relativePath.startsWith('..') ||
                (0, path_1.isAbsolute)(relativePath)) {
                continue;
            }
            if (skillIgnore.ignores(relativePath)) {
                // Activate this skill by moving it to dynamic skills
                dynamicSkills.set(name_1, skill);
                conditionalSkills.delete(name_1);
                activatedConditionalSkillNames.add(name_1);
                activated.push(name_1);
                (0, debug_js_1.logForDebugging)("[skills] Activated conditional skill '".concat(name_1, "' (matched path: ").concat(relativePath, ")"));
                break;
            }
        }
    }
    if (activated.length > 0) {
        (0, index_js_1.logEvent)('tengu_dynamic_skills_changed', {
            source: 'conditional_paths',
            previousCount: dynamicSkills.size - activated.length,
            newCount: dynamicSkills.size,
            addedCount: activated.length,
            directoryCount: 0,
        });
        // Notify listeners that skills were loaded (so they can clear caches)
        skillsLoaded.emit();
    }
    return activated;
}
/**
 * Gets the number of pending conditional skills (for testing/debugging).
 */
function getConditionalSkillCount() {
    return conditionalSkills.size;
}
/**
 * Clears dynamic skill state (for testing).
 */
function clearDynamicSkills() {
    dynamicSkillDirs.clear();
    dynamicSkills.clear();
    conditionalSkills.clear();
    activatedConditionalSkillNames.clear();
}
// Expose createSkillCommand + parseSkillFrontmatterFields to MCP skill
// discovery via a leaf registry module. See mcpSkillBuilders.ts for why this
// indirection exists (a literal dynamic import from mcpSkills.ts fans a single
// edge out into many cycle violations; a variable-specifier dynamic import
// passes dep-cruiser but fails to resolve in Bun-bundled binaries at runtime).
// eslint-disable-next-line custom-rules/no-top-level-side-effects -- write-once registration, idempotent
(0, mcpSkillBuilders_js_1.registerMCPSkillBuilders)({
    createSkillCommand: createSkillCommand,
    parseSkillFrontmatterFields: parseSkillFrontmatterFields,
});
