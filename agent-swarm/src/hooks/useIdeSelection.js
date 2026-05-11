"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIdeSelection = useIdeSelection;
var react_1 = require("react");
var log_js_1 = require("src/utils/log.js");
var v4_1 = require("zod/v4");
var ide_js_1 = require("../utils/ide.js");
var lazySchema_js_1 = require("../utils/lazySchema.js");
// Define the selection changed notification schema
var SelectionChangedSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        method: v4_1.z.literal('selection_changed'),
        params: v4_1.z.object({
            selection: v4_1.z
                .object({
                start: v4_1.z.object({
                    line: v4_1.z.number(),
                    character: v4_1.z.number(),
                }),
                end: v4_1.z.object({
                    line: v4_1.z.number(),
                    character: v4_1.z.number(),
                }),
            })
                .nullable()
                .optional(),
            text: v4_1.z.string().optional(),
            filePath: v4_1.z.string().optional(),
        }),
    });
});
/**
 * A hook that tracks IDE text selection information by directly registering
 * with MCP client notification handlers
 */
function useIdeSelection(mcpClients, onSelect) {
    var handlersRegistered = (0, react_1.useRef)(false);
    var currentIDERef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Find the IDE client from the MCP clients list
        var ideClient = (0, ide_js_1.getConnectedIdeClient)(mcpClients);
        // If the IDE client changed, we need to re-register handlers.
        // Normalize undefined to null so the initial ref value (null) matches
        // "no IDE found" (undefined), avoiding spurious resets on every MCP update.
        if (currentIDERef.current !== (ideClient !== null && ideClient !== void 0 ? ideClient : null)) {
            handlersRegistered.current = false;
            currentIDERef.current = ideClient || null;
            // Reset the selection when the IDE client changes.
            onSelect({
                lineCount: 0,
                lineStart: undefined,
                text: undefined,
                filePath: undefined,
            });
        }
        // Skip if we've already registered handlers for the current IDE or if there's no IDE client
        if (handlersRegistered.current || !ideClient) {
            return;
        }
        // Handler function for selection changes
        var selectionChangeHandler = function (data) {
            var _a, _b;
            if (((_a = data.selection) === null || _a === void 0 ? void 0 : _a.start) && ((_b = data.selection) === null || _b === void 0 ? void 0 : _b.end)) {
                var _c = data.selection, start = _c.start, end = _c.end;
                var lineCount = end.line - start.line + 1;
                // If on the first character of the line, do not count the line
                // as being selected.
                if (end.character === 0) {
                    lineCount--;
                }
                var selection = {
                    lineCount: lineCount,
                    lineStart: start.line,
                    text: data.text,
                    filePath: data.filePath,
                };
                onSelect(selection);
            }
        };
        // Register notification handler for selection_changed events
        ideClient.client.setNotificationHandler(SelectionChangedSchema(), function (notification) {
            if (currentIDERef.current !== ideClient) {
                return;
            }
            try {
                // Get the selection data from the notification params
                var selectionData = notification.params;
                // Process selection data - validate it has required properties
                if (selectionData.selection &&
                    selectionData.selection.start &&
                    selectionData.selection.end) {
                    // Handle selection changes
                    selectionChangeHandler(selectionData);
                }
                else if (selectionData.text !== undefined) {
                    // Handle empty selection (when text is empty string)
                    selectionChangeHandler({
                        selection: null,
                        text: selectionData.text,
                        filePath: selectionData.filePath,
                    });
                }
            }
            catch (error) {
                (0, log_js_1.logError)(error);
            }
        });
        // Mark that we've registered handlers
        handlersRegistered.current = true;
        // No cleanup needed as MCP clients manage their own lifecycle
    }, [mcpClients, onSelect]);
}
