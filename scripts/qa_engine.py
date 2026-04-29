#!/usr/bin/env python3
import argparse
import subprocess
import sys
import os
import time

"""
🚀 STYLEPLANIT QA ENGINE
Automated E2E Testing Suite for UI/UX Validation.
"""

def run_tests(env, headless=True):
    print(f"\n============================================================")
    print(f"🕵️  STYLEPLANIT QA ENGINE - Targeting: {env.upper()}")
    print(f"============================================================\n")
    
    server_process = None
    
    if env == "local":
        print("🚀 Starting local dev server...")
        # Start dev server in background
        server_process = subprocess.Popen(
            [sys.executable, "scripts/dev_server.py"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        time.sleep(2) # Give it time to bind port

    # Build the pytest command
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/",
        f"--env={env}",
        "--browser", "chromium",
        "-v"
    ]
    
    if not headless:
        cmd.append("--headed")
    
    try:
        result = subprocess.run(cmd)
        if result.returncode == 0:
            print(f"\n✨ QA PASS: Environment '{env}' is healthy.")
        else:
            print(f"\n❌ QA FAIL: Potential regressions found in '{env}'.")
            sys.exit(result.returncode)
            
    finally:
        if server_process:
            print("🛑 Shutting down local server...")
            server_process.terminate()

def main():
    parser = argparse.ArgumentParser(description="StylePlanIt QA Engine")
    parser.add_argument("env", choices=["local", "develop", "staging", "prod"], help="Environment to test")
    parser.add_argument("--no-headless", action="store_true", help="Run browser in visible mode")
    
    args = parser.parse_args()
    
    # Check if dependencies are installed
    try:
        import playwright
    except ImportError:
        print("📦 Installing dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "scripts/qa_requirements.txt"])
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"])

    run_tests(args.env, not args.no_headless)

if __name__ == "__main__":
    main()
