import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import stravaService from '../../services/stravaService';
import hevyService from '../../services/hevyService';
import { styles } from './styles';
import { theme } from '../../styles/theme';

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
              selectedColor: theme.colors.selectedBlue,
              selectedTextColor: theme.colors.text,
              dotColor: theme.colors.primary,
              marked: true,
              dots: [{ color: theme.colors.primary, key: 'running' }],
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
                selectedColor: theme.colors.selectedOrangeOpaque,
                selectedTextColor: theme.colors.text,
                dotColor: theme.colors.warning,
                marked: true,
                dots: [
                  { color: theme.colors.primary, key: 'running' }, // Blue dot for running
                  { color: theme.colors.warning, key: 'gym' }      // Orange dot for gym
                ],
              };
            } else {
              // New date with only gym data
              allMarkedDates[date] = {
                selected: true,
                selectedColor: theme.colors.selectedOrange,
                selectedTextColor: theme.colors.text,
                dotColor: theme.colors.warning,
                marked: true,
                dots: [{ color: theme.colors.warning, key: 'gym' }],
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
          '2024-04-02': { selected: true, selectedColor: theme.colors.primary },
          '2024-04-03': { selected: true, selectedColor: theme.colors.primary },
          '2024-04-10': { selected: true, selectedColor: theme.colors.primary },
          '2024-04-11': { selected: true, selectedColor: theme.colors.primary },
          '2024-04-26': { selected: true, selectedColor: theme.colors.primary },
        });
      } else {
        console.log('📊 Setting marked dates:', Object.keys(allMarkedDates).length, 'dates');
        setMarkedDates(allMarkedDates);
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
      // Fallback to example data on error
      setMarkedDates({
        '2024-04-02': { selected: true, selectedColor: theme.colors.primary },
        '2024-04-03': { selected: true, selectedColor: theme.colors.primary },
        '2024-04-10': { selected: true, selectedColor: theme.colors.primary },
        '2024-04-11': { selected: true, selectedColor: theme.colors.primary },
        '2024-04-26': { selected: true, selectedColor: theme.colors.primary },
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
              selectedColor: theme.colors.selectedBlue,
              selectedTextColor: theme.colors.text,
              dotColor: theme.colors.primary,
              marked: true,
              dots: [{ color: theme.colors.primary, key: 'running' }],
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
                selectedColor: theme.colors.selectedOrangeOpaque,
                selectedTextColor: theme.colors.text,
                dotColor: theme.colors.warning,
                marked: true,
                dots: [
                  { color: theme.colors.primary, key: 'running' }, // Blue dot for running
                  { color: theme.colors.warning, key: 'gym' }      // Orange dot for gym
                ],
              };
            } else {
              // New date with only gym data
              allMarkedDates[date] = {
                selected: true,
                selectedColor: theme.colors.selectedOrange,
                selectedTextColor: theme.colors.text,
                dotColor: theme.colors.warning,
                marked: true,
                dots: [{ color: theme.colors.warning, key: 'gym' }],
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
          <Ionicons name="flame" size={24} color={theme.colors.warning} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{streak} weeks</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="moon" size={24} color={theme.colors.primary} />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{restDays} days</Text>
            <Text style={styles.statLabel}>Rest</Text>
          </View>
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>Running (Strava)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={styles.legendText}>Gym (Hevy)</Text>
        </View>
      </View>

      <Calendar
        onDayPress={(day) => onDayPress?.(day.dateString)}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={theme.calendar}
      />
    </View>
  );
};

export default WorkoutCalendar; 