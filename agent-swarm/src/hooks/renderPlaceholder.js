"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPlaceholder = renderPlaceholder;
var chalk_1 = require("chalk");
function renderPlaceholder(_a) {
    var placeholder = _a.placeholder, value = _a.value, showCursor = _a.showCursor, focus = _a.focus, _b = _a.terminalFocus, terminalFocus = _b === void 0 ? true : _b, _c = _a.invert, invert = _c === void 0 ? chalk_1.default.inverse : _c, _d = _a.hidePlaceholderText, hidePlaceholderText = _d === void 0 ? false : _d;
    var renderedPlaceholder = undefined;
    if (placeholder) {
        if (hidePlaceholderText) {
            // Voice recording: show only the cursor, no placeholder text
            renderedPlaceholder =
                showCursor && focus && terminalFocus ? invert(' ') : '';
        }
        else {
            renderedPlaceholder = chalk_1.default.dim(placeholder);
            // Show inverse cursor only when both input and terminal are focused
            if (showCursor && focus && terminalFocus) {
                renderedPlaceholder =
                    placeholder.length > 0
                        ? invert(placeholder[0]) + chalk_1.default.dim(placeholder.slice(1))
                        : invert(' ');
            }
        }
    }
    var showPlaceholder = value.length === 0 && Boolean(placeholder);
    return {
        renderedPlaceholder: renderedPlaceholder,
        showPlaceholder: showPlaceholder,
    };
}
