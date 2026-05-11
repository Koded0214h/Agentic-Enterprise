"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lspToolInputSchema = void 0;
exports.isValidLSPOperation = isValidLSPOperation;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
/**
 * Discriminated union of all LSP operations
 * Uses 'operation' as the discriminator field
 */
exports.lspToolInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    /**
     * Go to Definition operation
     * Finds the definition location of a symbol at the given position
     */
    var goToDefinitionSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('goToDefinition'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Find References operation
     * Finds all references to a symbol at the given position
     */
    var findReferencesSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('findReferences'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Hover operation
     * Gets hover information (documentation, type info) for a symbol at the given position
     */
    var hoverSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('hover'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Document Symbol operation
     * Gets all symbols (functions, classes, variables) in a document
     */
    var documentSymbolSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('documentSymbol'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Workspace Symbol operation
     * Searches for symbols across the entire workspace
     */
    var workspaceSymbolSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('workspaceSymbol'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Go to Implementation operation
     * Finds the implementation locations of an interface or abstract method
     */
    var goToImplementationSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('goToImplementation'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Prepare Call Hierarchy operation
     * Prepares a call hierarchy item at the given position (first step for call hierarchy)
     */
    var prepareCallHierarchySchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('prepareCallHierarchy'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Incoming Calls operation
     * Finds all functions/methods that call the function at the given position
     */
    var incomingCallsSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('incomingCalls'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    /**
     * Outgoing Calls operation
     * Finds all functions/methods called by the function at the given position
     */
    var outgoingCallsSchema = v4_1.z.strictObject({
        operation: v4_1.z.literal('outgoingCalls'),
        filePath: v4_1.z.string().describe('The absolute or relative path to the file'),
        line: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The line number (1-based, as shown in editors)'),
        character: v4_1.z
            .number()
            .int()
            .positive()
            .describe('The character offset (1-based, as shown in editors)'),
    });
    return v4_1.z.discriminatedUnion('operation', [
        goToDefinitionSchema,
        findReferencesSchema,
        hoverSchema,
        documentSymbolSchema,
        workspaceSymbolSchema,
        goToImplementationSchema,
        prepareCallHierarchySchema,
        incomingCallsSchema,
        outgoingCallsSchema,
    ]);
});
/**
 * Type guard to check if an operation is a valid LSP operation
 */
function isValidLSPOperation(operation) {
    return [
        'goToDefinition',
        'findReferences',
        'hover',
        'documentSymbol',
        'workspaceSymbol',
        'goToImplementation',
        'prepareCallHierarchy',
        'incomingCalls',
        'outgoingCalls',
    ].includes(operation);
}
