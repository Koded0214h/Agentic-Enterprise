"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIdeConnectionStatus = useIdeConnectionStatus;
var react_1 = require("react");
function useIdeConnectionStatus(mcpClients) {
    return (0, react_1.useMemo)(function () {
        var ideClient = mcpClients === null || mcpClients === void 0 ? void 0 : mcpClients.find(function (client) { return client.name === 'ide'; });
        if (!ideClient) {
            return { status: null, ideName: null };
        }
        // Extract IDE name from config if available
        var config = ideClient.config;
        var ideName = config.type === 'sse-ide' || config.type === 'ws-ide'
            ? config.ideName
            : null;
        if (ideClient.type === 'connected') {
            return { status: 'connected', ideName: ideName };
        }
        if (ideClient.type === 'pending') {
            return { status: 'pending', ideName: ideName };
        }
        return { status: 'disconnected', ideName: ideName };
    }, [mcpClients]);
}
