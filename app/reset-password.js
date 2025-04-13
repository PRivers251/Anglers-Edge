import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GlobalStyles } from '../styles/GlobalStyles';
import { supabase } from '../services/supabaseClient';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
      } else {
        Alert.alert('Success', 'Password reset successfully! Please log in with your new password.');
        router.push('/index');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/angler-casting-reel-into-water.png')}
      style={GlobalStyles.background}
    >
      <View style={GlobalStyles.container}>
        <View style={GlobalStyles.header}>
          <Text style={GlobalStyles.title}>Reset Password</Text>
        </View>
        <View style={GlobalStyles.content}>
          <TextInput
            style={GlobalStyles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
          />
          <TextInput
            style={GlobalStyles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[GlobalStyles.customButton, loading && GlobalStyles.disabledButton]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={GlobalStyles.buttonText}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.customButton, GlobalStyles.backButton]}
            onPress={() => router.push('/index')}
          >
            <Text style={GlobalStyles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}