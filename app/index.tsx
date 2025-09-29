import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('Checking for access token in AsyncStorage...');
        const access = await AsyncStorage.getItem('access');
        console.log('Access token found:', !!access);

        if (access) {
          console.log('Access token exists, navigating to Home');
          setTimeout(() => {
            router.replace('/(tabs)/Home');
          }, 500);
        } else {
          console.log('No access token, redirecting to Login');
          router.replace('/Screens/Admin/Login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Redirect to login on error to ensure user can authenticate
        router.replace('/Screens/Admin/Login');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Checking authentication...</Text>
      </View>
    );
  }

  // Return null since navigation is handled by useEffect
  return null;
}