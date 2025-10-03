import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import TaxSettings from '../Screens/Admin/Taxes';
import Printer from '../Screens/Printer';
import Profile from '../Screens/Profile';
import BluetoothScanner from '../Screens/BluetoothScanner';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function Taxes() {
  const [activeTab, setActiveTab] = useState('Taxes');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const navigation = useNavigation();

  const tabs = [
    { id: 'Taxes', label: 'Taxes', icon: 'calculator-outline' },
    { id: 'Profile', label: 'Profile', icon: 'person-outline' },
    { id: 'Printer', label: 'Printer', icon: 'print-outline' },
  ];

  const handleLogout = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove access token or relevant data from AsyncStorage
              await AsyncStorage.removeItem('access');
              // Navigate to the index page
              router.push('/');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderContent = () => {
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

    switch (activeTab) {
      case 'Taxes':
        return <TaxSettings />;
      case 'Profile':
        return <Profile />;
      case 'Printer':
        return <BluetoothScanner  />;
      default:
        return <TaxSettings />;
    }
  };

  const handleTabPress = (tabId) => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    setActiveTab(tabId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Sticky Tab Bar */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTab,
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === tab.id ? tab.icon.replace('-outline', '') : tab.icon}
                size={isTablet ? 24 : 20}
                color={activeTab === tab.id ? '#ffffff' : '#6b7280'}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeText,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.tabButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={isTablet ? 24 : 20}
              color="#dc2626"
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}>
        {renderContent()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  tabBarContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? '5%' : 12,
    marginTop: Platform.OS === 'ios' ? 10 : 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    minHeight: 50,
  },
  activeTab: {
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeText: {
    color: '#ffffff',
  },
  logoutText: {
    color: '#dc2626',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? '5%' : 16,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
  },
});