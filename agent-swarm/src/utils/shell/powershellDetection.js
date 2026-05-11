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
exports.findPowerShell = findPowerShell;
exports.getCachedPowerShellPath = getCachedPowerShellPath;
exports.getPowerShellEdition = getPowerShellEdition;
exports.resetPowerShellCache = resetPowerShellCache;
var promises_1 = require("fs/promises");
var platform_js_1 = require("../platform.js");
var which_js_1 = require("../which.js");
function probePath(p) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.stat)(p)];
                case 1: return [2 /*return*/, (_b.sent()).isFile() ? p : null];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Attempts to find PowerShell on the system via PATH.
 * Prefers pwsh (PowerShell Core 7+), falls back to powershell (5.1).
 *
 * On Linux, if PATH resolves to a snap launcher (/snap/…) — directly or
 * via a symlink chain like /usr/bin/pwsh → /snap/bin/pwsh — probe known
 * apt/rpm install locations instead: the snap launcher can hang in
 * subprocesses while snapd initializes confinement, but the underlying
 * binary at /opt/microsoft/powershell/7/pwsh is reliable. On
 * Windows/macOS, PATH is sufficient.
 */
function findPowerShell() {
    return __awaiter(this, void 0, void 0, function () {
        var pwshPath, resolved, direct_1, _a, directResolved, powershellPath;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, which_js_1.which)('pwsh')];
                case 1:
                    pwshPath = _c.sent();
                    if (!pwshPath) return [3 /*break*/, 9];
                    if (!((0, platform_js_1.getPlatform)() === 'linux')) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, promises_1.realpath)(pwshPath).catch(function () { return pwshPath; })];
                case 2:
                    resolved = _c.sent();
                    if (!(pwshPath.startsWith('/snap/') || resolved.startsWith('/snap/'))) return [3 /*break*/, 8];
                    return [4 /*yield*/, probePath('/opt/microsoft/powershell/7/pwsh')];
                case 3:
                    if (!((_b = (_c.sent())) !== null && _b !== void 0)) return [3 /*break*/, 4];
                    _a = _b;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, probePath('/usr/bin/pwsh')];
                case 5:
                    _a = (_c.sent());
                    _c.label = 6;
                case 6:
                    direct_1 = _a;
                    if (!direct_1) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, promises_1.realpath)(direct_1).catch(function () { return direct_1; })];
                case 7:
                    directResolved = _c.sent();
                    if (!direct_1.startsWith('/snap/') &&
                        !directResolved.startsWith('/snap/')) {
                        return [2 /*return*/, direct_1];
                    }
                    _c.label = 8;
                case 8: return [2 /*return*/, pwshPath];
                case 9: return [4 /*yield*/, (0, which_js_1.which)('powershell')];
                case 10:
                    powershellPath = _c.sent();
                    if (powershellPath) {
                        return [2 /*return*/, powershellPath];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
var cachedPowerShellPath = null;
/**
 * Gets the cached PowerShell path. Returns a memoized promise that
 * resolves to the PowerShell executable path or null.
 */
function getCachedPowerShellPath() {
    if (!cachedPowerShellPath) {
        cachedPowerShellPath = findPowerShell();
    }
    return cachedPowerShellPath;
}
/**
 * Infers the PowerShell edition from the binary name without spawning.
 * - `pwsh` / `pwsh.exe` → 'core' (PowerShell 7+: supports `&&`, `||`, `?:`, `??`)
 * - `powershell` / `powershell.exe` → 'desktop' (Windows PowerShell 5.1:
 *   no pipeline chain operators, stderr-sets-$? bug, UTF-16 default encoding)
 *
 * PowerShell 6 (also `pwsh`, no `&&`) has been EOL since 2020 and is not
 * a realistic install target, so 'core' safely implies 7+ semantics.
 *
 * Used by the tool prompt to give version-appropriate syntax guidance so
 * the model doesn't emit `cmd1 && cmd2` on 5.1 (parser error) or avoid
 * `&&` on 7+ where it's the correct short-circuiting operator.
 */
function getPowerShellEdition() {
    return __awaiter(this, void 0, void 0, function () {
        var p, base;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCachedPowerShellPath()];
                case 1:
                    p = _a.sent();
                    if (!p)
                        return [2 /*return*/, null
                            // basename without extension, case-insensitive. Covers:
                            //   C:\Program Files\PowerShell\7\pwsh.exe
                            //   /opt/microsoft/powershell/7/pwsh
                            //   C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
                        ];
                    base = p
                        .split(/[/\\]/)
                        .pop()
                        .toLowerCase()
                        .replace(/\.exe$/, '');
                    return [2 /*return*/, base === 'pwsh' ? 'core' : 'desktop'];
            }
        });
    });
}
/**
 * Resets the cached PowerShell path. Only for testing.
 */
function resetPowerShellCache() {
    cachedPowerShellPath = null;
}
