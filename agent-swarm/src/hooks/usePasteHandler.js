"use strict";
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
exports.usePasteHandler = usePasteHandler;
var path_1 = require("path");
var react_1 = require("react");
var log_js_1 = require("src/utils/log.js");
var usehooks_ts_1 = require("usehooks-ts");
var imagePaste_js_1 = require("../utils/imagePaste.js");
var platform_js_1 = require("../utils/platform.js");
var CLIPBOARD_CHECK_DEBOUNCE_MS = 50;
var PASTE_COMPLETION_TIMEOUT_MS = 100;
function usePasteHandler(_a) {
    var onPaste = _a.onPaste, onInput = _a.onInput, onImagePaste = _a.onImagePaste;
    var _b = react_1.default.useState({ chunks: [], timeoutId: null }), pasteState = _b[0], setPasteState = _b[1];
    var _c = react_1.default.useState(false), isPasting = _c[0], setIsPasting = _c[1];
    var isMountedRef = react_1.default.useRef(true);
    // Mirrors pasteState.timeoutId but updated synchronously. When paste + a
    // keystroke arrive in the same stdin chunk, both wrappedOnInput calls run
    // in the same discreteUpdates batch before React commits — the second call
    // reads stale pasteState.timeoutId (null) and takes the onInput path. If
    // that key is Enter, it submits the old input and the paste is lost.
    var pastePendingRef = react_1.default.useRef(false);
    var isMacOS = react_1.default.useMemo(function () { return (0, platform_js_1.getPlatform)() === 'macos'; }, []);
    react_1.default.useEffect(function () {
        return function () {
            isMountedRef.current = false;
        };
    }, []);
    var checkClipboardForImageImpl = react_1.default.useCallback(function () {
        if (!onImagePaste || !isMountedRef.current)
            return;
        void (0, imagePaste_js_1.getImageFromClipboard)()
            .then(function (imageData) {
            if (imageData && isMountedRef.current) {
                onImagePaste(imageData.base64, imageData.mediaType, undefined, // no filename for clipboard images
                imageData.dimensions);
            }
        })
            .catch(function (error) {
            if (isMountedRef.current) {
                (0, log_js_1.logError)(error);
            }
        })
            .finally(function () {
            if (isMountedRef.current) {
                setIsPasting(false);
            }
        });
    }, [onImagePaste]);
    var checkClipboardForImage = (0, usehooks_ts_1.useDebounceCallback)(checkClipboardForImageImpl, CLIPBOARD_CHECK_DEBOUNCE_MS);
    var resetPasteTimeout = react_1.default.useCallback(function (currentTimeoutId) {
        if (currentTimeoutId) {
            clearTimeout(currentTimeoutId);
        }
        return setTimeout(function (setPasteState, onImagePaste, onPaste, setIsPasting, checkClipboardForImage, isMacOS, pastePendingRef) {
            pastePendingRef.current = false;
            setPasteState(function (_a) {
                var chunks = _a.chunks;
                // Join chunks and filter out orphaned focus sequences
                // These can appear when focus events split during paste
                var pastedText = chunks
                    .join('')
                    .replace(/\[I$/, '')
                    .replace(/\[O$/, '');
                // Check if the pasted text contains image file paths
                // When dragging multiple images, they may come as:
                // 1. Newline-separated paths (common in some terminals)
                // 2. Space-separated paths (common when dragging from Finder)
                // For space-separated paths, we split on spaces that precede absolute paths:
                // - Unix: space followed by `/` (e.g., `/Users/...`)
                // - Windows: space followed by drive letter and `:\` (e.g., `C:\Users\...`)
                // This works because spaces within paths are escaped (e.g., `file\ name.png`)
                var lines = pastedText
                    .split(/ (?=\/|[A-Za-z]:\\)/)
                    .flatMap(function (part) { return part.split('\n'); })
                    .filter(function (line) { return line.trim(); });
                var imagePaths = lines.filter(function (line) { return (0, imagePaste_js_1.isImageFilePath)(line); });
                if (onImagePaste && imagePaths.length > 0) {
                    var isTempScreenshot_1 = /\/TemporaryItems\/.*screencaptureui.*\/Screenshot/i.test(pastedText);
                    // Process all image paths
                    void Promise.all(imagePaths.map(function (imagePath) { return (0, imagePaste_js_1.tryReadImageFromPath)(imagePath); })).then(function (results) {
                        var validImages = results.filter(function (r) { return r !== null; });
                        if (validImages.length > 0) {
                            // Successfully read at least one image
                            for (var _i = 0, validImages_1 = validImages; _i < validImages_1.length; _i++) {
                                var imageData = validImages_1[_i];
                                var filename = (0, path_1.basename)(imageData.path);
                                onImagePaste(imageData.base64, imageData.mediaType, filename, imageData.dimensions, imageData.path);
                            }
                            // If some paths weren't images, paste them as text
                            var nonImageLines = lines.filter(function (line) { return !(0, imagePaste_js_1.isImageFilePath)(line); });
                            if (nonImageLines.length > 0 && onPaste) {
                                onPaste(nonImageLines.join('\n'));
                            }
                            setIsPasting(false);
                        }
                        else if (isTempScreenshot_1 && isMacOS) {
                            // For temporary screenshot files that no longer exist, try clipboard
                            checkClipboardForImage();
                        }
                        else {
                            if (onPaste) {
                                onPaste(pastedText);
                            }
                            setIsPasting(false);
                        }
                    });
                    return { chunks: [], timeoutId: null };
                }
                // If paste is empty (common when trying to paste images with Cmd+V),
                // check if clipboard has an image (macOS only)
                if (isMacOS && onImagePaste && pastedText.length === 0) {
                    checkClipboardForImage();
                    return { chunks: [], timeoutId: null };
                }
                // Handle regular paste
                if (onPaste) {
                    onPaste(pastedText);
                }
                // Reset isPasting state after paste is complete
                setIsPasting(false);
                return { chunks: [], timeoutId: null };
            });
        }, PASTE_COMPLETION_TIMEOUT_MS, setPasteState, onImagePaste, onPaste, setIsPasting, checkClipboardForImage, isMacOS, pastePendingRef);
    }, [checkClipboardForImage, isMacOS, onImagePaste, onPaste]);
    // Paste detection is now done via the InputEvent's keypress.isPasted flag,
    // which is set by the keypress parser when it detects bracketed paste mode.
    // This avoids the race condition caused by having multiple listeners on stdin.
    // Previously, we had a stdin.on('data') listener here which competed with
    // the 'readable' listener in App.tsx, causing dropped characters.
    var wrappedOnInput = function (input, key, event) {
        // Detect paste from the parsed keypress event.
        // The keypress parser sets isPasted=true for content within bracketed paste.
        var isFromPaste = event.keypress.isPasted;
        // If this is pasted content, set isPasting state for UI feedback
        if (isFromPaste) {
            setIsPasting(true);
        }
        // Handle large pastes (>PASTE_THRESHOLD chars)
        // Usually we get one or two input characters at a time. If we
        // get more than the threshold, the user has probably pasted.
        // Unfortunately node batches long pastes, so it's possible
        // that we would see e.g. 1024 characters and then just a few
        // more in the next frame that belong with the original paste.
        // This batching number is not consistent.
        // Handle potential image filenames (even if they're shorter than paste threshold)
        // When dragging multiple images, they may come as newline-separated or
        // space-separated paths. Split on spaces preceding absolute paths:
        // - Unix: ` /` - Windows: ` C:\` etc.
        var hasImageFilePath = input
            .split(/ (?=\/|[A-Za-z]:\\)/)
            .flatMap(function (part) { return part.split('\n'); })
            .some(function (line) { return (0, imagePaste_js_1.isImageFilePath)(line.trim()); });
        // Handle empty paste (clipboard image on macOS)
        // When the user pastes an image with Cmd+V, the terminal sends an empty
        // bracketed paste sequence. The keypress parser emits this as isPasted=true
        // with empty input.
        if (isFromPaste && input.length === 0 && isMacOS && onImagePaste) {
            checkClipboardForImage();
            // Reset isPasting since there's no text content to process
            setIsPasting(false);
            return;
        }
        // Check if we should handle as paste (from bracketed paste, large input, or continuation)
        var shouldHandleAsPaste = onPaste &&
            (input.length > imagePaste_js_1.PASTE_THRESHOLD ||
                pastePendingRef.current ||
                hasImageFilePath ||
                isFromPaste);
        if (shouldHandleAsPaste) {
            pastePendingRef.current = true;
            setPasteState(function (_a) {
                var chunks = _a.chunks, timeoutId = _a.timeoutId;
                return {
                    chunks: __spreadArray(__spreadArray([], chunks, true), [input], false),
                    timeoutId: resetPasteTimeout(timeoutId),
                };
            });
            return;
        }
        onInput(input, key);
        if (input.length > 10) {
            // Ensure that setIsPasting is turned off on any other multicharacter
            // input, because the stdin buffer may chunk at arbitrary points and split
            // the closing escape sequence if the input length is too long for the
            // stdin buffer.
            setIsPasting(false);
        }
    };
    return {
        wrappedOnInput: wrappedOnInput,
        pasteState: pasteState,
        isPasting: isPasting,
    };
}
