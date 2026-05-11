"use strict";
/**
 * Search Types - Type definitions for the search module
 * Centralizes all search-related types, options, and result interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEARCH_CONSTANTS = void 0;
/**
 * Constants used across search strategies
 */
exports.SEARCH_CONSTANTS = {
    RECENCY_WINDOW_DAYS: 90,
    RECENCY_WINDOW_MS: 90 * 24 * 60 * 60 * 1000,
    DEFAULT_LIMIT: 20,
    CHROMA_BATCH_SIZE: 100
};
