// ============================================================================
// API CONFIGURATION
// ============================================================================

// Legacy API (for backward compatibility if needed)
const API_BASE_URL = "http://localhost:8000";

// ============================================================================
// APPWRITE CONFIGURATION
// ============================================================================
// Your Appwrite credentials (do not share publicly)
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6987185a000b2140131c';
const APPWRITE_DATABASE_ID = '69871ab4003b1caf9cbd';
const APPWRITE_API_KEY = ''; // Optional - fill if you created an API key

// Collection IDs - these match your Appwrite database table names
const APPWRITE_COLLECTIONS = {
    cricket: 'cricket',
    tournaments: 'tournaments',
    teams: 'teams',
    players: 'players',
    matches: 'matches',
    live_scores: 'live_scores',
    scoreboards: 'scoreboards',
    registrations: 'registrations',
    events: 'score_events',
    achievements: 'achievements',
    venues: 'venues'
};

console.log("✅ API Config Loaded: ", {
    API_BASE_URL,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID: APPWRITE_PROJECT_ID.substring(0, 6) + '****',
    APPWRITE_DATABASE_ID: APPWRITE_DATABASE_ID.substring(0, 6) + '****'
});
