import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeatherData } from '../services/weatherService';
import { fetchWaterData } from '../services/waterService';
import { getFishingAdvice, getSpeciesTempRange } from '../services/adviceService';

const areObjectsEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const useFishingData = (location, species, cityState, date, timeOfDay) => {
  const [advice, setAdvice] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [tempRange, setTempRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (err.response?.status === 429 && i < maxRetries - 1) {
          const waitTime = delay * Math.pow(2, i);
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
      // Silent error handling
    }
  };

  const getCachedWeatherData = async (key) => {
    try {
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      return null;
    }
  };

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
    } else {
      const moonPhaseMap = {
        'New Moon': 0,
        'First Quarter': 0.25,
        'Full Moon': 0.5,
        'Last Quarter': 0.75,
        'Waxing Crescent': 0.125,
        'Waxing Gibbous': 0.375,
        'Waning Gibbous': 0.625,
        'Waning Crescent': 0.875,
      };
      const moonPhaseValue = moonPhaseMap[forecastMetrics.moonPhase] || 0;
      if (moonPhaseValue === 0 || moonPhaseValue === 0.5) score += 10;
      else if (moonPhaseValue === 0.25 || moonPhaseValue === 0.75) score += 5;
      else if (moonPhaseValue > 0 && moonPhaseValue < 1) score += 3;
    }
    if (waterMetrics?.gageHeightFt !== null) score += 5;
    if (forecastMetrics.cloudCover >= 70) score += 5;
    if (forecastMetrics.humidity >= 70 && forecastMetrics.tempTrend === 'Warming') score += 3;
    if (waterMetrics?.flowRateCfs && parseFloat(waterMetrics.flowRateCfs) > 500) score -= 5;

    return Math.round((Math.max(0, Math.min(100, score)) / 100) * 5) || 1;
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
        const weatherCacheKey = `weather_${lat}_${lon}_${date}`;
        const cachedForecast = await getCachedWeatherData(weatherCacheKey);
        if (cachedForecast) {
          forecast = cachedForecast;
        } else {
          forecast = await retryRequest(() => fetchWeatherData(lat, lon, date));
          await cacheWeatherData(weatherCacheKey, forecast);
        }
        if (!areObjectsEqual(forecastData, forecast)) {
          setForecastData(forecast);
        }

        let water = null;
        try {
          water = await retryRequest(() => fetchWaterData(lat, lon, date, forecast.dailyForecasts || []));
          setWaterData(water);
        } catch (err) {
          setError(prev => prev ? `${prev}; Water Data Fetch Failed: ${err.message}` : `Water Data Fetch Failed: ${err.message}`);
        }

        let speciesRange = null;
        try {
          speciesRange = await retryRequest(() => getSpeciesTempRange(species));
          setTempRange(speciesRange);
        } catch (err) {
          setError(prev => prev ? `${prev}; Species Temp Range Fetch Failed: ${err.message}` : `Species Temp Range Fetch Failed: ${err.message}`);
        }

        try {
          const adviceResult = await retryRequest(() =>
            getFishingAdvice(location, species, cityState, forecast.forecastMetrics, water, speciesRange, timeOfDay)
          );
          setAdvice(adviceResult);
        } catch (err) {
          setAdvice({
            bait: 'Spinners or worms',
            strategy: 'Fish near cover or deep pools, adjusted for recent weather.',
            tackle: {
              rod: 'Medium 7\' rod, moderate action',
              line: '10 lb monofilament',
            },
            additional_notes: 'Fallback advice due to API error.',
          });
          setError(prev => prev ? `${prev}; Fishing Advice Fetch Failed: ${err.message}` : `Fishing Advice Fetch Failed: ${err.message}`);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch fishing data. Please try again.');
        setForecastData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location, species, cityState, date, timeOfDay]);

  useEffect(() => {
    if (forecastData?.forecastMetrics && (waterData || tempRange)) {
      const rating = calculateFishingScore(forecastData.forecastMetrics, waterData, tempRange);
      const updatedForecastData = {
        ...forecastData,
        forecastMetrics: { ...forecastData.forecastMetrics, rating },
      };
      if (!areObjectsEqual(forecastData, updatedForecastData)) {
        setForecastData(updatedForecastData);
      }
    }
  }, [forecastData, waterData, tempRange]);

  return { advice, forecastData, waterData, tempRange, loading, error };
};