#!/usr/bin/env python3
import os
import json
import urllib.request
import argparse
import sys

# Project ID for Style Plan-It Launch Plan
DEFAULT_PROJECT_ID = "1212636326772928"
ASANA_API_BASE = "https://app.asana.com/api/1.0"

def get_asana_pat():
    """Tries to get the Asana Personal Access Token from environment or .env.asana file."""
    pat = os.environ.get("ASANA_PAT")
    if pat:
        return pat
    
    env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.asana")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r") as f:
                for line in f:
                    if line.startswith("ASANA_PAT="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
        except Exception as e:
            print(f"⚠️  Error reading .env.asana: {e}", file=sys.stderr)
            
    return None

def asana_request(endpoint, method="GET", data=None):
    pat = get_asana_pat()
    if not pat:
        print("❌ Error: ASANA_PAT not found in environment or .env.asana file.", file=sys.stderr)
        sys.exit(1)
        
    url = f"{ASANA_API_BASE}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {pat}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"❌ Asana API Error ({e.code}): {error_body}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

def list_workspaces():
    response = asana_request("workspaces")
    workspaces = response.get("data", [])
    print(f"\n🏢 Workspaces:")
    for w in workspaces:
        print(f"{w['gid']} | {w['name']}")

def list_projects(workspace_id=None):
    endpoint = "projects"
    if workspace_id:
        endpoint = f"projects?workspace={workspace_id}"
    response = asana_request(endpoint)
    projects = response.get("data", [])
    print(f"\n📂 Projects:")
    for p in projects:
        print(f"{p['gid']} | {p['name']}")

def list_tasks(project_id=DEFAULT_PROJECT_ID, detailed=False):
    fields = "name,completed,assignee.name"
    if detailed:
        fields += ",notes"
    endpoint = f"tasks?project={project_id}&opt_fields={fields}"
    response = asana_request(endpoint)
    tasks = response.get("data", [])
    
    print(f"\n📋 Tasks for project {project_id}:")
    print("-" * 60)
    for t in tasks:
        status = "[x]" if t.get("completed") else "[ ]"
        assignee = t.get("assignee", {}).get("name", "Unassigned") if t.get("assignee") else "Unassigned"
        print(f"{t['gid']} | {status} {t['name']} ({assignee})")
        if detailed and t.get("notes"):
            print(f"   📝 Notes: {t['notes'][:100]}...")
    print("-" * 60)

def get_task(task_gid):
    endpoint = f"tasks/{task_gid}?opt_fields=name,completed,assignee.name,notes,html_notes,projects.name,due_on"
    response = asana_request(endpoint)
    t = response.get("data", {})
    if not t:
        print(f"❌ Task {task_gid} not found.")
        return

    print(f"\n📌 Task Details: {t['name']}")
    print(f"GID: {t['gid']}")
    print(f"Status: {'✅ Completed' if t['completed'] else '⏳ In Progress'}")
    print(f"Assignee: {t.get('assignee', {}).get('name', 'Unassigned')}")
    print(f"Due Date: {t.get('due_on', 'None')}")
    print(f"Projects: {', '.join([p['name'] for p in t.get('projects', [])])}")
    print("-" * 30)
    print(f"📝 Notes:\n{t.get('notes', 'No notes provided.')}")
    print("-" * 30)

def search_tasks(query, project_id=DEFAULT_PROJECT_ID):
    """Asana search is premium only, so we fetch all tasks in a project and filter locally."""
    endpoint = f"tasks?project={project_id}&opt_fields=name,notes,completed"
    response = asana_request(endpoint)
    tasks = response.get("data", [])
    
    results = []
    q = query.lower()
    for t in tasks:
        if q in t['name'].lower() or (t.get('notes') and q in t['notes'].lower()):
            results.append(t)
            
    print(f"\n🔍 Search results for '{query}' in project {project_id}:")
    if not results:
        print("No matches found.")
    for r in results:
        status = "[x]" if r.get("completed") else "[ ]"
        print(f"{r['gid']} | {status} {r['name']}")

def create_task(name, notes="", project_id=DEFAULT_PROJECT_ID, assignee=None, due_on=None):
    endpoint = "tasks"
    data = {
        "data": {
            "name": name,
            "notes": notes,
            "projects": [project_id]
        }
    }
    if assignee:
        data["data"]["assignee"] = assignee
    if due_on:
        data["data"]["due_on"] = due_on
        
    response = asana_request(endpoint, method="POST", data=data)
    task_gid = response.get("data", {}).get("gid")
    if task_gid:
        print(f"✅ Task created successfully! GID: {task_gid}")
        return task_gid
    return None

def update_task(task_gid, data):
    endpoint = f"tasks/{task_gid}"
    response = asana_request(endpoint, method="PUT", data=data)
    if response.get("data"):
        print(f"✅ Task {task_gid} updated successfully!")
        return response.get("data")
    return None

def main():
    parser = argparse.ArgumentParser(description="Style Plan-It Asana Helper Tool")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Discovery
    subparsers.add_parser("workspaces", help="List workspaces")
    subparsers.add_parser("projects", help="List projects")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List tasks in the project")
    list_parser.add_argument("--project", default=DEFAULT_PROJECT_ID, help="Asana Project GID")
    list_parser.add_argument("--detailed", action="store_true", help="Show task notes")
    
    # Get command
    get_parser = subparsers.add_parser("get", help="Get full task details")
    get_parser.add_argument("gid", help="Task GID")

    # Search command
    search_parser = subparsers.add_parser("search", help="Search tasks locally by keyword")
    search_parser.add_argument("query", help="Search keyword")
    search_parser.add_argument("--project", default=DEFAULT_PROJECT_ID, help="Asana Project GID")
    
    # Create command
    create_parser = subparsers.add_parser("create", help="Create a new task")
    create_parser.add_argument("name", help="Task name")
    create_parser.add_argument("--notes", default="", help="Task notes/description")
    create_parser.add_argument("--project", default=DEFAULT_PROJECT_ID, help="Asana Project GID")
    create_parser.add_argument("--assignee", help="User GID to assign the task to")
    create_parser.add_argument("--due", help="Due date (YYYY-MM-DD)")

    # Update command
    update_parser = subparsers.add_parser("update", help="Update an existing task")
    update_parser.add_argument("gid", help="Task GID")
    update_parser.add_argument("--completed", help="Set completed status (true/false)")
    update_parser.add_argument("--assignee", help="User GID to assign the task to")
    
    args = parser.parse_args()
    
    if args.command == "workspaces":
        list_workspaces()
    elif args.command == "projects":
        list_projects()
    elif args.command == "list":
        list_tasks(args.project, args.detailed)
    elif args.command == "get":
        get_task(args.gid)
    elif args.command == "search":
        search_tasks(args.query, args.project)
    elif args.command == "create":
        create_task(args.name, args.notes, args.project, args.assignee, args.due)
    elif args.command == "update":
        data = {"data": {}}
        if args.completed is not None:
            data["data"]["completed"] = args.completed.lower() == 'true'
        if args.assignee:
            data["data"]["assignee"] = args.assignee
        update_task(args.gid, data)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
