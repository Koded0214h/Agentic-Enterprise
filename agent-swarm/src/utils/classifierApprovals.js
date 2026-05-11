"use strict";
/**
 * Tracks which tool uses were auto-approved by classifiers.
 * Populated from useCanUseTool.ts and permissions.ts, read from UserToolSuccessMessage.tsx.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeClassifierChecking = void 0;
exports.setClassifierApproval = setClassifierApproval;
exports.getClassifierApproval = getClassifierApproval;
exports.setYoloClassifierApproval = setYoloClassifierApproval;
exports.getYoloClassifierApproval = getYoloClassifierApproval;
exports.setClassifierChecking = setClassifierChecking;
exports.clearClassifierChecking = clearClassifierChecking;
exports.isClassifierChecking = isClassifierChecking;
exports.deleteClassifierApproval = deleteClassifierApproval;
exports.clearClassifierApprovals = clearClassifierApprovals;
var bun_bundle_1 = require("bun:bundle");
var signal_js_1 = require("./signal.js");
var CLASSIFIER_APPROVALS = new Map();
var CLASSIFIER_CHECKING = new Set();
var classifierChecking = (0, signal_js_1.createSignal)();
function setClassifierApproval(toolUseID, matchedRule) {
    if (!(0, bun_bundle_1.feature)('BASH_CLASSIFIER')) {
        return;
    }
    CLASSIFIER_APPROVALS.set(toolUseID, {
        classifier: 'bash',
        matchedRule: matchedRule,
    });
}
function getClassifierApproval(toolUseID) {
    if (!(0, bun_bundle_1.feature)('BASH_CLASSIFIER')) {
        return undefined;
    }
    var approval = CLASSIFIER_APPROVALS.get(toolUseID);
    if (!approval || approval.classifier !== 'bash')
        return undefined;
    return approval.matchedRule;
}
function setYoloClassifierApproval(toolUseID, reason) {
    if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        return;
    }
    CLASSIFIER_APPROVALS.set(toolUseID, { classifier: 'auto-mode', reason: reason });
}
function getYoloClassifierApproval(toolUseID) {
    if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        return undefined;
    }
    var approval = CLASSIFIER_APPROVALS.get(toolUseID);
    if (!approval || approval.classifier !== 'auto-mode')
        return undefined;
    return approval.reason;
}
function setClassifierChecking(toolUseID) {
    if (!(0, bun_bundle_1.feature)('BASH_CLASSIFIER') && !(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER'))
        return;
    CLASSIFIER_CHECKING.add(toolUseID);
    classifierChecking.emit();
}
function clearClassifierChecking(toolUseID) {
    if (!(0, bun_bundle_1.feature)('BASH_CLASSIFIER') && !(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER'))
        return;
    CLASSIFIER_CHECKING.delete(toolUseID);
    classifierChecking.emit();
}
exports.subscribeClassifierChecking = classifierChecking.subscribe;
function isClassifierChecking(toolUseID) {
    return CLASSIFIER_CHECKING.has(toolUseID);
}
function deleteClassifierApproval(toolUseID) {
    CLASSIFIER_APPROVALS.delete(toolUseID);
}
function clearClassifierApprovals() {
    CLASSIFIER_APPROVALS.clear();
    CLASSIFIER_CHECKING.clear();
    classifierChecking.emit();
}
