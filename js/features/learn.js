/**
 * learn.js - Style Wiki (Article Engine)
 */
const LearnFeature = {
    articles: [],

    init: async function() {
        console.log("🔍 [Learn] Init started...");
        const container = $("#wiki-article-container");
        if (container.length === 0) return;

        // Default sidebar state based on screen width
        if (window.innerWidth < 1024) {
            $(".wiki-layout-wrapper").addClass("sidebar-collapsed");
        }

        // Fetch articles from site-data.json
        this.articles = await Data.fetch("articles");
        
        if (this.articles.length === 0) {
            container.html('<p class="text-center">The Style Wiki is being updated. Please check back soon.</p>');
            return;
        }

        this.renderSidebar();
        this.bindEvents();

        // Load default article (first one) or from Hash
        const hash = window.location.hash.substring(1);
        const defaultArticle = this.articles.find(a => (a.id === hash) || (this.slugify(a.title) === hash)) || this.articles[0];
        this.loadArticle(defaultArticle.title);
    },

    renderSidebar: function() {
        const list = $("#wiki-article-list");
        list.empty();
        
        this.articles.forEach(article => {
            const slug = article.id || this.slugify(article.title);
            list.append(`
                <li>
                    <a href="#${slug}" class="wiki-nav-link" data-title="${article.title}">
                        ${article.title}
                    </a>
                </li>
            `);
        });
    },

    loadArticle: function(title) {
        const article = this.articles.find(a => a.title === title);
        if (!article) return;

        const container = $("#wiki-article-container");
        const slug = article.id || this.slugify(article.title);

        // Update active state in sidebar
        $(".wiki-nav-link").removeClass("active");
        $(`.wiki-nav-link[data-title="${title}"]`).addClass("active");

        Analytics.trackInteraction('wiki_view', slug);

        // Keep dark mode state if already active
        const isDarkMode = container.hasClass("dark-mode");

        container.hide().html(`
            <div class="wiki-article-view">
                <span class="section-subtitle">${article.category || 'Article'}</span>
                <h1 class="article-title">${article.title}</h1>
                <div class="article-meta">
                    <span class="read-time"><i class="far fa-clock"></i> ${article.read_time || '5 min'} read</span>
                </div>
                <div class="article-body">
                    ${article.content}
                </div>
                <div class="article-footer">
                    <hr>
                    <div class="article-cta">
                        <h4>Ready to uplift yourself</h4>
                        <a href="https://cal.com/styleplanit/15min" target="_blank" rel="noopener noreferrer" class="btn btn-primary-accent">Book a Discovery Call</a>
                    </div>
                </div>
            </div>
        `);

        if (isDarkMode) container.addClass("dark-mode");
        container.fadeIn(400);

        // Scroll to top of article
        const scrollTarget = window.innerWidth < 768 ? container.offset().top - 100 : 0;
        if (scrollTarget > 0) {
            $("html, body").animate({ scrollTop: scrollTarget }, 500);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
            $(".wiki-layout-wrapper").addClass("sidebar-collapsed");
        }
    },

    bindEvents: function() {
        const self = this;
        
        // Article Selection
        $(document).on("click", ".wiki-nav-link", function(e) {
            const title = $(this).data("title");
            self.loadArticle(title);
        });

        // Sidebar Toggle
        $(document).on("click", "#wiki-sidebar-toggle", function() {
            $(".wiki-layout-wrapper").toggleClass("sidebar-collapsed");
        });

        // Sidebar Close (Mobile)
        $(document).on("click", "#wiki-sidebar-close", function() {
            $(".wiki-layout-wrapper").addClass("sidebar-collapsed");
        });

        // Dark Mode Toggle
        $(document).on("click", "#dark-mode-toggle", function() {
            const container = $("#wiki-article-container");
            container.toggleClass("dark-mode");
            
            const icon = $(this).find("i");
            if (container.hasClass("dark-mode")) {
                icon.removeClass("fa-moon").addClass("fa-sun");
                $(this).attr("title", "Toggle Light Mode");
            } else {
                icon.removeClass("fa-sun").addClass("fa-moon");
                $(this).attr("title", "Toggle Dark Mode");
            }
        });
    },

    slugify: function(text) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    }
};
