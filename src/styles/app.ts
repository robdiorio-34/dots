import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const appStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  text: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xl,
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  
  stravaContainer: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
}); 