"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSync = void 0;
exports.createRoot = createRoot;
var debug_js_1 = require("src/utils/debug.js");
var stream_1 = require("stream");
var ink_js_1 = require("./ink.js");
var instances_js_1 = require("./instances.js");
/**
 * Mount a component and render the output.
 */
var renderSync = function (node, options) {
    var opts = getOptions(options);
    var inkOptions = __assign({ stdout: process.stdout, stdin: process.stdin, stderr: process.stderr, exitOnCtrlC: true, patchConsole: true }, opts);
    var instance = getInstance(inkOptions.stdout, function () { return new ink_js_1.default(inkOptions); });
    instance.render(node);
    return {
        rerender: instance.render,
        unmount: function () {
            instance.unmount();
        },
        waitUntilExit: instance.waitUntilExit,
        cleanup: function () { return instances_js_1.default.delete(inkOptions.stdout); },
    };
};
exports.renderSync = renderSync;
var wrappedRender = function (node, options) { return __awaiter(void 0, void 0, void 0, function () {
    var instance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Preserve the microtask boundary that `await loadYoga()` used to provide.
            // Without it, the first render fires synchronously before async startup work
            // (e.g. useReplBridge notification state) settles, and the subsequent Static
            // write overwrites scrollback instead of appending below the logo.
            return [4 /*yield*/, Promise.resolve()];
            case 1:
                // Preserve the microtask boundary that `await loadYoga()` used to provide.
                // Without it, the first render fires synchronously before async startup work
                // (e.g. useReplBridge notification state) settles, and the subsequent Static
                // write overwrites scrollback instead of appending below the logo.
                _a.sent();
                instance = (0, exports.renderSync)(node, options);
                (0, debug_js_1.logForDebugging)("[render] first ink render: ".concat(Math.round(process.uptime() * 1000), "ms since process start"));
                return [2 /*return*/, instance];
        }
    });
}); };
exports.default = wrappedRender;
/**
 * Create an Ink root without rendering anything yet.
 * Like react-dom's createRoot — call root.render() to mount a tree.
 */
function createRoot() {
    return __awaiter(this, arguments, void 0, function (_a) {
        var instance;
        var _b = _a === void 0 ? {} : _a, _c = _b.stdout, stdout = _c === void 0 ? process.stdout : _c, _d = _b.stdin, stdin = _d === void 0 ? process.stdin : _d, _e = _b.stderr, stderr = _e === void 0 ? process.stderr : _e, _f = _b.exitOnCtrlC, exitOnCtrlC = _f === void 0 ? true : _f, _g = _b.patchConsole, patchConsole = _g === void 0 ? true : _g, onFrame = _b.onFrame;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: 
                // See wrappedRender — preserve microtask boundary from the old WASM await.
                return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // See wrappedRender — preserve microtask boundary from the old WASM await.
                    _h.sent();
                    instance = new ink_js_1.default({
                        stdout: stdout,
                        stdin: stdin,
                        stderr: stderr,
                        exitOnCtrlC: exitOnCtrlC,
                        patchConsole: patchConsole,
                        onFrame: onFrame,
                    });
                    // Register in the instances map so that code that looks up the Ink
                    // instance by stdout (e.g. external editor pause/resume) can find it.
                    instances_js_1.default.set(stdout, instance);
                    return [2 /*return*/, {
                            render: function (node) { return instance.render(node); },
                            unmount: function () { return instance.unmount(); },
                            waitUntilExit: function () { return instance.waitUntilExit(); },
                        }];
            }
        });
    });
}
var getOptions = function (stdout) {
    if (stdout === void 0) { stdout = {}; }
    if (stdout instanceof stream_1.Stream) {
        return {
            stdout: stdout,
            stdin: process.stdin,
        };
    }
    return stdout;
};
var getInstance = function (stdout, createInstance) {
    var instance = instances_js_1.default.get(stdout);
    if (!instance) {
        instance = createInstance();
        instances_js_1.default.set(stdout, instance);
    }
    return instance;
};
