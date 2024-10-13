import {
    setupEventHandlers,
    setupResizableNodeInfo
} from './eventHandlers.js';

import {
    populatePackageFilter,
    populateProjectFilter,
    setupCollapsibleFilters,
    setupPlatformFiltering,
    setupProductTypeFiltering,
    setupResetFilters,
    setupSearch
} from './filters.js';

import { ThemeManager } from './theme.js';
import {
    assignGroupColors,
    getLayoutOptions,
    getStyleOptions
} from './utils.js';

/**
 * Initialize Cytoscape with provided graph data.
 * @param {Object} data - The graph data containing nodes and edges.
 * @returns {Object} - The Cytoscape instance.
 */
function initializeCytoscape(data) {
    // Assign colors to project and package groups
    assignGroupColors(data);

    const elements = data.nodes.concat(data.edges);

    const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        layout: getLayoutOptions(),
        style: getStyleOptions()
    });

    // Manage themes and Cytoscape styles
    const themeManager = new ThemeManager(cy);

    // Initialize filters and event handlers
    setupCollapsibleFilters();
    setupSearch(cy);
    setupProductTypeFiltering(cy);
    setupPlatformFiltering(cy);
    populateProjectFilter(cy);
    populatePackageFilter(cy);
    setupResizableNodeInfo();
    setupEventHandlers(cy);
    setupResetFilters(cy);

    return cy;
}

/**
 * Fetch graph data and initialize Cytoscape when the DOM content is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    fetch('./js/graph.json')
        .then(response => response.json())
        .then(data => {
            initializeCytoscape(data);
        })
        .catch(error => console.error('Error fetching graph data:', error));
});

/**
 * Toggle between light and dark themes.
 */
document.getElementById('theme-toggle').addEventListener('click', function () {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    this.setAttribute('aria-pressed', isDarkMode);

    // Reapply styles to the Cytoscape instance if theme changes
    const cy = window.cy;
    if (cy) {
        cy.style = getStyleOptions(isDarkMode);
    }
});
