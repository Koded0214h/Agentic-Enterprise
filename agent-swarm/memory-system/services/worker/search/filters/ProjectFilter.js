"use strict";
/**
 * ProjectFilter - Project scoping for search results
 *
 * Provides utilities for filtering search results by project.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentProject = getCurrentProject;
exports.normalizeProject = normalizeProject;
exports.matchesProject = matchesProject;
exports.filterResultsByProject = filterResultsByProject;
var path_1 = require("path");
/**
 * Get the current project name from cwd
 */
function getCurrentProject() {
    return (0, path_1.basename)(process.cwd());
}
/**
 * Normalize project name for filtering
 */
function normalizeProject(project) {
    if (!project) {
        return undefined;
    }
    // Remove leading/trailing whitespace
    var trimmed = project.trim();
    if (!trimmed) {
        return undefined;
    }
    return trimmed;
}
/**
 * Check if a result matches the project filter
 */
function matchesProject(resultProject, filterProject) {
    if (!filterProject) {
        return true;
    }
    return resultProject === filterProject;
}
/**
 * Filter results by project
 */
function filterResultsByProject(results, project) {
    if (!project) {
        return results;
    }
    return results.filter(function (result) { return matchesProject(result.project, project); });
}
