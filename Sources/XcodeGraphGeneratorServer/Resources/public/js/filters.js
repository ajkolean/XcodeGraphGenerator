// js/filters.js

import { platformColors, productTypeStyles } from './constants.js';

/**
 * Global filter states to track the state of various filters.
 */
let filterStates = {
    productTypes: {},
    platforms: {},
    projects: {},
    packages: {},
    searchQuery: ''
};

/**
 * Setup search functionality with a debouncing mechanism.
 * This limits the rate of filter execution as users type into the search box.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function setupSearch(cy) {
    const searchElement = document.getElementById('search');
    if (searchElement) {
        searchElement.addEventListener('input', debounce(function (e) {
            filterStates.searchQuery = e.target.value.toLowerCase();
            applyFilters(cy);
        }, 300)); // Debounce delay of 300ms
    }
}

/**
 * Debounce function to limit the rate of function execution.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function} - Debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Setup collapsible filters with exclusive behavior, ensuring only one filter is open at a time.
 */
function setupCollapsibleFilters() {
    const coll = document.getElementsByClassName('collapsible');

    // Click listeners for each collapsible filter
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent document-wide click listener from closing the current section

            // Close other open filters
            for (let j = 0; j < coll.length; j++) {
                if (coll[j] !== this) {
                    coll[j].classList.remove('active');
                    let content = coll[j].nextElementSibling;
                    if (content) {
                        content.style.display = 'none';
                    }
                }
            }

            // Toggle the current filter section
            this.classList.toggle('active');
            let content = this.nextElementSibling;
            if (content) {
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        });
    }

    // Close filters when clicking outside the filter section
    document.addEventListener('click', function () {
        for (let i = 0; i < coll.length; i++) {
            coll[i].classList.remove('active');
            let content = coll[i].nextElementSibling;
            if (content) {
                content.style.display = 'none';
            }
        }
    });

    // Prevent clicks inside the filter container from closing the filters
    const filtersContainer = document.querySelector('#filters');
    if (filtersContainer) {
        filtersContainer.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }
}

/**
 * Setup product type filtering. Dynamically generate checkboxes for each product type.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function setupProductTypeFiltering(cy) {
    const productTypeFilterContainer = document.querySelector('#product-type-filter');
    if (!productTypeFilterContainer) return;

    // Collect all unique product types from the graph
    const productTypesSet = new Set(cy.nodes().map(node => node.data('productType')).filter(pt => pt));
    const productTypes = Array.from(productTypesSet).map(type => ({
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        color: productTypeStyles[type]?.dark.fillColor || '#ffffff' // Default to white if no color is found
    }));

    const productList = document.createElement('div');
    productList.className = 'grid';

    // Create a checkbox for each product type
    productTypes.forEach(product => {
        filterStates.productTypes[product.type] = true; // Initialize filter state

        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'product-type-checkbox';
        checkbox.dataset.productType = product.type;
        checkbox.checked = true;
        checkbox.setAttribute('aria-label', `${product.label} filter`);

        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = product.color;

        label.appendChild(checkbox);
        label.appendChild(colorBox);
        label.append(` ${product.label}`);

        productList.appendChild(label);

        // Event listener for checkboxes to toggle product types
        checkbox.addEventListener('change', function () {
            filterStates.productTypes[product.type] = this.checked;
            applyFilters(cy);
        });
    });

    productTypeFilterContainer.appendChild(productList);
}

/**
 * Setup platform filtering with support for both light and dark mode.
 *
 * @param {Object} cy - The Cytoscape instance.
 * @param {string} theme - The current theme ('light' or 'dark').
 */
