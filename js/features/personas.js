/**
 * personas.js - Dynamic persona cards and scroll tracking
 */
const PersonasFeature = {
    init: async function() {
        const wrapper = $("#personas-grid-wrapper");
        const grid = $("#personas-grid");
        const indicator = $("#personas-scroll-indicator");

        if (wrapper.length === 0) return;

        // 1. Fetch Data
        const personas = await Data.fetch("personas");
        if (!personas || personas.length === 0) return;

        // 2. Render Cards
        this.renderPersonas(grid, personas);

        // 3. Create Dots
        indicator.empty();
        personas.forEach((_, index) => {
            indicator.append(`<div class="scroll-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`);
        });

        const dots = indicator.find(".scroll-dot");
        const cards = grid.find(".persona-card");

        // 4. Optimized Scroll Tracking
        let ticking = false;
        wrapper.on("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollLeft = wrapper.scrollLeft();
                    const maxScroll = wrapper[0].scrollWidth - wrapper.outerWidth();
                    if (maxScroll > 0) {
                        const scrollPercent = scrollLeft / maxScroll;
                        const activeIndex = Math.round(scrollPercent * (personas.length - 1));
                        
                        if (activeIndex === personas.length - 1) {
                            Analytics.trackScrollEnd('personas_carousel');
                        }

                        dots.removeClass("active");
                        dots.eq(activeIndex).addClass("active");
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 5. Dot Click to Scroll
        $(document).on("click", "#personas-scroll-indicator .scroll-dot", function() {
            const index = $(this).data("index");
            const persona = personas[index];
            Analytics.trackInteraction('persona_dot_click', persona.title);

            const cardWidth = cards.first().outerWidth() + 30; // 30 is gap
            
            wrapper.animate({
                scrollLeft: index * cardWidth
            }, 500);
        });
    },

    renderPersonas: function(container, personas) {
        container.empty();
        personas.forEach(persona => {
            const tags = persona.tags ? persona.tags.split('|') : [];
            const tagsHtml = tags.map(tag => `<span class="persona-tag">${tag}</span>`).join('');

            container.append(`
                <div class="persona-card">
                    <div class="persona-label">${persona.label}</div>
                    <h3 class="persona-title">${persona.title}</h3>
                    <p class="persona-quote">${persona.quote}</p>
                    <div class="persona-tags">
                        ${tagsHtml}
                    </div>
                </div>
            `);
        });
    }
};
