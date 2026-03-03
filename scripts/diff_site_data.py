import json
import csv
import io
import os
import sys
import data_utils
from collections import OrderedDict

"""
📊 STYLEPLANIT INTERACTIVE DIFF ENGINE
Optimized: Summarizes changes upfront and allows bulk resolution.
"""

# Configuration
SPREADSHEET_ID = "e/2PACX-1vSfDsGSiXAvQMmO32s5qWgQaH1GDeZXqEbnMr7bQmm-7gtdoHX-pz_jNq_y3Mb_ahS1LJ99azA84HVZ"
GIDS = {
    "version": "2024034979",
    "config": "1515187439",
    "categories": "420875592",
    "services": "439228131",
    "reviews": "1697858749",
    "team": "1489131428",
    "dialogs": "49430965"
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, os.pardir))
JSON_PATH = os.path.join(PROJECT_ROOT, "configs", "site-data.json")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "diff_outputs")

def get_local_data():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        sys.exit(1)
    with open(JSON_PATH, "r") as f:
        return json.load(f, object_pairs_hook=OrderedDict)

def generate_assets_manifest():
    """Scan assets/images and return a structured manifest dictionary."""
    manifest = {}
    assets_root = os.path.join(PROJECT_ROOT, "assets", "images")
    if os.path.exists(assets_root):
        for root, dirs, files in os.walk(assets_root):
            rel_path = os.path.relpath(root, assets_root)
            if rel_path == ".":
                folder_key = "root"
            else:
                folder_key = rel_path.replace(os.sep, "/")
            
            image_files = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))]
            if image_files:
                manifest[folder_key] = sorted(image_files)
    return manifest

def get_key_string(item, key_fields):
    if not item: return "None"
    return " | ".join(str(item.get(f, "N/A")) for f in key_fields)

def manual_input_entry(headers, current_item):
    new_item = {}
    print("\n📝 MANUAL ENTRY (Leave blank to keep current value):")
    for h in headers:
        val = input(f"   {h} [{current_item.get(h, 'N/A')}]: ").strip()
        new_item[h] = val if val != "" else current_item.get(h, '')
    return new_item

def main():
    local_full_data = get_local_data()
    updated_local_data = local_full_data.copy()
    
    # Auto-generate manifest
    current_manifest = generate_assets_manifest()
    manifest_changed = current_manifest != local_full_data.get("assets_manifest")
    updated_local_data["assets_manifest"] = current_manifest
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    # Clear previous reports
    for f in os.listdir(OUTPUT_DIR):
        if f.endswith(".csv"):
            os.remove(os.path.join(OUTPUT_DIR, f))

    print("\n" + "="*60)
    print("📊 STYLEPLANIT INTERACTIVE DIFF ENGINE")
    print("="*60)

    categories_to_check = {
        "version": {"key_fields": ["key"]},
        "config": {"key_fields": ["key"]},
        "categories": {"key_fields": ["name"]},
        "services": {"key_fields": ["title", "category"]},
        "reviews": {"key_fields": ["author", "text"]}, 
        "dialogs": {"key_fields": ["title"]}, 
        "team": {"key_fields": ["name"]}
    }

    all_discrepancies = []
    category_data = {}

    print("📡 Fetching remote data...")
    for category, settings in categories_to_check.items():
        csv_text = data_utils.fetch_csv(SPREADSHEET_ID, GIDS[category])
        if csv_text is None:
            print(f"  ❌ Failed to fetch remote data for '{category}'. Skipping.")
            continue

        local_list = local_full_data.get(category, [])
        remote_list = data_utils.parse_csv_to_list(csv_text)
        headers = data_utils.get_all_headers(local_list, remote_list)
        key_fields = settings["key_fields"]

        # Build Maps
        local_map = OrderedDict()
        for item in local_list:
            norm_item = {h: data_utils.normalize_value(item.get(h, "")) for h in headers}
            ckey = tuple(norm_item.get(f) for f in key_fields)
            if all(ckey): local_map[ckey] = norm_item

        remote_map = OrderedDict()
        for item in remote_list:
            norm_item = {h: data_utils.normalize_value(item.get(h, "")) for h in headers}
            ckey = tuple(norm_item.get(f) for f in key_fields)
            if all(ckey): remote_map[ckey] = norm_item

        all_keys = list(local_map.keys())
        for k in remote_map.keys():
            if k not in all_keys: all_keys.append(k)

        category_discrepancies = []
        for ckey in all_keys:
            local_item = local_map.get(ckey)
            remote_item = remote_map.get(ckey)
            
            state = None
            diffs = {}
            if local_item and remote_item:
                diffs = {h: (local_item[h], remote_item[h]) for h in headers if local_item[h] != remote_item[h]}
                if diffs: state = "MISMATCH"
            elif local_item:
                state = "LOCAL_ONLY"
            else:
                state = "SHEETS_ONLY"

            if state:
                category_discrepancies.append({
                    "ckey": ckey,
                    "state": state,
                    "diffs": diffs,
                    "local": local_item,
                    "remote": remote_item,
                    "key_str": get_key_string(local_item or remote_item, key_fields)
                })
        
        category_data[category] = {
            "discrepancies": category_discrepancies,
            "headers": headers,
            "key_fields": key_fields,
            "local_map": local_map,
            "remote_map": remote_map,
            "all_keys": all_keys
        }
        if category_discrepancies:
            all_discrepancies.extend([(category, d) for d in category_discrepancies])

    if not all_discrepancies:
        print("\n🙌 EVERYTHING IN SYNC. No actions required.")
        return

    print(f"\n🔍 FOUND {len(all_discrepancies)} DISCREPANCIES:")
    for category, d in all_discrepancies:
        print(f"  [{category.upper()}] {d['state']}: {d['key_str']}")

    print("\nHow would you like to resolve these?")
    print("  1. [Winner: All Local] - Keep local data, generate CSVs for Sheets update.")
    print("  2. [Winner: All Sheets] - Take all data from Google Sheets.")
    print("  3. [Individual Loop]   - Decide for each item (default).")
    
    global_choice = input("\nSelect (1/2/3): ").strip()

    final_csv_data = {}
    to_delete_from_sheets = []
    changes_to_local = False

    for category, data in category_data.items():
        local_category_updated = []
        category_needs_sheets_update = False
        
        headers = data["headers"]
        key_fields = data["key_fields"]
        
        # If no discrepancies, just keep local
        if not data["discrepancies"]:
            updated_local_data[category] = local_full_data.get(category, [])
            continue

        for ckey in data["all_keys"]:
            local_item = data["local_map"].get(ckey)
            remote_item = data["remote_map"].get(ckey)
            
            # Find if this specific key has a discrepancy
            d = next((item for item in data["discrepancies"] if item["ckey"] == ckey), None)
            
            if not d:
                if local_item: local_category_updated.append(local_item)
                continue

            choice = global_choice
            if global_choice not in ["1", "2"]:
                print(f"\n🔍 [{category.upper()}] ENTRY: {d['key_str']}")
                print(f"   Status: {d['state']}")
                if d['state'] == "MISMATCH":
                    for field, (lv, rv) in d['diffs'].items():
                        print(f"     [{field}]: Local: '{lv}' | Sheets: '{rv}'")
                print("\n   1. [Winner: Local]  2. [Winner: Sheets]  3. [Manual]  s. [Skip]")
                choice = input("   Select: ").strip().lower()

            if choice == "1": # Local Wins
                if d['state'] == "SHEETS_ONLY":
                    print(f"   ✅ {d['key_str']} -> Mark for Sheets deletion.")
                    to_delete_from_sheets.append(f"{category} | {d['key_str']}")
                else:
                    if global_choice != "1": print(f"   ✅ {d['key_str']} -> Local kept. Queuing Sheets update.")
                    local_category_updated.append(local_item)
                    category_needs_sheets_update = True
            
            elif choice == "2": # Sheets Wins
                if d['state'] == "LOCAL_ONLY":
                    if global_choice != "2": print(f"   ✅ {d['key_str']} -> Deleted from Local.")
                    changes_to_local = True
                else:
                    if global_choice != "2": print(f"   ✅ {d['key_str']} -> Sheets value taken.")
                    local_category_updated.append(remote_item)
                    changes_to_local = True
            
            elif choice == "3": # Manual
                manual_item = manual_input_entry(headers, local_item or remote_item)
                local_category_updated.append(manual_item)
                changes_to_local = True
                category_needs_sheets_update = True
                print("   ✅ Manual entry saved.")
            
            else:
                print("   ⏭️ Skipped.")
                if local_item: local_category_updated.append(local_item)

        updated_local_data[category] = local_category_updated
        
        if category_needs_sheets_update:
            output = io.StringIO()
            output.write("~~".join(headers) + "\n")
            for row in local_category_updated:
                line = "~~".join(str(row.get(h, "")).replace("\n", "\\n") for h in headers)
                output.write(line + "\n")
            final_csv_data[category] = output.getvalue()

    print("\n" + "="*60)
    print("🏁 SYNC SUMMARY")
    print("="*60)

    if to_delete_from_sheets:
        print("\n🗑️  KEYS TO MANUALLY DELETE FROM SHEETS:")
        for item in to_delete_from_sheets:
            print(f"   ❌ {item}")

    if final_csv_data:
        print("\n📁 UPDATED CSVS GENERATED (in scripts/diff_outputs/):")
        for cat, content in final_csv_data.items():
            out_file = os.path.join(OUTPUT_DIR, f"{cat}_to_paste_in_sheets.csv")
            with open(out_file, "w") as f:
                f.write(content)
            print(f"  ✅ {os.path.basename(out_file)}")
    
    if manifest_changed:
        print("\n📸 Assets manifest updated (local images changed).")
        changes_to_local = True

    if changes_to_local:
        if input("\n💾 Save updates to site-data.json? (y/n): ").strip().lower() == 'y':
            with open(JSON_PATH, "w") as f:
                json.dump(updated_local_data, f, indent=2, ensure_ascii=False)
            print("✅ Local site-data.json updated.")
    else:
        print("\nℹ️ No local site-data.json changes to save.")

    print("\n✨ Sync Complete!")

if __name__ == "__main__":
    main()
