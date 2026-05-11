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
exports.validatePluginManifest = validatePluginManifest;
exports.validateMarketplaceManifest = validateMarketplaceManifest;
exports.validatePluginContents = validatePluginContents;
exports.validateManifest = validateManifest;
var promises_1 = require("fs/promises");
var path = require("path");
var v4_1 = require("zod/v4");
var errors_js_1 = require("../errors.js");
var frontmatterParser_js_1 = require("../frontmatterParser.js");
var slowOperations_js_1 = require("../slowOperations.js");
var yaml_js_1 = require("../yaml.js");
var schemas_js_1 = require("./schemas.js");
/**
 * Fields that belong in marketplace.json entries (PluginMarketplaceEntrySchema)
 * but not plugin.json (PluginManifestSchema). Plugin authors reasonably copy
 * one into the other. Surfaced as warnings by `claude plugin validate` since
 * they're a known confusion point — the load path silently strips all unknown
 * keys via zod's default behavior, so they're harmless at runtime but worth
 * flagging to authors.
 */
var MARKETPLACE_ONLY_MANIFEST_FIELDS = new Set([
    'category',
    'source',
    'tags',
    'strict',
    'id',
]);
/**
 * Detect whether a file is a plugin manifest or marketplace manifest
 */
function detectManifestType(filePath) {
    var fileName = path.basename(filePath);
    var dirName = path.basename(path.dirname(filePath));
    // Check filename patterns
    if (fileName === 'plugin.json')
        return 'plugin';
    if (fileName === 'marketplace.json')
        return 'marketplace';
    // Check if it's in .claude-plugin directory
    if (dirName === '.claude-plugin') {
        return 'plugin'; // Most likely plugin.json
    }
    return 'unknown';
}
/**
 * Format Zod validation errors into a readable format
 */
function formatZodErrors(zodError) {
    return zodError.issues.map(function (error) { return ({
        path: error.path.join('.') || 'root',
        message: error.message,
        code: error.code,
    }); });
}
/**
 * Check for parent-directory segments ('..') in a path string.
 *
 * For plugin.json component paths this is a security concern (escaping the plugin dir).
 * For marketplace.json source paths it's almost always a resolution-base misunderstanding:
 * paths resolve from the marketplace repo root, not from marketplace.json itself, so the
 * '..' a user added to "climb out of .claude-plugin/" is unnecessary. Callers pass `hint`
 * to attach the right explanation.
 */
function checkPathTraversal(p, field, errors, hint) {
    if (p.includes('..')) {
        errors.push({
            path: field,
            message: hint
                ? "Path contains \"..\": ".concat(p, ". ").concat(hint)
                : "Path contains \"..\" which could be a path traversal attempt: ".concat(p),
        });
    }
}
// Shown when a marketplace plugin source contains '..'. Most users hit this because
// they expect paths to resolve relative to marketplace.json (inside .claude-plugin/),
// but resolution actually starts at the marketplace repo root — see gh-29485.
// Computes a tailored "use X instead of Y" suggestion from the user's actual path
// rather than a hardcoded example (review feedback on #20895).
function marketplaceSourceHint(p) {
    // Strip leading ../ segments: the '..' a user added to "climb out of
    // .claude-plugin/" is unnecessary since paths already start at the repo root.
    // If '..' appears mid-path (rare), fall back to a generic example.
    var stripped = p.replace(/^(\.\.\/)+/, '');
    var corrected = stripped !== p ? "./".concat(stripped) : './plugins/my-plugin';
    return ('Plugin source paths are resolved relative to the marketplace root (the directory ' +
        'containing .claude-plugin/), not relative to marketplace.json. ' +
        "Use \"".concat(corrected, "\" instead of \"").concat(p, "\"."));
}
/**
 * Validate a plugin manifest file (plugin.json)
 */
