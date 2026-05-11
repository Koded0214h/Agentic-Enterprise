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
exports.useDiffInIDE = useDiffInIDE;
exports.computeEditsFromContents = computeEditsFromContents;
var crypto_1 = require("crypto");
var path_1 = require("path");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var fileRead_js_1 = require("src/utils/fileRead.js");
var path_js_1 = require("src/utils/path.js");
var utils_js_1 = require("../tools/FileEditTool/utils.js");
var config_js_1 = require("../utils/config.js");
var diff_js_1 = require("../utils/diff.js");
var errors_js_1 = require("../utils/errors.js");
var ide_js_1 = require("../utils/ide.js");
var idePathConversion_js_1 = require("../utils/idePathConversion.js");
var log_js_1 = require("../utils/log.js");
var platform_js_1 = require("../utils/platform.js");
function useDiffInIDE(_a) {
    var _b;
    var onChange = _a.onChange, toolUseContext = _a.toolUseContext, filePath = _a.filePath, edits = _a.edits, editMode = _a.editMode;
    var isUnmounted = (0, react_1.useRef)(false);
    var _c = (0, react_1.useState)(false), hasError = _c[0], setHasError = _c[1];
    var sha = (0, react_1.useMemo)(function () { return (0, crypto_1.randomUUID)().slice(0, 6); }, []);
    var tabName = (0, react_1.useMemo)(function () { return "\u273B [Claude Code] ".concat((0, path_1.basename)(filePath), " (").concat(sha, ") \u29C9"); }, [filePath, sha]);
    var shouldShowDiffInIDE = (0, ide_js_1.hasAccessToIDEExtensionDiffFeature)(toolUseContext.options.mcpClients) &&
        (0, config_js_1.getGlobalConfig)().diffTool === 'auto' &&
        // Diffs should only be for file edits.
        // File writes may come through here but are not supported for diffs.
        !filePath.endsWith('.ipynb');
    var ideName = (_b = (0, ide_js_1.getConnectedIdeName)(toolUseContext.options.mcpClients)) !== null && _b !== void 0 ? _b : 'IDE';
    function showDiff() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, oldContent, newContent, newEdits, ideClient, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!shouldShowDiffInIDE) {
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        (0, index_js_1.logEvent)('tengu_ext_will_show_diff', {});
                        return [4 /*yield*/, showDiffInIDE(filePath, edits, toolUseContext, tabName)
                            // Skip if component has been unmounted
                        ];
                    case 2:
                        _a = _b.sent(), oldContent = _a.oldContent, newContent = _a.newContent;
                        // Skip if component has been unmounted
                        if (isUnmounted.current) {
                            return [2 /*return*/];
                        }
                        (0, index_js_1.logEvent)('tengu_ext_diff_accepted', {});
                        newEdits = computeEditsFromContents(filePath, oldContent, newContent, editMode);
                        if (!(newEdits.length === 0)) return [3 /*break*/, 5];
                        // No changes -- edit was rejected (eg. reverted)
                        (0, index_js_1.logEvent)('tengu_ext_diff_rejected', {});
                        ideClient = (0, ide_js_1.getConnectedIdeClient)(toolUseContext.options.mcpClients);
                        if (!ideClient) return [3 /*break*/, 4];
                        // Close the tab in the IDE
                        return [4 /*yield*/, closeTabInIDE(tabName, ideClient)];
                    case 3:
                        // Close the tab in the IDE
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        onChange({ type: 'reject' }, {
                            file_path: filePath,
                            edits: edits,
                        });
                        return [2 /*return*/];
                    case 5:
                        // File was modified - edit was accepted
                        onChange({ type: 'accept-once' }, {
                            file_path: filePath,
                            edits: newEdits,
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        (0, log_js_1.logError)(error_1);
                        setHasError(true);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    (0, react_1.useEffect)(function () {
        void showDiff();
        // Set flag on unmount
        return function () {
            isUnmounted.current = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        closeTabInIDE: function () {
            var ideClient = (0, ide_js_1.getConnectedIdeClient)(toolUseContext.options.mcpClients);
            if (!ideClient) {
                return Promise.resolve();
            }
            return closeTabInIDE(tabName, ideClient);
        },
        showingDiffInIDE: shouldShowDiffInIDE && !hasError,
        ideName: ideName,
        hasError: hasError,
    };
}
/**
 * Re-computes the edits from the old and new contents. This is necessary
 * to apply any edits the user may have made to the new contents.
 */
function computeEditsFromContents(filePath, oldContent, newContent, editMode) {
    // Use unformatted patches, otherwise the edits will be formatted.
    var singleHunk = editMode === 'single';
    var patch = (0, diff_js_1.getPatchFromContents)({
        filePath: filePath,
        oldContent: oldContent,
        newContent: newContent,
        singleHunk: singleHunk,
    });
    if (patch.length === 0) {
        return [];
    }
    // For single edit mode, verify we only got one hunk
    if (singleHunk && patch.length > 1) {
        (0, log_js_1.logError)(new Error("Unexpected number of hunks: ".concat(patch.length, ". Expected 1 hunk.")));
    }
    // Re-compute the edits to match the patch
    return (0, utils_js_1.getEditsForPatch)(patch);
}
/**
 * Done if:
 *
 * 1. Tab is closed in IDE
 * 2. Tab is saved in IDE (we then close the tab)
 * 3. User selected an option in IDE
 * 4. User selected an option in terminal (or hit esc)
 *
 * Resolves with the new file content.
 *
 * TODO: Time out after 5 mins of inactivity?
 * TODO: Update auto-approval UI when IDE exits
 * TODO: Close the IDE tab when the approval prompt is unmounted
 */
function showDiffInIDE(file_path, edits, toolUseContext, tabName) {
    return __awaiter(this, void 0, void 0, function () {
        function cleanup() {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Careful to avoid race conditions, since this
                            // function can be called from multiple places.
                            if (isCleanedUp) {
                                return [2 /*return*/];
                            }
                            isCleanedUp = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, closeTabInIDE(tabName, ideClient)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            (0, log_js_1.logError)(e_1);
                            return [3 /*break*/, 4];
                        case 4:
                            process.off('beforeExit', cleanup);
                            toolUseContext.abortController.signal.removeEventListener('abort', cleanup);
                            return [2 /*return*/];
                    }
                });
            });
        }
        var isCleanedUp, oldFilePath, oldContent, ideClient, updatedFile, ideOldPath, ideRunningInWindows, converter, rpcResult, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isCleanedUp = false;
                    oldFilePath = (0, path_js_1.expandPath)(file_path);
                    oldContent = '';
                    try {
                        oldContent = (0, fileRead_js_1.readFileSync)(oldFilePath);
                    }
                    catch (e) {
                        if (!(0, errors_js_1.isENOENT)(e)) {
                            throw e;
                        }
                    }
                    // Cleanup if the user hits esc to cancel the tool call - or on exit
                    toolUseContext.abortController.signal.addEventListener('abort', cleanup);
                    process.on('beforeExit', cleanup);
                    ideClient = (0, ide_js_1.getConnectedIdeClient)(toolUseContext.options.mcpClients);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    updatedFile = (0, utils_js_1.getPatchForEdits)({
                        filePath: oldFilePath,
                        fileContents: oldContent,
                        edits: edits,
                    }).updatedFile;
                    if (!ideClient || ideClient.type !== 'connected') {
                        throw new Error('IDE client not available');
                    }
                    ideOldPath = oldFilePath;
                    ideRunningInWindows = ideClient.config
                        .ideRunningInWindows === true;
                    if ((0, platform_js_1.getPlatform)() === 'wsl' &&
                        ideRunningInWindows &&
                        process.env.WSL_DISTRO_NAME) {
                        converter = new idePathConversion_js_1.WindowsToWSLConverter(process.env.WSL_DISTRO_NAME);
                        ideOldPath = converter.toIDEPath(oldFilePath);
                    }
                    return [4 /*yield*/, (0, ide_js_1.callIdeRpc)('openDiff', {
                            old_file_path: ideOldPath,
                            new_file_path: ideOldPath,
                            new_file_contents: updatedFile,
                            tab_name: tabName,
                        }, ideClient)
                        // Convert the raw RPC result to a ToolCallResponse format
                    ];
                case 2:
                    rpcResult = _a.sent();
                    data = Array.isArray(rpcResult) ? rpcResult : [rpcResult];
                    // If the user saved the file then take the new contents and resolve with that.
                    if (isSaveMessage(data)) {
                        void cleanup();
                        return [2 /*return*/, {
                                oldContent: oldContent,
                                newContent: data[1].text,
                            }];
                    }
                    else if (isClosedMessage(data)) {
                        void cleanup();
                        return [2 /*return*/, {
                                oldContent: oldContent,
                                newContent: updatedFile,
                            }];
                    }
                    else if (isRejectedMessage(data)) {
                        void cleanup();
                        return [2 /*return*/, {
                                oldContent: oldContent,
                                newContent: oldContent,
                            }];
                    }
                    // Indicates that the tool call completed with none of the expected
                    // results. Did the user close the IDE?
                    throw new Error('Not accepted');
                case 3:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    void cleanup();
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function closeTabInIDE(tabName, ideClient) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!ideClient || ideClient.type !== 'connected') {
                        throw new Error('IDE client not available');
                    }
                    // Use direct RPC to close the tab
                    return [4 /*yield*/, (0, ide_js_1.callIdeRpc)('close_tab', { tab_name: tabName }, ideClient)];
                case 1:
                    // Use direct RPC to close the tab
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    (0, log_js_1.logError)(error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function isClosedMessage(data) {
    return (Array.isArray(data) &&
        typeof data[0] === 'object' &&
        data[0] !== null &&
        'type' in data[0] &&
        data[0].type === 'text' &&
        'text' in data[0] &&
        data[0].text === 'TAB_CLOSED');
}
function isRejectedMessage(data) {
    return (Array.isArray(data) &&
        typeof data[0] === 'object' &&
        data[0] !== null &&
        'type' in data[0] &&
        data[0].type === 'text' &&
        'text' in data[0] &&
        data[0].text === 'DIFF_REJECTED');
}
function isSaveMessage(data) {
    var _a;
    return (Array.isArray(data) &&
        ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.type) === 'text' &&
        data[0].text === 'FILE_SAVED' &&
        typeof data[1].text === 'string');
}
