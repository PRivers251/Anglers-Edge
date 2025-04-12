// styles/LoadingSpinnerStyles.js
import { StyleSheet } from 'react-native';

export const LoadingSpinnerStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Matches GlobalStyles.loadingContainer
  },
  logoContainer: {
    position: 'relative',
    width: 150, // Adjustable size
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular logo
  },
  border: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 4,
    borderColor: '#00CED1', // Brand blue
    borderRadius: 75, // Circular border
    borderStyle: 'solid',
  },
});