// components/LoadingSpinner.js
import React from 'react';
import { View } from 'react-native';
import { Video } from 'expo-av';
import { LoadingSpinnerStyles } from '../styles/LoadingSpinnerStyles';

export default function LoadingSpinner() {
  return (
    <View style={LoadingSpinnerStyles.container}>
      <View style={LoadingSpinnerStyles.logoContainer}>
        <View style={LoadingSpinnerStyles.logoWrapper}>
          <Video
            source={require('../assets/ProAnglerAI-LoadingVideo.mp4')}
            style={LoadingSpinnerStyles.logo}
            resizeMode="cover"
            shouldPlay
            isLooping
            isMuted
            onError={(error) => console.error('Video Error:', error)}
          />
        </View>
      </View>
    </View>
  );
}