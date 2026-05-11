"use strict";
/**
 * Native Installer - Public API
 *
 * This is the barrel file that exports only the functions actually used by external modules.
 * External modules should only import from this file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeInstalledSymlink = exports.lockCurrentVersion = exports.installLatest = exports.cleanupShellAliases = exports.cleanupOldVersions = exports.cleanupNpmInstallations = exports.checkInstall = void 0;
// Re-export only the functions that are actually used
var installer_js_1 = require("./installer.js");
Object.defineProperty(exports, "checkInstall", { enumerable: true, get: function () { return installer_js_1.checkInstall; } });
Object.defineProperty(exports, "cleanupNpmInstallations", { enumerable: true, get: function () { return installer_js_1.cleanupNpmInstallations; } });
Object.defineProperty(exports, "cleanupOldVersions", { enumerable: true, get: function () { return installer_js_1.cleanupOldVersions; } });
Object.defineProperty(exports, "cleanupShellAliases", { enumerable: true, get: function () { return installer_js_1.cleanupShellAliases; } });
Object.defineProperty(exports, "installLatest", { enumerable: true, get: function () { return installer_js_1.installLatest; } });
Object.defineProperty(exports, "lockCurrentVersion", { enumerable: true, get: function () { return installer_js_1.lockCurrentVersion; } });
Object.defineProperty(exports, "removeInstalledSymlink", { enumerable: true, get: function () { return installer_js_1.removeInstalledSymlink; } });
