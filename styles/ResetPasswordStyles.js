// styles/ResetPasswordStyles.js
import { StyleSheet, Platform } from 'react-native';

export const ResetPasswordStyles = StyleSheet.create({
  containerResetPassword: {
    width: '80%', // Match the width of other sections
    display: 'flex',
    flexDirection: 'column',
    marginHorizontal: 'auto',
    justifyContent: 'center',
  },
  inputResetPasswordSection: {
    marginVertical: 50, // Consistent with SignUpStyles
  },
  input: {
    height: 50,
    minHeight: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#333',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    fontSize: 16,
    // Web-specific adjustment for better responsiveness
    ...(Platform.OS === 'web' && {
      width: '80%',
      maxWidth: 400,
      alignSelf: 'center',
    }),
  },
});