// File: src/hooks/useFishingData.js
import { useState, useEffect } from 'react';
import { fetchWeatherData } from '../services/weatherService';
import { fetchWaterData } from '../services/waterService';
import { getFishingAdvice, getSpeciesTempRange } from '../services/adviceService';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

export const useFishingData = (location, species, cityState, date, timeOfDay, fishingType) => {
  const [advice, setAdvice] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!location?.coords || !cityState || !date || !timeOfDay || !fishingType) {
          throw new Error('Missing required parameters: ' + JSON.stringify({ hasLocation: !!location?.coords, cityState, date, timeOfDay, fishingType }));
        }

        const weatherResult = await fetchWeatherData(
          location.coords.latitude,
          location.coords.longitude,
          date,
          timeOfDay
        );

        const waterData = await fetchWaterData(
          location.coords.latitude,
          location.coords.longitude,
          date,
          weatherResult.dailyForecasts
        );

        const speciesTempRange = await getSpeciesTempRange(species !== 'None' ? species : null);

        const adviceResult = await getFishingAdvice(
          location,
          species,
          cityState,
          weatherResult.forecastMetrics,
          waterData,
          speciesTempRange,
          timeOfDay,
          fishingType
        );

        setForecastData({
          forecastMetrics: weatherResult.forecastMetrics,
          dailyForecasts: weatherResult.dailyForecasts,
          hourlyForecasts: weatherResult.hourlyForecasts,
        });
        setAdvice(adviceResult);
      } catch (err) {
        if (isDebug) {
          logger.error('Fishing data fetch error:', err.message);
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location, species, cityState, date, timeOfDay, fishingType]);

  return { advice, forecastData, loading, error };
};