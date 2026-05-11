"use strict";
/**
 * Lightweight parser for .git/config files.
 *
 * Verified against git's config.c:
 *   - Section names: case-insensitive, alphanumeric + hyphen
 *   - Subsection names (quoted): case-sensitive, backslash escapes (\\ and \")
 *   - Key names: case-insensitive, alphanumeric + hyphen
 *   - Values: optional quoting, inline comments (# or ;), backslash escapes
 */
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
exports.parseGitConfigValue = parseGitConfigValue;
exports.parseConfigString = parseConfigString;
var promises_1 = require("fs/promises");
var path_1 = require("path");
/**
 * Parse a single value from .git/config.
 * Finds the first matching key under the given section/subsection.
 */
function parseGitConfigValue(gitDir, section, subsection, key) {
    return __awaiter(this, void 0, void 0, function () {
        var config, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(gitDir, 'config'), 'utf-8')];
                case 1:
                    config = _b.sent();
                    return [2 /*return*/, parseConfigString(config, section, subsection, key)];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Parse a config value from an in-memory config string.
 * Exported for testing.
 */
function parseConfigString(config, section, subsection, key) {
    var lines = config.split('\n');
    var sectionLower = section.toLowerCase();
    var keyLower = key.toLowerCase();
    var inSection = false;
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var trimmed = line.trim();
        // Skip empty lines and comment-only lines
        if (trimmed.length === 0 || trimmed[0] === '#' || trimmed[0] === ';') {
            continue;
        }
        // Section header
        if (trimmed[0] === '[') {
            inSection = matchesSectionHeader(trimmed, sectionLower, subsection);
            continue;
        }
        if (!inSection) {
            continue;
        }
        // Key-value line: find the key name
        var parsed = parseKeyValue(trimmed);
        if (parsed && parsed.key.toLowerCase() === keyLower) {
            return parsed.value;
        }
    }
    return null;
}
/**
 * Parse a key = value line. Returns null if the line doesn't contain a valid key.
 */
function parseKeyValue(line) {
    // Read key: alphanumeric + hyphen, starting with alpha
    var i = 0;
    while (i < line.length && isKeyChar(line[i])) {
        i++;
    }
    if (i === 0) {
        return null;
    }
    var key = line.slice(0, i);
    // Skip whitespace
    while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
        i++;
    }
    // Must have '='
    if (i >= line.length || line[i] !== '=') {
        // Boolean key with no value — not relevant for our use cases
        return null;
    }
    i++; // skip '='
    // Skip whitespace after '='
    while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
        i++;
    }
    var value = parseValue(line, i);
    return { key: key, value: value };
}
/**
 * Parse a config value starting at position i.
 * Handles quoted strings, escape sequences, and inline comments.
 */
function parseValue(line, start) {
    var result = '';
    var inQuote = false;
    var i = start;
    while (i < line.length) {
        var ch = line[i];
        // Inline comments outside quotes end the value
        if (!inQuote && (ch === '#' || ch === ';')) {
            break;
        }
        if (ch === '"') {
            inQuote = !inQuote;
            i++;
            continue;
        }
        if (ch === '\\' && i + 1 < line.length) {
            var next = line[i + 1];
            if (inQuote) {
                // Inside quotes: recognize escape sequences
                switch (next) {
                    case 'n':
                        result += '\n';
                        break;
                    case 't':
                        result += '\t';
                        break;
                    case 'b':
                        result += '\b';
                        break;
                    case '"':
                        result += '"';
                        break;
                    case '\\':
                        result += '\\';
                        break;
                    default:
                        // Git silently drops the backslash for unknown escapes
                        result += next;
                        break;
                }
                i += 2;
                continue;
            }
            // Outside quotes: backslash at end of line = continuation (we don't
            // handle multi-line since we split on \n, but handle \\ and others)
            if (next === '\\') {
                result += '\\';
                i += 2;
                continue;
            }
            // Fallthrough — treat backslash literally outside quotes
        }
        result += ch;
        i++;
    }
    // Trim trailing whitespace from unquoted portions.
    // Git trims trailing whitespace that isn't inside quotes, but since we
    // process char-by-char and quotes toggle, the simplest correct approach
    // for single-line values is to trim the result when not ending in a quote.
    if (!inQuote) {
        result = trimTrailingWhitespace(result);
    }
    return result;
}
function trimTrailingWhitespace(s) {
    var end = s.length;
    while (end > 0 && (s[end - 1] === ' ' || s[end - 1] === '\t')) {
        end--;
    }
    return s.slice(0, end);
}
/**
 * Check if a config line like `[remote "origin"]` matches the given section/subsection.
 * Section matching is case-insensitive; subsection matching is case-sensitive.
 */
function matchesSectionHeader(line, sectionLower, subsection) {
    // line starts with '['
    var i = 1;
    // Read section name
    while (i < line.length &&
        line[i] !== ']' &&
        line[i] !== ' ' &&
        line[i] !== '\t' &&
        line[i] !== '"') {
        i++;
    }
    var foundSection = line.slice(1, i).toLowerCase();
    if (foundSection !== sectionLower) {
        return false;
    }
    if (subsection === null) {
        // Simple section: must end with ']'
        return i < line.length && line[i] === ']';
    }
    // Skip whitespace before subsection quote
    while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
        i++;
    }
    // Must have opening quote
    if (i >= line.length || line[i] !== '"') {
        return false;
    }
    i++; // skip opening quote
    // Read subsection — case-sensitive, handle \\ and \" escapes
    var foundSubsection = '';
    while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\' && i + 1 < line.length) {
            var next = line[i + 1];
            if (next === '\\' || next === '"') {
                foundSubsection += next;
                i += 2;
                continue;
            }
            // Git drops the backslash for other escapes in subsections
            foundSubsection += next;
            i += 2;
            continue;
        }
        foundSubsection += line[i];
        i++;
    }
    // Must have closing quote followed by ']'
    if (i >= line.length || line[i] !== '"') {
        return false;
    }
    i++; // skip closing quote
    if (i >= line.length || line[i] !== ']') {
        return false;
    }
    return foundSubsection === subsection;
}
function isKeyChar(ch) {
    return ((ch >= 'a' && ch <= 'z') ||
        (ch >= 'A' && ch <= 'Z') ||
        (ch >= '0' && ch <= '9') ||
        ch === '-');
}
