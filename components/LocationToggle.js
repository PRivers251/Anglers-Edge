import React from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity } from 'react-native';
import styles from 'styles/styles';

const LocationToggle = ({
  useCurrentLocation,
  setUseCurrentLocation,
  cityState,
  manualCity,
  manualState,
  setManualCity,
  setManualState,
  isFetchingSpecies,
  isFetchingLocation, // New prop
  handleFetchSpecies,
}) => {
  const handleToggle = () => {
    setUseCurrentLocation(!useCurrentLocation);
    if (useCurrentLocation) {
      setManualCity('');
      setManualState('');
    }
  };

  return (
    <View style={styles.locationSection}>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Use Current Location:</Text>
        <Switch
          onValueChange={handleToggle}
          value={useCurrentLocation}
          trackColor={{ false: '#00CED1', true: '#00CED1' }}
        />
      </View>
      {useCurrentLocation ? (
        <Text style={styles.locationText}>
          {cityState || 'Fetching location...'}
        </Text>
      ) : (
        <View style={styles.manualLocationContainer}>
          <TextInput
            style={styles.input}
            placeholder="City (e.g., Citronelle)"
            placeholderTextColor="#999"
            value={manualCity}
            onChangeText={setManualCity}
          />
          <TextInput
            style={styles.input}
            placeholder="State/Province (e.g., AL)"
            placeholderTextColor="#999"
            value={manualState}
            onChangeText={setManualState}
          />
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.customButton,
          (isFetchingSpecies || isFetchingLocation || (!useCurrentLocation && (!manualCity || !manualState))) && styles.disabledButton,
        ]}
        onPress={handleFetchSpecies}
        disabled={isFetchingSpecies || isFetchingLocation || (!useCurrentLocation && (!manualCity || !manualState))}
      >
        <Text style={styles.buttonText}>
          {isFetchingSpecies || isFetchingLocation ? 'Loading...' : 'Get Species'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationToggle;