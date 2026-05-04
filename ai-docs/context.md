# StylePlanIt Context & Governance

This document provides the high-level project summary and critical safety mandates. For deep-dives into architecture, data, or workflows, consult the [**Encyclopedia Index**](index.md).

## 1. Project Overview

*   **Project:** A portfolio website for StylePlanIt, a premium personal styling consultancy in Toronto.
*   **Founders:** Ayushi Vyas and Deepesh Mehta.
*   **Mission:** To combine the immigrant experience with professional styling.
*   **Stack:** Vanilla HTML/CSS, jQuery, Python (Automation), Playwright (Testing).
*   **Production Domain:** `https://styleplanit.com` (Managed via Cloudflare).
*   **Staging Domain:** `https://staging.styleplanit.com` (Sync via GitHub Action).

## 2. High-Level Design Standards

*   **Aesthetic:** "Luxury Minimalist," "Modern Dribbble," "Editorial Layout."
*   **Design Token:** Centrally managed via `variables.css` (Spacing Scale & Transitions).
*   **Typography:** 'Cormorant Garamond' (Headings/Display), 'DM Sans' (Body/Labels).
*   **Routing:** Extensionless URLs. Supports anchor-link deferred hydration.

## 3. Safety & Governance

*   **CRITICAL: THE AGENT IS FORBIDDEN FROM PUSHING DIRECTLY TO `main`, `staging`, OR `develop`.**
*   **Workflow Requirement:** All changes must be pushed to a feature/fix branch and merged via Pull Request.
*   **Mandatory QA:** Agents MUST run and pass `./qa.sh local` before concluding any technical task.

## 4. Current State (v1.1.2)
The platform has evolved into an **Enterprise-Grade Authority Platform**. It features a robust, configuration-driven architecture with automated regression testing and high-fidelity telemetry.

### Recent Major Wins:
- **v1.1.0 (The UX Pivot)**: Transitioned the core "Journey" interface to a high-fidelity horizontal carousel and deployed **Telemetry 2.0** for intent-based user tracking.
- **v1.1.1 (Marketing & Engine Core)**: Launched **Promos 1.0** (Unified Promotion System) and modernized the "Bespoke Services" discovery with custom glassmorphic sorting and "Seen" state tracking.
- **v1.1.2 (QA Automation)**: Established the **StylePlanIt QA Engine**, a Playwright-powered E2E suite with mandatory CI/CD PR hooks to ensure zero-regression deployments.
- **Engineering Excellence**: Purged magic numbers, centralized logic infrastructure in `js/config.js`, and implemented efficient event delegation across all features.
