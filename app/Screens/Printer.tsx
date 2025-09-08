import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Printer() {
  const [printerName, setPrinterName] = useState('');
  const [printerIP, setPrinterIP] = useState('');
  const [printerPort, setPrinterPort] = useState('');
  const [printerType, setPrinterType] = useState('Bluetooth');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (!printerName || !printerType) {
      Alert.alert('Validation', 'Please fill in all required fields');
      return;
    }

    const config = {
      printerName,
      printerIP,
      printerPort,
      printerType,
      isDefault,
    };

    console.log('Printer Config:', config);
    Alert.alert('Saved', 'Printer configuration saved successfully!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Printer Configuration</Text>

      <TextInput
        style={styles.input}
        placeholder="Printer Name"
        value={printerName}
        onChangeText={setPrinterName}
      />

      <TextInput
        style={styles.input}
        placeholder="IP Address (for network printer)"
        value={printerIP}
        onChangeText={setPrinterIP}
      />

      <TextInput
        style={styles.input}
        placeholder="Port (e.g. 9100)"
        value={printerPort}
        onChangeText={setPrinterPort}
        keyboardType="numeric"
      />

      {/* Printer Type Selector */}
      <View style={styles.typeRow}>
        {['Bluetooth', 'USB', 'Network'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              printerType === type && styles.activeTypeButton,
            ]}
            onPress={() => setPrinterType(type)}
          >
            <Text
              style={[
                styles.typeText,
                printerType === type && styles.activeTypeText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Default Printer Switch */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Set as Default</Text>
        <Switch value={isDefault} onValueChange={setIsDefault} />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Configuration</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  typeButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeTypeButton: { backgroundColor: '#4F46E5' },
  typeText: { color: '#374151', fontWeight: '500' },
  activeTypeText: { color: 'white' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  switchLabel: { fontSize: 16, color: '#111827' },
  saveButton: { backgroundColor: '#4F46E5', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
