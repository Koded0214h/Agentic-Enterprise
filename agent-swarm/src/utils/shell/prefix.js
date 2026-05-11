"use strict";
/**
 * Shared command prefix extraction using Haiku LLM
 *
 * This module provides a factory for creating command prefix extractors
 * that can be used by different shell tools. The core logic
 * (Haiku query, response validation) is shared, while tool-specific
 * aspects (examples, pre-checks) are configurable.
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
exports.createCommandPrefixExtractor = createCommandPrefixExtractor;
exports.createSubcommandPrefixExtractor = createSubcommandPrefixExtractor;
var chalk_1 = require("chalk");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var claude_js_1 = require("../../services/api/claude.js");
var errors_js_1 = require("../../services/api/errors.js");
var memoize_js_1 = require("../memoize.js");
var slowOperations_js_1 = require("../slowOperations.js");
var systemPromptType_js_1 = require("../systemPromptType.js");
/**
 * Shell executables that must never be accepted as bare prefixes.
 * Allowing e.g. "bash:*" would let any command through, defeating
 * the permission system. Includes Unix shells and Windows equivalents.
 */
var DANGEROUS_SHELL_PREFIXES = new Set([
    'sh',
    'bash',
    'zsh',
    'fish',
    'csh',
    'tcsh',
    'ksh',
    'dash',
    'cmd',
    'cmd.exe',
    'powershell',
    'powershell.exe',
    'pwsh',
    'pwsh.exe',
    'bash.exe',
]);
/**
 * Creates a memoized command prefix extractor function.
 *
 * Uses two-layer memoization: the outer memoized function creates the promise
 * and attaches a .catch handler that evicts the cache entry on rejection.
 * This prevents aborted or failed Haiku calls from poisoning future lookups.
 *
 * Bounded to 200 entries via LRU to prevent unbounded growth in heavy sessions.
 *
 * @param config - Configuration for the extractor
 * @returns A memoized async function that extracts command prefixes
 */
function createCommandPrefixExtractor(config) {
    var toolName = config.toolName, policySpec = config.policySpec, eventName = config.eventName, querySource = config.querySource, preCheck = config.preCheck;
    var memoized = (0, memoize_js_1.memoizeWithLRU)(function (command, abortSignal, isNonInteractiveSession) {
        var promise = getCommandPrefixImpl(command, abortSignal, isNonInteractiveSession, toolName, policySpec, eventName, querySource, preCheck);
        // Evict on rejection so aborted calls don't poison future turns.
        // Identity guard: after LRU eviction, a newer promise may occupy
        // this key; a stale rejection must not delete it.
        promise.catch(function () {
            if (memoized.cache.get(command) === promise) {
                memoized.cache.delete(command);
            }
        });
        return promise;
    }, function (command) { return command; }, // memoize by command only
    200);
    return memoized;
}
/**
 * Creates a memoized function to get prefixes for compound commands with subcommands.
 *
 * Uses the same two-layer memoization pattern as createCommandPrefixExtractor:
 * a .catch handler evicts the cache entry on rejection to prevent poisoning.
 *
 * @param getPrefix - The single-command prefix extractor (from createCommandPrefixExtractor)
 * @param splitCommand - Function to split a compound command into subcommands
 * @returns A memoized async function that extracts prefixes for the main command and all subcommands
 */
