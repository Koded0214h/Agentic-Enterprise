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
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
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
exports.safeParseJSON = void 0;
exports.safeParseJSONC = safeParseJSONC;
exports.parseJSONL = parseJSONL;
exports.readJSONLFile = readJSONLFile;
exports.addItemToJSONCArray = addItemToJSONCArray;
var promises_1 = require("fs/promises");
var main_js_1 = require("jsonc-parser/lib/esm/main.js");
var jsonRead_js_1 = require("./jsonRead.js");
var log_js_1 = require("./log.js");
var memoize_js_1 = require("./memoize.js");
var slowOperations_js_1 = require("./slowOperations.js");
// Memoized inner parse. Uses a discriminated-union wrapper because:
// 1. memoizeWithLRU requires NonNullable<unknown>, but JSON.parse can return
//    null (e.g. JSON.parse("null")).
// 2. Invalid JSON must also be cached — otherwise repeated calls with the same
//    bad string re-parse and re-log every time (behavioral regression vs the
//    old lodash memoize which wrapped the entire try/catch).
// Bounded to 50 entries to prevent unbounded memory growth — previously this
// used lodash memoize which cached every unique JSON string forever (settings,
// .mcp.json, notebooks, tool results), causing a significant memory leak.
// Note: shouldLogError is intentionally excluded from the cache key (matching
// lodash memoize default resolver = first arg only).
// Skip caching above this size — the LRU stores the full string as the key,
// so a 200KB config file would pin ~10MB in #keyList across 50 slots. Large
// inputs like ~/.claude.json also change between reads (numStartups bumps on
// every CC startup), so the cache never hits anyway.
var PARSE_CACHE_MAX_KEY_BYTES = 8 * 1024;
function parseJSONUncached(json, shouldLogError) {
    try {
        return { ok: true, value: JSON.parse((0, jsonRead_js_1.stripBOM)(json)) };
    }
    catch (e) {
        if (shouldLogError) {
            (0, log_js_1.logError)(e);
        }
        return { ok: false };
    }
}
var parseJSONCached = (0, memoize_js_1.memoizeWithLRU)(parseJSONUncached, function (json) { return json; }, 50);
// Important: memoized for performance (LRU-bounded to 50 entries, small inputs only).
exports.safeParseJSON = Object.assign(function safeParseJSON(json, shouldLogError) {
    if (shouldLogError === void 0) { shouldLogError = true; }
    if (!json)
        return null;
    var result = json.length > PARSE_CACHE_MAX_KEY_BYTES
        ? parseJSONUncached(json, shouldLogError)
        : parseJSONCached(json, shouldLogError);
    return result.ok ? result.value : null;
}, { cache: parseJSONCached.cache });
/**
 * Safely parse JSON with comments (jsonc).
 * This is useful for VS Code configuration files like keybindings.json
 * which support comments and other jsonc features.
 */
function safeParseJSONC(json) {
    if (!json) {
        return null;
    }
    try {
        // Strip BOM before parsing - PowerShell 5.x adds BOM to UTF-8 files
        return (0, main_js_1.parse)((0, jsonRead_js_1.stripBOM)(json));
    }
    catch (e) {
        (0, log_js_1.logError)(e);
        return null;
    }
}
var bunJSONLParse = (function () {
    if (typeof Bun === 'undefined')
        return false;
    var b = Bun;
    var jsonl = b.JSONL;
    if (!(jsonl === null || jsonl === void 0 ? void 0 : jsonl.parseChunk))
        return false;
    return jsonl.parseChunk;
})();
function parseJSONLBun(data) {
    var parse = bunJSONLParse;
    var len = data.length;
    var result = parse(data);
    if (!result.error || result.done || result.read >= len) {
        return result.values;
    }
    // Had an error mid-stream — collect what we got and keep going
    var values = result.values;
    var offset = result.read;
    while (offset < len) {
        var newlineIndex = typeof data === 'string'
            ? data.indexOf('\n', offset)
            : data.indexOf(0x0a, offset);
        if (newlineIndex === -1)
            break;
        offset = newlineIndex + 1;
        var next = parse(data, offset);
        if (next.values.length > 0) {
            values = values.concat(next.values);
        }
        if (!next.error || next.done || next.read >= len)
            break;
        offset = next.read;
    }
    return values;
}
function parseJSONLBuffer(buf) {
    var bufLen = buf.length;
    var start = 0;
    // Strip UTF-8 BOM (EF BB BF)
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
        start = 3;
    }
    var results = [];
    while (start < bufLen) {
        var end = buf.indexOf(0x0a, start);
        if (end === -1)
            end = bufLen;
        var line = buf.toString('utf8', start, end).trim();
        start = end + 1;
        if (!line)
            continue;
        try {
            results.push(JSON.parse(line));
        }
        catch (_a) {
            // Skip malformed lines
        }
    }
    return results;
}
function parseJSONLString(data) {
    var stripped = (0, jsonRead_js_1.stripBOM)(data);
    var len = stripped.length;
    var start = 0;
    var results = [];
    while (start < len) {
        var end = stripped.indexOf('\n', start);
        if (end === -1)
            end = len;
        var line = stripped.substring(start, end).trim();
        start = end + 1;
        if (!line)
            continue;
        try {
            results.push(JSON.parse(line));
        }
        catch (_a) {
            // Skip malformed lines
        }
    }
    return results;
}
/**
 * Parses JSONL data from a string or Buffer, skipping malformed lines.
 * Uses Bun.JSONL.parseChunk when available for better performance,
 * falls back to indexOf-based scanning otherwise.
 */
