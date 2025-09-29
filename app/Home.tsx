import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Use expo-secure-store or AsyncStorage instead of localStorage for React Native
        // If you're using Expo, install expo-secure-store: npx expo install expo-secure-store
        let access;
        
        // Try different storage methods based on your environment
        if (typeof localStorage !== 'undefined') {
          access = localStorage.getItem('access');
        } else if (typeof sessionStorage !== 'undefined') {
          access = sessionStorage.getItem('access');
        }
        
        console.log('Access token found:', !!access);
        
        if (access) {
          // Add a small delay to ensure the animation is visible
          setTimeout(() => {
            router.push('/(tabs)/Home');
          }, 500);
        }
      } catch (error) {
        console.log('Error checking authentication:', error);
      }
    };

    checkAuthentication();
  }, []);

  const handleGetStarted = () => {
    router.push('../Screens/Admin/Login');
  };

  const handleLogin = () => {
    router.push('../Screens/Admin/Login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <Text style={styles.brandName}>☕ Coffy Byte</Text>
        <Text style={styles.tagline}>Est. 1950 - Classic Coffee POS</Text>
      </Animated.View>

      {/* Main Content */}
      <Animated.View 
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <Text style={styles.title}>Craft Your Coffee Legacy</Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featureText}>☕ Swift order service</Text>
          <Text style={styles.featureText}>📈 Vintage sales ledger</Text>
          <Text style={styles.featureText}>🗄️ Stockroom control</Text>
          <Text style={styles.featureText}>🧑‍🤝‍🧑 Patron profiles</Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Begin the Journey</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleLogin}
          activeOpacity={0.6}
        >
          <Text style={styles.secondaryButtonText}>Return to My Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e8d8', // Parchment-like background
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  brandName: {
    fontSize: 38,
    fontFamily: 'Georgia', // Classic serif font
    color: '#4a2c14', // Rich coffee brown
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    color: '#6b4e31', // Muted sepia tone
    fontStyle: 'italic',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: '#3c2005', // Dark coffee
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: 300,
    backgroundColor: 'rgba(255, 245, 224, 0.5)', // Subtle parchment overlay
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4c2a6', // Faded border
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Times New Roman',
    color: '#5c4033', // Warm brown
    marginBottom: 16,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#8b5e3c', // Vintage leather brown
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#d4c2a6', // Ornate border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff5e6', // Creamy off-white
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#8b5e3c',
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#8b5e3c',
    fontSize: 14,
    fontFamily: 'Times New Roman',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});