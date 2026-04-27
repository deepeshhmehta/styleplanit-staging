/**
 * logos.js - Dynamic logo band rendering
 */
const LogosFeature = {
  init: async function () {
    console.log("Initializing Logos feature...");
    const container = $("#logos-container");
    if (container.length === 0) return;

    const masterData = await Data.loadMasterData();
    if (!masterData || !masterData.assets_manifest) {
        console.error("❌ [Logos] Failed to load assets_manifest");
        return;
    }
    const logos = masterData.assets_manifest["home-page/logos"] || [];
    
    if (logos.length === 0) return;

    container.empty();
    logos.forEach(logo => {
        container.append(`
            <div class="brand-logo-item" data-logo="${logo}">
                <img src="assets/images/home-page/logos/${logo}" alt="${logo}">
            </div>
        `);
    });

    $(document).on("click", ".brand-logo-item", function() {
        const logo = $(this).data('logo');
        Analytics.trackUI('click', 'trust_logos', logo);
    });
  }
};
