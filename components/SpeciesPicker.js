import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import { SpeciesPickerStyles } from '../styles/SpeciesPickerStyles';
import { LocationToggleStyles } from '../styles/LocationToggleStyles';

const SpeciesPicker = ({
  species,
  setSpecies,
  customSpecies,
  setCustomSpecies,
  speciesList,
  isFetchingSpecies,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleSelectSpecies = (selectedSpecies) => {
    setSpecies(selectedSpecies);
    setModalVisible(false);
  };

  console.log('SpeciesPicker Render:', { species, speciesList, isFetchingSpecies });

  return (
    <View style={SpeciesPickerStyles.speciesSection}>
      <Text style={GlobalStyles.label}>Select Species</Text>
      <TouchableOpacity
        style={SpeciesPickerStyles.dropdownButton}
        onPress={() => setModalVisible(true)}
        disabled={isFetchingSpecies || speciesList.length === 0}
      >
        <Text style={SpeciesPickerStyles.dropdownText}>
          {isFetchingSpecies
            ? 'Loading species...'
            : speciesList.length === 0
            ? 'No species available'
            : species || 'Select a species'}
        </Text>
      </TouchableOpacity>

      {species === 'Other' && (
        <TextInput
          style={LocationToggleStyles.input}
          placeholder="Enter custom species"
          value={customSpecies}
          onChangeText={setCustomSpecies}
          placeholderTextColor="#999"
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={GlobalStyles.modalContent}>
            <FlatList
              data={speciesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    GlobalStyles.dropdownItem,
                    item === species && GlobalStyles.selectedDateItem,
                  ]}
                  onPress={() => handleSelectSpecies(item)}
                >
                  <Text
                    style={[
                      GlobalStyles.dropdownItemText,
                      item === species && GlobalStyles.selectedDateItemText,
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

export default SpeciesPicker;