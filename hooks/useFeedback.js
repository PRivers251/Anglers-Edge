// hooks/useFeedback.js
import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const useFeedback = (species, cityState, date, timeOfDay, advice) => {
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
          species,
          city_state: cityState,
          date,
          time_of_day: timeOfDay,
          advice,
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

  return {
    feedbackSubmitted,
    alertVisible,
    alertTitle,
    alertMessage,
    handleFeedback,
    showAlert,
    closeAlert,
  };
};