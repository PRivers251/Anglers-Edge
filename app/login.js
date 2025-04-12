// app/login.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useRouter } from 'expo-router';
import { GlobalStyles } from '../styles/GlobalStyles';
import { LoginStyles } from '../styles/LoginStyles';
import { LocationToggleStyles } from '../styles/LocationToggleStyles';
import { HomeStyles } from '../styles/HomeStyles';
import AlertModal from '../components/AlertModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMinimumLoading } from '../hooks/useMinimumLoading'; // Add import

export default function LoginScreen() {
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

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      showAlert('Error', error.message);
    } else {
      router.replace('/');
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    const redirectTo = `https://proanglerai.com/redirect?email=${encodeURIComponent(email)}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('rate limit exceeded')) {
        showAlert(
          'Error',
          'Too many password reset requests. Please wait a while before trying again or use a different email address.'
        );
      } else {
        showAlert('Error', error.message);
      }
    } else {
      showAlert('Success', 'Password reset email sent! Please check your inbox.');
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

            <View style={LoginStyles.containerLogin}>
              <View style={LoginStyles.inputLoginSection}>
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
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={GlobalStyles.buttonText}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.customButton, loading && GlobalStyles.disabledButton]}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <Text style={GlobalStyles.buttonText}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableWithoutFeedback onPress={handleForgotPassword} disabled={loading}>
                  <Text style={LoginStyles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableWithoutFeedback>
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