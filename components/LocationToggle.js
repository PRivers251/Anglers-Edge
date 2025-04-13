import React from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import { LocationToggleStyles } from '../styles/LocationToggleStyles';

const LocationToggle = ({
  useCurrentLocation,
  setUseCurrentLocation,
  cityState,
  manualCity,
  manualState,
  setManualCity,
  setManualState,
  isFetchingSpecies,
  isFetchingLocation,
  handleFetchSpecies,
}) => {
  const isButtonDisabled = useCurrentLocation
    ? isFetchingSpecies || isFetchingLocation || cityState === 'Location unavailable' || cityState === 'Location permission denied'
    : isFetchingSpecies || !manualCity || !manualState;

  return (
    <View style={[LocationToggleStyles.locationSection]}>
      <Text style={GlobalStyles.label}>Where are you going fishing?</Text>
      <View style={LocationToggleStyles.manualLocationContainer}>
        {useCurrentLocation && (
          <Text style={LocationToggleStyles.locationText}>
            {isFetchingLocation ? 'Fetching location...' : (cityState || 'Location not available')}
          </Text>
        )}
        <TextInput
          style={[LocationToggleStyles.input, useCurrentLocation && { opacity: 0.5 }]}
          placeholder="City"
          value={manualCity}
          onChangeText={setManualCity}
          placeholderTextColor="#999"
          editable={!useCurrentLocation} // Disable when using current location
        />
        <TextInput
          style={[LocationToggleStyles.input, useCurrentLocation && { opacity: 0.5 }]}
          placeholder="State (e.g., AL)"
          value={manualState}
          onChangeText={setManualState}
          placeholderTextColor="#999"
          editable={!useCurrentLocation} // Disable when using current location
        />
        <View style={LocationToggleStyles.toggleContainer}>
          <Text style={LocationToggleStyles.toggleLabel}>Use Current Location</Text>
          <Switch
            value={useCurrentLocation}
            onValueChange={setUseCurrentLocation}
            trackColor={{ false: '#767577', true: '#00CED1' }}
            thumbColor={useCurrentLocation ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>
      <View style={[GlobalStyles.buttonContainer, GlobalStyles.buttonSectionContainer]}>
        <TouchableOpacity
          style={[GlobalStyles.customButton, isButtonDisabled && GlobalStyles.disabledButton]}
          onPress={handleFetchSpecies}
          disabled={isButtonDisabled}
        >
          <Text style={GlobalStyles.buttonText}>
            {isFetchingSpecies ? 'Loading...' : 'Get Species'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationToggle;