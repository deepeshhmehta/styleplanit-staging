# StylePlanIt Tooling & Automation

This document details the Python-based CLI tools used to manage the StylePlanIt ecosystem.

## 1. Data Management

### `scripts/diff_site_data.py` (The Interactive Auditor)
*   **Purpose:** Two-way sync between local code and Google Sheets.
*   **Logic:** Fetches remote CSVs, compares them with `site-data.json`, and identifies mismatches.
*   **Output:** Generates "Patch CSVs" in `scripts/diff_outputs/`.
*   **Workflow:**
    1.  Add new local data (e.g., a new Article).
    2.  Run `python3 scripts/diff_site_data.py`.
    3.  Select `1` (Winner: Local).
    4.  Copy the generated CSV from `diff_outputs/` and paste it into the relevant Google Sheet tab.

### `scripts/sync_engine.py` (The One-Way Deployer)
*   **Purpose:** Overwrite local data with Google Sheets content.
*   **Logic:** Assumes Google Sheets is the source of truth. Downloads all tabs and rebuilds `site-data.json`.
*   **Usage:** Typically triggered via `sync-styleplanit.command` for non-technical updates.

## 2. Project Management

### `scripts/asana_tools.py` (CLI Task Manager)
*   **Purpose:** Manage and search Asana tasks from the terminal.
*   **Capabilities:**
    *   `workspaces`: List all accessible Asana workspaces.
    *   `projects`: List projects within a workspace.
    *   `list`: View all tasks and statuses (use `--detailed` for notes).
    *   `get`: Retrieve full task metadata, including notes and HTML content.
    *   `search`: Perform local keyword searches in task names and descriptions (bypasses native search limits).
    *   `create`: Create tasks with optional `--assignee` and `--due` dates.
    *   `update`: Modify task status or assignment.
*   **Security:** Sources the `ASANA_PAT` from the root `.env.asana` file via subshells.

## 3. Development

### `scripts/dev_server.py`
*   **Purpose:** Multi-threaded local development server.
*   **Feature:** Automatically finds an open port if `8000` is busy. Serves the project root.

### `test.sh`
*   **Purpose:** Health check suite.
*   **Logic:** Starts the dev server and pings every critical HTML, JS, and CSS endpoint to ensure no 404s or script failures.
*   **Requirement:** Must be run and passed before every PR.
