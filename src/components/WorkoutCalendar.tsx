import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import stravaService from '../services/stravaService';
import hevyService from '../services/hevyService';

type WorkoutType = 'running' | 'lifting' | 'soccer';

interface WorkoutCalendarProps {
  onDayPress?: (date: string) => void;
  streak?: number;
  restDays?: number;
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ 
  onDayPress, 
  streak = 6, 
  restDays = 0 
}) => {
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  // Add a function to refresh data
  const refreshData = () => {
    loadWorkoutData();
  };

  // Expose refresh function to parent
  useEffect(() => {
    // This will trigger when the key changes (from parent)
    refreshData();
  }, []);

  const loadWorkoutData = async () => {
    setIsLoading(true);
    console.log('🔄 Loading workout data...');
    try {
      // Get current month's data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      console.log('📅 Date range:', startDate, 'to', endDate);
      
      const allMarkedDates: {[key: string]: any} = {};

      // Load Strava running data
      try {
        // Check if Strava is connected before making API calls
        const isStravaConnected = await stravaService.checkTokenScope().catch(() => false);
        if (isStravaConnected) {
          console.log('Loading Strava running data...');
          const runningDates = await stravaService.getRunningDates(startDate, endDate);
          console.log('Strava running dates found:', runningDates.length);
          runningDates.forEach(date => {
            allMarkedDates[date] = {
              selected: true,
              selectedColor: 'rgba(0, 122, 255, 0.3)', // Opaque blue for running
              selectedTextColor: '#FFFFFF',
              dotColor: '#007AFF',
              marked: true,
              dots: [{ color: '#007AFF', key: 'running' }],
            };
          });
        } else {
          console.log('Strava not connected or no OAuth tokens available, skipping running data');
        }
      } catch (error) {
        console.error('Error loading Strava data:', error);
        if (error instanceof Error && error.message?.includes('No OAuth tokens available')) {
          console.log('No OAuth tokens available for Strava, skipping running data');
        } else if (error instanceof Error && error.message?.includes('rate limit exceeded')) {
          console.log('Strava API rate limit exceeded, using cached data if available');
          // Could show a user-friendly message here
        }
      }

      // Load Hevy gym data
      try {
        const isHevyConfigured = await hevyService.isConfigured();
        if (isHevyConfigured) {
          const gymDates = await hevyService.getWorkoutDates(startDate, endDate);
          console.log('Hevy gym dates found:', gymDates.length);
          gymDates.forEach(date => {
            if (allMarkedDates[date]) {
              // If date already has running data, create a special marking for both activities
              console.log('Found day with both activities:', date);
              allMarkedDates[date] = {
                selected: true,
                selectedColor: 'rgba(255, 107, 53, 0.4)', // Slightly more opaque orange background
                selectedTextColor: '#FFFFFF',
                dotColor: '#FF6B35',
                marked: true,
                dots: [
                  { color: '#007AFF', key: 'running' }, // Blue dot for running
                  { color: '#FF6B35', key: 'gym' }      // Orange dot for gym
                ],
              };
            } else {
              // New date with only gym data
              allMarkedDates[date] = {
                selected: true,
                selectedColor: 'rgba(255, 107, 53, 0.3)', // Opaque orange for gym
                selectedTextColor: '#FFFFFF',
                dotColor: '#FF6B35',
                marked: true,
                dots: [{ color: '#FF6B35', key: 'gym' }],
              };
            }
          });
        }
      } catch (error) {
        console.error('Error loading Hevy data:', error);
      }

      // If no data from either service, show example data
      if (Object.keys(allMarkedDates).length === 0) {
        console.log('📊 No workout data found, showing example data');
        setMarkedDates({
          '2024-04-02': { selected: true, selectedColor: '#007AFF' },
          '2024-04-03': { selected: true, selectedColor: '#007AFF' },
          '2024-04-10': { selected: true, selectedColor: '#007AFF' },
          '2024-04-11': { selected: true, selectedColor: '#007AFF' },
          '2024-04-26': { selected: true, selectedColor: '#007AFF' },
        });
      } else {
        console.log('📊 Setting marked dates:', Object.keys(allMarkedDates).length, 'dates');
        setMarkedDates(allMarkedDates);
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
      // Fallback to example data on error
      setMarkedDates({
        '2024-04-02': { selected: true, selectedColor: '#007AFF' },
        '2024-04-03': { selected: true, selectedColor: '#007AFF' },
        '2024-04-10': { selected: true, selectedColor: '#007AFF' },
        '2024-04-11': { selected: true, selectedColor: '#007AFF' },
        '2024-04-26': { selected: true, selectedColor: '#007AFF' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = async (month: any) => {
    try {
      const startOfMonth = new Date(month.year, month.month - 1, 1);
      const endOfMonth = new Date(month.year, month.month, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      const allMarkedDates: {[key: string]: any} = {};

      // Load Strava running data for the month
      try {
        // Check if Strava is connected before making API calls
        const isStravaConnected = await stravaService.checkTokenScope().catch(() => false);
        if (isStravaConnected) {
          console.log('Loading Strava running data for month:', month.month, month.year);
          const runningDates = await stravaService.getRunningDates(startDate, endDate);
          console.log('Strava running dates found for month:', runningDates.length);
          runningDates.forEach(date => {
            allMarkedDates[date] = {
              selected: true,
              selectedColor: 'rgba(0, 122, 255, 0.3)', // Opaque blue for running
              selectedTextColor: '#FFFFFF',
              dotColor: '#007AFF',
              marked: true,
              dots: [{ color: '#007AFF', key: 'running' }],
            };
          });
        } else {
          console.log('Strava not connected or no OAuth tokens available, skipping running data for month');
        }
      } catch (error) {
        console.error('Error loading Strava data for month:', error);
        if (error instanceof Error && error.message?.includes('No OAuth tokens available')) {
          console.log('No OAuth tokens available for Strava, skipping running data for month');
        } else if (error instanceof Error && error.message?.includes('rate limit exceeded')) {
          console.log('Strava API rate limit exceeded, using cached data if available for month');
          // Could show a user-friendly message here
        }
      }

      // Load Hevy gym data for the month
      try {
        const isHevyConfigured = await hevyService.isConfigured();
        if (isHevyConfigured) {
          const gymDates = await hevyService.getWorkoutDates(startDate, endDate);
          gymDates.forEach(date => {
            if (allMarkedDates[date]) {
              // If date already has running data, create a special marking for both activities
              console.log('Found day with both activities:', date);
              allMarkedDates[date] = {
                selected: true,
                selectedColor: 'rgba(255, 107, 53, 0.4)', // Slightly more opaque orange background
                selectedTextColor: '#FFFFFF',
                dotColor: '#FF6B35',
                marked: true,
                dots: [
                  { color: '#007AFF', key: 'running' }, // Blue dot for running
                  { color: '#FF6B35', key: 'gym' }      // Orange dot for gym
                ],
              };
            } else {
              // New date with only gym data
              allMarkedDates[date] = {
                selected: true,
                selectedColor: 'rgba(255, 107, 53, 0.3)', // Opaque orange for gym
                selectedTextColor: '#FFFFFF',
                dotColor: '#FF6B35',
                marked: true,
                dots: [{ color: '#FF6B35', key: 'gym' }],
              };
            }
          });
        }
      } catch (error) {
        console.error('Error loading Hevy data for month:', error);
      }

      setMarkedDates(allMarkedDates);
    } catch (error) {
      console.error('Error loading month data:', error);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout data...</Text>
        </View>
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="flame" size={24} color="#FF9F0A" />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{streak} weeks</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="moon" size={24} color="#007AFF" />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{restDays} days</Text>
            <Text style={styles.statLabel}>Rest</Text>
          </View>
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Running (Strava)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
          <Text style={styles.legendText}>Gym (Hevy)</Text>
        </View>
      </View>

      <Calendar
        onDayPress={(day) => onDayPress?.(day.dateString)}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          backgroundColor: '#000000',
          calendarBackground: '#1C1C1E',
          textSectionTitleColor: '#FFFFFF',
          selectedDayBackgroundColor: 'rgba(0, 122, 255, 0.3)', // Default to blue
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#007AFF',
          dayTextColor: '#FFFFFF',
          textDisabledColor: '#4D4D4D',
          dotColor: '#007AFF',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#FFFFFF',
          monthTextColor: '#FFFFFF',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#2C2C2E',
    marginBottom: 10,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 150,
  },
  statTextContainer: {
    marginLeft: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2C2C2E',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default WorkoutCalendar; 