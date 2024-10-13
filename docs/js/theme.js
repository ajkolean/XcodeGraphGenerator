// js/theme.js

import { productTypeStyles } from './constants.js';
import { getStyleOptions } from './utils.js';

/**
 * Manages theme toggling between light and dark modes.
 */
class ThemeManager {
    /**
     * Constructs the ThemeManager and sets up the theme toggle functionality.
     * @param {Object} cy - The Cytoscape instance.
     */
    constructor(cy) {
        this.cy = cy;
        this.themeToggleBtn = document.getElementById('theme-toggle');

        // Determine the initial theme based on localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }

        this.applyTheme();

        // Bind click event for theme toggle button
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    /**
     * Applies the current theme to the document and Cytoscape nodes.
     */
    applyTheme() {
        const body = document.body;
        if (this.currentTheme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            this.updateToggleButton('dark');
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            this.updateToggleButton('light');
        }

        this.updateCytoscapeStyles();
        this.updateLegendStyles();

        // Save the current theme to localStorage
        localStorage.setItem('theme', this.currentTheme);
    }

    /**
     * Toggles the theme between light and dark modes.
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
    }

    /**
     * Updates the Cytoscape styles based on the current theme.
     */
    updateCytoscapeStyles() {
        const styleOptions = getStyleOptions(this.currentTheme);
        this.cy.style(styleOptions).update();  // Apply the new styles to the Cytoscape graph
    }

    /**
     * Updates the theme toggle button icon based on the current theme.
     * @param {string} theme - Current theme ('light' or 'dark')
     */
    updateToggleButton(theme) {
        if (!this.themeToggleBtn) return;

        // Clear the existing icon
        this.themeToggleBtn.innerHTML = '';

        if (theme === 'dark') {
            // Moon Icon for Dark Mode
            this.themeToggleBtn.innerHTML = `
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293a8 8 0 11-10.586-10.586 8.001 8.001 0 0010.586 10.586z" />
            </svg>
            `;
        } else {
            // Sun Icon for Light Mode
            this.themeToggleBtn.innerHTML = `
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5" />
                    <g stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="4" />
                        <line x1="12" y1="20" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="4" y2="12" />
                        <line x1="20" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
                    </g>
                </svg>
            `;
        }
    }

    /**
     * Updates the legend styles based on the current theme.
     */
    updateLegendStyles() {
        const productTypesLegend = document.getElementById('product-types-legend');
        if (productTypesLegend) {
            productTypesLegend.innerHTML = ''; // Clear the existing legend

            const productTypesSet = new Set(Object.keys(productTypeStyles));
            const productTypes = Array.from(productTypesSet).sort().map(type => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                color: productTypeStyles[type][this.currentTheme].fillColor || '#ffffff' // Use assigned colors or default to white
            }));

            productTypes.forEach(product => {
                const p = document.createElement('p');
                p.style.margin = '0.5em';
                const colorBox = document.createElement('span');
                colorBox.className = 'legend-color';
                colorBox.style.backgroundColor = product.color;

                p.appendChild(colorBox);
                p.append(` ${product.label}`);

                productTypesLegend.appendChild(p);
            });
        }
    }
}

// Export the ThemeManager class
export { ThemeManager };
