"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuleBehaviorDescription = getRuleBehaviorDescription;
// Helper function to get the appropriate prose description for rule behavior
function getRuleBehaviorDescription(permissionResult) {
    switch (permissionResult) {
        case 'allow':
            return 'allowed';
        case 'deny':
            return 'denied';
        default:
            return 'asked for confirmation for';
    }
}
