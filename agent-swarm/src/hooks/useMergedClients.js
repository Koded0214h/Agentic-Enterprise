"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeClients = mergeClients;
exports.useMergedClients = useMergedClients;
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
var react_1 = require("react");
function mergeClients(initialClients, mcpClients) {
    if (initialClients && mcpClients && mcpClients.length > 0) {
        return (0, uniqBy_js_1.default)(__spreadArray(__spreadArray([], initialClients, true), mcpClients, true), 'name');
    }
    return initialClients || [];
}
function useMergedClients(initialClients, mcpClients) {
    return (0, react_1.useMemo)(function () { return mergeClients(initialClients, mcpClients); }, [initialClients, mcpClients]);
}
