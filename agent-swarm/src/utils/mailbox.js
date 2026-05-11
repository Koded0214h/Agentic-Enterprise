"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailbox = void 0;
var signal_js_1 = require("./signal.js");
var Mailbox = /** @class */ (function () {
    function Mailbox() {
        this.queue = [];
        this.waiters = [];
        this.changed = (0, signal_js_1.createSignal)();
        this._revision = 0;
        this.subscribe = this.changed.subscribe;
    }
    Object.defineProperty(Mailbox.prototype, "length", {
        get: function () {
            return this.queue.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mailbox.prototype, "revision", {
        get: function () {
            return this._revision;
        },
        enumerable: false,
        configurable: true
    });
    Mailbox.prototype.send = function (msg) {
        this._revision++;
        var idx = this.waiters.findIndex(function (w) { return w.fn(msg); });
        if (idx !== -1) {
            var waiter = this.waiters.splice(idx, 1)[0];
            if (waiter) {
                waiter.resolve(msg);
                this.notify();
                return;
            }
        }
        this.queue.push(msg);
        this.notify();
    };
    Mailbox.prototype.poll = function (fn) {
        if (fn === void 0) { fn = function () { return true; }; }
        var idx = this.queue.findIndex(fn);
        if (idx === -1)
            return undefined;
        return this.queue.splice(idx, 1)[0];
    };
    Mailbox.prototype.receive = function (fn) {
        var _this = this;
        if (fn === void 0) { fn = function () { return true; }; }
        var idx = this.queue.findIndex(fn);
        if (idx !== -1) {
            var msg = this.queue.splice(idx, 1)[0];
            if (msg) {
                this.notify();
                return Promise.resolve(msg);
            }
        }
        return new Promise(function (resolve) {
            _this.waiters.push({ fn: fn, resolve: resolve });
        });
    };
    Mailbox.prototype.notify = function () {
        this.changed.emit();
    };
    return Mailbox;
}());
exports.Mailbox = Mailbox;
