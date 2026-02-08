from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json

PORT = 8000

SAMPLE_MATCHES = [
    {"id": 1, "teams": ["Team A", "Team B"], "status": "live", "score": {"Team A": 120, "Team B": 115}},
    {"id": 2, "teams": ["Team C", "Team D"], "status": "upcoming", "score": {}},
]

SAMPLE_TEAMS = [
    {
        "id": 1,
        "name": "Team A",
        "sport": "cricket",
        "captain": "Captain A",
        "players": [
            {"name": "Player 1", "isCaptain": True, "age": 28, "registerNo": "REG001"},
            {"name": "Player 2", "isCaptain": False, "age": 25, "registerNo": "REG002"}
        ]
    },
    {
        "id": 2,
        "name": "Team B",
        "sport": "cricket",
        "captain": "Captain B",
        "players": [
            {"name": "Player 3", "isCaptain": True, "age": 30, "registerNo": "REG003"}
        ]
    },
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

        # Friendly root info to help browsing the mock API in a browser
        if path in ('/', '/api'):
            self._set_headers()
            info = {
                'message': 'Mock API root - available endpoints',
                'endpoints': [
                    '/api/matches',
                    '/api/matches/<id>',
                    '/api/teams',
                    '/api/teams/register (POST)',
                    '/api/achievements',
                    '/api/matches (POST to create)',
                    '/api/matches/<id>/score (POST to update)',
                ],
                'frontend': 'http://localhost:8080'
            }
            self.wfile.write(json.dumps(info).encode())
            return

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
            sport = qs.get('sport', [None])[0]
            data = SAMPLE_TEAMS
            if sport:
                data = [t for t in data if t.get('sport') == sport]
            self._set_headers()
            self.wfile.write(json.dumps(data).encode())
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
        
        print(f"[POST] Path: {path}")
        print(f"[POST] Body: {body[:200] if body else 'empty'}")
        
        try:
            data = json.loads(body) if body else {}
        except Exception as e:
            print(f"[ERROR] JSON parse failed: {e}")
            data = {}

        if path == '/api/teams/register':
            print("[POST] Team registration request received")
            try:
                # Register a new team with players
                new_id = max(t['id'] for t in SAMPLE_TEAMS) + 1 if SAMPLE_TEAMS else 1
                new_team = {
                    'id': new_id,
                    'name': data.get('name', 'Team'),
                    'sport': data.get('sport', 'cricket'),
                    'captain': data.get('captain', ''),
                    'players': data.get('players', [])
                }
                SAMPLE_TEAMS.append(new_team)
                print(f"[SUCCESS] Team registered: {new_team}")
                self._set_headers(201)
                self.wfile.write(json.dumps(new_team).encode())
                return
            except Exception as e:
                print(f"[ERROR] Registration failed: {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({'error': str(e)}).encode())
                return

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
