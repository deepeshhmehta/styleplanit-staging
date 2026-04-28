# StylePlanIt Technical Architecture

This document details the core logic and orchestration patterns of the StylePlanIt website for the **v1.1.1 Production Baseline**.

## 1. Orchestration Philosophy
StylePlanIt uses a **Single-Page Initialization (SPI)** pattern. While the site has multiple HTML files, the logic is unified through a central loader and orchestrator. 

### Modular CSS & Design Tokens
The project utilizes a modular, component-based system driven by **Design Tokens**:
*   **`styles/base/`**: Global resets, typography, and core navigation.
*   **`styles/variables.css`**: The "Source of Truth" for the visual system. Includes a granular **Spacing Scale** (`--space-sm` to `--space-section`) and **Transition Tokens**.
*   **`styles/components/`**: Isolated styles for specific UI modules.
*   **`styles/styles.css`**: Central orchestrator for all CSS modules.

### Pattern-Driven Engineering
We minimize "Magic Numbers" by centralizing logic-critical constants:
*   **Global JS Config**: `js/config.js` houses site-wide infrastructure tokens (Breakpoints, Animation Timings, Scroll Offsets).
*   **Feature Config**: Individual features (e.g., `promos.js`) use local `CONFIG` or `LAYOUT` objects derived from global tokens.

## 2. Core Components

### `js/loader.js` (The Engine)
The loader handles the dynamic hydration of the platform:
*   **Dynamic Feature Injection**: Scans the DOM and only loads the JS features required for the current page view (e.g., `learn.js` only loads on the wiki page).
*   **Visual Stability**: Preloads critical background images before hiding the loading overlay.
*   **Recursive Component Loading**: Injects reusable HTML blocks from `/components/`.

### `js/app.js` (The Orchestrator)
Initializes global UI behaviors and handles **Efficient Event Delegation**. We prefer delegating events to stable parent containers rather than the global `document` to minimize listener overhead.

### `js/features/analytics.js` (Telemetry 2.0)
A structured event schema capturing high-fidelity intent data:
*   **`ui_interaction`**: Clicks, toggles, and UI resets.
*   **`content_engagement`**: Views, scroll-depth tracking, and read completions.
*   **`generate_lead`**: Source-attributed lead generation events.
*   **Debug Layer**: Includes a local `Analytics-Debug` logger for non-production verification.

## 3. High-Impact Feature Patterns

### "Pick A Journey" (Horizontal Interface)
Located in `js/features/home-services.js`:
*   **Horizontal Carousel**: Transitioned from vertical expansion to a high-fidelity horizontal model.
*   **Index-Based Centering**: Uses mathematical positioning for pixel-perfect alignment across all breakpoints (Mobile, Tablet fixed 550px, Desktop).
*   **Context-Aware Anchoring**: Factors in `scroll-padding` and `scroll-margin` to maintain vertical context during expansion/contraction cycles.

### Unified Promotion System (Promos 1.0)
Located in `js/features/promos.js`:
*   **Multi-Mode Engine**: Supports `Inline` cards, `Floating` toasts, and full-screen `Modal` takeovers.
*   **Persistence Pattern**: Dismissed modals can convert to a persistent "trigger icon" in the CTA stack, maintaining conversion opportunities without friction.
*   **Automated Lifecycle**: Includes an `expiryDate` logic layer for zero-maintenance campaign deactivation.

### "Bespoke Services" (Intelligent Discovery)
Located in `js/features/services.js`:
*   **Seen State Tracking**: Utilizes a high-performance `Set` to track viewed services, providing visual grayscale/opacity feedback.
*   **Luxury Sorting**: A custom glassmorphic component replacing standard OS selects.

## 4. Stability & Security Best Practices
*   **Safe State Management**: URI-encoded Base64 key generation for Unicode/Emoji support in session storage.
*   **Hardware Acceleration**: Use of `backface-visibility: hidden` to prevent sub-pixel rendering glitches in complex transforms.
*   **Secure Links**: Mandatory `rel="noopener noreferrer"` for all `target="_blank"` integrations.
