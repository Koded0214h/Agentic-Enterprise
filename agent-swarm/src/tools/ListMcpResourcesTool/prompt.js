"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT = exports.DESCRIPTION = exports.LIST_MCP_RESOURCES_TOOL_NAME = void 0;
exports.LIST_MCP_RESOURCES_TOOL_NAME = 'ListMcpResourcesTool';
exports.DESCRIPTION = "\nLists available resources from configured MCP servers.\nEach resource object includes a 'server' field indicating which server it's from.\n\nUsage examples:\n- List all resources from all servers: `listMcpResources`\n- List resources from a specific server: `listMcpResources({ server: \"myserver\" })`\n";
exports.PROMPT = "\nList available resources from configured MCP servers.\nEach returned resource will include all standard MCP resource fields plus a 'server' field \nindicating which server the resource belongs to.\n\nParameters:\n- server (optional): The name of a specific MCP server to get resources from. If not provided,\n  resources from all servers will be returned.\n";
