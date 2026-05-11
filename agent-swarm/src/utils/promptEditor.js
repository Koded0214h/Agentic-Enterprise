"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFileInEditor = editFileInEditor;
exports.editPromptInEditor = editPromptInEditor;
var history_js_1 = require("../history.js");
var instances_js_1 = require("../ink/instances.js");
var editor_js_1 = require("./editor.js");
var execSyncWrapper_js_1 = require("./execSyncWrapper.js");
var fsOperations_js_1 = require("./fsOperations.js");
var ide_js_1 = require("./ide.js");
var slowOperations_js_1 = require("./slowOperations.js");
var tempfile_js_1 = require("./tempfile.js");
// Map of editor command overrides (e.g., to add wait flags)
var EDITOR_OVERRIDES = {
    code: 'code -w', // VS Code: wait for file to be closed
    subl: 'subl --wait', // Sublime Text: wait for file to be closed
};
function isGuiEditor(editor) {
    return (0, editor_js_1.classifyGuiEditor)(editor) !== undefined;
}
// sync IO: called from sync context (React components, sync command handlers)
function editFileInEditor(filePath) {
    var _a;
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var inkInstance = instances_js_1.default.get(process.stdout);
    if (!inkInstance) {
        throw new Error('Ink instance not found - cannot pause rendering');
    }
    var editor = (0, editor_js_1.getExternalEditor)();
    if (!editor) {
        return { content: null };
    }
    try {
        fs.statSync(filePath);
    }
    catch (_b) {
        return { content: null };
    }
    var useAlternateScreen = !isGuiEditor(editor);
    if (useAlternateScreen) {
        // Terminal editors (vi, nano, etc.) take over the terminal. Delegate to
        // Ink's alt-screen-aware handoff so fullscreen mode (where <AlternateScreen>
        // already entered alt screen) doesn't get knocked back to the main buffer
        // by a hardcoded ?1049l. enterAlternateScreen() internally calls pause()
        // and suspendStdin(); exitAlternateScreen() undoes both and resets frame
        // state so the next render writes from scratch.
        inkInstance.enterAlternateScreen();
    }
    else {
        // GUI editors (code, subl, etc.) open in a separate window — just pause
        // Ink and release stdin while they're open.
        inkInstance.pause();
        inkInstance.suspendStdin();
    }
    try {
        // Use override command if available, otherwise use the editor as-is
        var editorCommand = (_a = EDITOR_OVERRIDES[editor]) !== null && _a !== void 0 ? _a : editor;
        (0, execSyncWrapper_js_1.execSync_DEPRECATED)("".concat(editorCommand, " \"").concat(filePath, "\""), {
            stdio: 'inherit',
        });
        // Read the edited content
        var editedContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
        return { content: editedContent };
    }
    catch (err) {
        if (typeof err === 'object' &&
            err !== null &&
            'status' in err &&
            typeof err.status === 'number') {
            var status_1 = err.status;
            if (status_1 !== 0) {
                var editorName = (0, ide_js_1.toIDEDisplayName)(editor);
                return {
                    content: null,
                    error: "".concat(editorName, " exited with code ").concat(status_1),
                };
            }
        }
        return { content: null };
    }
    finally {
        if (useAlternateScreen) {
            inkInstance.exitAlternateScreen();
        }
        else {
            inkInstance.resumeStdin();
            inkInstance.resume();
        }
    }
}
/**
 * Re-collapse expanded pasted text by finding content that matches
 * pastedContents and replacing it with references.
 */
function recollapsePastedContent(editedPrompt, originalPrompt, pastedContents) {
    var collapsed = editedPrompt;
    // Find pasted content in the edited text and re-collapse it
    for (var _i = 0, _a = Object.entries(pastedContents); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], content = _b[1];
        if (content.type === 'text') {
            var pasteId = parseInt(id);
            var contentStr = content.content;
            // Check if this exact content exists in the edited prompt
            var contentIndex = collapsed.indexOf(contentStr);
            if (contentIndex !== -1) {
                // Replace with reference
                var numLines = (0, history_js_1.getPastedTextRefNumLines)(contentStr);
                var ref = (0, history_js_1.formatPastedTextRef)(pasteId, numLines);
                collapsed =
                    collapsed.slice(0, contentIndex) +
                        ref +
                        collapsed.slice(contentIndex + contentStr.length);
            }
        }
    }
    return collapsed;
}
// sync IO: called from sync context (React components, sync command handlers)
function editPromptInEditor(currentPrompt, pastedContents) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var tempFile = (0, tempfile_js_1.generateTempFilePath)();
    try {
        // Expand any pasted text references before editing
        var expandedPrompt = pastedContents
            ? (0, history_js_1.expandPastedTextRefs)(currentPrompt, pastedContents)
            : currentPrompt;
        // Write expanded prompt to temp file
        (0, slowOperations_js_1.writeFileSync_DEPRECATED)(tempFile, expandedPrompt, {
            encoding: 'utf-8',
            flush: true,
        });
        // Delegate to editFileInEditor
        var result = editFileInEditor(tempFile);
        if (result.content === null) {
            return result;
        }
        // Trim a single trailing newline if present (common editor behavior)
        var finalContent = result.content;
        if (finalContent.endsWith('\n') && !finalContent.endsWith('\n\n')) {
            finalContent = finalContent.slice(0, -1);
        }
        // Re-collapse pasted content if it wasn't edited
        if (pastedContents) {
            finalContent = recollapsePastedContent(finalContent, currentPrompt, pastedContents);
        }
        return { content: finalContent };
    }
    finally {
        // Clean up temp file
        try {
            fs.unlinkSync(tempFile);
        }
        catch (_a) {
            // Ignore cleanup errors
        }
    }
}
