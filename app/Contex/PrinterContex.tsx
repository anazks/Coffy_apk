// context/PrinterContext.tsx
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { BleManager, Device, Service, Characteristic } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { requestBluetoothPermissions } from '../Api/Services/requestBluetoothPermissions';

// ==================== TYPES ====================  

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface SavedPrinter {
  id: string;
  name: string;
  deviceId: string;
  deviceName: string;
  serviceUUID: string;
  characteristicUUID: string;
  connectedAt: string;
  lastUsed: string;
  isConnected: boolean;
}

interface PrinterContextType {
  // States
  connectedDevice: Device | null;
  connectionStatus: ConnectionStatus;
  devices: Record<string, Device>;
  deviceList: Device[];
  scanning: boolean;
  connecting: boolean;
  printing: boolean;
  savedPrinter: SavedPrinter | null;
  isConnected: boolean;
  
  // Scanning functions
  startScan: () => Promise<void>;
  stopScan: () => void;
  
  // Connection functions
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  quickConnectToSavedPrinter: () => Promise<void>;
  
  // Printing functions
  printTestText: (text: string) => Promise<void>;
  printReceipt: (receiptData: any) => Promise<void>;
  printData: (data: number[]) => Promise<void>;
}

// ==================== CONTEXT ====================

const PrinterContext = createContext<PrinterContextType | null>(null);

const STORAGE_KEYS = {
  CONNECTED_PRINTER: 'connected_printer',
};

// Common thermal printer service UUIDs
const THERMAL_PRINTER_SERVICES = [
  '0000FF00-0000-1000-8000-00805F9B34FB',
  '0000FF01-0000-1000-8000-00805F9B34FB',
  '00001101-0000-1000-8000-00805F9B34FB',
  '0000FFE0-0000-1000-8000-00805F9B34FB',
  '0000FFE5-0000-1000-8000-00805F9B34FB',
];

// ==================== PROVIDER ====================

interface PrinterProviderProps {
  children: ReactNode;
}

