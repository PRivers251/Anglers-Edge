import { useState } from 'react';
import { useRouter } from 'expo-router';

export const useFormSubmission = (location, species, customSpecies, cityState, weatherData, date, timeOfDay) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading || !location?.coords || !timeOfDay) return;
    setIsLoading(true);
    const finalSpecies = species === 'Other' ? customSpecies : species;
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    const formattedDate = localDate.toISOString().split('T')[0];

    const simplifiedLocation = {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };

    const simplifiedWeatherData = weatherData
      ? {
          lowTempF: Math.round((parseFloat(weatherData.avgTemp) * 9) / 5 + 32 - 5),
          highTempF: Math.round((parseFloat(weatherData.avgTemp) * 9) / 5 + 32 + 5),
          totalPrecipIn: Math.round(parseFloat(weatherData.totalPrecip) / 25.4),
          avgWindMph: Math.round(parseFloat(weatherData.avgWind) * 0.621371),
          windDeg: 0,
          pressureHpa: 1013,
          moonPhase: "Unknown",
          cloudCover: 0,
          humidity: 50,
          tempTrend: "Stable",
        }
      : null;

    try {
      router.push({
        pathname: '/results',
        params: {
          location: JSON.stringify(simplifiedLocation),
          species: finalSpecies,
          cityState,
          weatherData: simplifiedWeatherData ? JSON.stringify(simplifiedWeatherData) : null,
          date: formattedDate,
          timeOfDay: timeOfDay,
        },
      });
    } catch (error) {
      console.error('Navigation Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSubmit };
};