"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateColor = exports.getDefaultCharacters = exports.useStalledAnimation = exports.useShimmerAnimation = exports.SpinnerGlyph = exports.ShimmerChar = exports.GlimmerMessage = exports.FlashingChar = void 0;
var FlashingChar_js_1 = require("./FlashingChar.js");
Object.defineProperty(exports, "FlashingChar", { enumerable: true, get: function () { return FlashingChar_js_1.FlashingChar; } });
var GlimmerMessage_js_1 = require("./GlimmerMessage.js");
Object.defineProperty(exports, "GlimmerMessage", { enumerable: true, get: function () { return GlimmerMessage_js_1.GlimmerMessage; } });
var ShimmerChar_js_1 = require("./ShimmerChar.js");
Object.defineProperty(exports, "ShimmerChar", { enumerable: true, get: function () { return ShimmerChar_js_1.ShimmerChar; } });
var SpinnerGlyph_js_1 = require("./SpinnerGlyph.js");
Object.defineProperty(exports, "SpinnerGlyph", { enumerable: true, get: function () { return SpinnerGlyph_js_1.SpinnerGlyph; } });
var useShimmerAnimation_js_1 = require("./useShimmerAnimation.js");
Object.defineProperty(exports, "useShimmerAnimation", { enumerable: true, get: function () { return useShimmerAnimation_js_1.useShimmerAnimation; } });
var useStalledAnimation_js_1 = require("./useStalledAnimation.js");
Object.defineProperty(exports, "useStalledAnimation", { enumerable: true, get: function () { return useStalledAnimation_js_1.useStalledAnimation; } });
var utils_js_1 = require("./utils.js");
Object.defineProperty(exports, "getDefaultCharacters", { enumerable: true, get: function () { return utils_js_1.getDefaultCharacters; } });
Object.defineProperty(exports, "interpolateColor", { enumerable: true, get: function () { return utils_js_1.interpolateColor; } });
// Teammate components are NOT exported here - use dynamic require() to enable dead code elimination
// See REPL.tsx and Spinner.tsx for the correct import pattern
