import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WorkoutType = 'running' | 'lifting' | 'soccer';

interface Workout {
  date: string;
  type: WorkoutType;
}

interface WorkoutsState {
  workouts: Workout[];
  streak: number;
  restDays: number;
}

const initialState: WorkoutsState = {
  workouts: [],
  streak: 0,
  restDays: 0,
};

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    addWorkout: (state, action: PayloadAction<Workout>) => {
      state.workouts.push(action.payload);
      // Streak and rest days calculation will be added here
    },
    removeWorkout: (state, action: PayloadAction<{ date: string; type: WorkoutType }>) => {
      state.workouts = state.workouts.filter(
        workout => !(workout.date === action.payload.date && workout.type === action.payload.type)
      );
      // Recalculate streak and rest days
    },
    updateStats: (state) => {
      // Calculate streak and rest days
      // This will be implemented later
    },
  },
});

export const { addWorkout, removeWorkout, updateStats } = workoutsSlice.actions;
export default workoutsSlice.reducer; 