function validatePluginManifest(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, warnings, absolutePath, content, error_1, code, message, parsed, obj, commands, agents, skills, toValidate, obj, strayKeys, stripped, _i, strayKeys_1, key, result, manifest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errors = [];
                    warnings = [];
                    absolutePath = path.resolve(filePath);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(absolutePath, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_1);
                    message = void 0;
                    if (code === 'ENOENT') {
                        message = "File not found: ".concat(absolutePath);
                    }
                    else if (code === 'EISDIR') {
                        message = "Path is not a file: ".concat(absolutePath);
                    }
                    else {
                        message = "Failed to read file: ".concat((0, errors_js_1.errorMessage)(error_1));
                    }
                    return [2 /*return*/, {
                            success: false,
                            errors: [{ path: 'file', message: message, code: code }],
                            warnings: [],
                            filePath: absolutePath,
                            fileType: 'plugin',
                        }];
                case 4:
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(content);
                    }
                    catch (error) {
                        return [2 /*return*/, {
                                success: false,
                                errors: [
                                    {
                                        path: 'json',
                                        message: "Invalid JSON syntax: ".concat((0, errors_js_1.errorMessage)(error)),
                                    },
                                ],
                                warnings: [],
                                filePath: absolutePath,
                                fileType: 'plugin',
                            }];
                    }
                    // Check for path traversal in the parsed JSON before schema validation
                    // This ensures we catch security issues even if schema validation fails
                    if (parsed && typeof parsed === 'object') {
                        obj = parsed;
                        // Check commands
                        if (obj.commands) {
                            commands = Array.isArray(obj.commands)
                                ? obj.commands
                                : [obj.commands];
                            commands.forEach(function (cmd, i) {
                                if (typeof cmd === 'string') {
                                    checkPathTraversal(cmd, "commands[".concat(i, "]"), errors);
                                }
                            });
                        }
                        // Check agents
                        if (obj.agents) {
                            agents = Array.isArray(obj.agents) ? obj.agents : [obj.agents];
                            agents.forEach(function (agent, i) {
                                if (typeof agent === 'string') {
                                    checkPathTraversal(agent, "agents[".concat(i, "]"), errors);
                                }
                            });
                        }
                        // Check skills
                        if (obj.skills) {
                            skills = Array.isArray(obj.skills) ? obj.skills : [obj.skills];
                            skills.forEach(function (skill, i) {
                                if (typeof skill === 'string') {
                                    checkPathTraversal(skill, "skills[".concat(i, "]"), errors);
                                }
                            });
                        }
                    }
                    toValidate = parsed;
                    if (typeof parsed === 'object' && parsed !== null) {
                        obj = parsed;
                        strayKeys = Object.keys(obj).filter(function (k) {
                            return MARKETPLACE_ONLY_MANIFEST_FIELDS.has(k);
                        });
                        if (strayKeys.length > 0) {
                            stripped = __assign({}, obj);
                            for (_i = 0, strayKeys_1 = strayKeys; _i < strayKeys_1.length; _i++) {
                                key = strayKeys_1[_i];
                                delete stripped[key];
                                warnings.push({
                                    path: key,
                                    message: "Field '".concat(key, "' belongs in the marketplace entry (marketplace.json), ") +
                                        "not plugin.json. It's harmless here but unused \u2014 Claude Code " +
                                        "ignores it at load time.",
                                });
                            }
                            toValidate = stripped;
                        }
                    }
                    result = (0, schemas_js_1.PluginManifestSchema)().strict().safeParse(toValidate);
                    if (!result.success) {
                        errors.push.apply(errors, formatZodErrors(result.error));
                    }
                    // Check for common issues and add warnings
                    if (result.success) {
                        manifest = result.data;
                        // Warn if name isn't strict kebab-case. CC's schema only rejects spaces,
                        // but the Claude.ai marketplace sync rejects non-kebab names. Surfacing
                        // this here lets authors catch it in CI before the sync fails on them.
                        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(manifest.name)) {
                            warnings.push({
                                path: 'name',
                                message: "Plugin name \"".concat(manifest.name, "\" is not kebab-case. Claude Code accepts ") +
                                    "it, but the Claude.ai marketplace sync requires kebab-case " +
                                    "(lowercase letters, digits, and hyphens only, e.g., \"my-plugin\").",
                            });
                        }
                        // Warn if no version specified
                        if (!manifest.version) {
                            warnings.push({
                                path: 'version',
                                message: 'No version specified. Consider adding a version following semver (e.g., "1.0.0")',
                            });
                        }
                        // Warn if no description
                        if (!manifest.description) {
                            warnings.push({
                                path: 'description',
                                message: 'No description provided. Adding a description helps users understand what your plugin does',
                            });
                        }
                        // Warn if no author
                        if (!manifest.author) {
                            warnings.push({
                                path: 'author',
                                message: 'No author information provided. Consider adding author details for plugin attribution',
                            });
                        }
                    }
                    return [2 /*return*/, {
                            success: errors.length === 0,
                            errors: errors,
                            warnings: warnings,
                            filePath: absolutePath,
                            fileType: 'plugin',
                        }];
            }
        });
    });
}
/**
 * Validate a marketplace manifest file (marketplace.json)
 */
