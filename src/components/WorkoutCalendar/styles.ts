import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceSecondary,
    marginBottom: theme.spacing.md,
  },
  
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    minWidth: 150,
  },
  
  statTextContainer: {
    marginLeft: theme.spacing.md,
  },
  
  statValue: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceSecondary,
    marginBottom: theme.spacing.md,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  
  legendText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xs,
  },
}); 