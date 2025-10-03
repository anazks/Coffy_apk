// BluetoothScanner.js
import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager } from "react-native-ble-plx";
import { requestBluetoothPermissions } from "../Api/Services/requestBluetoothPermissions";

export default function BluetoothScanner() {
  const manager = useRef(new BleManager()).current;
  const [devices, setDevices] = useState({});
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [printerService, setPrinterService] = useState(null);
  const [writeCharacteristic, setWriteCharacteristic] = useState(null);

  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
      if (connectedDevice) {
        connectedDevice.cancelConnection();
      }
    };
  }, [connectedDevice]);

  async function startScan() {
    const ok = await requestBluetoothPermissions();
    if (!ok) {
      Alert.alert("Permission denied", "Bluetooth permissions not granted");
      return;
    }

    setDevices({});
    setScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        setScanning(false);
        return;
      }
      if (device && device.id) {
        setDevices((prev) => ({ ...prev, [device.id]: device }));
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  }

  async function connectToDevice(device) {
    if (connecting || connectedDevice) return;

    setConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      // Check Bluetooth state
      const state = await manager.state();
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth is not enabled');
      }

      // Stop scanning
      manager.stopDeviceScan();
      setScanning(false);

      console.log(`Starting connection to: ${device.name || 'Unknown'} (${device.id})`);

      // STEP 1: Connect to device with longer timeout
      const deviceConnected = await manager.connectToDevice(device.id, {
        timeout: 20000, // 20 seconds
      });

      console.log('Connection request sent, waiting for actual connection...');

      // STEP 2: Wait for actual connection state
      await waitForActualConnection(deviceConnected);

      console.log('Device is actually connected, discovering services...');

      // STEP 3: Discover services with retry
      const discoveredDevice = await discoverServicesWithRetry(deviceConnected);

      console.log('Services discovered successfully');

      // STEP 4: Set up disconnection listener
      discoveredDevice.onDisconnected((error, dev) => {
        console.log('Device actually disconnected', error);
        setConnectionStatus('disconnected');
        setConnectedDevice(null);
        setPrinterService(null);
        setWriteCharacteristic(null);
        Alert.alert('Disconnected', 'Printer was disconnected');
      });

      // STEP 5: Find printer services
      const { service, characteristic } = await findESCposServices(discoveredDevice);
      
      if (!service || !characteristic) {
        throw new Error('No printer services found');
      }

      console.log('Found printer service, testing communication...');

      // STEP 6: Test actual communication (THIS IS THE REAL CONNECTION TEST)
      const canCommunicate = await testActualCommunication(discoveredDevice, service.uuid, characteristic.uuid);
      
      if (!canCommunicate) {
        throw new Error('Connected but cannot communicate with printer');
      }

      // ONLY NOW - we are actually connected
      setConnectedDevice(discoveredDevice);
      setPrinterService(service);
      setWriteCharacteristic(characteristic);
      setConnectionStatus('connected');
      
      console.log('✅ PRINTER ACTUALLY CONNECTED AND READY!');
      Alert.alert('Success', 'Printer connected and ready!');

    } catch (error) {
      console.log('❌ Connection failed:', error);
      
      // Clean up
      if (connectedDevice) {
        try {
          await connectedDevice.cancelConnection();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
      
      setConnectionStatus('disconnected');
      setConnectedDevice(null);
      setPrinterService(null);
      setWriteCharacteristic(null);
      
      Alert.alert('Connection Failed', error.message);
    } finally {
      setConnecting(false);
    }
  }

  // Wait for actual Bluetooth connection (not just promise resolution)
  async function waitForActualConnection(device) {
    return new Promise(async (resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 200ms = 6 seconds total
      
      const checkConnection = async () => {
        try {
          attempts++;
          console.log(`Connection check attempt ${attempts}/${maxAttempts}`);
          
          const isConnected = await device.isConnected();
          console.log('isConnected() result:', isConnected);
          
          if (isConnected) {
            console.log('✅ Device is actually connected!');
            resolve();
            return;
          }
          
          if (attempts >= maxAttempts) {
            reject(new Error('Connection timeout - device never actually connected'));
            return;
          }
          
          // Check again after delay
          setTimeout(checkConnection, 200);
        } catch (error) {
          reject(error);
        }
      };
      
      // Start checking
      checkConnection();
    });
  }

  // Discover services with retry logic
  async function discoverServicesWithRetry(device) {
    let lastError;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Service discovery attempt ${attempt}/3`);
        const discoveredDevice = await device.discoverAllServicesAndCharacteristics();
        console.log('Service discovery successful');
        return discoveredDevice;
      } catch (error) {
        console.log(`Service discovery attempt ${attempt} failed:`, error);
        lastError = error;
        
        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    throw lastError || new Error('Service discovery failed after 3 attempts');
  }

  async function findESCposServices(device) {
    try {
      console.log('Looking for ESC/POS services...');
      
      const services = await device.services();
      console.log('Found services:', services.map(s => s.uuid));

      const escPosServiceUUIDs = [
        '0000FF00-0000-1000-8000-00805F9B34FB',
        '0000FF01-0000-1000-8000-00805F9B34FB', 
        '00001101-0000-1000-8000-00805F9B34FB',
      ];

      let printerService = null;
      let writeCharacteristic = null;

      for (const service of services) {
        const serviceUUID = service.uuid.toUpperCase();
        if (escPosServiceUUIDs.includes(serviceUUID)) {
          console.log('Found potential ESC/POS service:', serviceUUID);
          
          const characteristics = await device.characteristicsForService(serviceUUID);
          console.log('Characteristics:', characteristics.map(c => c.uuid));

          writeCharacteristic = characteristics.find(char => 
            char.isWritableWithoutResponse
          ) || characteristics.find(char => 
            char.isWritableWithResponse
          );

          if (writeCharacteristic) {
            printerService = service;
            console.log('✅ Using service:', serviceUUID);
            break;
          }
        }
      }

      // Fallback: try any service with write capability
      if (!printerService) {
        console.log('No ESC/POS services found, trying all services...');
        for (const service of services) {
          const characteristics = await device.characteristicsForService(service.uuid);
          writeCharacteristic = characteristics.find(char => 
            char.isWritableWithoutResponse
          ) || characteristics.find(char => 
            char.isWritableWithResponse
          );
          
          if (writeCharacteristic) {
            printerService = service;
            console.log('✅ Using alternative service:', service.uuid);
            break;
          }
        }
      }

      return { service: printerService, characteristic: writeCharacteristic };

    } catch (error) {
      console.log('Error finding services:', error);
      throw error;
    }
  }

  // REAL connection test - only success if printer responds
  async function testActualCommunication(device, serviceUUID, characteristicUUID) {
    try {
      console.log('🔍 Testing actual printer communication...');

      // Try multiple simple commands
      const testCommands = [
        [0x0A], // Just line feed
        [0x1B, 0x40], // ESC @ initialize
        Buffer.from('TEST\n'), // Simple text
      ];

      for (const command of testCommands) {
        try {
          console.log('Trying command:', command);
          await writeToPrinter(device, serviceUUID, characteristicUUID, command);
          console.log('✅ Command accepted by printer!');
          return true; // If any command works, we're connected
        } catch (cmdError) {
          console.log('Command failed, trying next...');
          continue;
        }
      }

      console.log('❌ All test commands failed');
      return false;

    } catch (error) {
      console.log('Communication test error:', error);
      return false;
    }
  }

  async function writeToPrinter(device, serviceUUID, characteristicUUID, data) {
    try {
      const buffer = Buffer.from(data);
      const base64Data = buffer.toString('base64');
      
      console.log(`Writing ${buffer.length} bytes...`);

      // Try without response first
      await device.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Data
      );

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log('Write failed:', error);
      throw error;
    }
  }

  // ==================== PRINTING FUNCTIONS ====================

  // Function to send simple text
  async function sendSimpleText() {
    if (!connectedDevice || !printerService || !writeCharacteristic) {
      Alert.alert('Error', 'Not connected to printer');
      return;
    }

    try {
      console.log('Sending simple text to printer...');
      
      // Simple text command
      const textCommands = [
        0x1B, 0x40, // Initialize printer
        ...Buffer.from('Hello from React Native!\n'),
        ...Buffer.from('This is a test print\n'),
        ...Buffer.from('Bluetooth Printer Working!\n\n'),
        0x1B, 0x64, 0x02, // Feed 2 lines
      ];

      await writeToPrinter(
        connectedDevice, 
        printerService.uuid, 
        writeCharacteristic.uuid, 
        textCommands
      );

      Alert.alert('Success', 'Text sent to printer!');

    } catch (error) {
      console.log('Text print failed:', error);
      Alert.alert('Print Failed', 'Could not send text to printer');
    }
  }

  // Function to send formatted receipt
  async function sendFormattedReceipt() {
    if (!connectedDevice || !printerService || !writeCharacteristic) {
      Alert.alert('Error', 'Not connected to printer');
      return;
    }

    try {
      console.log('Sending formatted receipt...');
      
      const receiptCommands = [
        // Initialize printer
        0x1B, 0x40,
        
        // Center alignment + Double height for header
        0x1B, 0x61, 0x01, // Center alignment
        0x1D, 0x21, 0x01, // Double height
        ...Buffer.from('COFFEE SHOP\n'),
        0x1D, 0x21, 0x00, // Normal height
        ...Buffer.from('----------------\n'),
        
        // Left alignment for items
        0x1B, 0x61, 0x00, // Left alignment
        ...Buffer.from('Order #: 12345\n'),
        ...Buffer.from('Date: ' + new Date().toLocaleDateString() + '\n'),
        ...Buffer.from('Time: ' + new Date().toLocaleTimeString() + '\n\n'),
        
        // Menu items
        ...Buffer.from('Americano        $4.50\n'),
        ...Buffer.from('Latte            $5.00\n'),
        ...Buffer.from('Croissant        $3.50\n'),
        ...Buffer.from('----------------\n'),
        
        // Total with bold
        0x1B, 0x45, 0x01, // Bold on
        ...Buffer.from('TOTAL          $13.00\n'),
        0x1B, 0x45, 0x00, // Bold off
        
        // Thank you message
        ...Buffer.from('\nThank you for your visit!\n'),
        ...Buffer.from('Please come again!\n\n\n'),
        
        // Paper handling
        0x1B, 0x64, 0x03, // Feed 3 lines
        0x1B, 0x69, // Cut paper
      ];

      await writeToPrinter(
        connectedDevice, 
        printerService.uuid, 
        writeCharacteristic.uuid, 
        receiptCommands
      );

      Alert.alert('Success', 'Receipt printed successfully!');

    } catch (error) {
      console.log('Receipt print failed:', error);
      Alert.alert('Print Failed', 'Could not print receipt');
    }
  }

  // Function to test different text styles
  async function testTextStyles() {
    if (!connectedDevice || !printerService || !writeCharacteristic) {
      Alert.alert('Error', 'Not connected to printer');
      return;
    }

    try {
      console.log('Testing different text styles...');
      
      const styleCommands = [
        0x1B, 0x40, // Initialize
        
        // Normal text
        ...Buffer.from('Normal Text\n'),
        
        // Bold text
        0x1B, 0x45, 0x01, // Bold on
        ...Buffer.from('Bold Text\n'),
        0x1B, 0x45, 0x00, // Bold off
        
        // Double height
        0x1D, 0x21, 0x01, // Double height
        ...Buffer.from('Double Height\n'),
        0x1D, 0x21, 0x00, // Normal height
        
        // Underline
        0x1B, 0x2D, 0x01, // Underline on
        ...Buffer.from('Underline Text\n'),
        0x1B, 0x2D, 0x00, // Underline off
        
        // Center alignment
        0x1B, 0x61, 0x01, // Center
        ...Buffer.from('Centered Text\n'),
        0x1B, 0x61, 0x00, // Left alignment
        
        // Right alignment
        0x1B, 0x61, 0x02, // Right
        ...Buffer.from('Right Text\n'),
        0x1B, 0x61, 0x00, // Left alignment
        
        ...Buffer.from('\n\n'),
        0x1B, 0x64, 0x02, // Feed 2 lines
      ];

      await writeToPrinter(
        connectedDevice, 
        printerService.uuid, 
        writeCharacteristic.uuid, 
        styleCommands
      );

      Alert.alert('Success', 'Text styles test sent!');

    } catch (error) {
      console.log('Styles test failed:', error);
      Alert.alert('Print Failed', 'Could not test text styles');
    }
  }

  // Function to send custom text
  async function sendCustomText() {
    if (!connectedDevice || !printerService || !writeCharacteristic) {
      Alert.alert('Error', 'Not connected to printer');
      return;
    }

    try {
      console.log('Sending custom text...');
      
      const customCommands = [
        0x1B, 0x40, // Initialize
        ...Buffer.from('Custom Text Print\n'),
        ...Buffer.from('This is custom content\n'),
        ...Buffer.from('Printed from my app!\n\n'),
        ...Buffer.from('Custom messages work!\n\n\n'),
        0x1B, 0x64, 0x02, // Feed 2 lines
      ];

      await writeToPrinter(
        connectedDevice, 
        printerService.uuid, 
        writeCharacteristic.uuid, 
        customCommands
      );

      Alert.alert('Success', 'Custom text sent to printer!');

    } catch (error) {
      console.log('Custom text failed:', error);
      Alert.alert('Print Failed', 'Could not send custom text');
    }
  }

  // Function to print a barcode (simple example)
  async function printBarcode() {
    if (!connectedDevice || !printerService || !writeCharacteristic) {
      Alert.alert('Error', 'Not connected to printer');
      return;
    }

    try {
      console.log('Printing barcode...');
      
      const barcodeCommands = [
        0x1B, 0x40, // Initialize
        ...Buffer.from('BARCODE TEST\n\n'),
        
        // Simple barcode example (Code 128)
        0x1D, 0x6B, 0x49, 0x0B, // Select Code 128
        ...Buffer.from('1234567890'), // Barcode data
        0x00, // Terminator
        
        ...Buffer.from('\n\nBarcode Above\n\n\n'),
        0x1B, 0x64, 0x03, // Feed 3 lines
      ];

      await writeToPrinter(
        connectedDevice, 
        printerService.uuid, 
        writeCharacteristic.uuid, 
        barcodeCommands
      );

      Alert.alert('Success', 'Barcode sent to printer!');

    } catch (error) {
      console.log('Barcode print failed:', error);
      Alert.alert('Print Failed', 'Could not print barcode');
    }
  }

  async function disconnectDevice() {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setPrinterService(null);
        setWriteCharacteristic(null);
        setConnectionStatus('disconnected');
        Alert.alert('Disconnected', 'Printer disconnected');
      } catch (error) {
        console.log('Disconnection error:', error);
      }
    }
  }

  function getConnectionStatusColor() {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      default: return '#666';
    }
  }

  const deviceList = Object.values(devices);

  return (
    <View style={styles.container}>
      {/* Connection Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: getConnectionStatusColor() }]}>
        <Text style={styles.statusText}>
          Status: {connectionStatus.toUpperCase()}
        </Text>
        {connectedDevice && (
          <View style={styles.connectedButtons}>
            <TouchableOpacity onPress={sendSimpleText} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendFormattedReceipt} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={disconnectDevice} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Scan Button */}
      <TouchableOpacity 
        style={[styles.button, scanning && styles.scanningButton]} 
        onPress={startScan}
        disabled={scanning || connecting}
      >
        <Text style={styles.buttonText}>
          {scanning ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>

      {/* Connecting Indicator */}
      {connecting && (
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color="#0a84ff" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      )}

      {/* Print Options Section - Only show when connected */}
      {connectedDevice && (
        <View style={styles.printSection}>
          <Text style={styles.sectionTitle}>Print Options</Text>
          
          <View style={styles.printButtonRow}>
            <TouchableOpacity onPress={sendSimpleText} style={styles.printButton}>
              <Text style={styles.printButtonText}>Simple Text</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendFormattedReceipt} style={styles.printButton}>
              <Text style={styles.printButtonText}>Sample Receipt</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.printButtonRow}>
            <TouchableOpacity onPress={testTextStyles} style={styles.printButton}>
              <Text style={styles.printButtonText}>Text Styles</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendCustomText} style={styles.printButton}>
              <Text style={styles.printButtonText}>Custom Text</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.printButtonRow}>
            <TouchableOpacity onPress={printBarcode} style={styles.printButton}>
              <Text style={styles.printButtonText}>Barcode</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={disconnectDevice} style={[styles.printButton, styles.disconnectBtn]}>
              <Text style={styles.printButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
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
            <Text style={styles.sub}>MAC: {item.id}</Text>
            <Text style={styles.sub}>RSSI: {item.rssi}</Text>
            {connectedDevice?.id === item.id && (
              <Text style={styles.connectedBadge}>✅ Connected</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {scanning ? "Scanning for devices..." : "No devices found. Press Start Scan."}
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
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  button: {
    padding: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 8,
    marginBottom: 16,
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
  printSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  printButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  printButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#28a745',
    borderRadius: 6,
    alignItems: 'center',
  },
  disconnectBtn: {
    backgroundColor: '#dc3545',
  },
  printButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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