function validateMarketplaceManifest(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, warnings, absolutePath, content, error_2, code, message, parsed, obj, strictMarketplaceSchema, result, marketplace_1, manifestDir, marketplaceRoot, _i, _a, _b, i, entry, pluginJsonPath, manifestVersion, raw, parsed_1, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    errors = [];
                    warnings = [];
                    absolutePath = path.resolve(filePath);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(absolutePath, { encoding: 'utf-8' })];
                case 2:
                    content = _e.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _e.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_2);
                    message = void 0;
                    if (code === 'ENOENT') {
                        message = "File not found: ".concat(absolutePath);
                    }
                    else if (code === 'EISDIR') {
                        message = "Path is not a file: ".concat(absolutePath);
                    }
                    else {
                        message = "Failed to read file: ".concat((0, errors_js_1.errorMessage)(error_2));
                    }
                    return [2 /*return*/, {
                            success: false,
                            errors: [{ path: 'file', message: message, code: code }],
                            warnings: [],
                            filePath: absolutePath,
                            fileType: 'marketplace',
                        }];
                case 4:
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(content);
                    }
                    catch (error) {
                        return [2 /*return*/, {
                                success: false,
                                errors: [
                                    {
                                        path: 'json',
                                        message: "Invalid JSON syntax: ".concat((0, errors_js_1.errorMessage)(error)),
                                    },
                                ],
                                warnings: [],
                                filePath: absolutePath,
                                fileType: 'marketplace',
                            }];
                    }
                    // Check for path traversal in plugin sources before schema validation
                    // This ensures we catch security issues even if schema validation fails
                    if (parsed && typeof parsed === 'object') {
                        obj = parsed;
                        if (Array.isArray(obj.plugins)) {
                            obj.plugins.forEach(function (plugin, i) {
                                if (plugin && typeof plugin === 'object' && 'source' in plugin) {
                                    var source = plugin.source;
                                    // Check string sources (relative paths)
                                    if (typeof source === 'string') {
                                        checkPathTraversal(source, "plugins[".concat(i, "].source"), errors, marketplaceSourceHint(source));
                                    }
                                    // Check object-source .path (git-subdir: subdirectory within the
                                    // remote repo, sparse-cloned). '..' here is a genuine traversal attempt
                                    // within the remote repo tree, not a marketplace-root misunderstanding —
                                    // keep the security framing (no marketplaceSourceHint). See #20895 review.
                                    if (source &&
                                        typeof source === 'object' &&
                                        'path' in source &&
                                        typeof source.path === 'string') {
                                        checkPathTraversal(source.path, "plugins[".concat(i, "].source.path"), errors);
                                    }
                                }
                            });
                        }
                    }
                    strictMarketplaceSchema = (0, schemas_js_1.PluginMarketplaceSchema)()
                        .extend({
                        plugins: v4_1.z.array((0, schemas_js_1.PluginMarketplaceEntrySchema)().strict()),
                    })
                        .strict();
                    result = strictMarketplaceSchema.safeParse(parsed);
                    if (!result.success) {
                        errors.push.apply(errors, formatZodErrors(result.error));
                    }
                    if (!result.success) return [3 /*break*/, 12];
                    marketplace_1 = result.data;
                    // Warn if no plugins
                    if (!marketplace_1.plugins || marketplace_1.plugins.length === 0) {
                        warnings.push({
                            path: 'plugins',
                            message: 'Marketplace has no plugins defined',
                        });
                    }
                    if (!marketplace_1.plugins) return [3 /*break*/, 11];
                    marketplace_1.plugins.forEach(function (plugin, i) {
                        // Check for duplicate plugin names
                        var duplicates = marketplace_1.plugins.filter(function (p) { return p.name === plugin.name; });
                        if (duplicates.length > 1) {
                            errors.push({
                                path: "plugins[".concat(i, "].name"),
                                message: "Duplicate plugin name \"".concat(plugin.name, "\" found in marketplace"),
                            });
                        }
                    });
                    manifestDir = path.dirname(absolutePath);
                    marketplaceRoot = path.basename(manifestDir) === '.claude-plugin'
                        ? path.dirname(manifestDir)
                        : manifestDir;
                    _i = 0, _a = marketplace_1.plugins.entries();
                    _e.label = 5;
                case 5:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    _b = _a[_i], i = _b[0], entry = _b[1];
                    if (!entry.version ||
                        typeof entry.source !== 'string' ||
                        !entry.source.startsWith('./')) {
                        return [3 /*break*/, 10];
                    }
                    pluginJsonPath = path.join(marketplaceRoot, entry.source, '.claude-plugin', 'plugin.json');
                    manifestVersion = void 0;
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.readFile)(pluginJsonPath, { encoding: 'utf-8' })];
                case 7:
                    raw = _e.sent();
                    parsed_1 = (0, slowOperations_js_1.jsonParse)(raw);
                    if (typeof parsed_1.version === 'string') {
                        manifestVersion = parsed_1.version;
                    }
                    return [3 /*break*/, 9];
                case 8:
                    _c = _e.sent();
                    // Missing/unreadable plugin.json is someone else's error to report
                    return [3 /*break*/, 10];
                case 9:
                    if (manifestVersion && manifestVersion !== entry.version) {
                        warnings.push({
                            path: "plugins[".concat(i, "].version"),
                            message: "Entry declares version \"".concat(entry.version, "\" but ").concat(entry.source, "/.claude-plugin/plugin.json says \"").concat(manifestVersion, "\". ") +
                                "At install time, plugin.json wins (calculatePluginVersion precedence) \u2014 the entry version is silently ignored. " +
                                "Update this entry to \"".concat(manifestVersion, "\" to match."),
                        });
                    }
                    _e.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 5];
                case 11:
                    // Warn if no description in metadata
                    if (!((_d = marketplace_1.metadata) === null || _d === void 0 ? void 0 : _d.description)) {
                        warnings.push({
                            path: 'metadata.description',
                            message: 'No marketplace description provided. Adding a description helps users understand what this marketplace offers',
                        });
                    }
                    _e.label = 12;
                case 12: return [2 /*return*/, {
                        success: errors.length === 0,
                        errors: errors,
                        warnings: warnings,
                        filePath: absolutePath,
                        fileType: 'marketplace',
                    }];
            }
        });
    });
}
/**
 * Validate the YAML frontmatter in a plugin component markdown file.
 *
 * The runtime loader (parseFrontmatter) silently drops unparseable YAML to a
 * debug log and returns an empty object. That's the right resilience choice
 * for the load path, but authors running `claude plugin validate` want a hard
 * signal. This re-parses the frontmatter block and surfaces what the loader
 * would silently swallow.
 */
