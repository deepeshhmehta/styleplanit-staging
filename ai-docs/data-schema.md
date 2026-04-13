# StylePlanIt Data Schema

`configs/site-data.json` is the atomic source of truth for the entire website. This document defines its structure.

## 1. Schema Overview

### `version` (Array)
*   Used for cache busting. Incrementing this value forces clients to fetch fresh data.

### `config` (Array)
Key-Value pairs for global site settings.
*   `VALUE_*`: Storytelling copy for the "Why Styling" section.
*   `NAV_LINK_*`: Anchor-based URLs (e.g., `/#services`).
*   `PILL_TAG`: The floating hero badge text.

### `categories` (Array)
Defines the **Service Bundles** shown in "Pick A Journey."
*   `name`: Display title (Establish, Reclaim, Elevate).
*   `short_description`: Displayed in minimized card state.
*   `description`: Displayed in expanded card state.
*   `price`: Formatted string (e.g., "$330").
*   `inclusions`: Pipe-separated string (`|`) for list generation.
*   `booking_link`: Direct link to scheduling (Cal.com).
*   `image_url`: Path to background image.

### `services` (Array)
Individual **À La Carte** offerings shown on the Experiences page.
*   **Note:** Categorized as "Bespoke" but filtered to exclude "Icon Service."
*   `footer`: Comma-separated tags for icon-chip generation.

### `team` (Array)
Profiles for "The Collective."
*   `bio`: Long-form text. Displayed with `text-align: justify`.

### `articles` (Array)
Style Wiki content. Managed via the **Article Publication Workflow**.

## 2. Synchronization Logic
Data flow: **Google Sheets** → **CSV** → **site-data.json** → **Website UI**.

*   Use `scripts/diff_site_data.py` to bridge local changes to the Sheet.
*   Use `scripts/sync_engine.py` to bulk-override local data from the Sheet.
