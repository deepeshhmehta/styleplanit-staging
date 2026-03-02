/**
 * icon-service.js - Icon Service gated collection logic (Component-based)
 */
const IconServiceFeature = {
  init: async function () {
    console.log("🔍 [IconService] Init started...");
    const container = $("#icon-service-container");
    if (container.length === 0) return;

    const isAuthenticated = sessionStorage.getItem("icon_service_auth") === "true";
    console.log("🔍 [IconService] Authenticated:", isAuthenticated);
    
    if (!isAuthenticated) {
        await this.renderGate(container);
        return;
    }

    console.log("🔍 [IconService] User authorized, loading layout component...");
    document.body.classList.add("icon-service-page");
    
    await this.loadView(container, 'components/icon-service-layout.html');
    
    // Refresh master data specifically here since access state might have changed data access needs
    const configArray = await Data.fetch('config');
    const config = {};
    configArray.forEach(item => config[item.key] = item.value);
    Utils.applyConfig(config);

    if (typeof ServicesFeature !== 'undefined') {
        console.log("🔍 [IconService] Initializing Services Grid...");
        await ServicesFeature.init({ filter: "Icon Service", mode: "include", autoExpand: true, noScroll: true });
    }
  },

  loadView: async function (container, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load component: ${componentPath}`);
        const html = await response.text();
        container.html(html);
    } catch (error) {
        console.error("❌ [IconService] Component load error:", error);
        container.html('<p class="text-center section-padding">Service temporarily unavailable. Please refresh.</p>');
    }
  },

  renderGate: async function (container) {
    await this.loadView(container, 'components/icon-auth-gate.html');
    
    // Apply config to the newly loaded gate
    const configArray = await Data.fetch('config');
    const config = {};
    configArray.forEach(item => config[item.key] = item.value);
    Utils.applyConfig(config);

    $("#icon-gate-form").on("submit", async (e) => {
        e.preventDefault();
        const email = $("#icon-gate-email").val().toLowerCase().trim();
        const errorEl = $("#icon-gate-error");
        
        errorEl.hide();
        
        try {
            const spreadsheetId = config.ACCESS_SPREADSHEET_ID;
            const gid = config.ACCESS_GID;

            if (!spreadsheetId || !gid) throw new Error("Access configuration missing");

            const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/pub?gid=${gid}&output=csv&t=${new Date().getTime()}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch live access list");
            
            const csvText = await response.text();
            const accessList = Utils.parseCSV(csvText);
            
            // Check only for email validity
            const user = accessList.find(u => u.email && u.email.toLowerCase().trim() === email);

            if (user) {
                sessionStorage.setItem("icon_service_auth", "true");
                this.init();
            } else {
                errorEl.text("Access denied. Opening request access form...").fadeIn();
                setTimeout(() => {
                    window.open(config.ICON_CAL_HREF || "https://cal.com/styleplanit/the-icon-service", "_blank");
                    errorEl.text("Request form opened in new tab. Please register to continue.");
                }, 2000);
            }
        } catch (error) {
            console.error("Access error:", error);
            errorEl.text("System error. Please try again later.").fadeIn();
        }
    });
  }
};
