import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { getCurrentLocation, fetchLocationAndWeather } from '../services/locationService';
import { debounce } from '../utils/debounce';

export const useLocation = () => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [cityState, setCityState] = useState('Select a location'); // Default non-empty string
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [lastLocationFetch, setLastLocationFetch] = useState(null);

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
          setCityState('Location unavailable');
        }
      } catch (error) {
        console.error('Geocoding Error:', error.message);
        setCityState('Location unavailable');
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
          setCityState('Location unavailable');
        }
      } catch (error) {
        console.error('Geocoding Error:', error.message);
        setCityState('Location unavailable');
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
        setCityState('Select a location');
      }
    }
  }, [useCurrentLocation, manualCity, manualState, debouncedInitializeCurrentLocation]);

  const resolveManualLocation = async (targetCityState) => {
    const result = await fetchLocationAndWeather(false, targetCityState, null);
    const loc = result.loc;
    if (!loc?.coords) {
      console.error('Failed to resolve location coordinates:', { targetCityState, manualCity, manualState });
      return null;
    }
    setLocation(loc);
    setLastLocationFetch(loc);
    return loc;
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