import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { Text, FAB, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import WorkoutCalendar from '../components/WorkoutCalendar';
import StravaAuth from '../components/StravaAuth';
import stravaService from '../services/stravaService';
import hevyService from '../services/hevyService';
import { API_CONFIG } from '../config/api';

const HomeScreen = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [hevyConnected, setHevyConnected] = useState(false);
  const [stravaMethod, setStravaMethod] = useState<'direct' | 'oauth' | 'none'>('none');
  const [calendarKey, setCalendarKey] = useState(0); // Force calendar refresh
  const workouts = useSelector((state: RootState) => state.workouts.workouts);
  const streak = useSelector((state: RootState) => state.workouts.streak);
  const restDays = useSelector((state: RootState) => state.workouts.restDays);

  React.useEffect(() => {
    checkConnections();
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const checkConnections = async () => {
    try {
      // Check if API keys are configured
      const stravaConfigured = API_CONFIG.STRAVA.CLIENT_ID !== 'YOUR_STRAVA_CLIENT_ID';
      const hevyConfigured = API_CONFIG.HEVY.API_KEY !== 'YOUR_HEVY_API_KEY';
      
      setHevyConnected(hevyConfigured);
      
      // Check Strava connection method - only use OAuth, not hardcoded tokens
      if (stravaConfigured) {
        setStravaMethod('oauth');
        // Check if we have stored OAuth tokens with correct scope
        try {
          const hasStoredTokens = await stravaService.checkTokenScope();
          setStravaConnected(hasStoredTokens);
          console.log('Strava OAuth connection status:', hasStoredTokens);
        } catch (error) {
          console.log('No valid Strava OAuth tokens found');
          setStravaConnected(false);
        }
      } else {
        setStravaMethod('none');
        setStravaConnected(false);
      }
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  const handleStravaAuthSuccess = async () => {
    setStravaConnected(true);
    setStravaMethod('oauth');
    // Force refresh Strava cache and reload calendar data
    try {
      await stravaService.forceRefresh();
      console.log('Strava cache refreshed after authentication');
      
      // Fetch comprehensive cache for better performance
      await stravaService.fetchComprehensiveCache();
      console.log('Comprehensive Strava cache fetched');
    } catch (error) {
      console.error('Error refreshing Strava cache:', error);
    }
    setCalendarKey(prevKey => prevKey + 1);
  };

  const handleStravaAuthFailure = (error: string) => {
    console.error('Strava authentication failed:', error);
    setStravaConnected(false);
    setStravaMethod('oauth');
  };

  const handleDayPress = (date: string) => {
    console.log('Day pressed:', date);
    // TODO: Show workout details for this date
  };

  const getStravaStatusText = () => {
    if (stravaMethod === 'direct') {
      return 'Strava: Direct Access';
    } else if (stravaMethod === 'oauth') {
      return `Strava: ${stravaConnected ? 'OAuth Connected' : 'OAuth Not Connected'}`;
    } else {
      return 'Strava: Not Configured';
    }
  };

  const getStravaStatusColor = () => {
    if (stravaMethod === 'direct' || (stravaMethod === 'oauth' && stravaConnected)) {
      return '#4CAF50';
    } else {
      return '#FF3B30';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: '#FFFFFF' }}>Loading your fitness data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fitness Tracker</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={stravaConnected ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={getStravaStatusColor()} 
            />
            <Text style={[styles.statusText, { color: getStravaStatusColor() }]}>
              {getStravaStatusText()}
            </Text>
          </View>
          
          {/* Always show StravaAuth component for testing */}
          {stravaMethod === 'oauth' && (
            <StravaAuth 
              onAuthSuccess={handleStravaAuthSuccess}
              onAuthFailure={handleStravaAuthFailure}
            />
          )}
          
          {/* Show disconnect option when connected via OAuth */}
          {stravaMethod === 'oauth' && stravaConnected && (
            <View style={styles.disconnectContainer}>
              <Text style={styles.disconnectText}>
                Connected via OAuth. Tap to disconnect and re-authenticate.
              </Text>
              <Text 
                style={styles.disconnectButton}
                onPress={async () => {
                  await stravaService.clearAllTokens();
                  setStravaConnected(false);
                }}
              >
                Disconnect & Re-authenticate
              </Text>
              
            </View>
          )}
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={hevyConnected ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={hevyConnected ? "#4CAF50" : "#FF3B30"} 
            />
            <Text style={[styles.statusText, { color: hevyConnected ? "#4CAF50" : "#FF3B30" }]}>
              Hevy: {hevyConnected ? "Connected" : "Not Connected"}
            </Text>
          </View>
          
          {(!stravaConnected || !hevyConnected) && (
            <Text style={styles.configNote}>
              {!stravaConnected && stravaMethod === 'none' ? 
                'Configure Strava API keys in src/config/api.ts' :
                !hevyConnected ? 
                'Configure Hevy API key in src/config/api.ts' :
                'Some services need configuration'
              }
            </Text>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Your Calendar</Text>
        
        <WorkoutCalendar 
          key={calendarKey} // Add key to force refresh
          onDayPress={handleDayPress}
          streak={streak}
          restDays={restDays}
        />

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => {
            // TODO: Add workout logging modal
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  statusContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  configNote: {
    color: '#8E8E93',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
  disconnectContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  disconnectButton: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  cacheStatusContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
  },
  cacheStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  apiUsageContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
  },
  apiUsageText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default HomeScreen; 