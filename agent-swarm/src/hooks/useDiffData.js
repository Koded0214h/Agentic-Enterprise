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
exports.useDiffData = useDiffData;
var react_1 = require("react");
var gitDiff_js_1 = require("../utils/gitDiff.js");
var MAX_LINES_PER_FILE = 400;
/**
 * Hook to fetch current git diff data on demand.
 * Fetches both stats and hunks when component mounts.
 */
function useDiffData() {
    var _a = (0, react_1.useState)(null), diffResult = _a[0], setDiffResult = _a[1];
    var _b = (0, react_1.useState)(new Map()), hunks = _b[0], setHunks = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    // Fetch diff data on mount
    (0, react_1.useEffect)(function () {
        var cancelled = false;
        function loadDiffData() {
            return __awaiter(this, void 0, void 0, function () {
                var _a, statsResult, hunksResult, _error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Promise.all([
                                    (0, gitDiff_js_1.fetchGitDiff)(),
                                    (0, gitDiff_js_1.fetchGitDiffHunks)(),
                                ])];
                        case 1:
                            _a = _b.sent(), statsResult = _a[0], hunksResult = _a[1];
                            if (!cancelled) {
                                setDiffResult(statsResult);
                                setHunks(hunksResult);
                                setLoading(false);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            _error_1 = _b.sent();
                            if (!cancelled) {
                                setDiffResult(null);
                                setHunks(new Map());
                                setLoading(false);
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        void loadDiffData();
        return function () {
            cancelled = true;
        };
    }, []);
    return (0, react_1.useMemo)(function () {
        var _a;
        if (!diffResult) {
            return { stats: null, files: [], hunks: new Map(), loading: loading };
        }
        var stats = diffResult.stats, perFileStats = diffResult.perFileStats;
        var files = [];
        // Iterate over perFileStats to get all files including large/skipped ones
        for (var _i = 0, perFileStats_1 = perFileStats; _i < perFileStats_1.length; _i++) {
            var _b = perFileStats_1[_i], path = _b[0], fileStats = _b[1];
            var fileHunks = hunks.get(path);
            var isUntracked = (_a = fileStats.isUntracked) !== null && _a !== void 0 ? _a : false;
            // Detect large file (in perFileStats but not in hunks, and not binary/untracked)
            var isLargeFile = !fileStats.isBinary && !isUntracked && !fileHunks;
            // Detect truncated file (total > limit means we truncated)
            var totalLines = fileStats.added + fileStats.removed;
            var isTruncated = !isLargeFile && !fileStats.isBinary && totalLines > MAX_LINES_PER_FILE;
            files.push({
                path: path,
                linesAdded: fileStats.added,
                linesRemoved: fileStats.removed,
                isBinary: fileStats.isBinary,
                isLargeFile: isLargeFile,
                isTruncated: isTruncated,
                isUntracked: isUntracked,
            });
        }
        files.sort(function (a, b) { return a.path.localeCompare(b.path); });
        return { stats: stats, files: files, hunks: hunks, loading: false };
    }, [diffResult, hunks, loading]);
}
