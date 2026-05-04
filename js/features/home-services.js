/**
 * home-services.js - Interactive package cards for "Pick Your Journey"
 */
const HomeServicesFeature = {
    // Feature-Specific Constants (Local tokens only)
    LAYOUT: {
        DIMENSIONS: {
            EXPANDED: {
                DESKTOP: 800,
                TABLET: 550,
                MOBILE_VW: 0.82
            },
            CONTRACTED: {
                DESKTOP: 380,
                TABLET: 320,
                MOBILE_VW: 0.80
            }
        },
        GAPS: {
            EXPANDED: 30,
            CONTRACTED: 20
        },
        PADDINGS: {
            MOBILE_CONTAINER_VW: 0.04
        }
    },

    init: async function() {
        const container = $("#packages-grid-container");
        if (container.length === 0) return;

        const categories = await Data.fetch("categories");
        const homeCategories = categories.filter(c => {
            const val = String(c.showOnHomePage).toUpperCase();
            return val === 'TRUE';
        });

        this.renderPackages(container, homeCategories);
        this.initScrollDots(homeCategories.length);
        this.bindEvents();
    },

    renderPackages: function(container, categories) {
        container.empty();
        categories.forEach((category, index) => {
            const inclusions = category.inclusions ? category.inclusions.split('|') : [];
            const inclusionsHtml = inclusions.map(item => `<li>${item}</li>`).join('');
            
            const cleanPrice = category.price ? category.price.replace('From ', '') : '';

            // Handle multiple background layers for alternating imagery
            const imageUrls = (category.image_urls || category.image_url || "").split('|').filter(url => url.trim());
            const layersHtml = imageUrls.map((url, i) => `
                <div class="package-card-layer ${i === 0 ? 'active' : ''}" style="background-image: url('${url}')"></div>
            `).join('');

            container.append(`
                <div class="package-card" data-tier="${category.name.toLowerCase()}">
                    ${layersHtml}
                    <div class="package-card-overlay"></div>
                    <div class="package-card-content">
                        <div class="package-label">Tier 0${index + 1}</div>
                        <h3>${category.name}</h3>
                        <div class="package-price">${cleanPrice}</div>
                        <p class="desc-small">${category.short_description || category.description}</p>
                        
                        <div class="package-details-expanded">
                            <div class="details-left">
                                <p class="desc-large">${category.description} Built into a comprehensive bundle to ensure you move forward with clarity and confidence.</p>
                                <a href="${category.booking_link || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary-accent">Schedule a call</a>
                            </div>
                            <div class="details-right">
                                <div class="package-label">What's included</div>
                                <ul class="inclusions-list">
                                    ${inclusionsHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });

        // Initialize rotation if multiple images exist
        this.initImageRotation();
    },

    initImageRotation: async function() {
        const masterConfig = await Data.loadMasterData();
        const interval = parseInt(masterConfig.CATEGORY_IMAGE_ROTATION_INTERVAL) || 5000;

        if (this.rotationInterval) clearInterval(this.rotationInterval);

        this.rotationInterval = setInterval(() => {
            $(".package-card").each(function() {
                const layers = $(this).find(".package-card-layer");
                if (layers.length <= 1) return;

                const activeLayer = layers.filter(".active");
                let nextLayer = activeLayer.next(".package-card-layer");
                
                if (nextLayer.length === 0) {
                    nextLayer = layers.first();
                }

                activeLayer.removeClass("active");
                nextLayer.addClass("active");
            });
        }, interval);
    },

    initScrollDots: function(count) {
        const indicator = $("#packages-scroll-indicator");
        if (indicator.length === 0) return;
        
        indicator.empty();
        for (let i = 0; i < count; i++) {
            indicator.append(`<div class="scroll-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`);
        }
    },

    bindEvents: function() {
        const self = this;
        const grid = $("#packages-grid-container");
        const wrapper = $("#packages-grid-wrapper");
        const indicator = $("#packages-scroll-indicator");
        const resetButton = $("#btn-packages-reset");

        // 1. Card Click - Expand or Contract
        grid.on("click", ".package-card", function(e) {
            if ($(e.target).closest('a, button').length > 0) return;

            if (grid.hasClass("has-active")) {
                $(".package-card").removeClass("active");
                $(this).addClass("active");
                $("#btn-packages-reset").trigger("click");
                return;
            }

            const tier = $(this).data("tier");
            const packageName = $(this).find("h3").text();
            
            Analytics.trackUI('expand', 'packages', packageName, { tier: tier });

            $(".package-card").removeClass("active");
            $(this).addClass("active");
            grid.addClass("has-active").attr("data-state", "active");
            $(".packages-section").addClass("has-active");
            resetButton.fadeIn();

            // Calculate horizontal offset using both global and local tokens
            const index = $(this).index();
            const wrapperWidth = wrapper.outerWidth();
            let expandedWidth;
            
            if (window.innerWidth > CONFIG.THEME.BREAKPOINTS.TABLET) {
                expandedWidth = self.LAYOUT.DIMENSIONS.EXPANDED.DESKTOP;
            } else if (window.innerWidth > CONFIG.THEME.BREAKPOINTS.MOBILE) {
                expandedWidth = self.LAYOUT.DIMENSIONS.EXPANDED.TABLET;
            } else {
                expandedWidth = window.innerWidth * self.LAYOUT.DIMENSIONS.EXPANDED.MOBILE_VW;
            }

            const targetCenter = (index * (expandedWidth + self.LAYOUT.GAPS.EXPANDED)) + (expandedWidth / 2);
            const targetScroll = targetCenter - (wrapperWidth / 2);

            setTimeout(() => {
                wrapper.animate({ scrollLeft: Math.max(0, targetScroll) }, CONFIG.THEME.ANIMATION.DURATION_SLOW);
            }, 150); 
        });

        // 2. Reset Button / Contraction
        $(document).on("click", "#btn-packages-reset", function() {
            const activeCard = $(".package-card.active");
            const activeIndex = activeCard.length > 0 ? activeCard.index() : 0;
            const activeName = activeCard.find("h3").text() || 'none';
            
            Analytics.trackUI('reset', 'packages', 'return_to_grid', { last_active: activeName });
            
            $(".package-card").removeClass("active");
            grid.removeClass("has-active").removeAttr("data-state");
            $(".packages-section").removeClass("has-active");
            resetButton.fadeOut();
            
            const wrapperWidth = wrapper.outerWidth();
            let contractedWidth, gap, padding;

            if (window.innerWidth > CONFIG.THEME.BREAKPOINTS.TABLET) {
                contractedWidth = self.LAYOUT.DIMENSIONS.CONTRACTED.DESKTOP; 
                gap = self.LAYOUT.GAPS.EXPANDED;
                padding = 0;
            } else if (window.innerWidth > CONFIG.THEME.BREAKPOINTS.MOBILE) {
                contractedWidth = self.LAYOUT.DIMENSIONS.CONTRACTED.TABLET;
                gap = self.LAYOUT.GAPS.CONTRACTED;
                padding = window.innerWidth * self.LAYOUT.PADDINGS.MOBILE_CONTAINER_VW;
            } else {
                contractedWidth = window.innerWidth * self.LAYOUT.DIMENSIONS.CONTRACTED.MOBILE_VW;
                gap = self.LAYOUT.GAPS.CONTRACTED;
                padding = window.innerWidth * self.LAYOUT.PADDINGS.MOBILE_CONTAINER_VW;
            }
            
            const targetCenter = padding + (activeIndex * (contractedWidth + gap)) + (contractedWidth / 2);
            const targetScroll = targetCenter - (wrapperWidth / 2);

            wrapper.animate({ scrollLeft: Math.max(0, targetScroll) }, CONFIG.THEME.ANIMATION.DURATION_STANDARD);

            const section = $("#services");
            if (section.length > 0) {
                const scrollPadding = window.innerWidth > CONFIG.THEME.BREAKPOINTS.MOBILE ? CONFIG.THEME.SCROLL.PADDING_DESKTOP : CONFIG.THEME.SCROLL.PADDING_MOBILE;
                const scrollMargin = window.innerHeight * CONFIG.THEME.SCROLL.MARGIN_VH;
                
                $('html, body').animate({
                    scrollTop: section.offset().top - scrollPadding - scrollMargin
                }, CONFIG.THEME.ANIMATION.DURATION_STANDARD);
            }

            if (window.innerWidth < CONFIG.THEME.BREAKPOINTS.TABLET) indicator.show();
        });

        // 2b. Bespoke Menu CTAs
        $(document).on("click", ".discovery-callout .btn-primary-accent", function() {
            Analytics.trackUI('click', 'bespoke_callout', 'explore_services');
        });

        $(document).on("click", ".discovery-callout .btn-secondary", function() {
            Analytics.trackConversion('discovery_call', 'bespoke_callout', 5);
        });

        // 3. Scroll Tracking for Dots
        wrapper.on("scroll", () => {
            const scrollLeft = wrapper.scrollLeft();
            const maxScroll = wrapper[0].scrollWidth - wrapper.outerWidth();
            if (maxScroll <= 0) return;
            
            const scrollPercent = scrollLeft / maxScroll;
            const dots = indicator.find(".scroll-dot");
            const activeIndex = Math.round(scrollPercent * (dots.length - 1));
            
            dots.removeClass("active");
            dots.eq(activeIndex).addClass("active");
        });

        // 4. Dot Click to Scroll
        indicator.on("click", ".scroll-dot", function() {
            const index = $(this).data("index");
            const cardWidth = $(".package-card").first().outerWidth() + self.LAYOUT.GAPS.CONTRACTED;
            
            wrapper.animate({ scrollLeft: index * cardWidth }, CONFIG.THEME.ANIMATION.DURATION_STANDARD);
        });
    }
};
