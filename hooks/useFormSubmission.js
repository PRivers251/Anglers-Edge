// File: src/hooks/useFormSubmission.js
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

export const useFormSubmission = (location, species, customSpecies, cityState, date, timeOfDay, fishingType) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading || !location?.coords || !cityState || !timeOfDay || !fishingType) {
      if (isDebug) {
        logger.log('Submit blocked:', {
          hasLocation: !!location?.coords,
          hasCityState: !!cityState,
          hasTimeOfDay: !!timeOfDay,
          hasFishingType: !!fishingType,
        });
      }
      return;
    }
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

    if (isDebug) {
      logger.log('Submitting form with:', {
        cityState,
        finalSpecies,
        formattedDate,
        timeOfDay,
        fishingType,
        location: simplifiedLocation,
      });
    }

    try {
      router.push({
        pathname: '/results',
        params: {
          location: JSON.stringify(simplifiedLocation),
          species: finalSpecies || 'None',
          cityState,
          date: formattedDate,
          timeOfDay,
          fishingType,
        },
      });
    } catch (error) {
      if (isDebug) logger.error('Navigation error:', error.message);
      Alert.alert('Error', 'Failed to navigate to results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSubmit };
};