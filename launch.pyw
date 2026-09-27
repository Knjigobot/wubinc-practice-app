import os
import sys

# In pythonw.exe, sys.stdout and sys.stderr are None. Redirect to devnull to prevent AttributeErrors
if sys.stdout is None:
    sys.stdout = open(os.devnull, 'w', encoding='utf-8')
if sys.stderr is None:
    sys.stderr = open(os.devnull, 'w', encoding='utf-8')

import time
import socket
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 8767
URL = f"http://127.0.0.1:{PORT}/app/#/practice"
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def is_server_running():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        res = s.connect_ex(('127.0.0.1', PORT))
        s.close()
        return res == 0
    except Exception:
        return False

class WubiHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Safely log only if stderr exists and is writable
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

def main():
    if is_server_running():
        webbrowser.open(URL)
        return

    WubiHandler.extensions_map.update({
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.woff': 'application/font-woff',
        '.woff2': 'font/woff2',
        '.ttf': 'application/x-font-truetype'
    })
    ThreadingHTTPServer.allow_reuse_address = True

    server = None
    for _ in range(6):
        if is_server_running():
            webbrowser.open(URL)
            return
        try:
            server = ThreadingHTTPServer(('127.0.0.1', PORT), WubiHandler)
            break
        except OSError:
            time.sleep(0.5)

    if server is None:
        webbrowser.open(URL)
        return

    # Open browser once server is running
    webbrowser.open(URL)

    try:
        server.serve_forever()
    except Exception:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
