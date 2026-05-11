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
exports.FileEditToolDiff = FileEditToolDiff;
var compiler_runtime_1 = require("react/compiler-runtime");
var React = require("react");
var react_1 = require("react");
var useTerminalSize_js_1 = require("../hooks/useTerminalSize.js");
var ink_js_1 = require("../ink.js");
var utils_js_1 = require("../tools/FileEditTool/utils.js");
var diff_js_1 = require("../utils/diff.js");
var log_js_1 = require("../utils/log.js");
var readEditContext_js_1 = require("../utils/readEditContext.js");
var stringUtils_js_1 = require("../utils/stringUtils.js");
var StructuredDiffList_js_1 = require("./StructuredDiffList.js");
function FileEditToolDiff(props) {
    var $ = (0, compiler_runtime_1.c)(7);
    var t0;
    if ($[0] !== props.edits || $[1] !== props.file_path) {
        t0 = function () { return loadDiffData(props.file_path, props.edits); };
        $[0] = props.edits;
        $[1] = props.file_path;
        $[2] = t0;
    }
    else {
        t0 = $[2];
    }
    var dataPromise = (0, react_1.useState)(t0)[0];
    var t1;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = <DiffFrame placeholder={true}/>;
        $[3] = t1;
    }
    else {
        t1 = $[3];
    }
    var t2;
    if ($[4] !== dataPromise || $[5] !== props.file_path) {
        t2 = <react_1.Suspense fallback={t1}><DiffBody promise={dataPromise} file_path={props.file_path}/></react_1.Suspense>;
        $[4] = dataPromise;
        $[5] = props.file_path;
        $[6] = t2;
    }
    else {
        t2 = $[6];
    }
    return t2;
}
function DiffBody(t0) {
    var $ = (0, compiler_runtime_1.c)(6);
    var promise = t0.promise, file_path = t0.file_path;
    var _a = (0, react_1.use)(promise), patch = _a.patch, firstLine = _a.firstLine, fileContent = _a.fileContent;
    var columns = (0, useTerminalSize_js_1.useTerminalSize)().columns;
    var t1;
    if ($[0] !== columns || $[1] !== fileContent || $[2] !== file_path || $[3] !== firstLine || $[4] !== patch) {
        t1 = <DiffFrame><StructuredDiffList_js_1.StructuredDiffList hunks={patch} dim={false} width={columns} filePath={file_path} firstLine={firstLine} fileContent={fileContent}/></DiffFrame>;
        $[0] = columns;
        $[1] = fileContent;
        $[2] = file_path;
        $[3] = firstLine;
        $[4] = patch;
        $[5] = t1;
    }
    else {
        t1 = $[5];
    }
    return t1;
}
function DiffFrame(t0) {
    var $ = (0, compiler_runtime_1.c)(5);
    var children = t0.children, placeholder = t0.placeholder;
    var t1;
    if ($[0] !== children || $[1] !== placeholder) {
        t1 = placeholder ? <ink_js_1.Text dimColor={true}>…</ink_js_1.Text> : children;
        $[0] = children;
        $[1] = placeholder;
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var t2;
    if ($[3] !== t1) {
        t2 = <ink_js_1.Box flexDirection="column"><ink_js_1.Box borderColor="subtle" borderStyle="dashed" flexDirection="column" borderLeft={false} borderRight={false}>{t1}</ink_js_1.Box></ink_js_1.Box>;
        $[3] = t1;
        $[4] = t2;
    }
    else {
        t2 = $[4];
    }
    return t2;
}
function loadDiffData(file_path, edits) {
    return __awaiter(this, void 0, void 0, function () {
        var valid, single, handle, file_1, normalized_1, ctx, normalized, hunks, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    valid = edits.filter(function (e) { return e.old_string != null && e.new_string != null; });
                    single = valid.length === 1 ? valid[0] : undefined;
                    // SedEditPermissionRequest passes the entire file as old_string. Scanning for
                    // a needle ≥ CHUNK_SIZE allocates O(needle) for the overlap buffer — skip the
                    // file read entirely and diff the inputs we already have.
                    if (single && single.old_string.length >= readEditContext_js_1.CHUNK_SIZE) {
                        return [2 /*return*/, diffToolInputsOnly(file_path, [single])];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, (0, readEditContext_js_1.openForScan)(file_path)];
                case 2:
                    handle = _a.sent();
                    if (handle === null)
                        return [2 /*return*/, diffToolInputsOnly(file_path, valid)];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, , 7, 9]);
                    if (!(!single || single.old_string === '')) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, readEditContext_js_1.readCapped)(handle)];
                case 4:
                    file_1 = _a.sent();
                    if (file_1 === null)
                        return [2 /*return*/, diffToolInputsOnly(file_path, valid)];
                    normalized_1 = valid.map(function (e) { return normalizeEdit(file_1, e); });
                    return [2 /*return*/, {
                            patch: (0, diff_js_1.getPatchForDisplay)({
                                filePath: file_path,
                                fileContents: file_1,
                                edits: normalized_1
                            }),
                            firstLine: (0, stringUtils_js_1.firstLineOf)(file_1),
                            fileContent: file_1
                        }];
                case 5: return [4 /*yield*/, (0, readEditContext_js_1.scanForContext)(handle, single.old_string, diff_js_1.CONTEXT_LINES)];
                case 6:
                    ctx = _a.sent();
                    if (ctx.truncated || ctx.content === '') {
                        return [2 /*return*/, diffToolInputsOnly(file_path, [single])];
                    }
                    normalized = normalizeEdit(ctx.content, single);
                    hunks = (0, diff_js_1.getPatchForDisplay)({
                        filePath: file_path,
                        fileContents: ctx.content,
                        edits: [normalized]
                    });
                    return [2 /*return*/, {
                            patch: (0, diff_js_1.adjustHunkLineNumbers)(hunks, ctx.lineOffset - 1),
                            firstLine: ctx.lineOffset === 1 ? (0, stringUtils_js_1.firstLineOf)(ctx.content) : null,
                            fileContent: ctx.content
                        }];
                case 7: return [4 /*yield*/, handle.close()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 11];
                case 10:
                    e_1 = _a.sent();
                    (0, log_js_1.logError)(e_1);
                    return [2 /*return*/, diffToolInputsOnly(file_path, valid)];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function diffToolInputsOnly(filePath, edits) {
    return {
        patch: edits.flatMap(function (e) { return (0, diff_js_1.getPatchForDisplay)({
            filePath: filePath,
            fileContents: e.old_string,
            edits: [e]
        }); }),
        firstLine: null,
        fileContent: undefined
    };
}
function normalizeEdit(fileContent, edit) {
    var actualOld = (0, utils_js_1.findActualString)(fileContent, edit.old_string) || edit.old_string;
    var actualNew = (0, utils_js_1.preserveQuoteStyle)(edit.old_string, actualOld, edit.new_string);
    return __assign(__assign({}, edit), { old_string: actualOld, new_string: actualNew });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJ1Y3R1cmVkUGF0Y2hIdW5rIiwiUmVhY3QiLCJTdXNwZW5zZSIsInVzZSIsInVzZVN0YXRlIiwidXNlVGVybWluYWxTaXplIiwiQm94IiwiVGV4dCIsIkZpbGVFZGl0IiwiZmluZEFjdHVhbFN0cmluZyIsInByZXNlcnZlUXVvdGVTdHlsZSIsImFkanVzdEh1bmtMaW5lTnVtYmVycyIsIkNPTlRFWFRfTElORVMiLCJnZXRQYXRjaEZvckRpc3BsYXkiLCJsb2dFcnJvciIsIkNIVU5LX1NJWkUiLCJvcGVuRm9yU2NhbiIsInJlYWRDYXBwZWQiLCJzY2FuRm9yQ29udGV4dCIsImZpcnN0TGluZU9mIiwiU3RydWN0dXJlZERpZmZMaXN0IiwiUHJvcHMiLCJmaWxlX3BhdGgiLCJlZGl0cyIsIkRpZmZEYXRhIiwicGF0Y2giLCJmaXJzdExpbmUiLCJmaWxlQ29udGVudCIsIkZpbGVFZGl0VG9vbERpZmYiLCJwcm9wcyIsIiQiLCJfYyIsInQwIiwibG9hZERpZmZEYXRhIiwiZGF0YVByb21pc2UiLCJ0MSIsIlN5bWJvbCIsImZvciIsInQyIiwiRGlmZkJvZHkiLCJwcm9taXNlIiwiY29sdW1ucyIsIkRpZmZGcmFtZSIsImNoaWxkcmVuIiwicGxhY2Vob2xkZXIiLCJQcm9taXNlIiwidmFsaWQiLCJmaWx0ZXIiLCJlIiwib2xkX3N0cmluZyIsIm5ld19zdHJpbmciLCJzaW5nbGUiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJkaWZmVG9vbElucHV0c09ubHkiLCJoYW5kbGUiLCJmaWxlIiwibm9ybWFsaXplZCIsIm1hcCIsIm5vcm1hbGl6ZUVkaXQiLCJmaWxlUGF0aCIsImZpbGVDb250ZW50cyIsImN0eCIsInRydW5jYXRlZCIsImNvbnRlbnQiLCJodW5rcyIsImxpbmVPZmZzZXQiLCJjbG9zZSIsIkVycm9yIiwiZmxhdE1hcCIsImVkaXQiLCJhY3R1YWxPbGQiLCJhY3R1YWxOZXciXSwic291cmNlcyI6WyJGaWxlRWRpdFRvb2xEaWZmLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFN0cnVjdHVyZWRQYXRjaEh1bmsgfSBmcm9tICdkaWZmJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBTdXNwZW5zZSwgdXNlLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlVGVybWluYWxTaXplIH0gZnJvbSAnLi4vaG9va3MvdXNlVGVybWluYWxTaXplLmpzJ1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHR5cGUgeyBGaWxlRWRpdCB9IGZyb20gJy4uL3Rvb2xzL0ZpbGVFZGl0VG9vbC90eXBlcy5qcydcbmltcG9ydCB7XG4gIGZpbmRBY3R1YWxTdHJpbmcsXG4gIHByZXNlcnZlUXVvdGVTdHlsZSxcbn0gZnJvbSAnLi4vdG9vbHMvRmlsZUVkaXRUb29sL3V0aWxzLmpzJ1xuaW1wb3J0IHtcbiAgYWRqdXN0SHVua0xpbmVOdW1iZXJzLFxuICBDT05URVhUX0xJTkVTLFxuICBnZXRQYXRjaEZvckRpc3BsYXksXG59IGZyb20gJy4uL3V0aWxzL2RpZmYuanMnXG5pbXBvcnQgeyBsb2dFcnJvciB9IGZyb20gJy4uL3V0aWxzL2xvZy5qcydcbmltcG9ydCB7XG4gIENIVU5LX1NJWkUsXG4gIG9wZW5Gb3JTY2FuLFxuICByZWFkQ2FwcGVkLFxuICBzY2FuRm9yQ29udGV4dCxcbn0gZnJvbSAnLi4vdXRpbHMvcmVhZEVkaXRDb250ZXh0LmpzJ1xuaW1wb3J0IHsgZmlyc3RMaW5lT2YgfSBmcm9tICcuLi91dGlscy9zdHJpbmdVdGlscy5qcydcbmltcG9ydCB7IFN0cnVjdHVyZWREaWZmTGlzdCB9IGZyb20gJy4vU3RydWN0dXJlZERpZmZMaXN0LmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBmaWxlX3BhdGg6IHN0cmluZ1xuICBlZGl0czogRmlsZUVkaXRbXVxufVxuXG50eXBlIERpZmZEYXRhID0ge1xuICBwYXRjaDogU3RydWN0dXJlZFBhdGNoSHVua1tdXG4gIGZpcnN0TGluZTogc3RyaW5nIHwgbnVsbFxuICBmaWxlQ29udGVudDogc3RyaW5nIHwgdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGaWxlRWRpdFRvb2xEaWZmKHByb3BzOiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIC8vIFNuYXBzaG90IG9uIG1vdW50IOKAlCB0aGUgZGlmZiBtdXN0IHN0YXkgY29uc2lzdGVudCBldmVuIGlmIHRoZSBmaWxlIGNoYW5nZXNcbiAgLy8gd2hpbGUgdGhlIGRpYWxvZyBpcyBvcGVuLiB1c2VNZW1vIG9uIHByb3BzLmVkaXRzIHdvdWxkIHJlLXJlYWQgdGhlIGZpbGUgb25cbiAgLy8gZXZlcnkgcmVuZGVyIGJlY2F1c2UgY2FsbGVycyBwYXNzIGZyZXNoIGFycmF5IGxpdGVyYWxzLlxuICBjb25zdCBbZGF0YVByb21pc2VdID0gdXNlU3RhdGUoKCkgPT5cbiAgICBsb2FkRGlmZkRhdGEocHJvcHMuZmlsZV9wYXRoLCBwcm9wcy5lZGl0cyksXG4gIClcbiAgcmV0dXJuIChcbiAgICA8U3VzcGVuc2UgZmFsbGJhY2s9ezxEaWZmRnJhbWUgcGxhY2Vob2xkZXIgLz59PlxuICAgICAgPERpZmZCb2R5IHByb21pc2U9e2RhdGFQcm9taXNlfSBmaWxlX3BhdGg9e3Byb3BzLmZpbGVfcGF0aH0gLz5cbiAgICA8L1N1c3BlbnNlPlxuICApXG59XG5cbmZ1bmN0aW9uIERpZmZCb2R5KHtcbiAgcHJvbWlzZSxcbiAgZmlsZV9wYXRoLFxufToge1xuICBwcm9taXNlOiBQcm9taXNlPERpZmZEYXRhPlxuICBmaWxlX3BhdGg6IHN0cmluZ1xufSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IHsgcGF0Y2gsIGZpcnN0TGluZSwgZmlsZUNvbnRlbnQgfSA9IHVzZShwcm9taXNlKVxuICBjb25zdCB7IGNvbHVtbnMgfSA9IHVzZVRlcm1pbmFsU2l6ZSgpXG4gIHJldHVybiAoXG4gICAgPERpZmZGcmFtZT5cbiAgICAgIDxTdHJ1Y3R1cmVkRGlmZkxpc3RcbiAgICAgICAgaHVua3M9e3BhdGNofVxuICAgICAgICBkaW09e2ZhbHNlfVxuICAgICAgICB3aWR0aD17Y29sdW1uc31cbiAgICAgICAgZmlsZVBhdGg9e2ZpbGVfcGF0aH1cbiAgICAgICAgZmlyc3RMaW5lPXtmaXJzdExpbmV9XG4gICAgICAgIGZpbGVDb250ZW50PXtmaWxlQ29udGVudH1cbiAgICAgIC8+XG4gICAgPC9EaWZmRnJhbWU+XG4gIClcbn1cblxuZnVuY3Rpb24gRGlmZkZyYW1lKHtcbiAgY2hpbGRyZW4sXG4gIHBsYWNlaG9sZGVyLFxufToge1xuICBjaGlsZHJlbj86IFJlYWN0LlJlYWN0Tm9kZVxuICBwbGFjZWhvbGRlcj86IGJvb2xlYW5cbn0pOiBSZWFjdC5SZWFjdE5vZGUge1xuICByZXR1cm4gKFxuICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgPEJveFxuICAgICAgICBib3JkZXJDb2xvcj1cInN1YnRsZVwiXG4gICAgICAgIGJvcmRlclN0eWxlPVwiZGFzaGVkXCJcbiAgICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgIGJvcmRlckxlZnQ9e2ZhbHNlfVxuICAgICAgICBib3JkZXJSaWdodD17ZmFsc2V9XG4gICAgICA+XG4gICAgICAgIHtwbGFjZWhvbGRlciA/IDxUZXh0IGRpbUNvbG9yPuKApjwvVGV4dD4gOiBjaGlsZHJlbn1cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWREaWZmRGF0YShcbiAgZmlsZV9wYXRoOiBzdHJpbmcsXG4gIGVkaXRzOiBGaWxlRWRpdFtdLFxuKTogUHJvbWlzZTxEaWZmRGF0YT4ge1xuICBjb25zdCB2YWxpZCA9IGVkaXRzLmZpbHRlcihlID0+IGUub2xkX3N0cmluZyAhPSBudWxsICYmIGUubmV3X3N0cmluZyAhPSBudWxsKVxuICBjb25zdCBzaW5nbGUgPSB2YWxpZC5sZW5ndGggPT09IDEgPyB2YWxpZFswXSEgOiB1bmRlZmluZWRcblxuICAvLyBTZWRFZGl0UGVybWlzc2lvblJlcXVlc3QgcGFzc2VzIHRoZSBlbnRpcmUgZmlsZSBhcyBvbGRfc3RyaW5nLiBTY2FubmluZyBmb3JcbiAgLy8gYSBuZWVkbGUg4omlIENIVU5LX1NJWkUgYWxsb2NhdGVzIE8obmVlZGxlKSBmb3IgdGhlIG92ZXJsYXAgYnVmZmVyIOKAlCBza2lwIHRoZVxuICAvLyBmaWxlIHJlYWQgZW50aXJlbHkgYW5kIGRpZmYgdGhlIGlucHV0cyB3ZSBhbHJlYWR5IGhhdmUuXG4gIGlmIChzaW5nbGUgJiYgc2luZ2xlLm9sZF9zdHJpbmcubGVuZ3RoID49IENIVU5LX1NJWkUpIHtcbiAgICByZXR1cm4gZGlmZlRvb2xJbnB1dHNPbmx5KGZpbGVfcGF0aCwgW3NpbmdsZV0pXG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGhhbmRsZSA9IGF3YWl0IG9wZW5Gb3JTY2FuKGZpbGVfcGF0aClcbiAgICBpZiAoaGFuZGxlID09PSBudWxsKSByZXR1cm4gZGlmZlRvb2xJbnB1dHNPbmx5KGZpbGVfcGF0aCwgdmFsaWQpXG4gICAgdHJ5IHtcbiAgICAgIC8vIE11bHRpLWVkaXQgYW5kIGVtcHR5IG9sZF9zdHJpbmcgZ2VudWluZWx5IG5lZWQgZnVsbC1maWxlIGZvciBzZXF1ZW50aWFsXG4gICAgICAvLyByZXBsYWNlbWVudHMg4oCUIHN0cnVjdHVyZWRQYXRjaCBuZWVkcyBiZWZvcmUvYWZ0ZXIgc3RyaW5ncy4gcmVwbGFjZV9hbGxcbiAgICAgIC8vIHJvdXRlcyB0aHJvdWdoIHRoZSBjaHVua2VkIHBhdGggYmVsb3cgKHNob3dzIGZpcnN0LW9jY3VycmVuY2Ugd2luZG93O1xuICAgICAgLy8gbWF0Y2hlcyB3aXRoaW4gdGhlIHNsaWNlIHN0aWxsIHJlcGxhY2UgdmlhIGVkaXQucmVwbGFjZV9hbGwpLlxuICAgICAgaWYgKCFzaW5nbGUgfHwgc2luZ2xlLm9sZF9zdHJpbmcgPT09ICcnKSB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBhd2FpdCByZWFkQ2FwcGVkKGhhbmRsZSlcbiAgICAgICAgaWYgKGZpbGUgPT09IG51bGwpIHJldHVybiBkaWZmVG9vbElucHV0c09ubHkoZmlsZV9wYXRoLCB2YWxpZClcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IHZhbGlkLm1hcChlID0+IG5vcm1hbGl6ZUVkaXQoZmlsZSwgZSkpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcGF0Y2g6IGdldFBhdGNoRm9yRGlzcGxheSh7XG4gICAgICAgICAgICBmaWxlUGF0aDogZmlsZV9wYXRoLFxuICAgICAgICAgICAgZmlsZUNvbnRlbnRzOiBmaWxlLFxuICAgICAgICAgICAgZWRpdHM6IG5vcm1hbGl6ZWQsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgZmlyc3RMaW5lOiBmaXJzdExpbmVPZihmaWxlKSxcbiAgICAgICAgICBmaWxlQ29udGVudDogZmlsZSxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjdHggPSBhd2FpdCBzY2FuRm9yQ29udGV4dChoYW5kbGUsIHNpbmdsZS5vbGRfc3RyaW5nLCBDT05URVhUX0xJTkVTKVxuICAgICAgaWYgKGN0eC50cnVuY2F0ZWQgfHwgY3R4LmNvbnRlbnQgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiBkaWZmVG9vbElucHV0c09ubHkoZmlsZV9wYXRoLCBbc2luZ2xlXSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVFZGl0KGN0eC5jb250ZW50LCBzaW5nbGUpXG4gICAgICBjb25zdCBodW5rcyA9IGdldFBhdGNoRm9yRGlzcGxheSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlX3BhdGgsXG4gICAgICAgIGZpbGVDb250ZW50czogY3R4LmNvbnRlbnQsXG4gICAgICAgIGVkaXRzOiBbbm9ybWFsaXplZF0sXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGF0Y2g6IGFkanVzdEh1bmtMaW5lTnVtYmVycyhodW5rcywgY3R4LmxpbmVPZmZzZXQgLSAxKSxcbiAgICAgICAgZmlyc3RMaW5lOiBjdHgubGluZU9mZnNldCA9PT0gMSA/IGZpcnN0TGluZU9mKGN0eC5jb250ZW50KSA6IG51bGwsXG4gICAgICAgIGZpbGVDb250ZW50OiBjdHguY29udGVudCxcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgaGFuZGxlLmNsb3NlKClcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dFcnJvcihlIGFzIEVycm9yKVxuICAgIHJldHVybiBkaWZmVG9vbElucHV0c09ubHkoZmlsZV9wYXRoLCB2YWxpZClcbiAgfVxufVxuXG5mdW5jdGlvbiBkaWZmVG9vbElucHV0c09ubHkoZmlsZVBhdGg6IHN0cmluZywgZWRpdHM6IEZpbGVFZGl0W10pOiBEaWZmRGF0YSB7XG4gIHJldHVybiB7XG4gICAgcGF0Y2g6IGVkaXRzLmZsYXRNYXAoZSA9PlxuICAgICAgZ2V0UGF0Y2hGb3JEaXNwbGF5KHtcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIGZpbGVDb250ZW50czogZS5vbGRfc3RyaW5nLFxuICAgICAgICBlZGl0czogW2VdLFxuICAgICAgfSksXG4gICAgKSxcbiAgICBmaXJzdExpbmU6IG51bGwsXG4gICAgZmlsZUNvbnRlbnQ6IHVuZGVmaW5lZCxcbiAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVFZGl0KGZpbGVDb250ZW50OiBzdHJpbmcsIGVkaXQ6IEZpbGVFZGl0KTogRmlsZUVkaXQge1xuICBjb25zdCBhY3R1YWxPbGQgPVxuICAgIGZpbmRBY3R1YWxTdHJpbmcoZmlsZUNvbnRlbnQsIGVkaXQub2xkX3N0cmluZykgfHwgZWRpdC5vbGRfc3RyaW5nXG4gIGNvbnN0IGFjdHVhbE5ldyA9IHByZXNlcnZlUXVvdGVTdHlsZShcbiAgICBlZGl0Lm9sZF9zdHJpbmcsXG4gICAgYWN0dWFsT2xkLFxuICAgIGVkaXQubmV3X3N0cmluZyxcbiAgKVxuICByZXR1cm4geyAuLi5lZGl0LCBvbGRfc3RyaW5nOiBhY3R1YWxPbGQsIG5ld19zdHJpbmc6IGFjdHVhbE5l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