function validateComponentFile(filePath, content, fileType) {
    var errors = [];
    var warnings = [];
    var match = content.match(frontmatterParser_js_1.FRONTMATTER_REGEX);
    if (!match) {
        warnings.push({
            path: 'frontmatter',
            message: 'No frontmatter block found. Add YAML frontmatter between --- delimiters ' +
                'at the top of the file to set description and other metadata.',
        });
        return { success: true, errors: errors, warnings: warnings, filePath: filePath, fileType: fileType };
    }
    var frontmatterText = match[1] || '';
    var parsed;
    try {
        parsed = (0, yaml_js_1.parseYaml)(frontmatterText);
    }
    catch (e) {
        errors.push({
            path: 'frontmatter',
            message: "YAML frontmatter failed to parse: ".concat((0, errors_js_1.errorMessage)(e), ". ") +
                "At runtime this ".concat(fileType, " loads with empty metadata (all frontmatter ") +
                "fields silently dropped).",
        });
        return { success: false, errors: errors, warnings: warnings, filePath: filePath, fileType: fileType };
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        errors.push({
            path: 'frontmatter',
            message: 'Frontmatter must be a YAML mapping (key: value pairs), got ' +
                "".concat(Array.isArray(parsed) ? 'an array' : parsed === null ? 'null' : typeof parsed, "."),
        });
        return { success: false, errors: errors, warnings: warnings, filePath: filePath, fileType: fileType };
    }
    var fm = parsed;
    // description: must be scalar. coerceDescriptionToString logs+drops arrays/objects at runtime.
    if (fm.description !== undefined) {
        var d = fm.description;
        if (typeof d !== 'string' &&
            typeof d !== 'number' &&
            typeof d !== 'boolean' &&
            d !== null) {
            errors.push({
                path: 'description',
                message: "description must be a string, got ".concat(Array.isArray(d) ? 'array' : typeof d, ". ") +
                    "At runtime this value is dropped.",
            });
        }
    }
    else {
        warnings.push({
            path: 'description',
            message: "No description in frontmatter. A description helps users and Claude " +
                "understand when to use this ".concat(fileType, "."),
        });
    }
    // name: if present, must be a string (skills/commands use it as displayName;
    // plugin agents use it as the agentType stem — non-strings would stringify to garbage)
    if (fm.name !== undefined &&
        fm.name !== null &&
        typeof fm.name !== 'string') {
        errors.push({
            path: 'name',
            message: "name must be a string, got ".concat(typeof fm.name, "."),
        });
    }
    // allowed-tools: string or array of strings
    var at = fm['allowed-tools'];
    if (at !== undefined && at !== null) {
        if (typeof at !== 'string' && !Array.isArray(at)) {
            errors.push({
                path: 'allowed-tools',
                message: "allowed-tools must be a string or array of strings, got ".concat(typeof at, "."),
            });
        }
        else if (Array.isArray(at) && at.some(function (t) { return typeof t !== 'string'; })) {
            errors.push({
                path: 'allowed-tools',
                message: 'allowed-tools array must contain only strings.',
            });
        }
    }
    // shell: 'bash' | 'powershell' (controls !`cmd` block routing)
    var sh = fm.shell;
    if (sh !== undefined && sh !== null) {
        if (typeof sh !== 'string') {
            errors.push({
                path: 'shell',
                message: "shell must be a string, got ".concat(typeof sh, "."),
            });
        }
        else {
            // Normalize to match parseShellFrontmatter() runtime behavior —
            // `shell: PowerShell` should not fail validation but work at runtime.
            var normalized = sh.trim().toLowerCase();
            if (normalized !== 'bash' && normalized !== 'powershell') {
                errors.push({
                    path: 'shell',
                    message: "shell must be 'bash' or 'powershell', got '".concat(sh, "'."),
                });
            }
        }
    }
    return { success: errors.length === 0, errors: errors, warnings: warnings, filePath: filePath, fileType: fileType };
}
/**
 * Validate a plugin's hooks.json file. Unlike frontmatter, this one HARD-ERRORS
 * at runtime (pluginLoader uses .parse() not .safeParse()) — a bad hooks.json
 * breaks the whole plugin. Surfacing it here is essential.
 */
