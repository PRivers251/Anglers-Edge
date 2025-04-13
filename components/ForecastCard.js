// components/ForecastCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import { ResultsStyles } from '../styles/ResultsStyles';

const ForecastCard = ({ forecastMetrics, error }) => {
  if (error) {
    return <Text style={ResultsStyles.errorText}>Error: {error}</Text>;
  }

  if (!forecastMetrics) {
    return <Text style={ResultsStyles.errorText}>Unable to load forecast data.</Text>;
  }

  return (
    <View style={ResultsStyles.forecastCard}>
      <View style={ResultsStyles.cardContent}>
        <Text style={ResultsStyles.forecastField}>
          <Text style={GlobalStyles.label}>Pressure: </Text>
          {forecastMetrics.pressureHpa} hPa
        </Text>
        <Text style={ResultsStyles.forecastField}>
          <Text style={GlobalStyles.label}>Wind: </Text>
          {forecastMetrics.avgWindMph} mph ({forecastMetrics.windDeg}°)
        </Text>
        <Text style={ResultsStyles.forecastField}>
          <Text style={GlobalStyles.label}>Cloud Cover: </Text>
          {forecastMetrics.cloudCover}%
        </Text>
      </View>
    </View>
  );
};

export default ForecastCard;