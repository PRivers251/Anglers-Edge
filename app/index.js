import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import LocationToggle from '../components/LocationToggle';
import SpeciesPicker from '../components/SpeciesPicker';
import DateSelector from '../components/DateSelector';
import { getSpeciesListFromAI } from '../services/adviceService';
import { fetchLocationAndWeather, getCurrentLocation } from '../services/locationService';
import { GOOGLE_MAPS_API_KEY } from '@env';
import styles from '../styles/styles';

export default function HomeScreen() {
  const router = useRouter();

  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [cityState, setCityState] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [date, setDate] = useState(new Date());
  const [speciesList, setSpeciesList] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSpecies, setIsFetchingSpecies] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [lastLocationFetch, setLastLocationFetch] = useState(null);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const initializeCurrentLocation = useCallback(async () => {
    setIsFetchingLocation(true);
    if (lastLocationFetch) {
      setLocation(lastLocationFetch);
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lastLocationFetch.coords.latitude},${lastLocationFetch.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );
        if (response.data.results && response.data.results.length > 0) {
          const addressComponents = response.data.results[0].address_components;
          const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || 'Unknown City';
          const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name || 'Unknown State';
          const resolvedCityState = `${city}, ${state}`;
          setCityState(resolvedCityState);
          setManualCity(city);
          setManualState(state);
        } else {
          throw new Error('No results found for geocoding');
        }
      } catch (error) {
        console.error('Geocoding Error:', error.message);
        setCityState('Location unavailable');
        setManualCity('Unknown City');
        setManualState('Unknown State');
      }
      setIsFetchingLocation(false);
      return;
    }

    const loc = await getCurrentLocation();
    if (loc) {
      setLocation(loc);
      setLastLocationFetch(loc);
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.coords.latitude},${loc.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );
        if (response.data.results && response.data.results.length > 0) {
          const addressComponents = response.data.results[0].address_components;
          const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || 'Unknown City';
          const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name || 'Unknown State';
          const resolvedCityState = `${city}, ${state}`;
          setCityState(resolvedCityState);
          setManualCity(city);
          setManualState(state);
        } else {
          throw new Error('No results found for geocoding');
        }
      } catch (error) {
        console.error('Geocoding Error:', error.message);
        setCityState('Location unavailable');
        setManualCity('Unknown City');
        setManualState('Unknown State');
      }
    } else {
      console.error('Location permission denied or fetch failed');
      setCityState('Location permission denied');
    }
    setIsFetchingLocation(false);
  }, [lastLocationFetch]);

  const debouncedInitializeCurrentLocation = useMemo(
    () => debounce(initializeCurrentLocation, 1000),
    [initializeCurrentLocation]
  );

  useEffect(() => {
    if (useCurrentLocation) {
      debouncedInitializeCurrentLocation();
    } else {
      if (location && !manualCity && !manualState) {
        setLocation(null);
        setLastLocationFetch(null);
        setIsFetchingLocation(false);
        setCityState('');
        setSpeciesList([]);
        setWeatherData(null);
        setCustomSpecies('');
        setDate(new Date());
      }
    }
  }, [useCurrentLocation, manualCity, manualState, debouncedInitializeCurrentLocation]);

  const handleFetchSpecies = async () => {
    setIsFetchingSpecies(true);
    const targetCityState = useCurrentLocation ? cityState : `${manualCity}, ${manualState}`;
    if (!targetCityState) {
      console.error('No location specified');
      setSpeciesList([]);
      setIsFetchingSpecies(false);
      return;
    }
    setCityState(targetCityState);

    let loc = useCurrentLocation ? location : null;
    if (!useCurrentLocation) {
      const result = await fetchLocationAndWeather(false, targetCityState, null);
      loc = result.loc;
      console.log('Manual location result:', loc);
      if (!loc?.coords) {
        console.error('Failed to resolve location coordinates:', {
          targetCityState,
          manualCity,
          manualState,
        });
        setSpeciesList([]);
        setIsFetchingSpecies(false);
        return;
      }
      setLocation(loc);
      setLastLocationFetch(loc);
    }

    try {
      const weather = useCurrentLocation
        ? (await fetchLocationAndWeather(true, targetCityState, loc)).weather
        : null;
      setWeatherData(weather);
      const speciesData = await getSpeciesListFromAI(targetCityState);
      const newSpeciesList = [...speciesData, 'Other'];
      setSpeciesList(newSpeciesList);
      setSpecies('');
      setCustomSpecies('');
      console.log('New species list:', newSpeciesList);
    } catch (error) {
      console.error('Fetch Error:', error.message);
      const fallbackSpecies = await getSpeciesListFromAI('Location unavailable');
      setSpeciesList([...fallbackSpecies, 'Other']);
      setCityState('Location unavailable');
      setWeatherData(null);
      setCustomSpecies('');
    } finally {
      setIsFetchingSpecies(false);
    }
  };

  const handleSubmit = async () => {
    if (isLoading || !location?.coords) return;
    setIsLoading(true);
    const finalSpecies = species === 'Other' ? customSpecies : species;
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    const formattedDate = localDate.toISOString().split('T')[0];

    const simplifiedLocation = {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };
    const simplifiedWeatherData = weatherData ? { ...weatherData } : null;

    try {
      router.push({
        pathname: '/results',
        params: {
          location: JSON.stringify(simplifiedLocation),
          species: finalSpecies,
          cityState,
          weatherData: simplifiedWeatherData ? JSON.stringify(simplifiedWeatherData) : null,
          date: formattedDate,
        },
      });
    } catch (error) {
      console.error('Navigation Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Location state updated:', location);
    console.log('Species list updated:', speciesList);
  }, [location, speciesList]);

  console.log('Button conditions:', {
    isLoading,
    speciesListLength: speciesList.length,
    species,
    customSpecies,
    hasCoords: !!location?.coords,
  });

  return (
    <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Angler’s Edge</Text>
            </View>
            <LocationToggle
              useCurrentLocation={useCurrentLocation}
              setUseCurrentLocation={setUseCurrentLocation}
              cityState={cityState}
              manualCity={manualCity}
              manualState={manualState}
              setManualCity={setManualCity}
              setManualState={setManualState}
              isFetchingSpecies={isFetchingSpecies}
              isFetchingLocation={isFetchingLocation}
              handleFetchSpecies={handleFetchSpecies}
            />
            <SpeciesPicker
              species={species}
              setSpecies={setSpecies}
              customSpecies={customSpecies}
              setCustomSpecies={setCustomSpecies}
              speciesList={speciesList}
              isFetchingSpecies={isFetchingSpecies}
            />
            <DateSelector date={date} setDate={setDate} />
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.customButton,
                  (isLoading || speciesList.length === 0 || (species === 'Other' && !customSpecies) || !location?.coords) &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isLoading || speciesList.length === 0 || (species === 'Other' && !customSpecies) || !location?.coords}
              >
                <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Get Fishing Tips'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}