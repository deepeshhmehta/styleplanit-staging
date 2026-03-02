/**
 * services.js - Service grid rendering and filtering with "Experience" flow
 */
const ServicesFeature = {
  options: {},
  allServices: [],
  categories: [],

  init: async function (options = {}) {
    console.log("🔍 [Services] Init started with options:", options);
    this.options = options;
    
    // Fetch both in parallel for speed
    const [services, categories] = await Promise.all([
        Data.fetch("services"),
        Data.fetch("categories")
    ]);

    this.allServices = services;
    this.categories = categories;
    console.log("🔍 [Services] Data fetched. Total services:", services.length, "Total categories:", categories.length);

    if (this.allServices.length === 0) {
      console.warn("⚠️ [Services] No services found in data.");
      $(".service-content").html('<p class="text-center section-padding">Service menu is temporarily unavailable. Please check back later.</p>');
      return;
    }

    // 1. Filter services if needed
    let displayServices = [...this.allServices];
    if (options.filter) {
      console.log("🔍 [Services] Applying filter:", options.filter, "Mode:", options.mode);
      if (options.mode === "exclude") {
        displayServices = displayServices.filter(s => s.category !== options.filter);
      } else {
        displayServices = displayServices.filter(s => s.category === options.filter);
      }
    }
    console.log("🔍 [Services] Services to display:", displayServices.length);

    // Filter categories to only those that have services in the current view
    const activeCategoryNames = [...new Set(displayServices.map(s => s.category))];
    const displayCategories = this.categories.filter(c => activeCategoryNames.includes(c.name));
    console.log("🔍 [Services] Active categories in view:", activeCategoryNames);

    // 2. Render Category Selector (Cards) - Only if container exists
    const categorySelector = $("#services-category-selector");
    if (categorySelector.length > 0) {
        console.log("🔍 [Services] Rendering category selector...");
        this.renderCategorySelector(displayCategories);
    }

    // 3. Render all grids
    console.log("🔍 [Services] Rendering grids...");
    this.renderServiceGrids(activeCategoryNames, displayServices);

    // 4. Bind events
    this.bindEvents();

    // 5. Initial State & Hash Routing
    const hash = window.location.hash.substring(1).toLowerCase();
    if (hash && activeCategoryNames.map(n => this.slugify(n)).includes(hash)) {
        console.log("🔍 [Services] Hash detected:", hash);
        const targetCategory = displayCategories.find(c => this.slugify(c.name) === hash);
        if (targetCategory) {
            this.switchCategory(targetCategory.name, false); 
        }
    } else if (this.options.autoExpand || this.options.mode === "include") {
        console.log("🔍 [Services] Auto-display mode active.");
        if (activeCategoryNames.length > 0) {
            this.switchCategory(activeCategoryNames[0], true);
        }
    } else if (categorySelector.length > 0) {
        console.log("🔍 [Services] Landing reset state.");
        $("#services").hide();
        $(".category-card").removeClass("active");
        $("#services-category-selector").removeClass("active-selection");
    }

    // 6. Auto-expand (for Icon Service specific page)
    if (this.options.autoExpand) {
        setTimeout(() => {
            $(".service-card").first().click();
        }, 100);
    }
  },

  renderCategorySelector: function (categories) {
    const container = $("#services-category-selector");
    if (container.length === 0) return;

    container.empty();
    categories.forEach(category => {
        container.append(`
            <div class="category-card" data-category="${category.name}">
                <div class="category-card-bg" style="background-image: url('${category.image_url}')"></div>
                <div class="category-card-content">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                </div>
            </div>
        `);
    });
  },

  renderServiceGrids: function (categoryNames, services) {
    const serviceContent = $(".service-content");
    if (serviceContent.length === 0) return;

    serviceContent.empty();
    categoryNames.forEach((category) => {
      const categoryId = this.slugify(category);
      const grid = $(
        `<div id="grid-${categoryId}" class="services-grid"></div>`,
      );

      services
        .filter((s) => s.category === category)
        .forEach((service) => {
          const chipsHtml = this.renderServiceChips(service.footer);
          grid.append(`
                    <div class="service-card" data-title="${service.title}">
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
      serviceContent.append(grid);
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

  switchCategory: function(categoryName, noScroll = false) {
    const slug = this.slugify(categoryName);
    
    if ($("#services").is(":hidden")) {
        $("#services").fadeIn(400);
    }
    
    $(".services-grid").removeClass("active");
    $(`#grid-${slug}`).addClass("active");
    $("#active-category-title").text(categoryName);
    
    // Highlight active category card
    $(".category-card").removeClass("active");
    $(`.category-card[data-category="${categoryName}"]`).addClass("active");
    $("#services-category-selector").addClass("active-selection");
    
    // Reset details box when switching categories
    $("#service-details-container").hide().empty();
    $(".service-card").removeClass("active");

    if (!noScroll) {
        const navHeight = $("nav").outerHeight() || 0;
        $("html, body").animate({
            scrollTop: $("#services").offset().top - navHeight
        }, 600);
    }
  },

  showServiceDetails: function(serviceTitle) {
    const service = this.allServices.find(s => s.title === serviceTitle);
    if (!service) return;

    const detailsContainer = $("#service-details-container");
    const chipsHtml = this.renderServiceChips(service.footer);
    
    // Get inclusions title and CTA text from config
    const inclusionsTitle = (Data.masterData.config.find(c => c.key === 'SERVICE_INCLUSIONS_TITLE') || {value: "What's Included?"}).value;
    const inquireText = (Data.masterData.config.find(c => c.key === 'STEP_2_BUTTON_TEXT') || {value: "Inquire Now"}).value;
    const closeBtnText = (Data.masterData.config.find(c => c.key === 'EXPERIENCE_CLOSE_BTN') || {value: "Close & Return to List"}).value;

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
                    
                    <span class="inclusions-title">${inclusionsTitle}</span>
                    <div class="service-chips">${chipsHtml}</div>
                    
                    <div class="details-footer">
                        <div class="cta-row">
                            <a href="${(Data.masterData.config.find(c => c.key === 'STEP_2_BUTTON_HREF') || {}).value || 'https://cal.com/styleplanit/15min'}" target="_blank" class="btn btn-primary-accent">${inquireText}</a>
                        </div>
                        <button class="btn-secondary btn-close-details">${closeBtnText}</button>
                    </div>
                </div>
            </div>
        </div>
    `).fadeIn(400);

    // Scroll to details
    const navHeight = $("nav").outerHeight() || 0;
    $("html, body").animate({
        scrollTop: detailsContainer.offset().top - navHeight - 40
    }, 600);
  },

  bindEvents: function () {
    const self = this;

    // Category Selector
    $(document).on("click", "#services-category-selector .category-card", function() {
        const category = $(this).data("category");
        self.switchCategory(category);
    });

    // Return to Categories Button
    $(document).on("click", "#btn-return-to-categories", function() {
        const navHeight = $("nav").outerHeight() || 0;
        $("html, body").animate({
            scrollTop: $("#experience-intro").offset().top - navHeight
        }, 600, function() {
            // After scroll, reset state
            $("#services").fadeOut(300);
            $(".category-card").removeClass("active");
            $("#services-category-selector").removeClass("active-selection");
        });
    });

    // Service Card Selection
    $(document).on("click", ".service-card", function(e) {
        if ($(e.target).closest('.service-chips').length > 0) return;
        
        $(".service-card").removeClass("active");
        $(this).addClass("active");
        
        const title = $(this).data("title");
        self.showServiceDetails(title);
    });

    // Close Details
    $(document).on("click", ".btn-close-details", function() {
        $("#service-details-container").fadeOut(300, function() {
            $(this).empty();
            $(".service-card").removeClass("active");
            
            // Scroll back to active grid
            const navHeight = $("nav").outerHeight() || 0;
            const target = $(".services-grid.active");
            if (target.length > 0) {
                $("html, body").animate({
                    scrollTop: target.offset().top - navHeight - 100
                }, 500);
            }
        });
    });
  },

  slugify: function(text) {
    return text.trim().replace(/\s+/g, "-").toLowerCase();
  }
};
