import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  content: {
    padding: theme.spacing.xl,
  },
  
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
  },
  
  apiUsageContainer: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  
  apiUsageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  apiUsageLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  
  apiUsageValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.lg,
  },
  
  retryButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  
  backButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginLeft: theme.spacing.sm,
  },
}); 