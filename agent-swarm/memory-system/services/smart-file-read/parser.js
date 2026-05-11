"use strict";
/**
 * Code structure parser — shells out to tree-sitter CLI for AST-based extraction.
 *
 * No native bindings. No WASM. Just the CLI binary + query patterns.
 *
 * Supported: JS, TS, Python, Go, Rust, Ruby, Java, C, C++
 *
 * by Copter Labs
 */
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
exports.detectLanguage = detectLanguage;
exports.parseFile = parseFile;
exports.parseFilesBatch = parseFilesBatch;
exports.formatFoldedView = formatFoldedView;
exports.unfoldSymbol = unfoldSymbol;
var node_child_process_1 = require("node:child_process");
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_os_1 = require("node:os");
var node_module_1 = require("node:module");
// CJS-safe require for resolving external packages at runtime.
// In ESM: import.meta.url works. In CJS bundle (esbuild): __filename works.
// typeof check avoids ReferenceError in ESM where __filename doesn't exist.
var _require = typeof __filename !== 'undefined'
    ? (0, node_module_1.createRequire)(__filename)
    : (0, node_module_1.createRequire)(import.meta.url);
// --- Language detection ---
var LANG_MAP = {
    ".js": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".jsx": "tsx",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".py": "python",
    ".pyw": "python",
    ".go": "go",
    ".rs": "rust",
    ".rb": "ruby",
    ".java": "java",
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".hpp": "cpp",
    ".hh": "cpp",
};
function detectLanguage(filePath) {
    var ext = filePath.slice(filePath.lastIndexOf("."));
    return LANG_MAP[ext] || "unknown";
}
// --- Grammar path resolution ---
var GRAMMAR_PACKAGES = {
    javascript: "tree-sitter-javascript",
    typescript: "tree-sitter-typescript/typescript",
    tsx: "tree-sitter-typescript/tsx",
    python: "tree-sitter-python",
    go: "tree-sitter-go",
    rust: "tree-sitter-rust",
    ruby: "tree-sitter-ruby",
    java: "tree-sitter-java",
    c: "tree-sitter-c",
    cpp: "tree-sitter-cpp",
};
function resolveGrammarPath(language) {
    var pkg = GRAMMAR_PACKAGES[language];
    if (!pkg)
        return null;
    try {
        var packageJsonPath = _require.resolve(pkg + "/package.json");
        return (0, node_path_1.dirname)(packageJsonPath);
    }
    catch (_a) {
        return null;
    }
}
// --- Query patterns (declarative symbol extraction) ---
var QUERIES = {
    jsts: "\n(function_declaration name: (identifier) @name) @func\n(lexical_declaration (variable_declarator name: (identifier) @name value: [(arrow_function) (function_expression)])) @const_func\n(class_declaration name: (type_identifier) @name) @cls\n(method_definition name: (property_identifier) @name) @method\n(interface_declaration name: (type_identifier) @name) @iface\n(type_alias_declaration name: (type_identifier) @name) @tdef\n(enum_declaration name: (identifier) @name) @enm\n(import_statement) @imp\n(export_statement) @exp\n",
    python: "\n(function_definition name: (identifier) @name) @func\n(class_definition name: (identifier) @name) @cls\n(import_statement) @imp\n(import_from_statement) @imp\n",
    go: "\n(function_declaration name: (identifier) @name) @func\n(method_declaration name: (field_identifier) @name) @method\n(type_declaration (type_spec name: (type_identifier) @name)) @tdef\n(import_declaration) @imp\n",
    rust: "\n(function_item name: (identifier) @name) @func\n(struct_item name: (type_identifier) @name) @struct_def\n(enum_item name: (type_identifier) @name) @enm\n(trait_item name: (type_identifier) @name) @trait_def\n(impl_item type: (type_identifier) @name) @impl_def\n(use_declaration) @imp\n",
    ruby: "\n(method name: (identifier) @name) @func\n(class name: (constant) @name) @cls\n(module name: (constant) @name) @cls\n(call method: (identifier) @name) @imp\n",
    java: "\n(method_declaration name: (identifier) @name) @method\n(class_declaration name: (identifier) @name) @cls\n(interface_declaration name: (identifier) @name) @iface\n(enum_declaration name: (identifier) @name) @enm\n(import_declaration) @imp\n",
    generic: "\n(function_declaration name: (identifier) @name) @func\n(function_definition name: (identifier) @name) @func\n(class_declaration name: (identifier) @name) @cls\n(class_definition name: (identifier) @name) @cls\n(import_statement) @imp\n(import_declaration) @imp\n",
};
function getQueryKey(language) {
    switch (language) {
        case "javascript":
        case "typescript":
        case "tsx":
            return "jsts";
        case "python": return "python";
        case "go": return "go";
        case "rust": return "rust";
        case "ruby": return "ruby";
        case "java": return "java";
        default: return "generic";
    }
}
// --- Temp file management ---
var queryTmpDir = null;
var queryFileCache = new Map();
function getQueryFile(queryKey) {
    if (queryFileCache.has(queryKey))
        return queryFileCache.get(queryKey);
    if (!queryTmpDir) {
        queryTmpDir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "smart-read-queries-"));
    }
    var filePath = (0, node_path_1.join)(queryTmpDir, "".concat(queryKey, ".scm"));
    (0, node_fs_1.writeFileSync)(filePath, QUERIES[queryKey]);
    queryFileCache.set(queryKey, filePath);
    return filePath;
}
// --- CLI execution ---
var cachedBinPath = null;
function getTreeSitterBin() {
    if (cachedBinPath)
        return cachedBinPath;
    // Try direct binary from tree-sitter-cli package
    try {
        var pkgPath = _require.resolve("tree-sitter-cli/package.json");
        var binPath = (0, node_path_1.join)((0, node_path_1.dirname)(pkgPath), "tree-sitter");
        if ((0, node_fs_1.existsSync)(binPath)) {
            cachedBinPath = binPath;
            return binPath;
        }
    }
    catch ( /* fall through */_a) { /* fall through */ }
    // Fallback: assume it's on PATH
    cachedBinPath = "tree-sitter";
    return cachedBinPath;
}
function runQuery(queryFile, sourceFile, grammarPath) {
    var result = runBatchQuery(queryFile, [sourceFile], grammarPath);
    return result.get(sourceFile) || [];
}
function runBatchQuery(queryFile, sourceFiles, grammarPath) {
    if (sourceFiles.length === 0)
        return new Map();
    var bin = getTreeSitterBin();
    var execArgs = __spreadArray(["query", "-p", grammarPath, queryFile], sourceFiles, true);
    var output;
    try {
        output = (0, node_child_process_1.execFileSync)(bin, execArgs, { encoding: "utf-8", timeout: 30000, stdio: ["pipe", "pipe", "pipe"] });
    }
    catch (_a) {
        return new Map();
    }
    return parseMultiFileQueryOutput(output);
}
function parseMultiFileQueryOutput(output) {
    var fileMatches = new Map();
    var currentFile = null;
    var currentMatch = null;
    for (var _i = 0, _a = output.split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        // File header: a line that doesn't start with whitespace and isn't empty
        if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
            currentFile = line.trim();
            if (!fileMatches.has(currentFile)) {
                fileMatches.set(currentFile, []);
            }
            currentMatch = null;
            continue;
        }
        if (!currentFile)
            continue;
        var patternMatch = line.match(/^\s+pattern:\s+(\d+)/);
        if (patternMatch) {
            currentMatch = { pattern: parseInt(patternMatch[1]), captures: [] };
            fileMatches.get(currentFile).push(currentMatch);
            continue;
        }
        var captureMatch = line.match(/^\s+capture:\s+(?:\d+\s*-\s*)?(\w+),\s*start:\s*\((\d+),\s*(\d+)\),\s*end:\s*\((\d+),\s*(\d+)\)(?:,\s*text:\s*`([^`]*)`)?/);
        if (captureMatch && currentMatch) {
            currentMatch.captures.push({
                tag: captureMatch[1],
                startRow: parseInt(captureMatch[2]),
                startCol: parseInt(captureMatch[3]),
                endRow: parseInt(captureMatch[4]),
                endCol: parseInt(captureMatch[5]),
                text: captureMatch[6],
            });
        }
    }
    return fileMatches;
}
// --- Symbol building ---
var KIND_MAP = {
    func: "function",
    const_func: "function",
    cls: "class",
    method: "method",
    iface: "interface",
    tdef: "type",
    enm: "enum",
    struct_def: "struct",
    trait_def: "trait",
    impl_def: "impl",
};
var CONTAINER_KINDS = new Set(["class", "struct", "impl", "trait"]);
function extractSignatureFromLines(lines, startRow, endRow, maxLen) {
    if (maxLen === void 0) { maxLen = 200; }
    var firstLine = lines[startRow] || "";
    var sig = firstLine;
    if (!sig.trimEnd().endsWith("{") && !sig.trimEnd().endsWith(":")) {
        var chunk = lines.slice(startRow, Math.min(startRow + 10, endRow + 1)).join("\n");
        var braceIdx = chunk.indexOf("{");
        if (braceIdx !== -1 && braceIdx < 500) {
            sig = chunk.slice(0, braceIdx).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        }
    }
    sig = sig.replace(/\s*[{:]\s*$/, "").trim();
    if (sig.length > maxLen)
        sig = sig.slice(0, maxLen - 3) + "...";
    return sig;
}
function findCommentAbove(lines, startRow) {
    var commentLines = [];
    var foundComment = false;
    for (var i = startRow - 1; i >= 0; i--) {
        var trimmed = lines[i].trim();
        if (trimmed === "") {
            if (foundComment)
                break;
            continue;
        }
        if (trimmed.startsWith("/**") || trimmed.startsWith("*") || trimmed.startsWith("*/") ||
            trimmed.startsWith("//") || trimmed.startsWith("///") || trimmed.startsWith("//!") ||
            trimmed.startsWith("#") || trimmed.startsWith("@")) {
            commentLines.unshift(lines[i]);
            foundComment = true;
        }
        else {
            break;
        }
    }
    return commentLines.length > 0 ? commentLines.join("\n").trim() : undefined;
}
function findPythonDocstringFromLines(lines, startRow, endRow) {
    var _a;
    for (var i = startRow + 1; i <= Math.min(startRow + 3, endRow); i++) {
        var trimmed = (_a = lines[i]) === null || _a === void 0 ? void 0 : _a.trim();
        if (!trimmed)
            continue;
        if (trimmed.startsWith('"""') || trimmed.startsWith("'''"))
            return trimmed;
        break;
    }
    return undefined;
}
function isExported(name, startRow, endRow, exportRanges, lines, language) {
    var _a, _b;
    switch (language) {
        case "javascript":
        case "typescript":
        case "tsx":
            return exportRanges.some(function (r) { return startRow >= r.startRow && endRow <= r.endRow; });
        case "python":
            return !name.startsWith("_");
        case "go":
            return name.length > 0 && name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase();
        case "rust":
            return (_b = (_a = lines[startRow]) === null || _a === void 0 ? void 0 : _a.trimStart().startsWith("pub")) !== null && _b !== void 0 ? _b : false;
        default:
            return true;
    }
}
function buildSymbols(matches, lines, language) {
    var _a;
    var symbols = [];
    var imports = [];
    var exportRanges = [];
    var containers = [];
    // Collect exports and imports
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        for (var _b = 0, _c = match.captures; _b < _c.length; _b++) {
            var cap = _c[_b];
            if (cap.tag === "exp") {
                exportRanges.push({ startRow: cap.startRow, endRow: cap.endRow });
            }
            if (cap.tag === "imp") {
                imports.push(cap.text || ((_a = lines[cap.startRow]) === null || _a === void 0 ? void 0 : _a.trim()) || "");
            }
        }
    }
    // Build symbols
    for (var _d = 0, matches_2 = matches; _d < matches_2.length; _d++) {
        var match = matches_2[_d];
        var kindCapture = match.captures.find(function (c) { return KIND_MAP[c.tag]; });
        var nameCapture = match.captures.find(function (c) { return c.tag === "name"; });
        if (!kindCapture)
            continue;
        var name_1 = (nameCapture === null || nameCapture === void 0 ? void 0 : nameCapture.text) || "anonymous";
        var startRow = kindCapture.startRow;
        var endRow = kindCapture.endRow;
        var kind = KIND_MAP[kindCapture.tag];
        var comment = findCommentAbove(lines, startRow);
        var docstring = language === "python" ? findPythonDocstringFromLines(lines, startRow, endRow) : undefined;
        var sym = {
            name: name_1,
            kind: kind,
            signature: extractSignatureFromLines(lines, startRow, endRow),
            jsdoc: comment || docstring,
            lineStart: startRow,
            lineEnd: endRow,
            exported: isExported(name_1, startRow, endRow, exportRanges, lines, language),
        };
        if (CONTAINER_KINDS.has(kind)) {
            sym.children = [];
            containers.push({ sym: sym, startRow: startRow, endRow: endRow });
        }
        symbols.push(sym);
    }
    // Nest methods inside containers
    var nested = new Set();
    for (var _e = 0, containers_1 = containers; _e < containers_1.length; _e++) {
        var container = containers_1[_e];
        for (var _f = 0, symbols_1 = symbols; _f < symbols_1.length; _f++) {
            var sym = symbols_1[_f];
            if (sym === container.sym)
                continue;
            if (sym.lineStart > container.startRow && sym.lineEnd <= container.endRow) {
                if (sym.kind === "function")
                    sym.kind = "method";
                container.sym.children.push(sym);
                nested.add(sym);
            }
        }
    }
    return { symbols: symbols.filter(function (s) { return !nested.has(s); }), imports: imports };
}
// --- Main parse functions ---
function parseFile(content, filePath) {
    var language = detectLanguage(filePath);
    var lines = content.split("\n");
    var grammarPath = resolveGrammarPath(language);
    if (!grammarPath) {
        return {
            filePath: filePath,
            language: language,
            symbols: [], imports: [],
            totalLines: lines.length, foldedTokenEstimate: 50,
        };
    }
    var queryKey = getQueryKey(language);
    var queryFile = getQueryFile(queryKey);
    // Write content to temp file with correct extension for language detection
    var ext = filePath.slice(filePath.lastIndexOf(".")) || ".txt";
    var tmpDir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "smart-src-"));
    var tmpFile = (0, node_path_1.join)(tmpDir, "source".concat(ext));
    (0, node_fs_1.writeFileSync)(tmpFile, content);
    try {
        var matches = runQuery(queryFile, tmpFile, grammarPath);
        var result = buildSymbols(matches, lines, language);
        var folded = formatFoldedView({
            filePath: filePath,
            language: language,
            symbols: result.symbols, imports: result.imports,
            totalLines: lines.length, foldedTokenEstimate: 0,
        });
        return {
            filePath: filePath,
            language: language,
            symbols: result.symbols, imports: result.imports,
            totalLines: lines.length,
            foldedTokenEstimate: Math.ceil(folded.length / 4),
        };
    }
    finally {
        (0, node_fs_1.rmSync)(tmpDir, { recursive: true, force: true });
    }
}
/**
 * Batch parse multiple on-disk files. Groups by language for one CLI call per language.
 * Much faster than calling parseFile() per file (one process spawn per language vs per file).
 */
function parseFilesBatch(files) {
    var results = new Map();
    // Group files by language (and thus by query + grammar)
    var languageGroups = new Map();
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var language = detectLanguage(file.relativePath);
        if (!languageGroups.has(language))
            languageGroups.set(language, []);
        languageGroups.get(language).push(file);
    }
    for (var _a = 0, languageGroups_1 = languageGroups; _a < languageGroups_1.length; _a++) {
        var _b = languageGroups_1[_a], language = _b[0], groupFiles = _b[1];
        var grammarPath = resolveGrammarPath(language);
        if (!grammarPath) {
            // No grammar — return empty results for these files
            for (var _c = 0, groupFiles_1 = groupFiles; _c < groupFiles_1.length; _c++) {
                var file = groupFiles_1[_c];
                var lines = file.content.split("\n");
                results.set(file.relativePath, {
                    filePath: file.relativePath,
                    language: language,
                    symbols: [], imports: [],
                    totalLines: lines.length, foldedTokenEstimate: 50,
                });
            }
            continue;
        }
        var queryKey = getQueryKey(language);
        var queryFile = getQueryFile(queryKey);
        // Run one batch query for all files of this language
        var absolutePaths = groupFiles.map(function (f) { return f.absolutePath; });
        var batchResults = runBatchQuery(queryFile, absolutePaths, grammarPath);
        // Build FoldedFile for each file using the batch results
        for (var _d = 0, groupFiles_2 = groupFiles; _d < groupFiles_2.length; _d++) {
            var file = groupFiles_2[_d];
            var lines = file.content.split("\n");
            var matches = batchResults.get(file.absolutePath) || [];
            var symbolResult = buildSymbols(matches, lines, language);
            var folded = formatFoldedView({
                filePath: file.relativePath,
                language: language,
                symbols: symbolResult.symbols, imports: symbolResult.imports,
                totalLines: lines.length, foldedTokenEstimate: 0,
            });
            results.set(file.relativePath, {
                filePath: file.relativePath,
                language: language,
                symbols: symbolResult.symbols, imports: symbolResult.imports,
                totalLines: lines.length,
                foldedTokenEstimate: Math.ceil(folded.length / 4),
            });
        }
    }
    return results;
}
// --- Formatting ---
function formatFoldedView(file) {
    var parts = [];
    parts.push("\uD83D\uDCC1 ".concat(file.filePath, " (").concat(file.language, ", ").concat(file.totalLines, " lines)"));
    parts.push("");
    if (file.imports.length > 0) {
        parts.push("  \uD83D\uDCE6 Imports: ".concat(file.imports.length, " statements"));
        for (var _i = 0, _a = file.imports.slice(0, 10); _i < _a.length; _i++) {
            var imp = _a[_i];
            parts.push("    ".concat(imp));
        }
        if (file.imports.length > 10) {
            parts.push("    ... +".concat(file.imports.length - 10, " more"));
        }
        parts.push("");
    }
    for (var _b = 0, _c = file.symbols; _b < _c.length; _b++) {
        var sym = _c[_b];
        parts.push(formatSymbol(sym, "  "));
    }
    return parts.join("\n");
}
function formatSymbol(sym, indent) {
    var parts = [];
    var icon = getSymbolIcon(sym.kind);
    var exportTag = sym.exported ? " [exported]" : "";
    var lineRange = sym.lineStart === sym.lineEnd
        ? "L".concat(sym.lineStart + 1)
        : "L".concat(sym.lineStart + 1, "-").concat(sym.lineEnd + 1);
    parts.push("".concat(indent).concat(icon, " ").concat(sym.name).concat(exportTag, " (").concat(lineRange, ")"));
    parts.push("".concat(indent, "  ").concat(sym.signature));
    if (sym.jsdoc) {
        var jsdocLines = sym.jsdoc.split("\n");
        var firstLine = jsdocLines.find(function (l) {
            var t = l.replace(/^[\s*/]+/, "").replace(/^['"`]{3}/, "").trim();
            return t.length > 0 && !t.startsWith("/**");
        });
        if (firstLine) {
            var cleaned = firstLine.replace(/^[\s*/]+/, "").replace(/^['"`]{3}/, "").replace(/['"`]{3}$/, "").trim();
            if (cleaned) {
                parts.push("".concat(indent, "  \uD83D\uDCAC ").concat(cleaned));
            }
        }
    }
    if (sym.children && sym.children.length > 0) {
        for (var _i = 0, _a = sym.children; _i < _a.length; _i++) {
            var child = _a[_i];
            parts.push(formatSymbol(child, indent + "  "));
        }
    }
    return parts.join("\n");
}
function getSymbolIcon(kind) {
    var icons = {
        function: "ƒ", method: "ƒ", class: "◆", interface: "◇",
        type: "◇", const: "●", variable: "○", export: "→",
        struct: "◆", enum: "▣", trait: "◇", impl: "◈",
        property: "○", getter: "⇢", setter: "⇠",
    };
    return icons[kind] || "·";
}
// --- Unfold ---
function unfoldSymbol(content, filePath, symbolName) {
    var file = parseFile(content, filePath);
    var findSymbol = function (symbols) {
        for (var _i = 0, symbols_2 = symbols; _i < symbols_2.length; _i++) {
            var sym = symbols_2[_i];
            if (sym.name === symbolName)
                return sym;
            if (sym.children) {
                var found = findSymbol(sym.children);
                if (found)
                    return found;
            }
        }
        return null;
    };
    var symbol = findSymbol(file.symbols);
    if (!symbol)
        return null;
    var lines = content.split("\n");
    // Include preceding comments/decorators
    var start = symbol.lineStart;
    for (var i = symbol.lineStart - 1; i >= 0; i--) {
        var trimmed = lines[i].trim();
        if (trimmed === "" || trimmed.startsWith("*") || trimmed.startsWith("/**") ||
            trimmed.startsWith("///") || trimmed.startsWith("//") ||
            trimmed.startsWith("#") || trimmed.startsWith("@") ||
            trimmed === "*/") {
            start = i;
        }
        else {
            break;
        }
    }
    var extracted = lines.slice(start, symbol.lineEnd + 1).join("\n");
    return "// \uD83D\uDCCD ".concat(filePath, " L").concat(start + 1, "-").concat(symbol.lineEnd + 1, "\n").concat(extracted);
}
