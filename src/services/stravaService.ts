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
const STRAVA_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days instead of 24 hours

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
  private accessToken: string = ''; // Don't use hardcoded token
  private refreshToken: string = ''; // Don't use hardcoded token
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
    
    // Check if we have tokens from OAuth
    if (!this.accessToken || !this.refreshToken) {
      throw new Error('No OAuth tokens available. Please authenticate with Strava first.');
    }
    
    // Check if token is expired (expiresAt is in ms)
    const now = Date.now();
    if (this.cacheExpiry && now < this.cacheExpiry) {
      console.log('[Strava] Using valid access token from OAuth:', this.accessToken.substring(0, 10) + '...');
      return this.accessToken;
    }
    
    try {
      console.log('[Strava] Refreshing access token using OAuth refresh_token...');
      const response = await axios.post('https://www.strava.com/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      });
      const { access_token, refresh_token, expires_at } = response.data;
      await this.saveTokensToStorage(access_token, refresh_token, expires_at);
      console.log('[Strava] Received new access token from OAuth:', access_token.substring(0, 10) + '...');
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

    // Fetch activities from the last 6 months to get a good cache
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const after = Math.floor(sixMonthsAgo.getTime() / 1000);
    const before = Math.floor(new Date().getTime() / 1000);

    console.log('[Strava] Fetching activities from last 6 months (after:', new Date(after * 1000).toISOString(), ')');

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
        per_page: 200, // Increased to get more activities
      },
    };
    console.log('[Strava] Request config:', JSON.stringify(requestConfig, null, 2));

    try {
      console.log('[Strava] Fetching activities from API...');
      const response = await axios(requestConfig);
      console.log('[Strava] API response status:', response.status, '| Activities fetched:', response.data.length);
      
      // Save all activities to cache
      await this.saveCache(response.data);
      
      // Filter for running activities in the requested date range
      const activities = response.data.filter((activity: StravaActivity) => {
        const date = new Date(activity.start_date_local);
        const isInRange = date >= new Date(startDate) && date <= new Date(endDate);
        const isRunning = activity.type.toLowerCase() === 'run';
        return isInRange && isRunning;
      });
      
      console.log('[Strava] Filtered to', activities.length, 'running activities in date range');
      return activities;
    } catch (error: any) {
      // Check for scope-related errors
      if (error.response?.status === 403 && error.response?.data?.message?.includes('activity:read_permission')) {
        console.error('[Strava] Missing activity:read_all scope. Please re-authenticate with correct permissions.');
        throw new Error('Missing activity permissions. Please reconnect to Strava with the correct permissions.');
      }
      
      // If we get a 401, clear tokens and retry once
      if (error.response && error.response.status === 401) {
        await AsyncStorage.multiRemove(['strava_access_token', 'strava_expires_at']);
        try {
          const retryToken = await this.getValidAccessToken();
          requestConfig.headers['Authorization'] = `Bearer ${retryToken}`;
          console.log('[Strava] Retrying activities fetch after token refresh...');
          const retryResponse = await axios(requestConfig);
          console.log('[Strava] API response status (after refresh):', retryResponse.status, '| Activities fetched:', retryResponse.data.length);
          
          // Save all activities to cache
          await this.saveCache(retryResponse.data);
          
          // Filter for running activities in the requested date range
          const activities = retryResponse.data.filter((activity: StravaActivity) => {
            const date = new Date(activity.start_date_local);
            const isInRange = date >= new Date(startDate) && date <= new Date(endDate);
            const isRunning = activity.type.toLowerCase() === 'run';
            return isInRange && isRunning;
          });
          
          console.log('[Strava] Filtered to', activities.length, 'running activities in date range (after refresh)');
          return activities;
        } catch (retryError: any) {
          if (retryError.response?.status === 403 && retryError.response?.data?.message?.includes('activity:read_permission')) {
            console.error('[Strava] Still missing activity:read_all scope after token refresh.');
            throw new Error('Missing activity permissions. Please reconnect to Strava with the correct permissions.');
          }
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

  // Force refresh data (clear cache and reload)
  async forceRefresh(): Promise<void> {
    console.log('[Strava] Force refreshing data...');
    await this.clearCache();
    this.cachedActivities = null;
    this.cacheExpiry = null;
  }

  // Fetch comprehensive cache of activities (last year)
  async fetchComprehensiveCache(): Promise<void> {
    console.log('[Strava] Fetching comprehensive cache (last year)...');
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const after = Math.floor(oneYearAgo.getTime() / 1000);
    const before = Math.floor(new Date().getTime() / 1000);

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
        per_page: 200,
      },
    };

    try {
      const response = await axios(requestConfig);
      console.log('[Strava] Comprehensive cache: fetched', response.data.length, 'activities');
      await this.saveCache(response.data);
    } catch (error) {
      console.error('[Strava] Error fetching comprehensive cache:', error);
      throw error;
    }
  }

  // Check if cache is valid
  isCacheValid(): boolean {
    return this.cachedActivities !== null && this.cacheExpiry !== null && Date.now() < this.cacheExpiry;
  }

  // Clear all stored tokens and force re-authentication
  async clearAllTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'strava_access_token', 
        'strava_refresh_token', 
        'strava_expires_at',
        STRAVA_CACHE_KEY,
        STRAVA_CACHE_EXPIRY_KEY
      ]);
      this.accessToken = '';
      this.refreshToken = '';
      this.cachedActivities = null;
      this.cacheExpiry = null;
      console.log('[Strava] All tokens and cache cleared');
    } catch (error) {
      console.error('[Strava] Error clearing tokens:', error);
    }
  }

  // Check if current tokens have the required scope
  async checkTokenScope(): Promise<boolean> {
    try {
      const accessToken = await this.getValidAccessToken();
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities?per_page=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return true; // If we can access activities, scope is correct
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('activity:read_permission')) {
        console.log('[Strava] Token missing activity:read_all scope');
        return false;
      }
      throw error;
    }
  }
}

export default new StravaService();