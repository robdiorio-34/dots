import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import StravaAuth from './src/components/StravaAuth/StravaAuth';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen/AnalyticsScreen';
import { appStyles } from './src/styles/app';
import { theme } from './src/styles/theme';

type RootStackParamList = {
  Test: undefined;
  Home: undefined;
  Analytics: undefined;
};

type TestScreenProps = NativeStackScreenProps<RootStackParamList, 'Test'>;

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
    <View style={appStyles.container}>
      <Text style={appStyles.text}>Test Screen working</Text>
      <TouchableOpacity 
        style={appStyles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={appStyles.buttonText}>Go to Home Screen</Text>
      </TouchableOpacity>
      
      <View style={appStyles.stravaContainer}>
        <StravaAuth 
          onAuthSuccess={handleStravaAuthSuccess}
          onAuthFailure={handleStravaAuthFailure}
        />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
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