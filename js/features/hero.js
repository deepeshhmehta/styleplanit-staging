/**
 * hero.js - Hero section slideshow logic
 */
const HeroFeature = {
  init: async function () {
    const heroContainer = $(".hero-bg-container");
    if (heroContainer.length === 0) return;

    // 1. Get images from manifest
    const masterData = await Data.loadMasterData();
    if (!masterData || !masterData.assets_manifest) {
        console.error("❌ [Hero] Failed to load assets_manifest");
        return;
    }
    const images = masterData.assets_manifest["home-page/hero-images"] || [];
    
    if (images.length === 0) return;

    // 2. Clear placeholders and inject actual images
    heroContainer.empty();
    images.forEach((img, index) => {
        heroContainer.append(`
            <div class="hero-bg ${index === 0 ? 'active' : ''}" 
                 style="background-image: url('assets/images/home-page/hero-images/${img}'); 
                        opacity: ${index === 0 ? 1 : 0};">
            </div>
        `);
    });

    const heroBgs = $(".hero-bg");
    if (heroBgs.length <= 1) return;

    let current = 0;
    // Start global crossfade slideshow (for both web and mobile)
    setInterval(() => {
        heroBgs.eq(current).removeClass("active").css("opacity", 0);
        current = (current + 1) % heroBgs.length;
        heroBgs.eq(current).addClass("active").css("opacity", 1);
    }, 4000);

    // Hero CTA Tracking
    $(document).on("click", ".btn-ga-hero", function() {
        Analytics.trackInteraction('hero_cta', 'hero_main_button');
    });
  }
};
