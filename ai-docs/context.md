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

*   **CRITICAL: THE AGENT IS FORBIDDEN FROM PUSHING DIRECTLY TO `main`, `staging`, OR `develop`.**
*   **Workflow Requirement:** All changes must be pushed to a feature/fix branch and merged via Pull Request.
*   **Branching Strategy:**
    *   `main`: Production (Locked).
    *   `staging`: Pre-release testing (`https://staging.styleplanit.com`).
    *   `develop`: Integration branch (`https://develop.styleplanit.com`).
*   **Verification:** Mandatory `test.sh` run before PR creation.

## 4. Current State (v1.0.0)
The platform has officially reached its first **Production Baseline (v1.0.0)**. The site is a fully data-driven **Authority Platform** utilizing a split-atom configuration model and modular component architecture.
