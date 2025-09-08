import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import TaxSettings from '../Screens/Admin/Taxes';
import Branch from '../Screens/Branch';
import Printer from '../Screens/Printer';
import Profile from '../Screens/Profile';

export default function Taxes() {
  const [activeTab, setActiveTab] = useState('Taxes'); // default screen

  const renderContent = () => {
    switch (activeTab) {
      case 'Taxes':
        return <TaxSettings />;
      case 'Profile':
        return <Profile />;
      case 'Printer':
        return <Printer />;
      case 'Branch': // Add case for Branch
        return <Branch />;
      default:
        return <TaxSettings />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Taxes' && styles.activeTab]}
          onPress={() => setActiveTab('Taxes')}
        >
          <Text style={[styles.tabText, activeTab === 'Taxes' && styles.activeText]}>Taxes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Profile' && styles.activeTab]}
          onPress={() => setActiveTab('Profile')}
        >
          <Text style={[styles.tabText, activeTab === 'Profile' && styles.activeText]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Printer' && styles.activeTab]}
          onPress={() => setActiveTab('Printer')}
        >
          <Text style={[styles.tabText, activeTab === 'Printer' && styles.activeText]}>Printer</Text>
        </TouchableOpacity>
        
        {/* Add Branch Tab Button */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Branch' && styles.activeTab]}
          onPress={() => setActiveTab('Branch')}
        >
          <Text style={[styles.tabText, activeTab === 'Branch' && styles.activeText]}>Branch</Text>
        </TouchableOpacity>
      </View>

      {/* Active Component */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  activeText: {
    color: 'white',
  },
  content: { flex: 1, padding: 10 },
});