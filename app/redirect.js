// app/redirect.js
import React, { useEffect, useState } from 'react';
import { View, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GlobalStyles } from '../styles/GlobalStyles';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMinimumLoading } from '../hooks/useMinimumLoading'; // Add import

export default function RedirectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token;
  const email = params.email;
  const [loading, setLoading] = useState(true); // Add loading state

  const showLoading = useMinimumLoading(loading, 1000); // Use hook

  useEffect(() => {
    const deepLink = `proanglerai://auth/v1/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const fallbackUrl = `/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    window.location.href = deepLink;

    const timer = setTimeout(() => {
      setLoading(false); // End loading after redirect attempt
      router.replace(fallbackUrl);
    }, 1000);

    return () => clearTimeout(timer);
  }, [token, email, router]);

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

  return null; // Fallback (should rarely hit due to redirect)
}