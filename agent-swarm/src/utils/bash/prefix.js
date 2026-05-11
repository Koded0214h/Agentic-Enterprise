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
exports.getCommandPrefixStatic = getCommandPrefixStatic;
exports.getCompoundCommandPrefixesStatic = getCompoundCommandPrefixesStatic;
var specPrefix_js_1 = require("../shell/specPrefix.js");
var commands_js_1 = require("./commands.js");
var parser_js_1 = require("./parser.js");
var registry_js_1 = require("./registry.js");
var NUMERIC = /^\d+$/;
var ENV_VAR = /^[A-Za-z_][A-Za-z0-9_]*=/;
// Wrapper commands with complex option handling that can't be expressed in specs
var WRAPPER_COMMANDS = new Set([
    'nice', // command position varies based on options
]);
var toArray = function (val) { return (Array.isArray(val) ? val : [val]); };
// Check if args[0] matches a known subcommand (disambiguates wrapper commands
// that also have subcommands, e.g. the git spec has isCommand args for aliases).
function isKnownSubcommand(arg, spec) {
    var _a;
    if (!((_a = spec === null || spec === void 0 ? void 0 : spec.subcommands) === null || _a === void 0 ? void 0 : _a.length))
        return false;
    return spec.subcommands.some(function (sub) {
        return Array.isArray(sub.name) ? sub.name.includes(arg) : sub.name === arg;
    });
}
function getCommandPrefixStatic(command_1) {
    return __awaiter(this, arguments, void 0, function (command, recursionDepth, wrapperCount) {
        var parsed, envVars, commandNode, cmdArgs, cmd, args, spec, isWrapper, prefix, _a, envPrefix;
        if (recursionDepth === void 0) { recursionDepth = 0; }
        if (wrapperCount === void 0) { wrapperCount = 0; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (wrapperCount > 2 || recursionDepth > 10)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, parser_js_1.parseCommand)(command)];
                case 1:
                    parsed = _b.sent();
                    if (!parsed)
                        return [2 /*return*/, null];
                    if (!parsed.commandNode) {
                        return [2 /*return*/, { commandPrefix: null }];
                    }
                    envVars = parsed.envVars, commandNode = parsed.commandNode;
                    cmdArgs = (0, parser_js_1.extractCommandArguments)(commandNode);
                    cmd = cmdArgs[0], args = cmdArgs.slice(1);
                    if (!cmd)
                        return [2 /*return*/, { commandPrefix: null }
                            // Check if this is a wrapper command by looking at its spec
                        ];
                    return [4 /*yield*/, (0, registry_js_1.getCommandSpec)(cmd)
                        // Check if this is a wrapper command
                    ];
                case 2:
                    spec = _b.sent();
                    isWrapper = WRAPPER_COMMANDS.has(cmd) ||
                        ((spec === null || spec === void 0 ? void 0 : spec.args) && toArray(spec.args).some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isCommand; }));
                    // Special case: if the command has subcommands and the first arg matches a subcommand,
                    // treat it as a regular command, not a wrapper
                    if (isWrapper && args[0] && isKnownSubcommand(args[0], spec)) {
                        isWrapper = false;
                    }
                    if (!isWrapper) return [3 /*break*/, 4];
                    return [4 /*yield*/, handleWrapper(cmd, args, recursionDepth, wrapperCount)];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, specPrefix_js_1.buildPrefix)(cmd, args, spec)];
                case 5:
                    _a = _b.sent();
                    _b.label = 6;
                case 6:
                    prefix = _a;
                    if (prefix === null && recursionDepth === 0 && isWrapper) {
                        return [2 /*return*/, null];
                    }
                    envPrefix = envVars.length ? "".concat(envVars.join(' '), " ") : '';
                    return [2 /*return*/, { commandPrefix: prefix ? envPrefix + prefix : null }];
            }
        });
    });
}
function handleWrapper(command, args, recursionDepth, wrapperCount) {
    return __awaiter(this, void 0, void 0, function () {
        var spec, commandArgIndex, parts, i, result_1, wrapped, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, registry_js_1.getCommandSpec)(command)];
                case 1:
                    spec = _a.sent();
                    if (!(spec === null || spec === void 0 ? void 0 : spec.args)) return [3 /*break*/, 6];
                    commandArgIndex = toArray(spec.args).findIndex(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isCommand; });
                    if (!(commandArgIndex !== -1)) return [3 /*break*/, 6];
                    parts = [command];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < args.length && i <= commandArgIndex)) return [3 /*break*/, 6];
                    if (!(i === commandArgIndex)) return [3 /*break*/, 4];
                    return [4 /*yield*/, getCommandPrefixStatic(args.slice(i).join(' '), recursionDepth + 1, wrapperCount + 1)];
                case 3:
                    result_1 = _a.sent();
                    if (result_1 === null || result_1 === void 0 ? void 0 : result_1.commandPrefix) {
                        parts.push.apply(parts, result_1.commandPrefix.split(' '));
                        return [2 /*return*/, parts.join(' ')];
                    }
                    return [3 /*break*/, 6];
                case 4:
                    if (args[i] &&
                        !args[i].startsWith('-') &&
                        !ENV_VAR.test(args[i])) {
                        parts.push(args[i]);
                    }
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6:
                    wrapped = args.find(function (arg) { return !arg.startsWith('-') && !NUMERIC.test(arg) && !ENV_VAR.test(arg); });
                    if (!wrapped)
                        return [2 /*return*/, command];
                    return [4 /*yield*/, getCommandPrefixStatic(args.slice(args.indexOf(wrapped)).join(' '), recursionDepth + 1, wrapperCount + 1)];
                case 7:
                    result = _a.sent();
                    return [2 /*return*/, !(result === null || result === void 0 ? void 0 : result.commandPrefix) ? null : "".concat(command, " ").concat(result.commandPrefix)];
            }
        });
    });
}
/**
 * Computes prefixes for a compound command (with && / || / ;).
 * For single commands, returns a single-element array with the prefix.
 *
 * For compound commands, computes per-subcommand prefixes and collapses
 * them: subcommands sharing a root (first word) are collapsed via
 * word-aligned longest common prefix.
 *
 * @param excludeSubcommand — optional filter; return true for subcommands
 *   that should be excluded from the prefix suggestion (e.g. read-only
 *   commands that are already auto-allowed).
 */
