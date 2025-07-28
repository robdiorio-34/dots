import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { styles } from './styles';
import { theme } from '../../styles/theme';
import { API_CONFIG } from '../../config/api';

interface StravaAuthProps {
  onAuthSuccess?: () => void;
  onAuthFailure?: (error: string) => void;
}

const StravaAuth: React.FC<StravaAuthProps> = ({ onAuthSuccess, onAuthFailure }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('strava_access_token');
      const refreshToken = await AsyncStorage.getItem('strava_refresh_token');
      setIsAuthenticated(!!(accessToken && refreshToken));
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    if (url.includes('code=')) {
      const code = url.split('code=')[1].split('&')[0];
      exchangeCodeForToken(code);
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription?.remove();
  }, []);

  const handleStravaAuth = async () => {
    setIsLoading(true);
    try {
      const clientId = API_CONFIG.STRAVA.CLIENT_ID;
      const redirectUri = 'exp://192.168.1.100:8081'; // Update this to your actual redirect URI
      const scope = 'activity:read_all';
      const responseType = 'code';
      
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success' && result.url) {
        const url = result.url;
        if (url.includes('code=')) {
          const code = url.split('code=')[1].split('&')[0];
          await exchangeCodeForToken(code);
        } else if (url.includes('error=')) {
          const error = url.split('error=')[1].split('&')[0];
          throw new Error(`Authorization failed: ${error}`);
        }
      } else if (result.type === 'cancel') {
        throw new Error('Authorization cancelled by user');
      } else {
        throw new Error('Authorization failed');
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
      const clientId = API_CONFIG.STRAVA.CLIENT_ID;
      const clientSecret = API_CONFIG.STRAVA.CLIENT_SECRET;
      const redirectUri = 'exp://192.168.1.100:8081'; // Update this to your actual redirect URI
      
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const data = await response.json();
      const { access_token, refresh_token, expires_at } = data;

      // Store tokens securely
      await AsyncStorage.setItem('strava_access_token', access_token);
      await AsyncStorage.setItem('strava_refresh_token', refresh_token);
      await AsyncStorage.setItem('strava_expires_at', expires_at.toString());

      console.log('Strava authentication successful!');
      setIsAuthenticated(true);
      onAuthSuccess?.();
    } catch (error) {
      console.error('Token exchange error:', error);
      onAuthFailure?.(error instanceof Error ? error.message : 'Token exchange failed');
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
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
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
        <Ionicons name="fitness" size={24} color={theme.colors.text} />
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

export default StravaAuth; 