"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FpsTracker = void 0;
var FpsTracker = /** @class */ (function () {
    function FpsTracker() {
        this.frameDurations = [];
    }
    FpsTracker.prototype.record = function (durationMs) {
        var now = performance.now();
        if (this.firstRenderTime === undefined) {
            this.firstRenderTime = now;
        }
        this.lastRenderTime = now;
        this.frameDurations.push(durationMs);
    };
    FpsTracker.prototype.getMetrics = function () {
        if (this.frameDurations.length === 0 ||
            this.firstRenderTime === undefined ||
            this.lastRenderTime === undefined) {
            return undefined;
        }
        var totalTimeMs = this.lastRenderTime - this.firstRenderTime;
        if (totalTimeMs <= 0) {
            return undefined;
        }
        var totalFrames = this.frameDurations.length;
        var averageFps = totalFrames / (totalTimeMs / 1000);
        var sorted = this.frameDurations.slice().sort(function (a, b) { return b - a; });
        var p99Index = Math.max(0, Math.ceil(sorted.length * 0.01) - 1);
        var p99FrameTimeMs = sorted[p99Index];
        var low1PctFps = p99FrameTimeMs > 0 ? 1000 / p99FrameTimeMs : 0;
        return {
            averageFps: Math.round(averageFps * 100) / 100,
            low1PctFps: Math.round(low1PctFps * 100) / 100,
        };
    };
    return FpsTracker;
}());
exports.FpsTracker = FpsTracker;
