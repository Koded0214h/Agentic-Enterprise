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
exports.useContextPreview = useContextPreview;
var react_1 = require("react");
function useContextPreview(settings) {
    var _this = this;
    var _a = (0, react_1.useState)(''), preview = _a[0], setPreview = _a[1];
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)([]), projects = _d[0], setProjects = _d[1];
    var _e = (0, react_1.useState)(null), selectedProject = _e[0], setSelectedProject = _e[1];
    // Fetch projects on mount
    (0, react_1.useEffect)(function () {
        function fetchProjects() {
            return __awaiter(this, void 0, void 0, function () {
                var response, data, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fetch('/api/projects')];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            if (data.projects && data.projects.length > 0) {
                                setProjects(data.projects);
                                setSelectedProject(data.projects[0]); // Default to first project
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            console.error('Failed to fetch projects:', err_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        fetchProjects();
    }, []);
    var refresh = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var params, response, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedProject) {
                        setPreview('No project selected');
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError(null);
                    params = new URLSearchParams({
                        project: selectedProject
                    });
                    return [4 /*yield*/, fetch("/api/context/preview?".concat(params))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    text = _a.sent();
                    if (response.ok) {
                        setPreview(text);
                    }
                    else {
                        setError('Failed to load preview');
                    }
                    setIsLoading(false);
                    return [2 /*return*/];
            }
        });
    }); }, [selectedProject]);
    // Debounced refresh when settings or selectedProject change
    (0, react_1.useEffect)(function () {
        var timeout = setTimeout(function () {
            refresh();
        }, 300);
        return function () { return clearTimeout(timeout); };
    }, [settings, refresh]);
    return { preview: preview, isLoading: isLoading, error: error, refresh: refresh, projects: projects, selectedProject: selectedProject, setSelectedProject: setSelectedProject };
}
