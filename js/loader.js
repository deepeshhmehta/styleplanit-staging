/**
 * loader.js - Handles recursive loading of HTML components and app initialization
 */
async function loadComponents() {
    // 0. Prevent scrolling while loading
    document.body.style.overflow = 'hidden';

    // 1. Check version immediately to decide if cache needs flushing
    if (typeof Data !== 'undefined') {
        await Data.checkVersion();
    }

    // Recursive Loader function
    async function processComponents() {
        const components = document.querySelectorAll('[data-component]:not([data-loaded])');
        if (components.length === 0) return;

        const loadPromises = Array.from(components).map(async (element) => {
            const componentName = element.getAttribute('data-component');
            if (componentName === 'loader') return;

            // Mark as loaded immediately to prevent infinite loops
            element.setAttribute('data-loaded', 'true');

            try {
                const response = await fetch(`components/${componentName}.html`);
                if (!response.ok) throw new Error(`Status ${response.status}`);
                const html = await response.text();
                element.innerHTML = html;
                
                // After injecting, check if there are nested components inside this one
                await processComponents(); 
            } catch (error) {
                console.warn(`[Loader] Failed to load component: ${componentName} (${error.message})`);
                element.style.display = 'none'; 
            }
        });

        await Promise.all(loadPromises);
    }

    await processComponents();

    // 2. Dynamic Feature Loading
    const features = [];
    if ($(".hero-bg").length > 0) features.push('hero');
    if ($("#logos-container").length > 0) features.push('logos');
    if ($("#services").length > 0 || $("#icon-service-container").length > 0) features.push('services');
    if ($("#home-categories-container").length > 0) features.push('home-services');
    if ($("#portfolio-carousel").length > 0) features.push('portfolio');
    if ($("#reviews-container").length > 0) features.push('reviews');
    if ($("#team-container").length > 0) features.push('team');
    if ($("#subscribe-container").length > 0 || $(".subscribe-form").length > 0) features.push('subscribe');
    if ($("#icon-service-container").length > 0) features.push('auth');
    features.push('dialogs'); 

    const featurePromises = features.map((feature) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = `js/features/${feature}.js?v=${new Date().getTime()}`;
            script.async = false;
            script.onload = () => resolve();
            script.onerror = () => resolve();
            document.body.appendChild(script);
        });
    });

    await Promise.all(featurePromises);
    
    // 3. Load and apply site-wide configuration
    const configArray = await Data.fetch('config');
    let config = {};
    if (configArray.length > 0) {
        configArray.forEach(item => {
            if (!item.key) return;
            config[item.key] = item.value;
        });
        Utils.applyConfig(config);

        // 3b. Inject Google Analytics
        if (config['GOOGLE_ANALYTICS_ID']) {
            const gaId = config['GOOGLE_ANALYTICS_ID'];
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            document.head.appendChild(gaScript);

            const gaInitScript = document.createElement('script');
            gaInitScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
            `;
            document.head.appendChild(gaInitScript);
        }
    }

    // 4. Initialize UI interactions
    if (typeof App !== 'undefined') {
        App.init(config);
    }

    // 5. Signal ready
    document.dispatchEvent(new CustomEvent('appReady'));

    // 6. Hide loader
    setTimeout(() => {
        const loader = document.getElementById('site-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 800);
        }
    }, 200);
}

document.addEventListener('DOMContentLoaded', loadComponents);
