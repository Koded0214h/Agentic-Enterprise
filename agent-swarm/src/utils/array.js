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
exports.intersperse = intersperse;
exports.count = count;
exports.uniq = uniq;
function intersperse(as, separator) {
    return as.flatMap(function (a, i) { return (i ? [separator(i), a] : [a]); });
}
function count(arr, pred) {
    var n = 0;
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var x = arr_1[_i];
        n += +!!pred(x);
    }
    return n;
}
function uniq(xs) {
    return __spreadArray([], new Set(xs), true);
}
