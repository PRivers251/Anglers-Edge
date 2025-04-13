import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export const useFormSubmission = (location, species, customSpecies, cityState, date, timeOfDay) => {
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

    try {
      router.push({
        pathname: '/results',
        params: {
          location: JSON.stringify(simplifiedLocation),
          species: finalSpecies,
          cityState,
          date: formattedDate,
          timeOfDay: timeOfDay,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to navigate to results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSubmit };
};