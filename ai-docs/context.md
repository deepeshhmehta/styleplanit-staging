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
    *   **`js/loader.js` (System Orchestrator):** 
        *   **Recursive Loading:** Automatically fetches and injects HTML components from the `components/` directory. Supports deep nesting.
        *   **Professional Fallback:** Missing components are hidden (`display: none`) to maintain UI integrity.
        *   **Visual Stability:** Preloads all critical images (detected via `style-bg-config-key`) before fading out the site loader.
    *   **`js/app.js`:** Global feature initialization and navigation coordinate.
*   **Plugin Features (`js/features/`):**
    *   `home-services.js`: Renders category-based program cards.
    *   `portfolio.js`: Handles side-by-side "Before/After" transformation pairing with `object-position: top center` prioritization.
    *   `reviews.js`: Smart rendering with shuffle/limit support.
*   **Tooling:**
    *   **`scripts/dev_server.py`:** Custom local server with clean URL support.
    *   **`scripts/diff_site_data.py`:** Interactive 3-way sync engine with upfront summary and bulk resolution (`All Local`, `All Sheets`, `Individual`).
    *   **`scripts/sync_engine.py`:** Assets manifest generator and Sheets-to-JSON aggregator.

## 4. Data & Configuration Layer

*   **Atomic Source:** `configs/site-data.json` is the single source of truth.
*   **Data Audit Workflow:**
    1.  Run `scripts/diff_site_data.py` to compare local vs. remote.
    2.  Use the `~~` delimiter CSVs in `scripts/diff_outputs/` to update Google Sheets (avoids comma-splitting errors).
    3.  Bump the major version (e.g., `4.0.0`) in `site-data.json` to force-flush client-side caches upon major updates.
*   **Caching:** Stale-While-Revalidate pattern with 24-hour TTL and active version enforcement.

## 5. Component Features

*   **Site Loader:** Branded overlay featuring a luxury progress bar and shuffling "Style Phrases" (driven by the `LOADER_PHRASES` pipe-separated config key).
*   **Portfolio Band:** Editorial-style slider featuring "Before/After" transformation pairs (black background, discreet labels).
*   **Smart Reviews:** Randomized 3-review preview on the homepage; full list on the dedicated `/reviews` page.
*   **Icon Service:** Premium, invitation-only section with a fixed background image and dark overlay for high visual impact.

## 6. Development & Safety

*   **Asana Integration (Mandatory Habit):** 
    *   Every feature, bug fix, or documentation update must have a corresponding Asana task.
    *   AI assistants must move tasks to `Doing` at the start of a task and `Done` upon successful verification/push.
    *   Project: "Style Plan-It Launch Plan" (`1212636326772928`).
    *   **Token Protection:** AI assistants must NEVER output the contents of `.env.asana`.
    *   **Token Extraction:** Use `grep` and `cut` in a subshell to extract the token: `TOKEN=$(grep "ASANA_PAT" .env.asana | cut -d'=' -f2 | tr -d '\"' | tr -d "'" | tr -d '[:space:]')`.
    *   **API Usage:** Always use this `$TOKEN` in the `Authorization: Bearer` header for Asana API calls.
*   **Source Control (Strict):**
    *   **No Auto-Push:** AI assistants must NEVER execute `git push` autonomously or as part of a commit proposal. 
    *   **Explicit Instruction Only:** `git push` can ONLY be executed if the user provides a direct, standalone "push" instruction after a commit.
*   **Feature Branching & Merging (Strict):** 
    *   **Always Branch Out:** AI assistants must NEVER commit directly to `main`. Every task, feature, or bug fix must occur on a dedicated `feature/` or `fix/` branch.
    *   **Incremental Commits:** Commit often on the feature branch as progress is made.
    *   **Stability First:** Only merge to `main` once the feature is stable, fully verified on a local server, and all health checks (`test.sh`) pass.
    *   **Clean Up:** Delete the feature branch locally and on remote after a successful merge to `main`.
*   **User Verification (Mandatory):** AI assistants must NEVER commit changes without presenting a specific code diff to the user and receiving explicit confirmation.
*   **Data Integrity:** All fetch operations default to safe empty arrays `[]` to prevent crashes.

## 7. Current Project State (March 2026)

*   **Status:** Production-ready with version 4.0.0 and modular component architecture.
*   **Recent Wins:** Recursive component loader, luxury progress bar with critical image preloading, and Before/After portfolio pairing.
*   **Next Priorities:**
    1.  **Architecture:** Decouple config into a dedicated `style-planit-config` repository (Asana: `1213485094305648`).
    2.  **Automation:** Implement script-based write-back to Google Sheets to replace manual CSV pasting.
    3.  **Refactor:** Centralize shared HTML boilerplate.
