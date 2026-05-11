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
exports.call = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var swarmPackageRoot_js_1 = require("../../utils/swarmPackageRoot.js");
var child_process_1 = require("child_process");
var KNOWN_ENGINES = [
    { name: 'claude', command: 'claude', description: 'Anthropic Claude (via Claude Code)' },
    { name: 'gemini', command: 'gemini', description: 'Google Gemini CLI' },
    { name: 'generic', command: 'llm', description: 'Generic LLM adapter' },
    { name: 'openai', command: 'openai', description: 'OpenAI API adapter' },
    { name: 'ollama', command: 'ollama', description: 'Local Ollama models' },
];
function checkAvailable(command) {
    try {
        var result = (0, child_process_1.spawnSync)('which', [command], { encoding: 'utf8' });
        return result.status === 0;
    }
    catch (_a) {
        return false;
    }
}
var call = function () { return __awaiter(void 0, void 0, void 0, function () {
    var packageRoot, adapterPath, hasAdapter, lines, _i, KNOWN_ENGINES_1, eng, available, status_1;
    return __generator(this, function (_a) {
        packageRoot = (0, swarmPackageRoot_js_1.getSwarmPackageRoot)(import.meta.url);
        adapterPath = (0, path_1.join)(packageRoot, 'engines', 'adapter.py');
        hasAdapter = (0, fs_1.existsSync)(adapterPath);
        lines = [
            'Available Swarm Engines',
            '='.repeat(50),
            '',
            "".concat('Name'.padEnd(12)).concat('Command'.padEnd(12)).concat('Status'.padEnd(14), "Description"),
            '-'.repeat(70),
        ];
        for (_i = 0, KNOWN_ENGINES_1 = KNOWN_ENGINES; _i < KNOWN_ENGINES_1.length; _i++) {
            eng = KNOWN_ENGINES_1[_i];
            available = checkAvailable(eng.command);
            status_1 = available ? 'available' : 'not found';
            lines.push("".concat(eng.name.padEnd(12)).concat(eng.command.padEnd(12)).concat(status_1.padEnd(14)).concat(eng.description));
        }
        lines.push('');
        if (hasAdapter) {
            lines.push("Engine adapter: ".concat(adapterPath));
        }
        lines.push('Use /engine [name] to see instructions for switching engines.');
        return [2 /*return*/, { type: 'text', value: lines.join('\n') }];
    });
}); };
exports.call = call;
