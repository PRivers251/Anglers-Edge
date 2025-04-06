// styles/DateSelectorStyles.js
import { StyleSheet } from 'react-native';

export const DateSelectorStyles = StyleSheet.create({
  dateSection: { paddingHorizontal: 30, marginVertical: 50, alignItems: 'center' },
  
  dateButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  dateArrowButton: {
    backgroundColor: '#00CED1',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dateDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },

  selectorContainer: {
    width: '80%',
  },
  timeSelectorContainer: {
    marginTop: 20,
  },

  selectorDisplay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
});