function validateHooksJson(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var content, e_1, code, parsed, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, { encoding: 'utf-8' })];
                case 1:
                    content = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    // ENOENT is fine — hooks are optional
                    if (code === 'ENOENT') {
                        return [2 /*return*/, {
                                success: true,
                                errors: [],
                                warnings: [],
                                filePath: filePath,
                                fileType: 'hooks',
                            }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            errors: [
                                { path: 'file', message: "Failed to read file: ".concat((0, errors_js_1.errorMessage)(e_1)) },
                            ],
                            warnings: [],
                            filePath: filePath,
                            fileType: 'hooks',
                        }];
                case 3:
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(content);
                    }
                    catch (e) {
                        return [2 /*return*/, {
                                success: false,
                                errors: [
                                    {
                                        path: 'json',
                                        message: "Invalid JSON syntax: ".concat((0, errors_js_1.errorMessage)(e), ". ") +
                                            "At runtime this breaks the entire plugin load.",
                                    },
                                ],
                                warnings: [],
                                filePath: filePath,
                                fileType: 'hooks',
                            }];
                    }
                    result = (0, schemas_js_1.PluginHooksSchema)().safeParse(parsed);
                    if (!result.success) {
                        return [2 /*return*/, {
                                success: false,
                                errors: formatZodErrors(result.error),
                                warnings: [],
                                filePath: filePath,
                                fileType: 'hooks',
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            errors: [],
                            warnings: [],
                            filePath: filePath,
                            fileType: 'hooks',
                        }];
            }
        });
    });
}
/**
 * Recursively collect .md files under a directory. Uses withFileTypes to
 * avoid a stat per entry. Returns absolute paths so error messages stay
 * readable.
 */
