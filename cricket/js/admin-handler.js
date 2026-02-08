// ============================================================================
// ADMIN HANDLER - HOST MATCH & SCORING
// Handles match creation, team selection, and live score updates
// ============================================================================

let selectedTeam1 = null;
let selectedTeam2 = null;
let currentMatchId = null;
let currentSport = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Initializing admin page...');

    // Initialize Appwrite
    const initSuccess = await appwriteService.init();
    if (!initSuccess) {
        showAlert('❌ Failed to connect to Appwrite', 'error');
        return;
    }

    // Load registered teams for selection
    await loadTeamsForSelection();

    // Setup form handlers
    setupAdminHandlers();

    console.log('✅ Admin page initialized');
});

/**
 * Load registered teams for match hosting
 */
async function loadTeamsForSelection() {
    try {
        console.log('📥 Loading teams for match creation...');

        const registrations = await appwriteService.getRegistrations();
        const container = document.getElementById('teamSelectContainer');

        if (!container) {
            console.warn('⚠️ Team selection container not found');
            return;
        }

        if (registrations.length === 0) {
            container.innerHTML = '<p class="no-teams-msg">No registered teams found. Please ask teams to register first.</p>';
            return;
        }

        // Display teams as selectable cards
        container.innerHTML = registrations.map(reg => `
            <div class="team-select-card" onclick="selectTeam('${reg.$id}', '${reg.name}', this)">
                <div class="check-icon">✓</div>
                <div class="team-icon">🏆</div>
                <h4>${reg.name}</h4>
                <p>Players: ${reg.players_list?.length || 0}</p>
            </div>
        `).join('');

        console.log(`✅ ${registrations.length} teams loaded`);
    } catch (error) {
        console.error('❌ Error loading teams:', error);
        showAlert('❌ Failed to load teams', 'error');
    }
}

/**
 * Select a team for the match
 */
function selectTeam(teamId, teamName, element) {
    // Determine if this is team1 or team2
    const currentSelection = document.querySelectorAll('.team-select-card.selected').length;
    
    // If both teams already selected, unselect first
    if (currentSelection >= 2 && !element.classList.contains('selected')) {
        showAlert('⚠️ Two teams already selected. Deselect one first.', 'info');
        return;
    }

    // Toggle selection
    element.classList.toggle('selected');

    if (element.classList.contains('selected')) {
        if (currentSelection === 0) {
            selectedTeam1 = { id: teamId, name: teamName };
            console.log('🏆 Team 1 selected:', teamName);
        } else {
            selectedTeam2 = { id: teamId, name: teamName };
            console.log('🏆 Team 2 selected:', teamName);
        }
    } else {
        if (selectedTeam1?.id === teamId) selectedTeam1 = null;
        if (selectedTeam2?.id === teamId) selectedTeam2 = null;
    }

    // Update summary
    updateSelectionSummary();
}

/**
 * Update match selection summary
 */
function updateSelectionSummary() {
    const summary = document.querySelector('.selection-summary');
    if (!summary) return;

    if (selectedTeam1 && selectedTeam2) {
        summary.innerHTML = `
            <div class="team-box">
                <strong>${selectedTeam1.name}</strong>
            </div>
            <div class="vs">VS</div>
            <div class="team-box">
                <strong>${selectedTeam2.name}</strong>
            </div>
        `;
    } else {
        summary.innerHTML = '<p style="color: var(--text-light); margin: 0;">Select two teams to proceed</p>';
    }
}

/**
 * Setup admin form handlers
 */
function setupAdminHandlers() {
    const hostMatchBtn = document.getElementById('hostMatchBtn');
    if (hostMatchBtn) {
        hostMatchBtn.addEventListener('click', createMatch);
    }

    const sportSelect = document.getElementById('sportSelect');
    if (sportSelect) {
        sportSelect.addEventListener('change', (e) => {
            currentSport = e.target.value;
            console.log('🎮 Sport selected:', currentSport);
        });
    }

    console.log('✅ Admin handlers configured');
}

/**
 * Create a new match
 */
