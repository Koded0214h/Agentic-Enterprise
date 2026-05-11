"use strict";
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
exports.getContainerId = void 0;
exports.logPermissionContextForAnts = logPermissionContextForAnts;
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var index_js_1 = require("./analytics/index.js");
/**
 * Get the current Kubernetes namespace:
 * Returns null on laptops/local development,
 * "default" for devboxes in default namespace,
 * "ts" for devboxes in ts namespace,
 * ...
 */
var getKubernetesNamespace = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var namespacePath, namespaceNotFound, content, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (process.env.USER_TYPE !== 'ant') {
                    return [2 /*return*/, null];
                }
                namespacePath = '/var/run/secrets/kubernetes.io/serviceaccount/namespace';
                namespaceNotFound = 'namespace not found';
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, promises_1.readFile)(namespacePath, { encoding: 'utf8' })];
            case 2:
                content = _b.sent();
                return [2 /*return*/, content.trim()];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, namespaceNotFound];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Get the OCI container ID from within a running container
 */
exports.getContainerId = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var containerIdPath, containerIdNotFound, containerIdNotFoundInMountinfo, mountinfo, containerIdPattern, lines, _i, lines_1, line, match, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (process.env.USER_TYPE !== 'ant') {
                    return [2 /*return*/, null];
                }
                containerIdPath = '/proc/self/mountinfo';
                containerIdNotFound = 'container ID not found';
                containerIdNotFoundInMountinfo = 'container ID not found in mountinfo';
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, promises_1.readFile)(containerIdPath, { encoding: 'utf8' })];
            case 2:
                mountinfo = (_b.sent()).trim();
                containerIdPattern = /(?:\/docker\/containers\/|\/sandboxes\/)([0-9a-f]{64})/;
                lines = mountinfo.split('\n');
                for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                    line = lines_1[_i];
                    match = line.match(containerIdPattern);
                    if (match && match[1]) {
                        return [2 /*return*/, match[1]];
                    }
                }
                return [2 /*return*/, containerIdNotFoundInMountinfo];
            case 3:
                _a = _b.sent();
                return [2 /*return*/, containerIdNotFound];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Logs an event with the current namespace and tool permission context
 */
function logPermissionContextForAnts(toolPermissionContext, moment) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (process.env.USER_TYPE !== 'ant') {
                        return [2 /*return*/];
                    }
                    _a = index_js_1.logEvent;
                    _b = ['tengu_internal_record_permission_context'];
                    _c = {
                        moment: moment
                    };
                    return [4 /*yield*/, getKubernetesNamespace()];
                case 1:
                    _c.namespace = (_d.sent()),
                        _c.toolPermissionContext = (0, slowOperations_js_1.jsonStringify)(toolPermissionContext);
                    return [4 /*yield*/, (0, exports.getContainerId)()];
                case 2:
                    void _a.apply(void 0, _b.concat([(_c.containerId = (_d.sent()),
                            _c)]));
                    return [2 /*return*/];
            }
        });
    });
}
