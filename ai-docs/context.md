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
    *   **Standardized Assets:** Brand logos use the `.brand-logo-item` class (`180x80px` desktop / `120x50px` mobile, `object-fit: contain`).
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
    *   **`js/loader.js` (System Orchestrator):** 
        *   **Recursive Loading:** Automatically fetches and injects HTML components from the `components/` directory.
        *   **Visual Stability:** Preloads all critical images before fading out the site loader.
    *   **`js/app.js`:** Global feature initialization and navigation coordinate.
*   **Plugin Features (`js/features/`):**
    *   `services.js`: Powers the guided Experience journey with parallel data fetching.
    *   `portfolio.js`: Handles side-by-side "Before/After" transformation pairing.
    *   `reviews.js`: Randomized 3-review preview with horizontal scroll indicators.
    *   `icon-service.js`: Premium gated collection management.
*   **Tooling:**
    *   **`scripts/dev_server.py`:** Multi-threaded local server with clean URL support and interactive port handling.
    *   **`scripts/diff_site_data.py`:** Interactive 3-way sync engine.
    *   **`scripts/sync_engine.py`:** Assets manifest generator and Sheets aggregator.

## 4. Data & Configuration Layer

*   **Atomic Source:** `configs/site-data.json` is the single source of truth.
*   **Data Audit Workflow:**
    1.  Run `scripts/diff_site_data.py` to compare local vs. remote.
    2.  Update Google Sheets using generated CSVs.
    3.  Bump the major version (e.g., `4.5.0`) in `site-data.json` to force-flush client-side caches.
*   **Caching:** Stale-While-Revalidate pattern with 24-hour TTL and active version enforcement.

## 5. Component Features & Design Patterns

*   **Guided Services Experience:** A multi-stage journey (Category Pillars → Filtered Grid → Detached Details Box).
*   **Brand Pillars:** Replaced literal imagery in service deep-dives with solid primary-accent blocks featuring subtle brand watermarks to emphasize identity.
*   **Secondary Actions:** Unified minimalist link style (`.btn-secondary`) for low-friction actions like "Change Journey" or "Read More Reviews."
*   **Expandable CTAs:** Global floating buttons (Book Now, WhatsApp) that use a "Collapse & Expand" pattern to minimize screen footprint.
*   **Horizontal Affordance:** Space-saving horizontal scrollers for Logo Bands and Reviews on mobile/tablets, featuring dynamic scroll-dot indicators.
*   **Icon Service:** Premium, invitation-only section featuring full-page immersive background and focused collection view.

## 6. Development & Safety

*   **Asana Integration (Mandatory Habit):** 
    *   Every feature, bug fix, or documentation update must have a corresponding Asana task.
    *   AI assistants must move tasks to `Doing` at the start of a task and `Done` upon successful verification/push.
    *   Project: "Style Plan-It Launch Plan" (`1212636326772928`).
    *   **Token Extraction:** Use `grep` and `cut` in a subshell: `TOKEN=$(grep "ASANA_PAT" .env.asana | cut -d'=' -f2 | tr -d '\"' | tr -d "'" | tr -d '[:space:]')`.
*   **Source Control (Strict):**
    *   **No Auto-Push:** AI assistants must NEVER execute `git push` autonomously on `main`.
    *   **Feature Branching:** Every task occurs on a dedicated `feature/` or `fix/` branch. Only merge to `main` once stable and verified.
*   **Verification (Mandatory):** AI assistants must NEVER claim verification without running `test.sh`, `diff_site_data.py`, and responsive audits.

## 7. Current Project State (March 2026)

*   **Status:** Production-ready (Version 4.5.0).
*   **Recent Wins:**
    *   **Experience Refactor:** Staged services journey with detached details box.
    *   **Mobile Suite:** Multi-threaded dev server, horizontal scrollers, and consolidated media query architecture.
    *   **Infrastructure:** Parallel data fetching and 100% config-mapping for all UI elements.
*   **Next Priorities:**
    1.  **Architecture:** Decouple config into a dedicated `style-planit-config` repository (Asana: `1213485094305648`).
    2.  **Automation:** Implement script-based write-back to Google Sheets.
    3.  **Refactor:** Explore build-time static site generation (Vite/11ty).
