// app/reset-password.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import { GlobalStyles } from '../styles/GlobalStyles';
import { ResetPasswordStyles } from '../styles/ResetPasswordStyles';
import AlertModal from '../components/AlertModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMinimumLoading } from '../hooks/useMinimumLoading'; // Add import

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token;
  const email = params.email;

  const showLoading = useMinimumLoading(loading, 1000); // Use hook

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    if (alertTitle === 'Success') {
      router.replace('/login');
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        showAlert('Error', 'Invalid or missing reset token or email. Please request a new password reset link.');
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.verifyOtp({
          token: token,
          type: 'recovery',
          email: email,
        });

        if (error) throw error;

        setIsTokenVerified(true);
      } catch (error) {
        showAlert('Error', error.message || 'Failed to verify reset token. Please request a new password reset link.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const handleResetPassword = async () => {
    if (!isTokenVerified) {
      showAlert('Error', 'Cannot update password until the reset token is verified.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showAlert('Error', 'Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Passwords do not match.');
      return;
    }
    if (
      !/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(newPassword)
    ) {
      showAlert(
        'Error',
        'Password must be at least 8 characters long and include at least one number and one special character (e.g., !@#$%^&*).'
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showAlert('Success', 'Password updated! Please log in with your new password.');
    } catch (error) {
      showAlert('Error', error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showLoading) {
    return (
      <ImageBackground
        source={require('../assets/angler-casting-reel-into-water.png')}
        style={GlobalStyles.background}
      >
        <LoadingSpinner />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/angler-casting-reel-into-water.png')}
      style={GlobalStyles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.keyboardAvoidingContainer}
      >
        <ScrollView style={GlobalStyles.container} contentContainerStyle={GlobalStyles.scrollContent}>
          <View style={GlobalStyles.content}>
            <View style={GlobalStyles.header}>
              <Text style={GlobalStyles.title}>Reset Password</Text>
            </View>
            <View style={ResetPasswordStyles.containerResetPassword}>
              <View style={ResetPasswordStyles.inputResetPasswordSection}>
                <TextInput
                  style={ResetPasswordStyles.input}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  editable={!loading && isTokenVerified}
                />
                <TextInput
                  style={ResetPasswordStyles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  editable={!loading && isTokenVerified}
                />
              </View>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.customButton, (loading || !isTokenVerified) && GlobalStyles.disabledButton]}
                  onPress={handleResetPassword}
                  disabled={loading || !isTokenVerified}
                >
                  <Text style={GlobalStyles.buttonText}>
                    Update Password
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.customButton, GlobalStyles.backButton]}
                  onPress={() => router.replace('/login')}
                >
                  <Text style={GlobalStyles.buttonText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
      />
    </ImageBackground>
  );
}