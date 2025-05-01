import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

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
  // Example workout data - this will be replaced with actual data later
  const markedDates = {
    '2024-04-02': { selected: true, selectedColor: '#007AFF' },
    '2024-04-03': { selected: true, selectedColor: '#007AFF' },
    '2024-04-10': { selected: true, selectedColor: '#007AFF' },
    '2024-04-11': { selected: true, selectedColor: '#007AFF' },
    '2024-04-26': { selected: true, selectedColor: '#007AFF' },
  };

  return (
    <View style={styles.container}>
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
      <Calendar
        onDayPress={(day) => onDayPress?.(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#000000',
          calendarBackground: '#1C1C1E',
          textSectionTitleColor: '#FFFFFF',
          selectedDayBackgroundColor: '#007AFF',
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
});

export default WorkoutCalendar; 