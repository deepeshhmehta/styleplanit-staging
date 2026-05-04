import csv
import io
import json
import urllib.request

def fetch_csv(spreadsheet_id, gid):
    url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/pub?gid={gid}&output=csv"
    try:
        with urllib.request.urlopen(url) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"  ❌ Failed to fetch GID {gid}: {e}")
        return None

def normalize_value(v):
    if v is None:
        return ""
    # Strip whitespace and normalize all newline variants to \n
    # Also handle literal '\n' strings that might come from Sheets
    val = str(v).strip().replace('\r\n', '\n').replace('\r', '\n').replace('\\n', '\n')
    
    # Recursively strip .00 or .0 from numerical/version strings 
    # (e.g., "2.0.0" -> "2.0" -> "2") to match Google Sheets auto-formatting
    while True:
        if val.endswith(".00"):
            val = val[:-3]
        elif val.endswith(".0") and (len(val) > 2 or val.isdigit()):
            val = val[:-2]
        else:
            break
    
    # Consolidate multiple spaces and newlines for comparison
    import re
    val = re.sub(r' +', ' ', val) # Multiple spaces to single
    val = re.sub(r'\n+', '\n', val).strip() # Multiple newlines to single
        
    return val

def parse_csv_to_list(csv_text):
    reader = csv.DictReader(io.StringIO(csv_text))
    processed_list = []
    for row in reader:
        processed_row = {}
        for k, v in row.items():
            if k is None or str(k).strip() == "":
                continue
            processed_row[k.strip()] = normalize_value(v)
        processed_list.append(processed_row)
    return processed_list

def normalize_dataset(data_list, headers=None):
    """Normalizes a list of dicts for comparison by ensuring consistent keys and values."""
    normalized_list = []
    for item in data_list:
        normalized_item = {k: normalize_value(v) for k, v in item.items() if k and str(k).strip() != ""}
        if headers:
            for h in headers:
                if h not in normalized_item:
                    normalized_item[h] = ""
        normalized_list.append(normalized_item)
    # Sort by JSON string to ensure order-independent comparison
    return sorted([json.dumps(d, sort_keys=True) for d in normalized_list])

def get_all_headers(local_list, remote_list):
    headers = set()
    for item in local_list: 
        headers.update(k for k in item.keys() if k and str(k).strip() != "")
    for item in remote_list: 
        headers.update(k for k in item.keys() if k and str(k).strip() != "")
    return sorted(list(headers))
