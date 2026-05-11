"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandName = getCommandName;
exports.isCommandEnabled = isCommandEnabled;
/** Resolves the user-visible name, falling back to `cmd.name` when not overridden. */
function getCommandName(cmd) {
    var _a, _b;
    return (_b = (_a = cmd.userFacingName) === null || _a === void 0 ? void 0 : _a.call(cmd)) !== null && _b !== void 0 ? _b : cmd.name;
}
/** Resolves whether the command is enabled, defaulting to true. */
function isCommandEnabled(cmd) {
    var _a, _b;
    return (_b = (_a = cmd.isEnabled) === null || _a === void 0 ? void 0 : _a.call(cmd)) !== null && _b !== void 0 ? _b : true;
}
