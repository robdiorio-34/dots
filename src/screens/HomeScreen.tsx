import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSelector, useDispatch } from 'react-redux';
import { Text, FAB } from 'react-native-paper';
import { RootState } from '../store';
import { WorkoutType } from '../store/workoutsSlice';

interface MarkedDate {
  dots: Array<{ color: string }>;
}

const HomeScreen = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const workouts = useSelector((state: RootState) => state.workouts.workouts);
  const streak = useSelector((state: RootState) => state.workouts.streak);
  const restDays = useSelector((state: RootState) => state.workouts.restDays);

  React.useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // Transform workouts into calendar marked dates
  const markedDates = workouts.reduce<Record<string, MarkedDate>>((acc, workout) => {
    const existingDate = acc[workout.date] || { dots: [] };
    const dotColor = 
      workout.type === 'running' ? '#ff0000' :
      workout.type === 'lifting' ? '#00ff00' :
      '#0000ff'; // soccer

    return {
      ...acc,
      [workout.date]: {
        ...existingDate,
        dots: [...existingDate.dots, { color: dotColor }],
      },
    };
  }, {});

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading your fitness data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text variant="titleLarge">{streak}</Text>
          <Text>Week Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text variant="titleLarge">{restDays}</Text>
          <Text>Rest Days</Text>
        </View>
      </View>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
        }}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // TODO: Add workout logging modal
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 