function setupPlatformFiltering(cy, theme = 'dark') {
    const platformFilterContainer = document.querySelector('#platform-filter');
    if (!platformFilterContainer) return;

    // Get all unique platforms from the graph
    const platformsSet = new Set();
    cy.nodes().forEach(node => {
        const platforms = node.data('platforms') || [];
        platforms.forEach(platform => platformsSet.add(platform));
    });
    const platforms = Array.from(platformsSet).map(platform => ({
        platform,
        label: platform.charAt(0).toUpperCase() + platform.slice(1),
        color: platformColors[platform] ? platformColors[platform][theme] : '#ffffff' // Use theme-specific color
    }));

    const platformList = document.createElement('div');
    platformList.className = 'grid';

    // Create a checkbox for each platform
    platforms.forEach(platform => {
        filterStates.platforms[platform.platform] = true; // Initialize filter state

        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'platform-checkbox';
        checkbox.dataset.platform = platform.platform;
        checkbox.checked = true;
        checkbox.setAttribute('aria-label', `${platform.label} filter`);

        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = platform.color;

        label.appendChild(checkbox);
        label.appendChild(colorBox);
        label.append(` ${platform.label}`);

        platformList.appendChild(label);

        // Event listener for checkboxes to toggle platforms
        checkbox.addEventListener('change', function () {
            filterStates.platforms[platform.platform] = this.checked;
            applyFilters(cy);
        });
    });

    platformFilterContainer.appendChild(platformList);
}

