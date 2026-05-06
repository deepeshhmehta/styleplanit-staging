# StylePlanIt Encyclopedia Index

This directory is the primary source of truth for AI agents. Use this index to navigate the documentation and identify which files require updates after completing a task.

## 1. Documentation Map

| File | Scope | Update when... |
| :--- | :--- | :--- |
| [**context.md**](context.md) | High-level overview, safety rules, and current project version/state. | Changing project version, adding high-level design pillars, or updating safety mandates. |
| [**architecture.md**](architecture.md) | Core JS logic, initialization sequencing, and component loading patterns. | Refactoring `loader.js`, `app.js`, or changing how features are detected and initialized. |
| [**data-schema.md**](data-schema.md) | The structure and field definitions of `configs/site-data.json`. | Adding new arrays (e.g., `articles`) or changing key naming conventions in the JSON. |
| [**tooling.md**](tooling.md) | Python scripts, CLI tools, and the local dev/test environment. | Adding new scripts or updating command-line arguments for existing tools. |
| [**workflows.md**](workflows.md) | Step-by-step procedures for content sync and article publication. | Changing the business process for how data moves from Sheets to the site. |

## 2. Agent Update Protocol

After completing a Directive (Feature, Fix, or Refactor), you **MUST** follow these steps to maintain context parity:

1.  **Analyze Impact:** Identify which architectural, data, or workflow layers were touched.
2.  **Consult Index:** Use the table above to find the relevant deep-dive files.
3.  **Perform Surgical Updates:** Expand or correct the relevant `.md` files to reflect the new state of the codebase.
4.  **Update Current State:** Always update the `Current State` and `Recent Wins` sections in `context.md`.

## 3. High-Level Project Metadata
*   **Version:** v2.0.1 (Production)
*   **Aesthetic:** Luxury Minimalist / Modern Bold
*   **Tech Stack:** Vanilla HTML/CSS, jQuery, Python (Automation)
