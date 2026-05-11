"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMaybeTruncateInput = useMaybeTruncateInput;
var react_1 = require("react");
var inputPaste_js_1 = require("./inputPaste.js");
function useMaybeTruncateInput(_a) {
    var input = _a.input, pastedContents = _a.pastedContents, onInputChange = _a.onInputChange, setCursorOffset = _a.setCursorOffset, setPastedContents = _a.setPastedContents;
    // Track if we've initialized this specific input value
    var _b = (0, react_1.useState)(false), hasAppliedTruncationToInput = _b[0], setHasAppliedTruncationToInput = _b[1];
    // Process input for truncation and pasted images from MessageSelector.
    (0, react_1.useEffect)(function () {
        if (hasAppliedTruncationToInput) {
            return;
        }
        if (input.length <= 10000) {
            return;
        }
        var _a = (0, inputPaste_js_1.maybeTruncateInput)(input, pastedContents), newInput = _a.newInput, newPastedContents = _a.newPastedContents;
        onInputChange(newInput);
        setCursorOffset(newInput.length);
        setPastedContents(newPastedContents);
        setHasAppliedTruncationToInput(true);
    }, [
        input,
        hasAppliedTruncationToInput,
        pastedContents,
        onInputChange,
        setPastedContents,
        setCursorOffset,
    ]);
    // Reset hasInitializedInput when input is cleared (e.g., after submission)
    (0, react_1.useEffect)(function () {
        if (input === '') {
            setHasAppliedTruncationToInput(false);
        }
    }, [input]);
}