async function createMatch() {
    try {
        // Validate selections
        if (!selectedTeam1 || !selectedTeam2) {
            showAlert('❌ Please select both teams', 'error');
            return;
        }

        const sport = document.getElementById('sportSelect')?.value || 'cricket';
        const adminName = document.getElementById('adminName')?.value || 'Admin';
        const umpireName = document.getElementById('umpireName')?.value || 'Umpire';
        const venue = document.getElementById('venue')?.value || 'Sports Arena';

        // Show loading
        const btn = document.getElementById('hostMatchBtn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating match...';

        console.log('🎮 Creating match:', { team1: selectedTeam1.name, team2: selectedTeam2.name, sport });

        // Create match in Appwrite
        const match = await appwriteService.createMatch({
            sport: sport,
            team1_id: selectedTeam1.id,
            team2_id: selectedTeam2.id,
            start_time: new Date().toISOString(),
            venue_id: venue,
            umpires_officials: {
                admin: adminName,
                umpire: umpireName
            }
        });

        if (match) {
            currentMatchId = match.$id;
            console.log('✅ Match created:', currentMatchId);

            // Initialize live score
            const liveScoreInit = await appwriteService.initializeLiveScore(
                match.$id,
                sport,
                {
                    batting_team_id: selectedTeam1.id,
                    bowling_team_id: selectedTeam2.id
                }
            );

            if (liveScoreInit) {
                showAlert(`✅ Match created! Match ID: ${match.$id}`, 'success');

                // Show scoring interface
                await showScoringInterface(match.$id, sport);

                // Redirect to live score page after 2 seconds
                setTimeout(() => {
                    window.location.href = `live_score.html?id=${match.$id}`;
                }, 2000);
            }
        } else {
            showAlert('❌ Failed to create match', 'error');
        }

        btn.disabled = false;
        btn.innerHTML = originalText;
    } catch (error) {
        console.error('❌ Error creating match:', error);
        showAlert('❌ An error occurred', 'error');
    }
}

/**
 * Show scoring interface based on sport
 */
async function showScoringInterface(matchId, sport) {
    try {
        const scoringContainer = document.getElementById('scoringContainer');
        if (!scoringContainer) return;

        if (sport === 'cricket') {
            displayCricketScoring(matchId);
        } else if (sport === 'kabaddi') {
            displayKabaddiScoring(matchId);
        } else if (sport === 'volleyball') {
            displayVolleyballScoring(matchId);
        }

        console.log('✅ Scoring interface displayed:', sport);
    } catch (error) {
        console.error('❌ Error showing scoring interface:', error);
    }
}

/**
 * Display cricket scoring controls
 */
function displayCricketScoring(matchId) {
    const container = document.getElementById('scoringContainer');
    if (!container) return;

    container.innerHTML = `
        <h3>🏏 Cricket Scoring</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div>
                <label>Current Score</label>
                <input type="number" id="cricketScore" value="0" min="0">
                <button class="btn" onclick="updateCricketScore('${matchId}', 1)" style="margin-top: 0.5rem;">+1 Run</button>
                <button class="btn" onclick="updateCricketScore('${matchId}', 2)" style="margin-top: 0.5rem;">+2 Runs</button>
                <button class="btn" onclick="updateCricketScore('${matchId}', 4)" style="margin-top: 0.5rem;">+4 Runs</button>
                <button class="btn" onclick="updateCricketScore('${matchId}', 6)" style="margin-top: 0.5rem;">+6 Runs</button>
            </div>
            <div>
                <label>Wickets</label>
                <input type="number" id="cricketWickets" value="0" min="0" max="10">
                <button class="btn btn-danger" onclick="addWicket('${matchId}')" style="margin-top: 0.5rem;">Add Wicket</button>
                
                <label style="margin-top: 1rem;">Overs</label>
                <input type="number" id="cricketOvers" value="0" min="0">
                <small style="color: var(--text-light);">Format: 5.3 (5 overs, 3 balls)</small>
            </div>
        </div>
        <button class="btn btn-accent" onclick="finalizeCricketScore('${matchId}')" style="margin-top: 1rem; width: 100%;">
            📤 Update Live Score
        </button>
    `;
}

/**
 * Display kabaddi scoring controls
 */
function displayKabaddiScoring(matchId) {
    const container = document.getElementById('scoringContainer');
    if (!container) return;

    container.innerHTML = `
        <h3>🤼 Kabaddi Scoring</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div>
                <label>Team 1 Score</label>
                <input type="number" id="kabaddiTeam1" value="0" min="0">
                <button class="btn" onclick="updateKabaddiScore('${matchId}', 'team1', 1)" style="margin-top: 0.5rem;">+1</button>
                <button class="btn" onclick="updateKabaddiScore('${matchId}', 'team1', 2)" style="margin-top: 0.5rem;">+2</button>
                <button class="btn" onclick="updateKabaddiScore('${matchId}', 'team1', 3)" style="margin-top: 0.5rem;">+3</button>
            </div>
            <div>
                <label>Team 2 Score</label>
                <input type="number" id="kabaddiTeam2" value="0" min="0">
                <button class="btn" onclick="updateKabaddiScore('${matchId}', 'team2', 1)" style="margin-top: 0.5rem;">+1</button>
                <button class="btn" onclick="updateKabaddiScore('${matchId}', 'team2', 2)" style="margin-top: 0.5rem;">+2</button>
                <button class="btn" onclick="updateKabaddiScore('${matchId}', 'team2', 3)" style="margin-top: 0.5rem;">+3</button>
            </div>
        </div>
        <button class="btn btn-accent" onclick="finalizeKabaddiScore('${matchId}')" style="margin-top: 1rem; width: 100%;">
            📤 Update Live Score
        </button>
    `;
}

/**
 * Display volleyball scoring controls
 */
function displayVolleyballScoring(matchId) {
    const container = document.getElementById('scoringContainer');
    if (!container) return;

    container.innerHTML = `
        <h3>🏐 Volleyball Scoring</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div>
                <label>Team 1 Score</label>
                <input type="number" id="volleyballTeam1" value="0" min="0" max="25">
                <button class="btn" onclick="updateVolleyballScore('${matchId}', 'team1')" style="margin-top: 0.5rem;">+1 Point</button>
            </div>
            <div>
                <label>Team 2 Score</label>
                <input type="number" id="volleyballTeam2" value="0" min="0" max="25">
                <button class="btn" onclick="updateVolleyballScore('${matchId}', 'team2')" style="margin-top: 0.5rem;">+1 Point</button>
            </div>
        </div>
        <button class="btn btn-accent" onclick="finalizeVolleyballScore('${matchId}')" style="margin-top: 1rem; width: 100%;">
            📤 Update Live Score
        </button>
    `;
}

/**
 * Update cricket score
 */
async function updateCricketScore(matchId, runsToAdd) {
    const currentScore = parseInt(document.getElementById('cricketScore')?.value || 0);
    const newScore = currentScore + runsToAdd;
    document.getElementById('cricketScore').value = newScore;
    console.log('📝 Cricket score updated to:', newScore);
}

/**
 * Add wicket in cricket
 */
async function addWicket(matchId) {
    const currentWickets = parseInt(document.getElementById('cricketWickets')?.value || 0);
    if (currentWickets < 10) {
        document.getElementById('cricketWickets').value = currentWickets + 1;
        console.log('📝 Wicket added');
    }
}

/**
 * Finalize cricket score to database
 */
async function finalizeCricketScore(matchId) {
    try {
        const score = parseInt(document.getElementById('cricketScore')?.value || 0);
        const wickets = parseInt(document.getElementById('cricketWickets')?.value || 0);
        const overs = parseFloat(document.getElementById('cricketOvers')?.value || 0);

        console.log('📤 Uploading cricket score:', { score, wickets, overs });

        await appwriteService.updateCricketScore(matchId, {
            total_runs: score,
            current_batsmen: [], // Populate from UI if needed
            recent_overs: [],
            innings: [{ runs: score, wickets, overs }]
        });

        showAlert('✅ Cricket score updated!', 'success');
    } catch (error) {
        console.error('❌ Error finalizing score:', error);
        showAlert('❌ Failed to update score', 'error');
    }
}

/**
 * Update kabaddi score
 */
async function updateKabaddiScore(matchId, team, pointsToAdd) {
    const fieldId = team === 'team1' ? 'kabaddiTeam1' : 'kabaddiTeam2';
    const currentScore = parseInt(document.getElementById(fieldId)?.value || 0);
    document.getElementById(fieldId).value = currentScore + pointsToAdd;
    console.log('📝 Kabaddi score updated');
}

/**
 * Finalize kabaddi score to database
 */
async function finalizeKabaddiScore(matchId) {
    try {
        const team1Score = parseInt(document.getElementById('kabaddiTeam1')?.value || 0);
        const team2Score = parseInt(document.getElementById('kabaddiTeam2')?.value || 0);

        console.log('📤 Uploading kabaddi score:', { team1: team1Score, team2: team2Score });

        await appwriteService.updateKabaddiScore(matchId, {
            team_scores: { team1: team1Score, team2: team2Score },
            player_points: []
        });

        showAlert('✅ Kabaddi score updated!', 'success');
    } catch (error) {
        console.error('❌ Error finalizing score:', error);
        showAlert('❌ Failed to update score', 'error');
    }
}

/**
 * Update volleyball score
 */
async function updateVolleyballScore(matchId, team) {
    const fieldId = team === 'team1' ? 'volleyballTeam1' : 'volleyballTeam2';
    const currentScore = parseInt(document.getElementById(fieldId)?.value || 0);
    if (currentScore < 25) {
        document.getElementById(fieldId).value = currentScore + 1;
        console.log('📝 Volleyball score updated');
    }
}

/**
 * Finalize volleyball score to database
 */
async function finalizeVolleyballScore(matchId) {
    try {
        const team1Score = parseInt(document.getElementById('volleyballTeam1')?.value || 0);
        const team2Score = parseInt(document.getElementById('volleyballTeam2')?.value || 0);

        console.log('📤 Uploading volleyball score:', { team1: team1Score, team2: team2Score });

        await appwriteService.updateVolleyballScore(matchId, {
            sets: [{ score_team1: team1Score, score_team2: team2Score }],
            current_set: 1
        });

        showAlert('✅ Volleyball score updated!', 'success');
    } catch (error) {
        console.error('❌ Error finalizing score:', error);
        showAlert('❌ Failed to update score', 'error');
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(alertContainer);
    }

    const alert = document.createElement('div');
    alert.style.cssText = `
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        font-weight: 500;
    `;
    alert.textContent = message;

    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
    console.log(`[${type.toUpperCase()}] ${message}`);
}

console.log('✅ Admin handler loaded');
