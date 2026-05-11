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
exports.ParsedCommand = exports.RegexParsedCommand_DEPRECATED = void 0;
exports.buildParsedCommandFromRoot = buildParsedCommandFromRoot;
var memoize_js_1 = require("lodash-es/memoize.js");
var commands_js_1 = require("./commands.js");
var treeSitterAnalysis_js_1 = require("./treeSitterAnalysis.js");
/**
 * @deprecated Legacy regex/shell-quote path. Only used when tree-sitter is
 * unavailable. The primary gate is parseForSecurity (ast.ts).
 *
 * Regex-based fallback implementation using shell-quote parser.
 * Used when tree-sitter is not available.
 * Exported for testing purposes.
 */
var RegexParsedCommand_DEPRECATED = /** @class */ (function () {
    function RegexParsedCommand_DEPRECATED(command) {
        this.originalCommand = command;
    }
    RegexParsedCommand_DEPRECATED.prototype.toString = function () {
        return this.originalCommand;
    };
    RegexParsedCommand_DEPRECATED.prototype.getPipeSegments = function () {
        try {
            var parts = (0, commands_js_1.splitCommandWithOperators)(this.originalCommand);
            var segments = [];
            var currentSegment = [];
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                if (part === '|') {
                    if (currentSegment.length > 0) {
                        segments.push(currentSegment.join(' '));
                        currentSegment = [];
                    }
                }
                else {
                    currentSegment.push(part);
                }
            }
            if (currentSegment.length > 0) {
                segments.push(currentSegment.join(' '));
            }
            return segments.length > 0 ? segments : [this.originalCommand];
        }
        catch (_a) {
            return [this.originalCommand];
        }
    };
    RegexParsedCommand_DEPRECATED.prototype.withoutOutputRedirections = function () {
        if (!this.originalCommand.includes('>')) {
            return this.originalCommand;
        }
        var _a = (0, commands_js_1.extractOutputRedirections)(this.originalCommand), commandWithoutRedirections = _a.commandWithoutRedirections, redirections = _a.redirections;
        return redirections.length > 0
            ? commandWithoutRedirections
            : this.originalCommand;
    };
    RegexParsedCommand_DEPRECATED.prototype.getOutputRedirections = function () {
        var redirections = (0, commands_js_1.extractOutputRedirections)(this.originalCommand).redirections;
        return redirections;
    };
    RegexParsedCommand_DEPRECATED.prototype.getTreeSitterAnalysis = function () {
        return null;
    };
    return RegexParsedCommand_DEPRECATED;
}());
exports.RegexParsedCommand_DEPRECATED = RegexParsedCommand_DEPRECATED;
function visitNodes(node, visitor) {
    visitor(node);
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var child = _a[_i];
        visitNodes(child, visitor);
    }
}
function extractPipePositions(rootNode) {
    var pipePositions = [];
    visitNodes(rootNode, function (node) {
        if (node.type === 'pipeline') {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                if (child.type === '|') {
                    pipePositions.push(child.startIndex);
                }
            }
        }
    });
    // visitNodes is depth-first. For `a | b && c | d`, the outer `list` nests
    // the second pipeline as a sibling of the first, so the outer `|` is
    // visited before the inner one — positions arrive out of order.
    // getPipeSegments iterates them to slice left-to-right, so sort here.
    return pipePositions.sort(function (a, b) { return a - b; });
}
function extractRedirectionNodes(rootNode) {
    var redirections = [];
    visitNodes(rootNode, function (node) {
        if (node.type === 'file_redirect') {
            var children = node.children;
            var op = children.find(function (c) { return c.type === '>' || c.type === '>>'; });
            var target = children.find(function (c) { return c.type === 'word'; });
            if (op && target) {
                redirections.push({
                    startIndex: node.startIndex,
                    endIndex: node.endIndex,
                    target: target.text,
                    operator: op.type,
                });
            }
        }
    });
    return redirections;
}
var TreeSitterParsedCommand = /** @class */ (function () {
    function TreeSitterParsedCommand(command, pipePositions, redirectionNodes, treeSitterAnalysis) {
        this.originalCommand = command;
        this.commandBytes = Buffer.from(command, 'utf8');
        this.pipePositions = pipePositions;
        this.redirectionNodes = redirectionNodes;
        this.treeSitterAnalysis = treeSitterAnalysis;
    }
    TreeSitterParsedCommand.prototype.toString = function () {
        return this.originalCommand;
    };
    TreeSitterParsedCommand.prototype.getPipeSegments = function () {
        if (this.pipePositions.length === 0) {
            return [this.originalCommand];
        }
        var segments = [];
        var currentStart = 0;
        for (var _i = 0, _a = this.pipePositions; _i < _a.length; _i++) {
            var pipePos = _a[_i];
            var segment = this.commandBytes
                .subarray(currentStart, pipePos)
                .toString('utf8')
                .trim();
            if (segment) {
                segments.push(segment);
            }
            currentStart = pipePos + 1;
        }
        var lastSegment = this.commandBytes
            .subarray(currentStart)
            .toString('utf8')
            .trim();
        if (lastSegment) {
            segments.push(lastSegment);
        }
        return segments;
    };
    TreeSitterParsedCommand.prototype.withoutOutputRedirections = function () {
        if (this.redirectionNodes.length === 0)
            return this.originalCommand;
        var sorted = __spreadArray([], this.redirectionNodes, true).sort(function (a, b) { return b.startIndex - a.startIndex; });
        var result = this.commandBytes;
        for (var _i = 0, sorted_1 = sorted; _i < sorted_1.length; _i++) {
            var redir = sorted_1[_i];
            result = Buffer.concat([
                result.subarray(0, redir.startIndex),
                result.subarray(redir.endIndex),
            ]);
        }
        return result.toString('utf8').trim().replace(/\s+/g, ' ');
    };
    TreeSitterParsedCommand.prototype.getOutputRedirections = function () {
        return this.redirectionNodes.map(function (_a) {
            var target = _a.target, operator = _a.operator;
            return ({
                target: target,
                operator: operator,
            });
        });
    };
    TreeSitterParsedCommand.prototype.getTreeSitterAnalysis = function () {
        return this.treeSitterAnalysis;
    };
    return TreeSitterParsedCommand;
}());
var getTreeSitterAvailable = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var parseCommand, testResult, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('./parser.js'); })];
            case 1:
                parseCommand = (_b.sent()).parseCommand;
                return [4 /*yield*/, parseCommand('echo test')];
            case 2:
                testResult = _b.sent();
                return [2 /*return*/, testResult !== null];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Build a TreeSitterParsedCommand from a pre-parsed AST root. Lets callers
 * that already have the tree skip the redundant native.parse that
 * ParsedCommand.parse would do.
 */
