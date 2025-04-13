import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import { DateSelectorStyles } from '../styles/DateSelectorStyles';

const DateSelector = ({ date, setDate, timeOfDay, setTimeOfDay }) => {
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  maxDate.setHours(0, 0, 0, 0);

  const [modalVisible, setModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const timeOptions = ['Morning', 'Midday', 'Evening'];
  const [timeIndex, setTimeIndex] = useState(timeOptions.indexOf(timeOfDay));

  const adjustDate = (days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    newDate.setHours(0, 0, 0, 0);
    if (newDate >= minDate && newDate <= maxDate) {
      setDate(newDate);
    }
  };

  const adjustTime = (direction) => {
    let newIndex = timeIndex + direction;
    if (newIndex < 0) newIndex = timeOptions.length - 1;
    if (newIndex >= timeOptions.length) newIndex = 0;
    setTimeIndex(newIndex);
    setTimeOfDay(timeOptions[newIndex]);
  };

  const formatDateDisplay = (d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getAvailableDates = () => {
    const dates = [];
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleSelectDate = (selectedDate) => {
    setDate(selectedDate);
    setModalVisible(false);
  };

  const handleSelectTime = (selectedTime) => {
    setTimeOfDay(selectedTime);
    setTimeIndex(timeOptions.indexOf(selectedTime));
    setTimeModalVisible(false);
  };


  return (
    <View style={DateSelectorStyles.dateSection}>
      <Text style={GlobalStyles.label}>Select Fishing Trip Date and Time</Text>
      <View style={[DateSelectorStyles.dateButtonContainer, DateSelectorStyles.selectorContainer]}>
        <TouchableOpacity
          style={[
            DateSelectorStyles.dateArrowButton,
            date <= minDate && GlobalStyles.disabledButton,
          ]}
          onPress={() => adjustDate(-1)}
          disabled={date <= minDate}
        >
          <Text style={GlobalStyles.buttonText}>◄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[DateSelectorStyles.dateDisplay, DateSelectorStyles.selectorDisplay]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={DateSelectorStyles.dateText}>{formatDateDisplay(date)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            DateSelectorStyles.dateArrowButton,
            date >= maxDate && GlobalStyles.disabledButton,
          ]}
          onPress={() => adjustDate(1)}
          disabled={date >= maxDate}
        >
          <Text style={GlobalStyles.buttonText}>►</Text>
        </TouchableOpacity>
      </View>

      <View style={[DateSelectorStyles.dateButtonContainer, DateSelectorStyles.selectorContainer, DateSelectorStyles.timeSelectorContainer]}>
        <TouchableOpacity
          style={[
            DateSelectorStyles.dateArrowButton,
            timeIndex === 0 && GlobalStyles.disabledButton,
          ]}
          onPress={() => adjustTime(-1)}
          disabled={timeIndex === 0}
        >
          <Text style={GlobalStyles.buttonText}>◄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[DateSelectorStyles.dateDisplay, DateSelectorStyles.selectorDisplay]}
          onPress={() => setTimeModalVisible(true)}
        >
          <Text style={DateSelectorStyles.dateText}>{timeOfDay}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            DateSelectorStyles.dateArrowButton,
            timeIndex === timeOptions.length - 1 && GlobalStyles.disabledButton,
          ]}
          onPress={() => adjustTime(1)}
          disabled={timeIndex === timeOptions.length - 1}
        >
          <Text style={GlobalStyles.buttonText}>►</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={GlobalStyles.modalContent}>
            <FlatList
              data={availableDates}
              keyExtractor={(item) => item.toISOString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    GlobalStyles.dateItem,
                    item.toDateString() === date.toDateString() && GlobalStyles.selectedDateItem,
                  ]}
                  onPress={() => handleSelectDate(item)}
                >
                  <Text
                    style={[
                      GlobalStyles.dateItemText,
                      item.toDateString() === date.toDateString() && GlobalStyles.selectedDateItemText,
                    ]}
                  >
                    {formatDateDisplay(item)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={GlobalStyles.customButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={GlobalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={timeModalVisible}
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={GlobalStyles.modalContent}>
            <FlatList
              data={timeOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    GlobalStyles.dropdownItem,
                    item === timeOfDay && GlobalStyles.selectedDateItem,
                  ]}
                  onPress={() => handleSelectTime(item)}
                >
                  <Text
                    style={[
                      GlobalStyles.dropdownItemText,
                      item === timeOfDay && GlobalStyles.selectedDateItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={GlobalStyles.customButton}
              onPress={() => setTimeModalVisible(false)}
            >
              <Text style={GlobalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DateSelector;