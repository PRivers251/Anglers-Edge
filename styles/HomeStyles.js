// styles/HomeStyles.js
import { StyleSheet } from 'react-native';

export const HomeStyles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#00CED1',
    backgroundColor: 'transparent',
  },
  buttonSection: {  
    alignItems: 'center', 
    marginBottom: 20,
    width: '80%', // Ensure consistency
  },
});