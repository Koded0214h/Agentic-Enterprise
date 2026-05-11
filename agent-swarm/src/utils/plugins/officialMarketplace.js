"use strict";
/**
 * Constants for the official Anthropic plugins marketplace.
 *
 * The official marketplace is hosted on GitHub and provides first-party
 * plugins developed by Anthropic. This file defines the constants needed
 * to install and identify this marketplace.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFFICIAL_MARKETPLACE_NAME = exports.OFFICIAL_MARKETPLACE_SOURCE = void 0;
/**
 * Source configuration for the official Anthropic plugins marketplace.
 * Used when auto-installing the marketplace on startup.
 */
exports.OFFICIAL_MARKETPLACE_SOURCE = {
    source: 'github',
    repo: 'anthropics/claude-plugins-official',
};
/**
 * Display name for the official marketplace.
 * This is the name under which the marketplace will be registered
 * in the known_marketplaces.json file.
 */
exports.OFFICIAL_MARKETPLACE_NAME = 'claude-plugins-official';
