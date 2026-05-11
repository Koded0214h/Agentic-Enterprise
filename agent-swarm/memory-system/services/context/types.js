"use strict";
/**
 * Context Types - Shared types for context generation module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUMMARY_LOOKAHEAD = exports.CHARS_PER_TOKEN_ESTIMATE = exports.colors = void 0;
/**
 * ANSI color codes for terminal output
 */
exports.colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
};
/**
 * Configuration constants
 */
exports.CHARS_PER_TOKEN_ESTIMATE = 4;
exports.SUMMARY_LOOKAHEAD = 1;
