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
exports.getDefaultTimeoutMs = getDefaultTimeoutMs;
exports.getMaxTimeoutMs = getMaxTimeoutMs;
exports.getPrompt = getPrompt;
var envUtils_js_1 = require("../../utils/envUtils.js");
var outputLimits_js_1 = require("../../utils/shell/outputLimits.js");
var powershellDetection_js_1 = require("../../utils/shell/powershellDetection.js");
var timeouts_js_1 = require("../../utils/timeouts.js");
var constants_js_1 = require("../FileEditTool/constants.js");
var prompt_js_1 = require("../FileReadTool/prompt.js");
var prompt_js_2 = require("../FileWriteTool/prompt.js");
var prompt_js_3 = require("../GlobTool/prompt.js");
var prompt_js_4 = require("../GrepTool/prompt.js");
var toolName_js_1 = require("./toolName.js");
function getDefaultTimeoutMs() {
    return (0, timeouts_js_1.getDefaultBashTimeoutMs)();
}
function getMaxTimeoutMs() {
    return (0, timeouts_js_1.getMaxBashTimeoutMs)();
}
function getBackgroundUsageNote() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS)) {
        return null;
    }
    return "  - You can use the `run_in_background` parameter to run the command in the background. Only use this if you don't need the result immediately and are OK being notified when the command completes later. You do not need to check the output right away - you'll be notified when it finishes.";
}
function getSleepGuidance() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS)) {
        return null;
    }
    return "  - Avoid unnecessary `Start-Sleep` commands:\n    - Do not sleep between commands that can run immediately \u2014 just run them.\n    - If your command is long running and you would like to be notified when it finishes \u2014 simply run your command using `run_in_background`. There is no need to sleep in this case.\n    - Do not retry failing commands in a sleep loop \u2014 diagnose the root cause or consider an alternative approach.\n    - If waiting for a background task you started with `run_in_background`, you will be notified when it completes \u2014 do not poll.\n    - If you must poll an external process, use a check command rather than sleeping first.\n    - If you must sleep, keep the duration short (1-5 seconds) to avoid blocking the user.";
}
/**
 * Version-specific syntax guidance. The model's training data covers both
 * editions but it can't tell which one it's targeting, so it either emits
 * pwsh-7 syntax on 5.1 (parser error → exit 1) or needlessly avoids && on 7.
 */
