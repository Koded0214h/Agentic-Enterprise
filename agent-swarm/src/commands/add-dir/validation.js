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
exports.validateDirectoryForWorkspace = validateDirectoryForWorkspace;
exports.addDirHelpMessage = addDirHelpMessage;
var chalk_1 = require("chalk");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var errors_js_1 = require("../../utils/errors.js");
var path_js_1 = require("../../utils/path.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
function validateDirectoryForWorkspace(directoryPath, permissionContext) {
    return __awaiter(this, void 0, void 0, function () {
        var absolutePath, stats, e_1, code, currentWorkingDirs, _i, currentWorkingDirs_1, workingDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!directoryPath) {
                        return [2 /*return*/, {
                                resultType: 'emptyPath',
                            }];
                    }
                    absolutePath = (0, path_1.resolve)((0, path_js_1.expandPath)(directoryPath));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(absolutePath)];
                case 2:
                    stats = _a.sent();
                    if (!stats.isDirectory()) {
                        return [2 /*return*/, {
                                resultType: 'notADirectory',
                                directoryPath: directoryPath,
                                absolutePath: absolutePath,
                            }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    // Match prior existsSync() semantics: treat any of these as "not found"
                    // rather than re-throwing. EACCES/EPERM in particular must not crash
                    // startup when a settings-configured additional directory is inaccessible.
                    if (code === 'ENOENT' ||
                        code === 'ENOTDIR' ||
                        code === 'EACCES' ||
                        code === 'EPERM') {
                        return [2 /*return*/, {
                                resultType: 'pathNotFound',
                                directoryPath: directoryPath,
                                absolutePath: absolutePath,
                            }];
                    }
                    throw e_1;
                case 4:
                    currentWorkingDirs = (0, filesystem_js_1.allWorkingDirectories)(permissionContext);
                    // Check if already within an existing working directory
                    for (_i = 0, currentWorkingDirs_1 = currentWorkingDirs; _i < currentWorkingDirs_1.length; _i++) {
                        workingDir = currentWorkingDirs_1[_i];
                        if ((0, filesystem_js_1.pathInWorkingPath)(absolutePath, workingDir)) {
                            return [2 /*return*/, {
                                    resultType: 'alreadyInWorkingDirectory',
                                    directoryPath: directoryPath,
                                    workingDir: workingDir,
                                }];
                        }
                    }
                    return [2 /*return*/, {
                            resultType: 'success',
                            absolutePath: absolutePath,
                        }];
            }
        });
    });
}
function addDirHelpMessage(result) {
    switch (result.resultType) {
        case 'emptyPath':
            return 'Please provide a directory path.';
        case 'pathNotFound':
            return "Path ".concat(chalk_1.default.bold(result.absolutePath), " was not found.");
        case 'notADirectory': {
            var parentDir = (0, path_1.dirname)(result.absolutePath);
            return "".concat(chalk_1.default.bold(result.directoryPath), " is not a directory. Did you mean to add the parent directory ").concat(chalk_1.default.bold(parentDir), "?");
        }
        case 'alreadyInWorkingDirectory':
            return "".concat(chalk_1.default.bold(result.directoryPath), " is already accessible within the existing working directory ").concat(chalk_1.default.bold(result.workingDir), ".");
        case 'success':
            return "Added ".concat(chalk_1.default.bold(result.absolutePath), " as a working directory.");
    }
}
