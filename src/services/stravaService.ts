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
const STRAVA_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

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
  private lastRateLimitTime: number | null = null; // Track when we last hit rate limit

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
    // First, check if we need to extend our cache for this date range
    await this.checkAndExtendCacheIfNeeded(startDate, endDate);
    
    // Now try to load from cache
    const cacheLoaded = await this.loadCache();
    if (cacheLoaded && this.cachedActivities) {
      console.log('🏃‍♂️ [Strava] ✅ USING CACHE - No API call needed for date range:', startDate, 'to', endDate);
      return this.cachedActivities.filter(activity => {
        const date = new Date(activity.start_date_local);
        return date >= new Date(startDate) && date <= new Date(endDate) && activity.type.toLowerCase() === 'run';
      });
    }

    // Fallback: return empty array if still no cache
    console.log('[Strava] No activities found in cache');
    return [];
  }

  async getRunningDates(startDate: string, endDate: string): Promise<string[]> {
    try {
      // First, check if we need to extend our cache for this date range
      await this.checkAndExtendCacheIfNeeded(startDate, endDate);
      
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

  // Fetch comprehensive cache of activities (last 6 months)
  async fetchComprehensiveCache(): Promise<void> {
    console.log('🏃‍♂️ [Strava] 🔄 MAKING API CALL - Fetching most recent 6 months of data...');
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const after = Math.floor(sixMonthsAgo.getTime() / 1000);
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
      console.log('[Strava] Initial cache: fetched', response.data.length, 'activities');
      await this.saveCache(response.data);
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error('[Strava] Rate limit exceeded during comprehensive cache fetch.');
        throw new Error('Strava API rate limit exceeded. Please wait 15 minutes before trying again.');
      }
      console.error('[Strava] Error fetching comprehensive cache:', error);
      throw error;
    }
  }

  // Check if we need to fetch more data for a specific date range
  async checkAndExtendCacheIfNeeded(startDate: string, endDate: string): Promise<void> {
    const cacheLoaded = await this.loadCache();
    if (!cacheLoaded || !this.cachedActivities) {
      console.log('[Strava] No cache available, fetching comprehensive data...');
      await this.fetchComprehensiveCache();
      return;
    }

    // Check if the requested date range is within our cached data
    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);
    
    // Find the earliest and latest dates in our cache
    const cachedDates = this.cachedActivities.map(activity => new Date(activity.start_date_local));
    const earliestCached = new Date(Math.min(...cachedDates.map(d => d.getTime())));
    const latestCached = new Date(Math.max(...cachedDates.map(d => d.getTime())));

    console.log('[Strava] Cache range:', earliestCached.toISOString(), 'to', latestCached.toISOString());
    console.log('[Strava] Requested range:', requestedStart.toISOString(), 'to', requestedEnd.toISOString());

    // If requested range is within cached range, we're good
    if (requestedStart >= earliestCached && requestedEnd <= latestCached) {
      console.log('[Strava] Requested range is within cached data, no API call needed');
      return;
    }

    // If we need more data, fetch 6 months from the earliest cached date
    console.log('[Strava] Requested range extends beyond cache, fetching 6 months from earliest cached date...');
    await this.extendCacheFromEarliestDate(earliestCached);
  }

  // Extend cache by fetching 6 months of data from the earliest cached date
  async extendCacheFromEarliestDate(earliestCached: Date): Promise<void> {
    console.log('🏃‍♂️ [Strava] 🔄 MAKING API CALL - Extending cache by 6 months from:', earliestCached.toISOString());
    
    // Calculate 6 months before the earliest cached date
    const sixMonthsBeforeEarliest = new Date(earliestCached);
    sixMonthsBeforeEarliest.setMonth(sixMonthsBeforeEarliest.getMonth() - 6);
    
    const after = Math.floor(sixMonthsBeforeEarliest.getTime() / 1000);
    const before = Math.floor(earliestCached.getTime() / 1000);

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
      console.log('[Strava] Extended cache: fetched', response.data.length, 'additional activities');
      
      // Merge new data with existing cache
      const existingActivities = this.cachedActivities || [];
      const allActivities = [...response.data, ...existingActivities];
      
      // Remove duplicates based on activity ID
      const uniqueActivities = allActivities.filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      );
      
      await this.saveCache(uniqueActivities);
      console.log('[Strava] Cache extended with', uniqueActivities.length, 'total activities');
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error('[Strava] Rate limit exceeded during cache extension.');
        throw new Error('Strava API rate limit exceeded. Please wait 15 minutes before trying again.');
      }
      console.error('[Strava] Error extending cache:', error);
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
      if (error.response?.status === 429) {
        console.error('[Strava] Rate limit exceeded during scope check.');
        this.lastRateLimitTime = Date.now();
        console.log(`[Strava] Rate limit hit at: ${new Date(this.lastRateLimitTime).toLocaleString()}`);
        throw new Error('Strava API rate limit exceeded. Please wait 15 minutes before trying again.');
      }
      if (error.response?.status === 403 && error.response?.data?.message?.includes('activity:read_permission')) {
        console.log('[Strava] Token missing activity:read_all scope');
        return false;
      }
      throw error;
    }
  }

  // Check current API usage and rate limits
  async checkApiUsage(): Promise<{ usage: number; limit: number; lastRateLimitTime: number | null } | null> {
    try {
      const accessToken = await this.getValidAccessToken();
      const response = await axios.get('https://www.strava.com/api/v3/athlete', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      // Strava includes rate limit info in response headers
      // Use read rate limit headers since we're making read requests
      const usageStr = response.headers['x-readratelimit-usage'] || '0';
      const limitStr = response.headers['x-readratelimit-limit'] || '1000';
      
      // Parse comma-separated values (take the first value)
      const usage = parseInt(usageStr.split(',')[0]) || 0;
      const limit = parseInt(limitStr.split(',')[0]) || 1000;
      
      console.log(`[Strava] API Usage: ${usage}/${limit} requests`);
      
      return { usage, limit, lastRateLimitTime: this.lastRateLimitTime };
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error('[Strava] Rate limit exceeded during usage check.');
        this.lastRateLimitTime = Date.now();
        console.log(`[Strava] Rate limit hit at: ${new Date(this.lastRateLimitTime).toLocaleString()}`);
        return null;
      }
      console.error('[Strava] Error checking API usage:', error);
      return null;
    }
  }

  // Get cache status information
  async getCacheStatus(): Promise<{
    hasCache: boolean;
    cacheSize: number;
    cacheRange: { earliest: string; latest: string } | null;
    cacheExpiry: string | null;
  }> {
    const cacheLoaded = await this.loadCache();
    if (!cacheLoaded || !this.cachedActivities) {
      return {
        hasCache: false,
        cacheSize: 0,
        cacheRange: null,
        cacheExpiry: null,
      };
    }

    const cachedDates = this.cachedActivities.map(activity => new Date(activity.start_date_local));
    const earliestCached = new Date(Math.min(...cachedDates.map(d => d.getTime())));
    const latestCached = new Date(Math.max(...cachedDates.map(d => d.getTime())));

    return {
      hasCache: true,
      cacheSize: this.cachedActivities.length,
      cacheRange: {
        earliest: earliestCached.toISOString(),
        latest: latestCached.toISOString(),
      },
      cacheExpiry: this.cacheExpiry ? new Date(this.cacheExpiry).toISOString() : null,
    };
  }
}

export default new StravaService();