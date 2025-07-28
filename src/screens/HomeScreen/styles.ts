import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  
  workoutButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  
  workoutButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  
  workoutButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  
  analyticsButtonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  
  analyticsButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 120,
  },
  
  analyticsButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
}); 