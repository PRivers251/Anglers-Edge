import React, { useEffect, useRef } from 'react';
import { View, Image, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LoadingSpinnerStyles } from '../styles/LoadingSpinnerStyles';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function LoadingSpinner() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3500, // 2 seconds per rotation
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={LoadingSpinnerStyles.container}>
      <View style={LoadingSpinnerStyles.logoContainer}>
        <View style={LoadingSpinnerStyles.logoWrapper}>
          {/* Logo Image */}
          <Image
            source={require('../assets/ProAnglerAI-WhiteBackground.png')}
            style={LoadingSpinnerStyles.logo}
          />
          {/* Spinning Circle - Positioned absolutely with higher zIndex */}
          <Animated.View
            style={[
              LoadingSpinnerStyles.spinnerOverlay,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Svg height="200" width="200" viewBox="0 0 200 200">
              <AnimatedCircle
                cx="100"
                cy="100"
                r="98"
                stroke="#00CED1"
                strokeWidth="4"
                fill="none"
                strokeDasharray="150 465" // Adjusted for visibility: ~25% blue arc, 75% white gap (circumference ≈ 615)
                strokeDashoffset={0}
              />
            </Svg>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}