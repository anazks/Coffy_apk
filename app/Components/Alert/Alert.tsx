import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function Alert({ statusText, statusType = 'info', onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      // Fade out and slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onClose) onClose();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, onClose]);

  // Determine styles based on statusType
  const getStatusStyles = () => {
    switch (statusType.toLowerCase()) {
      case 'success':
        return { backgroundColor: '#d1fae5', borderColor: '#10b981', icon: 'checkmark-circle', iconColor: '#10b981' };
      case 'error':
        return { backgroundColor: '#fef2f2', borderColor: '#ef4444', icon: 'alert-circle', iconColor: '#ef4444' };
      case 'warning':
        return { backgroundColor: '#fefce8', borderColor: '#f59e0b', icon: 'warning', iconColor: '#f59e0b' };
      default: // info
        return { backgroundColor: '#e0f2fe', borderColor: '#3b82f6', icon: 'information-circle', iconColor: '#3b82f6' };
    }
  };

  const { backgroundColor, borderColor, icon, iconColor } = getStatusStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={isTablet ? 28 : 24}
        color={iconColor}
        style={styles.icon}
      />
      <Text style={[styles.text, { fontSize: isTablet ? 18 : 16 }]}>
        {statusText || 'No message provided'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 16,
    marginHorizontal: isTablet ? '10%' : 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: isTablet ? 24 : 20,
  },
});