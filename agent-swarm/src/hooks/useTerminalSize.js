"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTerminalSize = useTerminalSize;
var react_1 = require("react");
var TerminalSizeContext_js_1 = require("src/ink/components/TerminalSizeContext.js");
function useTerminalSize() {
    var size = (0, react_1.useContext)(TerminalSizeContext_js_1.TerminalSizeContext);
    if (!size) {
        throw new Error('useTerminalSize must be used within an Ink App component');
    }
    return size;
}
