import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

const STRAVA_ACCESS_TOKEN = API_CONFIG.STRAVA.ACCESS_TOKEN;
const STRAVA_REFRESH_TOKEN = API_CONFIG.STRAVA.REFRESH_TOKEN;
const STRAVA_CLIENT_ID = API_CONFIG.STRAVA.CLIENT_ID;
const STRAVA_CLIENT_SECRET = API_CONFIG.STRAVA.CLIENT_SECRET;

// Cache constants
const STRAVA_CACHE_KEY = 'strava_activities_cache';
const STRAVA_CACHE_EXPIRY_KEY = 'strava_activities_cache_expiry';
const STRAVA_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate?: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  upload_id?: number;
  external_id?: string;
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  flagged?: boolean;
  workout_type?: number;
  average_temp?: number;
  has_kudoed?: boolean;
}

class StravaService {
  private accessToken: string = STRAVA_ACCESS_TOKEN;
  private refreshToken: string = STRAVA_REFRESH_TOKEN;
  private cachedActivities: StravaActivity[] | null = null;
  private cacheExpiry: number | null = null;

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      console.log('[Strava] Refreshing access token...');
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      });
      const { access_token, refresh_token } = response.data;
      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      // Optionally update config or AsyncStorage here if you want persistence
      console.log('[Strava] Access token refreshed.');
      return true;
    } catch (error) {
      console.error('[Strava] Error refreshing access token:', error);
      return false;
    }
  }

  private async loadCache(): Promise<boolean> {
    try {
      const cachedData = await AsyncStorage.getItem(STRAVA_CACHE_KEY);
      const expiryData = await AsyncStorage.getItem(STRAVA_CACHE_EXPIRY_KEY);
      if (cachedData && expiryData) {
        const expiry = parseInt(expiryData);
        if (Date.now() < expiry) {
          this.cachedActivities = JSON.parse(cachedData);
          this.cacheExpiry = expiry;
          console.log('[Strava] Loaded activities from cache (valid until:', new Date(expiry).toISOString(), ')');
          return true;
        } else {
          console.log('[Strava] Cache expired');
        }
      } else {
        console.log('[Strava] No cache found');
      }
      return false;
    } catch (error) {
      console.error('[Strava] Error loading cache:', error);
      return false;
    }
  }

  private async saveCache(activities: StravaActivity[]): Promise<void> {
    try {
      const expiry = Date.now() + STRAVA_CACHE_DURATION;
      await AsyncStorage.setItem(STRAVA_CACHE_KEY, JSON.stringify(activities));
      await AsyncStorage.setItem(STRAVA_CACHE_EXPIRY_KEY, expiry.toString());
      this.cachedActivities = activities;
      this.cacheExpiry = expiry;
      console.log('[Strava] Saved activities to cache (expires at:', new Date(expiry).toISOString(), ')');
    } catch (error) {
      console.error('[Strava] Error saving cache:', error);
    }
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STRAVA_CACHE_KEY, STRAVA_CACHE_EXPIRY_KEY]);
      this.cachedActivities = null;
      this.cacheExpiry = null;
      console.log('[Strava] Cleared cache');
    } catch (error) {
      console.error('[Strava] Error clearing cache:', error);
    }
  }

  // Helper to load tokens from AsyncStorage
  private async loadTokensFromStorage() {
    const accessToken = await AsyncStorage.getItem('strava_access_token');
    const refreshToken = await AsyncStorage.getItem('strava_refresh_token');
    const expiresAt = await AsyncStorage.getItem('strava_expires_at');
    if (accessToken) this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
    if (expiresAt) this.cacheExpiry = parseInt(expiresAt) * 1000;
  }

  // Helper to save tokens to AsyncStorage
  private async saveTokensToStorage(accessToken: string, refreshToken: string, expiresAt: number) {
    await AsyncStorage.setItem('strava_access_token', accessToken);
    await AsyncStorage.setItem('strava_refresh_token', refreshToken);
    await AsyncStorage.setItem('strava_expires_at', expiresAt.toString());
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.cacheExpiry = expiresAt * 1000;
  }

  // Updated: Always load tokens from storage before using
  private async getValidAccessToken(): Promise<string> {
    await this.loadTokensFromStorage();
    // Check if token is expired (expiresAt is in ms)
    const now = Date.now();
    if (this.accessToken && this.cacheExpiry && now < this.cacheExpiry) {
      console.log('[Strava] Using valid access token from storage:', this.accessToken);
      return this.accessToken;
    }
    if (!this.refreshToken) {
      throw new Error('No refresh token available for Strava');
    }
    try {
      console.log('[Strava] Refreshing access token using refresh_token...');
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      });
      const { access_token, refresh_token, expires_at } = response.data;
      await this.saveTokensToStorage(access_token, refresh_token, expires_at);
      console.log('[Strava] Received new access token:', access_token);
      return access_token;
    } catch (error) {
      console.error('[Strava] Error refreshing access token:', error);
      throw error;
    }
  }

  async getRunningActivities(startDate: string, endDate: string): Promise<StravaActivity[]> {
    // Try to load from cache first
    const cacheLoaded = await this.loadCache();
    if (cacheLoaded && this.cachedActivities) {
      console.log('[Strava] Using cached activities');
      return this.cachedActivities.filter(activity => {
        const date = new Date(activity.start_date_local);
        return date >= new Date(startDate) && date <= new Date(endDate) && activity.type.toLowerCase() === 'run';
      });
    }

    // Convert to UNIX seconds (integer)
    const after = Math.floor(new Date(startDate).getTime() / 1000);
    const before = Math.floor(new Date(endDate).getTime() / 1000);

    // Use the latest access token from storage or refresh if needed
    const accessToken = await this.getValidAccessToken();
    const requestConfig = {
      url: 'https://www.strava.com/api/v3/athlete/activities',
      method: 'get',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        after,
        before,
        per_page: 50,
      },
    };
    console.log('[Strava] Request config:', JSON.stringify(requestConfig, null, 2));

    try {
      console.log('[Strava] Fetching activities from API...');
      const response = await axios(requestConfig);
      console.log('[Strava] API response status:', response.status, '| Activities fetched:', response.data.length);
      const activities = response.data.filter((activity: StravaActivity) => 
        activity.type.toLowerCase() === 'run'
      );
      await this.saveCache(response.data);
      return activities;
    } catch (error: any) {
      // If we get a 401, clear tokens and retry once
      if (error.response && error.response.status === 401) {
        await AsyncStorage.multiRemove(['strava_access_token', 'strava_expires_at']);
        try {
          const retryToken = await this.getValidAccessToken();
          requestConfig.headers['Authorization'] = `Bearer ${retryToken}`;
          console.log('[Strava] Retrying activities fetch after token refresh...');
          const retryResponse = await axios(requestConfig);
          console.log('[Strava] API response status (after refresh):', retryResponse.status, '| Activities fetched:', retryResponse.data.length);
          const activities = retryResponse.data.filter((activity: StravaActivity) => 
            activity.type.toLowerCase() === 'run'
          );
          await this.saveCache(retryResponse.data);
          return activities;
        } catch (retryError) {
          console.error('[Strava] Error fetching activities after refresh:', retryError);
          throw retryError;
        }
      }
      console.error('[Strava] Error fetching activities:', error);
      throw error;
    }
  }

  async getRunningDates(startDate: string, endDate: string): Promise<string[]> {
    try {
      const activities = await this.getRunningActivities(startDate, endDate);
      const runningDates = activities.map(activity => {
        const date = new Date(activity.start_date_local);
        return date.toISOString().split('T')[0];
      });
      return [...new Set(runningDates)].sort();
    } catch (error) {
      console.error('[Strava] Error getting running dates:', error);
      return [];
    }
  }

  // Manual cache refresh
  async refreshCache(): Promise<void> {
    await this.clearCache();
  }

  // Check if cache is valid
  isCacheValid(): boolean {
    return this.cachedActivities !== null && this.cacheExpiry !== null && Date.now() < this.cacheExpiry;
  }
}

export default new StravaService();