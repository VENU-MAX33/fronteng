// ============================================================================
// REGISTRATION HANDLER - APPWRITE INTEGRATION
// Handles team/player registration form submission to Appwrite
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Initializing registration page...');

    // Initialize Appwrite
    const initSuccess = await appwriteService.init();
    if (!initSuccess) {
        showAlert('❌ Failed to connect to Appwrite. Check console for details.', 'error');
        return;
    }

    // Setup form handlers
    setupRegistrationForm();
});

/**
 * Setup registration form submission
 */
function setupRegistrationForm() {
    const form = document.getElementById('registrationForm');
    if (!form) {
        console.warn('⚠️ Registration form not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitRegistration();
    });

    console.log('✅ Registration form handler attached');
}

/**
 * Collect player data from form
 */
function getPlayersFromForm() {
    const players = [];
    const playerRows = document.querySelectorAll('.player-row');

    playerRows.forEach((row) => {
        const name = row.querySelector('[data-field="playerName"]')?.value || '';
        const role = row.querySelector('[data-field="playerRole"]')?.value || 'player';
        const isCaptain = row.querySelector('[data-field="isCaptain"]')?.checked || false;

        if (name.trim()) {
            players.push({
                name: name.trim(),
                role: role,
                is_captain: isCaptain
            });
        }
    });

    return players;
}

/**
 * Submit registration to Appwrite
 */
async function submitRegistration() {
    try {
        // Get form data
        const teamName = document.getElementById('teamName')?.value || '';
        const managerName = document.getElementById('managerName')?.value || '';
        const managerEmail = document.getElementById('managerEmail')?.value || '';
        const managerPhone = document.getElementById('managerPhone')?.value || '';
        const sport = document.getElementById('sportSelect')?.value || 'cricket';

        // Validation
        if (!teamName.trim()) {
            showAlert('❌ Team name is required', 'error');
            return;
        }

        if (!managerEmail.trim()) {
            showAlert('❌ Email is required', 'error');
            return;
        }

        const players = getPlayersFromForm();
        if (players.length === 0) {
            showAlert('❌ Please add at least one player', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

        // Submit to Appwrite
        console.log('📤 Submitting registration for team:', teamName);

        const registration = await appwriteService.registerPlayer({
            name: teamName,
            email: managerEmail,
            phone: managerPhone,
            role: 'manager',
            team_id: teamName.toLowerCase().replace(/\s+/g, '-'),
            players_list: players,
            captain: players.find(p => p.is_captain)?.name || players[0]?.name || ''
        });

        if (registration) {
            showAlert(`✅ Registration successful! Team "${teamName}" has been registered for ${sport}.`, 'success');

            // Reset form
            document.getElementById('registrationForm')?.reset();

            // Clear player rows
            const playerContainer = document.getElementById('playerContainer');
            if (playerContainer) {
                playerContainer.innerHTML = '';
                addPlayerRow(); // Add one empty row
            }

            // Log success
            console.log('✅ Registration completed:', registration);

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'live_score.html';
            }, 2000);
        } else {
            showAlert('❌ Registration failed. Please try again.', 'error');
        }

        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    } catch (error) {
        console.error('❌ Error during registration:', error);
        showAlert('❌ An unexpected error occurred. Check console.', 'error');
    }
}

/**
 * Add a new player row
 */
function addPlayerRow() {
    const container = document.getElementById('playerContainer');
    if (!container) return;

    const rowId = `player-${Date.now()}`;
    const row = document.createElement('div');
    row.className = 'player-row';
    row.id = rowId;

    row.innerHTML = `
        <div>
            <label>Player Name *</label>
            <input type="text" placeholder="Full name" data-field="playerName" required>
        </div>
        <div>
            <label>Role *</label>
            <select data-field="playerRole" required>
                <option value="batter">Batter</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-rounder</option>
                <option value="keeper">Keeper</option>
                <option value="fielder">Fielder</option>
            </select>
        </div>
        <div>
            <label>Captain</label>
            <input type="checkbox" data-field="isCaptain" onchange="highlightCaptain('${rowId}')">
        </div>
        <button type="button" class="btn btn-small" onclick="removePlayerRow('${rowId}')">
            <i class="fas fa-trash"></i>
        </button>
    `;

    container.appendChild(row);
    console.log('➕ New player row added');
}

/**
 * Remove a player row
 */
function removePlayerRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        console.log('🗑️ Player row removed');
    }
}

/**
 * Highlight captain row
 */
function highlightCaptain(rowId) {
    // Uncheck all other captains
    document.querySelectorAll('[data-field="isCaptain"]').forEach(checkbox => {
        if (checkbox.closest('.player-row').id !== rowId) {
            checkbox.checked = false;
        }
    });

    // Highlight current row
    const row = document.getElementById(rowId);
    if (row) {
        document.querySelectorAll('.player-row').forEach(r => r.style.borderLeft = '4px solid var(--border)');
        if (document.getElementById(rowId).querySelector('[data-field="isCaptain"]').checked) {
            row.style.borderLeft = '4px solid var(--accent)';
        }
    }
}

/**
 * Fetch and display registered teams (for admin view)
 */
async function loadRegisteredTeams() {
    try {
        console.log('📥 Loading registered teams...');
        const registrations = await appwriteService.getRegistrations();

        const container = document.getElementById('registeredTeamsContainer');
        if (!container) return;

        if (registrations.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No teams registered yet.</p>';
            return;
        }

        container.innerHTML = registrations.map(reg => `
            <div class="card" style="padding: 1.5rem; margin-bottom: 1rem;">
                <h3>${reg.name}</h3>
                <p><strong>Manager:</strong> ${reg.manager_name || 'N/A'}</p>
                <p><strong>Email:</strong> ${reg.email || 'N/A'}</p>
                <p><strong>Players:</strong> ${reg.players_list?.length || 0}</p>
                <p><strong>Status:</strong> <span style="color: var(--accent); font-weight: 600;">${reg.status}</span></p>
            </div>
        `).join('');

        console.log(`✅ Loaded ${registrations.length} registered teams`);
    } catch (error) {
        console.error('❌ Error loading teams:', error);
    }
}

console.log('✅ Registration handler loaded');
