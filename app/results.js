import React, { useState, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeatherData } from '../services/weatherService';
import { fetchWaterData } from '../services/waterService';
import { getFishingAdvice, getSpeciesTempRange } from '../services/adviceService';
import { formatDate } from '../utils/dateUtils';
import styles from '../styles/styles';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const location = useMemo(() => {
    try {
      return params.location ? JSON.parse(params.location) : null;
    } catch (error) {
      console.error('Error parsing location param:', error.message);
      return null;
    }
  }, [params.location]);

  const weatherData = useMemo(() => {
    try {
      return params.weatherData ? JSON.parse(params.weatherData) : null;
    } catch (error) {
      console.error('Error parsing weatherData param:', error.message);
      return null;
    }
  }, [params.weatherData]);

  const { species, cityState, date } = params;

  const [advice, setAdvice] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [tempRange, setTempRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (err.response?.status === 429 && i < maxRetries - 1) {
          const waitTime = delay * Math.pow(2, i);
          console.warn(`Rate limit hit, retrying in ${waitTime}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw err;
        }
      }
    }
  };

  const cacheWeatherData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error('Error caching weather data:', err.message);
    }
  };

  const getCachedWeatherData = async (key) => {
    try {
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.error('Error retrieving cached weather data:', err.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!location?.coords?.latitude || !location?.coords?.longitude) {
          throw new Error('Location coordinates are missing.');
        }

        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        // Fetch weather data
        let forecast;
        const weatherCacheKey = `weather_${lat}_${lon}_${date}`;
        const cachedForecast = await getCachedWeatherData(weatherCacheKey);
        if (cachedForecast) {
          forecast = cachedForecast;
        } else if (weatherData) {
          forecast = { forecastMetrics: weatherData, dailyForecasts: [] };
          await cacheWeatherData(weatherCacheKey, forecast);
        } else {
          forecast = await retryRequest(() => fetchWeatherData(lat, lon, date));
          await cacheWeatherData(weatherCacheKey, forecast);
        }
        setForecastData(forecast);

        // Fetch water data
        let water = null;
        try {
          water = await retryRequest(() => fetchWaterData(lat, lon, date, forecast.dailyForecasts || []));
          setWaterData(water);
        } catch (err) {
          console.error('Water Data Error:', err.message);
          setError(`Water Data Fetch Failed: ${err.message}`);
        }

        // Fetch species temp range
        let speciesRange = null;
        try {
          speciesRange = await retryRequest(() => getSpeciesTempRange(species));
          setTempRange(speciesRange);
        } catch (err) {
          console.error('Species Temp Range Error:', err.message);
          setError(prev => prev ? `${prev}; Species Temp Range Fetch Failed: ${err.message}` : `Species Temp Range Fetch Failed: ${err.message}`);
        }

        // Fetch fishing advice with fetched water and temp range
        try {
          const adviceResult = await retryRequest(() =>
            getFishingAdvice(location, species, cityState, forecast.forecastMetrics, water, speciesRange)
          );
          setAdvice(adviceResult);
        } catch (err) {
          console.error('Fishing Advice Error:', err.message);
          setAdvice({
            bait: 'Spinners or worms',
            strategy: 'Fish near cover or deep pools, adjusted for recent weather.',
            additional_notes: 'Fallback advice due to API error.'
          });
          setError(prev => prev ? `${prev}; Fishing Advice Fetch Failed: ${err.message}` : `Fishing Advice Fetch Failed: ${err.message}`);
        }

        // Calculate rating and update forecastData
        if (forecast?.forecastMetrics) {
          const rating = calculateFishingScore(forecast.forecastMetrics, water, speciesRange);
          setForecastData(prev => ({ ...prev, forecastMetrics: { ...prev.forecastMetrics, rating } }));
        }
      } catch (err) {
        console.error('Initial Fetch Error:', err.message);
        setError(err.message);
        setForecastData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location, species, cityState, weatherData, date]);

  const calculateFishingScore = (forecastMetrics, waterMetrics, speciesTempRange) => {
    let score = 50;
    if (waterMetrics?.waterTempF && speciesTempRange) {
      if (waterMetrics.waterTempF >= speciesTempRange.min && waterMetrics.waterTempF <= speciesTempRange.max) score += 20;
      else if (waterMetrics.waterTempF < speciesTempRange.min - 10 || waterMetrics.waterTempF > speciesTempRange.max + 10) score -= 10;
    }
    if (forecastMetrics.lowTempF >= 59 && forecastMetrics.highTempF <= 80) score += 10;
    else if (forecastMetrics.highTempF - forecastMetrics.lowTempF > 20) score -= 5;
    if (forecastMetrics.totalPrecipIn > 0 && forecastMetrics.totalPrecipIn <= 0.1) score += 5;
    else if (forecastMetrics.totalPrecipIn > 0.5) score -= 5;
    if (forecastMetrics.avgWindMph >= 3 && forecastMetrics.avgWindMph <= 10) score += 5;
    else if (forecastMetrics.avgWindMph > 15) score -= 10;
    if (forecastMetrics.windDeg >= 45 && forecastMetrics.windDeg <= 135) score += 3;
    if (forecastMetrics.pressureHpa < 1013) score += 5;
    if (typeof forecastMetrics.moonPhase === 'number') {
      if (forecastMetrics.moonPhase === 0 || forecastMetrics.moonPhase === 0.5) score += 10;
      else if (forecastMetrics.moonPhase === 0.25 || forecastMetrics.moonPhase === 0.75) score += 5;
      else if (forecastMetrics.moonPhase > 0 && forecastMetrics.moonPhase < 1) score += 3;
    }
    if (waterMetrics?.gageHeightFt !== null) score += 5;

    return Math.round((Math.max(0, Math.min(100, score)) / 100) * 5) || 1;
  };

  if (loading) {
    return (
      <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={styles.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </ImageBackground>
    );
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  return (
    <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={styles.background}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Fishing Advice for {cityState} - {species || 'Unknown Species'}</Text>
        </View>
        <View style={styles.forecastSection}>
          {forecastData?.forecastMetrics ? (
            <View style={styles.forecastCard}>
              <Text style={styles.forecastField}><Text style={styles.label}>Date: </Text>{formatDate(date)}</Text>
              <Text style={styles.forecastField}><Text style={styles.label}>Temperature: </Text>{forecastData.forecastMetrics.lowTempF}–{forecastData.forecastMetrics.highTempF}°F</Text>
              <Text style={styles.forecastField}><Text style={styles.label}>Precipitation: </Text>{forecastData.forecastMetrics.totalPrecipIn} in</Text>
              <Text style={styles.forecastField}><Text style={styles.label}>Wind Speed: </Text>{forecastData.forecastMetrics.avgWindMph} mph</Text>
              {waterData?.waterTempF && (
                <Text style={styles.forecastField}><Text style={styles.label}>Water Temp: </Text>{waterData.waterTempF.toFixed(1)}°F {parsedDate > new Date() ? '(forecasted)' : ''}</Text>
              )}
              {waterData?.gageHeightFt && (
                <Text style={styles.forecastField}><Text style={styles.label}>Water Level: </Text>{waterData.gageHeightFt.toFixed(2)} ft {parsedDate > new Date() ? '(forecasted)' : ''}</Text>
              )}
              <Text style={styles.forecastField}><Text style={styles.label}>Fishing Conditions: </Text>{'★'.repeat(forecastData.forecastMetrics.rating)}{'☆'.repeat(5 - forecastData.forecastMetrics.rating)}</Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>Error: {error}</Text>
          ) : (
            <Text style={styles.errorText}>Unable to load forecast data.</Text>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.adviceSection}>
            <View style={styles.adviceCard}>
              {advice && (
                <>
                  <Text style={styles.field}><Text style={styles.label}>Bait: </Text>{advice.bait || 'Not specified'}</Text>
                  <Text style={styles.field}><Text style={styles.label}>Strategy: </Text>{advice.strategy || 'Not specified'}</Text>
                  {advice.additional_notes && (
                    <Text style={styles.field}><Text style={styles.label}>Additional Notes: </Text>{advice.additional_notes}</Text>
                  )}
                </>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}