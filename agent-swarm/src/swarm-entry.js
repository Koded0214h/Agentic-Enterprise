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
exports.getSwarmPackageRoot = getSwarmPackageRoot;
/**
 * Default `swarm` CLI entry: runs the Python orchestrator bundled with the package.
 *
 * - `swarm` / `swarm tui` → Python orchestrator (interactive when no args).
 * - `swarm studio` or `--studio` or `SWARM_STUDIO=1` → full Ink stack (`dist/main.js`) when present.
 */
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var __dirname = (0, path_1.dirname)((0, url_1.fileURLToPath)(import.meta.url));
function getSwarmPackageRoot() {
    var fromEnv = process.env.SWARM_ROOT;
    if (fromEnv && (0, fs_1.existsSync)((0, path_1.join)(fromEnv, 'orchestrator.py'))) {
        return fromEnv;
    }
    return (0, path_1.join)(__dirname, '..');
}
function findPython() {
    var fromEnv = process.env.SWARM_PYTHON;
    if (fromEnv) {
        return fromEnv;
    }
    for (var _i = 0, _a = ['python3', 'python']; _i < _a.length; _i++) {
        var cmd = _a[_i];
        var r = (0, child_process_1.spawnSync)(cmd, ['-V'], { encoding: 'utf8' });
        if (r.status === 0) {
            return cmd;
        }
    }
    return 'python3';
}
function prepareArgv(argv) {
    var studio = process.env.SWARM_STUDIO === '1' || argv.includes('--studio') || argv.includes('-S');
    var filtered = argv.filter(function (a) { return a !== '--studio' && a !== '-S'; });
    if (filtered[0] === 'tui') {
        filtered = filtered.slice(1);
    }
    if (filtered[0] === 'studio') {
        studio = true;
        filtered = filtered.slice(1);
    }
    return { studio: studio, passthrough: filtered };
}
function main() {
    var pkgRoot = getSwarmPackageRoot();
    var _a = prepareArgv(process.argv.slice(2)), studio = _a.studio, passthrough = _a.passthrough;
    if (studio) {
        var mainJs = (0, path_1.join)(pkgRoot, 'dist', 'main.js');
        if (!(0, fs_1.existsSync)(mainJs)) {
            process.stderr.write('SWARM studio build missing: dist/main.js not found. Run `npm run build:studio` once the project compiles, or use `npm run dev`.\n');
            process.exit(1);
        }
        var child_1 = (0, child_process_1.spawn)(process.execPath, __spreadArray([mainJs], passthrough, true), {
            stdio: 'inherit',
            cwd: process.cwd(),
            env: __assign(__assign({}, process.env), { SWARM_ROOT: pkgRoot }),
        });
        child_1.on('exit', function (code) { return process.exit(code !== null && code !== void 0 ? code : 0); });
        child_1.on('error', function (err) {
            process.stderr.write("".concat(err.message, "\n"));
            process.exit(1);
        });
        return;
    }
    var orchestratorPath = (0, path_1.join)(pkgRoot, 'orchestrator.py');
    if (!(0, fs_1.existsSync)(orchestratorPath)) {
        process.stderr.write("Swarm orchestrator not found at ".concat(orchestratorPath, "\n"));
        process.exit(1);
    }
    var python = findPython();
    var child = (0, child_process_1.spawn)(python, __spreadArray([orchestratorPath], passthrough, true), {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: __assign(__assign({}, process.env), { SWARM_ROOT: pkgRoot }),
    });
    child.on('exit', function (code) { return process.exit(code !== null && code !== void 0 ? code : 0); });
    child.on('error', function (err) {
        process.stderr.write("Failed to start Python (".concat(python, "): ").concat(err.message, "\nInstall Python 3 and ensure it is on PATH, or set SWARM_PYTHON to the interpreter path.\n"));
        process.exit(1);
    });
}
main();
