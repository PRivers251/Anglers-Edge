import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import styles from '../styles/styles';

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      setLoading(false);
      return;
    }

    const userId = data.user.id;
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, username: firstName }); // Storing First Name as username

    if (profileError) {
      Alert.alert('Profile Creation Error', profileError.message);
    } else {
      Alert.alert('Success', 'Check your email for verification!');
      router.replace('/login');
    }

    setLoading(false);
  }

  return (
    <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.containerLogin}>
          <Text style={styles.title}>Sign Up for Angler’s Edge</Text>

          <View style={styles.inputLoginSection}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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
                onPress={signUpWithEmail}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.customButton]}
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.buttonText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}