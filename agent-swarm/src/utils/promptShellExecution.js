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
exports.executeShellCommandsInPrompt = executeShellCommandsInPrompt;
var crypto_1 = require("crypto");
var BashTool_js_1 = require("../tools/BashTool/BashTool.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var messages_js_1 = require("./messages.js");
var permissions_js_1 = require("./permissions/permissions.js");
var toolResultStorage_js_1 = require("./toolResultStorage.js");
var shellToolUtils_js_1 = require("./shell/shellToolUtils.js");
// Lazy: this file is on the startup import chain (main → commands →
// loadSkillsDir → here). A static import would load PowerShellTool.ts
// (and transitively parser.ts, validators, etc.) at startup on all
// platforms, defeating tools.ts's lazy require. Deferred until the
// first skill with `shell: powershell` actually runs.
/* eslint-disable @typescript-eslint/no-require-imports */
var getPowerShellTool = (function () {
    var cached;
    return function () {
        if (!cached) {
            cached = require('../tools/PowerShellTool/PowerShellTool.js').PowerShellTool;
        }
        return cached;
    };
})();
/* eslint-enable @typescript-eslint/no-require-imports */
// Pattern for code blocks: ```! command ```
var BLOCK_PATTERN = /```!\s*\n?([\s\S]*?)\n?```/g;
// Pattern for inline: !`command`
// Uses a positive lookbehind to require whitespace or start-of-line before !
// This prevents false matches inside markdown inline code spans like `!!` or
// adjacent spans like `foo`!`bar`, and shell variables like $!
// eslint-disable-next-line custom-rules/no-lookbehind-regex -- gated by text.includes('!`') below (PR#22986)
var INLINE_PATTERN = /(?<=^|\s)!`([^`]+)`/gm;
/**
 * Parses prompt text and executes any embedded shell commands.
 * Supports two syntaxes:
 * - Code blocks: ```! command ```
 * - Inline: !`command`
 *
 * @param shell - Shell to route commands through. Defaults to bash.
 *   This is *never* read from settings.defaultShell — it comes from .md
 *   frontmatter (author's choice) or is undefined for built-in commands.
 *   See docs/design/ps-shell-selection.md §5.3.
 */
function executeShellCommandsInPrompt(text, context, slashCommandName, shell) {
    return __awaiter(this, void 0, void 0, function () {
        var result, shellTool, blockMatches, inlineMatches;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = text;
                    shellTool = shell === 'powershell' && (0, shellToolUtils_js_1.isPowerShellToolEnabled)()
                        ? getPowerShellTool()
                        : BashTool_js_1.BashTool;
                    blockMatches = text.matchAll(BLOCK_PATTERN);
                    inlineMatches = text.includes('!`') ? text.matchAll(INLINE_PATTERN) : [];
                    return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], blockMatches, true), inlineMatches, true).map(function (match) { return __awaiter(_this, void 0, void 0, function () {
                            var command, permissionResult, data, toolResultBlock, output_1, e_1;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        command = (_a = match[1]) === null || _a === void 0 ? void 0 : _a.trim();
                                        if (!command) return [3 /*break*/, 6];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 5, , 6]);
                                        return [4 /*yield*/, (0, permissions_js_1.hasPermissionsToUseTool)(shellTool, { command: command }, context, (0, messages_js_1.createAssistantMessage)({ content: [] }), '')];
                                    case 2:
                                        permissionResult = _b.sent();
                                        if (permissionResult.behavior !== 'allow') {
                                            (0, debug_js_1.logForDebugging)("Shell command permission check failed for command in ".concat(slashCommandName, ": ").concat(command, ". Error: ").concat(permissionResult.message));
                                            throw new errors_js_1.MalformedCommandError("Shell command permission check failed for pattern \"".concat(match[0], "\": ").concat(permissionResult.message || 'Permission denied'));
                                        }
                                        return [4 /*yield*/, shellTool.call({ command: command }, context)
                                            // Reuse the same persistence flow as regular Bash tool calls
                                        ];
                                    case 3:
                                        data = (_b.sent()).data;
                                        return [4 /*yield*/, (0, toolResultStorage_js_1.processToolResultBlock)(shellTool, data, (0, crypto_1.randomUUID)())
                                            // Extract the string content from the block
                                        ];
                                    case 4:
                                        toolResultBlock = _b.sent();
                                        output_1 = typeof toolResultBlock.content === 'string'
                                            ? toolResultBlock.content
                                            : formatBashOutput(data.stdout, data.stderr);
                                        // Function replacer — String.replace interprets $$, $&, $`, $' in
                                        // the replacement string even with a string search pattern. Shell
                                        // output (especially PowerShell: $env:PATH, $$, $PSVersionTable)
                                        // is arbitrary user data; a bare string arg would corrupt it.
                                        result = result.replace(match[0], function () { return output_1; });
                                        return [3 /*break*/, 6];
                                    case 5:
                                        e_1 = _b.sent();
                                        if (e_1 instanceof errors_js_1.MalformedCommandError) {
                                            throw e_1;
                                        }
                                        formatBashError(e_1, match[0]);
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function formatBashOutput(stdout, stderr, inline) {
    if (inline === void 0) { inline = false; }
    var parts = [];
    if (stdout.trim()) {
        parts.push(stdout.trim());
    }
    if (stderr.trim()) {
        if (inline) {
            parts.push("[stderr: ".concat(stderr.trim(), "]"));
        }
        else {
            parts.push("[stderr]\n".concat(stderr.trim()));
        }
    }
    return parts.join(inline ? ' ' : '\n');
}
function formatBashError(e, pattern, inline) {
    if (inline === void 0) { inline = false; }
    if (e instanceof errors_js_1.ShellError) {
        if (e.interrupted) {
            throw new errors_js_1.MalformedCommandError("Shell command interrupted for pattern \"".concat(pattern, "\": [Command interrupted]"));
        }
        var output = formatBashOutput(e.stdout, e.stderr, inline);
        throw new errors_js_1.MalformedCommandError("Shell command failed for pattern \"".concat(pattern, "\": ").concat(output));
    }
    var message = (0, errors_js_1.errorMessage)(e);
    var formatted = inline ? "[Error: ".concat(message, "]") : "[Error]\n".concat(message);
    throw new errors_js_1.MalformedCommandError(formatted);
}
