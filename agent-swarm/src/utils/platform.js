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
exports.getLinuxDistroInfo = exports.getWslVersion = exports.getPlatform = exports.SUPPORTED_PLATFORMS = void 0;
exports.detectVcs = detectVcs;
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var os_1 = require("os");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
exports.SUPPORTED_PLATFORMS = ['macos', 'wsl'];
exports.getPlatform = (0, memoize_js_1.default)(function () {
    try {
        if (process.platform === 'darwin') {
            return 'macos';
        }
        if (process.platform === 'win32') {
            return 'windows';
        }
        if (process.platform === 'linux') {
            // Check if running in WSL (Windows Subsystem for Linux)
            try {
                var procVersion = (0, fsOperations_js_1.getFsImplementation)().readFileSync('/proc/version', { encoding: 'utf8' });
                if (procVersion.toLowerCase().includes('microsoft') ||
                    procVersion.toLowerCase().includes('wsl')) {
                    return 'wsl';
                }
            }
            catch (error) {
                // Error reading /proc/version, assume regular Linux
                (0, log_js_1.logError)(error);
            }
            // Regular Linux
            return 'linux';
        }
        // Unknown platform
        return 'unknown';
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return 'unknown';
    }
});
exports.getWslVersion = (0, memoize_js_1.default)(function () {
    // Only check for WSL on Linux systems
    if (process.platform !== 'linux') {
        return undefined;
    }
    try {
        var procVersion = (0, fsOperations_js_1.getFsImplementation)().readFileSync('/proc/version', {
            encoding: 'utf8',
        });
        // First check for explicit WSL version markers (e.g., "WSL2", "WSL3", etc.)
        var wslVersionMatch = procVersion.match(/WSL(\d+)/i);
        if (wslVersionMatch && wslVersionMatch[1]) {
            return wslVersionMatch[1];
        }
        // If no explicit WSL version but contains Microsoft, assume WSL1
        // This handles the original WSL1 format: "4.4.0-19041-Microsoft"
        if (procVersion.toLowerCase().includes('microsoft')) {
            return '1';
        }
        // Not WSL or unable to determine version
        return undefined;
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return undefined;
    }
});
exports.getLinuxDistroInfo = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, content, _i, _a, line, match, value, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (process.platform !== 'linux') {
                    return [2 /*return*/, undefined];
                }
                result = {
                    linuxKernel: (0, os_1.release)(),
                };
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, promises_1.readFile)('/etc/os-release', 'utf8')];
            case 2:
                content = _c.sent();
                for (_i = 0, _a = content.split('\n'); _i < _a.length; _i++) {
                    line = _a[_i];
                    match = line.match(/^(ID|VERSION_ID)=(.*)$/);
                    if (match && match[1] && match[2]) {
                        value = match[2].replace(/^"|"$/g, '');
                        if (match[1] === 'ID') {
                            result.linuxDistroId = value;
                        }
                        else {
                            result.linuxDistroVersion = value;
                        }
                    }
                }
                return [3 /*break*/, 4];
            case 3:
                _b = _c.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, result];
        }
    });
}); });
var VCS_MARKERS = [
    ['.git', 'git'],
    ['.hg', 'mercurial'],
    ['.svn', 'svn'],
    ['.p4config', 'perforce'],
    ['$tf', 'tfs'],
    ['.tfvc', 'tfs'],
    ['.jj', 'jujutsu'],
    ['.sl', 'sapling'],
];
function detectVcs(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var detected, targetDir, entries, _a, _i, VCS_MARKERS_1, _b, marker, vcs, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    detected = new Set();
                    // Check for Perforce via env var
                    if (process.env.P4PORT) {
                        detected.add('perforce');
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    targetDir = dir !== null && dir !== void 0 ? dir : (0, fsOperations_js_1.getFsImplementation)().cwd();
                    _a = Set.bind;
                    return [4 /*yield*/, (0, promises_1.readdir)(targetDir)];
                case 2:
                    entries = new (_a.apply(Set, [void 0, _d.sent()]))();
                    for (_i = 0, VCS_MARKERS_1 = VCS_MARKERS; _i < VCS_MARKERS_1.length; _i++) {
                        _b = VCS_MARKERS_1[_i], marker = _b[0], vcs = _b[1];
                        if (entries.has(marker)) {
                            detected.add(vcs);
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _c = _d.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, __spreadArray([], detected, true)];
            }
        });
    });
}
