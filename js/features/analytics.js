/**
 * analytics.js - Centralized Google Analytics tracking logic
 */
const Analytics = {
    /**
     * Core event tracking wrapper
     */
    trackEvent: function(eventName, params = {}) {
        const isProd = window.location.hostname === 'styleplanit.com';
        if (window.gtag && isProd) {
            gtag('event', eventName, params);
        } else if (!isProd) {
            // Silently suppress in non-prod to keep console clean, or use console.debug
            // console.debug(`[Analytics-Sim] Event "${eventName}":`, params);
        } else {
            console.debug(`[Analytics] gtag not found. Event "${eventName}" would have been sent:`, params);
        }
    },

    /**
     * Track user switching between service categories
     */
    trackCategorySwitch: function(categoryName, slug) {
        this.trackEvent('select_content', {
            content_type: 'service_category',
            item_id: slug,
            category_name: categoryName
        });
    },

    /**
     * Track user viewing specific service details
     */
    trackServiceView: function(serviceTitle, serviceSlug, categoryName) {
        this.trackEvent('view_item', {
            item_id: serviceSlug,
            item_name: serviceTitle,
            item_category: categoryName
        });
    },

    /**
     * Track lead generation events (Inquiry, Booking, WhatsApp, Newsletter)
     */
    trackLead: function(method, type, extraParams = {}) {
        this.trackEvent('generate_lead', {
            method: method,
            content_type: type,
            ...extraParams
        });
    },

    /**
     * Track general content interactions
     */
    trackInteraction: function(type, id, extraParams = {}) {
        this.trackEvent('select_content', {
            content_type: type,
            item_id: id,
            ...extraParams
        });
    },

    /**
     * Track when a user reaches a specific depth or end of a carousel
     */
    trackScrollEnd: function(carouselName) {
        this.trackEvent('scroll_to_end', {
            content_type: carouselName
        });
    }
};
