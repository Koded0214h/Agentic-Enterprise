"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
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
exports.NodeFsOperations = void 0;
exports.safeResolvePath = safeResolvePath;
exports.isDuplicatePath = isDuplicatePath;
exports.resolveDeepestExistingAncestorSync = resolveDeepestExistingAncestorSync;
exports.getPathsForPermissionCheck = getPathsForPermissionCheck;
exports.setFsImplementation = setFsImplementation;
exports.getFsImplementation = getFsImplementation;
exports.setOriginalFsImplementation = setOriginalFsImplementation;
exports.readFileRange = readFileRange;
exports.tailFile = tailFile;
exports.readLinesReverse = readLinesReverse;
var fs = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var nodePath = require("path");
var errors_js_1 = require("./errors.js");
var slowOperations_js_1 = require("./slowOperations.js");
/**
 * Safely resolves a file path, handling symlinks and errors gracefully.
 *
 * Error handling strategy:
 * - If the file doesn't exist, returns the original path (allows for file creation)
 * - If symlink resolution fails (broken symlink, permission denied, circular links),
 *   returns the original path and marks it as not a symlink
 * - This ensures operations can continue with the original path rather than failing
 *
 * @param fs The filesystem implementation to use
 * @param filePath The path to resolve
 * @returns Object containing the resolved path and whether it was a symlink
 */
function safeResolvePath(fs, filePath) {
    // Block UNC paths before any filesystem access to prevent network
    // requests (DNS/SMB) during validation on Windows
    if (filePath.startsWith('//') || filePath.startsWith('\\\\')) {
        return { resolvedPath: filePath, isSymlink: false, isCanonical: false };
    }
    try {
        // Check for special file types (FIFOs, sockets, devices) before calling realpathSync.
        // realpathSync can block on FIFOs waiting for a writer, causing hangs.
        // If the file doesn't exist, lstatSync throws ENOENT which the catch
        // below handles by returning the original path (allows file creation).
        var stats = fs.lstatSync(filePath);
        if (stats.isFIFO() ||
            stats.isSocket() ||
            stats.isCharacterDevice() ||
            stats.isBlockDevice()) {
            return { resolvedPath: filePath, isSymlink: false, isCanonical: false };
        }
        var resolvedPath = fs.realpathSync(filePath);
        return {
            resolvedPath: resolvedPath,
            isSymlink: resolvedPath !== filePath,
            // realpathSync returned: resolvedPath is canonical (all symlinks in
            // all path components resolved). Callers can skip further symlink
            // resolution on this path.
            isCanonical: true,
        };
    }
    catch (_error) {
        // If lstat/realpath fails for any reason (ENOENT, broken symlink,
        // EACCES, ELOOP, etc.), return the original path to allow operations
        // to proceed
        return { resolvedPath: filePath, isSymlink: false, isCanonical: false };
    }
}
/**
 * Check if a file path is a duplicate and should be skipped.
 * Resolves symlinks to detect duplicates pointing to the same file.
 * If not a duplicate, adds the resolved path to loadedPaths.
 *
 * @returns true if the file should be skipped (is duplicate)
 */
function isDuplicatePath(fs, filePath, loadedPaths) {
    var resolvedPath = safeResolvePath(fs, filePath).resolvedPath;
    if (loadedPaths.has(resolvedPath)) {
        return true;
    }
    loadedPaths.add(resolvedPath);
    return false;
}
/**
 * Resolve the deepest existing ancestor of a path via realpathSync, walking
 * up until it succeeds. Detects dangling symlinks (link entry exists, target
 * doesn't) via lstat and resolves them via readlink.
 *
 * Use when the input path may not exist (new file writes) and you need to
 * know where the write would ACTUALLY land after the OS follows symlinks.
 *
 * Returns the resolved absolute path with non-existent tail segments
 * rejoined, or undefined if no symlink was found in any existing ancestor
 * (the path's existing ancestors all resolve to themselves).
 *
 * Handles: live parent symlinks, dangling file symlinks, dangling parent
 * symlinks. Same core algorithm as teamMemPaths.ts:realpathDeepestExisting.
 */
