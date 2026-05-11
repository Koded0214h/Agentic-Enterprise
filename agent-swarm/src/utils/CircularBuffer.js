"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularBuffer = void 0;
/**
 * A fixed-size circular buffer that automatically evicts the oldest items
 * when the buffer is full. Useful for maintaining a rolling window of data.
 */
var CircularBuffer = /** @class */ (function () {
    function CircularBuffer(capacity) {
        this.capacity = capacity;
        this.head = 0;
        this.size = 0;
        this.buffer = new Array(capacity);
    }
    /**
     * Add an item to the buffer. If the buffer is full,
     * the oldest item will be evicted.
     */
    CircularBuffer.prototype.add = function (item) {
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.capacity;
        if (this.size < this.capacity) {
            this.size++;
        }
    };
    /**
     * Add multiple items to the buffer at once.
     */
    CircularBuffer.prototype.addAll = function (items) {
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            this.add(item);
        }
    };
    /**
     * Get the most recent N items from the buffer.
     * Returns fewer items if the buffer contains less than N items.
     */
    CircularBuffer.prototype.getRecent = function (count) {
        var result = [];
        var start = this.size < this.capacity ? 0 : this.head;
        var available = Math.min(count, this.size);
        for (var i = 0; i < available; i++) {
            var index = (start + this.size - available + i) % this.capacity;
            result.push(this.buffer[index]);
        }
        return result;
    };
    /**
     * Get all items currently in the buffer, in order from oldest to newest.
     */
    CircularBuffer.prototype.toArray = function () {
        if (this.size === 0)
            return [];
        var result = [];
        var start = this.size < this.capacity ? 0 : this.head;
        for (var i = 0; i < this.size; i++) {
            var index = (start + i) % this.capacity;
            result.push(this.buffer[index]);
        }
        return result;
    };
    /**
     * Clear all items from the buffer.
     */
    CircularBuffer.prototype.clear = function () {
        this.buffer.length = 0;
        this.head = 0;
        this.size = 0;
    };
    /**
     * Get the current number of items in the buffer.
     */
    CircularBuffer.prototype.length = function () {
        return this.size;
    };
    return CircularBuffer;
}());
exports.CircularBuffer = CircularBuffer;
