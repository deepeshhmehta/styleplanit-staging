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

    # Define Test Tiers for Logical Batching
    # Tier 1: Light (Structural, Sanity, Low-Server-Load)
    tier1 = [
        "tests/test_architectural_integrity.py",
        "tests/test_sanity.py"
    ]
    # Tier 2: Heavy (Dynamic Features, Promos, Interaction Heavy)
    tier2 = [
        "tests/test_features_v1_2.py",
        "tests/test_journeys.py",
        "tests/test_promotions.py"
    ]

    def run_pytest_batch(test_files, workers, extra_args=None):
        cmd = [
            sys.executable, "-m", "pytest",
            *test_files,
            f"--env={env}",
            "--browser", "chromium",
            "-n", str(workers),
            "-v"
        ]
        if not headless: cmd.append("--headed")
        if extra_args: cmd.extend(extra_args)
        return subprocess.run(cmd)

    try:
        print("📋 [BATCH 1/2] Running Structural & Sanity Tests (High Parallelism)...")
        res1 = run_pytest_batch(tier1, 5)
        
        print("\n📋 [BATCH 2/2] Running Feature & Interaction Tests (Balanced Load)...")
        res2 = run_pytest_batch(tier2, 3)
        
        # If either batch fails, trigger sequential retry for ONLY the failed tests
        if res1.returncode != 0 or res2.returncode != 0:
            print(f"\n⚠️  Parallel tiers detected potential issues. Retrying failures sequentially...")
            
            retry_res = run_pytest_batch(["tests/"], 0, ["--lf"]) # workers=0 runs sequentially in pytest-xdist context
            
            if retry_res.returncode == 0:
                print(f"\n✨ QA PASS: Failures resolved on sequential retry. Environment '{env}' is healthy.")
                return
            else:
                print(f"\n❌ QA FAIL: Permanent regressions found in '{env}'.")
                sys.exit(retry_res.returncode)
        
        print(f"\n✨ QA PASS: Environment '{env}' is healthy.")
            
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
