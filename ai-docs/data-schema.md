# StylePlanIt Data Schema

The platform uses a **Split-Atom** data model to separate UI metadata from structured content.

## 1. `configs/site-config.json` (Flat Metadata)

Contains flattened Key-Value pairs for UI strings and infrastructure.
*   **`VERSION`**: Platform version (v1.1.1).
*   **`ACCESS_*`**: Credentials for remote data syncing.
*   **`STEP_2_BUTTON_*`**: Primary lead generation configurations.

## 2. `configs/site-data.json` (Structured Content)

### `dialogs` (Promos 1.0)
This array powers the **Unified Promotion System**.
*   `type`: `inline`, `floating`, or `modal`.
*   `imageUrl`: Optional background for themed promos.
*   `persist`: `"TRUE"` converts dismissed modals into floating triggers.
*   `expiryDate`: `YYYY-MM-DD` for automated deactivation.
*   `action`: Target URL (automatically appends subtitle as `notes`).

### `categories` (Journey Bundles)
*   `showOnHomePage`: `"TRUE"` triggers horizontal carousel rendering.
*   `inclusions`: Pipe-separated (`|`) for list generation.

### `services` (À La Carte)
*   `price`: Formatted string (displayed in grid and details).
*   `footer`: Comma-separated tags mapped to FontAwesome icons.

### `assets_manifest`
Automatically indexed inventory of site images.

## 3. Configuration Tokens (`js/config.js`)

Centralized JavaScript object for logic infrastructure:
*   **`THEME.BREAKPOINTS`**: 1024 (Tablet), 768 (Mobile).
*   **`THEME.ANIMATION`**: Standardized durations (Fast: 300ms, Standard: 400ms, Slow: 600ms).
*   **`THEME.SCROLL`**: Global offsets and centering parameters.
