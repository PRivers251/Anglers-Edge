import React from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/styles'; // Updated path

const SpeciesPicker = ({
  species,
  setSpecies,
  customSpecies,
  setCustomSpecies,
  speciesList,
  isFetchingSpecies
}) => (
  <View style={styles.speciesSection}>
    {isFetchingSpecies ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : speciesList.length === 0 ? (
      <Text style={styles.placeholder}>Select location and press <Text style={styles.getSpecies}>Get Species</Text> to load options.</Text>
    ) : (
      <>
        <Text style={styles.label}>Select Target Species:</Text>
        <Picker
          selectedValue={species}
          onValueChange={setSpecies}
          style={styles.picker}
        >
          {speciesList.map((sp) => (
            <Picker.Item key={sp} label={sp} value={sp} color="#333" />
          ))}
        </Picker>
        {species === 'Other' && (
          <TextInput
            style={styles.input}
            placeholder="Enter custom species"
            value={customSpecies}
            onChangeText={setCustomSpecies}
            placeholderTextColor="#888"
          />
        )}
      </>
    )}
  </View>
);

export default SpeciesPicker;