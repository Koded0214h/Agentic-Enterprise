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
exports.PARSE_ABORTED = void 0;
exports.ensureInitialized = ensureInitialized;
exports.parseCommand = parseCommand;
exports.parseCommandRaw = parseCommandRaw;
exports.extractCommandArguments = extractCommandArguments;
var bun_bundle_1 = require("bun:bundle");
var index_js_1 = require("../../services/analytics/index.js");
var debug_js_1 = require("../debug.js");
var bashParser_js_1 = require("./bashParser.js");
var MAX_COMMAND_LENGTH = 10000;
var DECLARATION_COMMANDS = new Set([
    'export',
    'declare',
    'typeset',
    'readonly',
    'local',
    'unset',
    'unsetenv',
]);
var ARGUMENT_TYPES = new Set(['word', 'string', 'raw_string', 'number']);
var SUBSTITUTION_TYPES = new Set([
    'command_substitution',
    'process_substitution',
]);
var COMMAND_TYPES = new Set(['command', 'declaration_command']);
var logged = false;
function logLoadOnce(success) {
    if (logged)
        return;
    logged = true;
    (0, debug_js_1.logForDebugging)(success ? 'tree-sitter: native module loaded' : 'tree-sitter: unavailable');
    (0, index_js_1.logEvent)('tengu_tree_sitter_load', { success: success });
}
/**
 * Awaits WASM init (Parser.init + Language.load). Must be called before
 * parseCommand/parseCommandRaw for the parser to be available. Idempotent.
 */
