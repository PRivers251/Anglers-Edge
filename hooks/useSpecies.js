// File: src/hooks/useSpecies.js
import { useState, useCallback } from 'react';
import { getSpeciesListFromAI } from '../services/adviceService';
import { fetchLocationAndWeather } from '../services/locationService';
import { Alert } from 'react-native';
import { debounce } from '../utils/debounce';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

export const useSpecies = () => {
  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [speciesList, setSpeciesList] = useState([]);
  const [isFetchingSpecies, setIsFetchingSpecies] = useState(false);

  const handleFetchSpecies = useCallback(
    debounce(async (useCurrentLocation, cityState, manualCity, manualState, location) => {
      if (isFetchingSpecies) {
        if (isDebug) logger.log('Skipping handleFetchSpecies: already fetching');
        return null;
      }

      setIsFetchingSpecies(true);
      const targetCityState = useCurrentLocation ? cityState : `${manualCity}, ${manualState}`.trim();
      
      if (!targetCityState || targetCityState === ',') {
        if (isDebug) logger.log('No valid targetCityState for species fetch');
        Alert.alert('Error', 'No location specified. Please select a location to fetch species.');
        setSpeciesList([]);
        setIsFetchingSpecies(false);
        return null;
      }

      let loc = useCurrentLocation ? location : null;
      if (!useCurrentLocation) {
        const result = await fetchLocationAndWeather(false, targetCityState, null);
        loc = result.loc;
        if (!loc?.coords) {
          if (isDebug) logger.log('Failed to resolve manual location coords');
          Alert.alert('Error', 'Failed to resolve location coordinates. Please try a different city or state.');
          setSpeciesList([]);
          setIsFetchingSpecies(false);
          return null;
        }
      }

      if (!loc?.coords) {
        if (isDebug) logger.log('No valid location coords for species fetch');
        Alert.alert('Error', 'Location data unavailable. Please try again.');
        setSpeciesList([]);
        setIsFetchingSpecies(false);
        return null;
      }

      try {
        if (isDebug) {
          logger.log('Fetching species list for:', targetCityState);
        }
        const speciesData = await getSpeciesListFromAI(targetCityState);
        const newSpeciesList = [...speciesData, 'Other'];
        setSpeciesList(newSpeciesList);
        setSpecies('');
        setCustomSpecies('');
        return loc;
      } catch (error) {
        if (isDebug) {
          logger.error('Failed to fetch species list:', error.message);
        }
        Alert.alert('Error', 'Failed to fetch species list. Using a default list instead.');
        const fallbackSpecies = await getSpeciesListFromAI('Location unavailable');
        setSpeciesList([...fallbackSpecies, 'Other']);
        setCustomSpecies('');
        return null;
      } finally {
        setIsFetchingSpecies(false);
      }
    }, 500),
    []
  );

  return {
    species,
    setSpecies,
    customSpecies,
    setCustomSpecies,
    speciesList,
    isFetchingSpecies,
    handleFetchSpecies,
  };
};