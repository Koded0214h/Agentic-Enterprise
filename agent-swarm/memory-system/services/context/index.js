"use strict";
/**
 * Context Module - Public API
 *
 * Re-exports the main context generation functionality.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriorSessionMessages = exports.buildTimeline = exports.querySummaries = exports.queryObservations = exports.calculateObservationTokens = exports.calculateTokenEconomics = exports.loadContextConfig = exports.generateContext = void 0;
var ContextBuilder_js_1 = require("./ContextBuilder.js");
Object.defineProperty(exports, "generateContext", { enumerable: true, get: function () { return ContextBuilder_js_1.generateContext; } });
// Component exports for advanced usage
var ContextConfigLoader_js_1 = require("./ContextConfigLoader.js");
Object.defineProperty(exports, "loadContextConfig", { enumerable: true, get: function () { return ContextConfigLoader_js_1.loadContextConfig; } });
var TokenCalculator_js_1 = require("./TokenCalculator.js");
Object.defineProperty(exports, "calculateTokenEconomics", { enumerable: true, get: function () { return TokenCalculator_js_1.calculateTokenEconomics; } });
Object.defineProperty(exports, "calculateObservationTokens", { enumerable: true, get: function () { return TokenCalculator_js_1.calculateObservationTokens; } });
var ObservationCompiler_js_1 = require("./ObservationCompiler.js");
Object.defineProperty(exports, "queryObservations", { enumerable: true, get: function () { return ObservationCompiler_js_1.queryObservations; } });
Object.defineProperty(exports, "querySummaries", { enumerable: true, get: function () { return ObservationCompiler_js_1.querySummaries; } });
Object.defineProperty(exports, "buildTimeline", { enumerable: true, get: function () { return ObservationCompiler_js_1.buildTimeline; } });
Object.defineProperty(exports, "getPriorSessionMessages", { enumerable: true, get: function () { return ObservationCompiler_js_1.getPriorSessionMessages; } });
