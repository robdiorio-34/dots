import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import stravaService from '../../services/stravaService';
import { styles } from './styles';
import { theme } from '../../styles/theme';

type RootStackParamList = {
  Test: undefined;
  Home: undefined;
  Analytics: undefined;
};

type AnalyticsScreenProps = NativeStackScreenProps<RootStackParamList, 'Analytics'>;

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigation }) => {
  const [apiUsage, setApiUsage] = useState<{
    usage: number;
    limit: number;
    lastRateLimitTime: number | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkApiUsage();
  }, []);

  const checkApiUsage = async () => {
    setIsLoading(true);
    try {
      const usage = await stravaService.checkApiUsage();
      setApiUsage(usage);
    } catch (error) {
      console.error('Error checking API usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastRateLimitTime = (lastRateLimitTime: number | null) => {
    if (!lastRateLimitTime) {
      return 'No rate limits hit';
    }
    
    try {
      const rateLimitDate = new Date(lastRateLimitTime);
      const now = new Date();
      const timeDiff = now.getTime() - rateLimitDate.getTime();
      const minutesSince = Math.floor(timeDiff / (1000 * 60));
      
      if (minutesSince < 15) {
        const remainingMinutes = 15 - minutesSince;
        return `${rateLimitDate.toLocaleString()} (${remainingMinutes} min until reset)`;
      } else {
        return `${rateLimitDate.toLocaleString()} (Reset complete)`;
      }
    } catch (error) {
      console.error('Error formatting rate limit time:', error);
      return 'Unknown';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Analytics</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Usage</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading API usage...</Text>
            </View>
          ) : apiUsage ? (
            <View style={styles.apiUsageContainer}>
              <View style={styles.apiUsageItem}>
                <Ionicons name="analytics" size={20} color={theme.colors.primary} />
                <Text style={styles.apiUsageLabel}>API Calls:</Text>
                <Text style={styles.apiUsageValue}>
                  {apiUsage.usage}/{apiUsage.limit}
                </Text>
              </View>
              
              <View style={styles.apiUsageItem}>
                <Ionicons name="time" size={20} color={theme.colors.warning} />
                <Text style={styles.apiUsageLabel}>Last Rate Limit:</Text>
                <Text style={styles.apiUsageValue}>
                  {formatLastRateLimitTime(apiUsage.lastRateLimitTime)}
                </Text>
              </View>
              
              <View style={styles.apiUsageItem}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={styles.apiUsageLabel}>Remaining:</Text>
                <Text style={styles.apiUsageValue}>
                  {apiUsage.limit - apiUsage.usage} calls
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Unable to load API usage data</Text>
              <Button 
                mode="outlined"
                onPress={checkApiUsage}
                style={styles.retryButton}
                textColor={theme.colors.primary}
                buttonColor="transparent"
              >
                Retry
              </Button>
            </View>
          )}
        </View>
        
        <Button 
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          buttonColor={theme.colors.primary}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          <Text style={styles.backButtonText}>Back to Calendar</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen; 