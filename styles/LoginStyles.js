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
    marginVertical: 25, // Replace marginBlock with marginVertical
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#00CED1',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});