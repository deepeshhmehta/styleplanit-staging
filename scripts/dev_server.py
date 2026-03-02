import http.server
import socketserver
import os
import sys
import subprocess
import signal

DEFAULT_PORT = 8000

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom handler to support GitHub Pages style routing.
    Redirects /services to /services.html automatically.
    """
    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not os.path.splitext(path)[1]:
            html_path = path + ".html"
            if os.path.exists(html_path):
                self.path += ".html"
        return super().do_GET()

def kill_process_on_port(port):
    try:
        # Find process ID using lsof
        result = subprocess.check_output(["lsof", "-ti", f":{port}"]).decode().strip()
        if result:
            pids = result.split("\n")
            for pid in pids:
                print(f"⚠️ Killing process {pid} on port {port}...")
                os.kill(int(pid), signal.SIGKILL)
            return True
    except Exception:
        pass
    return False

class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    """Handle requests in a separate thread."""
    daemon_threads = True

def start_server(port):
    # Ensure we run from project root
    os.chdir(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

    while True:
        try:
            with ThreadingHTTPServer(("", port), CleanURLHandler) as httpd:
                print("\n" + "="*50)
                print(f"🚀 Style Plan(it) Threaded Dev Server")
                print(f"🔗 http://localhost:{port}")
                print("Mode: Clean URLs (GitHub Pages Parity)")
                print("="*50 + "\n")
                httpd.serve_forever()
        except OSError as e:
            if e.errno == 48: # Address already in use
                print(f"\n❌ Port {port} is already in use.")
                choice = input(f"Would you like to (k)ill existing process, (s)witch to a new port, or (q)uit? [k/s/q]: ").lower()
                
                if choice == 'k':
                    if kill_process_on_port(port):
                        print("✅ Process killed. Retrying...")
                        continue
                    else:
                        print("❌ Failed to kill process. Try a different port.")
                
                elif choice == 's':
                    new_port = input("Enter new port number: ")
                    try:
                        port = int(new_port)
                        continue
                    except ValueError:
                        print("❌ Invalid port number.")
                
                print("👋 Exiting.")
                sys.exit(1)
            else:
                print(f"\n❌ Error: {e}")
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n👋 Server stopped.")
            sys.exit(0)

if __name__ == "__main__":
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    start_server(port)