function getCompoundCommandPrefixesStatic(command, excludeSubcommand) {
    return __awaiter(this, void 0, void 0, function () {
        var subcommands, result, prefixes, _i, subcommands_1, subcmd, trimmed, result, groups, _a, prefixes_1, prefix, root, group, collapsed, _b, groups_1, _c, group;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    subcommands = (0, commands_js_1.splitCommand_DEPRECATED)(command);
                    if (!(subcommands.length <= 1)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getCommandPrefixStatic(command)];
                case 1:
                    result = _d.sent();
                    return [2 /*return*/, (result === null || result === void 0 ? void 0 : result.commandPrefix) ? [result.commandPrefix] : []];
                case 2:
                    prefixes = [];
                    _i = 0, subcommands_1 = subcommands;
                    _d.label = 3;
                case 3:
                    if (!(_i < subcommands_1.length)) return [3 /*break*/, 6];
                    subcmd = subcommands_1[_i];
                    trimmed = subcmd.trim();
                    if (excludeSubcommand === null || excludeSubcommand === void 0 ? void 0 : excludeSubcommand(trimmed))
                        return [3 /*break*/, 5];
                    return [4 /*yield*/, getCommandPrefixStatic(trimmed)];
                case 4:
                    result = _d.sent();
                    if (result === null || result === void 0 ? void 0 : result.commandPrefix) {
                        prefixes.push(result.commandPrefix);
                    }
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (prefixes.length === 0)
                        return [2 /*return*/, []
                            // Group prefixes by their first word (root command)
                        ];
                    groups = new Map();
                    for (_a = 0, prefixes_1 = prefixes; _a < prefixes_1.length; _a++) {
                        prefix = prefixes_1[_a];
                        root = prefix.split(' ')[0];
                        group = groups.get(root);
                        if (group) {
                            group.push(prefix);
                        }
                        else {
                            groups.set(root, [prefix]);
                        }
                    }
                    collapsed = [];
                    for (_b = 0, groups_1 = groups; _b < groups_1.length; _b++) {
                        _c = groups_1[_b], group = _c[1];
                        collapsed.push(longestCommonPrefix(group));
                    }
                    return [2 /*return*/, collapsed];
            }
        });
    });
}
/**
 * Compute the longest common prefix of strings, aligned to word boundaries.
 * e.g. ["git fetch", "git worktree"] → "git"
 *      ["npm run test", "npm run lint"] → "npm run"
 */
function longestCommonPrefix(strings) {
    if (strings.length === 0)
        return '';
    if (strings.length === 1)
        return strings[0];
    var first = strings[0];
    var words = first.split(' ');
    var commonWords = words.length;
    for (var i = 1; i < strings.length; i++) {
        var otherWords = strings[i].split(' ');
        var shared = 0;
        while (shared < commonWords &&
            shared < otherWords.length &&
            words[shared] === otherWords[shared]) {
            shared++;
        }
        commonWords = shared;
    }
    return words.slice(0, Math.max(1, commonWords)).join(' ');
}
