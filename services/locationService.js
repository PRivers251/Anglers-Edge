import * as Location from 'expo-location';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '@env';

export const fetchLocationAndWeather = async (useCurrentLocation, targetCityState, currentLocation) => {
  let loc = useCurrentLocation ? currentLocation : null;
  let weather = null;

  if (useCurrentLocation && !loc) {
    loc = await getCurrentLocation();
    if (!loc) return { loc: null, weather: null };
  } else if (!useCurrentLocation) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(targetCityState)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        loc = { coords: { latitude: lat, longitude: lng } };
      } else {
        throw new Error('No geocoding results found');
      }
    } catch (error) {
      console.error('Geocoding Error:', error.message);
      return { loc: null, weather: null };
    }
  }

  if (loc) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weatherResponse = await axios.get(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,precipitation,wind_speed_10m`
      );
      const weatherData = weatherResponse.data.hourly;
      weather = {
        avgTemp: (weatherData.temperature_2m.reduce((a, b) => a + b, 0) / weatherData.temperature_2m.length).toFixed(1),
        totalPrecip: weatherData.precipitation.reduce((a, b) => a + b, 0).toFixed(1),
        avgWind: (weatherData.wind_speed_10m.reduce((a, b) => a + b, 0) / weatherData.wind_speed_10m.length).toFixed(1)
      };
    } catch (error) {
      console.error('Weather Fetch Error:', error.message);
      weather = null;
    }
  }

  return { loc, weather };
};

export const getCurrentLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Location permission denied');
    return null;
  }
  try {
    const loc = await Location.getCurrentPositionAsync({});
    console.log('Current location fetched:', loc.coords);
    return loc;
  } catch (error) {
    console.error('Location fetch error:', error.message);
    return null;
  }
};