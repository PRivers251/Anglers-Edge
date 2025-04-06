// components/AlertModal.js (updated)
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import { AlertModalStyles } from '../styles/AlertModalStyles';

export default function AlertModal({ visible, title, message, onClose }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={GlobalStyles.modalOverlay}>
        <View style={GlobalStyles.modalContent}>
          <Text style={AlertModalStyles.title}>{title}</Text>
          <Text style={AlertModalStyles.message}>{message}</Text>
          <TouchableOpacity style={GlobalStyles.customButton} onPress={onClose}>
            <Text style={GlobalStyles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}