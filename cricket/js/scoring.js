// scoring.js - Handles Admin Scoring Actions

let currentMatchId = 1; // Default or fetch from URL params

// Check if match ID is in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('id')) {
    currentMatchId = urlParams.get('id');
}

async function scoreBall(runOrOut) {
    // Authentication removed - open scoring

    let payload = {
        run: 0,
        is_wicket: false,
        extra_type: null
    };

    if (runOrOut === 'OUT') {
        payload.run = 0;
        payload.is_wicket = true;
    } else {
        payload.run = parseInt(runOrOut);
        payload.is_wicket = false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/matches/${currentMatchId}/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            logout();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            alert("Failed to update score: " + (error.detail || 'Unknown error'));
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        console.log("Score Updated:", data);

        // Refresh display immediately
        updateScoreDisplay();

    } catch (error) {
        console.error("Error scoring ball:", error);
        alert("Network Error");
    }
}

async function scoreExtra(type) {
    // Authentication removed - open scoring

    let payload = {
        run: 0,
        is_wicket: false,
        extra_type: type // "WD" or "NB"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/matches/${currentMatchId}/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            logout();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            alert("Failed to update extra: " + (error.detail || 'Unknown error'));
            return;
        }

        console.log("Extra Updated");
        updateScoreDisplay();

    } catch (error) {
        console.error("Error scoring extra:", error);
        alert("Network Error");
    }
}

// Initial check
console.log("Scoring script loaded for match:", currentMatchId);
