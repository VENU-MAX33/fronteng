// ============================================================================
// ACHIEVEMENTS HANDLER - DISPLAY & AWARD ACHIEVEMENTS
// Fetches and displays achievements from Appwrite by sport and category
// ============================================================================

let currentSport = 'cricket';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Initializing achievements page...');

    // Initialize Appwrite
    const initSuccess = await appwriteService.init();
    if (!initSuccess) {
        showAlert('❌ Failed to connect to Appwrite', 'error');
        return;
    }

    // Load achievements for default sport
    await loadAchievements(currentSport);

    // Setup sport tab listeners
    setupAchievementTabs();

    console.log('✅ Achievements page initialized');
});

/**
 * Setup tab switching for sports
 */
function setupAchievementTabs() {
    const tabs = document.querySelectorAll('[onclick*="showSport"]');
    tabs.forEach(tab => {
        tab.addEventListener('click', async (e) => {
            const sportMatch = tab.getAttribute('onclick').match(/'([^']+)'/);
            if (sportMatch) {
                currentSport = sportMatch[1];
                await loadAchievements(currentSport);
            }
        });
    });

    console.log('✅ Achievement tabs configured');
}

/**
 * Load achievements from Appwrite
 */
async function loadAchievements(sport) {
    try {
        console.log(`📥 Loading achievements for ${sport}...`);

        const achievements = await appwriteService.getAchievements();
        
        if (sport === 'cricket') {
            displayCricketAchievements(achievements);
        } else if (sport === 'kabaddi') {
            displayKabaddiAchievements(achievements);
        } else if (sport === 'volleyball') {
            displayVolleyballAchievements(achievements);
        }

        console.log(`✅ Loaded achievements for ${sport}`);
    } catch (error) {
        console.error('❌ Error loading achievements:', error);
    }
}

/**
 * Display cricket achievements
 */
function displayCricketAchievements(allAchievements) {
    // Highest Individual Score
    const highestScore = allAchievements
        .filter(a => a.category === 'highest_score')
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    const highestScoreContainer = document.getElementById('cricketHighestScore');
    if (highestScoreContainer) {
        if (highestScore) {
            highestScoreContainer.innerHTML = createAchievementCard({
                rank: '🥇',
                title: `${highestScore.title} - ${highestScore.points} runs`,
                player: highestScore.player_id,
                description: highestScore.description
            });
        } else {
            highestScoreContainer.innerHTML = '<div class="achievement-card"><p style="color: var(--text-light);">No data yet</p></div>';
        }
    }

    // Most Wickets
    const mostWickets = allAchievements
        .filter(a => a.category === 'most_wickets')
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    const mostWicketsContainer = document.getElementById('cricketMostWickets');
    if (mostWicketsContainer) {
        if (mostWickets) {
            mostWicketsContainer.innerHTML = createAchievementCard({
                rank: '🥇',
                title: `${mostWickets.title} - ${mostWickets.points} wickets`,
                player: mostWickets.player_id,
                description: mostWickets.description
            });
        } else {
            mostWicketsContainer.innerHTML = '<div class="achievement-card"><p style="color: var(--text-light);">No data yet</p></div>';
        }
    }

    // Highest Team Score
    const highestTeam = allAchievements
        .filter(a => a.category === 'highest_team_score')
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    const highestTeamContainer = document.getElementById('cricketHighestTeam');
    if (highestTeamContainer) {
        if (highestTeam) {
            highestTeamContainer.innerHTML = createAchievementCard({
                rank: '🥇',
                title: `${highestTeam.title} - ${highestTeam.points} runs`,
                team: highestTeam.team_id,
                description: highestTeam.description
            });
        } else {
            highestTeamContainer.innerHTML = '<div class="achievement-card"><p style="color: var(--text-light);">No data yet</p></div>';
        }
    }

    console.log('✅ Cricket achievements displayed');
}

/**
 * Display kabaddi achievements
 */
