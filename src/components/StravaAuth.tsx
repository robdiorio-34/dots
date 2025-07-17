import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import stravaService from '../services/stravaService';
import { API_CONFIG } from '../config/api';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

const STRAVA_CLIENT_ID = API_CONFIG.STRAVA.CLIENT_ID;
const STRAVA_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'fitness-tracker', // This should match your app.json scheme
});

interface StravaAuthProps {
  onAuthSuccess?: () => void;
  onAuthFailure?: (error: string) => void;
}

const StravaAuth: React.FC<StravaAuthProps> = ({ onAuthSuccess, onAuthFailure }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(true);
  }, []);

  const handleStravaAuth = async () => {
    setIsLoading(true);
    
    try {
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&approval_prompt=force&scope=read,activity:read_all`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, STRAVA_REDIRECT_URI);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          await exchangeCodeForToken(code);
        } else {
          throw new Error('No authorization code received');
        }
      } else if (result.type === 'cancel') {
        throw new Error('Authentication cancelled');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Strava auth error:', error);
      onAuthFailure?.(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: API_CONFIG.STRAVA.CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      
      // Save tokens using the service
      await AsyncStorage.setItem('strava_access_token', data.access_token);
      await AsyncStorage.setItem('strava_refresh_token', data.refresh_token);
      await AsyncStorage.setItem('strava_expires_at', data.expires_at.toString());

      setIsAuthenticated(true);
      onAuthSuccess?.();
      
      Alert.alert('Success', 'Successfully connected to Strava!');
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    Alert.alert('Success', 'Disconnected from Strava');
  };

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.connectedContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.connectedText}>Connected to Strava</Text>
        </View>
        <TouchableOpacity style={styles.disconnectButton} onPress={handleLogout}>
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.connectButton, isLoading && styles.disabledButton]} 
        onPress={handleStravaAuth}
        disabled={isLoading}
      >
        <Ionicons name="fitness" size={24} color="#FFFFFF" />
        <Text style={styles.connectButtonText}>
          {isLoading ? 'Connecting...' : 'Connect to Strava'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.description}>
        Connect your Strava account to automatically import your running activities
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    marginVertical: 10,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FC4C02', // Strava orange
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  connectedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StravaAuth; 