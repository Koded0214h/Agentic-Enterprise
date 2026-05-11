"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAgentType = validateAgentType;
exports.validateAgent = validateAgent;
var agentToolUtils_js_1 = require("../../tools/AgentTool/agentToolUtils.js");
var utils_js_1 = require("./utils.js");
function validateAgentType(agentType) {
    if (!agentType) {
        return 'Agent type is required';
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(agentType)) {
        return 'Agent type must start and end with alphanumeric characters and contain only letters, numbers, and hyphens';
    }
    if (agentType.length < 3) {
        return 'Agent type must be at least 3 characters long';
    }
    if (agentType.length > 50) {
        return 'Agent type must be less than 50 characters';
    }
    return null;
}
function validateAgent(agent, availableTools, existingAgents) {
    var errors = [];
    var warnings = [];
    // Validate agent type
    if (!agent.agentType) {
        errors.push('Agent type is required');
    }
    else {
        var typeError = validateAgentType(agent.agentType);
        if (typeError) {
            errors.push(typeError);
        }
        // Check for duplicates (excluding self for editing)
        var duplicate = existingAgents.find(function (a) { return a.agentType === agent.agentType && a.source !== agent.source; });
        if (duplicate) {
            errors.push("Agent type \"".concat(agent.agentType, "\" already exists in ").concat((0, utils_js_1.getAgentSourceDisplayName)(duplicate.source)));
        }
    }
    // Validate description
    if (!agent.whenToUse) {
        errors.push('Description (description) is required');
    }
    else if (agent.whenToUse.length < 10) {
        warnings.push('Description should be more descriptive (at least 10 characters)');
    }
    else if (agent.whenToUse.length > 5000) {
        warnings.push('Description is very long (over 5000 characters)');
    }
    // Validate tools
    if (agent.tools !== undefined && !Array.isArray(agent.tools)) {
        errors.push('Tools must be an array');
    }
    else {
        if (agent.tools === undefined) {
            warnings.push('Agent has access to all tools');
        }
        else if (agent.tools.length === 0) {
            warnings.push('No tools selected - agent will have very limited capabilities');
        }
        // Check for invalid tools
        var resolvedTools = (0, agentToolUtils_js_1.resolveAgentTools)(agent, availableTools, false);
        if (resolvedTools.invalidTools.length > 0) {
            errors.push("Invalid tools: ".concat(resolvedTools.invalidTools.join(', ')));
        }
    }
    // Validate system prompt
    var systemPrompt = agent.getSystemPrompt();
    if (!systemPrompt) {
        errors.push('System prompt is required');
    }
    else if (systemPrompt.length < 20) {
        errors.push('System prompt is too short (minimum 20 characters)');
    }
    else if (systemPrompt.length > 10000) {
        warnings.push('System prompt is very long (over 10,000 characters)');
    }
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings,
    };
}
