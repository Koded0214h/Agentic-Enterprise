"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidImagePaste = isValidImagePaste;
exports.getImagePasteIds = getImagePasteIds;
/**
 * Type guard for image PastedContent with non-empty data. Empty-content
 * images (e.g. from a 0-byte file drag) yield empty base64 strings that
 * the API rejects with `image cannot be empty`. Use this at every site
 * that converts PastedContent → ImageBlockParam so the filter and the
 * ID list stay in sync.
 */
function isValidImagePaste(c) {
    return c.type === 'image' && c.content.length > 0;
}
/** Extract image paste IDs from a QueuedCommand's pastedContents. */
function getImagePasteIds(pastedContents) {
    if (!pastedContents) {
        return undefined;
    }
    var ids = Object.values(pastedContents)
        .filter(isValidImagePaste)
        .map(function (c) { return c.id; });
    return ids.length > 0 ? ids : undefined;
}
