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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var swarmPackageRoot_js_1 = require("../../utils/swarmPackageRoot.js");
var call = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var parts, agentName, task, packageRoot, configPath, config, agents, categories, _i, _a, key, source, agentList, more, agent, engineName, orchestratorPath, taskArg, lines;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        parts = args.trim().split(/\s+/);
        agentName = parts[0];
        task = parts.slice(1).join(' ');
        if (!agentName) {
            return [2 /*return*/, { type: 'text', value: 'Usage: /run <agent> [task]\nProvide an agent name to run.' }];
        }
        packageRoot = (0, swarmPackageRoot_js_1.getSwarmPackageRoot)(import.meta.url);
        configPath = (0, path_1.join)(packageRoot, 'swarm.config.json');
        if (!(0, fs_1.existsSync)(configPath)) {
            return [2 /*return*/, { type: 'text', value: "swarm.config.json not found at: ".concat(configPath) }];
        }
        try {
            config = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf8'));
        }
        catch (_f) {
            return [2 /*return*/, { type: 'text', value: 'Failed to parse swarm.config.json' }];
        }
        agents = config.agents;
        if (!agents) {
            return [2 /*return*/, { type: 'text', value: 'No agents found in swarm.config.json' }];
        }
        if (!agents[agentName]) {
            categories = new Set();
            for (_i = 0, _a = Object.keys(agents); _i < _a.length; _i++) {
                key = _a[_i];
                source = (_b = agents[key]) === null || _b === void 0 ? void 0 : _b.source;
                if (source)
                    categories.add(source);
            }
            agentList = Object.keys(agents).slice(0, 20).join(', ');
            more = Object.keys(agents).length > 20 ? " ... and ".concat(Object.keys(agents).length - 20, " more") : '';
            return [2 /*return*/, {
                    type: 'text',
                    value: "Agent \"".concat(agentName, "\" not found.\n\nAvailable categories: ").concat(__spreadArray([], categories, true).join(', '), "\n\nSample agents: ").concat(agentList).concat(more, "\n\nRun /agents to see all available agents."),
                }];
        }
        agent = agents[agentName];
        engineName = (_d = (_c = agent.engine) !== null && _c !== void 0 ? _c : config.default_engine) !== null && _d !== void 0 ? _d : 'claude';
        orchestratorPath = (0, path_1.join)(packageRoot, 'orchestrator.py');
        taskArg = task ? " \"".concat(task, "\"") : '';
        lines = [
            "Agent: ".concat(agentName),
            "File:  ".concat(agent.file),
            "Engine: ".concat(engineName),
            "",
            "Run command:",
            "  python3 ".concat(orchestratorPath, " --agent ").concat(agentName).concat(taskArg, " --project <project-path>"),
            "",
            "Or set SWARM_ROOT and run:",
            "  swarm --agent ".concat(agentName).concat(taskArg),
        ];
        return [2 /*return*/, { type: 'text', value: lines.join('\n') }];
    });
}); };
exports.call = call;
