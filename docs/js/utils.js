// js/utils.js

import { productTypeStyles } from './constants.js';

/**
 * Assigns unique colors to each project and package group.
 * @param {Object} data - The graph data containing nodes.
 */
function assignGroupColors(data) {
    const projectNodes = data.nodes.filter(node => node.classes && node.classes.includes('projectGroup'));
    const packageNodes = data.nodes.filter(node => node.classes && node.classes.includes('packageGroup'));
    const totalGroups = projectNodes.length + packageNodes.length;
    const colors = generateColors(totalGroups);

    let index = 0;
    projectNodes.forEach(projectNode => {
        const color = colors[index++];
        projectNode.data.groupColor = color;
    });

    packageNodes.forEach(packageNode => {
        const color = colors[index++];
        packageNode.data.groupColor = color;
    });
}

/**
 * Generates an array of distinct HSL colors.
 * @param {number} count - Number of colors to generate.
 * @returns {Array} - Array of HSL color strings.
 */
function generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    for (let i = 0; i < count; i++) {
        const hue = i * hueStep;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

/**
 * Returns layout options for Cytoscape, optimizing node separation and component spacing.
 * @returns {Object} - Layout configuration for Cytoscape.
 */
function getLayoutOptions() {
    return {
        name: 'fcose',
        quality: 'proof', // High-quality layout
        nodeSeparation: 700, // Separation to avoid node clustering
        componentSpacing: 120, // Space between disconnected components
        idealEdgeLength: 300, // Edge length to space nodes
        gravity: 1.5, // Gravity factor to control node spacing
        nodeRepulsion: 15000, // Repulsion force to push nodes apart
        edgeElasticity: 0.2, // Elasticity for edges to reduce overlap
        fit: true,
        padding: 60, // Padding around the graph
        nodeDimensionsIncludeLabels: true,
        packComponents: true, // Ensure components are well-distributed
        randomize: false, // Avoid randomizing node positions
        nestingFactor: 0.1, // Control for clustering inside compound nodes
    };
}

/**
 * Returns style options for Cytoscape, dynamically updating based on the current theme.
 * @param {boolean} isDark - Whether the current theme is dark mode.
 * @returns {Array} - Array of style objects for Cytoscape elements.
 */
function getStyleOptions(isDark = true) {
    const theme = isDark ? 'dark' : 'light';

    return [
        {
            selector: 'node',
            style: {
                'background-color': ele => {
                    const productType = ele.data('productType');
                    const style = productTypeStyles[productType] || {};
                    return style[theme]?.fillColor || (isDark ? '#808080' : '#CCCCCC'); // Default node color
                },
                'border-color': ele => {
                    const productType = ele.data('productType');
                    const style = productTypeStyles[productType] || {};
                    return style[theme]?.strokeColor || (isDark ? '#444444' : '#CCCCCC'); // Default border color
                },
                'border-width': ele => {
                    const productType = ele.data('productType');
                    const style = productTypeStyles[productType] || {};
                    return style[theme]?.strokeWidth || 2; // Default border width
                },
                'shape': ele => {
                    const productType = ele.data('productType');
                    const style = productTypeStyles[productType] || {};
                    return style[theme]?.shape || 'ellipse'; // Default shape
                },
                'width': ele => {
                    const productType = ele.data('productType');
                    const style = productTypeStyles[productType] || {};
                    return style[theme]?.size || 50; // Node size
                },
                'height': ele => {
                    const productType = ele.data('productType');
                    const style = productTypeStyles[productType] || {};
                    return style[theme]?.size || 50; // Node size
                },
                'label': 'data(label)', // Use node label data
                'font-size': 10,
                'text-valign': 'center',
                'text-halign': 'center',
                'color': isDark ? '#f0f0f0' : '#000000', // Text color based on theme
                'text-outline-width': 0.5,
                'text-outline-color': isDark ? '#333' : '#f0f0f0', // Text outline for readability
            }
        },
        {
            selector: 'node.projectGroup',
            style: {
                'width': ele => 100 + ele.children().length * 10, // Size based on number of child nodes
                'height': ele => 100 + ele.children().length * 10,
                'background-color': 'data(groupColor)',
                'shape': 'roundrectangle',
                'label': 'data(label)',
                'font-size': 24,
                'text-valign': 'top',
                'text-halign': 'center',
                'background-opacity': 0.2,
                'border-color': 'data(groupColor)',
                'border-width': 2,
                'color': isDark ? '#f0f0f0' : '#000000',
                'text-outline-width': 0.5,
                'padding': 30,
                'text-outline-color': isDark ? '#333' : '#f0f0f0',
            }
        },
        {
            selector: 'node.packageGroup',
            style: {
                'width': ele => 100 + ele.children().length * 10,
                'height': ele => 100 + ele.children().length * 10,
                'background-color': 'data(groupColor)',
                'shape': 'roundrectangle',
                'label': 'data(label)',
                'font-size': 24,
                'text-valign': 'top',
                'text-halign': 'center',
                'background-opacity': 0.2,
                'border-color': 'data(groupColor)',
                'border-width': 2,
                'color': isDark ? '#f0f0f0' : '#000000',
                'text-outline-width': 0.5,
                'padding': 30,
                'text-outline-color': isDark ? '#333' : '#f0f0f0',
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': isDark ? '#666' : '#999', // Edge color
                'target-arrow-color': isDark ? '#666' : '#999', // Arrow color
                'target-arrow-shape': 'triangle', // Arrow shape
                'curve-style': ele => (ele.source().connectedEdges().length + ele.target().connectedEdges().length > 15 ? 'haystack' : 'bezier'),
                'haystack-radius': 0.6, // For haystack edges
                'control-point-step-size': 80,
                'width': 1.5,
                'opacity': 0.7
            }
        },
        {
            selector: ':selected',
            style: {
                'background-color': '#FFD700', // Gold for selected nodes
                'line-color': '#FFD700',
                'target-arrow-color': '#FFD700',
                'source-arrow-color': '#FFD700'
            }
        },
        {
            selector: 'node.highlight',
            style: {
                'border-width': 2,
                'border-color': '#FF4500' // Highlight color
            }
        },
        {
            selector: 'edge.highlight',
            style: {
                'width': 4,
                'line-color': '#FF4500',
                'curve-style': 'bezier',
                'control-point-step-size': 100,
            }
        }
    ];
}

// Export utility functions
export { assignGroupColors, getLayoutOptions, getStyleOptions };