function displayKabaddiAchievements(allAchievements) {
    const kabaddiAchievements = allAchievements.filter(a => a.category?.includes('kabaddi'));

    // Most Raids
    const mostRaids = kabaddiAchievements
        .filter(a => a.category === 'most_raids')
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    const mostRaidsContainer = document.getElementById('kabaddiMostRaids');
    if (mostRaidsContainer) {
        if (mostRaids) {
            mostRaidsContainer.innerHTML = createAchievementCard({
                rank: '🥇',
                title: `${mostRaids.title} - ${mostRaids.points} raids`,
                player: mostRaids.player_id,
                description: mostRaids.description
            });
        } else {
            mostRaidsContainer.innerHTML = '<div class="achievement-card"><p style="color: var(--text-light);">No data yet</p></div>';
        }
    }

    // Most Tackles
    const mostTackles = kabaddiAchievements
        .filter(a => a.category === 'most_tackles')
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    const mostTacklesContainer = document.getElementById('kabaddiMostTackles');
    if (mostTacklesContainer) {
        if (mostTackles) {
            mostTacklesContainer.innerHTML = createAchievementCard({
                rank: '🥇',
                title: `${mostTackles.title} - ${mostTackles.points} tackles`,
                player: mostTackles.player_id,
                description: mostTackles.description
            });
        } else {
            mostTacklesContainer.innerHTML = '<div class="achievement-card"><p style="color: var(--text-light);">No data yet</p></div>';
        }
    }

    console.log('✅ Kabaddi achievements displayed');
}

/**
 * Display volleyball achievements
 */
function displayVolleyballAchievements(allAchievements) {
    const volleyballAchievements = allAchievements.filter(a => a.category?.includes('volleyball'));

    // Most Aces
    const mostAces = volleyballAchievements
        .filter(a => a.category === 'most_aces')
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    const mostAcesContainer = document.getElementById('volleyballMostAces');
    if (mostAcesContainer) {
        if (mostAces) {
            mostAcesContainer.innerHTML = createAchievementCard({
                rank: '🥇',
                title: `${mostAces.title} - ${mostAces.points} aces`,
                player: mostAces.player_id,
                description: mostAces.description
            });
        } else {
            mostAcesContainer.innerHTML = '<div class="achievement-card"><p style="color: var(--text-light);">No data yet</p></div>';
        }
    }

    // Most Blocks
    const mostBlocks = volleyballAchievements
        .filter(a => a.category === 'most_blocks')
        .sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    const mostBlocksContainer = document.getElementById('volleyballMostBlocks');
    if (mostBlocksContainer) {
        if (mostBlocks) {
            mostBlocksContainer.innerHTML = createAchievementCard({
                rank: '🥇',
                title: `${mostBlocks.title} - ${mostBlocks.points} blocks`,
                player: mostBlocks.player_id,
                description: mostBlocks.description
            });
        } else {
            mostBlocksContainer.innerHTML = '<div class="achievement-card"><p style="color: var(--text-light);">No data yet</p></div>';
        }
    }

    console.log('✅ Volleyball achievements displayed');
}

/**
 * Create achievement card HTML
 */
function createAchievementCard(data) {
    return `
        <div class="achievement-card">
            <div class="achievement-rank">${data.rank}</div>
            <div class="achievement-info">
                <h4>${data.title}</h4>
                <p>${data.player || data.team || 'Unknown'}</p>
                ${data.description ? `<small style="color: var(--text-light);">${data.description}</small>` : ''}
            </div>
        </div>
    `;
}

/**
 * Award an achievement (admin function)
 */
async function awardAchievement(data) {
    try {
        console.log('🏆 Awarding achievement:', data);

        const achievement = await appwriteService.createAchievement({
            title: data.title,
            description: data.description || '',
            category: data.category,
            player_id: data.player_id || '',
            team_id: data.team_id || '',
            match_id: data.match_id || '',
            points: data.points || 0,
            badge_url: data.badge_url || ''
        });

        if (achievement) {
            showAlert('✅ Achievement awarded!', 'success');
            await loadAchievements(currentSport);
        }
    } catch (error) {
        console.error('❌ Error awarding achievement:', error);
        showAlert('❌ Failed to award achievement', 'error');
    }
}

/**
 * Switch sport tab
 */
async function showSport(sport) {
    currentSport = sport;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const sportTabMap = {
        'cricket': 'cricketTab',
        'kabaddi': 'kabaddiTab',
        'volleyball': 'volleyballTab'
    };

    const activeTab = document.getElementById(sportTabMap[sport]);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    await loadAchievements(sport);
}

console.log('✅ Achievements handler loaded');
