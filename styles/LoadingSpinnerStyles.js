// styles/LoadingSpinnerStyles.js
import { StyleSheet } from 'react-native';

export const LoadingSpinnerStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logoContainer: {
    width: 240, // Container slightly larger than video
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 200, // Same as video size
    height: 200,
    borderRadius: 100, // Half of 200 for perfect circle
    overflow: 'hidden', // Ensure clipping
  },
  logo: {
    width: 200, // Large video size
    height: 200,
  },
});