// styles/LoginStyles.js
import { StyleSheet } from 'react-native';

export const LoginStyles = StyleSheet.create({
  containerLogin: {
    width: '80%', // Match the width of other sections (e.g., GlobalStyles.buttonSectionContainer)
    display: 'flex',
    flexDirection: 'column',
    marginHorizontal: 'auto', // Replace marginInline with marginHorizontal
    justifyContent: 'center',
  },
  inputLoginSection: {
    marginVertical: 50, // Replace marginBlock with marginVertical
  },
});