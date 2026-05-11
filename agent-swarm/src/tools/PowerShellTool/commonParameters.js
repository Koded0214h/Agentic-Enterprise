"use strict";
/**
 * PowerShell Common Parameters (available on all cmdlets via [CmdletBinding()]).
 * Source: about_CommonParameters (PowerShell docs) + Get-Command output.
 *
 * Shared between pathValidation.ts (merges into per-cmdlet known-param sets)
 * and readOnlyValidation.ts (merges into safeFlags check). Split out to break
 * what would otherwise be an import cycle between those two files.
 *
 * Stored lowercase with leading dash — callers `.toLowerCase()` their input.
 */
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
exports.COMMON_PARAMETERS = exports.COMMON_VALUE_PARAMS = exports.COMMON_SWITCHES = void 0;
exports.COMMON_SWITCHES = ['-verbose', '-debug'];
exports.COMMON_VALUE_PARAMS = [
    '-erroraction',
    '-warningaction',
    '-informationaction',
    '-progressaction',
    '-errorvariable',
    '-warningvariable',
    '-informationvariable',
    '-outvariable',
    '-outbuffer',
    '-pipelinevariable',
];
exports.COMMON_PARAMETERS = new Set(__spreadArray(__spreadArray([], exports.COMMON_SWITCHES, true), exports.COMMON_VALUE_PARAMS, true));
