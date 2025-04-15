// File: src/hooks/useLocation.js
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { logger } from '../utils/logger';
import { debounce } from '../utils/debounce';

const isDebug = process.env.NODE_ENV === 'development';

export const useLocation = () => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [cityState, setCityState] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const abortControllerRef = useRef(new AbortController());
  const locationModeRef = useRef(useCurrentLocation);

  const fetchLocation = debounce(async () => {
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (!locationModeRef.current) {
      setLocation(null);
      setCityState('');
      return;
    }

    setIsFetchingLocation(true);
    try {
      const loc = await getCurrentLocation(signal);
      if (loc) {
        setLocation((prev) => {
          if (
            prev?.coords?.latitude === loc.coords.latitude &&
            prev?.coords?.longitude === loc.coords.longitude
          ) {
            if (isDebug) logger.log('Location unchanged, skipping update');
            return prev;
          }
          if (isDebug) logger.log('Updating location:', loc.coords);
          return loc;
        });
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.coords.latitude},${loc.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`,
            { signal }
          );
          if (response.data.results && response.data.results.length > 0) {
            const addressComponents = response.data.results[0].address_components;
            let city = '';
            let state = '';
            for (const component of addressComponents) {
              if (component.types.includes('locality')) {
                city = component.short_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
              }
            }
            const newCityState = city && state ? `${city}, ${state}` : 'Unknown Location';
            setCityState((prev) => {
              if (prev === newCityState) {
                if (isDebug) logger.log('CityState unchanged, skipping update');
                return prev;
              }
              if (isDebug) logger.log('Updating cityState:', newCityState);
              return newCityState;
            });
          } else {
            setCityState('Unknown Location');
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            if (isDebug) logger.log('Location fetch aborted');
            return;
          }
          if (isDebug) logger.error('Reverse Geocoding Error:', error.message);
          setCityState('Unknown Location');
        }
      } else {
        setCityState('Location permission denied');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        if (isDebug) logger.log('Location fetch aborted');
        return;
      }
      if (isDebug) logger.error('Location Fetch Error:', error.message);
      setCityState('Location unavailable');
    } finally {
      setIsFetchingLocation(false);
    }
  }, 1000);

  useEffect(() => {
    locationModeRef.current = useCurrentLocation;
    let isMounted = true;
    if (isMounted && useCurrentLocation) fetchLocation();
    else if (!useCurrentLocation) {
      setLocation(null);
      const newCityState = manualCity && manualState ? `${manualCity}, ${manualState}` : '';
      setCityState(newCityState);
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      if (isDebug) logger.log('Switched to manual mode, cityState:', newCityState);
    }
    return () => {
      isMounted = false;
      abortControllerRef.current.abort();
    };
  }, [useCurrentLocation, manualCity, manualState]);

  const resolveManualLocation = async (cityStateString) => {
    if (!cityStateString || cityStateString === ',') {
      if (isDebug) logger.log('Invalid cityStateString for geocoding');
      return null;
    }
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityStateString)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        if (isDebug) logger.log('Resolved manual location:', { lat, lng });
        return { coords: { latitude: lat, longitude: lng } };
      }
      if (isDebug) logger.log('No geocoding results for:', cityStateString);
      return null;
    } catch (error) {
      if (isDebug) logger.error('Geocoding Error:', error.message);
      return null;
    }
  };

  const getCurrentLocation = async (signal) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (isDebug) logger.error('Location permission denied');
      return null;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ signal });
      if (isDebug) logger.log('Current location fetched:', loc.coords);
      return loc;
    } catch (error) {
      if (error.name === 'AbortError') {
        if (isDebug) logger.log('Current location fetch aborted');
        return null;
      }
      if (isDebug) logger.error('Location fetch error:', error.message);
      return null;
    }
  };

  return {
    useCurrentLocation,
    setUseCurrentLocation,
    location,
    setLocation,
    cityState,
    setCityState,
    manualCity,
    setManualCity,
    manualState,
    setManualState,
    isFetchingLocation,
    resolveManualLocation,
  };
};