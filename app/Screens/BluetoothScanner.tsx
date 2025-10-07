// BluetoothScanner.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { requestBluetoothPermissions } from "../Api/Services/requestBluetoothPermissions";
import { usePrinter } from '../Contex/PrinterContex';

interface BluetoothScannerProps {
  receiptData?: any;
  onPrintComplete?: () => void;
  onClose?: () => void;
}

export default function BluetoothScanner({ receiptData, onPrintComplete, onClose }: BluetoothScannerProps) {
  const {
    devices,
    deviceList,
    scanning,
    connecting,
    connectionStatus,
    connectedDevice,
    printing,
    savedPrinter,
    startScan,
    connectToDevice,
    quickConnectToSavedPrinter,
    printTestText,
    printReceipt,
    disconnectDevice,
  } = usePrinter();

  const [testText, setTestText] = useState('Hello, World!\nThis is a sample test print.\n\nThank you!');

  function getConnectionStatusColor() {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      default: return '#666';
    }
  }

  function showConnectionHelp() {
    Alert.alert(
      'Connection Help',
      'For stable connection:\n\n1. Turn printer ON first\n2. Wait for printer to be ready\n3. Ensure Bluetooth is enabled\n4. Keep phone within 2 meters\n5. Select your printer from the list\n\nConnection will persist when you navigate away.',
      [{ text: 'OK' }]
    );
  }

  async function handlePrintTest() {
    await printTestText(testText);
  }

  async function handlePrintReceipt() {
    await printReceipt(receiptData);
    if (onPrintComplete) {
      onPrintComplete();
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#334155" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Bluetooth Printer</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Quick Connect */}
      {savedPrinter && !connectedDevice && (
        <TouchableOpacity 
          style={styles.quickConnectButton}
          onPress={quickConnectToSavedPrinter}
          disabled={connecting}
        >
          <Ionicons name="flash" size={20} color="#fff" />
          <Text style={styles.quickConnectText}>
            {connecting ? 'Connecting...' : `Quick Connect to ${savedPrinter.name}`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Status */}
      <View style={[styles.statusBanner, { backgroundColor: getConnectionStatusColor() }]}>
        <Text style={styles.statusText}>
          {connectionStatus.toUpperCase()}
        </Text>
        {connectedDevice && (
          <View style={styles.connectedButtons}>
            <TouchableOpacity onPress={handlePrintReceipt} style={styles.smallButton} disabled={printing}>
              <Text style={styles.smallButtonText}>
                {printing ? 'Printing...' : 'Print Receipt'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={disconnectDevice} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Test Print Section - Only show when connected */}
      {connectedDevice && (
        <View style={styles.testPrintSection}>
          <Text style={styles.sectionTitle}>Test Print Sample Text</Text>
          <TextInput
            style={styles.testTextInput}
            value={testText}
            onChangeText={setTestText}
            multiline
            numberOfLines={4}
            placeholder="Enter sample text to test print..."
          />
          <TouchableOpacity 
            style={[styles.button, printing && styles.disabledButton]} 
            onPress={handlePrintTest}
            disabled={printing}
          >
            <Text style={styles.buttonText}>
              {printing ? 'Printing...' : 'Print Test Text'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Help Button */}
      <TouchableOpacity 
        style={styles.helpButton}
        onPress={showConnectionHelp}
      >
        <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
        <Text style={styles.helpText}>Connection Tips</Text>
      </TouchableOpacity>

      {/* Scan Button */}
      <TouchableOpacity 
        style={[styles.button, scanning && styles.scanningButton]} 
        onPress={startScan}
        disabled={scanning || connecting}
      >
        <Text style={styles.buttonText}>
          {scanning ? "Scanning..." : "Scan for Printers"}
        </Text>
      </TouchableOpacity>

      {/* Connecting Indicator */}
      {connecting && (
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color="#0a84ff" />
          <Text style={styles.connectingText}>Connecting to printer...</Text>
        </View>
      )}

      {/* Devices List */}
      <FlatList
        data={deviceList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.item, 
              connectedDevice?.id === item.id && styles.connectedItem
            ]} 
            onPress={() => connectToDevice(item)}
            disabled={connecting}
          >
            <Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
            <Text style={styles.sub}>ID: {item.id}</Text>
            <Text style={styles.sub}>Signal: {item.rssi} dBm</Text>
            {connectedDevice?.id === item.id && (
              <Text style={styles.connectedBadge}>✅ Connected</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {scanning ? "Scanning for printers..." : "No printers found. Press Scan."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSpacer: {
    width: 80,
  },
  quickConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  quickConnectText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  connectedButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    minWidth: 80,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  testPrintSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  testTextInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  helpText: {
    color: '#2563eb',
    fontWeight: '500',
    fontSize: 14,
  },
  button: {
    padding: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 8,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  scanningButton: {
    backgroundColor: "#ff6b35",
  },
  buttonText: { 
    color: "#fff", 
    textAlign: "center", 
    fontWeight: "bold" 
  },
  connectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  connectingText: {
    marginLeft: 8,
    color: '#0a84ff',
    fontWeight: '500',
  },
  item: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee" 
  },
  connectedItem: {
    backgroundColor: '#f0fff0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sub: { 
    fontSize: 12, 
    color: "#666" 
  },
  connectedBadge: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});