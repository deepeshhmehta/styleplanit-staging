/**
 * reviews.js - Review expansion and rendering logic
 */
const ReviewsFeature = {
  init: async function (options = {}) {
    let reviews = await Data.fetch("reviews");
    if (reviews.length === 0) {
      $("#reviews-container").html('<p class="text-center">Reviews are currently being updated.</p>');
      return;
    }

    // Handle shuffle and limit
    if (options.shuffle) {
      reviews = reviews.sort(() => 0.5 - Math.random());
    }
    if (options.limit) {
      reviews = reviews.slice(0, options.limit);
    }

    const container = $("#reviews-container");
    container.empty();
    reviews.forEach((review) => {
      container.append(`
                <div class="review-card">
                    <span class="review-author">${review.author}</span>
                    <p>"${review.text.replace(/"/g, "")}"</p>
                    <span class="read-more">Read more</span>
                </div>
            `);
    });
    this.bindReviewToggle();
    this.setupScrollIndicator(reviews.length);
  },

  setupScrollIndicator: function(count) {
    const hintContainer = $(".scroll-hint");
    if (hintContainer.length === 0) return;

    hintContainer.empty();
    // Only show up to 5 dots to keep it clean
    const dotCount = Math.min(count, 5);
    for (let i = 0; i < dotCount; i++) {
        hintContainer.append(`<div class="scroll-dot ${i === 0 ? 'active' : ''}"></div>`);
    }

    const grid = $("#reviews-container");
    const dots = $(".scroll-dot");
    let hasTrackedEnd = false;

    grid.on("scroll", () => {
        const scrollLeft = grid.scrollLeft();
        const maxScroll = grid[0].scrollWidth - grid.width();
        const progress = scrollLeft / maxScroll;
        const activeIndex = Math.min(Math.floor(progress * dotCount), dotCount - 1);
        
        dots.removeClass("active");
        dots.eq(activeIndex).addClass("active");

        // Track when user reaches the end of reviews
        if (progress > 0.95 && !hasTrackedEnd) {
            hasTrackedEnd = true;
            Analytics.trackScrollEnd('reviews_carousel');
        }
    });
  },

  bindReviewToggle: function() {
    $(document).off("click", ".review-card").on("click", ".review-card", function() {
        const card = $(this);
        const isExpanding = !card.hasClass("expanded");
        card.toggleClass("expanded");
        
        // Toggle text
        card.find(".read-more").text(isExpanding ? "Read less" : "Read more");
        
        if (isExpanding) {
            Analytics.trackInteraction('review_expansion', card.find('.review-author').text());
        }
        
        const navHeight = $("nav").outerHeight() || 0;
        const extraPadding = CONFIG.SETTINGS.SCROLL_OFFSET;

        if (isExpanding) {
            setTimeout(() => {
                $("html, body").animate({
                    scrollTop: card.offset().top - navHeight - extraPadding
                }, 400);
            }, 100);
        } else {
            card.scrollTop(0);
            $("html, body").animate({
                scrollTop: card.offset().top - navHeight - extraPadding
            }, 200);
        }
    });
  }
};
