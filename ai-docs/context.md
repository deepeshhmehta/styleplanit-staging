# StylePlanIt Context & Governance

This document provides the high-level project summary and critical safety mandates. For deep-dives into architecture, data, or workflows, consult the [**Encyclopedia Index**](index.md).

## 1. Project Overview

*   **Project:** A portfolio website for StylePlanIt, a premium personal styling consultancy in Toronto.
*   **Founders:** Ayushi Vyas and Deepesh Mehta.
*   **Mission:** To combine the immigrant experience with professional styling.
*   **Stack:** Vanilla HTML/CSS, jQuery, Python (Automation).
*   **Production Domain:** `https://styleplanit.com` (Managed via Cloudflare).
*   **Staging Domain:** `https://staging.styleplanit.com` (Sync via GitHub Action).

## 2. High-Level Design Standards

*   **Aesthetic:** "Luxury Minimalist," "Modern Dribbble," "Editorial Layout."
*   **Design Token:** Standard Border Radius (`40px`).
*   **Typography:** 'Cormorant Garamond' (Headings/Display), 'DM Sans' (Body/Labels).
*   **Routing:** Extensionless URLs. All navigation links default to homepage anchors (e.g., `/#services`).

## 3. Safety & Governance

*   **CRITICAL: UNLESS EXPLICITLY INSTRUCTED TO PUSH, NEVER PUSH CODE.**
*   **Branching Strategy:**
    *   `main`: Production (Locked).
    *   `staging`: Pre-release testing (`https://staging.styleplanit.com`).
    *   `develop`: Integration branch (`https://develop.styleplanit.com`).
*   **Verification:** Mandatory `test.sh` run before PR creation.

## 4. Current State (v5.2.0)
The site has transitioned to an **Authority Platform**. The "Service Grid" has been unified into a single high-impact à-la-carte menu with fade-based state transitions. The "Package Bundle" model remains the core conversion driver on the homepage. Typography has been consolidated to two premium families (Cormorant Garamond / DM Sans).

**v5.2 Refinements:**
*   **Asset Logic:** Hero slideshow now uses filename-based orientation detection (`-portrait` / `-landscape`) for optimized framing.
*   **Reviews:** Added dynamic "Read more/less" toggle with auto-scroll and improved framing for laptop screens.
*   **Architecture:** Successfully modularized CSS into base and component layers for improved maintainability.
