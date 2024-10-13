// js/eventHandlers.js

/**
 * Setup event handlers for Cytoscape interactions.
 * This function handles displaying node metadata, highlighting nodes and their neighbors,
 * and clearing node info when clicking on the background.
 *
 * @param {Object} cy - The Cytoscape instance.
 */
function setupEventHandlers(cy) {
    cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        const label = node.data('label') || '';
        const nodeType = node.data('nodeType') || '';
        const platforms = node.data('platforms') || [];
        const metadata = node.data('metadata') || [];

        const orderedMetadata = [
            { key: 'Name', value: label },
            { key: 'Type', value: nodeType.charAt(0).toUpperCase() + nodeType.slice(1) },
            { key: 'Platforms', value: platforms.join(', ') }
        ];

        metadata.forEach(item => {
            orderedMetadata.push({ key: item.key, value: item.value });
        });

        // Build content string in the desired order
        let content = '';
        orderedMetadata.forEach(item => {
            if (item.value) {
                content += `<p><strong>${item.key || 'Metadata'}:</strong> ${item.value}</p>`;
            }
        });


        // Insert content into node details panel
        document.getElementById('node-details').innerHTML = content;
    });

    // Highlight the clicked node and its neighborhood
    cy.on('tap', 'node', function (evt) {
        cy.elements().removeClass('highlight');  // Remove highlights from all elements
        const node = evt.target;
        node.addClass('highlight');  // Highlight the clicked node
        node.neighborhood().addClass('highlight');  // Highlight neighboring nodes and edges
    });

    // Clear highlights and node details when clicking on the background
    cy.on('tap', function (evt) {
        if (evt.target === cy) {  // Check if the background was clicked
            cy.elements().removeClass('highlight');  // Remove all highlights
            document.getElementById('node-details').innerHTML = '';  // Clear node details
        }
    });
}

/**
 * Adds event listeners for resizing the node info panel.
 * The user can click and drag the resize handle to adjust the width of the node details panel.
 */
function setupResizableNodeInfo() {
    const nodeInfo = document.getElementById('node-info');
    const resizeHandle = document.getElementById('resize-handle');
    let isResizing = false;

    // Start resizing when the user presses the mouse button on the resize handle
    resizeHandle.addEventListener('mousedown', function () {
        isResizing = true;
        document.body.style.cursor = 'ew-resize';  // Change cursor to indicate resizing
    });

    // Resize the node info panel as the mouse moves
    document.addEventListener('mousemove', function (e) {
        if (!isResizing) return;  // Do nothing if resizing is not active

        // Calculate the new width for the node info panel
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 600) {  // Set minimum and maximum width limits
            nodeInfo.style.width = `${newWidth}px`;
            document.getElementById('cy').style.right = `${newWidth}px`;  // Adjust the graph container accordingly
        }
    });

    // Stop resizing when the user releases the mouse button
    document.addEventListener('mouseup', function () {
        isResizing = false;
        document.body.style.cursor = 'default';  // Reset the cursor to default
    });
}

// Export the functions for use in other modules
export { setupEventHandlers, setupResizableNodeInfo };
