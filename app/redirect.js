// app/redirect.js
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalStyles } from '../styles/GlobalStyles';

export default function RedirectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token;
  const email = params.email;

  useEffect(() => {
    const deepLink = `proanglerai://auth/v1/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const fallbackUrl = `/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    window.location.href = deepLink;

    const timer = setTimeout(() => {
      router.replace(fallbackUrl);
    }, 1000);

    return () => clearTimeout(timer);
  }, [token, email, router]);

  return (
    <View style={GlobalStyles.loadingContainer}>
      <Text style={GlobalStyles.title}>Redirecting...</Text>
    </View>
  );
}