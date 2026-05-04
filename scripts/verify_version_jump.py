#!/usr/bin/env python3
import json
import subprocess
import sys
import os

def get_version_from_json(json_content):
    try:
        data = json.loads(json_content)
        return data.get("VERSION", "0.0.0")
    except Exception:
        return "0.0.0"

def parse_version(version_str):
    # Handle versions like "1.2" or "1.1.1"
    parts = version_str.replace('v', '').split('.')
    return [int(p) for p in parts]

def is_version_higher(new_v_str, old_v_str):
    new_v = parse_version(new_v_str)
    old_v = parse_version(old_v_str)
    
    # Pad with zeros to compare same lengths
    max_len = max(len(new_v), len(old_v))
    new_v += [0] * (max_len - len(new_v))
    old_v += [0] * (max_len - len(old_v))
    
    return new_v > old_v

def main():
    base_ref = os.getenv("GITHUB_BASE_REF", "main")
    
    print(f"🔍 Comparing versions between current and {base_ref}...")

    # Get version from current branch
    try:
        with open("configs/site-config.json", "r") as f:
            current_version = get_version_from_json(f.read())
    except FileNotFoundError:
        print("❌ Error: configs/site-config.json not found in current branch.")
        sys.exit(1)

    # Get version from base branch
    try:
        # Fetch the base branch first to ensure it's available
        subprocess.run(["git", "fetch", "origin", base_ref], check=True, capture_output=True)
        base_json = subprocess.check_output(["git", "show", f"origin/{base_ref}:configs/site-config.json"]).decode("utf-8")
        base_version = get_version_from_json(base_json)
    except Exception as e:
        print(f"⚠️ Warning: Could not retrieve version from origin/{base_ref}. Defaulting to 0.0.0.")
        base_version = "0.0.0"

    print(f"📍 Current Version: {current_version}")
    print(f"📍 Base Version ({base_ref}): {base_version}")

    if is_version_higher(current_version, base_version):
        print(f"✅ Success: Version jump detected ({base_version} -> {current_version})")
        sys.exit(0)
    else:
        print(f"❌ Error: VERSION must be incremented in configs/site-config.json.")
        print(f"   Ensure {current_version} is higher than {base_version}.")
        sys.exit(1)

if __name__ == "__main__":
    main()
