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
exports.refreshExampleCommands = exports.getExampleCommandFromCache = void 0;
exports.countAndSortItems = countAndSortItems;
exports.pickDiverseCoreFiles = pickDiverseCoreFiles;
var memoize_js_1 = require("lodash-es/memoize.js");
var sample_js_1 = require("lodash-es/sample.js");
var cwd_js_1 = require("../utils/cwd.js");
var config_js_1 = require("./config.js");
var env_js_1 = require("./env.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var git_js_1 = require("./git.js");
var log_js_1 = require("./log.js");
var user_js_1 = require("./user.js");
// Patterns that mark a file as non-core (auto-generated, dependency, or config).
// Used to filter example-command filename suggestions deterministically
// instead of shelling out to Haiku.
var NON_CORE_PATTERNS = [
    // lock / dependency manifests
    /(?:^|\/)(?:package-lock\.json|yarn\.lock|bun\.lock|bun\.lockb|pnpm-lock\.yaml|Pipfile\.lock|poetry\.lock|Cargo\.lock|Gemfile\.lock|go\.sum|composer\.lock|uv\.lock)$/,
    // generated / build artifacts
    /\.generated\./,
    /(?:^|\/)(?:dist|build|out|target|node_modules|\.next|__pycache__)\//,
    /\.(?:min\.js|min\.css|map|pyc|pyo)$/,
    // data / docs / config extensions (not "write a test for" material)
    /\.(?:json|ya?ml|toml|xml|ini|cfg|conf|env|lock|txt|md|mdx|rst|csv|log|svg)$/i,
    // configuration / metadata
    /(?:^|\/)\.?(?:eslintrc|prettierrc|babelrc|editorconfig|gitignore|gitattributes|dockerignore|npmrc)/,
    /(?:^|\/)(?:tsconfig|jsconfig|biome|vitest\.config|jest\.config|webpack\.config|vite\.config|rollup\.config)\.[a-z]+$/,
    /(?:^|\/)\.(?:github|vscode|idea|claude)\//,
    // docs / changelogs (not "how does X work" material)
    /(?:^|\/)(?:CHANGELOG|LICENSE|CONTRIBUTING|CODEOWNERS|README)(?:\.[a-z]+)?$/i,
];
function isCoreFile(path) {
    return !NON_CORE_PATTERNS.some(function (p) { return p.test(path); });
}
/**
 * Counts occurrences of items in an array and returns the top N items
 * sorted by count in descending order, formatted as a string.
 */
function countAndSortItems(items, topN) {
    if (topN === void 0) { topN = 20; }
    var counts = new Map();
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        counts.set(item, (counts.get(item) || 0) + 1);
    }
    return Array.from(counts.entries())
        .sort(function (a, b) { return b[1] - a[1]; })
        .slice(0, topN)
        .map(function (_a) {
        var item = _a[0], count = _a[1];
        return "".concat(count.toString().padStart(6), " ").concat(item);
    })
        .join('\n');
}
/**
 * Picks up to `want` basenames from a frequency-sorted list of paths,
 * skipping non-core files and spreading across different directories.
 * Returns empty array if fewer than `want` core files are available.
 */
