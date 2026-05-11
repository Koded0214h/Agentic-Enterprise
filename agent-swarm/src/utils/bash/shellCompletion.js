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
exports.getShellCompletions = getShellCompletions;
var shellQuote_js_1 = require("../bash/shellQuote.js");
var debug_js_1 = require("../debug.js");
var localInstaller_js_1 = require("../localInstaller.js");
var Shell = require("../Shell.js");
// Constants
var MAX_SHELL_COMPLETIONS = 15;
var SHELL_COMPLETION_TIMEOUT_MS = 1000;
var COMMAND_OPERATORS = ['|', '||', '&&', ';'];
/**
 * Check if a parsed token is a command operator (|, ||, &&, ;)
 */
function isCommandOperator(token) {
    return (typeof token === 'object' &&
        token !== null &&
        'op' in token &&
        COMMAND_OPERATORS.includes(token.op));
}
/**
 * Determine completion type based solely on prefix characteristics
 */
function getCompletionTypeFromPrefix(prefix) {
    if (prefix.startsWith('$')) {
        return 'variable';
    }
    if (prefix.includes('/') ||
        prefix.startsWith('~') ||
        prefix.startsWith('.')) {
        return 'file';
    }
    return 'command';
}
/**
 * Find the last string token and its index in parsed tokens
 */
function findLastStringToken(tokens) {
    var i = tokens.findLastIndex(function (t) { return typeof t === 'string'; });
    return i !== -1 ? { token: tokens[i], index: i } : null;
}
/**
 * Check if we're in a context that expects a new command
 * (at start of input or after a command operator)
 */
function isNewCommandContext(tokens, currentTokenIndex) {
    if (currentTokenIndex === 0) {
        return true;
    }
    var prevToken = tokens[currentTokenIndex - 1];
    return prevToken !== undefined && isCommandOperator(prevToken);
}
/**
 * Parse input to extract completion context
 */
function parseInputContext(input, cursorOffset) {
    var beforeCursor = input.slice(0, cursorOffset);
    // Check if it's a variable prefix, before expanding with shell-quote
    var varMatch = beforeCursor.match(/\$[a-zA-Z_][a-zA-Z0-9_]*$/);
    if (varMatch) {
        return { prefix: varMatch[0], completionType: 'variable' };
    }
    // Parse with shell-quote
    var parseResult = (0, shellQuote_js_1.tryParseShellCommand)(beforeCursor);
    if (!parseResult.success) {
        // Fallback to simple parsing
        var tokens = beforeCursor.split(/\s+/);
        var prefix = tokens[tokens.length - 1] || '';
        var isFirstToken = tokens.length === 1 && !beforeCursor.includes(' ');
        var completionType_1 = isFirstToken
            ? 'command'
            : getCompletionTypeFromPrefix(prefix);
        return { prefix: prefix, completionType: completionType_1 };
    }
    // Extract current token
    var lastToken = findLastStringToken(parseResult.tokens);
    if (!lastToken) {
        // No string token found - check if after operator
        var lastParsedToken = parseResult.tokens[parseResult.tokens.length - 1];
        var completionType_2 = lastParsedToken && isCommandOperator(lastParsedToken)
            ? 'command'
            : 'command'; // Default to command at start
        return { prefix: '', completionType: completionType_2 };
    }
    // If there's a trailing space, the user is starting a new argument
    if (beforeCursor.endsWith(' ')) {
        // After first token (command) with space = file argument expected
        return { prefix: '', completionType: 'file' };
    }
    // Determine completion type from context
    var baseType = getCompletionTypeFromPrefix(lastToken.token);
    // If it's clearly a file or variable based on prefix, use that type
    if (baseType === 'variable' || baseType === 'file') {
        return { prefix: lastToken.token, completionType: baseType };
    }
    // For command-like tokens, check context: are we starting a new command?
    var completionType = isNewCommandContext(parseResult.tokens, lastToken.index)
        ? 'command'
        : 'file'; // Not after operator = file argument
    return { prefix: lastToken.token, completionType: completionType };
}
/**
 * Generate bash completion command using compgen
 */
