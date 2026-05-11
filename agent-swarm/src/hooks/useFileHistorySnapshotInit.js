"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFileHistorySnapshotInit = useFileHistorySnapshotInit;
var react_1 = require("react");
var fileHistory_js_1 = require("../utils/fileHistory.js");
function useFileHistorySnapshotInit(initialFileHistorySnapshots, fileHistoryState, onUpdateState) {
    var initialized = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (!(0, fileHistory_js_1.fileHistoryEnabled)() || initialized.current) {
            return;
        }
        initialized.current = true;
        if (initialFileHistorySnapshots) {
            (0, fileHistory_js_1.fileHistoryRestoreStateFromLog)(initialFileHistorySnapshots, onUpdateState);
        }
    }, [fileHistoryState, initialFileHistorySnapshots, onUpdateState]);
}
