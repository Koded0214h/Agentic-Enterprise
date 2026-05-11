"use strict";
/**
 * Tracks timestamps of in-process settings-file writes so the chokidar watcher
 * in changeDetector.ts can ignore its own echoes.
 *
 * Extracted from changeDetector.ts to break the settings.ts → changeDetector.ts →
 * hooks.ts → … → settings.ts cycle. settings.ts needs to mark "I'm about to
 * write" before the write lands; changeDetector needs to read the mark when
 * chokidar fires. The map is the only shared state — everything else in
 * changeDetector (chokidar, hooks, mdm polling) is irrelevant to settings.ts.
 *
 * Callers pass resolved paths. The path→source resolution (getSettingsFilePathForSource)
 * lives in settings.ts, so settings.ts does it before calling here. No imports.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.markInternalWrite = markInternalWrite;
exports.consumeInternalWrite = consumeInternalWrite;
exports.clearInternalWrites = clearInternalWrites;
var timestamps = new Map();
function markInternalWrite(path) {
    timestamps.set(path, Date.now());
}
/**
 * True if `path` was marked within `windowMs`. Consumes the mark on match —
 * the watcher fires once per write, so a matched mark shouldn't suppress
 * the next (real, external) change to the same file.
 */
function consumeInternalWrite(path, windowMs) {
    var ts = timestamps.get(path);
    if (ts !== undefined && Date.now() - ts < windowMs) {
        timestamps.delete(path);
        return true;
    }
    return false;
}
function clearInternalWrites() {
    timestamps.clear();
}
