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
exports.call = call;
var bun_bundle_1 = require("bun:bundle");
var React = require("react");
var ContextVisualization_js_1 = require("../../components/ContextVisualization.js");
var microCompact_js_1 = require("../../services/compact/microCompact.js");
var analyzeContext_js_1 = require("../../utils/analyzeContext.js");
var messages_js_1 = require("../../utils/messages.js");
var staticRender_js_1 = require("../../utils/staticRender.js");
/**
 * Apply the same context transforms query.ts does before the API call, so
 * /context shows what the model actually sees rather than the REPL's raw
 * history. Without projectView the token count overcounts by however much
 * was collapsed — user sees "180k, 3 spans collapsed" when the API sees 120k.
 */
function toApiView(messages) {
    var view = (0, messages_js_1.getMessagesAfterCompactBoundary)(messages);
    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var projectView = require('../../services/contextCollapse/operations.js').projectView;
        /* eslint-enable @typescript-eslint/no-require-imports */
        view = projectView(view);
    }
    return view;
}
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, getAppState, _a, mainLoopModel, tools, apiView, compactedMessages, terminalWidth, appState, data, output;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messages = context.messages, getAppState = context.getAppState, _a = context.options, mainLoopModel = _a.mainLoopModel, tools = _a.tools;
                    apiView = toApiView(messages);
                    return [4 /*yield*/, (0, microCompact_js_1.microcompactMessages)(apiView)];
                case 1:
                    compactedMessages = (_b.sent()).messages;
                    terminalWidth = process.stdout.columns || 80;
                    appState = getAppState();
                    return [4 /*yield*/, (0, analyzeContext_js_1.analyzeContextUsage)(compactedMessages, mainLoopModel, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, appState.toolPermissionContext];
                        }); }); }, tools, appState.agentDefinitions, terminalWidth, context, 
                        // Pass full context for system prompt calculation
                        undefined, 
                        // mainThreadAgentDefinition
                        apiView // Original messages for API usage extraction
                        )];
                case 2:
                    data = _b.sent();
                    return [4 /*yield*/, (0, staticRender_js_1.renderToAnsiString)(<ContextVisualization_js_1.ContextVisualization data={data}/>)];
                case 3:
                    output = _b.sent();
                    onDone(output);
                    return [2 /*return*/, null];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmZWF0dXJlIiwiUmVhY3QiLCJMb2NhbEpTWENvbW1hbmRDb250ZXh0IiwiQ29udGV4dFZpc3VhbGl6YXRpb24iLCJtaWNyb2NvbXBhY3RNZXNzYWdlcyIsIkxvY2FsSlNYQ29tbWFuZE9uRG9uZSIsIk1lc3NhZ2UiLCJhbmFseXplQ29udGV4dFVzYWdlIiwiZ2V0TWVzc2FnZXNBZnRlckNvbXBhY3RCb3VuZGFyeSIsInJlbmRlclRvQW5zaVN0cmluZyIsInRvQXBpVmlldyIsIm1lc3NhZ2VzIiwidmlldyIsInByb2plY3RWaWV3IiwicmVxdWlyZSIsImNhbGwiLCJvbkRvbmUiLCJjb250ZXh0IiwiUHJvbWlzZSIsIlJlYWN0Tm9kZSIsImdldEFwcFN0YXRlIiwib3B0aW9ucyIsIm1haW5Mb29wTW9kZWwiLCJ0b29scyIsImFwaVZpZXciLCJjb21wYWN0ZWRNZXNzYWdlcyIsInRlcm1pbmFsV2lkdGgiLCJwcm9jZXNzIiwic3Rkb3V0IiwiY29sdW1ucyIsImFwcFN0YXRlIiwiZGF0YSIsInRvb2xQZXJtaXNzaW9uQ29udGV4dCIsImFnZW50RGVmaW5pdGlvbnMiLCJ1bmRlZmluZWQiLCJvdXRwdXQiXSwic291cmNlcyI6WyJjb250ZXh0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmZWF0dXJlIH0gZnJvbSAnYnVuOmJ1bmRsZSdcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDb250ZXh0IH0gZnJvbSAnLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQgeyBDb250ZXh0VmlzdWFsaXphdGlvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvQ29udGV4dFZpc3VhbGl6YXRpb24uanMnXG5pbXBvcnQgeyBtaWNyb2NvbXBhY3RNZXNzYWdlcyB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2NvbXBhY3QvbWljcm9Db21wYWN0LmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRPbkRvbmUgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlIH0gZnJvbSAnLi4vLi4vdHlwZXMvbWVzc2FnZS5qcydcbmltcG9ydCB7IGFuYWx5emVDb250ZXh0VXNhZ2UgfSBmcm9tICcuLi8uLi91dGlscy9hbmFseXplQ29udGV4dC5qcydcbmltcG9ydCB7IGdldE1lc3NhZ2VzQWZ0ZXJDb21wYWN0Qm91bmRhcnkgfSBmcm9tICcuLi8uLi91dGlscy9tZXNzYWdlcy5qcydcbmltcG9ydCB7IHJlbmRlclRvQW5zaVN0cmluZyB9IGZyb20gJy4uLy4uL3V0aWxzL3N0YXRpY1JlbmRlci5qcydcblxuLyoqXG4gKiBBcHBseSB0aGUgc2FtZSBjb250ZXh0IHRyYW5zZm9ybXMgcXVlcnkudHMgZG9lcyBiZWZvcmUgdGhlIEFQSSBjYWxsLCBzb1xuICogL2NvbnRleHQgc2hvd3Mgd2hhdCB0aGUgbW9kZWwgYWN0dWFsbHkgc2VlcyByYXRoZXIgdGhhbiB0aGUgUkVQTCdzIHJhd1xuICogaGlzdG9yeS4gV2l0aG91dCBwcm9qZWN0VmlldyB0aGUgdG9rZW4gY291bnQgb3ZlcmNvdW50cyBieSBob3dldmVyIG11Y2hcbiAqIHdhcyBjb2xsYXBzZWQg4oCUIHVzZXIgc2VlcyBcIjE4MGssIDMgc3BhbnMgY29sbGFwc2VkXCIgd2hlbiB0aGUgQVBJIHNlZXMgMTIway5cbiAqL1xuZnVuY3Rpb24gdG9BcGlWaWV3KG1lc3NhZ2VzOiBNZXNzYWdlW10pOiBNZXNzYWdlW10ge1xuICBsZXQgdmlldyA9IGdldE1lc3NhZ2VzQWZ0ZXJDb21wYWN0Qm91bmRhcnkobWVzc2FnZXMpXG4gIGlmIChmZWF0dXJlKCdDT05URVhUX0NPTExBUFNFJykpIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG4gICAgY29uc3QgeyBwcm9qZWN0VmlldyB9ID1cbiAgICAgIHJlcXVpcmUoJy4uLy4uL3NlcnZpY2VzL2NvbnRleHRDb2xsYXBzZS9vcGVyYXRpb25zLmpzJykgYXMgdHlwZW9mIGltcG9ydCgnLi4vLi4vc2VydmljZXMvY29udGV4dENvbGxhcHNlL29wZXJhdGlvbnMuanMnKVxuICAgIC8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xuICAgIHZpZXcgPSBwcm9qZWN0Vmlldyh2aWV3KVxuICB9XG4gIHJldHVybiB2aWV3XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgY29udGV4dDogTG9jYWxKU1hDb21tYW5kQ29udGV4dCxcbik6IFByb21pc2U8UmVhY3QuUmVhY3ROb2RlPiB7XG4gIGNvbnN0IHtcbiAgICBtZXNzYWdlcyxcbiAgICBnZXRBcHBTdGF0ZSxcbiAgICBvcHRpb25zOiB7IG1haW5Mb29wTW9kZWwsIHRvb2xzIH0sXG4gIH0gPSBjb250ZXh0XG5cbiAgY29uc3QgYXBpVmlldyA9IHRvQXBpVmlldyhtZXNzYWdlcylcblxuICAvLyBBcHBseSBtaWNyb2NvbXBhY3QgdG8gZ2V0IGFjY3VyYXRlIHJlcHJlc2VudGF0aW9uIG9mIG1lc3NhZ2VzIHNlbnQgdG8gQVBJXG4gIGNvbnN0IHsgbWVzc2FnZXM6IGNvbXBhY3RlZE1lc3NhZ2VzIH0gPSBhd2FpdCBtaWNyb2NvbXBhY3RNZXNzYWdlcyhhcGlWaWV3KVxuXG4gIC8vIEdldCB0ZXJtaW5hbCB3aWR0aCBmb3IgcmVzcG9uc2l2ZSBzaXppbmdcbiAgY29uc3QgdGVybWluYWxXaWR0aCA9IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMgfHwgODBcblxuICBjb25zdCBhcHBTdGF0ZSA9IGdldEFwcFN0YXRlKClcblxuICAvLyBBbmFseXplIGNvbnRleHQgd2l0aCBjb21wYWN0ZWQgbWVzc2FnZXNcbiAgLy8gUGFzcyBvcmlnaW5hbCBtZXNzYWdlcyBhcyBsYXN0IHBhcmFtZXRlciBmb3IgYWNjdXJhdGUgQVBJIHVzYWdlIGV4dHJhY3Rpb25cbiAgY29uc3QgZGF0YSA9IGF3YWl0IGFuYWx5emVDb250ZXh0VXNhZ2UoXG4gICAgY29tcGFjdGVkTWVzc2FnZXMsXG4gICAgbWFpbkxvb3BNb2RlbCxcbiAgICBhc3luYyAoKSA9PiBhcHBTdGF0ZS50b29sUGVybWlzc2lvbkNvbnRleHQsXG4gICAgdG9vbHMsXG4gICAgYXBwU3RhdGUuYWdlbnREZWZpbml0aW9ucyxcbiAgICB0ZXJtaW5hbFdpZHRoLFxuICAgIGNvbnRleHQsIC8vIFBhc3MgZnVsbCBjb250ZXh0IGZvciBzeXN0ZW0gcHJvbXB0IGNhbGN1bGF0aW9uXG4gICAgdW5kZWZpbmVkLCAvLyBtYWluVGhyZWFkQWdlbnREZWZpbml0aW9uXG4gICAgYXBpVmlldywgLy8gT3JpZ2luYWwgbWVzc2FnZXMgZm9yIEFQSSB1c2FnZSBleHRyYWN0aW9uXG4gIClcblxuICAvLyBSZW5kZXIgdG8gQU5TSSBzdHJpbmcgdG8gcHJlc2VydmUgY29sb3JzIGFuZCBwYXNzIHRvIG9uRG9uZSBsaWtlIGxvY2FsIGNvbW1hbmRzIGRvXG4gIGNvbnN0IG91dHB1dCA9IGF3YWl0IHJlbmRlclRvQW5zaVN0cmluZyg8Q29udGV4dFZpc3VhbGl6YXRpb24gZGF0YT17ZGF0YX0gLz4pXG4gIG9uRG9uZShvdXRwdXQpXG4gIHJldHVybiBudWxsXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLE9BQU8sUUFBUSxZQUFZO0FBQ3BDLE9BQU8sS0FBS0MsS0FBSyxNQUFNLE9BQU87QUFDOUIsY0FBY0Msc0JBQXNCLFFBQVEsbUJBQW1CO0FBQy9ELFNBQVNDLG9CQUFvQixRQUFRLDBDQUEwQztBQUMvRSxTQUFTQyxvQkFBb0IsUUFBUSx3Q0FBd0M7QUFDN0UsY0FBY0MscUJBQXFCLFFBQVEsd0JBQXdCO0FBQ25FLGNBQWNDLE9BQU8sUUFBUSx3QkFBd0I7QUFDckQsU0FBU0MsbUJBQW1CLFFBQVEsK0JBQStCO0FBQ25FLFNBQVNDLCtCQUErQixRQUFRLHlCQUF5QjtBQUN6RSxTQUFTQyxrQkFBa0IsUUFBUSw2QkFBNkI7O0FBRWhFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLFNBQVNBLENBQUNDLFFBQVEsRUFBRUwsT0FBTyxFQUFFLENBQUMsRUFBRUEsT0FBTyxFQUFFLENBQUM7RUFDakQsSUFBSU0sSUFBSSxHQUFHSiwrQkFBK0IsQ0FBQ0csUUFBUSxDQUFDO0VBQ3BELElBQUlYLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO0lBQy9CO0lBQ0EsTUFBTTtNQUFFYTtJQUFZLENBQUMsR0FDbkJDLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxJQUFJLE9BQU8sT0FBTyw4Q0FBOEMsQ0FBQztJQUMxSDtJQUNBRixJQUFJLEdBQUdDLFdBQVcsQ0FBQ0QsSUFBSSxDQUFDO0VBQzFCO0VBQ0EsT0FBT0EsSUFBSTtBQUNiO0FBRUEsT0FBTyxlQUFlRyxJQUFJQSxDQUN4QkMsTUFBTSxFQUFFWCxxQkFBcUIsRUFDN0JZLE9BQU8sRUFBRWYsc0JBQXNCLENBQ2hDLEVBQUVnQixPQUFPLENBQUNqQixLQUFLLENBQUNrQixTQUFTLENBQUMsQ0FBQztFQUMxQixNQUFNO0lBQ0pSLFFBQVE7SUFDUlMsV0FBVztJQUNYQyxPQUFPLEVBQUU7TUFBRUMsYUFBYTtNQUFFQztJQUFNO0VBQ2xDLENBQUMsR0FBR04sT0FBTztFQUVYLE1BQU1PLE9BQU8sR0FBR2QsU0FBUyxDQUFDQyxRQUFRLENBQUM7O0VBRW5DO0VBQ0EsTUFBTTtJQUFFQSxRQUFRLEVBQUVjO0VBQWtCLENBQUMsR0FBRyxNQUFNckIsb0JBQW9CLENBQUNvQixPQUFPLENBQUM7O0VBRTNFO0VBQ0EsTUFBTUUsYUFBYSxHQUFHQyxPQUFPLENBQUNDLE1BQU0sQ0FBQ0MsT0FBTyxJQUFJLEVBQUU7RUFFbEQsTUFBTUMsUUFBUSxHQUFHVixXQUFXLENBQUMsQ0FBQzs7RUFFOUI7RUFDQTtFQUNBLE1BQU1XLElBQUksR0FBRyxNQUFNeEIsbUJBQW1CLENBQ3BDa0IsaUJBQWlCLEVBQ2pCSCxhQUFhLEVBQ2IsWUFBWVEsUUFBUSxDQUFDRSxxQkFBcUIsRUFDMUNULEtBQUssRUFDTE8sUUFBUSxDQUFDRyxnQkFBZ0IsRUFDekJQLGFBQWEsRUFDYlQsT0FBTztFQUFFO0VBQ1RpQixTQUFTO0VBQUU7RUFDWFYsT0FBTyxDQUFFO0VBQ1gsQ0FBQzs7RUFFRDtFQUNBLE1BQU1XLE1BQU0sR0FBRyxNQUFNMUIsa0JBQWtCLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQ3NCLElBQUksQ0FBQyxHQUFHLENBQUM7RUFDN0VmLE1BQU0sQ0FBQ21CLE1BQU0sQ0FBQztFQUNkLE9BQU8sSUFBSTtBQUNiIiwiaWdub3JlTGlzdCI6W119
