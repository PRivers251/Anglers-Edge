// styles/SpeciesPickerStyles.js
import { StyleSheet } from 'react-native';

export const SpeciesPickerStyles = StyleSheet.create({
  speciesSection: { 
    paddingHorizontal: 30, 
    marginVertical: 50, 
    width: '100%', // Match buttonSectionContainer
    alignItems: 'center', // Center content
  },
  dropdownButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: '100%', // Full width within parent
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});