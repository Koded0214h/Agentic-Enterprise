"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_TOPICS = exports.ALLOWED_OPERATIONS = void 0;
// Allowed values for /api/instructions security
exports.ALLOWED_OPERATIONS = [
    'search',
    'context',
    'summarize',
    'import',
    'export'
];
exports.ALLOWED_TOPICS = [
    'workflow',
    'search_params',
    'examples',
    'all'
];