function pickDiverseCoreFiles(sortedPaths, want) {
    var _a, _b;
    var picked = [];
    var seenBasenames = new Set();
    var dirTally = new Map();
    // Greedy: on each pass allow +1 file per directory. Keeps the
    // top-5 from collapsing into a single hot folder while still
    // letting a dominant folder contribute multiple files if the
    // repo is narrow.
    for (var cap = 1; picked.length < want && cap <= want; cap++) {
        for (var _i = 0, sortedPaths_1 = sortedPaths; _i < sortedPaths_1.length; _i++) {
            var p = sortedPaths_1[_i];
            if (picked.length >= want)
                break;
            if (!isCoreFile(p))
                continue;
            var lastSep = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
            var base = lastSep >= 0 ? p.slice(lastSep + 1) : p;
            if (!base || seenBasenames.has(base))
                continue;
            var dir = lastSep >= 0 ? p.slice(0, lastSep) : '.';
            if (((_a = dirTally.get(dir)) !== null && _a !== void 0 ? _a : 0) >= cap)
                continue;
            picked.push(base);
            seenBasenames.add(base);
            dirTally.set(dir, ((_b = dirTally.get(dir)) !== null && _b !== void 0 ? _b : 0) + 1);
        }
    }
    return picked.length >= want ? picked : [];
}
function getFrequentlyModifiedFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var userEmail, logArgs, counts_1, tallyInto, stdout, stdout, sorted, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.env.NODE_ENV === 'test')
                        return [2 /*return*/, []];
                    if (env_js_1.env.platform === 'win32')
                        return [2 /*return*/, []];
                    return [4 /*yield*/, (0, git_js_1.getIsGit)()];
                case 1:
                    if (!(_a.sent()))
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, (0, user_js_1.getGitEmail)()];
                case 3:
                    userEmail = _a.sent();
                    logArgs = [
                        'log',
                        '-n',
                        '1000',
                        '--pretty=format:',
                        '--name-only',
                        '--diff-filter=M',
                    ];
                    counts_1 = new Map();
                    tallyInto = function (stdout) {
                        var _a;
                        for (var _i = 0, _b = stdout.split('\n'); _i < _b.length; _i++) {
                            var line = _b[_i];
                            var f = line.trim();
                            if (f)
                                counts_1.set(f, ((_a = counts_1.get(f)) !== null && _a !== void 0 ? _a : 0) + 1);
                        }
                    };
                    if (!userEmail) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('git', __spreadArray(__spreadArray([], logArgs, true), ["--author=".concat(userEmail)], false), { cwd: (0, cwd_js_1.getCwd)() })];
                case 4:
                    stdout = (_a.sent()).stdout;
                    tallyInto(stdout);
                    _a.label = 5;
                case 5:
                    if (!(counts_1.size < 10)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), logArgs, {
                            cwd: (0, cwd_js_1.getCwd)(),
                        })];
                case 6:
                    stdout = (_a.sent()).stdout;
                    tallyInto(stdout);
                    _a.label = 7;
                case 7:
                    sorted = Array.from(counts_1.entries())
                        .sort(function (a, b) { return b[1] - a[1]; })
                        .map(function (_a) {
                        var p = _a[0];
                        return p;
                    });
                    return [2 /*return*/, pickDiverseCoreFiles(sorted, 5)];
                case 8:
                    err_1 = _a.sent();
                    (0, log_js_1.logError)(err_1);
                    return [2 /*return*/, []];
                case 9: return [2 /*return*/];
            }
        });
    });
}
var ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
exports.getExampleCommandFromCache = (0, memoize_js_1.default)(function () {
    var _a;
    var projectConfig = (0, config_js_1.getCurrentProjectConfig)();
    var frequentFile = ((_a = projectConfig.exampleFiles) === null || _a === void 0 ? void 0 : _a.length)
        ? (0, sample_js_1.default)(projectConfig.exampleFiles)
        : '<filepath>';
    var commands = [
        'fix lint errors',
        'fix typecheck errors',
        "how does ".concat(frequentFile, " work?"),
        "refactor ".concat(frequentFile),
        'how do I log an error?',
        "edit ".concat(frequentFile, " to..."),
        "write a test for ".concat(frequentFile),
        'create a util logging.py that...',
    ];
    return "Try \"".concat((0, sample_js_1.default)(commands), "\"");
});
exports.refreshExampleCommands = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var projectConfig, now, lastGenerated;
    var _a, _b;
    return __generator(this, function (_c) {
        projectConfig = (0, config_js_1.getCurrentProjectConfig)();
        now = Date.now();
        lastGenerated = (_a = projectConfig.exampleFilesGeneratedAt) !== null && _a !== void 0 ? _a : 0;
        // Regenerate examples if they're over a week old
        if (now - lastGenerated > ONE_WEEK_IN_MS) {
            projectConfig.exampleFiles = [];
        }
        // If no example files cached, kickstart fetch in background
        if (!((_b = projectConfig.exampleFiles) === null || _b === void 0 ? void 0 : _b.length)) {
            void getFrequentlyModifiedFiles().then(function (files) {
                if (files.length) {
                    (0, config_js_1.saveCurrentProjectConfig)(function (current) { return (__assign(__assign({}, current), { exampleFiles: files, exampleFilesGeneratedAt: Date.now() })); });
                }
            });
        }
        return [2 /*return*/];
    });
}); });
