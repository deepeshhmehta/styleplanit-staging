/**
 * utils.js - Shared utility functions
 */
const Utils = {
    /**
     * Robust CSV parser (kept for local processing by other tools if needed)
     */
    parseCSV: function(data) {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 1) return [];

        const parseCSVRow = (line) => {
            const result = [];
            let currentField = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                        currentField += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(currentField.trim());
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            result.push(currentField.trim());
            return result;
        };

        const header = parseCSVRow(lines[0]);
        const results = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVRow(lines[i]);
            const row = {};
            for (let j = 0; j < header.length; j++) {
                row[header[j]] = values[j] !== undefined ? values[j] : '';
            }
            results.push(row);
        }
        return results;
    },

    /**
     * Applies configuration object to elements with specific data attributes.
     * Can be applied to a specific container for efficiency.
     */
    applyConfig: function(config, container = document) {
        if (!config || Object.keys(config).length === 0) return;

        container.querySelectorAll('[text-config-key]').forEach(element => {
            const key = element.getAttribute('text-config-key');
            if (config[key] !== undefined) {
                if (key === 'LOGO_TEXT') {
                    element.innerHTML = config[key];
                } else {
                    element.textContent = config[key];
                }
            }
        });

        container.querySelectorAll('[href-config-key]').forEach(element => {
            const key = element.getAttribute('href-config-key');
            if (config[key] !== undefined) {
                let value = config[key];
                if (key === 'WHATSAPP_NUMBER' && !value.startsWith('http')) {
                    value = `https://wa.me/${value.replace(/\D/g, '')}`;
                }
                element.href = value;
            }
        });

        container.querySelectorAll('[placeholder-config-key]').forEach(element => {
            const key = element.getAttribute('placeholder-config-key');
            if (config[key] !== undefined) element.placeholder = config[key];
        });

        container.querySelectorAll('[src-config-key]').forEach(element => {
            const key = element.getAttribute('src-config-key');
            if (config[key] !== undefined) element.src = config[key];
        });

        container.querySelectorAll('[property-config-key]').forEach(element => {
            const key = element.getAttribute('property-config-key');
            if (config[key] !== undefined) element.setAttribute('content', config[key]);
        });

        container.querySelectorAll('[style-bg-config-key]').forEach(element => {
            const key = element.getAttribute('style-bg-config-key');
            if (config[key] !== undefined) {
                element.style.backgroundImage = 'url("' + config[key] + '")';
            }
        });

        // Meta tags only need to be updated once globally
        if (container === document) {
            if (config['PAGE_DESCRIPTION']) {
                this.updateMeta('description', config['PAGE_DESCRIPTION']);
                this.updateMeta('og:description', config['PAGE_DESCRIPTION'], 'property');
            }
            if (config['PAGE_TITLE']) {
                this.updateMeta('og:title', config['PAGE_TITLE'], 'property');
            }
            if (config['OG_IMAGE']) {
                this.updateMeta('og:image', config['OG_IMAGE'], 'property');
            }
        }
    },

    /**
     * Centralized way to fetch and apply config in one call.
     */
    getConfig: async function() {
        const master = await Data.loadMasterData();
        this.applyConfig(master);
        return master;
    },

    updateMeta: function(name, content, attr = 'name') {
        if (!document.head) return; // Ensure head is available
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }
};

/**
 * Data - Centralized data provider using atomic site-data.json and site-config.json
 */
const Data = {
    masterData: null,

    /**
     * Load the master JSON files
     */
    loadMasterData: async function() {
        if (this.masterData) return this.masterData;
        
        try {
            // Check cache and TTL (24 hours)
            const cached = localStorage.getItem('site_data_cache');
            const cacheTime = localStorage.getItem('cache_timestamp');
            const now = new Date().getTime();
            const dayInMs = 24 * 60 * 60 * 1000;

            if (cached && cacheTime && (now - cacheTime < dayInMs)) {
                this.masterData = JSON.parse(cached);
                // Background refresh for next visit
                this.refreshMasterData();
                return this.masterData;
            }
            
            // If expired or missing, fetch immediately
            return await this.refreshMasterData();
        } catch (e) {
            console.error("Critical error loading site data", e);
            return null;
        }
    },

    /**
     * Fetch fresh JSON from repository (Atomic split)
     */
    refreshMasterData: async function() {
        try {
            const timestamp = new Date().getTime();
            const [dataRes, configRes] = await Promise.all([
                fetch(`${CONFIG.DATA_PATH}?v=${timestamp}`),
                fetch(`/configs/site-config.json?v=${timestamp}`)
            ]);

            if (dataRes.ok && configRes.ok) {
                const freshData = await dataRes.json();
                const freshConfig = await configRes.json();
                const now = new Date().getTime();
                
                // Unified object
                const unified = { ...freshData, ...freshConfig };
                
                // Version check logic
                const newVersion = freshConfig.VERSION || "0.0.0";
                const cachedVersion = localStorage.getItem('app_version');
                
                // If versions mismatch, clear cache and reload to force fresh state
                if (cachedVersion && cachedVersion !== newVersion) {
                    console.log(`New version detected: ${newVersion}. Purging cache and reloading...`);
                    localStorage.removeItem('site_data_cache');
                    localStorage.setItem('app_version', newVersion);
                    localStorage.setItem('cache_timestamp', now);
                    window.location.reload(); 
                    return unified;
                }

                localStorage.setItem('app_version', newVersion);
                localStorage.setItem('site_data_cache', JSON.stringify(unified));
                localStorage.setItem('cache_timestamp', now);
                this.masterData = unified;
                return unified;
            }
        } catch (e) {
            console.warn("Failed to refresh site data from server", e);
        }
        return this.masterData;
    },

    /**
     * Simplified fetch logic
     */
    fetch: async function(type) {
        const master = await this.loadMasterData();
        return (master && master[type]) ? master[type] : [];
    },

    /**
     * Simple config helper
     */
    getConfig: function(key) {
        if (!this.masterData) return null;
        return this.masterData[key] !== undefined ? this.masterData[key] : null;
    },

    /**
     * Backward compatibility checkVersion
     */
    checkVersion: async function() {
        await this.loadMasterData();
    }
};
