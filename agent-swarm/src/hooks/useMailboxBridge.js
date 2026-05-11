"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMailboxBridge = useMailboxBridge;
var react_1 = require("react");
var mailbox_js_1 = require("../context/mailbox.js");
function useMailboxBridge(_a) {
    var isLoading = _a.isLoading, onSubmitMessage = _a.onSubmitMessage;
    var mailbox = (0, mailbox_js_1.useMailbox)();
    var subscribe = (0, react_1.useMemo)(function () { return mailbox.subscribe.bind(mailbox); }, [mailbox]);
    var getSnapshot = (0, react_1.useCallback)(function () { return mailbox.revision; }, [mailbox]);
    var revision = (0, react_1.useSyncExternalStore)(subscribe, getSnapshot);
    (0, react_1.useEffect)(function () {
        if (isLoading)
            return;
        var msg = mailbox.poll();
        if (msg)
            onSubmitMessage(msg.content);
    }, [isLoading, revision, mailbox, onSubmitMessage]);
}