function resolveDeepestExistingAncestorSync(fs, absolutePath) {
    var dir = absolutePath;
    var segments = [];
    // Walk up using lstat (cheap, O(1)) to find the first existing component.
    // lstat does not follow symlinks, so dangling symlinks are detected here.
    // Only call realpathSync (expensive, O(depth)) once at the end.
    while (dir !== nodePath.dirname(dir)) {
        var st = void 0;
        try {
            st = fs.lstatSync(dir);
        }
        catch (_a) {
            // lstat failed: truly non-existent. Walk up.
            segments.unshift(nodePath.basename(dir));
            dir = nodePath.dirname(dir);
            continue;
        }
        if (st.isSymbolicLink()) {
            // Found a symlink (live or dangling). Try realpath first (resolves
            // chained symlinks); fall back to readlink for dangling symlinks.
            try {
                var resolved = fs.realpathSync(dir);
                return segments.length === 0
                    ? resolved
                    : nodePath.join.apply(nodePath, __spreadArray([resolved], segments, false));
            }
            catch (_b) {
                // Dangling: realpath failed but lstat saw the link entry.
                var target = fs.readlinkSync(dir);
                var absTarget = nodePath.isAbsolute(target)
                    ? target
                    : nodePath.resolve(nodePath.dirname(dir), target);
                return segments.length === 0
                    ? absTarget
                    : nodePath.join.apply(nodePath, __spreadArray([absTarget], segments, false));
            }
        }
        // Existing non-symlink component. One realpath call resolves any
        // symlinks in its ancestors. If none, return undefined (no symlink).
        try {
            var resolved = fs.realpathSync(dir);
            if (resolved !== dir) {
                return segments.length === 0
                    ? resolved
                    : nodePath.join.apply(nodePath, __spreadArray([resolved], segments, false));
            }
        }
        catch (_c) {
            // realpath can still fail (e.g. EACCES in ancestors). Return
            // undefined — we can't resolve, and the logical path is already
            // in pathSet for the caller.
        }
        return undefined;
    }
    return undefined;
}
/**
 * Gets all paths that should be checked for permissions.
 * This includes the original path, all intermediate symlink targets in the chain,
 * and the final resolved path.
 *
 * For example, if test.txt -> /etc/passwd -> /private/etc/passwd:
 * - test.txt (original path)
 * - /etc/passwd (intermediate symlink target)
 * - /private/etc/passwd (final resolved path)
 *
 * This is important for security: a deny rule for /etc/passwd should block
 * access even if the file is actually at /private/etc/passwd (as on macOS).
 *
 * @param path - The path to check (will be converted to absolute)
 * @returns An array of absolute paths to check permissions for
 */
