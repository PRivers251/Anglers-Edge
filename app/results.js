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
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
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

  const retryRequest = async (fn, maxRetries = 3, delay = 1000) => { // Increased delay to 60 seconds
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

  // Cache weather data in AsyncStorage
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

        let forecast;
        // Create a cache key based on location and date
        const weatherCacheKey = `weather_${lat}_${lon}_${date}`;
        const cachedForecast = await getCachedWeatherData(weatherCacheKey);

        if (cachedForecast) {
          forecast = cachedForecast;
          setForecastData(forecast);
        } else if (weatherData) {
          forecast = { forecastMetrics: weatherData, dailyForecasts: [] };
          setForecastData(forecast);
          await cacheWeatherData(weatherCacheKey, forecast);
        } else {
          try {
            forecast = await retryRequest(() => fetchWeatherData(lat, lon, date));
            setForecastData(forecast);
            await cacheWeatherData(weatherCacheKey, forecast);
          } catch (err) {
            throw new Error(`Weather Data Fetch Failed: ${err.message}`);
          }
        }

        let water;
        try {
          water = await retryRequest(() => fetchWaterData(lat, lon, date, forecast.dailyForecasts || []));
          setWaterData(water);
        } catch (err) {
          throw new Error(`Water Data Fetch Failed: ${err.message}`);
        }

        let speciesRange;
        try {
          speciesRange = await retryRequest(() => getSpeciesTempRange(species));
          setTempRange(speciesRange);
        } catch (err) {
          throw new Error(`Species Temp Range Fetch Failed: ${err.message}`);
        }

        let adviceResult;
        try {
          adviceResult = await retryRequest(() =>
            getFishingAdvice(location, species, cityState, forecast.forecastMetrics, water, speciesRange)
          );
          setAdvice(adviceResult);
        } catch (err) {
          throw new Error(`Fishing Advice Fetch Failed: ${err.message}`);
        }

        const rating = calculateFishingScore(forecast.forecastMetrics, water, speciesRange);
        setForecastData({ ...forecast.forecastMetrics, rating });
      } catch (err) {
        console.error('Results Data Error:', err.message);
        setError(err.message);
        setAdvice(null);
        setForecastData(null);
        setWaterData(null);
        setTempRange(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [location, species, cityState, weatherData, date]);

  const calculateFishingScore = (forecastMetrics, waterMetrics, speciesTempRange) => {
    let score = 50;
    if (waterMetrics.waterTempF && speciesTempRange) {
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
    if (waterMetrics.gageHeightFt !== null) score += 5;

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
          {forecastData ? (
            <View style={styles.forecastCard}>
              <Text style={styles.forecastField}><Text style={styles.label}>Date: </Text>{formatDate(date)}</Text>
              <Text style={styles.forecastField}><Text style={styles.label}>Temperature: </Text>{forecastData.lowTempF}–{forecastData.highTempF}°F</Text>
              <Text style={styles.forecastField}><Text style={styles.label}>Precipitation: </Text>{forecastData.totalPrecipIn} in</Text>
              <Text style={styles.forecastField}><Text style={styles.label}>Wind Speed: </Text>{forecastData.avgWindMph} mph</Text>
              {waterData?.waterTempF && (
                <Text style={styles.forecastField}><Text style={styles.label}>Water Temp: </Text>{waterData.waterTempF.toFixed(1)}°F {parsedDate > new Date() ? '(forecasted)' : ''}</Text>
              )}
              {waterData?.gageHeightFt && (
                <Text style={styles.forecastField}><Text style={styles.label}>Water Level: </Text>{waterData.gageHeightFt.toFixed(2)} ft {parsedDate > new Date() ? '(forecasted)' : ''}</Text>
              )}
              <Text style={styles.forecastField}><Text style={styles.label}>Fishing Conditions: </Text>{'★'.repeat(forecastData.rating)}{'☆'.repeat(5 - forecastData.rating)}</Text>
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
                  <Text style={styles.field}><Text style={styles.label}>Bait: </Text><Text>{advice.bait || 'Not specified'}</Text></Text>
                  <Text style={styles.field}><Text style={styles.label}>Strategy: </Text><Text>{advice.strategy || 'Not specified'}</Text></Text>
                  {advice.additional_notes && (
                    <Text style={styles.field}><Text style={styles.label}>Additional Notes: </Text><Text>{advice.additional_notes}</Text></Text>
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