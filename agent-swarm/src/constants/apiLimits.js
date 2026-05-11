"use strict";
/**
 * Anthropic API Limits
 *
 * These constants define server-side limits enforced by the Anthropic API.
 * Keep this file dependency-free to prevent circular imports.
 *
 * Last verified: 2025-12-22
 * Source: api/api/schemas/messages/blocks/ and api/api/config.py
 *
 * Future: See issue #13240 for dynamic limits fetching from server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_MAX_MEDIA_PER_REQUEST = exports.PDF_AT_MENTION_INLINE_THRESHOLD = exports.PDF_MAX_PAGES_PER_READ = exports.PDF_MAX_EXTRACT_SIZE = exports.PDF_EXTRACT_SIZE_THRESHOLD = exports.API_PDF_MAX_PAGES = exports.PDF_TARGET_RAW_SIZE = exports.IMAGE_MAX_HEIGHT = exports.IMAGE_MAX_WIDTH = exports.IMAGE_TARGET_RAW_SIZE = exports.API_IMAGE_MAX_BASE64_SIZE = void 0;
// =============================================================================
// IMAGE LIMITS
// =============================================================================
/**
 * Maximum base64-encoded image size (API enforced).
 * The API rejects images where the base64 string length exceeds this value.
 * Note: This is the base64 length, NOT raw bytes. Base64 increases size by ~33%.
 */
exports.API_IMAGE_MAX_BASE64_SIZE = 5 * 1024 * 1024; // 5 MB
/**
 * Target raw image size to stay under base64 limit after encoding.
 * Base64 encoding increases size by 4/3, so we derive the max raw size:
 * raw_size * 4/3 = base64_size → raw_size = base64_size * 3/4
 */
exports.IMAGE_TARGET_RAW_SIZE = (exports.API_IMAGE_MAX_BASE64_SIZE * 3) / 4; // 3.75 MB
/**
 * Client-side maximum dimensions for image resizing.
 *
 * Note: The API internally resizes images larger than 1568px (source:
 * encoding/full_encoding.py), but this is handled server-side and doesn't
 * cause errors. These client-side limits (2000px) are slightly larger to
 * preserve quality when beneficial.
 *
 * The API_IMAGE_MAX_BASE64_SIZE (5MB) is the actual hard limit that causes
 * API errors if exceeded.
 */
exports.IMAGE_MAX_WIDTH = 2000;
exports.IMAGE_MAX_HEIGHT = 2000;
// =============================================================================
// PDF LIMITS
// =============================================================================
/**
 * Maximum raw PDF file size that fits within the API request limit after encoding.
 * The API has a 32MB total request size limit. Base64 encoding increases size by
 * ~33% (4/3), so 20MB raw → ~27MB base64, leaving room for conversation context.
 */
exports.PDF_TARGET_RAW_SIZE = 20 * 1024 * 1024; // 20 MB
/**
 * Maximum number of pages in a PDF accepted by the API.
 */
exports.API_PDF_MAX_PAGES = 100;
/**
 * Size threshold above which PDFs are extracted into page images
 * instead of being sent as base64 document blocks. This applies to
 * first-party API only; non-first-party always uses extraction.
 */
exports.PDF_EXTRACT_SIZE_THRESHOLD = 3 * 1024 * 1024; // 3 MB
/**
 * Maximum PDF file size for the page extraction path. PDFs larger than
 * this are rejected to avoid processing extremely large files.
 */
exports.PDF_MAX_EXTRACT_SIZE = 100 * 1024 * 1024; // 100 MB
/**
 * Max pages the Read tool will extract in a single call with the pages parameter.
 */
exports.PDF_MAX_PAGES_PER_READ = 20;
/**
 * PDFs with more pages than this get the reference treatment on @ mention
 * instead of being inlined into context.
 */
exports.PDF_AT_MENTION_INLINE_THRESHOLD = 10;
// =============================================================================
// MEDIA LIMITS
// =============================================================================
/**
 * Maximum number of media items (images + PDFs) allowed per API request.
 * The API rejects requests exceeding this limit with a confusing error.
 * We validate client-side to provide a clear error message.
 */
exports.API_MAX_MEDIA_PER_REQUEST = 100;
