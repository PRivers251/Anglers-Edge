// app/confirm.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import { GlobalStyles } from '../styles/GlobalStyles';
import AlertModal from '../components/AlertModal'; // Import the modal component

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState('verifying');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    if (alertTitle === 'Confirmation Failed' || alertTitle === 'Invalid Link') {
      router.replace('/signup');
    }
  };

  useEffect(() => {
    const verify = async () => {
      if (params.token && params.type === 'signup') {
        const { error } = await supabase.auth.verifyOtp({
          token: params.token,
          type: 'signup',
        });
        setStatus(error ? 'error' : 'success');
        if (error) {
          showAlert('Confirmation Failed', 'Something went wrong. Please try again or contact support.');
        }
      } else {
        setStatus('invalid');
        showAlert('Invalid Link', 'This confirmation link is invalid or expired.');
      }
    };
    verify();
  }, [params]);

  return (
    <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={GlobalStyles.background}>
      <View style={GlobalStyles.loadingContainer}>
        {status === 'verifying' && <Text style={GlobalStyles.title}>Verifying your account...</Text>}
        {status === 'success' && (
          <>
            <Text style={GlobalStyles.title}>Welcome to ProAnglerAI!</Text>
            <Text style={GlobalStyles.placeholder}>Your account is confirmed. Let’s get fishing!</Text>
            <TouchableOpacity style={GlobalStyles.customButton} onPress={() => router.replace('/')}>
              <Text style={GlobalStyles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
      />
    </ImageBackground>
  );
}