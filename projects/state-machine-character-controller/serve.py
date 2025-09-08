#!/usr/bin/env python3
"""
Simple HTTP server for testing the state machine character controller.
This avoids CORS issues when using ES6 modules.

Usage:
    python serve.py

Then open: http://localhost:8000/state-machine-test.html
"""

import http.server
import socketserver
import os
import sys

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow ES6 modules
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"Server running at http://localhost:{PORT}/")
            print(f"Open: http://localhost:{PORT}/state-machine-test.html")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"Port {PORT} is already in use. Try a different port or stop the existing server.")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)
