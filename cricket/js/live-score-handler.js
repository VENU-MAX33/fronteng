// ============================================================================
// LIVE SCORE HANDLER - APPWRITE REAL-TIME INTEGRATION
// Handles real-time score updates for Cricket, Kabaddi, and Volleyball
// ============================================================================

let currentMatchId = null;
let currentSport = null;
let realtimeUnsubscribe = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Initializing live score page...');

    // Initialize Appwrite
    const initSuccess = await appwriteService.init();
    if (!initSuccess) {
        showAlert('❌ Failed to connect to Appwrite. Check console.', 'error');
        return;
    }

    // Extract match ID from URL params
    const params = new URLSearchParams(window.location.search);
    currentMatchId = params.get('id') || params.get('matchId');

    if (currentMatchId) {
        await loadMatchDetails();
        await setupRealtimeUpdates();
    } else {
        await loadAllMatches();
    }

    console.log('✅ Live score page initialized');
});

/**
 * Load details of a specific match
 */
async function loadMatchDetails() {
    try {
        console.log('📥 Loading match details for:', currentMatchId);

        const match = await appwriteService.getMatchById(currentMatchId);
        if (!match) {
            showAlert('❌ Match not found', 'error');
            return;
        }

        currentSport = match.sport;
        console.log('🏟️ Sport:', currentSport);

        // Load live score
        const liveScore = await appwriteService.getLiveScore(currentMatchId);
        if (liveScore) {
            displayLiveScore(liveScore, match);
        }

        console.log('✅ Match details loaded');
    } catch (error) {
        console.error('❌ Error loading match details:', error);
    }
}

/**
 * Setup real-time updates using Appwrite subscription
 */
async function setupRealtimeUpdates() {
    try {
        console.log('🔄 Setting up real-time updates...');

        realtimeUnsubscribe = appwriteService.subscribeToLiveScore(
            currentMatchId,
            (payload) => {
                console.log('🔄 Real-time update received:', payload);
                displayLiveScore(payload);
            },
            (error) => {
                console.error('❌ Real-time subscription error:', error);
                // Fallback to polling every 3 seconds
                setInterval(async () => {
                    const liveScore = await appwriteService.getLiveScore(currentMatchId);
                    if (liveScore) {
                        displayLiveScore(liveScore);
                    }
                }, 3000);
            }
        );

        console.log('✅ Real-time updates configured');
    } catch (error) {
        console.error('⚠️ Fallback to polling:', error);
    }
}

/**
 * Display live score based on sport
 */
function displayLiveScore(scoreData, matchData = null) {
    const sport = scoreData.sport || currentSport;

    // Light up the "🔴 LIVE" indicator
    document.querySelectorAll('[data-status]').forEach(el => {
        if (scoreData.status === 'live' || scoreData.status === 'ongoing') {
            el.innerHTML = '🔴 <strong>LIVE</strong>';
            el.style.color = '#ef4444';
        }
    });

    if (sport === 'cricket') {
        displayCricketScore(scoreData, matchData);
    } else if (sport === 'kabaddi') {
        displayKabaddiScore(scoreData, matchData);
    } else if (sport === 'volleyball') {
        displayVolleyballScore(scoreData, matchData);
    }

    console.log('✅ Score displayed for:', sport);
}

/**
 * Display cricket score
 */
function displayCricketScore(scoreData, matchData) {
    // Update batting team
    const battingTeamEl = document.getElementById('battingTeam') || 
                         document.querySelector('[data-field="batting_team"]');
    if (battingTeamEl) {
        battingTeamEl.textContent = scoreData.batting_team_id || 'Team 1';
    }

    // Update bowling team
    const bowlingTeamEl = document.getElementById('bowlingTeam') || 
                         document.querySelector('[data-field="bowling_team"]');
    if (bowlingTeamEl) {
        bowlingTeamEl.textContent = scoreData.bowling_team_id || 'Team 2';
    }

    // Update total runs
    const scoreEl = document.getElementById('score') || 
                   document.querySelector('[data-field="total_runs"]');
    if (scoreEl) {
        scoreEl.textContent = scoreData.total_runs || 0;
    }

    // Update wickets
    const wicketsEl = document.getElementById('wickets') || 
                     document.querySelector('[data-field="wickets"]');
    if (wicketsEl) {
        wicketsEl.textContent = scoreData.current_batsmen?.length || 0;
    }

    // Update overs
    const oversEl = document.getElementById('overs') || 
                   document.querySelector('[data-field="overs"]');
    if (oversEl && scoreData.recent_overs) {
        const totalBalls = scoreData.recent_overs.length;
        const overs = Math.floor(totalBalls / 6);
        const balls = totalBalls % 6;
        oversEl.textContent = `${overs}.${balls}`;
    }

    // Update current batsmen
    const batsmenEl = document.getElementById('currentBatsmen') || 
                     document.querySelector('[data-field="current_batsmen"]');
    if (batsmenEl && scoreData.current_batsmen) {
        batsmenEl.innerHTML = scoreData.current_batsmen.map(batsman => 
            `<div>${batsman.name} (${batsman.runs})</div>`
        ).join('');
    }

    // Update target if chasing
    if (scoreData.target > 0) {
        const targetEl = document.getElementById('targetDisplay');
        if (targetEl) {
            targetEl.style.display = 'block';
            targetEl.textContent = `Target: ${scoreData.target}`;
        }

        const requiredEl = document.getElementById('requiredDisplay');
        if (requiredEl) {
            const required = scoreData.target - scoreData.total_runs;
            requiredEl.textContent = `Needed: ${required > 0 ? required : 0}`;
        }
    }

    // Update partnership
    const partnershipEl = document.querySelector('[data-field="partnership"]');
    if (partnershipEl) {
        partnershipEl.textContent = scoreData.partnership || 0;
    }

    // Update innings history
    const inningsEl = document.getElementById('inningsHistory') || 
                     document.querySelector('[data-field="innings"]');
    if (inningsEl && scoreData.innings) {
        inningsEl.innerHTML = scoreData.innings.map((inn, idx) => `
            <div style="padding: 0.5rem; background: var(--light-bg); margin: 0.5rem 0; border-radius: 4px;">
                <strong>Innings ${idx + 1}:</strong> 
                ${inn.runs}/${inn.wickets} (${inn.overs} overs)
            </div>
        `).join('');
    }

    console.log('✅ Cricket score updated');
}

