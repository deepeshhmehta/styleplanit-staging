# StylePlanIt Business Workflows

This document details the procedures for managing site content and environments.

## 1. Tiered Promotion Lifecycle

The project follows a strict tiered promotion model to ensure environment stability and a clean, readable commit history.

### Phase 1: Integration (Develop)
*   **Targeting:** ALL Pull Requests from feature or fix branches MUST target the `develop` branch.
*   **Merge Strategy:** **Squash and Merge**. This collapses granular feature development into a single semantic commit on `develop`.
*   **Preview:** Merging triggers the `develop-sync.yml` action, deploying to `https://develop.styleplanit.com`.
*   **Verification:** Visual and functional sign-off in the develop environment.

### Phase 2: Synchronization (Data Fix)
*   Before promotion, ensure Google Sheets "Master Data" is synchronized.
*   **Process:** Run `python3 scripts/diff_site_data.py`. If local changes exist, reconcile them and update the Google Sheet via CSV paste.

### Phase 3: Validation (Staging)
*   **Promotion:** **Direct Fast-Forward** from `develop` to `staging`.
*   **PR Requirement:** A Pull Request MUST be opened from `develop` to `staging` for visibility and audit trail.
*   **Merge Strategy:** **Fast-Forward Merge** (No Squash).
*   **Preview:** Merging triggers `staging-sync.yml`, deploying to `https://staging.styleplanit.com`.

### Phase 4: Release (Main)
*   **Promotion:** **Direct Fast-Forward** from `staging` to `main`.
*   **PR Requirement:** A Pull Request MUST be opened from `staging` to `main` for final sign-off.
*   **Merge Strategy:** **Fast-Forward Merge** (No Squash).
*   **Production:** Merging deploys to the live production site `https://styleplanit.com`.

## 2. Content Updates (Bespoke Services)

To update the individual services on the Experience page:
1.  Edit `services` array in `configs/site-data.json`.
2.  **Price Display:** Prices added here automatically appear on grid cards and detail takeovers.
3.  **Footer Icons:** Use comma-separated strings. Mapping is defined in `js/features/services.js`.
4.  **Sync:** Run `python3 scripts/diff_site_data.py` to push changes to the Google Sheet.

## 3. Marketing Campaigns (Promos 1.0)

To launch a new promotion (e.g., Father's Day):
1.  **Image:** Upload background to `assets/images/promos/`.
2.  **Config:** Update `dialogs` array in `site-data.json`.
    *   Set `type` to `modal` for high impact.
    *   Set `persist` to `TRUE` to keep a gift icon visible after dismissal.
    *   Set `expiryDate` to automate deactivation.
3.  **Telemetry:** Monitor `promo_click` and `reopen` events in GA4 for performance analysis.

## 4. Technical Audit Protocol (Principal Engineer Mode)

Before concluding any refactor, perform **Surgical Scrutiny**:

1.  **Security Hardening:** Every `target="_blank"` link MUST have `rel="noopener noreferrer"`.
2.  **Token Integrity:** Ensure all new spacing uses `--space-*` variables and all timings use `CONFIG.THEME.ANIMATION`.
3.  **Memory Leak Audit:** Scrutinize event delegation. Prefer parent-level container listeners over global `document` listeners.
4.  **Responsiveness:** Verify iPad fixed-width constraints and mobile internal-scroll modal logic.
