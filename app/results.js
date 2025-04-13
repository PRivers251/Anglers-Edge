// app/results.js
import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, ImageBackground, TouchableOpacity, Text } from 'react-native';
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

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const location = useMemo(() => (params.location ? JSON.parse(params.location) : null), [params.location]);
  const weatherData = useMemo(() => (params.weatherData ? JSON.parse(params.weatherData) : null), [params.weatherData]);
  const { species, cityState, date, timeOfDay } = params;

  const { advice, forecastData, loading, error } = useFishingData(
    location,
    species,
    cityState,
    date,
    weatherData,
    timeOfDay
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
            {species || 'Unknown Species'} Fishing in {cityState || 'Unknown Location'}
          </Text>
        </View>
        <View style={ResultsStyles.forecastSection}>
          <ForecastCard forecastMetrics={forecastData?.forecastMetrics} error={error} />
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