// ============================================================================
// API CONFIGURATION
// ============================================================================

// Legacy API (for backward compatibility if needed)
const API_BASE_URL = "http://localhost:8000";

// ============================================================================
// APPWRITE CONFIGURATION
// ============================================================================
// Values provided by you (do not share publicly)
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1'; // Your Appwrite endpoint
const APPWRITE_PROJECT_ID = '6987185a000b2140131c'; // Provided Project ID
const APPWRITE_DATABASE_ID = '69871ab4003b1caf9cbd'; // Provided Database (Dashboard) ID
const APPWRITE_API_KEY = ''; // Optional - fill if you created an API key

// Optional: Provide explicit collection IDs if you have them.
// Example: { matches: '69883f720037b783de6b', live_scores: '...'}
const APPWRITE_COLLECTIONS = {
    tournaments: '69883c9b000fa82767de', // provided tournaments id (useful if this is your collection id)
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

// If you want me to update specific collection IDs, supply a mapping for each key above.

console.log("✅ API Config Loaded: ", {
    API_BASE_URL,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID: APPWRITE_PROJECT_ID.substring(0, 6) + '****' // Masked for security
});
