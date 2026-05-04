#!/bin/bash

# Style Plan(it) - One-Click Data Sync
# ------------------------------------------------
# This tool automatically updates your website content from Google Sheets.
# Spotlight Search: "sync-styleplanit"

# 1. Force directory to the project root where this script lives
cd "$(dirname "$0")"

echo "------------------------------------------------"
echo "📡  STYLE PLAN(IT) - CONTENT SYNC TOOL"
echo "------------------------------------------------"

# 2. Check for Requirements (Homebrew, Git, Python)
# This part is a safety net for new machines.
if ! command -v brew &> /dev/null; then
    echo "🔍  Initializing setup (Homebrew)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

if ! command -v git &> /dev/null; then
    echo "🔍  Installing Git..."
    brew install git
fi

if ! command -v python3 &> /dev/null; then
    echo "🔍  Installing Python..."
    brew install python
fi

# 3. Run the data auditor
echo "🔄 Checking for content discrepancies with Google Sheets..."
python3 scripts/diff_site_data.py

# 4. Success / Error Feedback
if [ $? -eq 0 ]; then
    # Calculate 2 minutes from now for GitHub Pages refresh
    GO_LIVE=$(date -v+2M +"%I:%M %p")
    echo ""
    echo "✨  CONTENT SYNCED TO THE SERVER!"
    echo "🌐  Your changes will be live at approximately: $GO_LIVE"
    echo "👉  (GitHub Pages takes about 2 minutes to refresh)"
else
    echo ""
    echo "❌  SYNC FAILED."
    echo "💡  Please check your internet connection and try again."
fi

echo "------------------------------------------------"
read -p "Done! Press [Enter] to close this window."