function getEditionSection(edition) {
    if (edition === 'desktop') {
        return "PowerShell edition: Windows PowerShell 5.1 (powershell.exe)\n   - Pipeline chain operators `&&` and `||` are NOT available \u2014 they cause a parser error. To run B only if A succeeds: `A; if ($?) { B }`. To chain unconditionally: `A; B`.\n   - Ternary (`?:`), null-coalescing (`??`), and null-conditional (`?.`) operators are NOT available. Use `if/else` and explicit `$null -eq` checks instead.\n   - Avoid `2>&1` on native executables. In 5.1, redirecting a native command's stderr inside PowerShell wraps each line in an ErrorRecord (NativeCommandError) and sets `$?` to `$false` even when the exe returned exit code 0. stderr is already captured for you \u2014 don't redirect it.\n   - Default file encoding is UTF-16 LE (with BOM). When writing files other tools will read, pass `-Encoding utf8` to `Out-File`/`Set-Content`.\n   - `ConvertFrom-Json` returns a PSCustomObject, not a hashtable. `-AsHashtable` is not available.";
    }
    if (edition === 'core') {
        return "PowerShell edition: PowerShell 7+ (pwsh)\n   - Pipeline chain operators `&&` and `||` ARE available and work like bash. Prefer `cmd1 && cmd2` over `cmd1; cmd2` when cmd2 should only run if cmd1 succeeds.\n   - Ternary (`$cond ? $a : $b`), null-coalescing (`??`), and null-conditional (`?.`) operators are available.\n   - Default file encoding is UTF-8 without BOM.";
    }
    // Detection not yet resolved (first prompt build before any tool call) or
    // PS not installed. Give the conservative 5.1-safe guidance.
    return "PowerShell edition: unknown \u2014 assume Windows PowerShell 5.1 for compatibility\n   - Do NOT use `&&`, `||`, ternary `?:`, null-coalescing `??`, or null-conditional `?.`. These are PowerShell 7+ only and parser-error on 5.1.\n   - To chain commands conditionally: `A; if ($?) { B }`. Unconditionally: `A; B`.";
}
function getPrompt() {
    return __awaiter(this, void 0, void 0, function () {
        var backgroundNote, sleepGuidance, edition;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    backgroundNote = getBackgroundUsageNote();
                    sleepGuidance = getSleepGuidance();
                    return [4 /*yield*/, (0, powershellDetection_js_1.getPowerShellEdition)()];
                case 1:
                    edition = _a.sent();
                    return [2 /*return*/, "Executes a given PowerShell command with optional timeout. Working directory persists between commands; shell state (variables, functions) does not.\n\nIMPORTANT: This tool is for terminal operations via PowerShell: git, npm, docker, and PS cmdlets. DO NOT use it for file operations (reading, writing, editing, searching, finding files) - use the specialized tools for this instead.\n\n".concat(getEditionSection(edition), "\n\nBefore executing the command, please follow these steps:\n\n1. Directory Verification:\n   - If the command will create new directories or files, first use `Get-ChildItem` (or `ls`) to verify the parent directory exists and is the correct location\n\n2. Command Execution:\n   - Always quote file paths that contain spaces with double quotes\n   - Capture the output of the command.\n\nPowerShell Syntax Notes:\n   - Variables use $ prefix: $myVar = \"value\"\n   - Escape character is backtick (`), not backslash\n   - Use Verb-Noun cmdlet naming: Get-ChildItem, Set-Location, New-Item, Remove-Item\n   - Common aliases: ls (Get-ChildItem), cd (Set-Location), cat (Get-Content), rm (Remove-Item)\n   - Pipe operator | works similarly to bash but passes objects, not text\n   - Use Select-Object, Where-Object, ForEach-Object for filtering and transformation\n   - String interpolation: \"Hello $name\" or \"Hello $($obj.Property)\"\n   - Registry access uses PSDrive prefixes: `HKLM:\\SOFTWARE\\...`, `HKCU:\\...` \u2014 NOT raw `HKEY_LOCAL_MACHINE\\...`\n   - Environment variables: read with `$env:NAME`, set with `$env:NAME = \"value\"` (NOT `Set-Variable` or bash `export`)\n   - Call native exe with spaces in path via call operator: `& \"C:\\Program Files\\App\\app.exe\" arg1 arg2`\n\nInteractive and blocking commands (will hang \u2014 this tool runs with -NonInteractive):\n   - NEVER use `Read-Host`, `Get-Credential`, `Out-GridView`, `$Host.UI.PromptForChoice`, or `pause`\n   - Destructive cmdlets (`Remove-Item`, `Stop-Process`, `Clear-Content`, etc.) may prompt for confirmation. Add `-Confirm:$false` when you intend the action to proceed. Use `-Force` for read-only/hidden items.\n   - Never use `git rebase -i`, `git add -i`, or other commands that open an interactive editor\n\nPassing multiline strings (commit messages, file content) to native executables:\n   - Use a single-quoted here-string so PowerShell does not expand `$` or backticks inside. The closing `'@` MUST be at column 0 (no leading whitespace) on its own line \u2014 indenting it is a parse error:\n<example>\ngit commit -m @'\nCommit message here.\nSecond line with $literal dollar signs.\n'@\n</example>\n   - Use `@'...'@` (single-quoted, literal) not `@\"...\"@` (double-quoted, interpolated) unless you need variable expansion\n   - For arguments containing `-`, `@`, or other characters PowerShell parses as operators, use the stop-parsing token: `git log --% --format=%H`\n\nUsage notes:\n  - The command argument is required.\n  - You can specify an optional timeout in milliseconds (up to ").concat(getMaxTimeoutMs(), "ms / ").concat(getMaxTimeoutMs() / 60000, " minutes). If not specified, commands will timeout after ").concat(getDefaultTimeoutMs(), "ms (").concat(getDefaultTimeoutMs() / 60000, " minutes).\n  - It is very helpful if you write a clear, concise description of what this command does.\n  - If the output exceeds ").concat((0, outputLimits_js_1.getMaxOutputLength)(), " characters, output will be truncated before being returned to you.\n").concat(backgroundNote ? backgroundNote + '\n' : '', "  - Avoid using PowerShell to run commands that have dedicated tools, unless explicitly instructed:\n    - File search: Use ").concat(prompt_js_3.GLOB_TOOL_NAME, " (NOT Get-ChildItem -Recurse)\n    - Content search: Use ").concat(prompt_js_4.GREP_TOOL_NAME, " (NOT Select-String)\n    - Read files: Use ").concat(prompt_js_1.FILE_READ_TOOL_NAME, " (NOT Get-Content)\n    - Edit files: Use ").concat(constants_js_1.FILE_EDIT_TOOL_NAME, "\n    - Write files: Use ").concat(prompt_js_2.FILE_WRITE_TOOL_NAME, " (NOT Set-Content/Out-File)\n    - Communication: Output text directly (NOT Write-Output/Write-Host)\n  - When issuing multiple commands:\n    - If the commands are independent and can run in parallel, make multiple ").concat(toolName_js_1.POWERSHELL_TOOL_NAME, " tool calls in a single message.\n    - If the commands depend on each other and must run sequentially, chain them in a single ").concat(toolName_js_1.POWERSHELL_TOOL_NAME, " call (see edition-specific chaining syntax above).\n    - Use `;` only when you need to run commands sequentially but don't care if earlier commands fail.\n    - DO NOT use newlines to separate commands (newlines are ok in quoted strings and here-strings)\n  - Do NOT prefix commands with `cd` or `Set-Location` -- the working directory is already set to the correct project directory automatically.\n").concat(sleepGuidance ? sleepGuidance + '\n' : '', "  - For git commands:\n    - Prefer to create a new commit rather than amending an existing commit.\n    - Before running destructive operations (e.g., git reset --hard, git push --force, git checkout --), consider whether there is a safer alternative that achieves the same goal. Only use destructive operations when they are truly the best approach.\n    - Never skip hooks (--no-verify) or bypass signing (--no-gpg-sign, -c commit.gpgsign=false) unless the user has explicitly asked for it. If a hook fails, investigate and fix the underlying issue.")];
            }
        });
    });
}
