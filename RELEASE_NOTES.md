# Style Plan(it) Release Notes

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-05-03 (Milestone: Platform Governance & v2 Architecture)
### Added
- **Self-Healing QA Engine**: Implemented tiered parallel execution (50% faster) and automatic sequential retries to eliminate environmental flakiness.
- **PR Audit Workflow**: Integrated GitHub Actions to enforce semantic version jumps for all PRs targeting `staging` or `main`.
- **Architectural Integrity Tests**: Added automated verification for security headers, data schema validity, and responsive UX ordering.

### Changed
- **Smart Data Normalization**: Improved the diff engine to recursively handle Google Sheets numerical formatting (e.g., treating `2.0.0` and `2` as equivalent).
- **Context Evolution**: Updated project governance docs to reflect the new Tiered Promotion Model.

## [1.2.0] - 2026-05-03 (Project Milestone: Demographic Expansion)
### Added
- **Alternating Category Imagery**: Implemented a dynamic demographic rotation system (Male/Female) for 'Pick Your Journey' cards to broaden customer appeal.
- **Cross-Fade Transition**: Smooth 1.2s visual tempo for image rotation using a layered CSS opacity system.
- **New Male Assets**: Integrated 3 high-fidelity male hero images generated via Nano Banana.
- **Configurable Timing**: Added `CATEGORY_IMAGE_ROTATION_INTERVAL` to `site-config.json` for centralized UI control.

### Removed
- **Sync Engine Purge**: Deleted the deprecated `scripts/sync_engine.py` to enforce strict 'No direct to Main' governance and PR-only deployments.

### Changed
- **Data Schema**: Refactored `categories` to support `image_urls` (pipe-separated) instead of a single `image_url`.
- **Tooling**: Refactored `sync-styleplanit.command` to utilize the `diff_site_data.py` auditor as the primary local data tool.

### Fixed
- **JS Error**: Resolved a `Data.loadMasterData` TypeError in `home-services.js` that occurred during feature initialization.

## [1.1.1] - 2026-05-03 (UX: Social Footprint)
### Added
- **Social Links**: Integrated TikTok (@ayushivyasofficial) and LinkedIn (/ayushi-vyas) to the footer.
- **Email Migration**: Updated primary contact email to `info@styleplanit.com`.

### Changed
- **Responsive Footer**: Implemented a dual-row layout for mobile and tablet devices:
  - Row 1: Grouped social icons (IG, TT, Email, LI) with pipe separators.
  - Row 2: Centered and expanded phone number for high-visibility contact.
- **UI Polish**: Migrated from inline `&nbsp;` to CSS-driven spacing for icons.

## [1.1.0] - 2026-04-26 (Infrastructure: Marketing & Stability)
### Added
- **Unified Promotion System**: Automated Mother's Day promo with expiry logic and persistent trigger support.
- **QA Engine (v1.0)**: Introduced an automated E2E testing suite using Playwright.

### Fixed
- **Mobile Stabilization**: Optimized modal proportions and safe-area alignment specifically for iPhone viewports.

## [1.0.0] - 2026-04-24 (The Go-Live Baseline)
### Added
- **Official Production Launch**: Initial release of the Style Plan(it) Toronto consultancy site.
- **Core Experience**: "Pick a Journey" (Establish, Reclaim, Elevate) and the modular Styling Menu.
- **Data-Driven Core**: Implementation of the atomic split configuration (`site-data.json` and `site-config.json`).
