/**
 * services.js - Simplified Grouped À La Carte menu
 */
const ServicesFeature = {
  allServices: [],

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

    if (this.allServices.length === 0) {
      $(".service-content").html('<p class="text-center section-padding">Service menu is temporarily unavailable.</p>');
      return;
    }

    if (options.autoExpand && this.allServices.length > 0) {
        this.renderGroupedServices(this.allServices);
        this.showServiceDetails(this.allServices[0].title);
    } else {
        this.renderGroupedServices(this.allServices);
    }
    
    this.bindEvents();
  },

  renderGroupedServices: function (services) {
    const container = $(".service-content");
    if (container.length === 0) return;

    container.empty();

    // 1. Group services by category
    const groups = {};
    services.forEach(s => {
        if (!groups[s.category]) groups[s.category] = [];
        groups[s.category].push(s);
    });

    // 2. Add Jump-links
    const jumpLinks = $('<div class="menu-jump-links"></div>');
    Object.keys(groups).forEach(cat => {
        jumpLinks.append(`<a href="#cat-${this.slugify(cat)}" class="btn-secondary">${cat}</a>`);
    });
    container.append(jumpLinks);

    // 3. Render Sections
    Object.keys(groups).forEach(cat => {
        const sectionId = `cat-${this.slugify(cat)}`;
        const section = $(`
            <div class="menu-section" id="${sectionId}">
                <h2 class="menu-section-title">${cat}</h2>
                <div class="services-grid active" style="display: grid; margin-bottom: 60px;"></div>
            </div>
        `);
        
        const grid = section.find(".services-grid");
        groups[cat].forEach(service => {
            const chipsHtml = this.renderServiceChips(service.footer);
            const serviceSlug = this.slugify(service.title);
            grid.append(`
                <div class="service-card" data-title="${service.title}" data-ga-service="${serviceSlug}">
                    <div class="service-card-image">
                        <img src="${service.image_url}" alt="${service.title}">
                    </div>
                    <div class="service-card-content">
                        <h3>${service.title}</h3>
                        <p class="short-desc">${service.short_description}</p>
                        <div class="service-chips">${chipsHtml}</div>
                    </div>
                </div>
            `);
        });
        container.append(section);
    });
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
      "In-Person Shopping": "fa-shopping-bag",
      "Event Styling": "fa-magic",
      "Moodboard curation": "fa-images",
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
    const detailsContainer = $("#service-details-container");
    
    const inclusionsTitle = (Data.masterData.config.find(c => c.key === 'SERVICE_INCLUSIONS_TITLE') || {value: "What's Included?"}).value;
    const inquireText = (Data.masterData.config.find(c => c.key === 'STEP_2_BUTTON_TEXT') || {value: "Inquire Now"}).value;
    const closeBtnText = (Data.masterData.config.find(c => c.key === 'EXPERIENCE_CLOSE_BTN') || {value: "Close"}).value;
    const taxesNote = (Data.masterData.config.find(c => c.key === 'PRICE_TAXES_TEXT') || {value: "+ taxes"}).value;

    const inclusionsHtml = this.renderInclusionsList(service.footer);

    detailsContainer.html(`
        <div class="active-service-details">
            <div class="details-grid">
                <div class="details-brand-pillar">
                    <span class="brand-mark">SP</span>
                </div>
                <div class="details-text">
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
                            <a href="${(Data.masterData.config.find(c => c.key === 'STEP_2_BUTTON_HREF') || {}).value || 'https://cal.com/styleplanit/15min'}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="btn btn-primary-accent btn-ga-inquiry"
                               data-ga-service="${serviceSlug}">${inquireText}</a>
                        </div>
                        <button class="btn-secondary btn-close-details">${closeBtnText}</button>
                    </div>
                </div>
            </div>
        </div>
    `).fadeIn(400);

    const navHeight = $("nav").outerHeight() || 0;
    $("html, body").animate({
        scrollTop: detailsContainer.offset().top - navHeight - 40
    }, 600);
  },

  bindEvents: function () {
    const self = this;

    $(document).on("click", ".service-card", function(e) {
        if ($(e.target).closest('.service-chips').length > 0) return;
        
        $(".service-card").removeClass("active");
        $(this).addClass("active");
        
        const title = $(this).data("title");
        self.showServiceDetails(title);
    });

    $(document).on("click", ".btn-close-details", function() {
        const navHeight = $("nav").outerHeight() || 0;
        const target = $("#services");
        
        $('html, body').animate({
            scrollTop: target.offset().top - navHeight
        }, 500);

        $("#service-details-container").fadeOut(300, function() {
            $(this).empty();
            $(".service-card").removeClass("active");
        });
    });

    // Smooth scroll for jump links
    $(document).on("click", ".menu-jump-links a", function(e) {
        e.preventDefault();
        const targetId = $(this).attr("href");
        const navHeight = $("nav").outerHeight() || 0;
        $('html, body').animate({
            scrollTop: $(targetId).offset().top - navHeight - 20
        }, 600);
    });
  },

  slugify: function(text) {
    return text.trim().replace(/\s+/g, "-").toLowerCase();
  }
};
