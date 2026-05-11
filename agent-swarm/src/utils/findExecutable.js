"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findExecutable = findExecutable;
var which_js_1 = require("./which.js");
/**
 * Find an executable by searching PATH, similar to `which`.
 * Replaces spawn-rx's findActualExecutable to avoid pulling in rxjs (~313 KB).
 *
 * Returns { cmd, args } to match the spawn-rx API shape.
 * `cmd` is the resolved path if found, or the original name if not.
 * `args` is always the pass-through of the input args.
 */
function findExecutable(exe, args) {
    var resolved = (0, which_js_1.whichSync)(exe);
    return { cmd: resolved !== null && resolved !== void 0 ? resolved : exe, args: args };
}
