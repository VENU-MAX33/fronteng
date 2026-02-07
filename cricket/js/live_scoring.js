// live_scoring.js - Handles Viewer Updates (Polling)

let matchId = 1; // Default
const params = new URLSearchParams(window.location.search);
if (params.has('id')) {
    matchId = params.get('id');
}

async function updateScoreDisplay() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`);
        if (!response.ok) return;

        const data = await response.json();

        // Update DOM elements
        document.getElementById('battingTeam').innerText = data.batting_team;
        document.getElementById('bowlingTeam').innerText = data.bowling_team;
        document.getElementById('score').innerText = data.score;
        document.getElementById('wickets').innerText = data.wickets;
        document.getElementById('overs').innerText = data.overs.toFixed(1);

        // Optional: Update target if chasing (not implemented in backend yet, but safe to ignore)
        if (data.target) {
            document.getElementById('targetDisplay').style.display = 'block';
            document.getElementById('targetScore').innerText = data.target;
        }

    } catch (error) {
        console.error("Error fetching live score:", error);
    }
}

// Poll every 3 seconds
setInterval(updateScoreDisplay, 3000);

// Run once immediately
document.addEventListener('DOMContentLoaded', updateScoreDisplay);