function collectMarkdown(dir, isSkillsDir) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, e_2, code, out, _i, entries_1, entry, full, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dir, { withFileTypes: true })];
                case 1:
                    entries = _d.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _d.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code === 'ENOENT' || code === 'ENOTDIR')
                        return [2 /*return*/, []];
                    throw e_2;
                case 3:
                    // Skills use <name>/SKILL.md — only descend one level, only collect SKILL.md.
                    // Matches the runtime loader: single .md files in skills/ are NOT loaded,
                    // and subdirectories of a skill dir aren't scanned. Paths are speculative
                    // (the subdir may lack SKILL.md); the caller handles ENOENT.
                    if (isSkillsDir) {
                        return [2 /*return*/, entries
                                .filter(function (e) { return e.isDirectory(); })
                                .map(function (e) { return path.join(dir, e.name, 'SKILL.md'); })];
                    }
                    out = [];
                    _i = 0, entries_1 = entries;
                    _d.label = 4;
                case 4:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 8];
                    entry = entries_1[_i];
                    full = path.join(dir, entry.name);
                    if (!entry.isDirectory()) return [3 /*break*/, 6];
                    _b = (_a = out.push).apply;
                    _c = [out];
                    return [4 /*yield*/, collectMarkdown(full, false)];
                case 5:
                    _b.apply(_a, _c.concat([(_d.sent())]));
                    return [3 /*break*/, 7];
                case 6:
                    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
                        out.push(full);
                    }
                    _d.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 4];
                case 8: return [2 /*return*/, out];
            }
        });
    });
}
/**
 * Validate the content files inside a plugin directory — skills, agents,
 * commands, and hooks.json. Scans the default component directories (the
 * manifest can declare custom paths but the default layout covers the vast
 * majority of plugins; this is a linter, not a loader).
 *
 * Returns one ValidationResult per file that has errors or warnings. A clean
 * plugin returns an empty array.
 */
