import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  keyboardAvoidingContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  scrollContent: { flexGrow: 1 },
  content: { paddingVertical: 20 },
  header: { paddingHorizontal: 30, alignItems: 'center', marginBlock: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  
  toggleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'center', 
    marginBottom: 25, 
    width: "auto", 
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    paddingInline: 20, 
    paddingBlock: 5, 
    borderRadius: 8,
    textAlignVertical: 'center',
  },

  toggleLabel: { fontSize: 16, color: '#333', marginRight: 10 },
  locationSection: { paddingHorizontal: 30, marginBottom: 20, alignItems: 'center' },
  locationText: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 10, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  
  input: { 
    height: 40, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    color: '#333', 
    width: '100%' 
  },

  manualLocationContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: '20',
  },

  dateSection: { paddingHorizontal: 30, marginVertical: 50, alignItems: 'center' },
  dateButton: { backgroundColor: '#00CED1', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  pickerOverlay: { backgroundColor: 'rgba(255, 255, 255, 0.66)', borderRadius: 8, padding: 10, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  speciesSection: { paddingHorizontal: 30, marginVertical: 50 },
  
  label: { 
    fontSize: 18, 
    color: '#00CED1',  
    fontWeight: 700,
    alignItems: 'center',
    marginBottom: 10,
    textAlign: 'center'
  },
  
  picker: { height: 200, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 8, textAlignVertical: 'center' },
  placeholder: { fontSize: 16, color: '#fff', marginVertical: 20, textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  getSpecies: { fontWeight: '700' },
  buttonSection: { paddingHorizontal: 30, alignItems: 'center', marginBottom: 20 },
  customButton: { backgroundColor: '#00CED1', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, width: '100%' },
  disabledButton: { backgroundColor: '#A9A9A9', opacity: 0.7 },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  forecastSection: { paddingHorizontal: 30, marginTop: 20 },
  adviceSection: { paddingHorizontal: 30, marginVertical: 20 },
  forecastCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: '100%' },
  adviceCard: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 20 },
  field: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 10 },
  forecastField: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 10 },
  errorText: { fontSize: 16, color: '#fff', textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  backButton: { backgroundColor: '#00CED1', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, marginBottom: 20, marginHorizontal: 30 },
});