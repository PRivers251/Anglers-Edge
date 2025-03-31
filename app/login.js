import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useRouter } from 'expo-router';
import styles from '../styles/styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      router.replace('/'); // Redirect to HomeScreen
    }
    setLoading(false);
  }

  return (
    <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.containerLogin}>
          <Text style={styles.title}>Login to Angler’s Edge</Text>

          <View style={styles.inputLoginSection}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonSection}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.customButton, loading && styles.disabledButton]}
                onPress={signInWithEmail}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Sign In'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.customButton]}
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}