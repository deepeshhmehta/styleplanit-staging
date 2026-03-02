/**
 * app.js - Main orchestrator and global UI logic
 */
const App = {
  init: function (config) {
    this.initNavigation();
    this.initGlobalFeatures(config);
  },

  initNavigation: function () {
    $(document).on("click", ".menu-toggle", function () {
      var expanded = $(this).attr("aria-expanded") === "true";
      $(this).attr("aria-expanded", String(!expanded));
      $(".nav-links").toggleClass("active");
    });

    $(document).on("click", ".nav-links a", function () {
      $(".nav-links").removeClass("active");
      $(".menu-toggle").attr("aria-expanded", "false");
    });
  },

  initGlobalFeatures: async function (config) {
    // 1. Hero Slideshow
    if (typeof HeroFeature !== 'undefined') {
        await HeroFeature.init();
    }

    // 1b. Logo Band
    if (typeof LogosFeature !== 'undefined') {
        LogosFeature.init();
    }

    // 1c. Home Page Features
    if (typeof HomeServicesFeature !== 'undefined') {
        HomeServicesFeature.init();
    }
    if (typeof PortfolioFeature !== 'undefined') {
        PortfolioFeature.init();
    }

    // 2. Reviews
    if (typeof ReviewsFeature !== 'undefined') {
        const isReviewsPage = window.location.pathname.includes('reviews');
        if (isReviewsPage) {
            ReviewsFeature.init();
        } else {
            ReviewsFeature.init({ shuffle: true, limit: 3 });
        }
    }

    // 3. Team
    if (typeof TeamFeature !== 'undefined') {
        TeamFeature.init();
    }

    // 4. Services
    if (typeof ServicesFeature !== 'undefined' && ($("#services").length > 0 || $("#experience-intro").length > 0)) {
        ServicesFeature.init({ filter: "Icon Service", mode: "exclude" });
    }

    // 5. Icon Service collection (Auth-gated)
    if (typeof IconServiceFeature !== 'undefined') {
        IconServiceFeature.init();
    }

    // 6. Subscription logic
    if (typeof SubscribeFeature !== 'undefined') {
        SubscribeFeature.init(config);
    }

    // 7. Dialog Popups
    if (typeof DialogsFeature !== 'undefined') {
        DialogsFeature.init();
    }
  }
};
