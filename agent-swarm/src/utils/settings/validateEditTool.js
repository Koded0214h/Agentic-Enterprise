"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputForSettingsFileEdit = validateInputForSettingsFileEdit;
var filesystem_js_1 = require("../permissions/filesystem.js");
var validation_js_1 = require("./validation.js");
/**
 * Validates settings file edits to ensure the result conforms to SettingsSchema.
 * This is used by FileEditTool to avoid code duplication.
 *
 * @param filePath - The file path being edited
 * @param originalContent - The original file content before edits
 * @param getUpdatedContent - A closure that returns the content after applying edits
 * @returns Validation result with error details if validation fails
 */
function validateInputForSettingsFileEdit(filePath, originalContent, getUpdatedContent) {
    // Only validate Claude settings files
    if (!(0, filesystem_js_1.isClaudeSettingsPath)(filePath)) {
        return null;
    }
    // Check if the current file (before edit) conforms to the schema
    var beforeValidation = (0, validation_js_1.validateSettingsFileContent)(originalContent);
    if (!beforeValidation.isValid) {
        // If the before version is invalid, allow the edit (don't block it)
        return null;
    }
    // If the before version is valid, ensure the after version is also valid
    var updatedContent = getUpdatedContent();
    var afterValidation = (0, validation_js_1.validateSettingsFileContent)(updatedContent);
    if (!afterValidation.isValid) {
        return {
            result: false,
            message: "Claude Code settings.json validation failed after edit:\n".concat(afterValidation.error, "\n\nFull schema:\n").concat(afterValidation.fullSchema, "\nIMPORTANT: Do not update the env unless explicitly instructed to do so."),
            errorCode: 10,
        };
    }
    return null;
}
