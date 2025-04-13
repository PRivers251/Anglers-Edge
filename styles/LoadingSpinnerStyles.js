import { StyleSheet, Platform } from 'react-native';

export const LoadingSpinnerStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Matches GlobalStyles.loadingContainer
  },
  logoContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: Platform.OS === 'web' ? 'hidden' : 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00CED1',
    position: 'relative', // Ensure relative positioning for absolute children
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: Platform.OS === 'web' ? 100 : 0,
    ...Platform.select({
      web: {
        objectFit: 'contain',
      },
    }),
    zIndex: 1, // Lower zIndex to ensure the spinner is on top
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    zIndex: 2, // Higher zIndex to ensure the spinner is above the logo
  },
});