function getBashCompletionCommand(prefix, completionType) {
    if (completionType === 'variable') {
        // Variable completion - remove $ prefix
        var varName = prefix.slice(1);
        return "compgen -v ".concat((0, shellQuote_js_1.quote)([varName]), " 2>/dev/null");
    }
    else if (completionType === 'file') {
        // File completion with trailing slash for directories and trailing space for files
        // Use 'while read' to prevent command injection from filenames containing newlines
        return "compgen -f ".concat((0, shellQuote_js_1.quote)([prefix]), " 2>/dev/null | head -").concat(MAX_SHELL_COMPLETIONS, " | while IFS= read -r f; do [ -d \"$f\" ] && echo \"$f/\" || echo \"$f \"; done");
    }
    else {
        // Command completion
        return "compgen -c ".concat((0, shellQuote_js_1.quote)([prefix]), " 2>/dev/null");
    }
}
/**
 * Generate zsh completion command using native zsh commands
 */
function getZshCompletionCommand(prefix, completionType) {
    if (completionType === 'variable') {
        // Variable completion - use zsh pattern matching for safe filtering
        var varName = prefix.slice(1);
        return "print -rl -- ${(k)parameters[(I)".concat((0, shellQuote_js_1.quote)([varName]), "*]} 2>/dev/null");
    }
    else if (completionType === 'file') {
        // File completion with trailing slash for directories and trailing space for files
        // Note: zsh glob expansion is safe from command injection (unlike bash for-in loops)
        return "for f in ".concat((0, shellQuote_js_1.quote)([prefix]), "*(N[1,").concat(MAX_SHELL_COMPLETIONS, "]); do [[ -d \"$f\" ]] && echo \"$f/\" || echo \"$f \"; done");
    }
    else {
        // Command completion - use zsh pattern matching for safe filtering
        return "print -rl -- ${(k)commands[(I)".concat((0, shellQuote_js_1.quote)([prefix]), "*]} 2>/dev/null");
    }
}
/**
 * Get completions for the given shell type
 */
function getCompletionsForShell(shellType, prefix, completionType, abortSignal) {
    return __awaiter(this, void 0, void 0, function () {
        var command, shellCommand, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (shellType === 'bash') {
                        command = getBashCompletionCommand(prefix, completionType);
                    }
                    else if (shellType === 'zsh') {
                        command = getZshCompletionCommand(prefix, completionType);
                    }
                    else {
                        // Unsupported shell type
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, Shell.exec(command, abortSignal, 'bash', {
                            timeout: SHELL_COMPLETION_TIMEOUT_MS,
                        })];
                case 1:
                    shellCommand = _a.sent();
                    return [4 /*yield*/, shellCommand.result];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.stdout
                            .split('\n')
                            .filter(function (line) { return line.trim(); })
                            .slice(0, MAX_SHELL_COMPLETIONS)
                            .map(function (text) { return ({
                            id: text,
                            displayText: text,
                            description: undefined,
                            metadata: { completionType: completionType },
                        }); })];
            }
        });
    });
}
/**
 * Get shell completions for the given input
 * Supports bash and zsh shells (matches Shell.ts execution support)
 */
function getShellCompletions(input, cursorOffset, abortSignal) {
    return __awaiter(this, void 0, void 0, function () {
        var shellType, _a, prefix, completionType, completions, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    shellType = (0, localInstaller_js_1.getShellType)();
                    // Only support bash/zsh (matches Shell.ts execution support)
                    if (shellType !== 'bash' && shellType !== 'zsh') {
                        return [2 /*return*/, []];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    _a = parseInputContext(input, cursorOffset), prefix = _a.prefix, completionType = _a.completionType;
                    if (!prefix) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, getCompletionsForShell(shellType, prefix, completionType, abortSignal)
                        // Add inputSnapshot to all suggestions so we can detect when input changes
                    ];
                case 2:
                    completions = _b.sent();
                    // Add inputSnapshot to all suggestions so we can detect when input changes
                    return [2 /*return*/, completions.map(function (suggestion) { return (__assign(__assign({}, suggestion), { metadata: __assign(__assign({}, suggestion.metadata), { inputSnapshot: input }) })); })];
                case 3:
                    error_1 = _b.sent();
                    (0, debug_js_1.logForDebugging)("Shell completion failed: ".concat(error_1));
                    return [2 /*return*/, []]; // Silent fail
                case 4: return [2 /*return*/];
            }
        });
    });
}
