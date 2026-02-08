// ============================================================================
// APPWRITE SDK INTEGRATION
// Comprehensive integration for Cricket, Kabaddi, Volleyball app with Appwrite
// ============================================================================

class AppwriteService {
    constructor() {
        this.client = null;
        this.db = null;
        this.storage = null;
        this.initialized = false;
        this.collections = {
            tournaments: 'tournaments',
            teams: 'teams',
            players: 'players',
            matches: 'matches',
            live_scores: 'live_scores',
            scoreboards: 'scoreboards',
            registrations: 'registrations',
            events: 'events',
            achievements: 'achievements',
            venues: 'venues'
        };
    }

    /**
     * Initialize Appwrite Client
     * Call this on page load before any other operations
     */
    async init() {
        try {
            // Import Appwrite SDK (ensure it's loaded in HTML)
            if (typeof Appwrite === 'undefined') {
                console.error('❌ Appwrite SDK not loaded. Add script tag: <script src="https://cdn.jsdelivr.net/npm/appwrite@latest"></script>');
                return false;
            }

            this.client = new Appwrite.Client();
            
            this.client
                .setEndpoint(APPWRITE_ENDPOINT)
                .setProject(APPWRITE_PROJECT_ID);

            this.db = new Appwrite.Databases(this.client);
            this.storage = new Appwrite.Storage(this.client);

            // If the global APPWRITE_COLLECTIONS mapping exists, use it to override default collection ids
            if (typeof APPWRITE_COLLECTIONS !== 'undefined' && APPWRITE_COLLECTIONS) {
                // Only override keys that exist on the mapping
                Object.keys(this.collections).forEach(key => {
                    if (APPWRITE_COLLECTIONS[key]) {
                        this.collections[key] = APPWRITE_COLLECTIONS[key];
                    }
                });
            }

            this.initialized = true;
            console.log('✅ Appwrite initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Appwrite initialization failed:', error);
            return false;
        }
    }

    /**
     * ========== TOURNAMENTS ==========
     */

    /**
     * Create a new tournament
     */
    async createTournament(data) {
        try {
            const response = await this.db.createDocument(
                APPWRITE_DATABASE_ID,
                this.collections.tournaments,
                Appwrite.ID.unique(),
                {
                    title: data.title,
                    slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
                    sport: data.sport, // 'cricket', 'kabaddi', 'volleyball'
                    start_date: data.start_date,
                    end_date: data.end_date,
                    country: data.country || '',
                    status: data.status || 'scheduled', // scheduled, ongoing, completed
                    organizer_id: data.organizer_id || 'admin',
                    metadata: data.metadata || {}
                }
            );
            console.log('✅ Tournament created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating tournament:', error);
            return null;
        }
    }