function ensureInitialized() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!((0, bun_bundle_1.feature)('TREE_SITTER_BASH') || (0, bun_bundle_1.feature)('TREE_SITTER_BASH_SHADOW'))) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, bashParser_js_1.ensureParserInitialized)()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function parseCommand(command) {
    return __awaiter(this, void 0, void 0, function () {
        var mod, rootNode, commandNode, envVars;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!command || command.length > MAX_COMMAND_LENGTH)
                        return [2 /*return*/, null
                            // Gate: ant-only until pentest. External builds fall back to legacy
                            // regex/shell-quote path. Guarding the whole body inside the positive
                            // branch lets Bun DCE the NAPI import AND keeps telemetry honest — we
                            // only fire tengu_tree_sitter_load when a load was genuinely attempted.
                        ];
                    if (!(0, bun_bundle_1.feature)('TREE_SITTER_BASH')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, bashParser_js_1.ensureParserInitialized)()];
                case 1:
                    _a.sent();
                    mod = (0, bashParser_js_1.getParserModule)();
                    logLoadOnce(mod !== null);
                    if (!mod)
                        return [2 /*return*/, null];
                    try {
                        rootNode = mod.parse(command);
                        if (!rootNode)
                            return [2 /*return*/, null];
                        commandNode = findCommandNode(rootNode, null);
                        envVars = extractEnvVars(commandNode);
                        return [2 /*return*/, { rootNode: rootNode, envVars: envVars, commandNode: commandNode, originalCommand: command }];
                    }
                    catch (_b) {
                        return [2 /*return*/, null];
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * SECURITY: Sentinel for "parser was loaded and attempted, but aborted"
 * (timeout / node budget / Rust panic). Distinct from `null` (module not
 * loaded). Adversarial input can trigger abort under MAX_COMMAND_LENGTH:
 * `(( a[0][0]... ))` with ~2800 subscripts hits PARSE_TIMEOUT_MICROS.
 * Callers MUST treat this as fail-closed (too-complex), NOT route to legacy.
 */
exports.PARSE_ABORTED = Symbol('parse-aborted');
/**
 * Raw parse — skips findCommandNode/extractEnvVars which the security
 * walker in ast.ts doesn't use. Saves one tree walk per bash command.
 *
 * Returns:
 *   - Node: parse succeeded
 *   - null: module not loaded / feature off / empty / over-length
 *   - PARSE_ABORTED: module loaded but parse failed (timeout/panic)
 */
function parseCommandRaw(command) {
    return __awaiter(this, void 0, void 0, function () {
        var mod, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!command || command.length > MAX_COMMAND_LENGTH)
                        return [2 /*return*/, null];
                    if (!((0, bun_bundle_1.feature)('TREE_SITTER_BASH') || (0, bun_bundle_1.feature)('TREE_SITTER_BASH_SHADOW'))) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, bashParser_js_1.ensureParserInitialized)()];
                case 1:
                    _a.sent();
                    mod = (0, bashParser_js_1.getParserModule)();
                    logLoadOnce(mod !== null);
                    if (!mod)
                        return [2 /*return*/, null];
                    try {
                        result = mod.parse(command);
                        // SECURITY: Module loaded; null here = timeout/node-budget abort in
                        // bashParser.ts (PARSE_TIMEOUT_MS=50, MAX_NODES=50_000).
                        // Previously collapsed into `return null` → parse-unavailable → legacy
                        // path, which lacks EVAL_LIKE_BUILTINS — `trap`, `enable`, `hash` leaked.
                        if (result === null) {
                            (0, index_js_1.logEvent)('tengu_tree_sitter_parse_abort', {
                                cmdLength: command.length,
                                panic: false,
                            });
                            return [2 /*return*/, exports.PARSE_ABORTED];
                        }
                        return [2 /*return*/, result];
                    }
                    catch (_b) {
                        (0, index_js_1.logEvent)('tengu_tree_sitter_parse_abort', {
                            cmdLength: command.length,
                            panic: true,
                        });
                        return [2 /*return*/, exports.PARSE_ABORTED];
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/, null];
            }
        });
    });
}
function findCommandNode(node, parent) {
    var _a, _b;
    var type = node.type, children = node.children;
    if (COMMAND_TYPES.has(type))
        return node;
    // Variable assignment followed by command
    if (type === 'variable_assignment' && parent) {
        return ((_a = parent.children.find(function (c) { return COMMAND_TYPES.has(c.type) && c.startIndex > node.startIndex; })) !== null && _a !== void 0 ? _a : null);
    }
    // Pipeline: recurse into first child (which may be a redirected_statement)
    if (type === 'pipeline') {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            var result = findCommandNode(child, node);
            if (result)
                return result;
        }
        return null;
    }
    // Redirected statement: find the command inside
    if (type === 'redirected_statement') {
        return (_b = children.find(function (c) { return COMMAND_TYPES.has(c.type); })) !== null && _b !== void 0 ? _b : null;
    }
    // Recursive search
    for (var _c = 0, children_2 = children; _c < children_2.length; _c++) {
        var child = children_2[_c];
        var result = findCommandNode(child, node);
        if (result)
            return result;
    }
    return null;
}
function extractEnvVars(commandNode) {
    if (!commandNode || commandNode.type !== 'command')
        return [];
    var envVars = [];
    for (var _i = 0, _a = commandNode.children; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.type === 'variable_assignment') {
            envVars.push(child.text);
        }
        else if (child.type === 'command_name' || child.type === 'word') {
            break;
        }
    }
    return envVars;
}
function extractCommandArguments(commandNode) {
    // Declaration commands
    if (commandNode.type === 'declaration_command') {
        var firstChild = commandNode.children[0];
        return firstChild && DECLARATION_COMMANDS.has(firstChild.text)
            ? [firstChild.text]
            : [];
    }
    var args = [];
    var foundCommandName = false;
    for (var _i = 0, _a = commandNode.children; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.type === 'variable_assignment')
            continue;
        // Command name
        if (child.type === 'command_name' ||
            (!foundCommandName && child.type === 'word')) {
            foundCommandName = true;
            args.push(child.text);
            continue;
        }
        // Arguments
        if (ARGUMENT_TYPES.has(child.type)) {
            args.push(stripQuotes(child.text));
        }
        else if (SUBSTITUTION_TYPES.has(child.type)) {
            break;
        }
    }
    return args;
}
function stripQuotes(text) {
    return text.length >= 2 &&
        ((text[0] === '"' && text.at(-1) === '"') ||
            (text[0] === "'" && text.at(-1) === "'"))
        ? text.slice(1, -1)
        : text;
}