export function PrinterProvider({ children }: PrinterProviderProps) {
  const manager = useRef(new BleManager()).current;
  const disconnectListenerRef = useRef<any>(null);

  // ===== STATE VARIABLES =====
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printerService, setPrinterService] = useState<Service | null>(null);
  const [writeCharacteristic, setWriteCharacteristic] = useState<Characteristic | null>(null);
  const [savedPrinter, setSavedPrinter] = useState<SavedPrinter | null>(null);

  // ===== LIFECYCLE =====
  useEffect(() => {
    loadSavedPrinter();
    checkExistingConnection();

    return () => {
      manager.stopDeviceScan();
      if (disconnectListenerRef.current) {
        disconnectListenerRef.current.remove();
        disconnectListenerRef.current = null;
      }
    };
  }, []);

  // ==================== STORAGE FUNCTIONS ====================

  async function loadSavedPrinter(): Promise<void> {
    try {
      const savedPrinterData = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTED_PRINTER);
      if (savedPrinterData) {
        const printer: SavedPrinter = JSON.parse(savedPrinterData);
        setSavedPrinter(printer);
        console.log('📁 Loaded saved printer:', printer.name);
      }
    } catch (error) {
      console.log('Error loading saved printer:', error);
    }
  }

  async function savePrinterToStorage(
    device: Device,
    service: Service,
    characteristic: Characteristic
  ): Promise<void> {
    try {
      const printerData: SavedPrinter = {
        id: device.id,
        name: device.name || 'Unknown Printer',
        deviceId: device.id,
        deviceName: device.name || 'Unknown Printer',
        serviceUUID: service.uuid,
        characteristicUUID: characteristic.uuid,
        connectedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isConnected: true,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CONNECTED_PRINTER, JSON.stringify(printerData));
      setSavedPrinter(printerData);
      console.log('💾 Printer saved to storage:', printerData.name);
    } catch (error) {
      console.log('Error saving printer to storage:', error);
    }
  }

  async function updatePrinterStorageStatus(isConnected: boolean): Promise<void> {
    try {
      const savedPrinterData = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTED_PRINTER);
      if (savedPrinterData) {
        const printer: SavedPrinter = JSON.parse(savedPrinterData);
        printer.isConnected = isConnected;
        printer.lastUsed = new Date().toISOString();
        await AsyncStorage.setItem(STORAGE_KEYS.CONNECTED_PRINTER, JSON.stringify(printer));
      }
    } catch (error) {
      console.log('Error updating printer status:', error);
    }
  }

  // ==================== BLUETOOTH PERMISSIONS & STATE ====================

  async function checkBluetoothPermissions(): Promise<boolean> {
    try {
      const permissions = await requestBluetoothPermissions();
      console.log('📋 Permissions granted:', permissions);

      if (!permissions) {
        Alert.alert(
          'Permissions Required',
          'Bluetooth permissions are not granted. Please enable them in app settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.log('❌ Permission check error:', error);
      return false;
    }
  }

  async function checkBluetoothState(): Promise<boolean> {
    try {
      const state = await manager.state();
      console.log('📱 Bluetooth state:', state);

      if (state !== 'PoweredOn') {
        Alert.alert('Bluetooth Off', 'Please turn on Bluetooth to connect to printer');
        return false;
      }
      return true;
    } catch (error) {
      console.log('❌ Bluetooth state check error:', error);
      return false;
    }
  }

  // ==================== SCANNING FUNCTIONS ====================

  async function startScan(): Promise<void> {
    try {
      console.log('🚀 Starting Bluetooth scan...');

      const hasPermissions = await checkBluetoothPermissions();
      if (!hasPermissions) return;

      const isBluetoothOn = await checkBluetoothState();
      if (!isBluetoothOn) return;

      setDevices({});
      setScanning(true);

      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('❌ Scan error:', error);
          setScanning(false);
          Alert.alert('Scan Failed', `Bluetooth scan error: ${error.message}`);
          return;
        }

        if (device && device.id) {
          console.log('📱 Found device:', device.name, 'RSSI:', device.rssi);
          setDevices((prev) => ({ ...prev, [device.id]: device }));
        }
      });

      // Auto stop after 10s
      setTimeout(() => {
        manager.stopDeviceScan();
        setScanning(false);

        const deviceCount = Object.keys(devices).length;
        if (deviceCount === 0) {
          Alert.alert(
            'No Devices Found',
            'No Bluetooth printers found. Please ensure:\n\n• Printer is turned ON\n• Printer is in pairing mode\n• Printer is within range',
            [{ text: 'OK' }]
          );
        }
      }, 10000);
    } catch (error) {
      console.log('❌ Start scan error:', error);
      setScanning(false);
      Alert.alert('Scan Error', 'Failed to start Bluetooth scan');
    }
  }

  function stopScan(): void {
    manager.stopDeviceScan();
    setScanning(false);
  }

  // ==================== CONNECTION FUNCTIONS ====================

  async function checkExistingConnection(): Promise<void> {
    try {
      const savedPrinterData = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTED_PRINTER);
      if (savedPrinterData) {
        const printer: SavedPrinter = JSON.parse(savedPrinterData);

        const connectedDevices = await manager.connectedDevices([]);
        const existingDevice = connectedDevices.find((d) => d.id === printer.deviceId);

        if (existingDevice) {
          console.log('📱 Found existing connection:', printer.name);

          const discoveredDevice = await existingDevice.discoverAllServicesAndCharacteristics();
          const { service, characteristic } = await findESCposServices(discoveredDevice);

          if (service && characteristic) {
            setConnectedDevice(discoveredDevice);
            setPrinterService(service);
            setWriteCharacteristic(characteristic);
            setConnectionStatus('connected');

            setupDisconnectionListener(discoveredDevice);

            console.log('✅ Reconnected to existing device');
          }
        }
      }
    } catch (error) {
      console.log('Error checking existing connection:', error);
    }
  }

  function setupDisconnectionListener(device: Device): void {
    if (disconnectListenerRef.current) {
      disconnectListenerRef.current.remove();
    }

    const subscription = device.onDisconnected((error, dev) => {
      console.log('🔌 Device disconnected');

      setConnectionStatus('disconnected');
      setConnectedDevice(null);
      setPrinterService(null);
      setWriteCharacteristic(null);

      updatePrinterStorageStatus(false);

      Alert.alert(
        'Printer Disconnected',
        'The printer connection was lost. You can try reconnecting.',
        [{ text: 'OK' }]
      );
    });

    disconnectListenerRef.current = subscription;
  }

  async function checkConnectionWithRetry(device: Device, maxRetries = 5): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const isConnected = await device.isConnected();
        if (isConnected) {
          console.log(`✅ Connection verified (attempt ${attempt})`);
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`Connection check attempt ${attempt} failed:`, error);
      }
    }
    return false;
  }

  async function testPrinterSimple(
    device: Device,
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<boolean> {
    try {
      console.log('🧪 Testing printer with simple command...');

      const testCommand = [0x0a]; // Line feed
      const buffer = Buffer.from(testCommand);
      const base64Data = buffer.toString('base64');

      await device.writeCharacteristicWithoutResponseForService(
        serviceUUID,
        characteristicUUID,
        base64Data
      );

      console.log('✅ Printer test successful');
      return true;
    } catch (error) {
      console.log('❌ Printer test failed:', error);
      return false;
    }
  }

  async function findESCposServices(device: Device): Promise<{
    service: Service | null;
    characteristic: Characteristic | null;
  }> {
    try {
      console.log('Looking for printer services...');

      const services = await device.services();
      console.log('All services found:', services.map((s) => s.uuid));

      let printerService: Service | null = null;
      let writeCharacteristic: Characteristic | null = null;

      // Look for known printer services
      for (const service of services) {
        const serviceUUID = service.uuid.toUpperCase();
        if (THERMAL_PRINTER_SERVICES.includes(serviceUUID)) {
          console.log('✅ Found potential printer service:', serviceUUID);

          const characteristics = await device.characteristicsForService(serviceUUID);
          console.log('Characteristics:', characteristics.map((c) => c.uuid));

          writeCharacteristic =
            characteristics.find((char) => char.isWritableWithoutResponse) ||
            characteristics.find((char) => char.isWritableWithResponse) ||
            null;

          if (writeCharacteristic) {
            printerService = service;
            console.log('🎯 Using service:', serviceUUID);
            break;
          }
        }
      }

      // If no known service found, try any service with write capability
      if (!printerService) {
        console.log('No known printer services found, trying all services...');
        for (const service of services) {
          const characteristics = await device.characteristicsForService(service.uuid);
          writeCharacteristic =
            characteristics.find((char) => char.isWritableWithoutResponse) ||
            characteristics.find((char) => char.isWritableWithResponse) ||
            null;

          if (writeCharacteristic) {
            printerService = service;
            console.log('🔧 Using alternative service:', service.uuid);
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

  async function connectToDevice(device: Device): Promise<void> {
    if (connecting) return;

    setConnecting(true);
    setConnectionStatus('connecting');

    try {
      console.log(`🔗 Connecting to ${device.name || 'Unknown'}`);

      if (!(await checkBluetoothState())) {
        throw new Error('Bluetooth is not enabled');
      }

      manager.stopDeviceScan();
      setScanning(false);

      const deviceConnected = await manager.connectToDevice(device.id, {
        timeout: 10000,
      });

      console.log('✅ Connection request sent');

      const isConnected = await checkConnectionWithRetry(deviceConnected);
      if (!isConnected) {
        throw new Error('Failed to establish stable connection');
      }

      console.log('🔍 Discovering services...');

      const discoveredDevice = await deviceConnected.discoverAllServicesAndCharacteristics();

      console.log('📋 Services discovered');

      setupDisconnectionListener(discoveredDevice);

      const { service, characteristic } = await findESCposServices(discoveredDevice);

      if (!service || !characteristic) {
        throw new Error(
          'This device does not appear to be a thermal printer. No compatible services found.'
        );
      }

      console.log('🎯 Found printer service:', service.uuid);

      const canCommunicate = await testPrinterSimple(
        discoveredDevice,
        service.uuid,
        characteristic.uuid
      );

      if (!canCommunicate) {
        throw new Error('Printer connected but not responding. Please check if printer is ready.');
      }

      setConnectedDevice(discoveredDevice);
      setPrinterService(service);
      setWriteCharacteristic(characteristic);
      setConnectionStatus('connected');

      await savePrinterToStorage(discoveredDevice, service, characteristic);

      console.log('🎉 Printer fully connected and ready!');
      Alert.alert('Success', `Connected to ${device.name || 'printer'} successfully!`);
    } catch (error: any) {
      console.log('❌ Connection failed:', error.message);

      setConnectionStatus('disconnected');
      setConnectedDevice(null);
      setPrinterService(null);
      setWriteCharacteristic(null);

      let userMessage = error.message;
      if (error.message.includes('timeout')) {
        userMessage =
          'Connection timeout. Please:\n• Ensure printer is turned ON\n• Put printer in pairing mode\n• Move closer to printer';
      } else if (error.message.includes('thermal printer')) {
        userMessage = 'This device may not be a thermal printer. Please select a different device.';
      }

      Alert.alert('Connection Failed', userMessage);
    } finally {
      setConnecting(false);
    }
  }

  async function disconnectDevice(): Promise<void> {
    if (connectedDevice) {
      try {
        if (disconnectListenerRef.current) {
          disconnectListenerRef.current.remove();
          disconnectListenerRef.current = null;
        }

        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setPrinterService(null);
        setWriteCharacteristic(null);
        setConnectionStatus('disconnected');

        await updatePrinterStorageStatus(false);

        Alert.alert('Disconnected', 'Printer disconnected');
      } catch (error) {
        console.log('Disconnection error:', error);
      }
    }
  }

  async function quickConnectToSavedPrinter(): Promise<void> {
    if (!savedPrinter) {
      Alert.alert('No Saved Printer', 'No printer found in storage. Please scan and connect first.');
      return;
    }

    setConnecting(true);
    setConnectionStatus('connecting');

    try {
      console.log('🚀 Quick connecting to saved printer:', savedPrinter.name);

      const deviceConnected = await manager.connectToDevice(savedPrinter.deviceId, {
        timeout: 10000,
      });

      const isConnected = await checkConnectionWithRetry(deviceConnected);
      if (!isConnected) {
        throw new Error('Failed to establish connection');
      }

      const discoveredDevice = await deviceConnected.discoverAllServicesAndCharacteristics();

      setupDisconnectionListener(discoveredDevice);

      const { service, characteristic } = await findESCposServices(discoveredDevice);

      if (!service || !characteristic) {
        throw new Error('Printer services not found');
      }

      const canCommunicate = await testPrinterSimple(
        discoveredDevice,
        service.uuid,
        characteristic.uuid
      );

      if (!canCommunicate) {
        throw new Error('Cannot communicate with printer');
      }

      setConnectedDevice(discoveredDevice);
      setPrinterService(service);
      setWriteCharacteristic(characteristic);
      setConnectionStatus('connected');

      console.log('✅ Quick connect successful!');
      Alert.alert('Success', `Connected to ${savedPrinter.name}`);
    } catch (error: any) {
      console.log('❌ Quick connect failed:', error);
      Alert.alert(
        'Connection Failed',
        'Could not connect to saved printer. Please scan and connect again.'
      );
    } finally {
      setConnecting(false);
    }
  }

  // ==================== PRINTING FUNCTIONS ====================

  async function writeToPrinter(data: number[]): Promise<void> {
  if (!connectedDevice || !printerService || !writeCharacteristic) {
    throw new Error('Not connected to printer');
  }

  try {
    const CHUNK_SIZE = 20; // BLE typically handles 20 bytes per packet well
    
    // Split data into chunks
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const buffer = Buffer.from(chunk);
      const base64Data = buffer.toString('base64');

      console.log(`📤 Sending chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(data.length / CHUNK_SIZE)}`);

      await connectedDevice.writeCharacteristicWithoutResponseForService(
        printerService.uuid,
        writeCharacteristic.uuid,
        base64Data
      );

      // Small delay between chunks to prevent overwhelming the printer
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    
    console.log('✅ All data written successfully');
  } catch (error) {
    console.log('❌ Write failed:', error);
    throw new Error(`Failed to write to printer: ${error.message || 'Unknown error'}`);
  }
}

// Updated printTestText function
async function printTestText(text: string): Promise<void> {
  if (!connectedDevice || !printerService || !writeCharacteristic) {
    Alert.alert('Error', 'Not connected to printer');
    return;
  }

  if (!text.trim()) {
    Alert.alert('Error', 'Please enter text to print');
    return;
  }

  setPrinting(true);

  try {
    console.log('🖨️ Printing test text...');
    console.log('📝 Text length:', text.length);

    // Initialize printer
    const initCommands = [0x1b, 0x40];
    await writeToPrinter(initCommands);
    
    // Convert text to bytes and send
    const textBytes = Buffer.from(text, 'utf8');
    await writeToPrinter(Array.from(textBytes));
    
    // Add line feeds and paper cut
    const endCommands = [
      0x0a, // Line feed
      0x0a, // Line feed
      0x0a, // Line feed
      0x1b, 0x64, 0x03, // Feed 3 lines
    ];
    await writeToPrinter(endCommands);

    console.log('✅ Print completed successfully');
    Alert.alert('Success', 'Receipt printed successfully!');
  } catch (error: any) {
    console.log('❌ Print failed:', error);
    Alert.alert('Print Failed', error.message || 'Could not print. Please check printer connection.');
  } finally {
    setPrinting(false);
  }
}

  async function printReceipt(receiptData: any): Promise<void> {
    if (!connectedDevice || !printerService || !writeCharacteristic) {
      Alert.alert('Error', 'Not connected to printer');
      return;
    }

    if (!receiptData) {
      Alert.alert('Error', 'No receipt data available');
      return;
    }

    setPrinting(true);

    try {
      console.log('🖨️ Printing receipt...');

      const printCommands = [
        0x1b,
        0x40, // Initialize printer
        ...Buffer.from('=== TEST RECEIPT ===\n\n'),
        ...Buffer.from('Thank you for your order!\n\n\n'),
        0x1b,
        0x64,
        0x03, // Feed 3 lines
      ];

      await writeToPrinter(printCommands);

      Alert.alert('Success', 'Receipt sent to printer!');
    } catch (error: any) {
      console.log('❌ Print failed:', error);
      Alert.alert('Print Failed', 'Could not print receipt. Please check printer connection.');
    } finally {
      setPrinting(false);
    }
  }

  async function printData(data: number[]): Promise<void> {
    if (!connectedDevice || !printerService || !writeCharacteristic) {
      throw new Error('Not connected to printer');
    }

    setPrinting(true);

    try {
      await writeToPrinter(data);
    } catch (error) {
      throw error;
    } finally {
      setPrinting(false);
    }
  }

  // ==================== PROVIDER VALUE ====================

  const value: PrinterContextType = {
    // States
    connectedDevice,
    connectionStatus,
    devices,
    deviceList: Object.values(devices),
    scanning,
    connecting,
    printing,
    savedPrinter,
    isConnected: connectionStatus === 'connected',

    // Scanning functions
    startScan,
    stopScan,

    // Connection functions
    connectToDevice,
    disconnectDevice,
    quickConnectToSavedPrinter,

    // Printing functions
    printTestText,
    printReceipt,
    printData,
  };

  return <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>;
}

// ==================== CUSTOM HOOK ====================

export function usePrinter(): PrinterContextType {
  const context = useContext(PrinterContext);

  if (!context) {
    throw new Error('usePrinter must be used within PrinterProvider');
  }

  return context;
}