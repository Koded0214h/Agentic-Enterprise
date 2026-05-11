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
exports.buildPowerShellArgs = buildPowerShellArgs;
exports.createPowerShellProvider = createPowerShellProvider;
var os_1 = require("os");
var path_1 = require("path");
var posix_1 = require("path/posix");
var sessionEnvVars_js_1 = require("../sessionEnvVars.js");
/**
 * PowerShell invocation flags + command. Shared by the provider's getSpawnArgs
 * and the hook spawn path in hooks.ts so the flag set stays in one place.
 */
function buildPowerShellArgs(cmd) {
    return ['-NoProfile', '-NonInteractive', '-Command', cmd];
}
/**
 * Base64-encode a string as UTF-16LE for PowerShell's -EncodedCommand.
 * Same encoding the parser uses (parser.ts toUtf16LeBase64). The output
 * is [A-Za-z0-9+/=] only — survives ANY shell-quoting layer, including
 * @anthropic-ai/sandbox-runtime's shellquote.quote() which would otherwise
 * corrupt !$? to \!$? when re-wrapping a single-quoted string in double
 * quotes. Review 2964609818.
 */
function encodePowerShellCommand(psCommand) {
    return Buffer.from(psCommand, 'utf16le').toString('base64');
}
function createPowerShellProvider(shellPath) {
    var currentSandboxTmpDir;
    return {
        type: 'powershell',
        shellPath: shellPath,
        detached: false,
        buildExecCommand: function (command, opts) {
            return __awaiter(this, void 0, void 0, function () {
                var cwdFilePath, escapedCwdFilePath, cwdTracking, psCommand, commandString;
                return __generator(this, function (_a) {
                    // Stash sandboxTmpDir for getEnvironmentOverrides (mirrors bashProvider)
                    currentSandboxTmpDir = opts.useSandbox ? opts.sandboxTmpDir : undefined;
                    cwdFilePath = opts.useSandbox && opts.sandboxTmpDir
                        ? (0, posix_1.join)(opts.sandboxTmpDir, "claude-pwd-ps-".concat(opts.id))
                        : (0, path_1.join)((0, os_1.tmpdir)(), "claude-pwd-ps-".concat(opts.id));
                    escapedCwdFilePath = cwdFilePath.replace(/'/g, "''");
                    cwdTracking = "\n; $_ec = if ($null -ne $LASTEXITCODE) { $LASTEXITCODE } elseif ($?) { 0 } else { 1 }\n; (Get-Location).Path | Out-File -FilePath '".concat(escapedCwdFilePath, "' -Encoding utf8 -NoNewline\n; exit $_ec");
                    psCommand = command + cwdTracking;
                    commandString = opts.useSandbox
                        ? [
                            "'".concat(shellPath.replace(/'/g, "'\\''"), "'"),
                            '-NoProfile',
                            '-NonInteractive',
                            '-EncodedCommand',
                            encodePowerShellCommand(psCommand),
                        ].join(' ')
                        : psCommand;
                    return [2 /*return*/, { commandString: commandString, cwdFilePath: cwdFilePath }];
                });
            });
        },
        getSpawnArgs: function (commandString) {
            return buildPowerShellArgs(commandString);
        },
        getEnvironmentOverrides: function () {
            return __awaiter(this, void 0, void 0, function () {
                var env, _i, _a, _b, key, value;
                return __generator(this, function (_c) {
                    env = {};
                    // Apply session env vars set via /env (child processes only, not
                    // the REPL). Without this, `/env PATH=...` affects Bash tool
                    // commands but not PowerShell — so PyCharm users with a stripped
                    // PATH can't self-rescue.
                    // Ordering: session vars FIRST so the sandbox TMPDIR below can't be
                    // overridden by `/env TMPDIR=...`. bashProvider.ts has these in the
                    // opposite order (pre-existing), but sandbox isolation should win.
                    for (_i = 0, _a = (0, sessionEnvVars_js_1.getSessionEnvVars)(); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        env[key] = value;
                    }
                    if (currentSandboxTmpDir) {
                        // PowerShell on Linux/macOS honors TMPDIR for [System.IO.Path]::GetTempPath()
                        env.TMPDIR = currentSandboxTmpDir;
                        env.CLAUDE_CODE_TMPDIR = currentSandboxTmpDir;
                    }
                    return [2 /*return*/, env];
                });
            });
        },
    };
}
