import {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_ACCESS_TOKEN,
  STRAVA_REFRESH_TOKEN,
  HEVY_API_KEY,
} from '@env';

// Template file - copy this to api.ts and fill in your actual values
// This file should NOT contain real API keys

export const API_CONFIG = {
  // Get your Strava Client ID and Secret from: https://www.strava.com/settings/api
  STRAVA: {
    CLIENT_ID: STRAVA_CLIENT_ID,
    CLIENT_SECRET: STRAVA_CLIENT_SECRET,
    // Optional: Direct API access token (bypasses OAuth flow)
    // Get this from: https://www.strava.com/settings/api
    // Click "View athelte" and copy the access token from the URL
    ACCESS_TOKEN: STRAVA_ACCESS_TOKEN, // Optional - for direct API access
    REFRESH_TOKEN: STRAVA_REFRESH_TOKEN, // <-- set this!
  },
  
  // Get your Hevy API key from the Hevy app: Settings → API
  HEVY: {
    API_KEY: HEVY_API_KEY,
  },
};

// Helper function to check if API keys are configured
export const isConfigured = () => {
  return (
    API_CONFIG.STRAVA.CLIENT_ID &&
    API_CONFIG.STRAVA.CLIENT_SECRET &&
    API_CONFIG.HEVY.API_KEY
  );
};

// Helper function to check if direct Strava access is configured
export const hasStravaDirectAccess = () => {
  return !!API_CONFIG.STRAVA.ACCESS_TOKEN;
}; 