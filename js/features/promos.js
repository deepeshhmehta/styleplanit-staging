/**
 * promos.js - Unified Promotion System
 * Supports: Inline cards, floating toasts, and full-screen modals.
 */
const PromosFeature = {
    // Shared configuration
    CONFIG: {
        FADE_DURATION: 400,
        DEFAULT_WAIT: 5000,
        STAGGER_OFFSET: 20
    },

    init: async function () {
        const masterData = await Data.loadMasterData();
        const promos = masterData.dialogs || [];
        
        if (promos.length === 0) return;

        promos.forEach((config, index) => {
            this.handlePromotion(config, index);
        });
    },

    handlePromotion: function (config, index) {
        const type = config.type || 'toast'; 
        const promoId = config.id || `promo-${index}`;
        
        // Expiry Logic: Skip if current date is past expiryDate
        if (config.expiryDate) {
            const now = new Date();
            const expiry = new Date(config.expiryDate);
            if (now > expiry) return;
        }

        // Fix: Use URI encoding + btoa to support emojis/Unicode in storage keys
        const safeTitle = encodeURIComponent(config.title || promoId);
        const storageKey = `dismissed_promo_${btoa(safeTitle).substring(0, 10)}`;
        const isPersistable = String(config.persist).toUpperCase() === 'TRUE';

        // Check if user has already dismissed this specific promo
        if (sessionStorage.getItem(storageKey)) {
            // If dismissed but persistable, show the trigger icon immediately instead of the modal
            if (isPersistable && type === 'modal') {
                this.showPromoTrigger(config);
            }
            return;
        }

        const inlineContainer = $(`[data-promo-container="${promoId}"]`);
        
        if (inlineContainer.length > 0) {
            this.renderInline(inlineContainer, config);
        } else if (type === 'modal') {
            this.scheduleModal(config, storageKey, index);
        } else if (type === 'toast' || type === 'floating') {
            this.scheduleFloating(config, storageKey, index);
        }
    },

    renderInline: function (container, config) {
        const html = this.generatePromoHtml(config, 'inline');
        container.hide().html(html).fadeIn(this.CONFIG.FADE_DURATION);
        this.bindEvents(container, config, null);
        Analytics.trackEngagement('view', config.title || 'inline-promo', 'promotion', { type: 'inline' });
    },

    scheduleModal: function (config, storageKey, index) {
        const waitTime = (parseInt(config.timeInSeconds) || 5) * 1000;
        setTimeout(() => this.renderModal(config, storageKey, index), waitTime);
    },

    renderModal: function (config, storageKey, index) {
        const promoId = `modal-promo-${index}`;
        if ($(`#${promoId}`).length > 0) return;

        // Add Backdrop
        if ($('.promo-backdrop').length === 0) {
            $('body').append('<div class="promo-backdrop"></div>');
        }
        const backdrop = $('.promo-backdrop');

        // Add Modal Card
        const html = this.generatePromoHtml(config, 'modal', promoId);
        $('body').append(html);

        const el = $(`#${promoId}`);

        // Animate in
        setTimeout(() => {
            backdrop.addClass('visible');
            el.addClass('visible');
            // Disable scrolling while modal is active
            $('body').css('overflow', 'hidden');
        }, 100);

        this.bindEvents(el, config, storageKey, backdrop);
        Analytics.trackEngagement('view', config.title || 'modal-promo', 'promotion', { type: 'modal' });
    },

    scheduleFloating: function (config, storageKey, index) {
        const waitTime = (parseInt(config.timeInSeconds) || 5) * 1000;
        setTimeout(() => this.renderFloating(config, storageKey, index), waitTime);
    },

    renderFloating: function (config, storageKey, index) {
        const promoId = `floating-promo-${index}`;
        if ($(`#${promoId}`).length > 0) return;

        const html = this.generatePromoHtml(config, 'floating', promoId);
        $('body').append(html);

        const el = $(`#${promoId}`);
        const bottomOffset = 30 + (index * this.CONFIG.STAGGER_OFFSET);
        const leftOffset = 30 + (index * this.CONFIG.STAGGER_OFFSET);
        
        el.css({
            'bottom': `${bottomOffset}px`,
            'left': `${leftOffset}px`,
            'z-index': 1000 + index
        });

        setTimeout(() => el.addClass('visible'), 100);
        this.bindEvents(el, config, storageKey);
        Analytics.trackEngagement('view', config.title || 'floating-promo', 'promotion', { type: 'floating' });
    },

    generatePromoHtml: function (config, mode, id = '') {
        const hasImage = config.image_url || config.imageUrl;
        const bgStyle = hasImage ? `style="background-image: url('${hasImage}')"` : '';
        const isDismissable = mode !== 'inline';

        // Fix: Append subtitle as notes to the booking URL
        let finalAction = config.action || '#';
        if (config.subtitle && finalAction.includes('cal.com')) {
            const separator = finalAction.includes('?') ? '&' : '?';
            finalAction = `${finalAction}${separator}notes=Promo: ${encodeURIComponent(config.subtitle)}`;
        }
        
        return `
            <div class="promo-card ${mode} ${hasImage ? 'has-bg' : ''}" ${id ? `id="${id}"` : ''}>
                ${isDismissable ? '<button class="promo-close" aria-label="Close">&times;</button>' : ''}
                <div class="promo-bg-overlay" ${bgStyle}></div>
                <div class="promo-content">
                    <span class="promo-subtitle">${config.subtitle || 'Special Offer'}</span>
                    <h3 class="promo-title">${config.title}</h3>
                    <p class="promo-desc">${config.description}</p>
                    <a href="${finalAction}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="btn btn-primary-accent promo-cta">
                       ${config.cta || 'Learn More'}
                    </a>
                </div>
            </div>
        `;
    },

    bindEvents: function (el, config, storageKey, backdrop = null) {
        const self = this;
        const isModal = el.hasClass('modal');
        const isPersistable = String(config.persist).toUpperCase() === 'TRUE';

        // CTA Click
        el.find('.promo-cta').on('click', function() {
            Analytics.trackConversion('promo_click', config.title, 5, { type: isModal ? 'modal' : 'inline' });
            if (backdrop) closeCleanup(false); // Persistent or not, CTA usually closes modal
        });

        // Close Click
        const closeCleanup = (permanent = true) => {
            el.removeClass('visible');
            if (backdrop) backdrop.removeClass('visible');
            $('body').css('overflow', ''); 
            
            // Save dismissal immediately
            if (storageKey) {
                sessionStorage.setItem(storageKey, 'true');
            }

            // If it's a modal and persistable, show the floating trigger instead of permanent dismissal
            if (isModal && isPersistable && !permanent) {
                self.showPromoTrigger(config);
            }

            setTimeout(() => {
                el.remove();
                if (backdrop && $('.promo-card.modal').length === 0) backdrop.remove();
            }, 600);
        };

        el.find('.promo-close').on('click', () => closeCleanup(!isPersistable));
        if (backdrop) backdrop.on('click', () => closeCleanup(!isPersistable));
    },

    /**
     * Shows a persistent floating trigger (e.g., a gift icon) to re-open the promo
     */
    showPromoTrigger: function (config) {
        if ($('#promo-trigger-floating').length > 0) return;

        const triggerHtml = `
            <div class="promo-trigger-floating" id="promo-trigger-floating" title="${config.subtitle || 'Special Offer'}">
                <i class="fas fa-gift"></i>
                <span class="trigger-ping"></span>
            </div>
        `;

        // Logic: Try to append to existing floating CTAs container for perfect alignment
        const ctaContainer = $('.floating-ctas');
        if (ctaContainer.length > 0) {
            ctaContainer.prepend(triggerHtml);
        } else {
            $('body').append(triggerHtml);
        }

        const trigger = $('#promo-trigger-floating');
        setTimeout(() => trigger.addClass('visible'), 100);

        trigger.on('click', () => {
            trigger.removeClass('visible');
            setTimeout(() => trigger.remove(), 600);
            
            // Re-trigger the original promo as a modal immediately
            this.renderModal(config, null, 999);
            Analytics.trackUI('reopen', 'promotion', config.title);
        });
    }
};
