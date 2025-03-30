import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from 'styles/styles';
import { Platform } from 'react-native';

const DateSelector = ({ date, setDate }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    // Normalize to midnight
    const normalizedDate = new Date(currentDate);
    normalizedDate.setHours(0, 0, 0, 0);
    console.log('Selected Date (DateSelector):', normalizedDate.toISOString().split('T')[0]);
    setShowDatePicker(false);
    setDate(normalizedDate);
  };

  return (
    <View style={styles.dateSection}>
      <Text style={styles.label}>Select Fishing Trip Date:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Selected Date: {date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <View style={styles.pickerOverlay}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
            maximumDate={new Date(new Date().setDate(new Date().getDate() + 7))}
            textColor="#fff"
          />
        </View>
      )}
    </View>
  );
};

export default DateSelector;