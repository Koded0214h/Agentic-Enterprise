"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collapseTeammateShutdowns = collapseTeammateShutdowns;
function isTeammateShutdownAttachment(msg) {
    return (msg.type === 'attachment' &&
        msg.attachment.type === 'task_status' &&
        msg.attachment.taskType === 'in_process_teammate' &&
        msg.attachment.status === 'completed');
}
/**
 * Collapses consecutive in-process teammate shutdown task_status attachments
 * into a single `teammate_shutdown_batch` attachment with a count.
 */
function collapseTeammateShutdowns(messages) {
    var result = [];
    var i = 0;
    while (i < messages.length) {
        var msg = messages[i];
        if (isTeammateShutdownAttachment(msg)) {
            var count = 0;
            while (i < messages.length &&
                isTeammateShutdownAttachment(messages[i])) {
                count++;
                i++;
            }
            if (count === 1) {
                result.push(msg);
            }
            else {
                result.push({
                    type: 'attachment',
                    uuid: msg.uuid,
                    timestamp: msg.timestamp,
                    attachment: {
                        type: 'teammate_shutdown_batch',
                        count: count,
                    },
                });
            }
        }
        else {
            result.push(msg);
            i++;
        }
    }
    return result;
}
