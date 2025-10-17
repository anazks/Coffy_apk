import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

export default function Loader() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Scale pulse animation
    const scalePulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    scalePulse.start();

    return () => {
      scalePulse.stop();
    };
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.loaderContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Big Activity Indicator */}
        <ActivityIndicator size="large" color="#2563eb" style={styles.activityIndicator} />
        
      
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    marginBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 30,
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});