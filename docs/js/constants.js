// js/constants.js

/**
 * Platform color definitions for light and dark mode.
 * Each platform is represented by a color for both light and dark modes.
 */
const platformColors = {
    ios: {
        light: '#007aff',        // Bright blue (iOS branding)
        dark: '#1a73e8'          // Slightly darker blue for dark mode
    },
    macos: {
        light: '#ff9500',        // Warm orange for MacOS
        dark: '#ff8c00'          // Darker orange for dark mode
    },
    tvos: {
        light: '#af52de',        // Vibrant purple for tvOS
        dark: '#8b44c4'          // Darker purple for dark mode
    },
    watchos: {
        light: '#ffcc00',        // Bright yellow for watchOS
        dark: '#ffaa00'          // Darker yellow for dark mode
    },
    visionos: {
        light: '#34c759',        // Bright green for visionOS
        dark: '#28a745'          // Darker green for dark mode
    }
};

/**
 * Stroke colors for light and dark mode.
 */
const strokeColors = {
    light: '#000000', // Black strokes for light mode
    dark: '#ffffff'   // White strokes for dark mode
};

/**
 * Defines styles for product types.
 * Each product type has a distinct fill color, stroke color, shape, and size for both light and dark modes.
 */
const productTypeStyles = {
    // Applications (Distinct red color, star shape)
    app: {
        light: { fillColor: '#ff6347', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'star', size: 50 },
        dark: { fillColor: '#ff4500', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'star', size: 50 }
    },
    appClip: {
        light: { fillColor: '#ff4500', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'star', size: 50 },
        dark: { fillColor: '#ff6347', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'star', size: 50 }
    },

    // Extensions (Various types, ellipse shape)
    appExtension: {
        light: { fillColor: '#9370db', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'ellipse', size: 50 },
        dark: { fillColor: '#8a2be2', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'ellipse', size: 50 }
    },
    watch2Extension: {
        light: { fillColor: '#9370db', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'ellipse', size: 50 },
        dark: { fillColor: '#8a2be2', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'ellipse', size: 50 }
    },
    // Additional extension types...
    messagesExtension: {
        light: { fillColor: '#32cd32', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'hexagon', size: 50 },
        dark: { fillColor: '#00ff7f', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'hexagon', size: 50 }
    },

    // Libraries and Frameworks (Same color, different shapes)
    staticLibrary: {
        light: { fillColor: '#00bfff', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'rectangle', size: 50 },
        dark: { fillColor: '#1e90ff', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'rectangle', size: 50 }
    },
    dynamicLibrary: {
        light: { fillColor: '#ffd700', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'diamond', size: 50 },
        dark: { fillColor: '#daa520', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'diamond', size: 50 }
    },
    framework: {
        light: { fillColor: '#ffd700', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'triangle', size: 50 },
        dark: { fillColor: '#daa520', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'triangle', size: 50 }
    },
    staticFramework: {
        light: { fillColor: '#00bfff', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'pentagon', size: 50 },
        dark: { fillColor: '#1e90ff', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'pentagon', size: 50 }
    },

    // Bundles and Packages
    bundle: {
        light: { fillColor: '#f0f8ff', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'hexagon', size: 50 },
        dark: { fillColor: '#4682b4', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'hexagon', size: 50 }
    },
    package: {
        light: { fillColor: '#ff4500', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'star', size: 50 },
        dark: { fillColor: '#ff6347', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'star', size: 50 }
    },

    // Testing (Octagon shape)
    unitTests: {
        light: { fillColor: '#32cd32', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'octagon', size: 50 },
        dark: { fillColor: '#228b22', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'octagon', size: 50 }
    },
    uiTests: {
        light: { fillColor: '#32cd32', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'octagon', size: 50 },
        dark: { fillColor: '#228b22', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'octagon', size: 50 }
    },

    // Tools and Utilities
    commandLineTool: {
        light: { fillColor: '#ff7f50', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'triangle', size: 50 },
        dark: { fillColor: '#ff6347', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'triangle', size: 50 }
    },
    xpc: {
        light: { fillColor: '#800080', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'pentagon', size: 50 },
        dark: { fillColor: '#4b0082', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'pentagon', size: 50 }
    },
    systemExtension: {
        light: { fillColor: '#696969', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'diamond', size: 50 },
        dark: { fillColor: '#2f4f4f', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'diamond', size: 50 }
    },

    // Macros
    macro: {
        light: { fillColor: '#808080', strokeColor: strokeColors.light, strokeWidth: 2, shape: 'diamond', size: 50 },
        dark: { fillColor: '#a9a9a9', strokeColor: strokeColors.dark, strokeWidth: 2, shape: 'diamond', size: 50 }
    }
};

// Export the constants for use in other JavaScript modules
export { platformColors, productTypeStyles, strokeColors };
