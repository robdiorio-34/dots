import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.md,
  },
  
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.strava,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  
  disabledButton: {
    opacity: 0.6,
  },
  
  connectButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginLeft: theme.spacing.sm,
  },
  
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  connectedText: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginLeft: theme.spacing.sm,
  },
  
  disconnectButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'center',
  },
  
  disconnectButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 