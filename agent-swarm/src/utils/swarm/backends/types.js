"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPaneBackend = isPaneBackend;
// =============================================================================
// Type Guards
// =============================================================================
/**
 * Type guard to check if a backend type uses terminal panes.
 */
function isPaneBackend(type) {
    return type === 'tmux' || type === 'iterm2';
}
