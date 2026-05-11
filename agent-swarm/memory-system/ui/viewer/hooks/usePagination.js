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
exports.usePagination = usePagination;
var react_1 = require("react");
var ui_1 = require("../constants/ui");
var api_1 = require("../constants/api");
/**
 * Generic pagination hook for observations, summaries, and prompts
 */
function usePaginationFor(endpoint, dataType, currentFilter) {
    var _this = this;
    var _a = (0, react_1.useState)({
        isLoading: false,
        hasMore: true
    }), state = _a[0], setState = _a[1];
    // Track offset and filter in refs to handle synchronous resets
    var offsetRef = (0, react_1.useRef)(0);
    var lastFilterRef = (0, react_1.useRef)(currentFilter);
    var stateRef = (0, react_1.useRef)(state);
    /**
     * Load more items from the API
     * Automatically resets offset to 0 if filter has changed
     */
    var loadMore = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var filterChanged, newState, params, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filterChanged = lastFilterRef.current !== currentFilter;
                    if (filterChanged) {
                        offsetRef.current = 0;
                        lastFilterRef.current = currentFilter;
                        newState = { isLoading: false, hasMore: true };
                        setState(newState);
                        stateRef.current = newState; // Update ref immediately to avoid stale checks
                    }
                    // Prevent concurrent requests using ref (always current)
                    // Skip this check if we just reset the filter - we want to load the first page
                    if (!filterChanged && (stateRef.current.isLoading || !stateRef.current.hasMore)) {
                        return [2 /*return*/, []];
                    }
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
                    params = new URLSearchParams({
                        offset: offsetRef.current.toString(),
                        limit: ui_1.UI.PAGINATION_PAGE_SIZE.toString()
                    });
                    // Add project filter if present
                    if (currentFilter) {
                        params.append('project', currentFilter);
                    }
                    return [4 /*yield*/, fetch("".concat(endpoint, "?").concat(params))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to load ".concat(dataType, ": ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, hasMore: data.hasMore })); });
                    // Increment offset after successful load
                    offsetRef.current += ui_1.UI.PAGINATION_PAGE_SIZE;
                    return [2 /*return*/, data.items];
            }
        });
    }); }, [currentFilter, endpoint, dataType]);
    return __assign(__assign({}, state), { loadMore: loadMore });
}
/**
 * Hook for paginating observations
 */
function usePagination(currentFilter) {
    var observations = usePaginationFor(api_1.API_ENDPOINTS.OBSERVATIONS, 'observations', currentFilter);
    var summaries = usePaginationFor(api_1.API_ENDPOINTS.SUMMARIES, 'summaries', currentFilter);
    var prompts = usePaginationFor(api_1.API_ENDPOINTS.PROMPTS, 'prompts', currentFilter);
    return {
        observations: observations,
        summaries: summaries,
        prompts: prompts
    };
}
