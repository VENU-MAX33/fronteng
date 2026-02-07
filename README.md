# Cricket Matches

Local copy of frontend and mock backend for development.

Run frontend static server:

```powershell
cd "C:\Users\Admin\Desktop\cricket matches\cricket"
python -m http.server 8080
```

Run mock backend:

```powershell
cd "C:\Users\Admin\Desktop\cricket matches"
python backend/mock_api.py
```

(Optional) Node dev server:

```powershell
npm install
npm start
```

Front-end expects API at `http://localhost:8000` (see `cricket/js/config.js`).
