"use strict";
/**
 * Fig-spec-driven command prefix extraction.
 *
 * Given a command name + args array + its @withfig/autocomplete spec, walks
 * the spec to find how deep into the args a meaningful prefix extends.
 * `git -C /repo status --short` → `git status` (spec says -C takes a value,
 * skip it, find `status` as a known subcommand).
 *
 * Pure over (string, string[], CommandSpec) — no parser dependency. Extracted
 * from src/utils/bash/prefix.ts so PowerShell's extractor can reuse it;
 * external CLIs (git, npm, kubectl) are shell-agnostic.
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
exports.DEPTH_RULES = void 0;
exports.buildPrefix = buildPrefix;
var URL_PROTOCOLS = ['http://', 'https://', 'ftp://'];
// Overrides for commands whose fig specs aren't available at runtime
// (dynamic imports don't work in native/node builds). Without these,
// calculateDepth falls back to 2, producing overly broad prefixes.
exports.DEPTH_RULES = {
    rg: 2, // pattern argument is required despite variadic paths
    'pre-commit': 2,
    // CLI tools with deep subcommand trees (e.g. gcloud scheduler jobs list)
    gcloud: 4,
    'gcloud compute': 6,
    'gcloud beta': 6,
    aws: 4,
    az: 4,
    kubectl: 3,
    docker: 3,
    dotnet: 3,
    'git push': 2,
};
var toArray = function (val) { return (Array.isArray(val) ? val : [val]); };
// Check if an argument matches a known subcommand (case-insensitive: PS
// callers pass original-cased args; fig spec names are lowercase)
function isKnownSubcommand(arg, spec) {
    var _a;
    if (!((_a = spec === null || spec === void 0 ? void 0 : spec.subcommands) === null || _a === void 0 ? void 0 : _a.length))
        return false;
    var argLower = arg.toLowerCase();
    return spec.subcommands.some(function (sub) {
        return Array.isArray(sub.name)
            ? sub.name.some(function (n) { return n.toLowerCase() === argLower; })
            : sub.name.toLowerCase() === argLower;
    });
}
// Check if a flag takes an argument based on spec, or use heuristic
function flagTakesArg(flag, nextArg, spec) {
    var _a;
    // Check if flag is in spec.options
    if (spec === null || spec === void 0 ? void 0 : spec.options) {
        var option = spec.options.find(function (opt) {
            return Array.isArray(opt.name) ? opt.name.includes(flag) : opt.name === flag;
        });
        if (option)
            return !!option.args;
    }
    // Heuristic: if next arg isn't a flag and isn't a known subcommand, assume it's a flag value
    if (((_a = spec === null || spec === void 0 ? void 0 : spec.subcommands) === null || _a === void 0 ? void 0 : _a.length) && nextArg && !nextArg.startsWith('-')) {
        return !isKnownSubcommand(nextArg, spec);
    }
    return false;
}
// Find the first subcommand by skipping flags and their values
function findFirstSubcommand(args, spec) {
    var _a;
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (!arg)
            continue;
        if (arg.startsWith('-')) {
            if (flagTakesArg(arg, args[i + 1], spec))
                i++;
            continue;
        }
        if (!((_a = spec === null || spec === void 0 ? void 0 : spec.subcommands) === null || _a === void 0 ? void 0 : _a.length))
            return arg;
        if (isKnownSubcommand(arg, spec))
            return arg;
    }
    return undefined;
}
function buildPrefix(command, args, spec) {
    return __awaiter(this, void 0, void 0, function () {
        var maxDepth, parts, hasSubcommands, foundSubcommand, _loop_1, out_i_1, i, state_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, calculateDepth(command, args, spec)];
                case 1:
                    maxDepth = _b.sent();
                    parts = [command];
                    hasSubcommands = !!((_a = spec === null || spec === void 0 ? void 0 : spec.subcommands) === null || _a === void 0 ? void 0 : _a.length);
                    foundSubcommand = false;
                    _loop_1 = function (i) {
                        var arg, option;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    arg = args[i];
                                    if (!arg || parts.length >= maxDepth)
                                        return [2 /*return*/, (out_i_1 = i, "break")];
                                    if (arg.startsWith('-')) {
                                        // Special case: python -c should stop after -c
                                        if (arg === '-c' && ['python', 'python3'].includes(command.toLowerCase()))
                                            return [2 /*return*/, (out_i_1 = i, "break")];
                                        // Check for isCommand/isModule flags that should be included in prefix
                                        if (spec === null || spec === void 0 ? void 0 : spec.options) {
                                            option = spec.options.find(function (opt) {
                                                return Array.isArray(opt.name) ? opt.name.includes(arg) : opt.name === arg;
                                            });
                                            if ((option === null || option === void 0 ? void 0 : option.args) &&
                                                toArray(option.args).some(function (a) { return (a === null || a === void 0 ? void 0 : a.isCommand) || (a === null || a === void 0 ? void 0 : a.isModule); })) {
                                                parts.push(arg);
                                                return [2 /*return*/, (out_i_1 = i, "continue")];
                                            }
                                        }
                                        // For commands with subcommands, skip global flags to find the subcommand
                                        if (hasSubcommands && !foundSubcommand) {
                                            if (flagTakesArg(arg, args[i + 1], spec))
                                                i++;
                                            return [2 /*return*/, (out_i_1 = i, "continue")];
                                        }
                                        return [2 /*return*/, (out_i_1 = i, "break")];
                                    }
                                    return [4 /*yield*/, shouldStopAtArg(arg, args.slice(0, i), spec)];
                                case 1:
                                    if (_c.sent())
                                        return [2 /*return*/, (out_i_1 = i, "break")];
                                    if (hasSubcommands && !foundSubcommand) {
                                        foundSubcommand = isKnownSubcommand(arg, spec);
                                    }
                                    parts.push(arg);
                                    out_i_1 = i;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _b.label = 2;
                case 2:
                    if (!(i < args.length)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_1(i)];
                case 3:
                    state_1 = _b.sent();
                    i = out_i_1;
                    if (state_1 === "break")
                        return [3 /*break*/, 5];
                    _b.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, parts.join(' ')];
            }
        });
    });
}
function calculateDepth(command, args, spec) {
    return __awaiter(this, void 0, void 0, function () {
        var firstSubcommand, commandLower, key, _loop_2, _i, args_1, arg, state_2, firstSubLower_1, subcommand, subArgs, argsArray;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            firstSubcommand = findFirstSubcommand(args, spec);
            commandLower = command.toLowerCase();
            key = firstSubcommand
                ? "".concat(commandLower, " ").concat(firstSubcommand.toLowerCase())
                : commandLower;
            if (exports.DEPTH_RULES[key])
                return [2 /*return*/, exports.DEPTH_RULES[key]];
            if (exports.DEPTH_RULES[commandLower])
                return [2 /*return*/, exports.DEPTH_RULES[commandLower]];
            if (!spec)
                return [2 /*return*/, 2];
            if (spec.options && args.some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.startsWith('-'); })) {
                _loop_2 = function (arg) {
                    if (!(arg === null || arg === void 0 ? void 0 : arg.startsWith('-')))
                        return "continue";
                    var option = spec.options.find(function (opt) {
                        return Array.isArray(opt.name) ? opt.name.includes(arg) : opt.name === arg;
                    });
                    if ((option === null || option === void 0 ? void 0 : option.args) &&
                        toArray(option.args).some(function (arg) { return (arg === null || arg === void 0 ? void 0 : arg.isCommand) || (arg === null || arg === void 0 ? void 0 : arg.isModule); }))
                        return { value: 3 };
                };
                for (_i = 0, args_1 = args; _i < args_1.length; _i++) {
                    arg = args_1[_i];
                    state_2 = _loop_2(arg);
                    if (typeof state_2 === "object")
                        return [2 /*return*/, state_2.value];
                }
            }
            // Find subcommand spec using the already-found firstSubcommand
            if (firstSubcommand && ((_a = spec.subcommands) === null || _a === void 0 ? void 0 : _a.length)) {
                firstSubLower_1 = firstSubcommand.toLowerCase();
                subcommand = spec.subcommands.find(function (sub) {
                    return Array.isArray(sub.name)
                        ? sub.name.some(function (n) { return n.toLowerCase() === firstSubLower_1; })
                        : sub.name.toLowerCase() === firstSubLower_1;
                });
                if (subcommand) {
                    if (subcommand.args) {
                        subArgs = toArray(subcommand.args);
                        if (subArgs.some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isCommand; }))
                            return [2 /*return*/, 3];
                        if (subArgs.some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isVariadic; }))
                            return [2 /*return*/, 2];
                    }
                    if ((_b = subcommand.subcommands) === null || _b === void 0 ? void 0 : _b.length)
                        return [2 /*return*/, 4
                            // Leaf subcommand with NO args declared (git show, git log, git tag):
                            // the 3rd word is transient (SHA, ref, tag name) → dead over-specific
                            // rule like PowerShell(git show 81210f8:*). NOT the isOptional case —
                            // `git fetch` declares optional remote/branch and `git fetch origin`
                            // is tested (bash/prefix.test.ts:912) as intentional remote scoping.
                        ];
                    // Leaf subcommand with NO args declared (git show, git log, git tag):
                    // the 3rd word is transient (SHA, ref, tag name) → dead over-specific
                    // rule like PowerShell(git show 81210f8:*). NOT the isOptional case —
                    // `git fetch` declares optional remote/branch and `git fetch origin`
                    // is tested (bash/prefix.test.ts:912) as intentional remote scoping.
                    if (!subcommand.args)
                        return [2 /*return*/, 2];
                    return [2 /*return*/, 3];
                }
            }
            if (spec.args) {
                argsArray = toArray(spec.args);
                if (argsArray.some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isCommand; })) {
                    return [2 /*return*/, !Array.isArray(spec.args) && spec.args.isCommand
                            ? 2
                            : Math.min(2 + argsArray.findIndex(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isCommand; }), 3)];
                }
                if (!((_c = spec.subcommands) === null || _c === void 0 ? void 0 : _c.length)) {
                    if (argsArray.some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isVariadic; }))
                        return [2 /*return*/, 1];
                    if (argsArray[0] && !argsArray[0].isOptional)
                        return [2 /*return*/, 2];
                }
            }
            return [2 /*return*/, spec.args && toArray(spec.args).some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isDangerous; }) ? 3 : 2];
        });
    });
}
function shouldStopAtArg(arg, args, spec) {
    return __awaiter(this, void 0, void 0, function () {
        var dotIndex, hasExtension, hasFile, hasUrl, option;
        return __generator(this, function (_a) {
            if (arg.startsWith('-'))
                return [2 /*return*/, true];
            dotIndex = arg.lastIndexOf('.');
            hasExtension = dotIndex > 0 &&
                dotIndex < arg.length - 1 &&
                !arg.substring(dotIndex + 1).includes(':');
            hasFile = arg.includes('/') || hasExtension;
            hasUrl = URL_PROTOCOLS.some(function (proto) { return arg.startsWith(proto); });
            if (!hasFile && !hasUrl)
                return [2 /*return*/, false
                    // Check if we're after a -m flag for python modules
                ];
            // Check if we're after a -m flag for python modules
            if ((spec === null || spec === void 0 ? void 0 : spec.options) && args.length > 0 && args[args.length - 1] === '-m') {
                option = spec.options.find(function (opt) {
                    return Array.isArray(opt.name) ? opt.name.includes('-m') : opt.name === '-m';
                });
                if ((option === null || option === void 0 ? void 0 : option.args) && toArray(option.args).some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.isModule; })) {
                    return [2 /*return*/, false]; // Don't stop at module names
                }
            }
            // For actual files/URLs, always stop regardless of context
            return [2 /*return*/, true];
        });
    });
}
