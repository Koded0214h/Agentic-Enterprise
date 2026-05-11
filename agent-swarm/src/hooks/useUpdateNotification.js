"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSemverPart = getSemverPart;
exports.shouldShowUpdateNotification = shouldShowUpdateNotification;
exports.useUpdateNotification = useUpdateNotification;
var react_1 = require("react");
var semver_1 = require("semver");
function getSemverPart(version) {
    return "".concat((0, semver_1.major)(version, { loose: true }), ".").concat((0, semver_1.minor)(version, { loose: true }), ".").concat((0, semver_1.patch)(version, { loose: true }));
}
function shouldShowUpdateNotification(updatedVersion, lastNotifiedSemver) {
    var updatedSemver = getSemverPart(updatedVersion);
    return updatedSemver !== lastNotifiedSemver;
}
function useUpdateNotification(updatedVersion, initialVersion) {
    if (initialVersion === void 0) { initialVersion = MACRO.VERSION; }
    var _a = (0, react_1.useState)(function () { return getSemverPart(initialVersion); }), lastNotifiedSemver = _a[0], setLastNotifiedSemver = _a[1];
    if (!updatedVersion) {
        return null;
    }
    var updatedSemver = getSemverPart(updatedVersion);
    if (updatedSemver !== lastNotifiedSemver) {
        setLastNotifiedSemver(updatedSemver);
        return updatedSemver;
    }
    return null;
}
