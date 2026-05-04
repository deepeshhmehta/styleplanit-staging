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

## 4. Current State (v2.0.0)
The platform has evolved into an **Enterprise-Grade Authority Platform**. It features a robust, configuration-driven architecture with automated regression testing, high-fidelity demographic targeting, and professional release governance.

### Recent Major Wins:
- **v2.0.0 (The Governance & Demographic Milestone)**: 
  - **Demographic Expansion**: Implemented alternating male/female imagery for the core journey cards to broaden market appeal.
  - **Release Governance**: Established a tiered promotion lifecycle (Develop -> Staging -> Main) with automated PR audits for versioning.
  - **QA Expansion**: Doubled regression coverage to 16 E2E cases with Tiered Parallel execution for 50% faster verification.
- **v1.1.2 (QA Foundation)**: Established the **StylePlanIt QA Engine**, a Playwright-powered E2E suite with mandatory CI/CD PR hooks.
- **v1.1.1 (Marketing Core)**: Launched **Promos 1.0** (Unified Promotion System) and modernized the "Bespoke Services" sorting logic.
- **v1.1.0 (UX Pivot)**: Transitioned core interface to a high-fidelity horizontal carousel.
