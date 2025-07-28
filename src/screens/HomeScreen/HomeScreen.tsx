import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WorkoutCalendar from '../../components/WorkoutCalendar/WorkoutCalendar';
import { styles } from './styles';
import { theme } from '../../styles/theme';

type RootStackParamList = {
  Test: undefined;
  Home: undefined;
  Analytics: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
          <TouchableOpacity style={[styles.workoutButton, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={styles.workoutButtonText}>Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.workoutButton, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={styles.workoutButtonText}>Lift</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.workoutButton, { backgroundColor: theme.colors.surfaceSecondary }]}>
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
};

export default HomeScreen; 