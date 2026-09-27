import os
import sys
import argparse
import socket
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

# In pythonw.exe or daemon processes, sys.stdout and sys.stderr may be None
if sys.stdout is None:
    sys.stdout = open(os.devnull, 'w', encoding='utf-8')
if sys.stderr is None:
    sys.stderr = open(os.devnull, 'w', encoding='utf-8')

DEFAULT_PORT = int(os.environ.get('PORT', 8767))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class WubiHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Automatically redirect root '/' to '/app/#/practice'
        if self.path in ('/', ''):
            self.send_response(302)
            self.send_header('Location', '/app/#/practice')
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, format, *args):
        try:
            if sys.stderr is not None:
                sys.stderr.write("%s - - [%s] %s\n" %
                                 (self.address_string(),
                                  self.log_date_time_string(),
                                  format % args))
        except Exception:
            pass

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()


def is_port_in_use(port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        res = s.connect_ex(('127.0.0.1', port))
        s.close()
        return res == 0
    except Exception:
        return False


def run():
    parser = argparse.ArgumentParser(description="Wubi 06 Trainer 3 Web Server")
    parser.add_argument('--port', '-p', type=int, default=DEFAULT_PORT, help=f"Port to bind (default: {DEFAULT_PORT})")
    parser.add_argument('--open', '-o', action='store_true', help="Open trainer in default web browser")
    parser.add_argument('--no-browser', action='store_true', help="Do not open browser automatically")
    args = parser.parse_args()

    port = args.port
    app_url = f"http://127.0.0.1:{port}/app/#/practice"

    if is_port_in_use(port):
        print(f"Wubi Trainer 3 server is already running at {app_url}")
        if args.open and not args.no_browser:
            webbrowser.open(app_url)
        return

    WubiHandler.extensions_map.update({
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.woff': 'application/font-woff',
        '.woff2': 'font/woff2',
        '.ttf': 'application/x-font-truetype'
    })

    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer(('127.0.0.1', port), WubiHandler)

    print("==================================================")
    print("  Wubi 06 (New Century) Touch-Typing Trainer 3")
    print(f"  Running locally at: {app_url}")
    print("  Press Ctrl+C to stop the server")
    print("==================================================")

    if args.open and not args.no_browser:
        webbrowser.open(app_url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Wubi Trainer server...")
    finally:
        server.server_close()


if __name__ == '__main__':
    run()
