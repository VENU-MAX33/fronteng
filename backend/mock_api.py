from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json

PORT = 8000

SAMPLE_MATCHES = [
    {"id": 1, "teams": ["Team A", "Team B"], "status": "live", "score": {"Team A": 120, "Team B": 115}},
    {"id": 2, "teams": ["Team C", "Team D"], "status": "upcoming", "score": {}},
]

SAMPLE_TEAMS = [
    {"id": 1, "name": "Team A"},
    {"id": 2, "name": "Team B"},
]

SAMPLE_ACHIEVEMENTS = [
    {"id": 1, "title": "Highest Score", "player": "Player X"},
]

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == '/api/matches':
            limit = int(qs.get('limit', [len(SAMPLE_MATCHES)])[0])
            status = qs.get('status', [None])[0]
            data = SAMPLE_MATCHES
            if status:
                data = [m for m in data if m.get('status') == status]
            self._set_headers()
            self.wfile.write(json.dumps(data[:limit]).encode())
            return

        if path.startswith('/api/matches/'):
            try:
                mid = int(path.split('/')[3])
            except Exception:
                self._set_headers(404)
                self.wfile.write(json.dumps({'error':'not found'}).encode())
                return
            match = next((m for m in SAMPLE_MATCHES if m['id']==mid), None)
            if match:
                self._set_headers()
                self.wfile.write(json.dumps(match).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({'error':'match not found'}).encode())
            return

        if path == '/api/teams':
            self._set_headers()
            self.wfile.write(json.dumps(SAMPLE_TEAMS).encode())
            return

        if path == '/api/achievements':
            self._set_headers()
            self.wfile.write(json.dumps(SAMPLE_ACHIEVEMENTS).encode())
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({'error':'unknown endpoint'}).encode())

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode() if length else ''
        try:
            data = json.loads(body) if body else {}
        except Exception:
            data = {}

        if path == '/api/matches':
            # create a new match (mock)
            new_id = max(m['id'] for m in SAMPLE_MATCHES) + 1
            new = {'id': new_id, 'teams': data.get('teams', []), 'status': data.get('status','upcoming')}
            SAMPLE_MATCHES.append(new)
            self._set_headers(201)
            self.wfile.write(json.dumps(new).encode())
            return

        if path.endswith('/score') or path.endswith('/toss') or path.endswith('/complete'):
            # mock update: return success
            self._set_headers(200)
            self.wfile.write(json.dumps({'status':'ok', 'data': data}).encode())
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({'error':'unknown POST endpoint'}).encode())


def run(server_class=HTTPServer, handler_class=Handler):
    server_address = ('', PORT)
    httpd = server_class(server_address, handler_class)
    print(f'Mock API running on http://localhost:{PORT}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    run()
