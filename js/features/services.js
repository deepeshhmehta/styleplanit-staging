/**
 * services.js - Simplified Grouped À La Carte menu
 */
const ServicesFeature = {
  allServices: [],
  originalServices: [],
  seenServices: new Set(),

  init: async function (options = {}) {
    // Fetch only services
    const services = await Data.fetch("services");
    
    // Filter logic
    if (options.filter) {
        if (options.mode === "include") {
            this.allServices = services.filter(s => s.category === options.filter);
        } else {
            this.allServices = services.filter(s => s.category !== options.filter);
        }
    } else {
        // Default à-la-carte filter
        this.allServices = services.filter(s => s.category.toLowerCase().trim() !== "icon service");
    }

    this.originalServices = [...this.allServices];

    if (this.allServices.length === 0) {
      $(".service-content").html('<p class="text-center section-padding">Service menu is temporarily unavailable.</p>');
      return;
    }

    if (options.autoExpand && this.allServices.length > 0) {
        this.renderServicesGrid(this.allServices);
        $(".service-content").hide(); // Hide grid if auto-expanding
        this.showServiceDetails(this.allServices[0].title);
    } else {
        this.renderServicesGrid(this.allServices);
    }
    
    this.bindEvents();
  },

  renderServicesGrid: function (services) {
    const container = $(".service-content");
    if (container.length === 0) return;

    container.empty();

    // Render everything in one grid without category headers or jump links
    const grid = $('<div class="services-grid active" style="display: grid; margin-bottom: 60px;"></div>');

    services.forEach((service) => {
        const chipsHtml = this.renderServiceChips(service.footer);
        const serviceSlug = this.slugify(service.title);
        const isSeen = this.seenServices.has(service.title) ? "seen" : "";

        grid.append(`
            <div class="service-card ${isSeen}" data-title="${service.title}" data-ga-service="${serviceSlug}">
                <div class="service-card-image">
                    <img src="${service.image_url}" alt="${service.title}">
                </div>
                <div class="service-card-content">
                    <div class="service-price">${service.price || ''}</div>
                    <h3>${service.title}</h3>
                    <p class="short-desc">${service.short_description}</p>
                    <div class="service-chips">${chipsHtml}</div>
                </div>
            </div>
        `);
    });
    
    container.append(grid);
  },

  renderServiceChips: function (footerText) {
    if (!footerText) return "";
    const items = footerText.split(",").map((s) => s.trim());
    return items
      .map((item) => {
        const icon = this.getServiceIcon(item);
        return `<i class="fas ${icon}" data-title="${item}"></i>`;
      })
      .join("");
  },

  getServiceIcon: function (item) {
    const map = {
      "Color Analysis": "fa-palette",
      "Personal Style Analysis": "fa-user-tie",
      "Body Shape Analysis": "fa-bezier-curve",
      "Wardrobing": "fa-tags",
      "Lifestyle Analysis": "fa-mug-hot",
      "Virtual Shopping": "fa-laptop",
      "Lookbook Curation": "fa-book-open",
      "Shopping List": "fa-list-ul",
      "In-Person Color Analysis": "fa-palette",
      "In-Person Shopping": "fa-shopping-bag",
      "Event Styling": "fa-magic",
      "Moodboard curation": "fa-images",
      "Moodboard": "fa-images",
      "Luxury charge": "fa-gem",
    };
    return map[item] || "fa-check-circle";
  },

  renderInclusionsList: function (footerText) {
    if (!footerText) return "";
    const items = footerText.split(",").map((s) => s.trim());
    return `<ul class="inclusions-list">
        ${items.map(item => `<li>${item}</li>`).join('')}
    </ul>`;
  },

  showServiceDetails: function(serviceTitle) {
    const service = this.allServices.find(s => s.title === serviceTitle);
    if (!service) return;

    const serviceSlug = this.slugify(service.title);
    
    // Track detailed view
    Analytics.trackEngagement('view', service.title, service.category, { 
        item_id: serviceSlug,
        price: service.price 
    });
    Analytics.trackFunnel(2, 'service_view', service.title, { category: service.category });

    const detailsContainer = $("#service-details-container");
    const gridContainer = $(".service-content");
    
    const inclusionsTitle = Data.getConfig('SERVICE_INCLUSIONS_TITLE') || "What's Included?";
    const inquireText = Data.getConfig('STEP_2_BUTTON_TEXT') || "Inquire Now";
    const closeBtnText = Data.getConfig('EXPERIENCE_CLOSE_BTN') || "Close";
    const taxesNote = Data.getConfig('PRICE_TAXES_TEXT') || "+ taxes";

    const inclusionsHtml = this.renderInclusionsList(service.footer);

    // Determine booking link: priority to service-specific link, fallback to config with notes
    let bookingUrl = service.booking_link;
    if (!bookingUrl) {
        const baseHref = Data.getConfig('STEP_2_BUTTON_HREF') || 'https://cal.com/styleplanit/15min';
        const separator = baseHref.includes('?') ? '&' : '?';
        bookingUrl = `${baseHref}${separator}notes=Interested in ${encodeURIComponent(service.title)}`;
    }

    // Hide sorting controls using central timing
    $(".services-controls").fadeOut(CONFIG.THEME.ANIMATION.DURATION_FAST);

    // Track as seen
    this.seenServices.add(serviceTitle);

    const self = this;

    // Fade out grid, then show details
    gridContainer.fadeOut(CONFIG.THEME.ANIMATION.DURATION_FAST, function() {
        detailsContainer.html(`
            <div class="active-service-details">
                <div class="details-content-inner">
                    <span class="section-subtitle">${service.category}</span>
                    <h3>${service.title}</h3>
                    <p class="long-desc">${service.long_description}</p>
                    
                    <div class="inclusions-header">
                        <span class="inclusions-title">${inclusionsTitle}</span>
                        ${service.price ? `
                            <div class="price-container">
                                <span class="service-price">${service.price}</span>
                                <span class="taxes-note">${taxesNote}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="service-inclusions-content">
                        ${inclusionsHtml}
                    </div>
                    
                    <div class="details-footer">
                        <div class="cta-row">
                            <a href="${bookingUrl}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="btn btn-primary-accent btn-ga-inquiry"
                               data-ga-service="${serviceSlug}">${inquireText}</a>
                        </div>
                        <button class="btn-secondary btn-close-details">${closeBtnText}</button>
                    </div>
                </div>
            </div>
        `).fadeIn(CONFIG.THEME.ANIMATION.DURATION_STANDARD);

        // Scroll so the opened card content is at the top
        const navHeight = $("nav").outerHeight() || 0;
        $("html, body").animate({
            scrollTop: detailsContainer.offset().top - navHeight
        }, CONFIG.THEME.ANIMATION.DURATION_STANDARD);
    });
  },

  bindEvents: function () {
    const self = this;
    const gridContainer = $(".service-content");

    gridContainer.off("click", ".service-card").on("click", ".service-card", function(e) {
        if ($(e.target).closest('.service-chips').length > 0) return;
        
        $(".service-card").removeClass("active");
        $(this).addClass("active");
        
        const title = $(this).data("title");
        Analytics.trackUI('click', 'services_grid', title);
        self.showServiceDetails(title);
    });

    $(".services-controls").off("click", ".sort-label").on("click", ".sort-label", function(e) {
        e.stopPropagation();
        $("#luxury-sort").toggleClass("active");
        Analytics.trackUI('toggle', 'services_sort', 'sort_menu');
    });

    $(".services-controls").off("click", ".sort-menu li").on("click", ".sort-menu li", function(e) {
        const val = $(this).data("value");
        const label = $(this).text();
        
        // Update UI
        $("#current-sort").text(label);
        $(".sort-menu li").removeClass("active");
        $(this).addClass("active");
        $("#luxury-sort").removeClass("active");

        // Mobile: Hide "Arrange By" prefix if not default
        if (window.innerWidth <= CONFIG.THEME.BREAKPOINTS.MOBILE) {
            if (val !== 'default') {
                $(".label-prefix").hide();
            } else {
                $(".label-prefix").show();
            }
        }
        
        Analytics.trackUI('select', 'services_sort', label, { sort_value: val });
        self.sortServices(val);
    });

    // Close dropdown when clicking outside
    $(document).on("click", function() {
        if ($("#luxury-sort").hasClass("active")) {
            $("#luxury-sort").removeClass("active");
        }
    });

    $(document).off("click", ".btn-ga-inquiry").on("click", ".btn-ga-inquiry", function() {
        const serviceName = $(this).closest("#service-details-container").find("h2").text();
        Analytics.trackConversion('service_inquiry', 'service_details', 10, { service_name: serviceName });
        Analytics.trackFunnel(3, 'lead_initiate', serviceName, { source: 'service_details' });
    });

    $(document).off("click", ".btn-close-details").on("click", ".btn-close-details", function() {
        const gridContainer = $(".service-content");
        const detailsContainer = $("#service-details-container");
        
        detailsContainer.fadeOut(CONFIG.THEME.ANIMATION.DURATION_FAST, function() {
            $(this).empty();
            
            // Apply seen class to all cards that have been viewed
            $(".service-card").each(function() {
                const title = $(this).data("title");
                if (self.seenServices.has(title)) {
                    $(this).addClass("seen");
                }
            });

            $(".service-card").removeClass("active");
            gridContainer.fadeIn(CONFIG.THEME.ANIMATION.DURATION_STANDARD);
            
            // Show sorting controls again
            $(".services-controls").fadeIn(CONFIG.THEME.ANIMATION.DURATION_STANDARD);

            // Scroll back to top of services section
            const navHeight = $("nav").outerHeight() || 0;
            $('html, body').animate({
                scrollTop: $("#services").offset().top - navHeight
            }, CONFIG.THEME.ANIMATION.DURATION_STANDARD);
        });
    });
  },

  slugify: function(text) {
    return text.trim().replace(/\s+/g, "-").toLowerCase();
  },

  sortServices: function(criteria) {
    let sorted = [...this.allServices];

    switch(criteria) {
        case 'investment':
            sorted.sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price));
            break;
        case 'entry':
            sorted.sort((a, b) => this.parsePrice(a.price) - this.parsePrice(b.price));
            break;
        case 'journey':
            const order = { "Establish": 1, "Reclaim": 2, "Elevate": 3 };
            sorted.sort((a, b) => (order[a.category] || 99) - (order[b.category] || 99));
            break;
        case 'alphabetical':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            sorted = [...this.originalServices];
    }

    this.allServices = sorted;
    this.renderServicesGrid(this.allServices);
  },

  parsePrice: function(priceStr) {
    if (!priceStr) return 0;
    // Remove "$", ",", and any non-numeric characters except "."
    const num = parseFloat(priceStr.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  }
};
