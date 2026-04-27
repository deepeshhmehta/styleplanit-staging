/**
 * config.js - Global constants and configuration
 */
const CONFIG = {
    DATA_PATH: '/configs/site-data.json',
    
    // UI & Design Tokens (Mirrors variables.css)
    THEME: {
        BREAKPOINTS: {
            TABLET: 1024,
            MOBILE: 768
        },
        ANIMATION: {
            DURATION_FAST: 300,
            DURATION_STANDARD: 400,
            DURATION_SLOW: 600
        },
        SCROLL: {
            PADDING_DESKTOP: 120,
            PADDING_MOBILE: 90,
            MARGIN_VH: -0.1,
            GLOBAL_OFFSET: 40
        }
    },

    SETTINGS: {
        SCROLL_OFFSET: 40 // Legacy compatibility
    }
};