function parseJSONL(data) {
    if (bunJSONLParse) {
        return parseJSONLBun(data);
    }
    if (typeof data === 'string') {
        return parseJSONLString(data);
    }
    return parseJSONLBuffer(data);
}
var MAX_JSONL_READ_BYTES = 100 * 1024 * 1024;
/**
 * Reads and parses a JSONL file, reading at most the last 100 MB.
 * For files larger than 100 MB, reads the tail and skips the first partial line.
 *
 * 100 MB is more than sufficient since the longest context window we support
 * is ~2M tokens, which is well under 100 MB of JSONL.
 */
function readJSONLFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var env_1, size, _a, fd, _b, buf, totalRead, fileOffset, bytesRead, newlineIndex, e_1, result_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    env_1 = { stack: [], error: void 0, hasError: false };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 9, 10, 13]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 2:
                    size = (_c.sent()).size;
                    if (!(size <= MAX_JSONL_READ_BYTES)) return [3 /*break*/, 4];
                    _a = parseJSONL;
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath)];
                case 3: return [2 /*return*/, _a.apply(void 0, [_c.sent()])];
                case 4:
                    _b = [env_1];
                    return [4 /*yield*/, (0, promises_1.open)(filePath, 'r')];
                case 5:
                    fd = __addDisposableResource.apply(void 0, _b.concat([_c.sent(), true]));
                    buf = Buffer.allocUnsafe(MAX_JSONL_READ_BYTES);
                    totalRead = 0;
                    fileOffset = size - MAX_JSONL_READ_BYTES;
                    _c.label = 6;
                case 6:
                    if (!(totalRead < MAX_JSONL_READ_BYTES)) return [3 /*break*/, 8];
                    return [4 /*yield*/, fd.read(buf, totalRead, MAX_JSONL_READ_BYTES - totalRead, fileOffset + totalRead)];
                case 7:
                    bytesRead = (_c.sent()).bytesRead;
                    if (bytesRead === 0)
                        return [3 /*break*/, 8];
                    totalRead += bytesRead;
                    return [3 /*break*/, 6];
                case 8:
                    newlineIndex = buf.indexOf(0x0a);
                    if (newlineIndex !== -1 && newlineIndex < totalRead - 1) {
                        return [2 /*return*/, parseJSONL(buf.subarray(newlineIndex + 1, totalRead))];
                    }
                    return [2 /*return*/, parseJSONL(buf.subarray(0, totalRead))];
                case 9:
                    e_1 = _c.sent();
                    env_1.error = e_1;
                    env_1.hasError = true;
                    return [3 /*break*/, 13];
                case 10:
                    result_1 = __disposeResources(env_1);
                    if (!result_1) return [3 /*break*/, 12];
                    return [4 /*yield*/, result_1];
                case 11:
                    _c.sent();
                    _c.label = 12;
                case 12: return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function addItemToJSONCArray(content, newItem) {
    try {
        // If the content is empty or whitespace, create a new JSON file
        if (!content || content.trim() === '') {
            return (0, slowOperations_js_1.jsonStringify)([newItem], null, 4);
        }
        // Strip BOM before parsing - PowerShell 5.x adds BOM to UTF-8 files
        var cleanContent = (0, jsonRead_js_1.stripBOM)(content);
        // Parse the content to check if it's valid JSON
        var parsedContent = (0, main_js_1.parse)(cleanContent);
        // If the parsed content is a valid array, modify it
        if (Array.isArray(parsedContent)) {
            // Get the length of the array
            var arrayLength = parsedContent.length;
            // Determine if we are dealing with an empty array
            var isEmpty = arrayLength === 0;
            // If it's an empty array we want to add at index 0, otherwise append to the end
            var insertPath = isEmpty ? [0] : [arrayLength];
            // Generate edits - we're using isArrayInsertion to add a new item without overwriting existing ones
            var edits = (0, main_js_1.modify)(cleanContent, insertPath, newItem, {
                formattingOptions: { insertSpaces: true, tabSize: 4 },
                isArrayInsertion: true,
            });
            // If edits could not be generated, fall back to manual JSON string manipulation
            if (!edits || edits.length === 0) {
                var copy = __spreadArray(__spreadArray([], parsedContent, true), [newItem], false);
                return (0, slowOperations_js_1.jsonStringify)(copy, null, 4);
            }
            // Apply the edits to preserve comments (use cleanContent without BOM)
            return (0, main_js_1.applyEdits)(cleanContent, edits);
        }
        // If it's not an array at all, create a new array with the item
        else {
            // If the content exists but is not an array, we'll replace it completely
            return (0, slowOperations_js_1.jsonStringify)([newItem], null, 4);
        }
    }
    catch (e) {
        // If parsing fails for any reason, log the error and fallback to creating a new JSON array
        (0, log_js_1.logError)(e);
        return (0, slowOperations_js_1.jsonStringify)([newItem], null, 4);
    }
}
