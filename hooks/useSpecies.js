// hooks/useSpecies.js
import { useState } from 'react';
import { getSpeciesListFromAI } from '../services/adviceService';
import { fetchLocationAndWeather } from '../services/locationService';

export const useSpecies = () => {
  const [species, setSpecies] = useState('');
  const [customSpecies, setCustomSpecies] = useState('');
  const [speciesList, setSpeciesList] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [isFetchingSpecies, setIsFetchingSpecies] = useState(false);

  const handleFetchSpecies = async (useCurrentLocation, cityState, manualCity, manualState, location) => {
    setIsFetchingSpecies(true);
    const targetCityState = useCurrentLocation ? cityState : `${manualCity}, ${manualState}`;
    if (!targetCityState) {
      console.error('No location specified');
      setSpeciesList([]);
      setIsFetchingSpecies(false);
      return null;
    }

    let loc = useCurrentLocation ? location : null;
    if (!useCurrentLocation) {
      const result = await fetchLocationAndWeather(false, targetCityState, null);
      loc = result.loc;
      console.log('Manual location result:', loc);
      if (!loc?.coords) {
        console.error('Failed to resolve location coordinates:', { targetCityState, manualCity, manualState });
        setSpeciesList([]);
        setIsFetchingSpecies(false);
        return null;
      }
    }

    try {
      const weather = useCurrentLocation
        ? (await fetchLocationAndWeather(true, targetCityState, loc)).weather
        : null;
      setWeatherData(weather);
      const speciesData = await getSpeciesListFromAI(targetCityState);
      const newSpeciesList = [...speciesData, 'Other'];
      setSpeciesList(newSpeciesList);
      setSpecies('');
      setCustomSpecies('');
      console.log('New species list:', newSpeciesList);
      return loc;
    } catch (error) {
      console.error('Fetch Error:', error.message);
      const fallbackSpecies = await getSpeciesListFromAI('Location unavailable');
      setSpeciesList([...fallbackSpecies, 'Other']);
      setWeatherData(null);
      setCustomSpecies('');
      return null;
    } finally {
      setIsFetchingSpecies(false);
    }
  };

  return {
    species,
    setSpecies,
    customSpecies,
    setCustomSpecies,
    speciesList,
    weatherData,
    isFetchingSpecies,
    handleFetchSpecies,
  };
};