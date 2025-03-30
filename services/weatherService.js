import axios from 'axios';
import { OPEN_WEATHER_MAP_API_KEY } from '@env';
import { validateDate } from '../utils/dateUtils';

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

export const fetchWeatherData = async (lat, lon, date) => {
  const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${OPEN_WEATHER_MAP_API_KEY}`;
  const response = await axios.get(weatherUrl);

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
  // Convert selectedLocal to UTC midnight for comparison
  const selectedUtcMidnight = new Date(selectedLocal.getTime() - (selectedLocal.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  
  let dailyForecast = dailyForecasts.find(d => {
    const forecastDate = new Date(d.dt * 1000).toISOString().split('T')[0];
    return forecastDate === selectedUtcMidnight;
  });

  if (!dailyForecast) {
    dailyForecast = dailyForecasts[dailyForecasts.length - 1]; // Fallback to last available
  }

  const moonPhase = getMoonPhaseName(dailyForecast.moon_phase);
  const forecastMetrics = {
    lowTempF: dailyForecast.temp.min,
    highTempF: dailyForecast.temp.max,
    totalPrecipIn: dailyForecast.rain || 0,
    avgWindMph: dailyForecast.wind_speed,
    windDeg: dailyForecast.wind_deg,
    pressureHpa: dailyForecast.pressure,
    moonPhase: moonPhase
  };

  return { forecastMetrics, dailyForecasts };
};