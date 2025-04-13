// components/LoadingSpinner.js
import React, { useEffect } from 'react';
import { View, Platform, Image, Text } from 'react-native';
import Video from 'react-native-video';
import { LoadingSpinnerStyles } from '../styles/LoadingSpinnerStyles';

export default function LoadingSpinner() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('LoadingSpinner: Attempting to render on web');
    }
  }, []);

  return (
    <View style={LoadingSpinnerStyles.container}>
      <View style={LoadingSpinnerStyles.logoContainer}>
        <View style={LoadingSpinnerStyles.logoWrapper}>
          {Platform.OS === 'web' ? (
            <Image
              source={require('../assets/ProAnglerAI-WhiteBackground.png')}
              style={LoadingSpinnerStyles.logo}
              resizeMode="contain"
              onError={(error) => console.error('Fallback Image Error:', JSON.stringify(error))}
            />
          ) : (
            <Video
              source={require('../assets/ProAnglerAI-LoadingVideo.mp4')}
              style={LoadingSpinnerStyles.logo}
              resizeMode="contain"
              repeat={true}
              muted={true}
              playsInline={Platform.OS === 'web'}
              posterResizeMode="contain"
              onError={(error) => console.error('Video Error:', JSON.stringify(error))}
              onLoad={() => console.log('Video Loaded')}
            />
          )}
        </View>
      </View>
    </View>
  );
}