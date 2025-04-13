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
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00CED1',
    position: 'relative',
  },
  logo: {
    width: 150, // Reduced to ensure spinner is fully visible around it
    height: 150,
    borderRadius: Platform.OS === 'web' ? 75 : 0,
    ...Platform.select({
      web: {
        objectFit: 'contain',
      },
    }),
    zIndex: 1,
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 10, // Center within wrapper: (200 - 180) / 2
    left: 10,
    width: 180,
    height: 180,
    zIndex: 2,
  },
  webSpinnerContainer: {
    position: 'absolute',
    top: 8, // Center within wrapper: (200 - 180) / 2
    left: 8,
    width: 180,
    height: 180,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});