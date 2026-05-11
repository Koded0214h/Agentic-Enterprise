"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBashCommentLabel = extractBashCommentLabel;
/**
 * If the first line of a bash command is a `# comment` (not a `#!` shebang),
 * return the comment text stripped of the `#` prefix. Otherwise undefined.
 *
 * Under fullscreen mode this is the non-verbose tool-use label AND the
 * collapse-group ⎿ hint — it's what Claude wrote for the human to read.
 */
function extractBashCommentLabel(command) {
    var nl = command.indexOf('\n');
    var firstLine = (nl === -1 ? command : command.slice(0, nl)).trim();
    if (!firstLine.startsWith('#') || firstLine.startsWith('#!'))
        return undefined;
    return firstLine.replace(/^#+\s*/, '') || undefined;
}
