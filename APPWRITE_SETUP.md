# 🏆 Sports Arena Hub - Appwrite Integration Setup Guide

## ⚡ Quick Start

Your website is now **fully integrated with Appwrite**. Follow these steps to get it running:

### Step 1: Get Your Appwrite Credentials

1. Go to **[https://cloud.appwrite.io](https://cloud.appwrite.io)** (or your self-hosted Appwrite instance)
2. Create an account or login
3. Create a new **Project** (e.g., "Sports Arena Hub")
4. Note your **Project ID** from Settings

#### Get Database ID:
1. Go to **Databases** in the left sidebar
2. Create a new database called `sports_arena_db`
3. Note the **Database ID**

#### Get API Credentials:
1. Go to **Settings** → **API Keys**
2. Create a new API Key with necessary permissions
3. Copy the **API Key string**

### Step 2: Update Configuration File

Edit `cricket/js/config.js` and replace the placeholder values:

```javascript
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1'; // Your Appwrite URL
const APPWRITE_PROJECT_ID = 'your_actual_project_id_here'; // Replace with your Project ID
const APPWRITE_DATABASE_ID = 'your_actual_database_id_here'; // Replace with your Database ID
const APPWRITE_API_KEY = 'your_actual_api_key_here'; // Replace with your API Key
```

**Example:**
```javascript
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '65abc123def456xyz789';
const APPWRITE_DATABASE_ID = '65abc789xyz456def123';
const APPWRITE_API_KEY = '8f1a2b9c3d4e5f6g7h8i9j0k1l2m3n4o';
```

### Step 3: Create Collections in Appwrite Database

You have **TWO OPTIONS**:

#### Option A: Auto-Create Collections (Recommended)
The JavaScript code will automatically try to create missing collections on first use.

#### Option B: Manual Creation (Advanced)
Go to your Appwrite console and create these collections with the specified attributes:

**Collection: `tournaments`**
- title (string)
- slug (string, unique)
- sport (string)
- start_date (datetime)
- end_date (datetime)
- country (string)
- status (string)
- organizer_id (string)
- metadata (object)

**Collection: `teams`**
- name (string)
- short_name (string)
- abbr (string)
- logo_url (string)
- country (string)
- players (array)
- manager (string)
- created_at (datetime)

**Collection: `registrations`**
- name (string)
- email (string)
- phone (string)
- role (string)
- team_id (string)
- players_list (array)
- captain (string)
- documents (array)
- status (string)
- registered_at (datetime)

**Collection: `matches`**
- sport (string)
- tournament_id (string)
- stage (string)
- start_time (datetime)
- end_time (datetime)
- venue_id (string)
- status (string)
- team1_id (string)
- team2_id (string)
- umpires_officials (object)
- max_innings (integer)
- metadata (object)

**Collection: `live_scores`**
- sport (string)
- status (string)
- updated_at (datetime)
- innings (array) - for cricket
- batting_team_id (string)
- bowling_team_id (string)
- current_batsmen (array)
- current_bowler (object)
- recent_overs (array)
- total_runs (integer)
- required_runs (integer)
- target (integer)
- partnership (integer)
- team_scores (object) - for kabaddi
- player_points (array)
- super_tackles (integer)
- bonus_points (integer)
- sets (array) - for volleyball
- current_set (integer)
- timeouts (object)

**Collection: `scoreboards`**
- sport (string)
- display_summary (string)
- team1_score (integer)
- team2_score (integer)
- period_breakdown (object)
- top_performers (array)
- last_updated (datetime)

**Collection: `achievements`**
- title (string)
- description (string)
- category (string)
- player_id (string)
- team_id (string)
- match_id (string)
- date_awarded (datetime)
- points (integer)
- badge_url (string)

### Step 4: Run Your Website

#### Start Python Server (Frontend):
```bash
cd cricket
python -m http.server 8080
```
Then open: http://localhost:8080

#### Optional: Start Mock Backend (Legacy API):
```bash
python backend/mock_api.py
```

---

## 📋 How to Use the Application

### 1️⃣ Register Teams (Players)

**URL:** http://localhost:8080/cricket.tornament/register.html

1. Click **"Register Team"** in navigation
2. Select your sport (Cricket, Kabaddi, or Volleyball)
3. Enter team details (name, manager info)
4. Add players with their roles
5. Select one captain
6. Submit

✅ Data automatically saved to Appwrite `registrations` collection

### 2️⃣ Host a Match (Admin)

**URL:** http://localhost:8080/cricket.tornament/admin.html

1. Click **"🎮 Host Match"** in navigation
2. Enter admin/umpire details (optional)
3. Select two registered teams
4. Choose sport type
5. Click **"Create Match"**

✅ Match created in Appwrite `matches` collection

### 3️⃣ Live Scoring

**URL:** http://localhost:8080/cricket.tornament/live_score.html

1. Click **"Live Matches"** in navigation
2. View all matches or filter by status
3. Click on a match to open live score interface

#### Cricket Scoring:
- Add runs (1, 2, 4, 6)
- Record wickets
- Track overs

#### Kabaddi Scoring:
- Update team scores
- Add raids and tackles
- Track super tackles

#### Volleyball Scoring:
- Update set scores
- Track point-by-point

✅ Scores updated in real-time to Appwrite with WebSocket support

### 4️⃣ View Achievements

**URL:** http://localhost:8080/cricket.tornament/achievements.html

- View top achievements by sport
- Highest scorer
- Most wickets (cricket)
- Most raids/tackles (kabaddi)
- Most aces/blocks (volleyball)

---

## 🔧 Technical Details

### Files Structure

```
cricket/
├── js/
│   ├── config.js ........................ Appwrite configuration
│   ├── appwrite-sdk.js .................. Complete Appwrite SDK class
│   ├── registration-handler.js ......... Register page logic
│   ├── live-score-handler.js ........... Live score page logic
│   ├── admin-handler.js ................ Admin/hosting page logic
│   ├── achievements-handler.js ......... Achievements page logic
│   ├── auth.js ......................... Authentication (currently minimal)
│   ├── script.js ....................... General utilities
│   └── scoring.js ...................... Legacy scoring
├── cricket.tornament/
│   ├── register.html ................... Team registration page
│   ├── live_score.html ................. Live match display
│   ├── admin.html ...................... Host match & scoring
│   ├── achievements.html ............... Achievements display
│   ├── index.html ...................... Home page
│   └── ... other files
└── style.css ........................... Main stylesheet
```

### Key Classes & Functions

#### AppwriteService Class (appwrite-sdk.js)

**Initialization:**
```javascript
// Called automatically on page load
await appwriteService.init();
```

**Teams:**
```javascript
await appwriteService.createTeam(data);
const teams = await appwriteService.getTeams();
```

**Registrations:**
```javascript
await appwriteService.registerPlayer(data);
const registrations = await appwriteService.getRegistrations();
```

**Matches:**
```javascript
await appwriteService.createMatch(data);
const matches = await appwriteService.getMatches(filters);
const match = await appwriteService.getMatchById(matchId);
```

**Live Scores:**
```javascript
// Initialize
await appwriteService.initializeLiveScore(matchId, sport, data);

// Update cricket score
await appwriteService.updateCricketScore(matchId, scoreUpdate);

// Update kabaddi score
await appwriteService.updateKabaddiScore(matchId, scoreUpdate);

// Update volleyball score
await appwriteService.updateVolleyballScore(matchId, scoreUpdate);

// Get current score
const liveScore = await appwriteService.getLiveScore(matchId);
```

**Real-time Subscriptions:**
```javascript
const unsubscribe = appwriteService.subscribeToLiveScore(
    matchId,
    (updatePayload) => {
        console.log('Score updated:', updatePayload);
    },
    (error) => {
        console.error('Error:', error);
    }
);

// To unsubscribe
unsubscribe();
```

**Achievements:**
```javascript
await appwriteService.createAchievement(data);
const achievements = await appwriteService.getAchievements(filters);
```

---

## 🔒 Security & Permissions

### Recommended Appwrite Permissions:

1. **Tournaments** → Public read, Admin write
2. **Teams** → Public read, Any write (let teams create)
3. **Registrations** → Admin read, Any write
4. **Matches** → Public read, Admin write
5. **Live Scores** → Public read, Admin write (from scoring interface)
6. **Scoreboards** → Public read, Admin write
7. **Achievements** → Public read, Admin write

### Set in Appwrite Console:
- Go to Collection → Permissions
- Set Role-based access as above

---

## 🐛 Troubleshooting

### Problem: "Appwrite SDK not loaded"
**Solution:** 
- Check internet connection (CDN should load)
- Verify `<script src="https://cdn.jsdelivr.net/npm/appwrite@latest"></script>` in HTML

### Problem: "Failed to connect to Appwrite"
**Solution:**
- Verify credentials in `config.js`
- Check Appwrite instance is running
- Ensure Project is created

### Problem: Collections not found
**Solution:**
- Create collections manually in Appwrite console
- Or wait for auto-creation (first page load)

### Problem: Real-time updates not working
**Solution:**
- Falls back to polling (every 3 seconds)
- Check browser console for WebSocket errors

### Problem: Scores not saving
**Solution:**
- Verify Appwrite permissions are set correctly
- Check API key has write access
- Look at browser console for error messages

---

## 📊 Sample Data

To test, add sample registrations:

```javascript
// In browser console on registration page
await appwriteService.registerPlayer({
    name: 'Tiger Team',
    email: 'manager@tiger.com',
    phone: '9876543210',
    role: 'manager',
    team_id: 'tiger-team',
    players_list: [
        { name: 'Player 1', role: 'batter', is_captain: true },
        { name: 'Player 2', role: 'bowler', is_captain: false }
    ]
});
```

---

## 🚀 Advanced Features

### Real-time Live Updates
- Uses Appwrite Realtime API for instant updates
- Fallback to 3-second polling if WebSocket unavailable

### Multi-Sport Support
- Cricket (overs, wickets, runs)
- Kabaddi (raids, tackles, points)
- Volleyball (sets, timeouts, points)

### Admin Dashboard
- Host matches
- Update live scores
- Manage tournaments

### Achievement System
- Auto-award achievements
- Display top performers
- Track player statistics

---

## 📞 Support

For issues or questions:
1. Check browser console (F12 → Console tab)
2. Verify Appwrite connection in console logs
3. Ensure credentials are correctly set in `config.js`
4. Check Appwrite database for sample data

---

## ✅ Checklist Before Going Live

- [ ] Appwrite account created
- [ ] Project ID configured
- [ ] Database ID configured
- [ ] API Key configured
- [ ] Collections created
- [ ] Permissions set correctly
- [ ] Frontend loads without errors
- [ ] Can register a team
- [ ] Can create a match
- [ ] Can update scores
- [ ] Real-time updates working (or polling fallback)
- [ ] Achievements displaying

---

**Happy Sports Arena Hub! 🏆**
