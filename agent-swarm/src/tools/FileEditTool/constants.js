"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_UNEXPECTEDLY_MODIFIED_ERROR = exports.GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN = exports.CLAUDE_FOLDER_PERMISSION_PATTERN = exports.FILE_EDIT_TOOL_NAME = void 0;
// In its own file to avoid circular dependencies
exports.FILE_EDIT_TOOL_NAME = 'Edit';
// Permission pattern for granting session-level access to the project's .claude/ folder
exports.CLAUDE_FOLDER_PERMISSION_PATTERN = '/.claude/**';
// Permission pattern for granting session-level access to the global ~/.claude/ folder
exports.GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN = '~/.claude/**';
exports.FILE_UNEXPECTEDLY_MODIFIED_ERROR = 'File has been unexpectedly modified. Read it again before attempting to write it.';
