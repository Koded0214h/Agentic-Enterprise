"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAgentsMd = writeAgentsMd;
var fs_1 = require("fs");
var path_1 = require("path");
var claude_md_utils_js_1 = require("./claude-md-utils.js");
var logger_js_1 = require("./logger.js");
/**
 * Write AGENTS.md with claude-mem context, preserving user content outside tags.
 * Uses atomic write to prevent partial writes.
 */
function writeAgentsMd(agentsPath, context) {
    if (!agentsPath)
        return;
    // Never write inside .git directories — corrupts refs (#1165)
    var resolvedPath = (0, path_1.resolve)(agentsPath);
    if (resolvedPath.includes('/.git/') || resolvedPath.includes('\\.git\\') || resolvedPath.endsWith('/.git') || resolvedPath.endsWith('\\.git'))
        return;
    var dir = (0, path_1.dirname)(agentsPath);
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
    var existingContent = '';
    if ((0, fs_1.existsSync)(agentsPath)) {
        existingContent = (0, fs_1.readFileSync)(agentsPath, 'utf-8');
    }
    var contentBlock = "# Memory Context\n\n".concat(context);
    var finalContent = (0, claude_md_utils_js_1.replaceTaggedContent)(existingContent, contentBlock);
    var tempFile = "".concat(agentsPath, ".tmp");
    try {
        (0, fs_1.writeFileSync)(tempFile, finalContent);
        (0, fs_1.renameSync)(tempFile, agentsPath);
    }
    catch (error) {
        logger_js_1.logger.error('AGENTS_MD', 'Failed to write AGENTS.md', { agentsPath: agentsPath }, error);
    }
}
