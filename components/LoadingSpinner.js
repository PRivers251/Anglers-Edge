import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Platform, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LoadingSpinnerStyles } from '../styles/LoadingSpinnerStyles';

// Inject raw CSS for web animation with improved centering and clipping fix
if (Platform.OS === 'web') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerHTML = `
    .web-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 175px; /* Slightly smaller to avoid clipping */
      height: 175px;
      box-sizing: border-box;
      transform: translate(-50%, -50%);
      border-radius: 100%;
      border: 6px solid #00CED1;
      border-top-color: transparent;
      z-index: 3;
      animation: spin 2s linear infinite;
      transform-origin: center center;
    }
    @keyframes spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default function LoadingSpinner() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000, // 2 seconds per rotation
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Web platform: Use a div with raw CSS animation
  if (Platform.OS === 'web') {
    return (
      <View style={LoadingSpinnerStyles.container}>
        <View style={LoadingSpinnerStyles.logoContainer}>
          <View style={LoadingSpinnerStyles.logoWrapper}>
            <Image
              source={require('../assets/ProAnglerAI-WhiteBackground.png')}
              style={LoadingSpinnerStyles.logo}
            />
            <View style={LoadingSpinnerStyles.webSpinnerContainer}>
              <div className="web-spinner" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Native platforms (iOS, Android): Use SVG-based animation
  return (
    <View style={LoadingSpinnerStyles.container}>
      <View style={LoadingSpinnerStyles.logoContainer}>
        <View style={LoadingSpinnerStyles.logoWrapper}>
          <Image
            source={require('../assets/ProAnglerAI-WhiteBackground.png')}
            style={LoadingSpinnerStyles.logo}
          />
          <Animated.View
            style={[
              LoadingSpinnerStyles.spinnerOverlay,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Svg height="180" width="180" viewBox="0 0 180 180">
              <Circle
                cx="90"
                cy="90"
                r="88"
                stroke="#00CED1"
                strokeWidth="4"
                fill="none"
                strokeDasharray="135 415" // Adjusted for new circumference (≈550)
                strokeDashoffset={0}
              />
            </Svg>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}