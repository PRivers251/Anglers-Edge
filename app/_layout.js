// app/_layout.js
import { Stack } from 'expo-router';
import { TransitionPresets } from '@react-navigation/stack';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        animation: 'fade', // Use fade animation on iOS
        animationDuration: 600, // Slower transition for smoothness
        ...TransitionPresets.FadeFromBottomAndroid, // Fallback for Android
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="redirect" options={{ headerShown: false }} />
    </Stack>
  );
}