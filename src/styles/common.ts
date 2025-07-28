import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  content: {
    padding: theme.spacing.xl,
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Cards and surfaces
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  
  cardSecondary: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  
  // Typography
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  
  bodyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  
  bodyTextSecondary: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  
  caption: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Buttons
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  
  buttonOutlined: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutlinedText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  
  // Status indicators
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  statusText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.sm,
  },
  
  // Loading states
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
  },
  
  // Error states
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.lg,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
}); 