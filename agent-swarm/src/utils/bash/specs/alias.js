"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var alias = {
    name: 'alias',
    description: 'Create or list command aliases',
    args: {
        name: 'definition',
        description: 'Alias definition in the form name=value',
        isOptional: true,
        isVariadic: true,
    },
};
exports.default = alias;
