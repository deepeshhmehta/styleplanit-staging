/**
 * loader.js - Handles recursive loading of HTML components and app initialization
 */
async function loadComponents() {
    // 0. Prevent scrolling while loading
    document.body.style.overflow = 'hidden';

    const progressBar = document.getElementById('loader-progress');
    const phraseEl = document.getElementById('loader-phrase');
    
    // Initial Fallback phrases
    let phrases = [
        "Defining your brand...",
        "Curating the collection...",
        "Polishing the presence..."
    ];

    let phraseInterval;
    function startPhrases() {
        if (!phraseEl) return;
        phraseEl.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        phraseInterval = setInterval(() => {
            phraseEl.style.opacity = 0;
            setTimeout(() => {
                phraseEl.textContent = phrases[Math.floor(Math.random() * phrases.length)];
                phraseEl.style.opacity = 0.8;
            }, 500);
        }, 2500);
    }

    function updateProgress(percent) {
        if (progressBar) progressBar.style.width = percent + '%';
    }

    // Initial state
    updateProgress(10);

    // 1. Check version and start fetching master data immediately
    if (typeof Data !== 'undefined') {
        const masterData = await Data.loadMasterData();
        if (masterData && masterData.config) {
            const phrasesConfig = masterData.config.find(item => item.key === 'LOADER_PHRASES');
            if (phrasesConfig && phrasesConfig.value) {
                phrases = phrasesConfig.value.split('|').map(p => p.trim());
            }
        }
        await Data.checkVersion();
    }
    
    // Start showing phrases after master data (and potentially custom phrases) are ready
    startPhrases();
    updateProgress(20);

    // Recursive Loader function
    async function processComponents() {
        const components = document.querySelectorAll('[data-component]:not([data-loaded])');
        if (components.length === 0) return;

        const loadPromises = Array.from(components).map(async (element) => {
            const componentName = element.getAttribute('data-component');
            if (componentName === 'loader') return;

            element.setAttribute('data-loaded', 'true');

            try {
                const response = await fetch(`components/${componentName}.html`);
                if (!response.ok) throw new Error(`Status ${response.status}`);
                const html = await response.text();
                element.innerHTML = html;
                await processComponents(); 
            } catch (error) {
                console.warn(`[Loader] Failed to load component: ${componentName} (${error.message})`);
                element.style.display = 'none'; 
            }
        });

        await Promise.all(loadPromises);
    }

    await processComponents();
    updateProgress(40);

    // 2. Dynamic Feature Loading
    const features = [];
    if ($(".hero-bg").length > 0) features.push('hero');
    if ($("#logos-container").length > 0) features.push('logos');
    if ($("#home-categories-container").length > 0) features.push('home-services');
    if ($("#portfolio-carousel").length > 0) features.push('portfolio');
    if ($("#reviews-container").length > 0) features.push('reviews');
    if ($("#team-container").length > 0) features.push('team');
    if ($("#subscribe-container").length > 0 || $(".subscribe-form").length > 0) features.push('subscribe');
    if ($("#services").length > 0 || $("#experience-intro").length > 0 || $("#icon-service-container").length > 0) features.push('services');
    if ($("#icon-service-container").length > 0) features.push('icon-service');
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
    updateProgress(60);
    
    // 3. Load and apply site-wide configuration
    const configArray = await Data.fetch('config');
    let config = {};
    if (configArray.length > 0) {
        configArray.forEach(item => {
            if (!item.key) return;
            config[item.key] = item.value;
        });
        Utils.applyConfig(config);

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
    updateProgress(75);

    // 4. Initialize UI interactions
    if (typeof App !== 'undefined') {
        App.init(config);
    }

    // 5. Signal ready
    document.dispatchEvent(new CustomEvent('appReady'));

    // 5b. Wait for critical hero images
    const criticalElements = document.querySelectorAll('[style-bg-config-key]');
    let loadedCount = 0;
    const totalToLoad = criticalElements.length;

    const imagePromises = Array.from(criticalElements).map(el => {
        return new Promise(resolve => {
            const style = window.getComputedStyle(el);
            const bg = style.backgroundImage;
            let loaded = false;
            
            const handleLoad = () => {
                if (loaded) return;
                loaded = true;
                loadedCount++;
                const progressBonus = totalToLoad > 0 ? (loadedCount / totalToLoad) * 20 : 20;
                updateProgress(75 + progressBonus);
                resolve();
            };

            if (!bg || bg === 'none') {
                setTimeout(() => {
                    const retryBg = window.getComputedStyle(el).backgroundImage;
                    if (retryBg && retryBg !== 'none') {
                        const url = retryBg.slice(5, -2).replace(/"/g, "");
                        preloadImage(url, handleLoad);
                    } else {
                        handleLoad();
                    }
                }, 150);
            } else {
                const url = bg.slice(5, -2).replace(/"/g, "");
                preloadImage(url, handleLoad);
            }
        });
    });

    function preloadImage(url, callback) {
        if (!url || url.length < 5) return callback();
        const img = new Image();
        img.onload = callback;
        img.onerror = callback;
        img.src = url;
        setTimeout(callback, 2500);
    }

    if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
    }
    
    updateProgress(100);

    // 6. Hide loader
    setTimeout(() => {
        if (phraseInterval) clearInterval(phraseInterval);
        const loader = document.getElementById('site-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 800);
        }
    }, 400); 
}

document.addEventListener('DOMContentLoaded', loadComponents);
