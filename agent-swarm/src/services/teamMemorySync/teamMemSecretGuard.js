"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTeamMemSecrets = checkTeamMemSecrets;
var bun_bundle_1 = require("bun:bundle");
/**
 * Check if a file write/edit to a team memory path contains secrets.
 * Returns an error message if secrets are detected, or null if safe.
 *
 * This is called from FileWriteTool and FileEditTool validateInput to
 * prevent the model from writing secrets into team memory files, which
 * would be synced to all repository collaborators.
 *
 * Callers can import and call this unconditionally — the internal
 * feature('TEAMMEM') guard keeps it inert when the build flag is off.
 * secretScanner assembles sensitive prefixes at runtime (ANT_KEY_PFX).
 */
function checkTeamMemSecrets(filePath, content) {
    if ((0, bun_bundle_1.feature)('TEAMMEM')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var isTeamMemPath = require('../../memdir/teamMemPaths.js').isTeamMemPath;
        var scanForSecrets = require('./secretScanner.js').scanForSecrets;
        /* eslint-enable @typescript-eslint/no-require-imports */
        if (!isTeamMemPath(filePath)) {
            return null;
        }
        var matches = scanForSecrets(content);
        if (matches.length === 0) {
            return null;
        }
        var labels = matches.map(function (m) { return m.label; }).join(', ');
        return ("Content contains potential secrets (".concat(labels, ") and cannot be written to team memory. ") +
            'Team memory is shared with all repository collaborators. ' +
            'Remove the sensitive content and try again.');
    }
    return null;
}
