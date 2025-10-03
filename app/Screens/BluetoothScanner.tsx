// BluetoothScanner.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { BleManager } from "react-native-ble-plx";
import { requestBluetoothPermissions } from "../Api/Services/requestBluetoothPermissions";

export default function BluetoothScanner() {
  const manager = useRef(new BleManager()).current;
  const [devices, setDevices] = useState({});
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
    };
  }, []);

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

    // auto stop after 10s
    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  }

  const deviceList = Object.values(devices);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={startScan}>
        <Text style={styles.buttonText}>
          {scanning ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={deviceList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name || "Unknown"}</Text>
            <Text style={styles.sub}>{item.id}</Text>
            <Text style={styles.sub}>RSSI: {item.rssi}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  button: {
    padding: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  sub: { fontSize: 12, color: "#666" },
});
