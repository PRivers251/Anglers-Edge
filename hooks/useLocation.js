import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { fetchLocationAndWeather } from '../services/locationService';
import { Alert } from 'react-native';
import { debounce } from '../utils/debounce';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

export const useLocation = () => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [cityState, setCityState] = useState(null);
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchCurrentLocation = useCallback(
    debounce(async () => {
      setIsFetchingLocation(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location access is required to fetch your current location. Please enable location permissions or use manual input.'
          );
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const { city, region } = reverseGeocode[0];
          setCityState(`${city}, ${region}`);
        } else {
          setCityState('Unknown Location');
        }
      } catch (error) {
        if (isDebug) {
          logger.error('Failed to fetch current location:', error.message);
        }
        Alert.alert('Error', 'Failed to fetch your current location. Please try manual input.');
      } finally {
        setIsFetchingLocation(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (useCurrentLocation) {
      fetchCurrentLocation();
    }
  }, [useCurrentLocation, fetchCurrentLocation]);

  const resolveManualLocation = async (cityState) => {
    setIsFetchingLocation(true);
    try {
      const result = await fetchLocationAndWeather(false, cityState, null);
      if (result.loc) {
        setLocation(result.loc);
        setCityState(cityState);
        return result.loc;
      }
      Alert.alert('Error', `Unable to resolve location for ${cityState}. Please try a different city or state.`);
      return null;
    } catch (error) {
      if (isDebug) {
        logger.error('Failed to resolve manual location:', error.message);
      }
      Alert.alert('Error', 'An error occurred while resolving the location. Please try again.');
      return null;
    } finally {
      setIsFetchingLocation(false);
    }
  };

  return {
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
  };
};