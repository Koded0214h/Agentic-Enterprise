"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
var Stream = /** @class */ (function () {
    function Stream(returned) {
        this.returned = returned;
        this.queue = [];
        this.isDone = false;
        this.started = false;
    }
    Stream.prototype[Symbol.asyncIterator] = function () {
        if (this.started) {
            throw new Error('Stream can only be iterated once');
        }
        this.started = true;
        return this;
    };
    Stream.prototype.next = function () {
        var _this = this;
        if (this.queue.length > 0) {
            return Promise.resolve({
                done: false,
                value: this.queue.shift(),
            });
        }
        if (this.isDone) {
            return Promise.resolve({ done: true, value: undefined });
        }
        if (this.hasError) {
            return Promise.reject(this.hasError);
        }
        return new Promise(function (resolve, reject) {
            _this.readResolve = resolve;
            _this.readReject = reject;
        });
    };
    Stream.prototype.enqueue = function (value) {
        if (this.readResolve) {
            var resolve = this.readResolve;
            this.readResolve = undefined;
            this.readReject = undefined;
            resolve({ done: false, value: value });
        }
        else {
            this.queue.push(value);
        }
    };
    Stream.prototype.done = function () {
        this.isDone = true;
        if (this.readResolve) {
            var resolve = this.readResolve;
            this.readResolve = undefined;
            this.readReject = undefined;
            resolve({ done: true, value: undefined });
        }
    };
    Stream.prototype.error = function (error) {
        this.hasError = error;
        if (this.readReject) {
            var reject = this.readReject;
            this.readResolve = undefined;
            this.readReject = undefined;
            reject(error);
        }
    };
    Stream.prototype.return = function () {
        this.isDone = true;
        if (this.returned) {
            this.returned();
        }
        return Promise.resolve({ done: true, value: undefined });
    };
    return Stream;
}());
exports.Stream = Stream;
