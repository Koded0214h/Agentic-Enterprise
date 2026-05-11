"use strict";
/**
 * Lazy accessor for proper-lockfile.
 *
 * proper-lockfile depends on graceful-fs, which monkey-patches every fs
 * method on first require (~8ms). Static imports of proper-lockfile pull this
 * cost into the startup path even when no locking happens (e.g. `--help`).
 *
 * Import this module instead of `proper-lockfile` directly. The underlying
 * package is only loaded the first time a lock function is actually called.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lock = lock;
exports.lockSync = lockSync;
exports.unlock = unlock;
exports.check = check;
var _lockfile;
function getLockfile() {
    if (!_lockfile) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        _lockfile = require('proper-lockfile');
    }
    return _lockfile;
}
function lock(file, options) {
    return getLockfile().lock(file, options);
}
function lockSync(file, options) {
    return getLockfile().lockSync(file, options);
}
function unlock(file, options) {
    return getLockfile().unlock(file, options);
}
function check(file, options) {
    return getLockfile().check(file, options);
}
