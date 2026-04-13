# StylePlanIt Technical Architecture

This document details the core logic and orchestration patterns of the StylePlanIt website following the v5.0 "Luxury Cutout" Refactor.

## 1. Orchestration Philosophy
StylePlanIt uses a **Single-Page Initialization (SPI)** pattern. While the site has multiple HTML files, the logic is unified through a central loader and orchestrator. 

### The "Site Wrapper" Pattern
Every page is wrapped in a `.site-wrapper` div. This achieves the "White Box on Green Backdrop" luxury card effect.
*   **Backdrop:** The `body` carries the `var(--primary-accent)` (Green) color and padding.
*   **Main Container:** `.site-wrapper` provides the white background, shadow, and `var(--standard-radius)` (40px) rounding.

## 2. Core Components

### `js/loader.js` (The Engine)
The loader is the first script executed. It handles:
*   **Recursive Component Loading:** Scans the DOM for `[data-component]` attributes, fetches the corresponding `.html` from `/components/`, and injects it.
*   **Dynamic Feature Detection:** Based on the presence of specific IDs or classes, it dynamically injects feature scripts (e.g., `js/features/hero.js`).
*   **Deep Link Anchoring:** Contains a post-load callback that checks for a URL hash (e.g., `/#services`) and executes a smooth scroll once all dynamic components are rendered.
*   **Visual Stability:** Preloads critical background images before hiding the loading overlay.

### `js/app.js` (The Orchestrator)
The orchestrator initializes global UI behaviors:
*   **Navigation:** Mobile menu translucent toggles and unified header behavior.
*   **Feature Lifecycle:** Calls `.init()` on all detected features (e.g., `HomeServicesFeature.init()`).
*   **Z-Index Management:** Standardized UI layering using variables:
    *   `--z-ui: 10` (Basic UI elements)
    *   `--z-sticky: 100` (Header/Nav)
    *   `--z-overlay: 500` (Floating buttons, overlays)
    *   `--z-modal: 1000` (Popups, focused states)
    *   `--z-loader: 9999` (Loading screen)

## 3. Anchor Scroll Lifecycle
Because components are loaded dynamically, standard browser anchor links (`#id`) often fail on initial load.
1.  **Loader Detection:** `loader.js` detects the hash in the URL.
2.  **App Init:** `app.js` waits for the feature grids (Packages, Personas) to initialize and render.
3.  **Deferred Scroll:** A 500ms `setTimeout` is triggered to calculate the final `offsetTop` of the dynamic component and perform a smooth scroll.

## 3. Key Feature Patterns

### "Pick A Journey" (Service Bundles)
Located in `js/features/home-services.js`, this uses a **State-Based Expansion** logic:
*   **Default State:** Centered flex-row cards showing `short_description`.
*   **Active State:** The section receives a `.has-active` class. The active card expands full-width (`order: -1`) and reveals `long_description`, `inclusions`, and a CTA. Minimized cards stack as cream-colored buttons.

### "Recognize Yourself" (Personas)
Located in `js/features/personas.js`, this uses **Horizontal Scroll Tracking**:
*   Calculates scroll percentage of the container to sync with a dot-indicator system.
*   Uses `var(--standard-radius)` for cards to match the global design system.

## 4. Initialization Lifecycle
1.  **DOM Content Loaded:** `loader.js` starts.
2.  **Phase 1 (Data):** Fetch `site-data.json` and check version.
3.  **Phase 2 (Components):** Recursively fetch and inject HTML components.
4.  **Phase 3 (Features):** Inject feature JS files.
5.  **Phase 4 (App Init):** Call `App.init()` for event listeners.
6.  **Phase 5 (Finalize):** Hide loader and execute **Scroll-to-Hash** callback.

## 5. Stability Best Practices
*   **Absolute Paths:** Always use `/` prefixes for deep-linked routes.
*   **Design Tokens:** Use `var(--standard-radius)` and `var(--charcoal-rgb)` instead of hardcoded values to ensure site-wide unity.
