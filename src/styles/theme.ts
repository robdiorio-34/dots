// Theme configuration for the fitness tracker app
export const theme = {
  colors: {
    // Background colors
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textDisabled: '#4D4D4D',
    
    // Accent colors
    primary: '#007AFF',
    success: '#4CAF50',
    error: '#FF3B30',
    warning: '#FF9F0A',
    
    // Brand colors
    strava: '#FC4C02',
    
    // Overlay colors
    overlay: 'rgba(0,0,0,0.7)',
    selectedBlue: 'rgba(0, 122, 255, 0.3)',
    selectedOrange: 'rgba(255, 107, 53, 0.3)',
    selectedOrangeOpaque: 'rgba(255, 107, 53, 0.4)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
  },
  
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 28,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: 'bold',
    },
  },
  
  // Calendar theme (for react-native-calendars)
  calendar: {
    backgroundColor: '#000000',
    calendarBackground: '#1C1C1E',
    textSectionTitleColor: '#FFFFFF',
    selectedDayBackgroundColor: 'rgba(0, 122, 255, 0.3)',
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
  },
} as const;

export type Theme = typeof theme; 