    /**
     * Get all tournaments or filter by sport
     */
    async getTournaments(sport = null) {
        try {
            let queries = [];
            if (sport) {
                queries.push(Appwrite.Query.equal('sport', sport));
            }
            
            const response = await this.db.listDocuments(
                APPWRITE_DATABASE_ID,
                this.collections.tournaments,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching tournaments:', error);
            return [];
        }
    }

    /**
     * ========== TEAMS ==========
     */

    /**
     * Create a new team
     */
    async createTeam(data) {
        try {
            const response = await this.db.createDocument(
                APPWRITE_DATABASE_ID,
                this.collections.teams,
                Appwrite.ID.unique(),
                {
                    name: data.name,
                    short_name: data.short_name || '',
                    abbr: data.abbr || '',
                    logo_url: data.logo_url || '',
                    country: data.country || '',
                    players: data.players || [],
                    manager: data.manager || '',
                    created_at: new Date().toISOString()
                }
            );
            console.log('✅ Team created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating team:', error);
            return null;
        }
    }

    /**
     * Get all teams
     */
    async getTeams() {
        try {
            const response = await this.db.listDocuments(
                APPWRITE_DATABASE_ID,
                this.collections.teams
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching teams:', error);
            return [];
        }
    }

    /**
     * ========== PLAYERS / REGISTRATIONS ==========
     */

    /**
     * Register a player / team
     */
    async registerPlayer(data) {
        try {
            const response = await this.db.createDocument(
                APPWRITE_DATABASE_ID,
                this.collections.registrations,
                Appwrite.ID.unique(),
                {
                    name: data.name,
                    email: data.email || '',
                    phone: data.phone || '',
                    role: data.role || 'player', // player, coach, manager, fan
                    team_id: data.team_id || '',
                    players_list: data.players_list || [],
                    captain: data.captain || '',
                    documents: data.documents || [],
                    status: 'pending', // pending, approved, rejected
                    registered_at: new Date().toISOString()
                }
            );
            console.log('✅ Registration created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error registering player:', error);
            return null;
        }
    }

    /**
     * Get all registrations (admin only)
     */
    async getRegistrations() {
        try {
            const response = await this.db.listDocuments(
                APPWRITE_DATABASE_ID,
                this.collections.registrations
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching registrations:', error);
            return [];
        }
    }

    /**
     * ========== MATCHES ==========
     */

    /**
     * Create a new match
     */
    async createMatch(data) {
        try {
            const response = await this.db.createDocument(
                APPWRITE_DATABASE_ID,
                this.collections.matches,
                Appwrite.ID.unique(),
                {
                    tournament_id: data.tournament_id || '',
                    sport: data.sport, // cricket, kabaddi, volleyball
                    stage: data.stage || 'group',
                    start_time: data.start_time,
                    end_time: data.end_time || '',
                    venue_id: data.venue_id || '',
                    status: 'scheduled', // scheduled, ongoing, completed
                    team1_id: data.team1_id,
                    team2_id: data.team2_id,
                    umpires_officials: data.umpires_officials || {},
                    max_innings: data.max_innings || 2,
                    metadata: data.metadata || {}
                }
            );
            console.log('✅ Match created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating match:', error);
            return null;
        }
    }

    /**
     * Get matches by status or sport
     */
    async getMatches(filters = {}) {
        try {
            let queries = [];
            if (filters.status) {
                queries.push(Appwrite.Query.equal('status', filters.status));
            }
            if (filters.sport) {
                queries.push(Appwrite.Query.equal('sport', filters.sport));
            }
            if (filters.tournament_id) {
                queries.push(Appwrite.Query.equal('tournament_id', filters.tournament_id));
            }

            const response = await this.db.listDocuments(
                APPWRITE_DATABASE_ID,
                this.collections.matches,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching matches:', error);
            return [];
        }
    }

    /**
     * Get single match by ID
     */
    async getMatchById(matchId) {
        try {
            const response = await this.db.getDocument(
                APPWRITE_DATABASE_ID,
                this.collections.matches,
                matchId
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching match:', error);
            return null;
        }
    }

    /**
     * Update match status
     */
    async updateMatchStatus(matchId, status) {
        try {
            const response = await this.db.updateDocument(
                APPWRITE_DATABASE_ID,
                this.collections.matches,
                matchId,
                { status }
            );
            return response;
        } catch (error) {
            console.error('❌ Error updating match status:', error);
            return null;
        }
    }

    /**
     * ========== LIVE SCORES ==========
     */

    /**
     * Create or initialize live score for a match
     */
    async initializeLiveScore(matchId, sport, data) {
        try {
            // Check if live score already exists
            let existing = null;
            try {
                existing = await this.db.getDocument(
                    APPWRITE_DATABASE_ID,
                    this.collections.live_scores,
                    matchId
                );
            } catch (e) {
                // Document doesn't exist yet
            }

            if (existing) {
                console.log('Live score already exists for match:', matchId);
                return existing;
            }

            // Initialize based on sport
            let scoreData = {
                sport,
                status: 'live',
                updated_at: new Date().toISOString()
            };

            if (sport === 'cricket') {
                scoreData = {
                    ...scoreData,
                    innings: [],
                    batting_team_id: data.batting_team_id || '',
                    bowling_team_id: data.bowling_team_id || '',
                    current_batsmen: [],
                    current_bowler: null,
                    recent_overs: [],
                    total_runs: 0,
                    required_runs: 0,
                    target: data.target || 0,
                    partnership: 0
                };
            } else if (sport === 'kabaddi') {
                scoreData = {
                    ...scoreData,
                    periods: [],
                    team_scores: { team1: 0, team2: 0 },
                    player_points: [],
                    super_tackles: 0,
                    bonus_points: 0
                };
            } else if (sport === 'volleyball') {
                scoreData = {
                    ...scoreData,
                    sets: [],
                    current_set: 1,
                    timeouts: { team1: 0, team2: 0 }
                };
            }

            const response = await this.db.createDocument(
                APPWRITE_DATABASE_ID,
                this.collections.live_scores,
                matchId,
                scoreData
            );
            console.log('✅ Live score initialized:', response);
            return response;
        } catch (error) {
            console.error('❌ Error initializing live score:', error);
            return null;
        }
    }

    /**
     * Update live score
     */
    async updateLiveScore(matchId, updates) {
        try {
            updates.updated_at = new Date().toISOString();
            const response = await this.db.updateDocument(
                APPWRITE_DATABASE_ID,
                this.collections.live_scores,
                matchId,
                updates
            );
            console.log('✅ Live score updated');
            return response;
        } catch (error) {
            console.error('❌ Error updating live score:', error);
            return null;
        }
    }

    /**
     * Get live score for a match
     */
    async getLiveScore(matchId) {
        try {
            const response = await this.db.getDocument(
                APPWRITE_DATABASE_ID,
                this.collections.live_scores,
                matchId
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching live score:', error);
            return null;
        }
    }

    /**
     * ========== CRICKET SPECIFIC ==========
     */

    /**
     * Update cricket score
     */
    async updateCricketScore(matchId, scoreUpdate) {
        try {
            const response = await this.db.updateDocument(
                APPWRITE_DATABASE_ID,
                this.collections.live_scores,
                matchId,
                {
                    total_runs: scoreUpdate.total_runs || 0,
                    current_batsmen: scoreUpdate.current_batsmen || [],
                    current_bowler: scoreUpdate.current_bowler || null,
                    recent_overs: scoreUpdate.recent_overs || [],
                    innings: scoreUpdate.innings || [],
                    updated_at: new Date().toISOString()
                }
            );
            return response;
        } catch (error) {
            console.error('❌ Error updating cricket score:', error);
            return null;
        }
    }

    /**
     * ========== KABADDI SPECIFIC ==========
     */

    /**
     * Update kabaddi score
     */
    async updateKabaddiScore(matchId, scoreUpdate) {
        try {
            const response = await this.db.updateDocument(
                APPWRITE_DATABASE_ID,
                this.collections.live_scores,
                matchId,
                {
                    team_scores: scoreUpdate.team_scores || { team1: 0, team2: 0 },
                    player_points: scoreUpdate.player_points || [],
                    periods: scoreUpdate.periods || [],
                    super_tackles: scoreUpdate.super_tackles || 0,
                    updated_at: new Date().toISOString()
                }
            );
            return response;
        } catch (error) {
            console.error('❌ Error updating kabaddi score:', error);
            return null;
        }
    }

    /**
     * ========== VOLLEYBALL SPECIFIC ==========
     */

    /**
     * Update volleyball score
     */
    async updateVolleyballScore(matchId, scoreUpdate) {
        try {
            const response = await this.db.updateDocument(
                APPWRITE_DATABASE_ID,
                this.collections.live_scores,
                matchId,
                {
                    sets: scoreUpdate.sets || [],
                    current_set: scoreUpdate.current_set || 1,
                    timeouts: scoreUpdate.timeouts || { team1: 0, team2: 0 },
                    updated_at: new Date().toISOString()
                }
            );
            return response;
        } catch (error) {
            console.error('❌ Error updating volleyball score:', error);
            return null;
        }
    }

    /**
     * ========== ACHIEVEMENTS ==========
     */

    /**
     * Award an achievement
     */
    async createAchievement(data) {
        try {
            const response = await this.db.createDocument(
                APPWRITE_DATABASE_ID,
                this.collections.achievements,
                Appwrite.ID.unique(),
                {
                    title: data.title,
                    description: data.description || '',
                    category: data.category || 'match', // match, tournament, season
                    player_id: data.player_id || '',
                    team_id: data.team_id || '',
                    match_id: data.match_id || '',
                    date_awarded: new Date().toISOString(),
                    points: data.points || 0,
                    badge_url: data.badge_url || ''
                }
            );
            console.log('✅ Achievement created:', response);
            return response;
        } catch (error) {
            console.error('❌ Error creating achievement:', error);
            return null;
        }
    }

    /**
     * Get achievements by player or sport
     */
    async getAchievements(filters = {}) {
        try {
            let queries = [];
            if (filters.player_id) {
                queries.push(Appwrite.Query.equal('player_id', filters.player_id));
            }
            if (filters.team_id) {
                queries.push(Appwrite.Query.equal('team_id', filters.team_id));
            }

            const response = await this.db.listDocuments(
                APPWRITE_DATABASE_ID,
                this.collections.achievements,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching achievements:', error);
            return [];
        }
    }

    /**
     * ========== SCOREBOARDS ==========
     */

    /**
     * Create or update scoreboard
     */
    async updateScoreboard(matchId, data) {
        try {
            // Check if scoreboard exists
            let existing = null;
            try {
                existing = await this.db.getDocument(
                    APPWRITE_DATABASE_ID,
                    this.collections.scoreboards,
                    matchId
                );
            } catch (e) {
                // Document doesn't exist yet
            }

            if (existing) {
                const response = await this.db.updateDocument(
                    APPWRITE_DATABASE_ID,
                    this.collections.scoreboards,
                    matchId,
                    {
                        display_summary: data.display_summary || '',
                        team1_score: data.team1_score || 0,
                        team2_score: data.team2_score || 0,
                        period_breakdown: data.period_breakdown || {},
                        top_performers: data.top_performers || [],
                        last_updated: new Date().toISOString()
                    }
                );
                return response;
            } else {
                const response = await this.db.createDocument(
                    APPWRITE_DATABASE_ID,
                    this.collections.scoreboards,
                    matchId,
                    {
                        sport: data.sport || 'cricket',
                        display_summary: data.display_summary || '',
                        team1_score: data.team1_score || 0,
                        team2_score: data.team2_score || 0,
                        period_breakdown: data.period_breakdown || {},
                        top_performers: data.top_performers || [],
                        last_updated: new Date().toISOString()
                    }
                );
                return response;
            }
        } catch (error) {
            console.error('❌ Error updating scoreboard:', error);
            return null;
        }
    }

    /**
     * Get scoreboard for a match
     */
    async getScoreboard(matchId) {
        try {
            const response = await this.db.getDocument(
                APPWRITE_DATABASE_ID,
                this.collections.scoreboards,
                matchId
            );
            return response;
        } catch (error) {
            console.error('❌ Error fetching scoreboard:', error);
            return null;
        }
    }

    /**
     * ========== REAL-TIME SUBSCRIPTIONS ==========
     */

    /**
     * Subscribe to live score updates in real-time
     */
    subscribeToLiveScore(matchId, onUpdate, onError) {
        try {
            const realtime = new Appwrite.Realtime(this.client);
            const unsubscribe = realtime.subscribe(
                `databases.${APPWRITE_DATABASE_ID}.collections.${this.collections.live_scores}.documents.${matchId}`,
                (response) => {
                    if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                        onUpdate(response.payload);
                    }
                }
            );
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error subscribing to live score:', error);
            if (onError) onError(error);
            return null;
        }
    }

    /**
     * Subscribe to all matches in a collection
     */
    subscribeToMatches(onUpdate, onError) {
        try {
            const realtime = new Appwrite.Realtime(this.client);
            const unsubscribe = realtime.subscribe(
                `databases.${APPWRITE_DATABASE_ID}.collections.${this.collections.matches}.documents`,
                (response) => {
                    onUpdate(response.payload);
                }
            );
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error subscribing to matches:', error);
            if (onError) onError(error);
            return null;
        }
    }
}

// Export global instance
const appwriteService = new AppwriteService();

console.log('✅ Appwrite SDK loaded');
