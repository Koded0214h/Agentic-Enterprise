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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCommandOperatorPermissions = checkCommandOperatorPermissions;
var commands_js_1 = require("../../utils/bash/commands.js");
var ParsedCommand_js_1 = require("../../utils/bash/ParsedCommand.js");
var parser_js_1 = require("../../utils/bash/parser.js");
var permissions_js_1 = require("../../utils/permissions/permissions.js");
var BashTool_js_1 = require("./BashTool.js");
var bashSecurity_js_1 = require("./bashSecurity.js");
function segmentedCommandPermissionResult(input, segments, bashToolHasPermissionFn, checkers) {
    return __awaiter(this, void 0, void 0, function () {
        var cdCommands, decisionReason_1, hasCd, hasGit, _i, segments_1, segment, subcommands, _a, subcommands_1, sub, trimmed, decisionReason_2, segmentResults, _b, segments_2, segment, trimmedSegment, segmentResult, deniedSegment, segmentCommand, segmentResult, allAllowed, suggestions, _c, segmentResults_1, _d, result, decisionReason;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    cdCommands = segments.filter(function (segment) {
                        var trimmed = segment.trim();
                        return checkers.isNormalizedCdCommand(trimmed);
                    });
                    if (cdCommands.length > 1) {
                        decisionReason_1 = {
                            type: 'other',
                            reason: 'Multiple directory changes in one command require approval for clarity',
                        };
                        return [2 /*return*/, {
                                behavior: 'ask',
                                decisionReason: decisionReason_1,
                                message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_1),
                            }];
                    }
                    // SECURITY: Check for cd+git across pipe segments to prevent bare repo fsmonitor bypass.
                    // When cd and git are in different pipe segments (e.g., "cd sub && echo | git status"),
                    // each segment is checked independently and neither triggers the cd+git check in
                    // bashPermissions.ts. We must detect this cross-segment pattern here.
                    // Each pipe segment can itself be a compound command (e.g., "cd sub && echo"),
                    // so we split each segment into subcommands before checking.
                    {
                        hasCd = false;
                        hasGit = false;
                        for (_i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
                            segment = segments_1[_i];
                            subcommands = (0, commands_js_1.splitCommand_DEPRECATED)(segment);
                            for (_a = 0, subcommands_1 = subcommands; _a < subcommands_1.length; _a++) {
                                sub = subcommands_1[_a];
                                trimmed = sub.trim();
                                if (checkers.isNormalizedCdCommand(trimmed)) {
                                    hasCd = true;
                                }
                                if (checkers.isNormalizedGitCommand(trimmed)) {
                                    hasGit = true;
                                }
                            }
                        }
                        if (hasCd && hasGit) {
                            decisionReason_2 = {
                                type: 'other',
                                reason: 'Compound commands with cd and git require approval to prevent bare repository attacks',
                            };
                            return [2 /*return*/, {
                                    behavior: 'ask',
                                    decisionReason: decisionReason_2,
                                    message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_2),
                                }];
                        }
                    }
                    segmentResults = new Map();
                    _b = 0, segments_2 = segments;
                    _e.label = 1;
                case 1:
                    if (!(_b < segments_2.length)) return [3 /*break*/, 4];
                    segment = segments_2[_b];
                    trimmedSegment = segment.trim();
                    if (!trimmedSegment)
                        return [3 /*break*/, 3]; // Skip empty segments
                    return [4 /*yield*/, bashToolHasPermissionFn(__assign(__assign({}, input), { command: trimmedSegment }))];
                case 2:
                    segmentResult = _e.sent();
                    segmentResults.set(trimmedSegment, segmentResult);
                    _e.label = 3;
                case 3:
                    _b++;
                    return [3 /*break*/, 1];
                case 4:
                    deniedSegment = Array.from(segmentResults.entries()).find(function (_a) {
                        var result = _a[1];
                        return result.behavior === 'deny';
                    });
                    if (deniedSegment) {
                        segmentCommand = deniedSegment[0], segmentResult = deniedSegment[1];
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: segmentResult.behavior === 'deny'
                                    ? segmentResult.message
                                    : "Permission denied for: ".concat(segmentCommand),
                                decisionReason: {
                                    type: 'subcommandResults',
                                    reasons: segmentResults,
                                },
                            }];
                    }
                    allAllowed = Array.from(segmentResults.values()).every(function (result) { return result.behavior === 'allow'; });
                    if (allAllowed) {
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: input,
                                decisionReason: {
                                    type: 'subcommandResults',
                                    reasons: segmentResults,
                                },
                            }];
                    }
                    suggestions = [];
                    for (_c = 0, segmentResults_1 = segmentResults; _c < segmentResults_1.length; _c++) {
                        _d = segmentResults_1[_c], result = _d[1];
                        if (result.behavior !== 'allow' &&
                            'suggestions' in result &&
                            result.suggestions) {
                            suggestions.push.apply(suggestions, result.suggestions);
                        }
                    }
                    decisionReason = {
                        type: 'subcommandResults',
                        reasons: segmentResults,
                    };
                    return [2 /*return*/, {
                            behavior: 'ask',
                            message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason),
                            decisionReason: decisionReason,
                            suggestions: suggestions.length > 0 ? suggestions : undefined,
                        }];
            }
        });
    });
}
/**
 * Builds a command segment, stripping output redirections to avoid
 * treating filenames as commands in permission checking.
 * Uses ParsedCommand to preserve original quoting.
 */
