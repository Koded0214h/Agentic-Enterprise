"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGeneratedFile = isGeneratedFile;
exports.filterGeneratedFiles = filterGeneratedFiles;
var path_1 = require("path");
/**
 * File patterns that should be excluded from attribution.
 * Based on GitHub Linguist vendored patterns and common generated file patterns.
 */
// Exact file name matches (case-insensitive)
var EXCLUDED_FILENAMES = new Set([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    'bun.lock',
    'composer.lock',
    'gemfile.lock',
    'cargo.lock',
    'poetry.lock',
    'pipfile.lock',
    'shrinkwrap.json',
    'npm-shrinkwrap.json',
]);
// File extension patterns (case-insensitive)
var EXCLUDED_EXTENSIONS = new Set([
    '.lock',
    '.min.js',
    '.min.css',
    '.min.html',
    '.bundle.js',
    '.bundle.css',
    '.generated.ts',
    '.generated.js',
    '.d.ts', // TypeScript declaration files
]);
// Directory patterns that indicate generated/vendored content
var EXCLUDED_DIRECTORIES = [
    '/dist/',
    '/build/',
    '/out/',
    '/output/',
    '/node_modules/',
    '/vendor/',
    '/vendored/',
    '/third_party/',
    '/third-party/',
    '/external/',
    '/.next/',
    '/.nuxt/',
    '/.svelte-kit/',
    '/coverage/',
    '/__pycache__/',
    '/.tox/',
    '/venv/',
    '/.venv/',
    '/target/release/',
    '/target/debug/',
];
// Filename patterns using regex for more complex matching
var EXCLUDED_FILENAME_PATTERNS = [
    /^.*\.min\.[a-z]+$/i, // *.min.*
    /^.*-min\.[a-z]+$/i, // *-min.*
    /^.*\.bundle\.[a-z]+$/i, // *.bundle.*
    /^.*\.generated\.[a-z]+$/i, // *.generated.*
    /^.*\.gen\.[a-z]+$/i, // *.gen.*
    /^.*\.auto\.[a-z]+$/i, // *.auto.*
    /^.*_generated\.[a-z]+$/i, // *_generated.*
    /^.*_gen\.[a-z]+$/i, // *_gen.*
    /^.*\.pb\.(go|js|ts|py|rb)$/i, // Protocol buffer generated files
    /^.*_pb2?\.py$/i, // Python protobuf files
    /^.*\.pb\.h$/i, // C++ protobuf headers
    /^.*\.grpc\.[a-z]+$/i, // gRPC generated files
    /^.*\.swagger\.[a-z]+$/i, // Swagger generated files
    /^.*\.openapi\.[a-z]+$/i, // OpenAPI generated files
];
/**
 * Check if a file should be excluded from attribution based on Linguist-style rules.
 *
 * @param filePath - Relative file path from repository root
 * @returns true if the file should be excluded from attribution
 */
function isGeneratedFile(filePath) {
    // Normalize path separators for consistent pattern matching (patterns use posix-style /)
    var normalizedPath = path_1.posix.sep + filePath.split(path_1.sep).join(path_1.posix.sep).replace(/^\/+/, '');
    var fileName = (0, path_1.basename)(filePath).toLowerCase();
    var ext = (0, path_1.extname)(filePath).toLowerCase();
    // Check exact filename matches
    if (EXCLUDED_FILENAMES.has(fileName)) {
        return true;
    }
    // Check extension matches
    if (EXCLUDED_EXTENSIONS.has(ext)) {
        return true;
    }
    // Check for compound extensions like .min.js
    var parts = fileName.split('.');
    if (parts.length > 2) {
        var compoundExt = '.' + parts.slice(-2).join('.');
        if (EXCLUDED_EXTENSIONS.has(compoundExt)) {
            return true;
        }
    }
    // Check directory patterns
    for (var _i = 0, EXCLUDED_DIRECTORIES_1 = EXCLUDED_DIRECTORIES; _i < EXCLUDED_DIRECTORIES_1.length; _i++) {
        var dir = EXCLUDED_DIRECTORIES_1[_i];
        if (normalizedPath.includes(dir)) {
            return true;
        }
    }
    // Check filename patterns
    for (var _a = 0, EXCLUDED_FILENAME_PATTERNS_1 = EXCLUDED_FILENAME_PATTERNS; _a < EXCLUDED_FILENAME_PATTERNS_1.length; _a++) {
        var pattern = EXCLUDED_FILENAME_PATTERNS_1[_a];
        if (pattern.test(fileName)) {
            return true;
        }
    }
    return false;
}
/**
 * Filter a list of files to exclude generated files.
 *
 * @param files - Array of file paths
 * @returns Array of files that are not generated
 */
function filterGeneratedFiles(files) {
    return files.filter(function (file) { return !isGeneratedFile(file); });
}
