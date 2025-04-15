// File: src/components/FishingTypePicker.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import { SpeciesPickerStyles } from '../styles/SpeciesPickerStyles';

const FishingTypePicker = ({ fishingType, setFishingType }) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const fishingTypes = ['Inshore', 'Offshore', 'Surf', 'Shore', 'Boat'];

  const handleSelectFishingType = (selectedType) => {
    setFishingType(selectedType);
    setModalVisible(false);
  };

  return (
    <View style={SpeciesPickerStyles.speciesSection}>
      <Text style={GlobalStyles.label}>Select Fishing Type</Text>
      <TouchableOpacity
        style={SpeciesPickerStyles.dropdownButton}
        onPress={() => setModalVisible(true)}
        disabled={fishingTypes.length === 0}
      >
        <Text style={SpeciesPickerStyles.dropdownText}>
          {fishingType || 'Select a fishing type'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={GlobalStyles.modalContent}>
            <FlatList
              data={fishingTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    GlobalStyles.dropdownItem,
                    item === fishingType && GlobalStyles.selectedDateItem,
                  ]}
                  onPress={() => handleSelectFishingType(item)}
                >
                  <Text
                    style={[
                      GlobalStyles.dropdownItemText,
                      item === fishingType && GlobalStyles.selectedDateItemText,
                    ]}
                  >
                    {item}
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
    </View>
  );
};

export default FishingTypePicker;