function createSubcommandPrefixExtractor(getPrefix, splitCommand) {
    var memoized = (0, memoize_js_1.memoizeWithLRU)(function (command, abortSignal, isNonInteractiveSession) {
        var promise = getCommandSubcommandPrefixImpl(command, abortSignal, isNonInteractiveSession, getPrefix, splitCommand);
        // Evict on rejection so aborted calls don't poison future turns.
        // Identity guard: after LRU eviction, a newer promise may occupy
        // this key; a stale rejection must not delete it.
        promise.catch(function () {
            if (memoized.cache.get(command) === promise) {
                memoized.cache.delete(command);
            }
        });
        return promise;
    }, function (command) { return command; }, // memoize by command only
    200);
    return memoized;
}
function getCommandPrefixImpl(command, abortSignal, isNonInteractiveSession, toolName, policySpec, eventName, querySource, preCheck) {
    return __awaiter(this, void 0, void 0, function () {
        var preCheckResult, preflightCheckTimeoutId, startTime, result, useSystemPromptPolicySpec, response, durationMs, prefix, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (process.env.NODE_ENV === 'test') {
                        return [2 /*return*/, null];
                    }
                    // Run pre-check if provided (e.g., isHelpCommand for Bash)
                    if (preCheck) {
                        preCheckResult = preCheck(command);
                        if (preCheckResult !== null) {
                            return [2 /*return*/, preCheckResult];
                        }
                    }
                    startTime = Date.now();
                    result = null;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    // Log a warning if the pre-flight check takes too long
                    preflightCheckTimeoutId = setTimeout(function (tn, nonInteractive) {
                        var message = "[".concat(tn, "Tool] Pre-flight check is taking longer than expected. Run with ANTHROPIC_LOG=debug to check for failed or slow API requests.");
                        if (nonInteractive) {
                            process.stderr.write((0, slowOperations_js_1.jsonStringify)({ level: 'warn', message: message }) + '\n');
                        }
                        else {
                            // biome-ignore lint/suspicious/noConsole: intentional warning
                            console.warn(chalk_1.default.yellow("\u26A0\uFE0F  ".concat(message)));
                        }
                    }, 10000, // 10 seconds
                    toolName, isNonInteractiveSession);
                    useSystemPromptPolicySpec = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cork_m4q', false);
                    return [4 /*yield*/, (0, claude_js_1.queryHaiku)({
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)(useSystemPromptPolicySpec
                                ? [
                                    "Your task is to process ".concat(toolName, " commands that an AI coding agent wants to run.\n\n").concat(policySpec),
                                ]
                                : [
                                    "Your task is to process ".concat(toolName, " commands that an AI coding agent wants to run.\n\nThis policy spec defines how to determine the prefix of a ").concat(toolName, " command:"),
                                ]),
                            userPrompt: useSystemPromptPolicySpec
                                ? "Command: ".concat(command)
                                : "".concat(policySpec, "\n\nCommand: ").concat(command),
                            signal: abortSignal,
                            options: {
                                enablePromptCaching: useSystemPromptPolicySpec,
                                querySource: querySource,
                                agents: [],
                                isNonInteractiveSession: isNonInteractiveSession,
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                            },
                        })
                        // Clear the timeout since the query completed
                    ];
                case 2:
                    response = _c.sent();
                    // Clear the timeout since the query completed
                    clearTimeout(preflightCheckTimeoutId);
                    durationMs = Date.now() - startTime;
                    prefix = typeof response.message.content === 'string'
                        ? response.message.content
                        : Array.isArray(response.message.content)
                            ? ((_b = (_a = response.message.content.find(function (_) { return _.type === 'text'; })) === null || _a === void 0 ? void 0 : _a.text) !== null && _b !== void 0 ? _b : 'none')
                            : 'none';
                    if ((0, errors_js_1.startsWithApiErrorPrefix)(prefix)) {
                        (0, index_js_1.logEvent)(eventName, {
                            success: false,
                            error: 'API error',
                            durationMs: durationMs,
                        });
                        result = null;
                    }
                    else if (prefix === 'command_injection_detected') {
                        // Haiku detected something suspicious - treat as no prefix available
                        (0, index_js_1.logEvent)(eventName, {
                            success: false,
                            error: 'command_injection_detected',
                            durationMs: durationMs,
                        });
                        result = {
                            commandPrefix: null,
                        };
                    }
                    else if (prefix === 'git' ||
                        DANGEROUS_SHELL_PREFIXES.has(prefix.toLowerCase())) {
                        // Never accept bare `git` or shell executables as a prefix
                        (0, index_js_1.logEvent)(eventName, {
                            success: false,
                            error: 'dangerous_shell_prefix',
                            durationMs: durationMs,
                        });
                        result = {
                            commandPrefix: null,
                        };
                    }
                    else if (prefix === 'none') {
                        // No prefix detected
                        (0, index_js_1.logEvent)(eventName, {
                            success: false,
                            error: 'prefix "none"',
                            durationMs: durationMs,
                        });
                        result = {
                            commandPrefix: null,
                        };
                    }
                    else {
                        // Validate that the prefix is actually a prefix of the command
                        if (!command.startsWith(prefix)) {
                            // Prefix isn't actually a prefix of the command
                            (0, index_js_1.logEvent)(eventName, {
                                success: false,
                                error: 'command did not start with prefix',
                                durationMs: durationMs,
                            });
                            result = {
                                commandPrefix: null,
                            };
                        }
                        else {
                            (0, index_js_1.logEvent)(eventName, {
                                success: true,
                                durationMs: durationMs,
                            });
                            result = {
                                commandPrefix: prefix,
                            };
                        }
                    }
                    return [2 /*return*/, result];
                case 3:
                    error_1 = _c.sent();
                    clearTimeout(preflightCheckTimeoutId);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getCommandSubcommandPrefixImpl(command, abortSignal, isNonInteractiveSession, getPrefix, splitCommandFn) {
    return __awaiter(this, void 0, void 0, function () {
        var subcommands, _a, fullCommandPrefix, subcommandPrefixesResults, subcommandPrefixes;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, splitCommandFn(command)];
                case 1:
                    subcommands = _b.sent();
                    return [4 /*yield*/, Promise.all(__spreadArray([
                            getPrefix(command, abortSignal, isNonInteractiveSession)
                        ], subcommands.map(function (subcommand) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {
                                            subcommand: subcommand
                                        };
                                        return [4 /*yield*/, getPrefix(subcommand, abortSignal, isNonInteractiveSession)];
                                    case 1: return [2 /*return*/, (_a.prefix = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }), true))];
                case 2:
                    _a = _b.sent(), fullCommandPrefix = _a[0], subcommandPrefixesResults = _a.slice(1);
                    if (!fullCommandPrefix) {
                        return [2 /*return*/, null];
                    }
                    subcommandPrefixes = subcommandPrefixesResults.reduce(function (acc, _a) {
                        var subcommand = _a.subcommand, prefix = _a.prefix;
                        if (prefix) {
                            acc.set(subcommand, prefix);
                        }
                        return acc;
                    }, new Map());
                    return [2 /*return*/, __assign(__assign({}, fullCommandPrefix), { subcommandPrefixes: subcommandPrefixes })];
            }
        });
    });
}
