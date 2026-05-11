"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sleep = {
    name: 'sleep',
    description: 'Delay for a specified amount of time',
    args: {
        name: 'duration',
        description: 'Duration to sleep (seconds or with suffix like 5s, 2m, 1h)',
        isOptional: false,
    },
};
exports.default = sleep;
