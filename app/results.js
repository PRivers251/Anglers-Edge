// File: src/screens/results.js
import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, ImageBackground, TouchableOpacity, Text, Image } from 'react-native';
import { formatDate } from '../utils/dateUtils';
import { GlobalStyles } from '../styles/GlobalStyles';
import { ResultsStyles } from '../styles/ResultsStyles';
import { useFishingData } from '../hooks/useFishingData';
import { useFeedback } from '../hooks/useFeedback';
import AlertModal from '../components/AlertModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import AdviceCard from '../components/AdviceCard';
import ForecastCard from '../components/ForecastCard';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const location = useMemo(() => (params.location ? JSON.parse(params.location) : null), [params.location]);
  const { species, cityState, date, timeOfDay, fishingType } = params;

  if (isDebug) {
    logger.log('ResultsScreen params:', { cityState, species, date, timeOfDay, fishingType });
  }

  const { advice, forecastData, loading, error } = useFishingData(
    location,
    species,
    cityState,
    date,
    timeOfDay,
    fishingType
  );

  const {
    feedbackSubmitted,
    alertVisible,
    alertTitle,
    alertMessage,
    handleFeedback,
    closeAlert,
  } = useFeedback(species, cityState, date, timeOfDay, advice);

  const showLoading = useMinimumLoading(loading, 1000);

  const weatherConditionIcon = useMemo(() => {
    if (!forecastData?.dailyForecasts || !forecastData.dailyForecasts.length) {
      return null;
    }

    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const selectedLocal = new Date(`${date}T00:00:00`);
    selectedLocal.setHours(0, 0, 0, 0);
    const dayOffset = Math.floor((selectedLocal - todayLocal) / (1000 * 60 * 60 * 24));
    const dailyForecast = forecastData.dailyForecasts[dayOffset] || forecastData.dailyForecasts[forecastData.dailyForecasts.length - 1];

    if (!dailyForecast?.weather?.[0]?.main) {
      return null;
    }

    const condition = dailyForecast.weather[0].main.toLowerCase();
    const isDaytime = timeOfDay === 'Morning' || timeOfDay === 'Afternoon';

    switch (condition) {
      case 'clear':
        return isDaytime ? require('../assets/weatherIcons/day_clear.png') : require('../assets/weatherIcons/night_clear.png');
      case 'clouds':
        return require('../assets/weatherIcons/cloudy.png');
      case 'rain':
      case 'drizzle':
        return require('../assets/weatherIcons/rain.png');
      case 'snow':
        return require('../assets/weatherIcons/snow.png');
      case 'thunderstorm':
        return require('../assets/weatherIcons/thunderstorm.png');
      default:
        return require('../assets/weatherIcons/foggy.png');
    }
  }, [forecastData, date, timeOfDay]);

  const rainChance = useMemo(() => {
    if (!forecastData?.forecastMetrics) {
      return null;
    }
    return forecastData.forecastMetrics.precipProbability
      ? Math.round(forecastData.forecastMetrics.precipProbability)
      : null;
  }, [forecastData]);

  const avgTemp = useMemo(() => {
    if (!forecastData?.forecastMetrics) return null;

    if (forecastData.forecastMetrics.hourlyTempF) {
      return Math.round(forecastData.forecastMetrics.hourlyTempF);
    }

    const { lowTempF, highTempF } = forecastData.forecastMetrics;
    const range = highTempF - lowTempF;

    let factor;
    switch (timeOfDay) {
      case 'Morning':
        factor = 0.25;
        break;
      case 'Afternoon':
        factor = 0.75;
        break;
      case 'Evening':
        factor = 0.50;
        break;
      case 'Night':
        factor = 0.10;
        break;
      default:
        factor = 0.50;
    }

    const avg = lowTempF + (range * factor);
    return Math.round(avg);
  }, [forecastData, timeOfDay]);

  if (showLoading) {
    return (
      <ImageBackground source={require('../assets/angler-casting-reel-into-water.png')} style={GlobalStyles.background}>
        <LoadingSpinner />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../assets/angler-casting-reel-into-water.png')} style={GlobalStyles.background}>
      <ScrollView style={GlobalStyles.container}>
        <View style={GlobalStyles.header}>
          <Text style={GlobalStyles.title}>{formatDate(date)}</Text>
          <Text style={ResultsStyles.subtitle}>
            {species || 'Recommended Species'} {fishingType} Fishing in {cityState || 'Unknown Location'}
          </Text>
        </View>
        {forecastData?.forecastMetrics && (
          <View style={ResultsStyles.temperatureSection}>
            <View style={ResultsStyles.temperatureContainer}>
              <View style={ResultsStyles.tempIconRow}>
                <Text style={ResultsStyles.temperatureText}>
                  {avgTemp !== null ? `${avgTemp}°F` : 'N/A'}
                </Text>
                {weatherConditionIcon && (
                  <Image
                    source={weatherConditionIcon}
                    style={ResultsStyles.weatherIcon}
                  />
                )}
              </View>
              <View style={ResultsStyles.tempSubtitleContainer}>
                <Text style={ResultsStyles.tempRangeSubtitle}>
                  High: {Math.round(forecastData.forecastMetrics.highTempF)}°F  -  Low: {Math.round(forecastData.forecastMetrics.lowTempF)}°F
                </Text>
                {weatherConditionIcon?.toString().includes('rain.png') && rainChance !== null && (
                  <Text style={ResultsStyles.tempRangeSubtitle}>
                    Rain Chance: {rainChance}%
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        <View style={ResultsStyles.forecastSection}>
          <ForecastCard
            forecastMetrics={
              forecastData?.forecastMetrics
                ? {
                    ...forecastData.forecastMetrics,
                    lowTempF: undefined,
                    highTempF: undefined,
                    hourlyTempF: undefined,
                  }
                : null
            }
            error={error}
          />
        </View>
        <View style={GlobalStyles.content}>
          <View style={ResultsStyles.adviceSection}>
            {advice && (
              <>
                <AdviceCard
                  title="Tackle Recommendations"
                  content={[
                    `Rod: ${advice.tackle?.rod || 'Not specified'}`,
                    `Line: ${advice.tackle?.line || 'Not specified'}`,
                  ]}
                />
                <AdviceCard title="Bait" content={advice.bait || 'Not specified'} />
                <AdviceCard
                  title="Strategy"
                  content={
                    advice.strategy || advice.additional_notes
                      ? `${advice.strategy || ''} ${advice.additional_notes || ''}`.trim()
                      : 'Not specified'
                  }
                />
              </>
            )}
            {!feedbackSubmitted && (
              <View style={ResultsStyles.feedbackSection}>
                <Text style={ResultsStyles.feedbackLabel}>Was this advice helpful?</Text>
                <View style={ResultsStyles.feedbackButtonContainer}>
                  <TouchableOpacity
                    style={[GlobalStyles.customButton, ResultsStyles.feedbackButton]}
                    onPress={() => handleFeedback(true)}
                  >
                    <Text style={GlobalStyles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[GlobalStyles.customButton, ResultsStyles.feedbackButton]}
                    onPress={() => handleFeedback(false)}
                  >
                    <Text style={GlobalStyles.buttonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity style={GlobalStyles.backButton} onPress={() => router.back()}>
            <Text style={GlobalStyles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AlertModal visible={alertVisible} title={alertTitle} message={alertMessage} onClose={closeAlert} />
    </ImageBackground>
  );
}