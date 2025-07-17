import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

const HEVY_API_BASE_URL = 'https://api.hevyapp.com';
const CACHE_KEY = 'hevy_workouts_cache';
const CACHE_EXPIRY_KEY = 'hevy_workouts_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface HevyWorkout {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  updated_at: string;
  created_at: string;
  exercises: HevyExercise[];
}

interface HevyExercise {
  index: number;
  title: string;
  notes?: string;
  exercise_template_id: string;
  supersets_id: number;
  sets: HevySet[];
}

interface HevySet {
  index: number;
  type: string;
  weight_kg: number;
  reps: number;
  distance_meters?: number;
  duration_seconds?: number;
  rpe?: number;
  custom_metric?: number;
}

interface HevyWorkoutsResponse {
  page: number;
  page_count: number;
  workouts: HevyWorkout[];
}

class HevyService {
  private apiKey: string = API_CONFIG.HEVY.API_KEY;
  private cachedWorkouts: HevyWorkout[] | null = null;
  private cacheExpiry: number | null = null;

  async isConfigured(): Promise<boolean> {
    return this.apiKey !== 'YOUR_HEVY_API_KEY' && this.apiKey.length > 0;
  }

  private async loadCache(): Promise<boolean> {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const expiryData = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (cachedData && expiryData) {
        const expiry = parseInt(expiryData);
        if (Date.now() < expiry) {
          this.cachedWorkouts = JSON.parse(cachedData);
          this.cacheExpiry = expiry;
          console.log('Loaded Hevy workouts from cache');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading Hevy cache:', error);
      return false;
    }
  }

  private async saveCache(workouts: HevyWorkout[]): Promise<void> {
    try {
      const expiry = Date.now() + CACHE_DURATION;
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(workouts));
      await AsyncStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
      this.cachedWorkouts = workouts;
      this.cacheExpiry = expiry;
      console.log('Saved Hevy workouts to cache');
    } catch (error) {
      console.error('Error saving Hevy cache:', error);
    }
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CACHE_KEY, CACHE_EXPIRY_KEY]);
      this.cachedWorkouts = null;
      this.cacheExpiry = null;
      console.log('Cleared Hevy cache');
    } catch (error) {
      console.error('Error clearing Hevy cache:', error);
    }
  }

  async getWorkouts(page: number = 1): Promise<HevyWorkoutsResponse> {
    if (!(await this.isConfigured())) {
      throw new Error('Hevy API key not configured');
    }

    try {
      console.log('Fetching Hevy workouts with API key:', this.apiKey.substring(0, 8) + '...');
      
      const response = await axios.get(`${HEVY_API_BASE_URL}/v1/workouts`, {
        headers: {
          'api-key': this.apiKey, // Use api-key header instead of Authorization
          'accept': 'application/json',
        },
        params: {
          page,
          pageSize: 10, // API limit is 10
        },
      });

      console.log('Hevy API response status:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching Hevy workouts:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  async getAllWorkouts(): Promise<HevyWorkout[]> {
    if (!(await this.isConfigured())) {
      throw new Error('Hevy API key not configured');
    }

    // Try to load from cache first
    const cacheLoaded = await this.loadCache();
    if (cacheLoaded && this.cachedWorkouts) {
      return this.cachedWorkouts;
    }

    try {
      console.log('Fetching all Hevy workouts from API...');
      let allWorkouts: HevyWorkout[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await this.getWorkouts(currentPage);
        allWorkouts = [...allWorkouts, ...response.workouts];
        
        hasMorePages = currentPage < response.page_count;
        currentPage++;
      }

      // Save to cache
      await this.saveCache(allWorkouts);
      return allWorkouts;
    } catch (error) {
      console.error('Error fetching all Hevy workouts:', error);
      throw error;
    }
  }

  async getWorkoutDates(startDate: string, endDate: string): Promise<string[]> {
    try {
      const allWorkouts = await this.getAllWorkouts();
      
      // Filter workouts within the date range
      const filteredWorkouts = allWorkouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return workoutDate >= start && workoutDate <= end;
      });
      
      // Extract unique dates from workouts
      const workoutDates = filteredWorkouts.map(workout => {
        const date = new Date(workout.start_time);
        return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      });

      // Remove duplicates and sort
      return [...new Set(workoutDates)].sort();
    } catch (error) {
      console.error('Error getting Hevy workout dates:', error);
      return [];
    }
  }

  // Method to manually refresh cache
  async refreshCache(): Promise<void> {
    await this.clearCache();
    await this.getAllWorkouts();
  }

  // Method to check if cache is valid
  isCacheValid(): boolean {
    return this.cachedWorkouts !== null && this.cacheExpiry !== null && Date.now() < this.cacheExpiry;
  }
}

export default new HevyService();
export type { HevyWorkout, HevyExercise, HevySet, HevyWorkoutsResponse }; 