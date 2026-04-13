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
*   **Typography:** 'Bebas Neue' (Headings), 'DM Sans' (Body).
*   **Routing:** Extensionless URLs. All navigation links default to homepage anchors (e.g., `/#services`).

## 3. Safety & Governance

*   **CRITICAL: UNLESS EXPLICITLY INSTRUCTED TO PUSH, NEVER PUSH CODE.**
*   **Branching Strategy:**
    *   `main`: Production (Locked).
    *   `staging`: Pre-release testing.
    *   `develop`: Integration branch.
    *   `feature/*`: Active development.
*   **Verification:** Mandatory `test.sh` run before PR creation.

## 4. Current State (v5.0.0)
The site has undergone a major refactor. The "Service Grid" has been replaced by a "Package Bundle" model. The site is now an **Authority Platform** with a focus on value-based storytelling and persona recognition. 
