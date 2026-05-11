"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var permissions = {
    type: 'local-jsx',
    name: 'permissions',
    aliases: ['allowed-tools'],
    description: 'Manage allow & deny tool permission rules',
    load: function () { return Promise.resolve().then(function () { return require('./permissions.js'); }); },
};
exports.default = permissions;
