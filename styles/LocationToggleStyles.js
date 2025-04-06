// styles/LocationToggleStyles.js
import { StyleSheet } from 'react-native';

export const LocationToggleStyles = StyleSheet.create({
  locationSection: { 
    paddingHorizontal: 30, 
    marginBottom: 20, 
    alignItems: 'center',
    width: '100%',
  },
  locationText: { 
    fontSize: 16, 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 10, 
    textShadowColor: '#000', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 2 
  },
  
  input: { 
    height: 50,
    minHeight: 50,
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 10,
    paddingHorizontal: 15, 
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    color: '#333', 
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    fontSize: 16,
  },

  manualLocationContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },

  toggleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: '70%',
  },

  toggleLabel: { fontSize: 16, color: '#333', marginRight: 10, fontWeight: '600' },
});