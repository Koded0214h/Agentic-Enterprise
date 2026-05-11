"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectGroupBy = objectGroupBy;
/**
 * https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.groupby
 */
function objectGroupBy(items, keySelector) {
    var result = Object.create(null);
    var index = 0;
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var key = keySelector(item, index++);
        if (result[key] === undefined) {
            result[key] = [];
        }
        result[key].push(item);
    }
    return result;
}
