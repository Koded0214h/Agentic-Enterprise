"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nohup = {
    name: 'nohup',
    description: 'Run a command immune to hangups',
    args: {
        name: 'command',
        description: 'Command to run with nohup',
        isCommand: true,
    },
};
exports.default = nohup;
