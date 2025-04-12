// app/index.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import LocationToggle from '../components/LocationToggle';
import SpeciesPicker from '../components/SpeciesPicker';
import DateSelector from '../components/DateSelector';
import { GlobalStyles } from '../styles/GlobalStyles';
import { HomeStyles } from '../styles/HomeStyles';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { useSpecies } from '../hooks/useSpecies';
import { useFormSubmission } from '../hooks/useFormSubmission';
import { supabase } from '../services/supabaseClient';
import * as ExpoLinking from 'expo-linking';
import { useRouter } from 'expo-router';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMinimumLoading } from '../hooks/useMinimumLoading'; // Add import

export default function HomeScreen() {
  const router = useRouter();
  const { username, loading, handleLogout } = useAuth();
  const {
    useCurrentLocation,
    setUseCurrentLocation,
    location,
    setLocation,
    cityState,
    manualCity,
    manualState,
    setManualCity,
    setManualState,
    isFetchingLocation,
    resolveManualLocation,
  } = useLocation();
  const {
    species,
    setSpecies,
    customSpecies,
    setCustomSpecies,
    speciesList,
    weatherData,
    isFetchingSpecies,
    handleFetchSpecies,
  } = useSpecies();
  const [date, setDate] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const { isLoading, handleSubmit } = useFormSubmission(
    location,
    species,
    customSpecies,
    cityState,
    weatherData,
    date,
    timeOfDay
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const showLoading = useMinimumLoading(loading || isVerifying, 1000); // Use hook

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { path, queryParams } = ExpoLinking.parse(event.url);
      if (path === 'auth/v1/verify' && queryParams.type === 'signup' && queryParams.token) {
        setIsVerifying(true);
        const { error } = await supabase.auth.verifyOtp({
          token: queryParams.token,
          type: 'signup',
        });
        setIsVerifying(false);
        if (error) {
          console.error('Verification Error:', error.message);
          alert('Failed to confirm your account. Please try again or contact Patrick@ProAnglerAI.com for support.');
        } else {
          alert('Account confirmed! Please log in to start fishing smarter with ProAnglerAI.');
        }
      } else if (path === 'auth/v1/reset-password' && queryParams.token) {
        setIsVerifying(true);
        router.push({
          pathname: '/reset-password',
          params: { token: queryParams.token },
        });
        setIsVerifying(false);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [router]);

  const fetchSpecies = async () => {
    let loc = location;
    if (!useCurrentLocation) {
      loc = await resolveManualLocation(`${manualCity}, ${manualState}`);
      if (loc) setLocation(loc);
    }
    if (loc) {
      await handleFetchSpecies(useCurrentLocation, cityState, manualCity, manualState, loc);
    }
  };

  if (showLoading) {
    return <LoadingSpinner />;
  }

  console.log('HomeScreen Render Props:', {
    username,
    cityState,
    species,
    speciesList,
    timeOfDay,
    loading,
    isLoading,
    isFetchingSpecies,
    isFetchingLocation,
  });

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
              <View style={HomeStyles.logoContainer}>
                <Image
                  source={require('../assets/ProAnglerAI-WhiteBackground.png')}
                  style={HomeStyles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={GlobalStyles.title}>Welcome {username || 'User'}</Text>
            </View>
            <LocationToggle
              useCurrentLocation={useCurrentLocation}
              setUseCurrentLocation={setUseCurrentLocation}
              cityState={cityState || 'Loading...'}
              manualCity={manualCity}
              manualState={manualState}
              setManualCity={setManualCity}
              setManualState={setManualState}
              isFetchingSpecies={isFetchingSpecies}
              isFetchingLocation={isFetchingLocation}
              handleFetchSpecies={fetchSpecies}
            />
            <SpeciesPicker
              species={species}
              setSpecies={setSpecies}
              customSpecies={customSpecies}
              setCustomSpecies={setCustomSpecies}
              speciesList={speciesList}
              isFetchingSpecies={isFetchingSpecies}
            />
            <DateSelector date={date} setDate={setDate} timeOfDay={timeOfDay} setTimeOfDay={setTimeOfDay} />
            <View style={[HomeStyles.buttonSection, GlobalStyles.buttonSectionContainer]}>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    GlobalStyles.customButton,
                    (isLoading ||
                      speciesList.length === 0 ||
                      (species === 'Other' && !customSpecies) ||
                      !location?.coords ||
                      !timeOfDay) &&
                      GlobalStyles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={
                    isLoading ||
                    speciesList.length === 0 ||
                    (species === 'Other' && !customSpecies) ||
                    !location?.coords ||
                    !timeOfDay
                  }
                >
                  <Text style={GlobalStyles.buttonText}>
                    {isLoading ? 'Loading...' : 'Get Fishing Tips'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.customButton, GlobalStyles.backButton]}
                  onPress={handleLogout}
                >
                  <Text style={GlobalStyles.buttonText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}