function getPathsForPermissionCheck(inputPath) {
    // Expand tilde notation defensively - tools should do this in getPath(),
    // but we normalize here as defense in depth for permission checking
    var path = inputPath;
    if (path === '~') {
        path = (0, os_1.homedir)().normalize('NFC');
    }
    else if (path.startsWith('~/')) {
        path = nodePath.join((0, os_1.homedir)().normalize('NFC'), path.slice(2));
    }
    var pathSet = new Set();
    var fsImpl = getFsImplementation();
    // Always check the original path
    pathSet.add(path);
    // Block UNC paths before any filesystem access to prevent network
    // requests (DNS/SMB) during validation on Windows
    if (path.startsWith('//') || path.startsWith('\\\\')) {
        return Array.from(pathSet);
    }
    // Follow the symlink chain, collecting ALL intermediate targets
    // This handles cases like: test.txt -> /etc/passwd -> /private/etc/passwd
    // We want to check all three paths, not just test.txt and /private/etc/passwd
    try {
        var currentPath = path;
        var visited = new Set();
        var maxDepth = 40; // Prevent runaway loops, matches typical SYMLOOP_MAX
        for (var depth = 0; depth < maxDepth; depth++) {
            // Prevent infinite loops from circular symlinks
            if (visited.has(currentPath)) {
                break;
            }
            visited.add(currentPath);
            if (!fsImpl.existsSync(currentPath)) {
                // Path doesn't exist (new file case). existsSync follows symlinks,
                // so this is also reached for DANGLING symlinks (link entry exists,
                // target doesn't). Resolve symlinks in the path and its ancestors
                // so permission checks see the real destination. Without this,
                // `./data -> /etc/cron.d/` (live parent symlink) or
                // `./evil.txt -> ~/.ssh/authorized_keys2` (dangling file symlink)
                // would allow writes that escape the working directory.
                if (currentPath === path) {
                    var resolved = resolveDeepestExistingAncestorSync(fsImpl, path);
                    if (resolved !== undefined) {
                        pathSet.add(resolved);
                    }
                }
                break;
            }
            var stats = fsImpl.lstatSync(currentPath);
            // Skip special file types that can cause issues
            if (stats.isFIFO() ||
                stats.isSocket() ||
                stats.isCharacterDevice() ||
                stats.isBlockDevice()) {
                break;
            }
            if (!stats.isSymbolicLink()) {
                break;
            }
            // Get the immediate symlink target
            var target = fsImpl.readlinkSync(currentPath);
            // If target is relative, resolve it relative to the symlink's directory
            var absoluteTarget = nodePath.isAbsolute(target)
                ? target
                : nodePath.resolve(nodePath.dirname(currentPath), target);
            // Add this intermediate target to the set
            pathSet.add(absoluteTarget);
            currentPath = absoluteTarget;
        }
    }
    catch (_a) {
        // If anything fails during chain traversal, continue with what we have
    }
    // Also add the final resolved path using realpathSync for completeness
    // This handles any remaining symlinks in directory components
    var _b = safeResolvePath(fsImpl, path), resolvedPath = _b.resolvedPath, isSymlink = _b.isSymlink;
    if (isSymlink && resolvedPath !== path) {
        pathSet.add(resolvedPath);
    }
    return Array.from(pathSet);
}
exports.NodeFsOperations = {
    cwd: function () {
        return process.cwd();
    },
    existsSync: function (fsPath) {
        var env_1 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_1, (0, slowOperations_js_1.slowLogging)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["fs.existsSync(", ")"], ["fs.existsSync(", ")"])), fsPath), false);
            return fs.existsSync(fsPath);
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    },
    stat: function (fsPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, promises_1.stat)(fsPath)];
            });
        });
    },
    readdir: function (fsPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, promises_1.readdir)(fsPath, { withFileTypes: true })];
            });
        });
    },
    unlink: function (fsPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, promises_1.unlink)(fsPath)];
            });
        });
    },
    rmdir: function (fsPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, promises_1.rmdir)(fsPath)];
            });
        });
    },
    rm: function (fsPath, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, promises_1.rm)(fsPath, options)];
            });
        });
    },
    mkdir: function (dirPath, options) {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, promises_1.mkdir)(dirPath, __assign({ recursive: true }, options))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        // Bun/Windows: recursive:true throws EEXIST on directories with the
                        // FILE_ATTRIBUTE_READONLY bit set (Group Policy, OneDrive, desktop.ini).
                        // Bun's directoryExistsAt misclassifies DIRECTORY+READONLY as not-a-dir
                        // (bun-internal src/sys.zig existsAtType). The dir exists; ignore.
                        // https://github.com/anthropics/claude-code/issues/30924
                        if ((0, errors_js_1.getErrnoCode)(e_2) !== 'EEXIST')
                            throw e_2;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    readFile: function (fsPath, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, promises_1.readFile)(fsPath, { encoding: options.encoding })];
            });
        });
    },
    rename: function (oldPath, newPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, promises_1.rename)(oldPath, newPath)];
            });
        });
    },
    statSync: function (fsPath) {
        var env_2 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_2, (0, slowOperations_js_1.slowLogging)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["fs.statSync(", ")"], ["fs.statSync(", ")"])), fsPath), false);
            return fs.statSync(fsPath);
        }
        catch (e_3) {
            env_2.error = e_3;
            env_2.hasError = true;
        }
        finally {
            __disposeResources(env_2);
        }
    },
    lstatSync: function (fsPath) {
        var env_3 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_3, (0, slowOperations_js_1.slowLogging)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["fs.lstatSync(", ")"], ["fs.lstatSync(", ")"])), fsPath), false);
            return fs.lstatSync(fsPath);
        }
        catch (e_4) {
            env_3.error = e_4;
            env_3.hasError = true;
        }
        finally {
            __disposeResources(env_3);
        }
    },
    readFileSync: function (fsPath, options) {
        var env_4 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_4, (0, slowOperations_js_1.slowLogging)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["fs.readFileSync(", ")"], ["fs.readFileSync(", ")"])), fsPath), false);
            return fs.readFileSync(fsPath, { encoding: options.encoding });
        }
        catch (e_5) {
            env_4.error = e_5;
            env_4.hasError = true;
        }
        finally {
            __disposeResources(env_4);
        }
    },
    readFileBytesSync: function (fsPath) {
        var env_5 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_5, (0, slowOperations_js_1.slowLogging)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["fs.readFileBytesSync(", ")"], ["fs.readFileBytesSync(", ")"])), fsPath), false);
            return fs.readFileSync(fsPath);
        }
        catch (e_6) {
            env_5.error = e_6;
            env_5.hasError = true;
        }
        finally {
            __disposeResources(env_5);
        }
    },
    readSync: function (fsPath, options) {
        var env_6 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_6, (0, slowOperations_js_1.slowLogging)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["fs.readSync(", ", ", " bytes)"], ["fs.readSync(", ", ", " bytes)"])), fsPath, options.length), false);
            var fd = undefined;
            try {
                fd = fs.openSync(fsPath, 'r');
                var buffer = Buffer.alloc(options.length);
                var bytesRead = fs.readSync(fd, buffer, 0, options.length, 0);
                return { buffer: buffer, bytesRead: bytesRead };
            }
            finally {
                if (fd)
                    fs.closeSync(fd);
            }
        }
        catch (e_7) {
            env_6.error = e_7;
            env_6.hasError = true;
        }
        finally {
            __disposeResources(env_6);
        }
    },
    appendFileSync: function (path, data, options) {
        var env_7 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_7, (0, slowOperations_js_1.slowLogging)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["fs.appendFileSync(", ", ", " chars)"], ["fs.appendFileSync(", ", ", " chars)"
                // For new files with explicit mode, use 'ax' (atomic create-with-mode) to avoid
                // TOCTOU race between existence check and open. Fall back to normal append if exists.
            ])), path, data.length), false);
            // For new files with explicit mode, use 'ax' (atomic create-with-mode) to avoid
            // TOCTOU race between existence check and open. Fall back to normal append if exists.
            if ((options === null || options === void 0 ? void 0 : options.mode) !== undefined) {
                try {
                    var fd = fs.openSync(path, 'ax', options.mode);
                    try {
                        fs.appendFileSync(fd, data);
                    }
                    finally {
                        fs.closeSync(fd);
                    }
                    return;
                }
                catch (e) {
                    if ((0, errors_js_1.getErrnoCode)(e) !== 'EEXIST')
                        throw e;
                    // File exists — fall through to normal append
                }
            }
            fs.appendFileSync(path, data);
        }
        catch (e_8) {
            env_7.error = e_8;
            env_7.hasError = true;
        }
        finally {
            __disposeResources(env_7);
        }
    },
    copyFileSync: function (src, dest) {
        var env_8 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_8, (0, slowOperations_js_1.slowLogging)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["fs.copyFileSync(", " \u2192 ", ")"], ["fs.copyFileSync(", " \u2192 ", ")"])), src, dest), false);
            fs.copyFileSync(src, dest);
        }
        catch (e_9) {
            env_8.error = e_9;
            env_8.hasError = true;
        }
        finally {
            __disposeResources(env_8);
        }
    },
    unlinkSync: function (path) {
        var env_9 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_9, (0, slowOperations_js_1.slowLogging)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["fs.unlinkSync(", ")"], ["fs.unlinkSync(", ")"])), path), false);
            fs.unlinkSync(path);
        }
        catch (e_10) {
            env_9.error = e_10;
            env_9.hasError = true;
        }
        finally {
            __disposeResources(env_9);
        }
    },
    renameSync: function (oldPath, newPath) {
        var env_10 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_10, (0, slowOperations_js_1.slowLogging)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["fs.renameSync(", " \u2192 ", ")"], ["fs.renameSync(", " \u2192 ", ")"])), oldPath, newPath), false);
            fs.renameSync(oldPath, newPath);
        }
        catch (e_11) {
            env_10.error = e_11;
            env_10.hasError = true;
        }
        finally {
            __disposeResources(env_10);
        }
    },
    linkSync: function (target, path) {
        var env_11 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_11, (0, slowOperations_js_1.slowLogging)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["fs.linkSync(", " \u2192 ", ")"], ["fs.linkSync(", " \u2192 ", ")"])), target, path), false);
            fs.linkSync(target, path);
        }
        catch (e_12) {
            env_11.error = e_12;
            env_11.hasError = true;
        }
        finally {
            __disposeResources(env_11);
        }
    },
    symlinkSync: function (target, path, type) {
        var env_12 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_12, (0, slowOperations_js_1.slowLogging)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["fs.symlinkSync(", " \u2192 ", ")"], ["fs.symlinkSync(", " \u2192 ", ")"])), target, path), false);
            fs.symlinkSync(target, path, type);
        }
        catch (e_13) {
            env_12.error = e_13;
            env_12.hasError = true;
        }
        finally {
            __disposeResources(env_12);
        }
    },
    readlinkSync: function (path) {
        var env_13 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_13, (0, slowOperations_js_1.slowLogging)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["fs.readlinkSync(", ")"], ["fs.readlinkSync(", ")"])), path), false);
            return fs.readlinkSync(path);
        }
        catch (e_14) {
            env_13.error = e_14;
            env_13.hasError = true;
        }
        finally {
            __disposeResources(env_13);
        }
    },
    realpathSync: function (path) {
        var env_14 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_14, (0, slowOperations_js_1.slowLogging)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["fs.realpathSync(", ")"], ["fs.realpathSync(", ")"])), path), false);
            return fs.realpathSync(path).normalize('NFC');
        }
        catch (e_15) {
            env_14.error = e_15;
            env_14.hasError = true;
        }
        finally {
            __disposeResources(env_14);
        }
    },
    mkdirSync: function (dirPath, options) {
        var env_15 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_15, (0, slowOperations_js_1.slowLogging)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["fs.mkdirSync(", ")"], ["fs.mkdirSync(", ")"])), dirPath), false);
            var mkdirOptions = {
                recursive: true,
            };
            if ((options === null || options === void 0 ? void 0 : options.mode) !== undefined) {
                mkdirOptions.mode = options.mode;
            }
            try {
                fs.mkdirSync(dirPath, mkdirOptions);
            }
            catch (e) {
                // Bun/Windows: recursive:true throws EEXIST on directories with the
                // FILE_ATTRIBUTE_READONLY bit set (Group Policy, OneDrive, desktop.ini).
                // Bun's directoryExistsAt misclassifies DIRECTORY+READONLY as not-a-dir
                // (bun-internal src/sys.zig existsAtType). The dir exists; ignore.
                // https://github.com/anthropics/claude-code/issues/30924
                if ((0, errors_js_1.getErrnoCode)(e) !== 'EEXIST')
                    throw e;
            }
        }
        catch (e_16) {
            env_15.error = e_16;
            env_15.hasError = true;
        }
        finally {
            __disposeResources(env_15);
        }
    },
    readdirSync: function (dirPath) {
        var env_16 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_16, (0, slowOperations_js_1.slowLogging)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["fs.readdirSync(", ")"], ["fs.readdirSync(", ")"])), dirPath), false);
            return fs.readdirSync(dirPath, { withFileTypes: true });
        }
        catch (e_17) {
            env_16.error = e_17;
            env_16.hasError = true;
        }
        finally {
            __disposeResources(env_16);
        }
    },
    readdirStringSync: function (dirPath) {
        var env_17 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_17, (0, slowOperations_js_1.slowLogging)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["fs.readdirStringSync(", ")"], ["fs.readdirStringSync(", ")"])), dirPath), false);
            return fs.readdirSync(dirPath);
        }
        catch (e_18) {
            env_17.error = e_18;
            env_17.hasError = true;
        }
        finally {
            __disposeResources(env_17);
        }
    },
    isDirEmptySync: function (dirPath) {
        var env_18 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_18, (0, slowOperations_js_1.slowLogging)(templateObject_18 || (templateObject_18 = __makeTemplateObject(["fs.isDirEmptySync(", ")"], ["fs.isDirEmptySync(", ")"])), dirPath), false);
            var files = this.readdirSync(dirPath);
            return files.length === 0;
        }
        catch (e_19) {
            env_18.error = e_19;
            env_18.hasError = true;
        }
        finally {
            __disposeResources(env_18);
        }
    },
    rmdirSync: function (dirPath) {
        var env_19 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_19, (0, slowOperations_js_1.slowLogging)(templateObject_19 || (templateObject_19 = __makeTemplateObject(["fs.rmdirSync(", ")"], ["fs.rmdirSync(", ")"])), dirPath), false);
            fs.rmdirSync(dirPath);
        }
        catch (e_20) {
            env_19.error = e_20;
            env_19.hasError = true;
        }
        finally {
            __disposeResources(env_19);
        }
    },
    rmSync: function (path, options) {
        var env_20 = { stack: [], error: void 0, hasError: false };
        try {
            var _ = __addDisposableResource(env_20, (0, slowOperations_js_1.slowLogging)(templateObject_20 || (templateObject_20 = __makeTemplateObject(["fs.rmSync(", ")"], ["fs.rmSync(", ")"])), path), false);
            fs.rmSync(path, options);
        }
        catch (e_21) {
            env_20.error = e_21;
            env_20.hasError = true;
        }
        finally {
            __disposeResources(env_20);
        }
    },
    createWriteStream: function (path) {
        return fs.createWriteStream(path);
    },
    readFileBytes: function (fsPath, maxBytes) {
        return __awaiter(this, void 0, void 0, function () {
            var handle, size, readSize, buffer, offset, bytesRead;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (maxBytes === undefined) {
                            return [2 /*return*/, (0, promises_1.readFile)(fsPath)];
                        }
                        return [4 /*yield*/, (0, promises_1.open)(fsPath, 'r')];
                    case 1:
                        handle = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 7, 9]);
                        return [4 /*yield*/, handle.stat()];
                    case 3:
                        size = (_a.sent()).size;
                        readSize = Math.min(size, maxBytes);
                        buffer = Buffer.allocUnsafe(readSize);
                        offset = 0;
                        _a.label = 4;
                    case 4:
                        if (!(offset < readSize)) return [3 /*break*/, 6];
                        return [4 /*yield*/, handle.read(buffer, offset, readSize - offset, offset)];
                    case 5:
                        bytesRead = (_a.sent()).bytesRead;
                        if (bytesRead === 0)
                            return [3 /*break*/, 6];
                        offset += bytesRead;
                        return [3 /*break*/, 4];
                    case 6: return [2 /*return*/, offset < readSize ? buffer.subarray(0, offset) : buffer];
                    case 7: return [4 /*yield*/, handle.close()];
                    case 8:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    },
};
// The currently active filesystem implementation
var activeFs = exports.NodeFsOperations;
/**
 * Overrides the filesystem implementation. Note: This function does not
 * automatically update cwd.
 * @param implementation The filesystem implementation to use
 */
