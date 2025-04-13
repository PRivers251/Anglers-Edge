import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const useFeedback = (species, cityState, date, timeOfDay, advice) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleFeedback = async (isHelpful) => {
    try {
      const { error } = await supabase.from('feedback').insert([
        {
          species,
          location: cityState,
          date,
          time_of_day: timeOfDay,
          advice: JSON.stringify(advice),
          is_helpful: isHelpful,
        },
      ]);

      if (error) {
        setAlertTitle('Error');
        setAlertMessage('Failed to submit feedback. Please try again.');
      } else {
        setAlertTitle('Success');
        setAlertMessage('Thank you for your feedback!');
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      setAlertTitle('Error');
      setAlertMessage('An unexpected error occurred. Please try again.');
    } finally {
      setAlertVisible(true);
    }
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  return {
    feedbackSubmitted,
    alertVisible,
    alertTitle,
    alertMessage,
    handleFeedback,
    closeAlert,
  };
};