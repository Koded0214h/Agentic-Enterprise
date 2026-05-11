"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var timeout = {
    name: 'timeout',
    description: 'Run a command with a time limit',
    args: [
        {
            name: 'duration',
            description: 'Duration to wait before timing out (e.g., 10, 5s, 2m)',
            isOptional: false,
        },
        {
            name: 'command',
            description: 'Command to run',
            isCommand: true,
        },
    ],
};
exports.default = timeout;
