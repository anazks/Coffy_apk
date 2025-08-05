import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 0 : 20, // Adjust for status bar on Android
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  printerIcon: {
    backgroundColor: '#dbeafe',
  },
  displayIcon: {
    backgroundColor: '#fef3c7',
  },
  taxIcon: {
    backgroundColor: '#dcfce7',
  },
  themeIcon: {
    backgroundColor: '#f3e8ff',
  },
  signOutIcon: {
    backgroundColor: '#fee2e2',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  settingValue: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  statusConnected: {
    backgroundColor: '#dcfce7',
  },
  statusDisconnected: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  connectedText: {
    color: '#16a34a',
  },
  disconnectedText: {
    color: '#dc2626',
  },
  deviceList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedDevice: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  deviceStatus: {
    fontSize: 12,
    color: '#64748b',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1e293b',
  },
  textInputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  taxName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  taxRate: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [displayModalVisible, setDisplayModalVisible] = useState(false);
  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [selectedDisplay, setSelectedDisplay] = useState('');
  const [inputFocused, setInputFocused] = useState<string | null>(null);
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxRate, setNewTaxRate] = useState('');

  // Sample data
  const [printers] = useState([
    { id: '1', name: 'Epson TM-T88VI', status: 'Connected', connected: true },
    { id: '2', name: 'Star TSP143III', status: 'Available', connected: false },
    { id: '3', name: 'Brother TD-4420TN', status: 'Available', connected: false },
  ]);

  const [displays] = useState([
    { id: '1', name: 'Customer Display 1', status: 'Connected', connected: true },
    { id: '2', name: 'Customer Display 2', status: 'Available', connected: false },
    { id: '3', name: 'Pole Display', status: 'Available', connected: false },
  ]);

  const [taxes, setTaxes] = useState([
    { id: '1', name: 'VAT', rate: '18%' },
    { id: '2', name: 'Service Tax', rate: '5%' },
    { id: '3', name: 'GST', rate: '12%' },
  ]);

  const handlePrinterSelect = (printer: any) => {
    setSelectedPrinter(printer.name);
    Alert.alert(
      'Printer Selected',
      `Connected to ${printer.name}`,
      [{ text: 'OK', onPress: () => setPrinterModalVisible(false) }]
    );
  };

  const handleDisplaySelect = (display: any) => {
    setSelectedDisplay(display.name);
    Alert.alert(
      'Display Selected',
      `Connected to ${display.name}`,
      [{ text: 'OK', onPress: () => setDisplayModalVisible(false) }]
    );
  };

  const handleAddTax = () => {
    if (!newTaxName.trim() || !newTaxRate.trim()) {
      Alert.alert('Error', 'Please enter both tax name and rate');
      return;
    }

    const newTax = {
      id: Date.now().toString(),
      name: newTaxName,
      rate: newTaxRate.includes('%') ? newTaxRate : `${newTaxRate}%`,
    };

    setTaxes([...taxes, newTax]);
    setNewTaxName('');
    setNewTaxRate('');
    setTaxModalVisible(false);
    Alert.alert('Success', 'Tax added successfully');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'You have been signed out successfully');
          },
        },
      ]
    );
  };

  const connectedPrinter = printers.find(p => p.connected);
  const connectedDisplay = displays.find(d => d.connected);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your app preferences and connections</Text>
      </View> */}

      {/* Hardware Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hardware</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setPrinterModalVisible(true)}
        >
          <View style={[styles.iconContainer, styles.printerIcon]}>
            <Ionicons name="print" size={20} color="#2563eb" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Printer Connections</Text>
            <Text style={styles.settingSubtitle}>
              {connectedPrinter ? connectedPrinter.name : 'No printer connected'}
            </Text>
          </View>
          <View style={styles.rightContent}>
            {connectedPrinter && (
              <Text style={styles.settingValue}>Connected</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#64748b" style={styles.chevron} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, styles.lastItem]}
          onPress={() => setDisplayModalVisible(true)}
        >
          <View style={[styles.iconContainer, styles.displayIcon]}>
            <Ionicons name="tv" size={20} color="#d97706" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Customer Displays</Text>
            <Text style={styles.settingSubtitle}>
              {connectedDisplay ? connectedDisplay.name : 'No display connected'}
            </Text>
          </View>
          <View style={styles.rightContent}>
            {connectedDisplay && (
              <Text style={styles.settingValue}>Connected</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#64748b" style={styles.chevron} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Business Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business</Text>
        
        <TouchableOpacity
          style={[styles.settingItem, styles.lastItem]}
          onPress={() => setTaxModalVisible(true)}
        >
          <View style={[styles.iconContainer, styles.taxIcon]}>
            <Ionicons name="calculator" size={20} color="#16a34a" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Taxes</Text>
            <Text style={styles.settingSubtitle}>Manage tax rates and settings</Text>
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.settingValue}>{taxes.length} taxes</Text>
            <Ionicons name="chevron-forward" size={16} color="#64748b" style={styles.chevron} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={[styles.settingItem, styles.lastItem]}>
          <View style={[styles.iconContainer, styles.themeIcon]}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color="#7c3aed" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingSubtitle}>Switch between light and dark theme</Text>
          </View>
          <View style={styles.rightContent}>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
              thumbColor={isDarkMode ? '#ffffff' : '#f3f4f6'}
              style={styles.switch}
            />
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={[styles.settingItem, styles.lastItem]}
          onPress={handleSignOut}
        >
          <View style={[styles.iconContainer, styles.signOutIcon]}>
            <Ionicons name="log-out" size={20} color="#dc2626" />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: '#dc2626' }]}>Sign Out</Text>
            <Text style={styles.settingSubtitle}>Sign out of your account</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#64748b" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Printer Modal */}
      <Modal
        visible={printerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPrinterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Printer Connections</Text>
            
            <View style={[
              styles.connectionStatus,
              connectedPrinter ? styles.statusConnected : styles.statusDisconnected
            ]}>
              <Ionicons 
                name={connectedPrinter ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={connectedPrinter ? "#16a34a" : "#dc2626"} 
              />
              <Text style={[
                styles.statusText,
                connectedPrinter ? styles.connectedText : styles.disconnectedText
              ]}>
                {connectedPrinter ? `Connected to ${connectedPrinter.name}` : 'No printer connected'}
              </Text>
            </View>

            <ScrollView style={styles.deviceList}>
              {printers.map((printer) => (
                <TouchableOpacity
                  key={printer.id}
                  style={[
                    styles.deviceItem,
                    printer.connected && styles.selectedDevice
                  ]}
                  onPress={() => handlePrinterSelect(printer)}
                >
                  <View>
                    <Text style={styles.deviceName}>{printer.name}</Text>
                    <Text style={styles.deviceStatus}>{printer.status}</Text>
                  </View>
                  {printer.connected && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => setPrinterModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.secondaryButtonText]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Display Modal */}
      <Modal
        visible={displayModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDisplayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Customer Displays</Text>
            
            <View style={[
              styles.connectionStatus,
              connectedDisplay ? styles.statusConnected : styles.statusDisconnected
            ]}>
              <Ionicons 
                name={connectedDisplay ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={connectedDisplay ? "#16a34a" : "#dc2626"} 
              />
              <Text style={[
                styles.statusText,
                connectedDisplay ? styles.connectedText : styles.disconnectedText
              ]}>
                {connectedDisplay ? `Connected to ${connectedDisplay.name}` : 'No display connected'}
              </Text>
            </View>

            <ScrollView style={styles.deviceList}>
              {displays.map((display) => (
                <TouchableOpacity
                  key={display.id}
                  style={[
                    styles.deviceItem,
                    display.connected && styles.selectedDevice
                  ]}
                  onPress={() => handleDisplaySelect(display)}
                >
                  <View>
                    <Text style={styles.deviceName}>{display.name}</Text>
                    <Text style={styles.deviceStatus}>{display.status}</Text>
                  </View>
                  {display.connected && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={() => setDisplayModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.secondaryButtonText]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tax Modal */}
      <Modal
        visible={taxModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTaxModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tax Management</Text>
            
            <ScrollView style={[styles.deviceList, { marginBottom: 16 }]}>
              {taxes.map((tax) => (
                <View key={tax.id} style={styles.taxRow}>
                  <Text style={styles.taxName}>{tax.name}</Text>
                  <Text style={styles.taxRate}>{tax.rate}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tax Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  inputFocused === 'taxName' && styles.textInputFocused,
                ]}
                value={newTaxName}
                onChangeText={setNewTaxName}
                placeholder="Enter tax name"
                onFocus={() => setInputFocused('taxName')}
                onBlur={() => setInputFocused(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tax Rate (%)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  inputFocused === 'taxRate' && styles.textInputFocused,
                ]}
                value={newTaxRate}
                onChangeText={setNewTaxRate}
                placeholder="Enter tax rate"
                keyboardType="numeric"
                onFocus={() => setInputFocused('taxRate')}
                onBlur={() => setInputFocused(null)}
              />
            </View>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setTaxModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.secondaryButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleAddTax}
              >
                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                  Add Tax
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}