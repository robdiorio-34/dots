import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WorkoutCalendar from './src/components/WorkoutCalendar';
import StravaAuth from './src/components/StravaAuth';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

type RootStackParamList = {
  Test: undefined;
  Home: undefined;
  Analytics: undefined;
};

type TestScreenProps = NativeStackScreenProps<RootStackParamList, 'Test'>;
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

function TestScreen({ navigation }: TestScreenProps) {
  const handleStravaAuthSuccess = () => {
    console.log('Strava authentication successful!');
    // You can add navigation or other actions here
  };

  const handleStravaAuthFailure = (error: string) => {
    console.error('Strava authentication failed:', error);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen working</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Go to Home Screen</Text>
      </TouchableOpacity>
      
      <View style={styles.stravaContainer}>
        <StravaAuth 
          onAuthSuccess={handleStravaAuthSuccess}
          onAuthFailure={handleStravaAuthFailure}
        />
      </View>
    </View>
  );
}

function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <WorkoutCalendar 
          onDayPress={handleDayPress}
          streak={6}
          restDays={0}
        />
        <View style={styles.workoutButtonsContainer}>
          <TouchableOpacity style={[styles.workoutButton, { backgroundColor: '#2C2C2E' }]}>
            <Text style={styles.workoutButtonText}>Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.workoutButton, { backgroundColor: '#2C2C2E' }]}>
            <Text style={styles.workoutButtonText}>Lift</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.workoutButton, { backgroundColor: '#2C2C2E' }]}>
            <Text style={styles.workoutButtonText}>Soccer</Text>
          </TouchableOpacity>
        </View>
        
        {/* Analytics Button */}
        <View style={styles.analyticsButtonContainer}>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Test" 
          component={TestScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Calendar',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{
            title: 'Analytics',
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#000000',
  },
  workoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  workoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#000000',
  },
  analyticsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  analyticsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stravaContainer: {
    marginTop: 10,
    width: '100%',
  },
}); 