/**
 * Populate the project filter dynamically from the Cytoscape graph data.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function populateProjectFilter(cy) {
    const projectFilterContainer = document.querySelector('#project-filter');
    if (!projectFilterContainer) return;

    const projectNodes = cy.nodes('.projectGroup');
    const projectList = document.createElement('div');
    projectList.className = 'grid';

    // Create a checkbox for each project
    projectNodes.forEach(projectNode => {
        const projectId = projectNode.id();
        const projectLabel = projectNode.data('label');
        const projectColor = projectNode.data('groupColor');

        filterStates.projects[projectId] = true; // Initialize filter state

        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'project-checkbox';
        checkbox.dataset.projectId = projectId;
        checkbox.checked = true;
        checkbox.setAttribute('aria-label', `${projectLabel} project filter`);

        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = projectColor;

        label.appendChild(checkbox);
        label.appendChild(colorBox);
        label.append(` ${projectLabel}`);

        projectList.appendChild(label);

        // Event listener for project checkboxes
        checkbox.addEventListener('change', function () {
            filterStates.projects[projectId] = this.checked;
            applyFilters(cy);
        });
    });

    projectFilterContainer.appendChild(projectList);
}

/**
 * Populate the package filter dynamically from the Cytoscape graph data.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function populatePackageFilter(cy) {
    const packageFilterContainer = document.querySelector('#package-filter');
    const packageFilterContainerBox = document.querySelector('#packages-filter-container');

    if (!packageFilterContainer) return;

    const packageNodes = cy.nodes('.packageGroup');

    // Hide the package filter if no packages exist
    if (packageNodes.length === 0) {
        packageFilterContainerBox.style.display = 'none';
        return;
    }

    packageFilterContainerBox.style.display = 'block'; // Ensure visibility if packages exist

    const packageList = document.createElement('div');
    packageList.className = 'grid';

    // Create a checkbox for each package
    packageNodes.forEach(packageNode => {
        const packageId = packageNode.id();
        const packageLabel = packageNode.data('label');
        const packageColor = packageNode.data('groupColor');

        filterStates.packages[packageId] = true; // Initialize filter state

        const label = document.createElement('label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'package-checkbox';
        checkbox.dataset.packageId = packageId;
        checkbox.checked = true;
        checkbox.setAttribute('aria-label', `${packageLabel} package filter`);

        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = packageColor;

        label.appendChild(checkbox);
        label.appendChild(colorBox);
        label.append(` ${packageLabel}`);

        packageList.appendChild(label);

        // Event listener for package checkboxes
        checkbox.addEventListener('change', function () {
            filterStates.packages[packageId] = this.checked;
            applyFilters(cy);
        });
    });

    packageFilterContainer.appendChild(packageList);
}

/**
 * Apply all active filters to the Cytoscape graph and update visibility of nodes.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function applyFilters(cy) {
    const searchQuery = filterStates.searchQuery;
    const activeProductTypes = filterStates.productTypes;
    const activePlatforms = filterStates.platforms;
    const activeProjects = filterStates.projects;
    const activePackages = filterStates.packages;

    cy.batch(() => {
        cy.nodes().forEach(node => {
            let shouldShow = true;

            // Apply search filter
            const label = node.data('label') || '';
            if (searchQuery && !label.toLowerCase().includes(searchQuery)) {
                shouldShow = false;
            }

            // Apply product type filter
            const productType = node.data('productType');
            if (productType && !activeProductTypes[productType]) {
                shouldShow = false;
            }

            // Apply platform filter
            const platforms = node.data('platforms') || [];
            if (platforms.length > 0) {
                const hasActivePlatform = platforms.some(platform => activePlatforms[platform]);
                if (!hasActivePlatform) {
                    shouldShow = false;
                }
            }

            // Apply group filters (projects and packages)
            const parentId = node.data('parent');
            if (parentId) {
                const parentNode = cy.getElementById(parentId);
                if (parentNode.hasClass('projectGroup') && !activeProjects[parentId]) {
                    shouldShow = false;
                }
                if (parentNode.hasClass('packageGroup') && !activePackages[parentId]) {
                    shouldShow = false;
                }
            }

            // Check group node visibility
            if (node.hasClass('projectGroup') && !activeProjects[node.id()]) {
                shouldShow = false;
            }
            if (node.hasClass('packageGroup') && !activePackages[node.id()]) {
                shouldShow = false;
            }

            // Show or hide the node based on the filters
            if (shouldShow) {
                node.show();
            } else {
                node.hide();
            }
        });

        // Update visibility of parent nodes and edges
        updateParentVisibility(cy);
        updateEdgeVisibility(cy);
    });
}

/**
 * Setup the reset filters button to reset all filters to their default states.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function setupResetFilters(cy) {
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            resetAllFilters(cy);
        });
    }
}

/**
 * Reset all filters to their default (checked) state.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function resetAllFilters(cy) {
    // Reset search query
    const searchElement = document.getElementById('search');
    if (searchElement) {
        searchElement.value = '';
        filterStates.searchQuery = '';
    }

    // Reset Product Types
    Object.keys(filterStates.productTypes).forEach(type => {
        filterStates.productTypes[type] = true;
    });

    // Reset Platforms
    Object.keys(filterStates.platforms).forEach(platform => {
        filterStates.platforms[platform] = true;
    });

    // Reset Projects
    Object.keys(filterStates.projects).forEach(project => {
        filterStates.projects[project] = true;
    });

    // Reset Packages
    Object.keys(filterStates.packages).forEach(pkg => {
        filterStates.packages[pkg] = true;
    });

    // Check all checkboxes in the UI
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });

    applyFilters(cy);
}

/**
 * Update visibility of parent nodes based on the visibility of their children.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function updateParentVisibility(cy) {
    cy.nodes('$node > node').forEach(parent => {
        const visibleChildren = parent.children().some(child => child.visible());
        if (visibleChildren) {
            parent.show();
        } else {
            parent.hide();
        }
    });
}

/**
 * Update the visibility of edges based on the visibility of their source and target nodes.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function updateEdgeVisibility(cy) {
    cy.edges().forEach(edge => {
        const sourceVisible = edge.source().visible();
        const targetVisible = edge.target().visible();
        if (sourceVisible && targetVisible) {
            edge.show();
        } else {
            edge.hide();
        }
    });
}

// Export the filter-related functions and state for external use
export {
    applyFilters,
    filterStates,
    populatePackageFilter,
    populateProjectFilter,
    setupCollapsibleFilters,
    setupPlatformFiltering,
    setupProductTypeFiltering,
    setupResetFilters,
    setupSearch
};