function buildSegmentWithoutRedirections(segmentCommand) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Fast path: skip parsing if no redirection operators present
                    if (!segmentCommand.includes('>')) {
                        return [2 /*return*/, segmentCommand];
                    }
                    return [4 /*yield*/, ParsedCommand_js_1.ParsedCommand.parse(segmentCommand)];
                case 1:
                    parsed = _b.sent();
                    return [2 /*return*/, (_a = parsed === null || parsed === void 0 ? void 0 : parsed.withoutOutputRedirections()) !== null && _a !== void 0 ? _a : segmentCommand];
            }
        });
    });
}
/**
 * Wrapper that resolves an IParsedCommand (from a pre-parsed AST root if
 * available, else via ParsedCommand.parse) and delegates to
 * bashToolCheckCommandOperatorPermissions.
 */
function checkCommandOperatorPermissions(input, bashToolHasPermissionFn, checkers, astRoot) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(astRoot && astRoot !== parser_js_1.PARSE_ABORTED)) return [3 /*break*/, 1];
                    _a = (0, ParsedCommand_js_1.buildParsedCommandFromRoot)(input.command, astRoot);
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, ParsedCommand_js_1.ParsedCommand.parse(input.command)];
                case 2:
                    _a = _b.sent();
                    _b.label = 3;
                case 3:
                    parsed = _a;
                    if (!parsed) {
                        return [2 /*return*/, { behavior: 'passthrough', message: 'Failed to parse command' }];
                    }
                    return [2 /*return*/, bashToolCheckCommandOperatorPermissions(input, bashToolHasPermissionFn, checkers, parsed)];
            }
        });
    });
}
/**
 * Checks if the command has special operators that require behavior beyond
 * simple subcommand checking.
 */
function bashToolCheckCommandOperatorPermissions(input, bashToolHasPermissionFn, checkers, parsed) {
    return __awaiter(this, void 0, void 0, function () {
        var tsAnalysis, isUnsafeCompound, safetyResult, decisionReason, pipeSegments, segments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tsAnalysis = parsed.getTreeSitterAnalysis();
                    isUnsafeCompound = tsAnalysis
                        ? tsAnalysis.compoundStructure.hasSubshell ||
                            tsAnalysis.compoundStructure.hasCommandGroup
                        : (0, commands_js_1.isUnsafeCompoundCommand_DEPRECATED)(input.command);
                    if (!isUnsafeCompound) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, bashSecurity_js_1.bashCommandIsSafeAsync_DEPRECATED)(input.command)];
                case 1:
                    safetyResult = _a.sent();
                    decisionReason = {
                        type: 'other',
                        reason: safetyResult.behavior === 'ask' && safetyResult.message
                            ? safetyResult.message
                            : 'This command uses shell operators that require approval for safety',
                    };
                    return [2 /*return*/, {
                            behavior: 'ask',
                            message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason),
                            decisionReason: decisionReason,
                            // This is an unsafe compound command, so we don't want to suggest rules since we wont be able to allow it
                        }];
                case 2:
                    pipeSegments = parsed.getPipeSegments();
                    // If no pipes (single segment), let normal flow handle it
                    if (pipeSegments.length <= 1) {
                        return [2 /*return*/, {
                                behavior: 'passthrough',
                                message: 'No pipes found in command',
                            }];
                    }
                    return [4 /*yield*/, Promise.all(pipeSegments.map(function (segment) { return buildSegmentWithoutRedirections(segment); }))
                        // Handle as segmented command
                    ];
                case 3:
                    segments = _a.sent();
                    // Handle as segmented command
                    return [2 /*return*/, segmentedCommandPermissionResult(input, segments, bashToolHasPermissionFn, checkers)];
            }
        });
    });
}
