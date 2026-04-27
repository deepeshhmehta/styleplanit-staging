/**
 * analytics.js - Enhanced centralized Google Analytics tracking logic
 * Provides detailed telemetry for UI/UX improvements and business decisions.
 */
const Analytics = {
    /**
     * Core event tracking wrapper with local debug support
     */
    trackEvent: function(eventName, params = {}) {
        const isProd = window.location.hostname === 'styleplanit.com';
        
        // Enrich params with global context
        const enrichedParams = {
            page_path: window.location.pathname,
            page_title: document.title,
            timestamp: new Date().toISOString(),
            ...params
        };

        if (window.gtag && isProd) {
            gtag('event', eventName, enrichedParams);
        } else {
            // Detailed local logging for validation during development
            console.debug(`[Analytics-Debug] Event: "${eventName}"`, enrichedParams);
        }
    },

    /**
     * Specialized: Track UI Interaction (Clicks, Toggles, etc.)
     * Used for building click "heatmaps" and understanding UI flow.
     */
    trackUI: function(action, section, label, extra = {}) {
        this.trackEvent('ui_interaction', {
            action: action,      // click, toggle, hover, etc.
            section: section,    // hero, packages, footer, etc.
            label: label,        // Button text or element identifier
            ...extra
        });
    },

    /**
     * Specialized: Track Content Engagement (Views, Scrolls, Reads)
     * Helps identify which services or articles are being consumed.
     */
    trackEngagement: function(type, contentName, contentCategory, extra = {}) {
        this.trackEvent('content_engagement', {
            engagement_type: type,   // view, scroll_to_end, read_complete
            content_name: contentName,
            content_category: contentCategory,
            ...extra
        });
    },

    /**
     * Specialized: Track Conversion & Leads
     * Measures business-critical outcomes.
     */
    trackConversion: function(type, source, value = 0, extra = {}) {
        this.trackEvent('generate_lead', {
            lead_type: type,   // booking, whatsapp, inquiry, subscribe
            source: source,    // hero, services_grid, floating_cta
            value: value,      // Optional monetary value or weight
            ...extra
        });
    },

    /* --- Legacy Compatibility Wrappers (Mapped to new system) --- */
    
    trackCategorySwitch: function(categoryName, slug) {
        this.trackEngagement('filter', categoryName, 'service_category', { item_id: slug });
    },

    trackServiceView: function(serviceTitle, serviceSlug, categoryName) {
        this.trackEngagement('view', serviceTitle, categoryName, { item_id: serviceSlug });
    },

    trackLead: function(method, type, extraParams = {}) {
        this.trackConversion(type, method, 0, extraParams);
    },

    trackInteraction: function(type, id, extraParams = {}) {
        // Map old interaction calls to UI or Engagement based on context
        if (type.includes('click') || type.includes('expand')) {
            this.trackUI(type, 'legacy', id, extraParams);
        } else {
            this.trackEngagement(type, id, 'legacy', extraParams);
        }
    },

    trackScrollEnd: function(carouselName) {
        this.trackEngagement('scroll_to_end', carouselName, 'carousel');
    }
};