/**
 * Display kabaddi score
 */
function displayKabaddiScore(scoreData, matchData) {
    // Update team scores
    const team1ScoreEl = document.getElementById('team1Score') || 
                        document.querySelector('[data-field="team1_score"]');
    if (team1ScoreEl) {
        team1ScoreEl.textContent = scoreData.team_scores?.team1 || 0;
    }

    const team2ScoreEl = document.getElementById('team2Score') || 
                        document.querySelector('[data-field="team2_score"]');
    if (team2ScoreEl) {
        team2ScoreEl.textContent = scoreData.team_scores?.team2 || 0;
    }

    // Update current period
    const periodEl = document.querySelector('[data-field="current_period"]');
    if (periodEl) {
        periodEl.textContent = scoreData.periods?.length || 0;
    }

    // Update player points
    const playerPointsEl = document.getElementById('playerPoints') || 
                          document.querySelector('[data-field="player_points"]');
    if (playerPointsEl && scoreData.player_points) {
        playerPointsEl.innerHTML = scoreData.player_points.map(pp => `
            <div style="padding: 0.5rem; background: var(--light-bg); margin: 0.2rem 0; border-radius: 4px;">
                <strong>${pp.player_name}:</strong> 
                Raid: ${pp.raid_points || 0} | Tackle: ${pp.tackle_points || 0}
            </div>
        `).join('');
    }

    // Update super tackles
    const superTacklesEl = document.querySelector('[data-field="super_tackles"]');
    if (superTacklesEl) {
        superTacklesEl.textContent = scoreData.super_tackles || 0;
    }

    console.log('✅ Kabaddi score updated');
}

/**
 * Display volleyball score
 */
function displayVolleyballScore(scoreData, matchData) {
    // Update sets
    const setsEl = document.getElementById('setsDisplay') || 
                  document.querySelector('[data-field="sets"]');
    if (setsEl && scoreData.sets) {
        setsEl.innerHTML = scoreData.sets.map((set, idx) => `
            <div style="padding: 0.5rem; background: var(--light-bg); margin: 0.5rem 0; border-radius: 4px;">
                <strong>Set ${idx + 1}:</strong> 
                ${set.score_team1} - ${set.score_team2} 
                <span style="color: var(--accent);">${set.winner ? `(${set.winner} won)` : ''}</span>
            </div>
        `).join('');
    }

    // Update current set
    const currentSetEl = document.querySelector('[data-field="current_set"]');
    if (currentSetEl) {
        currentSetEl.textContent = scoreData.current_set || 1;
    }

    // Update timeouts
    const timeoutsEl = document.querySelector('[data-field="timeouts"]');
    if (timeoutsEl && scoreData.timeouts) {
        timeoutsEl.textContent = `Team 1: ${scoreData.timeouts.team1 || 0} | Team 2: ${scoreData.timeouts.team2 || 0}`;
    }

    console.log('✅ Volleyball score updated');
}

/**
 * Load all matches (for match list view)
 */
async function loadAllMatches() {
    try {
        console.log('📥 Loading all matches...');

        const filters = {
            status: 'ongoing'
        };

        const matches = await appwriteService.getMatches(filters);
        displayMatchList(matches);

        console.log(`✅ Loaded ${matches.length} matches`);
    } catch (error) {
        console.error('❌ Error loading matches:', error);
    }
}

/**
 * Display list of matches
 */
function displayMatchList(matches) {
    const container = document.getElementById('liveMatches') || 
                     document.getElementById('allMatches');
    
    if (!container) return;

    if (matches.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No live matches at the moment.</p>';
        return;
    }

    container.innerHTML = matches.map(match => `
        <div class="card" onclick="window.location.href='live_score.html?id=${match.$id}'" style="cursor: pointer;">
            <h3>🏟️ ${match.sport.toUpperCase()}</h3>
            <p><strong>${match.team1_id}</strong> vs <strong>${match.team2_id}</strong></p>
            <p style="color: var(--accent); font-weight: 600;">
                ${match.status === 'ongoing' ? '🔴 LIVE' : '⏰ ' + new Date(match.start_time).toLocaleTimeString()}
            </p>
            <small style="color: var(--text-light);">${new Date(match.start_time).toLocaleDateString()}</small>
        </div>
    `).join('');

    console.log('✅ Match list displayed');
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (realtimeUnsubscribe) {
        realtimeUnsubscribe();
        console.log('🔌 Real-time subscription closed');
    }
});

console.log('✅ Live score handler loaded');
