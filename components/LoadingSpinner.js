// components/LoadingSpinner.js
import React from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import { LoadingSpinnerStyles } from '../styles/LoadingSpinnerStyles';

const LoadingSpinner = () => {
  const spinValue = new Animated.Value(0);

  // Set up the animation
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500, // Speed of rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  // Interpolate rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={LoadingSpinnerStyles.container}>
      <View style={LoadingSpinnerStyles.logoContainer}>
        <Image
          source={require('../assets/ProAnglerAI-WhiteBackground.png')}
          style={LoadingSpinnerStyles.logo}
          resizeMode="contain"
        />
        <Animated.View style={[LoadingSpinnerStyles.border, { transform: [{ rotate: spin }] }]}>
          <View style={LoadingSpinnerStyles.innerBorder} />
        </Animated.View>
      </View>
    </View>
  );
};

export default LoadingSpinner;