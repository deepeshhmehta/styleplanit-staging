/**
 * portfolio.js - Portfolio image band with transformation support
 */
const PortfolioFeature = {
    init: async function() {
        const container = $("#portfolio-carousel");
        if (container.length === 0) return;

        const masterData = await Data.loadMasterData();
        if (!masterData || !masterData.assets_manifest) {
            console.error("❌ [Portfolio] Failed to load assets_manifest");
            return;
        }
        const assets = masterData.assets_manifest || {};
        const images = assets['portfolio'] || [];

        if (images.length === 0) {
            console.warn("Portfolio manifest empty. Run scripts/diff_site_data.py to verify state.");
            return;
        }

        this.renderPortfolio(container, images);
    },

    renderPortfolio: function(container, images) {
        container.empty();
        
        const processed = new Set();
        
        // 1. Identify pairs first to avoid duplication
        const pairs = [];
        const singles = [];
        const usedInPair = new Set();

        images.forEach(img => {
            const name = img.toLowerCase();
            if (name.includes('_before')) {
                const baseName = name.split('_before')[0];
                const afterImage = images.find(i => i.toLowerCase().startsWith(baseName + '_after'));
                if (afterImage) {
                    pairs.push({ before: img, after: afterImage });
                    usedInPair.add(img);
                    usedInPair.add(afterImage);
                }
            }
        });

        // 2. Anything not in a pair is a single
        images.forEach(img => {
            if (!usedInPair.has(img)) {
                singles.push(img);
            }
        });

        // 3. Render pairs
        pairs.forEach(pair => {
            container.append(`
                <div class="portfolio-item transformation-pair">
                    <div class="transformation-side before">
                        <img src="assets/images/portfolio/${pair.before}" alt="Before">
                        <span class="label">Before</span>
                    </div>
                    <div class="transformation-side after">
                        <img src="assets/images/portfolio/${pair.after}" alt="After">
                        <span class="label">After</span>
                    </div>
                </div>
            `);
        });

        // 4. Render singles
        singles.forEach(img => {
            container.append(`
                <div class="portfolio-item">
                    <img src="assets/images/portfolio/${img}" alt="Portfolio Work">
                </div>
            `);
        });
    }
};
