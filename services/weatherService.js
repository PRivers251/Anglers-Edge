import axios from 'axios';
import { OPEN_WEATHER_MAP_API_KEY } from '@env';
import { validateDate } from '../utils/dateUtils';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

const getMoonPhaseName = (moonPhase) => {
  if (moonPhase === undefined || moonPhase === null || moonPhase === 'Not available') return 'Unknown';
  if (moonPhase === 0) return 'New Moon';
  if (moonPhase === 0.25) return 'First Quarter';
  if (moonPhase === 0.5) return 'Full Moon';
  if (moonPhase === 0.75) return 'Last Quarter';
  if (moonPhase > 0 && moonPhase < 0.25) return 'Waxing Crescent';
  if (moonPhase > 0.25 && moonPhase < 0.5) return 'Waxing Gibbous';
  if (moonPhase > 0.5 && moonPhase < 0.75) return 'Waning Gibbous';
  if (moonPhase > 0.75 && moonPhase < 1) return 'Waning Crescent';
  return 'Unknown';
};

export const fetchWeatherData = async (lat, lon, date, timeOfDay) => {
  const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=imperial&appid=${OPEN_WEATHER_MAP_API_KEY}`;
  const response = await axios.get(weatherUrl);
  if (isDebug) {
    logger.log('Weather API Response:', JSON.stringify(response.data, null, 2));
  }

  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);

  const selectedLocal = new Date(`${date}T00:00:00`);
  selectedLocal.setHours(0, 0, 0, 0);

  const maxDateLocal = new Date(todayLocal);
  maxDateLocal.setDate(todayLocal.getDate() + 7);

  if (!validateDate(selectedLocal, todayLocal, maxDateLocal)) {
    throw new Error('Date must be within 7 days from today.');
  }

  const dailyForecasts = response.data.daily;
  const hourlyForecasts = response.data.hourly;
  const dayOffset = Math.floor((selectedLocal - todayLocal) / (1000 * 60 * 60 * 24));
  if (isDebug) {
    logger.log('Day offset:', dayOffset, 'Selected date:', selectedLocal.toISOString().split('T')[0]);
  }

  let dailyForecast = dailyForecasts[dayOffset] || dailyForecasts[dailyForecasts.length - 1];
  if (!dailyForecast) {
    throw new Error('No forecast available for the selected date.');
  }

  // Determine the target hour based on timeOfDay
  let targetHour;
  switch (timeOfDay) {
    case 'Morning':
      targetHour = 9; // 9 AM
      break;
    case 'Afternoon':
      targetHour = 15; // 3 PM
      break;
    case 'Evening':
      targetHour = 18; // 6 PM
      break;
    case 'Night':
      targetHour = 21; // 9 PM
      break;
    default:
      targetHour = 12; // Noon as fallback
  }

  // Find the closest hourly forecast for the selected date and time
  let hourlyForecast = null;
  if (hourlyForecasts && hourlyForecasts.length > 0) {
    const targetDateTime = new Date(selectedLocal);
    targetDateTime.setHours(targetHour, 0, 0, 0);
    const targetUnixTime = Math.floor(targetDateTime.getTime() / 1000);

    hourlyForecast = hourlyForecasts.reduce((closest, forecast) => {
      const forecastTime = forecast.dt;
      const closestTime = closest ? closest.dt : Infinity;
      return Math.abs(forecastTime - targetUnixTime) < Math.abs(closestTime - targetUnixTime) ? forecast : closest;
    }, null);
  }

  // Calculate 3-day temperature trend (if available)
  let tempTrend = 'Stable';
  if (dayOffset >= 2 && dailyForecasts.length >= 3) {
    const tempToday = dailyForecast.temp.max;
    const tempYesterday = dailyForecasts[dayOffset - 1]?.temp.max || tempToday;
    const tempTwoDaysAgo = dailyForecasts[dayOffset - 2]?.temp.max || tempYesterday;
    if (tempToday > tempYesterday && tempYesterday > tempTwoDaysAgo) {
      tempTrend = 'Warming';
    } else if (tempToday < tempYesterday && tempYesterday < tempTwoDaysAgo) {
      tempTrend = 'Cooling';
    }
  }

  const moonPhase = getMoonPhaseName(dailyForecast.moon_phase);
  const forecastMetrics = {
    lowTempF: dailyForecast.temp?.min ?? 0,
    highTempF: dailyForecast.temp?.max ?? 0,
    totalPrecipIn: dailyForecast.rain ?? 0,
    precipProbability: dailyForecast.pop ? dailyForecast.pop * 100 : 0, // Add precipitation probability
    avgWindMph: hourlyForecast?.wind_speed ?? dailyForecast.wind_speed ?? 0,
    windDeg: hourlyForecast?.wind_deg ?? dailyForecast.wind_deg ?? 0,
    pressureHpa: hourlyForecast?.pressure ?? dailyForecast.pressure ?? 1013,
    moonPhase: moonPhase,
    cloudCover: hourlyForecast?.clouds ?? dailyForecast.clouds ?? 0,
    humidity: hourlyForecast?.humidity ?? dailyForecast.humidity ?? 0,
    tempTrend: tempTrend,
    hourlyTempF: hourlyForecast?.temp ?? null, // Temperature at specific time
  };

  if (isDebug) {
    logger.log('Forecast Metrics:', forecastMetrics);
  }

  return { forecastMetrics, dailyForecasts, hourlyForecasts };
};