"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwarmPackageRoot = getSwarmPackageRoot;
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
/**
 * Directory where orchestrator.py, agents/, engines/, and swarm.config.json live
 * (npm package root). Not the user's git project — use getProjectRoot() for that.
 */
function getSwarmPackageRoot(fromModuleUrl) {
    var fromEnv = process.env.SWARM_ROOT;
    if (fromEnv && (0, fs_1.existsSync)((0, path_1.join)(fromEnv, 'orchestrator.py'))) {
        return fromEnv;
    }
    var here = (0, path_1.dirname)((0, url_1.fileURLToPath)(fromModuleUrl));
    return (0, path_1.join)(here, '..', '..', '..');
}
