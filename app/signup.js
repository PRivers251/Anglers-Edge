// app/signup.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import { GlobalStyles } from '../styles/GlobalStyles';
import { SignUpStyles } from '../styles/SignUpStyles';
import { LocationToggleStyles } from '../styles/LocationToggleStyles';
import { HomeStyles } from '../styles/HomeStyles';
import AlertModal from '../components/AlertModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMinimumLoading } from '../hooks/useMinimumLoading'; // Add import

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const router = useRouter();

  const showLoading = useMinimumLoading(loading, 1000); // Use hook

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  const validateInputs = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!firstName.trim()) {
      showAlert('Error', 'First Name is required.');
      return false;
    }
    if (!nameRegex.test(firstName)) {
      showAlert('Error', 'First Name should only contain letters and spaces.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      showAlert('Error', 'Email is required.');
      return false;
    }
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address.');
      return false;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!password) {
      showAlert('Error', 'Password is required.');
      return false;
    }
    if (!passwordRegex.test(password)) {
      showAlert(
        'Error',
        'Password must be at least 8 characters long and include at least one number and one special character (e.g., !@#$%^&*).'
      );
      return false;
    }

    return true;
  };

  const checkEmailExists = async (emailToCheck) => {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', { email_to_check: emailToCheck });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking email:', error.message);
      showAlert('Error', 'Failed to verify email availability. Please try again.');
      return null;
    }
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;
    setLoading(true);

    const emailExists = await checkEmailExists(email);
    if (emailExists === null) {
      setLoading(false);
      return;
    }
    if (emailExists) {
      showAlert('Error', 'An account with this email already exists.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: firstName },
        },
      });
      if (error) throw error;
      showAlert('Success', 'Check your email to confirm your account!');
      router.replace('/login');
    } catch (error) {
      showAlert('Error', error.message);
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
        <ScrollView
          style={GlobalStyles.container}
          contentContainerStyle={GlobalStyles.scrollContent}
        >
          <View style={GlobalStyles.content}>
            <View style={GlobalStyles.header}>
              <View style={HomeStyles.logoContainer}>
                <Image
                  source={require('../assets/ProAnglerAI-WhiteBackground.png')}
                  style={HomeStyles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View style={SignUpStyles.containerSignUp}>
              <View style={SignUpStyles.inputSignUpSection}>
                <TextInput
                  style={LocationToggleStyles.input}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={LocationToggleStyles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={LocationToggleStyles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.customButton, loading && GlobalStyles.disabledButton]}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <Text style={GlobalStyles.buttonText}>Sign Up</Text>
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