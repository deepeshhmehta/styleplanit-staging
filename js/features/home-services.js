/**
 * home-services.js - Interactive package cards for "Pick Your Journey"
 */
const HomeServicesFeature = {
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

            container.append(`
                <div class="package-card" data-tier="${category.name.toLowerCase()}">
                    <div class="package-card-bg" style="background-image: url('${category.image_url}')"></div>
                    <div class="package-card-overlay"></div>
                    <div class="package-card-content">
                        <div class="package-label">Tier 0${index + 1}</div>
                        <h3>${category.name}</h3>
                        <div class="package-price">${cleanPrice}</div>
                        <p class="desc-small">${category.short_description || category.description}</p>
                        
                        <div class="package-details-expanded">
                            <div class="details-left">
                                <p class="desc-large">${category.description} Built into a comprehensive bundle to ensure you move forward with clarity and confidence.</p>
                                <a href="${category.booking_link || '#'}" class="btn btn-primary-accent">Schedule a call</a>
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
        $(document).on("click", ".package-card", function(e) {
            // If clicking inside the details (like the button), do nothing special
            if ($(e.target).closest('.package-details-expanded').length > 0) return;

            // If already active, contract it (same as reset)
            if ($(this).hasClass("active")) {
                $("#btn-packages-reset").trigger("click");
                return;
            }

            const tier = $(this).data("tier");
            const packageName = $(this).find("h3").text();
            
            Analytics.trackInteraction('package_expand', packageName);

            $(".package-card").removeClass("active");
            $(this).addClass("active");
            grid.addClass("has-active").attr("data-state", "active");
            $(".packages-section").addClass("has-active");
            resetButton.fadeIn();
            indicator.hide();

            // Scroll to the specific card that was clicked
            const self_card = $(this);
            setTimeout(() => {
                $('html, body').animate({
                    scrollTop: self_card.offset().top - 120
                }, 600);
            }, 100); 
        });

        // 2. Reset Button
        $(document).on("click", "#btn-packages-reset", function() {
            Analytics.trackInteraction('package_reset', 'return_to_grid');
            $(".package-card").removeClass("active");
            grid.removeClass("has-active").removeAttr("data-state");
            $(".packages-section").removeClass("has-active");
            resetButton.fadeOut();
            if (window.innerWidth < 992) indicator.show(); // Show dots back on mobile
        });

        // 2b. Bespoke Menu CTAs
        $(document).on("click", ".discovery-callout .btn-primary-accent", function() {
            Analytics.trackLead('bespoke_discovery_call', 'home_callout');
        });

        $(document).on("click", ".discovery-callout .btn-secondary", function() {
            Analytics.trackInteraction('bespoke_menu_view', 'home_callout_link');
        });

        // 3. Scroll Tracking for Dots
        wrapper.on("scroll", () => {
            if (grid.hasClass("has-active")) return;
            
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
        $(document).on("click", "#packages-scroll-indicator .scroll-dot", function() {
            const index = $(this).data("index");
            const cardWidth = $(".package-card").first().outerWidth() + 20;
            
            wrapper.animate({
                scrollLeft: index * cardWidth
            }, 500);
        });
    }
};
