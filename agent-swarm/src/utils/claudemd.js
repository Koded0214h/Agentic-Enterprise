"use strict";
/**
 * Files are loaded in the following order:
 *
 * 1. Managed memory (eg. /etc/claude-code/CLAUDE.md) - Global instructions for all users
 * 2. User memory (~/.claude/CLAUDE.md) - Private global instructions for all projects
 * 3. Project memory (CLAUDE.md, .claude/CLAUDE.md, and .claude/rules/*.md in project roots) - Instructions checked into the codebase
 * 4. Local memory (CLAUDE.local.md in project roots) - Private project-specific instructions
 *
 * Files are loaded in reverse order of priority, i.e. the latest files are highest priority
 * with the model paying more attention to them.
 *
 * File discovery:
 * - User memory is loaded from the user's home directory
 * - Project and Local files are discovered by traversing from the current directory up to root
 * - Files closer to the current directory have higher priority (loaded later)
 * - CLAUDE.md, .claude/CLAUDE.md, and all .md files in .claude/rules/ are checked in each directory for Project memory
 *
 * Memory @include directive:
 * - Memory files can include other files using @ notation
 * - Syntax: @path, @./relative/path, @~/home/path, or @/absolute/path
 * - @path (without prefix) is treated as a relative path (same as @./path)
 * - Works in leaf text nodes only (not inside code blocks or code strings)
 * - Included files are added as separate entries before the including file
 * - Circular references are prevented by tracking processed files
 * - Non-existent files are silently ignored
 */
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
exports.getClaudeMds = exports.getMemoryFiles = exports.MAX_MEMORY_CHARACTER_COUNT = void 0;
exports.stripHtmlComments = stripHtmlComments;
exports.processMemoryFile = processMemoryFile;
exports.processMdRules = processMdRules;
exports.clearMemoryFileCaches = clearMemoryFileCaches;
exports.resetGetMemoryFilesCache = resetGetMemoryFilesCache;
exports.getLargeMemoryFiles = getLargeMemoryFiles;
exports.filterInjectedMemoryFiles = filterInjectedMemoryFiles;
exports.getManagedAndUserConditionalRules = getManagedAndUserConditionalRules;
exports.getMemoryFilesForNestedDirectory = getMemoryFilesForNestedDirectory;
exports.getConditionalRulesForCwdLevelDirectory = getConditionalRulesForCwdLevelDirectory;
exports.processConditionedMdRules = processConditionedMdRules;
exports.getExternalClaudeMdIncludes = getExternalClaudeMdIncludes;
exports.hasExternalClaudeMdIncludes = hasExternalClaudeMdIncludes;
exports.shouldShowClaudeMdExternalIncludesWarning = shouldShowClaudeMdExternalIncludesWarning;
exports.isMemoryFilePath = isMemoryFilePath;
exports.getAllMemoryFilePaths = getAllMemoryFilePaths;
var bun_bundle_1 = require("bun:bundle");
var ignore_1 = require("ignore");
var memoize_js_1 = require("lodash-es/memoize.js");
var marked_1 = require("marked");
var path_1 = require("path");
var picomatch_1 = require("picomatch");
var index_js_1 = require("src/services/analytics/index.js");
var state_js_1 = require("../bootstrap/state.js");
var memdir_js_1 = require("../memdir/memdir.js");
var paths_js_1 = require("../memdir/paths.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var config_js_1 = require("./config.js");
var debug_js_1 = require("./debug.js");
var diagLogs_js_1 = require("./diagLogs.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var file_js_1 = require("./file.js");
var fileStateCache_js_1 = require("./fileStateCache.js");
var frontmatterParser_js_1 = require("./frontmatterParser.js");
var fsOperations_js_1 = require("./fsOperations.js");
var git_js_1 = require("./git.js");
var hooks_js_1 = require("./hooks.js");
var path_js_1 = require("./path.js");
var filesystem_js_1 = require("./permissions/filesystem.js");
var constants_js_1 = require("./settings/constants.js");
var settings_js_1 = require("./settings/settings.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemPaths = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('../memdir/teamMemPaths.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var hasLoggedInitialLoad = false;
var MEMORY_INSTRUCTION_PROMPT = 'Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written.';
// Recommended max character count for a memory file
exports.MAX_MEMORY_CHARACTER_COUNT = 40000;
// File extensions that are allowed for @include directives
// This prevents binary files (images, PDFs, etc.) from being loaded into memory
var TEXT_FILE_EXTENSIONS = new Set([
    // Markdown and text
    '.md',
    '.txt',
    '.text',
    // Data formats
    '.json',
    '.yaml',
    '.yml',
    '.toml',
    '.xml',
    '.csv',
    // Web
    '.html',
    '.htm',
    '.css',
    '.scss',
    '.sass',
    '.less',
    // JavaScript/TypeScript
    '.js',
    '.ts',
    '.tsx',
    '.jsx',
    '.mjs',
    '.cjs',
    '.mts',
    '.cts',
    // Python
    '.py',
    '.pyi',
    '.pyw',
    // Ruby
    '.rb',
    '.erb',
    '.rake',
    // Go
    '.go',
    // Rust
    '.rs',
    // Java/Kotlin/Scala
    '.java',
    '.kt',
    '.kts',
    '.scala',
    // C/C++
    '.c',
    '.cpp',
    '.cc',
    '.cxx',
    '.h',
    '.hpp',
    '.hxx',
    // C#
    '.cs',
    // Swift
    '.swift',
    // Shell
    '.sh',
    '.bash',
    '.zsh',
    '.fish',
    '.ps1',
    '.bat',
    '.cmd',
    // Config
    '.env',
    '.ini',
    '.cfg',
    '.conf',
    '.config',
    '.properties',
    // Database
    '.sql',
    '.graphql',
    '.gql',
    // Protocol
    '.proto',
    // Frontend frameworks
    '.vue',
    '.svelte',
    '.astro',
    // Templating
    '.ejs',
    '.hbs',
    '.pug',
    '.jade',
    // Other languages
    '.php',
    '.pl',
    '.pm',
    '.lua',
    '.r',
    '.R',
    '.dart',
    '.ex',
    '.exs',
    '.erl',
    '.hrl',
    '.clj',
    '.cljs',
    '.cljc',
    '.edn',
    '.hs',
    '.lhs',
    '.elm',
    '.ml',
    '.mli',
    '.f',
    '.f90',
    '.f95',
    '.for',
    // Build files
    '.cmake',
    '.make',
    '.makefile',
    '.gradle',
    '.sbt',
    // Documentation
    '.rst',
    '.adoc',
    '.asciidoc',
    '.org',
    '.tex',
    '.latex',
    // Lock files (often text-based)
    '.lock',
    // Misc
    '.log',
    '.diff',
    '.patch',
]);
function pathInOriginalCwd(path) {
    return (0, filesystem_js_1.pathInWorkingPath)(path, (0, state_js_1.getOriginalCwd)());
}
/**
 * Parses raw content to extract both content and glob patterns from frontmatter
 * @param rawContent Raw file content with frontmatter
 * @returns Object with content and globs (undefined if no paths or match-all pattern)
 */
function parseFrontmatterPaths(rawContent) {
    var _a = (0, frontmatterParser_js_1.parseFrontmatter)(rawContent), frontmatter = _a.frontmatter, content = _a.content;
    if (!frontmatter.paths) {
        return { content: content };
    }
    var patterns = (0, frontmatterParser_js_1.splitPathInFrontmatter)(frontmatter.paths)
        .map(function (pattern) {
        // Remove /** suffix - ignore library treats 'path' as matching both
        // the path itself and everything inside it
        return pattern.endsWith('/**') ? pattern.slice(0, -3) : pattern;
    })
        .filter(function (p) { return p.length > 0; });
    // If all patterns are ** (match-all), treat as no globs (undefined)
    // This means the file applies to all paths
    if (patterns.length === 0 || patterns.every(function (p) { return p === '**'; })) {
        return { content: content };
    }
    return { content: content, paths: patterns };
}
/**
 * Strip block-level HTML comments (<!-- ... -->) from markdown content.
 *
 * Uses the marked lexer to identify comments at the block level only, so
 * comments inside inline code spans and fenced code blocks are preserved.
 * Inline HTML comments inside a paragraph are also left intact; the intended
 * use case is authorial notes that occupy their own lines.
 *
 * Unclosed comments (`<!--` with no matching `-->`) are left in place so a
 * typo doesn't silently swallow the rest of the file.
 */
function stripHtmlComments(content) {
    if (!content.includes('<!--')) {
        return { content: content, stripped: false };
    }
    // gfm:false is fine here — html-block detection is a CommonMark rule.
    return stripHtmlCommentsFromTokens(new marked_1.Lexer({ gfm: false }).lex(content));
}
function stripHtmlCommentsFromTokens(tokens) {
    var result = '';
    var stripped = false;
    // A well-formed HTML comment span. Non-greedy so multiple comments on the
    // same line are matched independently; [\s\S] to span newlines.
    var commentSpan = /<!--[\s\S]*?-->/g;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (token.type === 'html') {
            var trimmed = token.raw.trimStart();
            if (trimmed.startsWith('<!--') && trimmed.includes('-->')) {
                // Per CommonMark, a type-2 HTML block ends at the *line* containing
                // `-->`, so text after `-->` on that line is part of this token.
                // Strip only the comment spans and keep any residual content.
                var residue = token.raw.replace(commentSpan, '');
                stripped = true;
                if (residue.trim().length > 0) {
                    // Residual content exists (e.g. `<!-- note --> Use bun`): keep it.
                    result += residue;
                }
                continue;
            }
        }
        result += token.raw;
    }
    return { content: result, stripped: stripped };
}
/**
 * Parses raw memory file content into a MemoryFileInfo. Pure function — no I/O.
 *
 * When includeBasePath is given, @include paths are resolved in the same lex
 * pass and returned alongside the parsed file (so processMemoryFile doesn't
 * need to lex the same content a second time).
 */
function parseMemoryFileContent(rawContent, filePath, type, includeBasePath) {
    // Skip non-text files to prevent loading binary data (images, PDFs, etc.) into memory
    var ext = (0, path_1.extname)(filePath).toLowerCase();
    if (ext && !TEXT_FILE_EXTENSIONS.has(ext)) {
        (0, debug_js_1.logForDebugging)("Skipping non-text file in @include: ".concat(filePath));
        return { info: null, includePaths: [] };
    }
    var _a = parseFrontmatterPaths(rawContent), withoutFrontmatter = _a.content, paths = _a.paths;
    // Lex once so strip and @include-extract share the same tokens. gfm:false
    // is required by extract (so ~/path doesn't tokenize as strikethrough) and
    // doesn't affect strip (html blocks are a CommonMark rule).
    var hasComment = withoutFrontmatter.includes('<!--');
    var tokens = hasComment || includeBasePath !== undefined
        ? new marked_1.Lexer({ gfm: false }).lex(withoutFrontmatter)
        : undefined;
    // Only rebuild via tokens when a comment actually needs stripping —
    // marked normalises \r\n during lex, so round-tripping a CRLF file
    // through token.raw would spuriously flip contentDiffersFromDisk.
    var strippedContent = hasComment && tokens
        ? stripHtmlCommentsFromTokens(tokens).content
        : withoutFrontmatter;
    var includePaths = tokens && includeBasePath !== undefined
        ? extractIncludePathsFromTokens(tokens, includeBasePath)
        : [];
    // Truncate MEMORY.md entrypoints to the line AND byte caps
    var finalContent = strippedContent;
    if (type === 'AutoMem' || type === 'TeamMem') {
        finalContent = (0, memdir_js_1.truncateEntrypointContent)(strippedContent).content;
    }
    // Covers frontmatter strip, HTML comment strip, and MEMORY.md truncation
    var contentDiffersFromDisk = finalContent !== rawContent;
    return {
        info: {
            path: filePath,
            type: type,
            content: finalContent,
            globs: paths,
            contentDiffersFromDisk: contentDiffersFromDisk,
            rawContent: contentDiffersFromDisk ? rawContent : undefined,
        },
        includePaths: includePaths,
    };
}
function handleMemoryFileReadError(error, filePath) {
    var code = (0, errors_js_1.getErrnoCode)(error);
    // ENOENT = file doesn't exist, EISDIR = is a directory — both expected
    if (code === 'ENOENT' || code === 'EISDIR') {
        return;
    }
    // Log permission errors (EACCES) as they're actionable
    if (code === 'EACCES') {
        // Don't log the full file path to avoid PII/security issues
        (0, index_js_1.logEvent)('tengu_claude_md_permission_error', {
            is_access_error: 1,
            has_home_dir: filePath.includes((0, envUtils_js_1.getClaudeConfigHomeDir)()) ? 1 : 0,
        });
    }
}
/**
 * Used by processMemoryFile → getMemoryFiles so the event loop stays
 * responsive during the directory walk (many readFile attempts, most
 * ENOENT). When includeBasePath is given, @include paths are resolved in
 * the same lex pass and returned alongside the parsed file.
 */
function safelyReadMemoryFileAsync(filePath, type, includeBasePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, rawContent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.readFile(filePath, { encoding: 'utf-8' })];
                case 1:
                    rawContent = _a.sent();
                    return [2 /*return*/, parseMemoryFileContent(rawContent, filePath, type, includeBasePath)];
                case 2:
                    error_1 = _a.sent();
                    handleMemoryFileReadError(error_1, filePath);
                    return [2 /*return*/, { info: null, includePaths: [] }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Extract @path include references from pre-lexed tokens and resolve to
// absolute paths. Skips html tokens so @paths inside block comments are
// ignored — the caller may pass pre-strip tokens.
function extractIncludePathsFromTokens(tokens, basePath) {
    var absolutePaths = new Set();
    // Extract @paths from a text string and add resolved paths to absolutePaths.
    function extractPathsFromText(textContent) {
        var includeRegex = /(?:^|\s)@((?:[^\s\\]|\\ )+)/g;
        var match;
        while ((match = includeRegex.exec(textContent)) !== null) {
            var path = match[1];
            if (!path)
                continue;
            // Strip fragment identifiers (#heading, #section-name, etc.)
            var hashIndex = path.indexOf('#');
            if (hashIndex !== -1) {
                path = path.substring(0, hashIndex);
            }
            if (!path)
                continue;
            // Unescape the spaces in the path
            path = path.replace(/\\ /g, ' ');
            // Accept @path, @./path, @~/path, or @/path
            if (path) {
                var isValidPath = path.startsWith('./') ||
                    path.startsWith('~/') ||
                    (path.startsWith('/') && path !== '/') ||
                    (!path.startsWith('@') &&
                        !path.match(/^[#%^&*()]+/) &&
                        path.match(/^[a-zA-Z0-9._-]/));
                if (isValidPath) {
                    var resolvedPath = (0, path_js_1.expandPath)(path, (0, path_1.dirname)(basePath));
                    absolutePaths.add(resolvedPath);
                }
            }
        }
    }
    // Recursively process elements to find text nodes
    function processElements(elements) {
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (element.type === 'code' || element.type === 'codespan') {
                continue;
            }
            // For html tokens that contain comments, strip the comment spans and
            // check the residual for @paths (e.g. `<!-- note --> @./file.md`).
            // Other html tokens (non-comment tags) are skipped entirely.
            if (element.type === 'html') {
                var raw = element.raw || '';
                var trimmed = raw.trimStart();
                if (trimmed.startsWith('<!--') && trimmed.includes('-->')) {
                    var commentSpan = /<!--[\s\S]*?-->/g;
                    var residue = raw.replace(commentSpan, '');
                    if (residue.trim().length > 0) {
                        extractPathsFromText(residue);
                    }
                }
                continue;
            }
            // Process text nodes
            if (element.type === 'text') {
                extractPathsFromText(element.text || '');
            }
            // Recurse into children tokens
            if (element.tokens) {
                processElements(element.tokens);
            }
            // Special handling for list structures
            if (element.items) {
                processElements(element.items);
            }
        }
    }
    processElements(tokens);
    return __spreadArray([], absolutePaths, true);
}
var MAX_INCLUDE_DEPTH = 5;
/**
 * Checks whether a CLAUDE.md file path is excluded by the claudeMdExcludes setting.
 * Only applies to User, Project, and Local memory types.
 * Managed, AutoMem, and TeamMem types are never excluded.
 *
 * Matches both the original path and the realpath-resolved path to handle symlinks
 * (e.g., /tmp -> /private/tmp on macOS).
 */
function isClaudeMdExcluded(filePath, type) {
    if (type !== 'User' && type !== 'Project' && type !== 'Local') {
        return false;
    }
    var patterns = (0, settings_js_1.getInitialSettings)().claudeMdExcludes;
    if (!patterns || patterns.length === 0) {
        return false;
    }
    var matchOpts = { dot: true };
    var normalizedPath = filePath.replaceAll('\\', '/');
    // Build an expanded pattern list that includes realpath-resolved versions of
    // absolute patterns. This handles symlinks like /tmp -> /private/tmp on macOS:
    // the user writes "/tmp/project/CLAUDE.md" in their exclude, but the system
    // resolves the CWD to "/private/tmp/project/...", so the file path uses the
    // real path. By resolving the patterns too, both sides match.
    var expandedPatterns = resolveExcludePatterns(patterns).filter(function (p) { return p.length > 0; });
    if (expandedPatterns.length === 0) {
        return false;
    }
    return picomatch_1.default.isMatch(normalizedPath, expandedPatterns, matchOpts);
}
/**
 * Expands exclude patterns by resolving symlinks in absolute path prefixes.
 * For each absolute pattern (starting with /), tries to resolve the longest
 * existing directory prefix via realpathSync and adds the resolved version.
 * Glob patterns (containing *) have their static prefix resolved.
 */
function resolveExcludePatterns(patterns) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var expanded = patterns.map(function (p) { return p.replaceAll('\\', '/'); });
    for (var _i = 0, expanded_1 = expanded; _i < expanded_1.length; _i++) {
        var normalized = expanded_1[_i];
        // Only resolve absolute patterns — glob-only patterns like "**/*.md" don't have
        // a filesystem prefix to resolve
        if (!normalized.startsWith('/')) {
            continue;
        }
        // Find the static prefix before any glob characters
        var globStart = normalized.search(/[*?{[]/);
        var staticPrefix = globStart === -1 ? normalized : normalized.slice(0, globStart);
        var dirToResolve = (0, path_1.dirname)(staticPrefix);
        try {
            // sync IO: called from sync context (isClaudeMdExcluded -> processMemoryFile -> getMemoryFiles)
            var resolvedDir = fs.realpathSync(dirToResolve).replaceAll('\\', '/');
            if (resolvedDir !== dirToResolve) {
                var resolvedPattern = resolvedDir + normalized.slice(dirToResolve.length);
                expanded.push(resolvedPattern);
            }
        }
        catch (_a) {
            // Directory doesn't exist; skip resolution for this pattern
        }
    }
    return expanded;
}
/**
 * Recursively processes a memory file and all its @include references
 * Returns an array of MemoryFileInfo objects with includes first, then main file
 */
function processMemoryFile(filePath_1, type_1, processedPaths_1, includeExternal_1) {
    return __awaiter(this, arguments, void 0, function (filePath, type, processedPaths, includeExternal, depth, parent) {
        var normalizedPath, _a, resolvedPath, isSymlink, _b, memoryFile, resolvedIncludePaths, result, _i, resolvedIncludePaths_1, resolvedIncludePath, isExternal, includedFiles;
        if (depth === void 0) { depth = 0; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    normalizedPath = (0, file_js_1.normalizePathForComparison)(filePath);
                    if (processedPaths.has(normalizedPath) || depth >= MAX_INCLUDE_DEPTH) {
                        return [2 /*return*/, []];
                    }
                    // Skip if path is excluded by claudeMdExcludes setting
                    if (isClaudeMdExcluded(filePath, type)) {
                        return [2 /*return*/, []];
                    }
                    _a = (0, fsOperations_js_1.safeResolvePath)((0, fsOperations_js_1.getFsImplementation)(), filePath), resolvedPath = _a.resolvedPath, isSymlink = _a.isSymlink;
                    processedPaths.add(normalizedPath);
                    if (isSymlink) {
                        processedPaths.add((0, file_js_1.normalizePathForComparison)(resolvedPath));
                    }
                    return [4 /*yield*/, safelyReadMemoryFileAsync(filePath, type, resolvedPath)];
                case 1:
                    _b = _c.sent(), memoryFile = _b.info, resolvedIncludePaths = _b.includePaths;
                    if (!memoryFile || !memoryFile.content.trim()) {
                        return [2 /*return*/, []];
                    }
                    // Add parent information
                    if (parent) {
                        memoryFile.parent = parent;
                    }
                    result = [];
                    // Add the main file first (parent before children)
                    result.push(memoryFile);
                    _i = 0, resolvedIncludePaths_1 = resolvedIncludePaths;
                    _c.label = 2;
                case 2:
                    if (!(_i < resolvedIncludePaths_1.length)) return [3 /*break*/, 5];
                    resolvedIncludePath = resolvedIncludePaths_1[_i];
                    isExternal = !pathInOriginalCwd(resolvedIncludePath);
                    if (isExternal && !includeExternal) {
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, processMemoryFile(resolvedIncludePath, type, processedPaths, includeExternal, depth + 1, filePath)];
                case 3:
                    includedFiles = _c.sent();
                    result.push.apply(result, includedFiles);
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Processes all .md files in the .claude/rules/ directory and its subdirectories
 * @param rulesDir The path to the rules directory
 * @param type Type of memory file (User, Project, Local)
 * @param processedPaths Set of already processed file paths
 * @param includeExternal Whether to include external files
 * @param conditionalRule If true, only include files with frontmatter paths; if false, only include files without frontmatter paths
 * @param visitedDirs Set of already visited directory real paths (for cycle detection)
 * @returns Array of MemoryFileInfo objects
 */
function processMdRules(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var fs, _c, resolvedRulesDir, isSymlink, result, entries, e_1, code, _i, entries_1, entry, entryPath, _d, resolvedEntryPath, isSymlink_1, stats, _e, isDirectory, isFile, _f, _g, _h, files, error_2;
        var rulesDir = _b.rulesDir, type = _b.type, processedPaths = _b.processedPaths, includeExternal = _b.includeExternal, conditionalRule = _b.conditionalRule, _j = _b.visitedDirs, visitedDirs = _j === void 0 ? new Set() : _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    if (visitedDirs.has(rulesDir)) {
                        return [2 /*return*/, []];
                    }
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 15, , 16]);
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    _c = (0, fsOperations_js_1.safeResolvePath)(fs, rulesDir), resolvedRulesDir = _c.resolvedPath, isSymlink = _c.isSymlink;
                    visitedDirs.add(rulesDir);
                    if (isSymlink) {
                        visitedDirs.add(resolvedRulesDir);
                    }
                    result = [];
                    entries = void 0;
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readdir(resolvedRulesDir)];
                case 3:
                    entries = _k.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _k.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code === 'ENOENT' || code === 'EACCES' || code === 'ENOTDIR') {
                        return [2 /*return*/, []];
                    }
                    throw e_1;
                case 5:
                    _i = 0, entries_1 = entries;
                    _k.label = 6;
                case 6:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 14];
                    entry = entries_1[_i];
                    entryPath = (0, path_1.join)(rulesDir, entry.name);
                    _d = (0, fsOperations_js_1.safeResolvePath)(fs, entryPath), resolvedEntryPath = _d.resolvedPath, isSymlink_1 = _d.isSymlink;
                    if (!isSymlink_1) return [3 /*break*/, 8];
                    return [4 /*yield*/, fs.stat(resolvedEntryPath)];
                case 7:
                    _e = _k.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _e = null;
                    _k.label = 9;
                case 9:
                    stats = _e;
                    isDirectory = stats ? stats.isDirectory() : entry.isDirectory();
                    isFile = stats ? stats.isFile() : entry.isFile();
                    if (!isDirectory) return [3 /*break*/, 11];
                    _g = (_f = result.push).apply;
                    _h = [result];
                    return [4 /*yield*/, processMdRules({
                            rulesDir: resolvedEntryPath,
                            type: type,
                            processedPaths: processedPaths,
                            includeExternal: includeExternal,
                            conditionalRule: conditionalRule,
                            visitedDirs: visitedDirs,
                        })];
                case 10:
                    _g.apply(_f, _h.concat([(_k.sent())]));
                    return [3 /*break*/, 13];
                case 11:
                    if (!(isFile && entry.name.endsWith('.md'))) return [3 /*break*/, 13];
                    return [4 /*yield*/, processMemoryFile(resolvedEntryPath, type, processedPaths, includeExternal)];
                case 12:
                    files = _k.sent();
                    result.push.apply(result, files.filter(function (f) { return (conditionalRule ? f.globs : !f.globs); }));
                    _k.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 6];
                case 14: return [2 /*return*/, result];
                case 15:
                    error_2 = _k.sent();
                    if (error_2 instanceof Error && error_2.message.includes('EACCES')) {
                        (0, index_js_1.logEvent)('tengu_claude_rules_md_permission_error', {
                            is_access_error: 1,
                            has_home_dir: rulesDir.includes((0, envUtils_js_1.getClaudeConfigHomeDir)()) ? 1 : 0,
                        });
                    }
                    return [2 /*return*/, []];
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.getMemoryFiles = (0, memoize_js_1.default)(function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (forceIncludeExternal) {
        var startTime, result, processedPaths, config, includeExternal, managedClaudeMd, _a, _b, _c, managedClaudeRulesDir, _d, _e, _f, userClaudeMd, _g, _h, _j, userClaudeRulesDir, _k, _l, _m, dirs, originalCwd, currentDir, gitRoot, canonicalRoot, isNestedWorktree, _o, _p, dir, skipProject, projectPath, _q, _r, _s, dotClaudePath, _t, _u, _v, rulesDir, _w, _x, _y, localPath, _z, _0, _1, additionalDirs, _2, additionalDirs_1, dir, projectPath, _3, _4, _5, dotClaudePath, _6, _7, _8, rulesDir, _9, _10, _11, memdirEntry, normalizedPath, teamMemEntry, normalizedPath, totalContentLength, typeCounts, _12, result_1, f, eagerLoadReason, _13, result_2, file, loadReason;
        var _14, _15, _16, _17, _18, _19, _20;
        if (forceIncludeExternal === void 0) { forceIncludeExternal = false; }
        return __generator(this, function (_21) {
            switch (_21.label) {
                case 0:
                    startTime = Date.now();
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'memory_files_started');
                    result = [];
                    processedPaths = new Set();
                    config = (0, config_js_1.getCurrentProjectConfig)();
                    includeExternal = forceIncludeExternal ||
                        config.hasClaudeMdExternalIncludesApproved ||
                        false;
                    managedClaudeMd = (0, config_js_1.getMemoryPath)('Managed');
                    _b = (_a = result.push).apply;
                    _c = [result];
                    return [4 /*yield*/, processMemoryFile(managedClaudeMd, 'Managed', processedPaths, includeExternal)];
                case 1:
                    _b.apply(_a, _c.concat([(_21.sent())]));
                    managedClaudeRulesDir = (0, config_js_1.getManagedClaudeRulesDir)();
                    _e = (_d = result.push).apply;
                    _f = [result];
                    return [4 /*yield*/, processMdRules({
                            rulesDir: managedClaudeRulesDir,
                            type: 'Managed',
                            processedPaths: processedPaths,
                            includeExternal: includeExternal,
                            conditionalRule: false,
                        })];
                case 2:
                    _e.apply(_d, _f.concat([(_21.sent())]));
                    if (!(0, constants_js_1.isSettingSourceEnabled)('userSettings')) return [3 /*break*/, 5];
                    userClaudeMd = (0, config_js_1.getMemoryPath)('User');
                    _h = (_g = result.push).apply;
                    _j = [result];
                    return [4 /*yield*/, processMemoryFile(userClaudeMd, 'User', processedPaths, true)];
                case 3:
                    _h.apply(_g, _j.concat([(_21.sent())]));
                    userClaudeRulesDir = (0, config_js_1.getUserClaudeRulesDir)();
                    _l = (_k = result.push).apply;
                    _m = [result];
                    return [4 /*yield*/, processMdRules({
                            rulesDir: userClaudeRulesDir,
                            type: 'User',
                            processedPaths: processedPaths,
                            includeExternal: true,
                            conditionalRule: false,
                        })];
                case 4:
                    _l.apply(_k, _m.concat([(_21.sent())]));
                    _21.label = 5;
                case 5:
                    dirs = [];
                    originalCwd = (0, state_js_1.getOriginalCwd)();
                    currentDir = originalCwd;
                    while (currentDir !== (0, path_1.parse)(currentDir).root) {
                        dirs.push(currentDir);
                        currentDir = (0, path_1.dirname)(currentDir);
                    }
                    gitRoot = (0, git_js_1.findGitRoot)(originalCwd);
                    canonicalRoot = (0, git_js_1.findCanonicalGitRoot)(originalCwd);
                    isNestedWorktree = gitRoot !== null &&
                        canonicalRoot !== null &&
                        (0, file_js_1.normalizePathForComparison)(gitRoot) !==
                            (0, file_js_1.normalizePathForComparison)(canonicalRoot) &&
                        (0, filesystem_js_1.pathInWorkingPath)(gitRoot, canonicalRoot);
                    _o = 0, _p = dirs.reverse();
                    _21.label = 6;
                case 6:
                    if (!(_o < _p.length)) return [3 /*break*/, 13];
                    dir = _p[_o];
                    skipProject = isNestedWorktree &&
                        (0, filesystem_js_1.pathInWorkingPath)(dir, canonicalRoot) &&
                        !(0, filesystem_js_1.pathInWorkingPath)(dir, gitRoot);
                    if (!((0, constants_js_1.isSettingSourceEnabled)('projectSettings') && !skipProject)) return [3 /*break*/, 10];
                    projectPath = (0, path_1.join)(dir, 'CLAUDE.md');
                    _r = (_q = result.push).apply;
                    _s = [result];
                    return [4 /*yield*/, processMemoryFile(projectPath, 'Project', processedPaths, includeExternal)];
                case 7:
                    _r.apply(_q, _s.concat([(_21.sent())]));
                    dotClaudePath = (0, path_1.join)(dir, '.claude', 'CLAUDE.md');
                    _u = (_t = result.push).apply;
                    _v = [result];
                    return [4 /*yield*/, processMemoryFile(dotClaudePath, 'Project', processedPaths, includeExternal)];
                case 8:
                    _u.apply(_t, _v.concat([(_21.sent())]));
                    rulesDir = (0, path_1.join)(dir, '.claude', 'rules');
                    _x = (_w = result.push).apply;
                    _y = [result];
                    return [4 /*yield*/, processMdRules({
                            rulesDir: rulesDir,
                            type: 'Project',
                            processedPaths: processedPaths,
                            includeExternal: includeExternal,
                            conditionalRule: false,
                        })];
                case 9:
                    _x.apply(_w, _y.concat([(_21.sent())]));
                    _21.label = 10;
                case 10:
                    if (!(0, constants_js_1.isSettingSourceEnabled)('localSettings')) return [3 /*break*/, 12];
                    localPath = (0, path_1.join)(dir, 'CLAUDE.local.md');
                    _0 = (_z = result.push).apply;
                    _1 = [result];
                    return [4 /*yield*/, processMemoryFile(localPath, 'Local', processedPaths, includeExternal)];
                case 11:
                    _0.apply(_z, _1.concat([(_21.sent())]));
                    _21.label = 12;
                case 12:
                    _o++;
                    return [3 /*break*/, 6];
                case 13:
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD)) return [3 /*break*/, 19];
                    additionalDirs = (0, state_js_1.getAdditionalDirectoriesForClaudeMd)();
                    _2 = 0, additionalDirs_1 = additionalDirs;
                    _21.label = 14;
                case 14:
                    if (!(_2 < additionalDirs_1.length)) return [3 /*break*/, 19];
                    dir = additionalDirs_1[_2];
                    projectPath = (0, path_1.join)(dir, 'CLAUDE.md');
                    _4 = (_3 = result.push).apply;
                    _5 = [result];
                    return [4 /*yield*/, processMemoryFile(projectPath, 'Project', processedPaths, includeExternal)];
                case 15:
                    _4.apply(_3, _5.concat([(_21.sent())]));
                    dotClaudePath = (0, path_1.join)(dir, '.claude', 'CLAUDE.md');
                    _7 = (_6 = result.push).apply;
                    _8 = [result];
                    return [4 /*yield*/, processMemoryFile(dotClaudePath, 'Project', processedPaths, includeExternal)];
                case 16:
                    _7.apply(_6, _8.concat([(_21.sent())]));
                    rulesDir = (0, path_1.join)(dir, '.claude', 'rules');
                    _10 = (_9 = result.push).apply;
                    _11 = [result];
                    return [4 /*yield*/, processMdRules({
                            rulesDir: rulesDir,
                            type: 'Project',
                            processedPaths: processedPaths,
                            includeExternal: includeExternal,
                            conditionalRule: false,
                        })];
                case 17:
                    _10.apply(_9, _11.concat([(_21.sent())]));
                    _21.label = 18;
                case 18:
                    _2++;
                    return [3 /*break*/, 14];
                case 19:
                    if (!(0, paths_js_1.isAutoMemoryEnabled)()) return [3 /*break*/, 21];
                    return [4 /*yield*/, safelyReadMemoryFileAsync((0, paths_js_1.getAutoMemEntrypoint)(), 'AutoMem')];
                case 20:
                    memdirEntry = (_21.sent()).info;
                    if (memdirEntry) {
                        normalizedPath = (0, file_js_1.normalizePathForComparison)(memdirEntry.path);
                        if (!processedPaths.has(normalizedPath)) {
                            processedPaths.add(normalizedPath);
                            result.push(memdirEntry);
                        }
                    }
                    _21.label = 21;
                case 21:
                    if (!((0, bun_bundle_1.feature)('TEAMMEM') && teamMemPaths.isTeamMemoryEnabled())) return [3 /*break*/, 23];
                    return [4 /*yield*/, safelyReadMemoryFileAsync(teamMemPaths.getTeamMemEntrypoint(), 'TeamMem')];
                case 22:
                    teamMemEntry = (_21.sent()).info;
                    if (teamMemEntry) {
                        normalizedPath = (0, file_js_1.normalizePathForComparison)(teamMemEntry.path);
                        if (!processedPaths.has(normalizedPath)) {
                            processedPaths.add(normalizedPath);
                            result.push(teamMemEntry);
                        }
                    }
                    _21.label = 23;
                case 23:
                    totalContentLength = result.reduce(function (sum, f) { return sum + f.content.length; }, 0);
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'memory_files_completed', {
                        duration_ms: Date.now() - startTime,
                        file_count: result.length,
                        total_content_length: totalContentLength,
                    });
                    typeCounts = {};
                    for (_12 = 0, result_1 = result; _12 < result_1.length; _12++) {
                        f = result_1[_12];
                        typeCounts[f.type] = ((_14 = typeCounts[f.type]) !== null && _14 !== void 0 ? _14 : 0) + 1;
                    }
                    if (!hasLoggedInitialLoad) {
                        hasLoggedInitialLoad = true;
                        (0, index_js_1.logEvent)('tengu_claudemd__initial_load', __assign(__assign({ file_count: result.length, total_content_length: totalContentLength, user_count: (_15 = typeCounts['User']) !== null && _15 !== void 0 ? _15 : 0, project_count: (_16 = typeCounts['Project']) !== null && _16 !== void 0 ? _16 : 0, local_count: (_17 = typeCounts['Local']) !== null && _17 !== void 0 ? _17 : 0, managed_count: (_18 = typeCounts['Managed']) !== null && _18 !== void 0 ? _18 : 0, automem_count: (_19 = typeCounts['AutoMem']) !== null && _19 !== void 0 ? _19 : 0 }, ((0, bun_bundle_1.feature)('TEAMMEM')
                            ? { teammem_count: (_20 = typeCounts['TeamMem']) !== null && _20 !== void 0 ? _20 : 0 }
                            : {})), { duration_ms: Date.now() - startTime }));
                    }
                    // Fire InstructionsLoaded hook for each instruction file loaded
                    // (fire-and-forget, audit/observability only).
                    // AutoMem/TeamMem are intentionally excluded — they're a separate
                    // memory system, not "instructions" in the CLAUDE.md/rules sense.
                    // Gated on !forceIncludeExternal: the forceIncludeExternal=true variant
                    // is only used by getExternalClaudeMdIncludes() for approval checks, not
                    // for building context — firing the hook there would double-fire on startup.
                    // The one-shot flag is consumed on every !forceIncludeExternal cache miss
                    // (NOT gated on hasInstructionsLoadedHook) so the flag is released even
                    // when no hook is configured — otherwise a mid-session hook registration
                    // followed by a direct .cache.clear() would spuriously fire with a stale
                    // 'session_start' reason.
                    if (!forceIncludeExternal) {
                        eagerLoadReason = consumeNextEagerLoadReason();
                        if (eagerLoadReason !== undefined && (0, hooks_js_1.hasInstructionsLoadedHook)()) {
                            for (_13 = 0, result_2 = result; _13 < result_2.length; _13++) {
                                file = result_2[_13];
                                if (!isInstructionsMemoryType(file.type))
                                    continue;
                                loadReason = file.parent ? 'include' : eagerLoadReason;
                                void (0, hooks_js_1.executeInstructionsLoadedHooks)(file.path, file.type, loadReason, {
                                    globs: file.globs,
                                    parentFilePath: file.parent,
                                });
                            }
                        }
                    }
                    return [2 /*return*/, result];
            }
        });
    });
});
function isInstructionsMemoryType(type) {
    return (type === 'User' ||
        type === 'Project' ||
        type === 'Local' ||
        type === 'Managed');
}
// Load reason to report for top-level (non-included) files on the next eager
// getMemoryFiles() pass. Set to 'compact' by resetGetMemoryFilesCache when
// compaction clears the cache, so the InstructionsLoaded hook reports the
// reload correctly instead of misreporting it as 'session_start'. One-shot:
// reset to 'session_start' after being read.
var nextEagerLoadReason = 'session_start';
// Whether the InstructionsLoaded hook should fire on the next cache miss.
// true initially (for session_start), consumed after firing, re-enabled only
// by resetGetMemoryFilesCache(). Callers that only need cache invalidation
// for correctness (e.g. worktree enter/exit, settings sync, /memory dialog)
// should use clearMemoryFileCaches() instead to avoid spurious hook fires.
var shouldFireHook = true;
function consumeNextEagerLoadReason() {
    if (!shouldFireHook)
        return undefined;
    shouldFireHook = false;
    var reason = nextEagerLoadReason;
    nextEagerLoadReason = 'session_start';
    return reason;
}
/**
 * Clears the getMemoryFiles memoize cache
 * without firing the InstructionsLoaded hook.
 *
 * Use this for cache invalidation that is purely for correctness (e.g.
 * worktree enter/exit, settings sync, /memory dialog). For events that
 * represent instructions actually being reloaded into context (e.g.
 * compaction), use resetGetMemoryFilesCache() instead.
 */
