// app/results.js
import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { formatDate } from '../utils/dateUtils';
import { GlobalStyles } from '../styles/GlobalStyles';
import { ResultsStyles } from '../styles/ResultsStyles';
import { useFishingData } from '../hooks/useFishingData';
import { supabase } from '../services/supabaseClient';
import AlertModal from '../components/AlertModal'; // Import the modal component

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const location = useMemo(() => (params.location ? JSON.parse(params.location) : null), [params.location]);
  const weatherData = useMemo(() => (params.weatherData ? JSON.parse(params.weatherData) : null), [params.weatherData]);
  const { species, cityState, date, timeOfDay } = params;

  const { advice, forecastData, waterData, tempRange, loading, error } = useFishingData(
    location,
    species,
    cityState,
    date,
    weatherData,
    timeOfDay
  );

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  const handleFeedback = async (wasHelpful) => {
    try {
      const { error } = await supabase.from('feedback').insert([
        {
          user_id: (await supabase.auth.getUser()).data.user.id,
          species: species,
          city_state: cityState,
          date: date,
          time_of_day: timeOfDay,
          advice: advice,
          was_helpful: wasHelpful,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      setFeedbackSubmitted(true);
      showAlert('Thank You', 'Your feedback has been submitted!');
    } catch (error) {
      console.error('Feedback Error:', error.message);
      showAlert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  if (loading) {
    return (
      <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={GlobalStyles.background}>
        <View style={GlobalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </ImageBackground>
    );
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  return (
    <ImageBackground source={require('assets/angler-casting-reel-into-water.png')} style={GlobalStyles.background}>
      <ScrollView style={GlobalStyles.container}>
        <View style={GlobalStyles.header}>
          <Text style={GlobalStyles.title}>Fishing Advice for {cityState} - {species || 'Unknown Species'}</Text>
        </View>
        <View style={ResultsStyles.forecastSection}>
          {forecastData?.forecastMetrics ? (
            <View style={ResultsStyles.forecastCard}>
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Date: </Text>{formatDate(date)} ({timeOfDay})
              </Text>
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Temperature: </Text>
                {forecastData.forecastMetrics.lowTempF !== undefined && forecastData.forecastMetrics.highTempF !== undefined
                  ? `${Math.round(forecastData.forecastMetrics.lowTempF)}–${Math.round(forecastData.forecastMetrics.highTempF)}°F`
                  : 'N/A'}
              </Text>
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Temp Trend: </Text>
                {forecastData.forecastMetrics.tempTrend || 'N/A'}
              </Text>
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Precipitation: </Text>
                {forecastData.forecastMetrics.totalPrecipIn !== undefined
                  ? `${Math.round(forecastData.forecastMetrics.totalPrecipIn)} in`
                  : 'N/A'}
              </Text>
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Wind Speed: </Text>
                {forecastData.forecastMetrics.avgWindMph !== undefined
                  ? `${Math.round(forecastData.forecastMetrics.avgWindMph)} mph`
                  : 'N/A'}
              </Text>
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Cloud Cover: </Text>
                {forecastData.forecastMetrics.cloudCover !== undefined
                  ? `${forecastData.forecastMetrics.cloudCover}% `
                  : 'N/A '}
                ({forecastData.forecastMetrics.cloudCover !== undefined
                  ? forecastData.forecastMetrics.cloudCover >= 70
                    ? 'Overcast'
                    : forecastData.forecastMetrics.cloudCover >= 30
                    ? 'Partly Cloudy'
                    : 'Clear'
                  : 'N/A'})
              </Text>
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Humidity: </Text>
                {forecastData.forecastMetrics.humidity !== undefined
                  ? `${forecastData.forecastMetrics.humidity}%`
                  : 'N/A'}
              </Text>
              {waterData?.waterTempF && (
                <Text style={ResultsStyles.forecastField}>
                  <Text style={GlobalStyles.label}>Water Temp: </Text>
                  {waterData.waterTempF.toFixed(1)}°F {parsedDate > new Date() ? '(forecasted)' : ''}
                </Text>
              )}
              {waterData?.gageHeightFt && (
                <Text style={ResultsStyles.forecastField}>
                  <Text style={GlobalStyles.label}>Water Level: </Text>
                  {waterData.gageHeightFt.toFixed(1)} ft {parsedDate > new Date() ? '(forecasted)' : ''}
                </Text>
              )}
              {waterData?.clarity && (
                <Text style={ResultsStyles.forecastField}>
                  <Text style={GlobalStyles.label}>Water Clarity: </Text>{waterData.clarity}
                </Text>
              )}
              {waterData?.flowRateCfs && (
                <Text style={ResultsStyles.forecastField}>
                  <Text style={GlobalStyles.label}>Flow Rate: </Text>{waterData.flowRateCfs} CFS
                </Text>
              )}
              <Text style={ResultsStyles.forecastField}>
                <Text style={GlobalStyles.label}>Fishing Conditions: </Text>
                {'★'.repeat(forecastData.forecastMetrics.rating)}{'☆'.repeat(5 - forecastData.forecastMetrics.rating)}
              </Text>
            </View>
          ) : error ? (
            <Text style={ResultsStyles.errorText}>Error: {error}</Text>
          ) : (
            <Text style={ResultsStyles.errorText}>Unable to load forecast data.</Text>
          )}
        </View>
        <View style={GlobalStyles.content}>
          <View style={ResultsStyles.adviceSection}>
            <View style={ResultsStyles.adviceCard}>
              {advice && (
                <>
                  <Text style={ResultsStyles.field}><Text style={GlobalStyles.label}>Bait: </Text>{advice.bait || 'Not specified'}</Text>
                  <Text style={ResultsStyles.field}><Text style={GlobalStyles.label}>Strategy: </Text>{advice.strategy || 'Not specified'}</Text>
                  {advice.tackle && (
                    <Text style={ResultsStyles.field}>
                      <Text style={GlobalStyles.label}>Tackle: </Text>
                      Rod: {advice.tackle.rod || 'Not specified'}, Line: {advice.tackle.line || 'Not specified'}
                    </Text>
                  )}
                  {advice.additional_notes && (
                    <Text style={ResultsStyles.field}><Text style={GlobalStyles.label}>Additional Notes: </Text>{advice.additional_notes}</Text>
                  )}
                </>
              )}
            </View>
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
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
      />
    </ImageBackground>
  );
}