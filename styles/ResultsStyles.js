// styles/ResultsStyles.js
import { StyleSheet } from 'react-native';

export const ResultsStyles = StyleSheet.create({
  forecastSection: { paddingHorizontal: 30, marginTop: 20 },
  adviceSection: { paddingHorizontal: 30, marginVertical: 20 },
  forecastCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: '100%' },
  adviceCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 20 },
  field: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 10 },
  forecastField: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 10 },
  errorText: { fontSize: 16, color: '#fff', textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },

  feedbackSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  feedbackButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  feedbackButton: {
    width: '40%',
  },
});