function clearMemoryFileCaches() {
    var _a, _b;
    // ?.cache because tests spyOn this, which replaces the memoize wrapper.
    (_b = (_a = exports.getMemoryFiles.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
function resetGetMemoryFilesCache(reason) {
    if (reason === void 0) { reason = 'session_start'; }
    nextEagerLoadReason = reason;
    shouldFireHook = true;
    clearMemoryFileCaches();
}
function getLargeMemoryFiles(files) {
    return files.filter(function (f) { return f.content.length > exports.MAX_MEMORY_CHARACTER_COUNT; });
}
/**
 * When tengu_moth_copse is on, the findRelevantMemories prefetch surfaces
 * memory files via attachments, so the MEMORY.md index is no longer injected
 * into the system prompt. Callsites that care about "what's actually in
 * context" (context builder, /context viz) should filter through this.
 */
function filterInjectedMemoryFiles(files) {
    var skipMemoryIndex = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_moth_copse', false);
    if (!skipMemoryIndex)
        return files;
    return files.filter(function (f) { return f.type !== 'AutoMem' && f.type !== 'TeamMem'; });
}
var getClaudeMds = function (memoryFiles, filter) {
    var memories = [];
    var skipProjectLevel = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_paper_halyard', false);
    for (var _i = 0, memoryFiles_1 = memoryFiles; _i < memoryFiles_1.length; _i++) {
        var file = memoryFiles_1[_i];
        if (filter && !filter(file.type))
            continue;
        if (skipProjectLevel && (file.type === 'Project' || file.type === 'Local'))
            continue;
        if (file.content) {
            var description = file.type === 'Project'
                ? ' (project instructions, checked into the codebase)'
                : file.type === 'Local'
                    ? " (user's private project instructions, not checked in)"
                    : (0, bun_bundle_1.feature)('TEAMMEM') && file.type === 'TeamMem'
                        ? ' (shared team memory, synced across the organization)'
                        : file.type === 'AutoMem'
                            ? " (user's auto-memory, persists across conversations)"
                            : " (user's private global instructions for all projects)";
            var content = file.content.trim();
            if ((0, bun_bundle_1.feature)('TEAMMEM') && file.type === 'TeamMem') {
                memories.push("Contents of ".concat(file.path).concat(description, ":\n\n<team-memory-content source=\"shared\">\n").concat(content, "\n</team-memory-content>"));
            }
            else {
                memories.push("Contents of ".concat(file.path).concat(description, ":\n\n").concat(content));
            }
        }
    }
    if (memories.length === 0) {
        return '';
    }
    return "".concat(MEMORY_INSTRUCTION_PROMPT, "\n\n").concat(memories.join('\n\n'));
};
exports.getClaudeMds = getClaudeMds;
/**
 * Gets managed and user conditional rules that match the target path.
 * This is the first phase of nested memory loading.
 *
 * @param targetPath The target file path to match against glob patterns
 * @param processedPaths Set of already processed file paths (will be mutated)
 * @returns Array of MemoryFileInfo objects for matching conditional rules
 */
function getManagedAndUserConditionalRules(targetPath, processedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var result, managedClaudeRulesDir, _a, _b, _c, userClaudeRulesDir, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    result = [];
                    managedClaudeRulesDir = (0, config_js_1.getManagedClaudeRulesDir)();
                    _b = (_a = result.push).apply;
                    _c = [result];
                    return [4 /*yield*/, processConditionedMdRules(targetPath, managedClaudeRulesDir, 'Managed', processedPaths, false)];
                case 1:
                    _b.apply(_a, _c.concat([(_g.sent())]));
                    if (!(0, constants_js_1.isSettingSourceEnabled)('userSettings')) return [3 /*break*/, 3];
                    userClaudeRulesDir = (0, config_js_1.getUserClaudeRulesDir)();
                    _e = (_d = result.push).apply;
                    _f = [result];
                    return [4 /*yield*/, processConditionedMdRules(targetPath, userClaudeRulesDir, 'User', processedPaths, true)];
                case 2:
                    _e.apply(_d, _f.concat([(_g.sent())]));
                    _g.label = 3;
                case 3: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Gets memory files for a single nested directory (between CWD and target).
 * Loads CLAUDE.md, unconditional rules, and conditional rules for that directory.
 *
 * @param dir The directory to process
 * @param targetPath The target file path (for conditional rule matching)
 * @param processedPaths Set of already processed file paths (will be mutated)
 * @returns Array of MemoryFileInfo objects
 */
function getMemoryFilesForNestedDirectory(dir, targetPath, processedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var result, projectPath, _a, _b, _c, dotClaudePath, _d, _e, _f, localPath, _g, _h, _j, rulesDir, unconditionalProcessedPaths, _k, _l, _m, _o, _p, _q, _i, unconditionalProcessedPaths_1, path;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    result = [];
                    if (!(0, constants_js_1.isSettingSourceEnabled)('projectSettings')) return [3 /*break*/, 3];
                    projectPath = (0, path_1.join)(dir, 'CLAUDE.md');
                    _b = (_a = result.push).apply;
                    _c = [result];
                    return [4 /*yield*/, processMemoryFile(projectPath, 'Project', processedPaths, false)];
                case 1:
                    _b.apply(_a, _c.concat([(_r.sent())]));
                    dotClaudePath = (0, path_1.join)(dir, '.claude', 'CLAUDE.md');
                    _e = (_d = result.push).apply;
                    _f = [result];
                    return [4 /*yield*/, processMemoryFile(dotClaudePath, 'Project', processedPaths, false)];
                case 2:
                    _e.apply(_d, _f.concat([(_r.sent())]));
                    _r.label = 3;
                case 3:
                    if (!(0, constants_js_1.isSettingSourceEnabled)('localSettings')) return [3 /*break*/, 5];
                    localPath = (0, path_1.join)(dir, 'CLAUDE.local.md');
                    _h = (_g = result.push).apply;
                    _j = [result];
                    return [4 /*yield*/, processMemoryFile(localPath, 'Local', processedPaths, false)];
                case 4:
                    _h.apply(_g, _j.concat([(_r.sent())]));
                    _r.label = 5;
                case 5:
                    rulesDir = (0, path_1.join)(dir, '.claude', 'rules');
                    unconditionalProcessedPaths = new Set(processedPaths);
                    _l = (_k = result.push).apply;
                    _m = [result];
                    return [4 /*yield*/, processMdRules({
                            rulesDir: rulesDir,
                            type: 'Project',
                            processedPaths: unconditionalProcessedPaths,
                            includeExternal: false,
                            conditionalRule: false,
                        })];
                case 6:
                    _l.apply(_k, _m.concat([(_r.sent())]));
                    _p = 
                    // Process project conditional .claude/rules/*.md files
                    (_o = result.push).apply;
                    _q = [
                        // Process project conditional .claude/rules/*.md files
                        result];
                    return [4 /*yield*/, processConditionedMdRules(targetPath, rulesDir, 'Project', processedPaths, false)];
                case 7:
                    // Process project conditional .claude/rules/*.md files
                    _p.apply(_o, _q.concat([(_r.sent())]));
                    // processedPaths must be seeded with unconditional paths for subsequent directories
                    for (_i = 0, unconditionalProcessedPaths_1 = unconditionalProcessedPaths; _i < unconditionalProcessedPaths_1.length; _i++) {
                        path = unconditionalProcessedPaths_1[_i];
                        processedPaths.add(path);
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Gets conditional rules for a CWD-level directory (from root up to CWD).
 * Only processes conditional rules since unconditional rules are already loaded eagerly.
 *
 * @param dir The directory to process
 * @param targetPath The target file path (for conditional rule matching)
 * @param processedPaths Set of already processed file paths (will be mutated)
 * @returns Array of MemoryFileInfo objects
 */
function getConditionalRulesForCwdLevelDirectory(dir, targetPath, processedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var rulesDir;
        return __generator(this, function (_a) {
            rulesDir = (0, path_1.join)(dir, '.claude', 'rules');
            return [2 /*return*/, processConditionedMdRules(targetPath, rulesDir, 'Project', processedPaths, false)];
        });
    });
}
/**
 * Processes all .md files in the .claude/rules/ directory and its subdirectories,
 * filtering to only include files with frontmatter paths that match the target path
 * @param targetPath The file path to match against frontmatter glob patterns
 * @param rulesDir The path to the rules directory
 * @param type Type of memory file (User, Project, Local)
 * @param processedPaths Set of already processed file paths
 * @param includeExternal Whether to include external files
 * @returns Array of MemoryFileInfo objects that match the target path
 */
function processConditionedMdRules(targetPath, rulesDir, type, processedPaths, includeExternal) {
    return __awaiter(this, void 0, void 0, function () {
        var conditionedRuleMdFiles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, processMdRules({
                        rulesDir: rulesDir,
                        type: type,
                        processedPaths: processedPaths,
                        includeExternal: includeExternal,
                        conditionalRule: true,
                    })
                    // Filter to only include files whose globs patterns match the targetPath
                ];
                case 1:
                    conditionedRuleMdFiles = _a.sent();
                    // Filter to only include files whose globs patterns match the targetPath
                    return [2 /*return*/, conditionedRuleMdFiles.filter(function (file) {
                            if (!file.globs || file.globs.length === 0) {
                                return false;
                            }
                            // For Project rules: glob patterns are relative to the directory containing .claude
                            // For Managed/User rules: glob patterns are relative to the original CWD
                            var baseDir = type === 'Project'
                                ? (0, path_1.dirname)((0, path_1.dirname)(rulesDir)) // Parent of .claude
                                : (0, state_js_1.getOriginalCwd)(); // Project root for managed/user rules
                            var relativePath = (0, path_1.isAbsolute)(targetPath)
                                ? (0, path_1.relative)(baseDir, targetPath)
                                : targetPath;
                            // ignore() throws on empty strings, paths escaping the base (../),
                            // and absolute paths (Windows cross-drive relative() returns absolute).
                            // Files outside baseDir can't match baseDir-relative globs anyway.
                            if (!relativePath ||
                                relativePath.startsWith('..') ||
                                (0, path_1.isAbsolute)(relativePath)) {
                                return false;
                            }
                            return (0, ignore_1.default)().add(file.globs).ignores(relativePath);
                        })];
            }
        });
    });
}
function getExternalClaudeMdIncludes(files) {
    var externals = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (file.type !== 'User' && file.parent && !pathInOriginalCwd(file.path)) {
            externals.push({ path: file.path, parent: file.parent });
        }
    }
    return externals;
}
function hasExternalClaudeMdIncludes(files) {
    return getExternalClaudeMdIncludes(files).length > 0;
}
function shouldShowClaudeMdExternalIncludesWarning() {
    return __awaiter(this, void 0, void 0, function () {
        var config, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    config = (0, config_js_1.getCurrentProjectConfig)();
                    if (config.hasClaudeMdExternalIncludesApproved ||
                        config.hasClaudeMdExternalIncludesWarningShown) {
                        return [2 /*return*/, false];
                    }
                    _a = hasExternalClaudeMdIncludes;
                    return [4 /*yield*/, (0, exports.getMemoryFiles)(true)];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    });
}
/**
 * Check if a file path is a memory file (CLAUDE.md, CLAUDE.local.md, or .claude/rules/*.md)
 */
function isMemoryFilePath(filePath) {
    var name = (0, path_1.basename)(filePath);
    // CLAUDE.md or CLAUDE.local.md anywhere
    if (name === 'CLAUDE.md' || name === 'CLAUDE.local.md') {
        return true;
    }
    // .md files in .claude/rules/ directories
    if (name.endsWith('.md') &&
        filePath.includes("".concat(path_1.sep, ".claude").concat(path_1.sep, "rules").concat(path_1.sep))) {
        return true;
    }
    return false;
}
/**
 * Get all memory file paths from both standard discovery and readFileState.
 * Combines:
 * - getMemoryFiles() paths (CWD upward to root)
 * - readFileState paths matching memory patterns (includes child directories)
 */
function getAllMemoryFilePaths(files, readFileState) {
    var paths = new Set();
    for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
        var file = files_2[_i];
        if (file.content.trim().length > 0) {
            paths.add(file.path);
        }
    }
    // Add memory files from readFileState (includes child directories)
    for (var _a = 0, _b = (0, fileStateCache_js_1.cacheKeys)(readFileState); _a < _b.length; _a++) {
        var filePath = _b[_a];
        if (isMemoryFilePath(filePath)) {
            paths.add(filePath);
        }
    }
    return Array.from(paths);
}
