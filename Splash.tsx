import { View, Image, Dimensions, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';

const Splash = ({ onFinish = () => {} }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Lightning scale + opacity flash
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      ]),
      Animated.delay(500),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish(); // Call when splash animation is done (optional)
    });
  }, []);

  return (
    <Animated.View
      style={{
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: opacityAnim,
      }}
    >
      <Animated.Image
        source={require('./assets/splash-icon.png')}
        style={{
          width: 300,
          height: 300,
          transform: [{ scale: scaleAnim }],
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default Splash;