function setFsImplementation(implementation) {
    activeFs = implementation;
}
/**
 * Gets the currently active filesystem implementation
 * @returns The currently active filesystem implementation
 */
function getFsImplementation() {
    return activeFs;
}
/**
 * Resets the filesystem implementation to the default Node.js implementation.
 * Note: This function does not automatically update cwd.
 */
function setOriginalFsImplementation() {
    activeFs = exports.NodeFsOperations;
}
/**
 * Read up to `maxBytes` from a file starting at `offset`.
 * Returns a flat string from Buffer — no sliced string references to a
 * larger parent. Returns null if the file is smaller than the offset.
 */
function readFileRange(path, offset, maxBytes) {
    return __awaiter(this, void 0, void 0, function () {
        var env_21, fh, _a, size, bytesToRead, buffer, totalRead, bytesRead, e_22, result_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    env_21 = { stack: [], error: void 0, hasError: false };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 11]);
                    _a = [env_21];
                    return [4 /*yield*/, (0, promises_1.open)(path, 'r')];
                case 2:
                    fh = __addDisposableResource.apply(void 0, _a.concat([_b.sent(), true]));
                    return [4 /*yield*/, fh.stat()];
                case 3:
                    size = (_b.sent()).size;
                    if (size <= offset) {
                        return [2 /*return*/, null];
                    }
                    bytesToRead = Math.min(size - offset, maxBytes);
                    buffer = Buffer.allocUnsafe(bytesToRead);
                    totalRead = 0;
                    _b.label = 4;
                case 4:
                    if (!(totalRead < bytesToRead)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fh.read(buffer, totalRead, bytesToRead - totalRead, offset + totalRead)];
                case 5:
                    bytesRead = (_b.sent()).bytesRead;
                    if (bytesRead === 0) {
                        return [3 /*break*/, 6];
                    }
                    totalRead += bytesRead;
                    return [3 /*break*/, 4];
                case 6: return [2 /*return*/, {
                        content: buffer.toString('utf8', 0, totalRead),
                        bytesRead: totalRead,
                        bytesTotal: size,
                    }];
                case 7:
                    e_22 = _b.sent();
                    env_21.error = e_22;
                    env_21.hasError = true;
                    return [3 /*break*/, 11];
                case 8:
                    result_1 = __disposeResources(env_21);
                    if (!result_1) return [3 /*break*/, 10];
                    return [4 /*yield*/, result_1];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read the last `maxBytes` of a file.
 * Returns the whole file if it's smaller than maxBytes.
 */
function tailFile(path, maxBytes) {
    return __awaiter(this, void 0, void 0, function () {
        var env_22, fh, _a, size, offset, bytesToRead, buffer, totalRead, bytesRead, e_23, result_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    env_22 = { stack: [], error: void 0, hasError: false };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 11]);
                    _a = [env_22];
                    return [4 /*yield*/, (0, promises_1.open)(path, 'r')];
                case 2:
                    fh = __addDisposableResource.apply(void 0, _a.concat([_b.sent(), true]));
                    return [4 /*yield*/, fh.stat()];
                case 3:
                    size = (_b.sent()).size;
                    if (size === 0) {
                        return [2 /*return*/, { content: '', bytesRead: 0, bytesTotal: 0 }];
                    }
                    offset = Math.max(0, size - maxBytes);
                    bytesToRead = size - offset;
                    buffer = Buffer.allocUnsafe(bytesToRead);
                    totalRead = 0;
                    _b.label = 4;
                case 4:
                    if (!(totalRead < bytesToRead)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fh.read(buffer, totalRead, bytesToRead - totalRead, offset + totalRead)];
                case 5:
                    bytesRead = (_b.sent()).bytesRead;
                    if (bytesRead === 0) {
                        return [3 /*break*/, 6];
                    }
                    totalRead += bytesRead;
                    return [3 /*break*/, 4];
                case 6: return [2 /*return*/, {
                        content: buffer.toString('utf8', 0, totalRead),
                        bytesRead: totalRead,
                        bytesTotal: size,
                    }];
                case 7:
                    e_23 = _b.sent();
                    env_22.error = e_23;
                    env_22.hasError = true;
                    return [3 /*break*/, 11];
                case 8:
                    result_2 = __disposeResources(env_22);
                    if (!result_2) return [3 /*break*/, 10];
                    return [4 /*yield*/, result_2];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Async generator that yields lines from a file in reverse order.
 * Reads the file backwards in chunks to avoid loading the entire file into memory.
 * @param path - The path to the file to read
 * @returns An async generator that yields lines in reverse order
 */
function readLinesReverse(path) {
    return __asyncGenerator(this, arguments, function readLinesReverse_1() {
        var CHUNK_SIZE, fileHandle, stats, position, remainder, buffer, currentChunkSize, combined, firstNewline, lines, i, line;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CHUNK_SIZE = 1024 * 4;
                    return [4 /*yield*/, __await((0, promises_1.open)(path, 'r'))];
                case 1:
                    fileHandle = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 15, 17]);
                    return [4 /*yield*/, __await(fileHandle.stat())];
                case 3:
                    stats = _a.sent();
                    position = stats.size;
                    remainder = Buffer.alloc(0);
                    buffer = Buffer.alloc(CHUNK_SIZE);
                    _a.label = 4;
                case 4:
                    if (!(position > 0)) return [3 /*break*/, 11];
                    currentChunkSize = Math.min(CHUNK_SIZE, position);
                    position -= currentChunkSize;
                    return [4 /*yield*/, __await(fileHandle.read(buffer, 0, currentChunkSize, position))];
                case 5:
                    _a.sent();
                    combined = Buffer.concat([
                        buffer.subarray(0, currentChunkSize),
                        remainder,
                    ]);
                    firstNewline = combined.indexOf(0x0a);
                    if (firstNewline === -1) {
                        remainder = combined;
                        return [3 /*break*/, 4];
                    }
                    remainder = Buffer.from(combined.subarray(0, firstNewline));
                    lines = combined.toString('utf8', firstNewline + 1).split('\n');
                    i = lines.length - 1;
                    _a.label = 6;
                case 6:
                    if (!(i >= 0)) return [3 /*break*/, 10];
                    line = lines[i];
                    if (!line) return [3 /*break*/, 9];
                    return [4 /*yield*/, __await(line)];
                case 7: return [4 /*yield*/, _a.sent()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    i--;
                    return [3 /*break*/, 6];
                case 10: return [3 /*break*/, 4];
                case 11:
                    if (!(remainder.length > 0)) return [3 /*break*/, 14];
                    return [4 /*yield*/, __await(remainder.toString('utf8'))];
                case 12: return [4 /*yield*/, _a.sent()];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14: return [3 /*break*/, 17];
                case 15: return [4 /*yield*/, __await(fileHandle.close())];
                case 16:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20;
