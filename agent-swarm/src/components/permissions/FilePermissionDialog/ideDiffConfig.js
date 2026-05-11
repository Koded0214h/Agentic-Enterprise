"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSingleEditDiffConfig = createSingleEditDiffConfig;
function createSingleEditDiffConfig(filePath, oldString, newString, replaceAll) {
    return {
        filePath: filePath,
        edits: [
            {
                old_string: oldString,
                new_string: newString,
                replace_all: replaceAll,
            },
        ],
        editMode: 'single',
    };
}
