# StylePlanIt Portfolio Website Project Context

This document provides a summary of the StylePlanIt website project for context continuity.

## 1. Project Overview

*   **Project:** A portfolio website for StylePlanIt, a premium personal styling consultancy in Toronto.
*   **Founders:** Ayushi Vyas and Deepesh Mehta.
*   **Mission:** To combine the immigrant experience with professional styling.
*   **Production Domain:** `https://styleplanit.com` (Managed via Cloudflare).
*   **Hosting:** GitHub Pages.

## 2. Technical Philosophy

*   **Aesthetic & Design System:**
    *   **Images:** Managed via a hybrid model. Static assets are discovered via `assets_manifest`. Page-specific content uses relative paths from Google Sheets.
    *   **Folder Structure:** Assets are organized by logical function (e.g., `assets/images/services-by-category/`, `assets/images/portfolio/`).
    *   **Standardized Assets:** Brand logos use the `.brand-logo-item` class (`180x80px`, `object-fit: contain`).
    *   **Overall Aesthetic:** "Luxury Minimalist," "Old Money," "Editorial." Clean lines, sharp edges, and generous whitespace.
    *   **Color Palette:**
        *   **Primary Accent:** `#0c4524`
        *   **Background (Cream):** `rgb(240 238 230 / 90%)` (Variable: `--cream`)
        *   **Text:** `#0F0F0F` (Headings), `#2A2A2A` (Body)
*   **Typography Standards:**
    *   **Headings (Serif):** 'Cormorant Garamond'
    *   **Body (Sans-Serif):** 'Montserrat'
    *   **Special Characters:** Use literal symbols (e.g., `©`, `—`, `🩷`) in `site-data.json` instead of unicode escapes for better readability and rendering.
*   **Styling Standards:**
    *   **No Inline Styles:** All styling must reside in CSS files (`common.css`, `desktop.css`, etc.).
    *   **Placeholders:** HTML templates use `[PLACEHOLDER]` text for any element controlled by a `*-config-key` to signal dynamic injection.
*   **URL & Routing Policy:**
    *   **Clean URLs:** The site uses extensionless URLs (e.g., `/services`, `/reviews`).
    *   **Home Path:** Use `/` instead of `index.html`.
    *   **Local Parity:** Use `scripts/dev_server.py` for local development to ensure clean URL support matches GitHub Pages production behavior.

## 3. Tech Stack & File Structure

*   **Frameworks:** jQuery.
*   **Core Logic:**
    *   `js/loader.js`: Component injector and feature orchestrator.
    *   `js/app.js`: Global feature initialization and navigation.
*   **Plugin Features (`js/features/`):**
    *   `home-services.js`: Renders category-based program cards.
    *   `portfolio.js`: Handles side-by-side "Before/After" transformation pairing.
    *   `reviews.js`: Smart rendering with shuffle/limit support.
    *   `auth.js`: "Icon Service" gated access via real-time sheet lookup.
*   **Tooling:**
    *   `scripts/dev_server.py`: Custom local server with clean URL support.
    *   `scripts/diff_site_data.py`: Interactive 3-way sync engine with upfront summary and bulk resolution.
    *   `scripts/sync_engine.py`: Assets manifest generator and Sheets-to-JSON aggregator.

## 4. Data & Configuration Layer

*   **Atomic Source:** `configs/site-data.json` is the single source of truth for the frontend.
*   **Data Audit Workflow:**
    1.  Run `scripts/diff_site_data.py` to compare local vs. remote.
    2.  Use the `~~` delimiter CSVs in `scripts/diff_outputs/` to update Google Sheets (avoids comma-splitting errors).
    3.  Bump the major version (e.g., `4.0.0`) in `site-data.json` to force-flush client-side caches upon major updates.
*   **Caching:** Stale-While-Revalidate pattern with 24-hour TTL and active version enforcement.

## 5. Component Features

*   **Portfolio Band:** Editorial-style slider featuring "Before/After" transformation pairs (black background, discreet labels).
*   **Smart Reviews:** Randomized 3-review preview on the homepage; full list on the dedicated `/reviews` page.
*   **Icon Service:** Premium, invitation-only section with a fixed background image and dark overlay for high visual impact.

## 6. Development & Safety

*   **Feature Branching:** Develop all changes on `feature/` branches.
*   **User Verification (Mandatory):** AI assistants must NEVER commit changes without presenting a specific code diff to the user and receiving explicit confirmation to proceed.
*   **Data Integrity:** All fetch operations default to safe empty arrays `[]` to prevent crashes.
*   **Asana Integration:** AI assistants must source `.env.asana` in subshells to keep tokens invisible from logs.

## 7. Current Project State (March 2026)

*   **Status:** Production-ready with version 4.0.0 and clean URL infrastructure.
*   **Recent Wins:** Homepage redesign, Before/After portfolio pairing, optimized sync tools, and transition to extensionless routing.
*   **Next Priorities:**
    1.  **Refactor:** Centralize shared HTML boilerplate.
    2.  **Automation:** Implement script-based write-back to Google Sheets to replace manual CSV pasting.
    3.  **Performance:** Audit image sizes in the portfolio band.
