"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.difference = difference;
exports.intersects = intersects;
exports.every = every;
exports.union = union;
/**
 * Note: this code is hot, so is optimized for speed.
 */
function difference(a, b) {
    var result = new Set();
    for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
        var item = a_1[_i];
        if (!b.has(item)) {
            result.add(item);
        }
    }
    return result;
}
/**
 * Note: this code is hot, so is optimized for speed.
 */
function intersects(a, b) {
    if (a.size === 0 || b.size === 0) {
        return false;
    }
    for (var _i = 0, a_2 = a; _i < a_2.length; _i++) {
        var item = a_2[_i];
        if (b.has(item)) {
            return true;
        }
    }
    return false;
}
/**
 * Note: this code is hot, so is optimized for speed.
 */
function every(a, b) {
    for (var _i = 0, a_3 = a; _i < a_3.length; _i++) {
        var item = a_3[_i];
        if (!b.has(item)) {
            return false;
        }
    }
    return true;
}
/**
 * Note: this code is hot, so is optimized for speed.
 */
function union(a, b) {
    var result = new Set();
    for (var _i = 0, a_4 = a; _i < a_4.length; _i++) {
        var item = a_4[_i];
        result.add(item);
    }
    for (var _a = 0, b_1 = b; _a < b_1.length; _a++) {
        var item = b_1[_a];
        result.add(item);
    }
    return result;
}
