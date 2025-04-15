// File: src/screens/index.js
import React, { useState, useEffect, useCallback } from 'react';
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
import FishingTypePicker from '../components/FishingTypePicker';
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
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

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
    isFetchingSpecies,
    handleFetchSpecies,
  } = useSpecies();
  const [date, setDate] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [fishingType, setFishingType] = useState('');
  const { isLoading, handleSubmit } = useFormSubmission(
    location,
    species,
    customSpecies,
    cityState,
    date,
    timeOfDay,
    fishingType
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const showLoading = useMinimumLoading(loading || isVerifying, 1000);

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
          if (isDebug) {
            logger.error('Deep link verification error:', error.message);
          }
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

  const fetchSpecies = useCallback(async () => {
    if (isFetchingSpecies || isFetchingLocation) {
      if (isDebug) logger.log('Skipping fetchSpecies: fetching in progress');
      return;
    }
    let targetCityState = cityState;
    let loc = location;
    if (!useCurrentLocation) {
      if (!manualCity.trim() || !manualState.trim()) {
        if (isDebug) logger.log('Skipping fetchSpecies: invalid manual location');
        return;
      }
      targetCityState = `${manualCity}, ${manualState}`.trim();
      loc = await resolveManualLocation(targetCityState);
      if (loc) {
        setLocation((prev) => {
          if (
            prev?.coords?.latitude === loc.coords.latitude &&
            prev?.coords?.longitude === loc.coords.longitude
          ) {
            if (isDebug) logger.log('Location unchanged, skipping update');
            return prev;
          }
          if (isDebug) logger.log('Updating location from manual:', loc.coords);
          return loc;
        });
      } else {
        if (isDebug) logger.log('Failed to resolve manual location');
        return;
      }
    }
    if (!targetCityState) {
      if (isDebug) logger.log('No valid cityState for fetchSpecies');
      return;
    }
    if (loc?.coords) {
      if (isDebug) {
        logger.log('Fetching species for location:', targetCityState);
      }
      await handleFetchSpecies(useCurrentLocation, cityState, manualCity, manualState, loc);
    } else {
      if (isDebug) logger.log('No valid location coords for fetchSpecies');
    }
  }, [
    useCurrentLocation,
    manualCity,
    manualState,
    cityState,
    isFetchingSpecies,
    isFetchingLocation,
    resolveManualLocation,
    handleFetchSpecies,
    location,
  ]);

  if (showLoading) {
    return <LoadingSpinner />;
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
              cityState={cityState || 'Select a location'}
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
            <FishingTypePicker fishingType={fishingType} setFishingType={setFishingType} />
            <View style={[HomeStyles.buttonSection, GlobalStyles.buttonSectionContainer]}>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    GlobalStyles.customButton,
                    (isLoading ||
                      speciesList.length === 0 ||
                      (species === 'Other' && !customSpecies) ||
                      !location?.coords ||
                      !cityState ||
                      !timeOfDay ||
                      !fishingType) &&
                      GlobalStyles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={
                    isLoading ||
                    speciesList.length === 0 ||
                    (species === 'Other' && !customSpecies) ||
                    !location?.coords ||
                    !cityState ||
                    !timeOfDay ||
                    !fishingType
                  }
                >
                  <Text style={GlobalStyles.buttonText}>
                    {isLoading ? 'Loading...' : 'Get Fishing Tips'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={GlobalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.customButton]}
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