function validatePluginContents(pluginDir) {
    return __awaiter(this, void 0, void 0, function () {
        var results, dirs, _i, dirs_1, _a, fileType, dir, files, _b, files_1, filePath, content, e_3, r, hooksResult;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    results = [];
                    dirs = [
                        ['skill', path.join(pluginDir, 'skills')],
                        ['agent', path.join(pluginDir, 'agents')],
                        ['command', path.join(pluginDir, 'commands')],
                    ];
                    _i = 0, dirs_1 = dirs;
                    _c.label = 1;
                case 1:
                    if (!(_i < dirs_1.length)) return [3 /*break*/, 10];
                    _a = dirs_1[_i], fileType = _a[0], dir = _a[1];
                    return [4 /*yield*/, collectMarkdown(dir, fileType === 'skill')];
                case 2:
                    files = _c.sent();
                    _b = 0, files_1 = files;
                    _c.label = 3;
                case 3:
                    if (!(_b < files_1.length)) return [3 /*break*/, 9];
                    filePath = files_1[_b];
                    content = void 0;
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, { encoding: 'utf-8' })];
                case 5:
                    content = _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_3 = _c.sent();
                    // ENOENT is expected for speculative skill paths (subdirs without SKILL.md)
                    if ((0, errors_js_1.isENOENT)(e_3))
                        return [3 /*break*/, 8];
                    results.push({
                        success: false,
                        errors: [
                            { path: 'file', message: "Failed to read: ".concat((0, errors_js_1.errorMessage)(e_3)) },
                        ],
                        warnings: [],
                        filePath: filePath,
                        fileType: fileType,
                    });
                    return [3 /*break*/, 8];
                case 7:
                    r = validateComponentFile(filePath, content, fileType);
                    if (r.errors.length > 0 || r.warnings.length > 0) {
                        results.push(r);
                    }
                    _c.label = 8;
                case 8:
                    _b++;
                    return [3 /*break*/, 3];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [4 /*yield*/, validateHooksJson(path.join(pluginDir, 'hooks', 'hooks.json'))];
                case 11:
                    hooksResult = _c.sent();
                    if (hooksResult.errors.length > 0 || hooksResult.warnings.length > 0) {
                        results.push(hooksResult);
                    }
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * Validate a manifest file or directory (auto-detects type)
 */
function validateManifest(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var absolutePath, stats, e_4, marketplacePath, marketplaceResult, pluginPath, pluginResult, manifestType, _a, content, parsed, e_5, code;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    absolutePath = path.resolve(filePath);
                    stats = null;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(absolutePath)];
                case 2:
                    stats = _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _d.sent();
                    if (!(0, errors_js_1.isENOENT)(e_4)) {
                        throw e_4;
                    }
                    return [3 /*break*/, 4];
                case 4:
                    if (!(stats === null || stats === void 0 ? void 0 : stats.isDirectory())) return [3 /*break*/, 7];
                    marketplacePath = path.join(absolutePath, '.claude-plugin', 'marketplace.json');
                    return [4 /*yield*/, validateMarketplaceManifest(marketplacePath)
                        // Only fall through if the marketplace file was not found (ENOENT)
                    ];
                case 5:
                    marketplaceResult = _d.sent();
                    // Only fall through if the marketplace file was not found (ENOENT)
                    if (((_b = marketplaceResult.errors[0]) === null || _b === void 0 ? void 0 : _b.code) !== 'ENOENT') {
                        return [2 /*return*/, marketplaceResult];
                    }
                    pluginPath = path.join(absolutePath, '.claude-plugin', 'plugin.json');
                    return [4 /*yield*/, validatePluginManifest(pluginPath)];
                case 6:
                    pluginResult = _d.sent();
                    if (((_c = pluginResult.errors[0]) === null || _c === void 0 ? void 0 : _c.code) !== 'ENOENT') {
                        return [2 /*return*/, pluginResult];
                    }
                    return [2 /*return*/, {
                            success: false,
                            errors: [
                                {
                                    path: 'directory',
                                    message: "No manifest found in directory. Expected .claude-plugin/marketplace.json or .claude-plugin/plugin.json",
                                },
                            ],
                            warnings: [],
                            filePath: absolutePath,
                            fileType: 'plugin',
                        }];
                case 7:
                    manifestType = detectManifestType(filePath);
                    _a = manifestType;
                    switch (_a) {
                        case 'plugin': return [3 /*break*/, 8];
                        case 'marketplace': return [3 /*break*/, 9];
                        case 'unknown': return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 14];
                case 8: return [2 /*return*/, validatePluginManifest(filePath)];
                case 9: return [2 /*return*/, validateMarketplaceManifest(filePath)];
                case 10:
                    _d.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, (0, promises_1.readFile)(absolutePath, { encoding: 'utf-8' })];
                case 11:
                    content = _d.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    // Heuristic: if it has a "plugins" array, it's probably a marketplace
                    if (Array.isArray(parsed.plugins)) {
                        return [2 /*return*/, validateMarketplaceManifest(filePath)];
                    }
                    return [3 /*break*/, 13];
                case 12:
                    e_5 = _d.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_5);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, {
                                success: false,
                                errors: [
                                    {
                                        path: 'file',
                                        message: "File not found: ".concat(absolutePath),
                                    },
                                ],
                                warnings: [],
                                filePath: absolutePath,
                                fileType: 'plugin', // Default to plugin for error reporting
                            }];
                    }
                    return [3 /*break*/, 13];
                case 13: 
                // Default: validate as plugin manifest
                return [2 /*return*/, validatePluginManifest(filePath)];
                case 14: return [2 /*return*/];
            }
        });
    });
}
