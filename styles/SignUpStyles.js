// styles/SignUpStyles.js
import { StyleSheet } from 'react-native';

export const SignUpStyles = StyleSheet.create({
  containerSignUp: {
    width: '80%', // Match the width of other sections
    display: 'flex',
    flexDirection: 'column',
    marginHorizontal: 'auto', // Replace marginInline with marginHorizontal
    justifyContent: 'center',
  },
  inputSignUpSection: {
    marginVertical: 50, // Replace marginBlock with marginVertical
  },
});