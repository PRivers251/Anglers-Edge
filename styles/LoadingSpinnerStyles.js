// styles/LoadingSpinnerStyles.js
import { StyleSheet, Platform } from 'react-native';

export const LoadingSpinnerStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Matches GlobalStyles.loadingContainer
  },
  logoContainer: {
    width: 240, // Matches mobile video padding
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100, // Perfect circle
    overflow: Platform.OS === 'web' ? 'hidden' : 'hidden', // Ensure clipping for PNG on web
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2, // Add branded border
    borderColor: '#00CED1', // Matches HomeStyles.logo and app branding
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: Platform.OS === 'web' ? 100 : 0, // Ensure PNG is circular on web
    ...Platform.select({
      web: {
        objectFit: 'contain', // Scale PNG correctly
      },
    }),
  },
});