function buildParsedCommandFromRoot(command, root) {
    var pipePositions = extractPipePositions(root);
    var redirectionNodes = extractRedirectionNodes(root);
    var analysis = (0, treeSitterAnalysis_js_1.analyzeCommand)(root, command);
    return new TreeSitterParsedCommand(command, pipePositions, redirectionNodes, analysis);
}
function doParse(command) {
    return __awaiter(this, void 0, void 0, function () {
        var treeSitterAvailable, parseCommand, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!command)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, getTreeSitterAvailable()];
                case 1:
                    treeSitterAvailable = _b.sent();
                    if (!treeSitterAvailable) return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./parser.js'); })];
                case 3:
                    parseCommand = (_b.sent()).parseCommand;
                    return [4 /*yield*/, parseCommand(command)];
                case 4:
                    data = _b.sent();
                    if (data) {
                        // Native NAPI parser returns plain JS objects (no WASM handles);
                        // nothing to free — extract directly.
                        return [2 /*return*/, buildParsedCommandFromRoot(command, data.rootNode)];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6: 
                // Fallback to regex implementation
                return [2 /*return*/, new RegexParsedCommand_DEPRECATED(command)];
            }
        });
    });
}
// Single-entry cache: legacy callers (bashCommandIsSafeAsync,
// buildSegmentWithoutRedirections) may call ParsedCommand.parse repeatedly
// with the same command string. Each parse() is ~1 native.parse + ~6 tree
// walks, so caching the most recent command skips the redundant work.
// Size-1 bound avoids leaking TreeSitterParsedCommand instances.
var lastCmd;
var lastResult;
/**
 * ParsedCommand provides methods for working with shell commands.
 * Uses tree-sitter when available for quote-aware parsing,
 * falls back to regex-based parsing otherwise.
 */
exports.ParsedCommand = {
    /**
     * Parse a command string and return a ParsedCommand instance.
     * Returns null if parsing fails completely.
     */
    parse: function (command) {
        if (command === lastCmd && lastResult !== undefined) {
            return lastResult;
        }
        lastCmd = command;
        lastResult = doParse(command);
        return lastResult;
    },
};
