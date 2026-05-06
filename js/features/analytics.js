/**
 * analytics.js - Enhanced centralized Google Analytics tracking logic
 * Provides detailed telemetry for UI/UX improvements and business decisions.
 */
const Analytics = {
    // Session state for attribution
    session: {
        last_promo: 'none',
        entry_page: window.location.pathname
    },

    /**
     * Safely initialize session data
     */
    init: function() {
        try {
            this.session.last_promo = localStorage.getItem('last_promo_id') || 'none';
            
            if (!sessionStorage.getItem('entry_page')) {
                sessionStorage.setItem('entry_page', window.location.pathname);
            }
            this.session.entry_page = sessionStorage.getItem('entry_page');
        } catch (e) {
            console.warn('[Analytics] Storage access failed, using volatile session state.', e);
        }
    },

    /**
     * Core event tracking wrapper with local debug support
     */
    trackEvent: function(eventName, params = {}) {
        const isProd = window.location.hostname === 'styleplanit.com';
        
        // Enrich params with global and session context
        const enrichedParams = {
            page_path: window.location.pathname,
            page_title: document.title,
            timestamp: new Date().toISOString(),
            attribution_promo: this.session.last_promo,
            entry_page: this.session.entry_page,
            ...params
        };

        if (window.gtag && isProd) {
            gtag('event', eventName, enrichedParams);
        } else {
            console.debug(`[Analytics-Debug] Event: "${eventName}"`, enrichedParams);
        }
    },

    /**
     * Track Funnel Progression (The Middle of the Journey)
     */
    trackFunnel: function(step_index, step_name, label, extra = {}) {
        this.trackEvent('funnel_step', {
            step_index: step_index, // 1: Select Journey, 2: View Details, 3: Initiate Lead
            step_name: step_name,
            label: label,
            ...extra
        });
    },

    /**
     * Track Outbound Clicks (Unified External Influence)
     */
    trackOutbound: function(type, label, destination) {
        let domain = 'unknown';
        try { domain = new URL(destination).hostname; } catch(e) {}

        this.trackEvent('outbound_click', {
            link_type: type, // shop, social, booking, whatsapp
            link_label: label,
            destination_url: destination,
            destination_domain: domain
        });
    },

    /**
     * Specialized: Track UI Interaction (Clicks, Toggles, etc.)
     */
    trackUI: function(action, section, label, extra = {}) {
        this.trackEvent('ui_interaction', {
            action: action,
            section: section,
            label: label,
            ...extra
        });
    },

    /**
     * Specialized: Track Content Engagement (Views, Scrolls, Reads)
     */
    trackEngagement: function(type, contentName, contentCategory, extra = {}) {
        this.trackEvent('content_engagement', {
            engagement_type: type,
            content_name: contentName,
            content_category: contentCategory,
            ...extra
        });
    },

    /**
     * Specialized: Track Conversion & Leads
     */
    trackConversion: function(type, source, value = 0, extra = {}) {
        this.trackEvent('generate_lead', {
            lead_type: type,
            source: source,
            value: value,
            ...extra
        });
    },

    /**
     * Set the current promo for session-level attribution
     */
    setAttribution: function(promoId) {
        this.session.last_promo = promoId;
        try {
            localStorage.setItem('last_promo_id', promoId);
        } catch (e) {}
    }
};

// Initialize Analytics
Analytics.init();
