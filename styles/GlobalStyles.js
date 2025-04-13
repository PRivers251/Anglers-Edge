// styles/GlobalStyles.js
import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  keyboardAvoidingContainer: { flex: 1 },
  
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  
  scrollContent: { flexGrow: 1, justifyContent: 'center' }, // Add justifyContent: 'center' to center content vertically
  content: { 
    flex: 1, // Allow the content to take up available space
    justifyContent: 'center', // Center children vertically
    alignItems: 'center', // Center children horizontally
    paddingVertical: 20,
  },

  header: { paddingHorizontal: 30, alignItems: 'center', marginBlock: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  
  customButton: { 
    backgroundColor: '#00CED1', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 5, 
    width: '100%' 
  },
  disabledButton: { backgroundColor: '#A9A9A9', opacity: 0.7 },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  buttonContainer: {
    marginBlock: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonSectionContainer: {
    width: '80%',
    alignItems: 'center',
  },

  label: { 
    fontSize: 18, 
    color: '#00CED1',  
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },

  placeholder: { 
    fontSize: 16, 
    color: '#fff', 
    marginVertical: 20, 
    textAlign: 'center', 
    textShadowColor: '#000', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 2 
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    maxHeight: '50%',
    padding: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dateItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDateItem: {
    backgroundColor: '#00CED1',
  },
  selectedDateItemText: {
    color: '#fff',
    fontWeight: '600',
  },

  backButton: { 
    backgroundColor: '#00CED1', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 5, 
    marginBottom: 20, 
    marginHorizontal: 30 
  },
});