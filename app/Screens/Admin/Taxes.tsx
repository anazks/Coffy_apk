import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AddTax, getTaxes } from '../../Api/Services/Products'; // adjust path

export default function Taxes() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    tax_name: '',
    tax_percentage: '',
    is_active: true,
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await getTaxes();
      if (response.status === 200) {
        setTaxes(response.data || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch taxes');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch taxes');
      console.error('Fetch Taxes Error:', error);
    } finally {
      setLoading(false);
    }
  };

const handleSaveTax = async () => {
  if (!formData.tax_name || !formData.tax_percentage) {
    Alert.alert('Validation', 'Please fill all fields');
    return;
  }

  try {
    const taxData = {
      tax_name: formData.tax_name.trim(),
      tax_percentage: parseFloat(formData.tax_percentage),
      is_active: formData.is_active,
    };

    setLoading(true);
    const response = await AddTax(taxData);

    if (response.success) {
      Alert.alert('Success', 'Tax added successfully');
      resetForm();
      setModalVisible(false); // ✅ close modal immediately
      fetchTaxes();           // ✅ refresh taxes list
    } else {
      Alert.alert('Error', response.message || 'Failed to add tax');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to add tax');
    console.error('Add Tax Error:', error);
  } finally {
    setLoading(false);
  }
};



  const resetForm = () => {
    setFormData({
      tax_name: '',
      tax_percentage: '',
      is_active: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Taxes</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={20} color="white" />
          <Text style={styles.addText}>Add Tax</Text>
        </TouchableOpacity>
      </View>

      {/* Tax List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : taxes.length === 0 ? (
        <Text style={styles.emptyText}>No taxes available</Text>
      ) : (
        <FlatList
          data={taxes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taxItem}>
              <Text style={styles.taxName}>{item.tax_name}</Text>
              <Text style={styles.taxPercent}>{item.tax_percentage}%</Text>
            </View>
          )}
        />
      )}

      {/* Add Tax Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Tax</Text>

            <TextInput
              style={styles.input}
              placeholder="Tax Name"
              value={formData.tax_name}
              onChangeText={(text) => setFormData({ ...formData, tax_name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Tax Percentage"
              value={formData.tax_percentage}
              onChangeText={(text) => setFormData({ ...formData, tax_percentage: text })}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text>Active</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(val) => setFormData({ ...formData, is_active: val })}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveTax}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', padding: 10, borderRadius: 8 },
  addText: { color: 'white', marginLeft: 6, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  taxItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 8, elevation: 2 },
  taxName: { fontSize: 16, fontWeight: '500', color: '#111827' },
  taxPercent: { fontSize: 14, color: '#6B7280' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelButton: { marginRight: 12 },
  cancelText: { color: '#374151', fontSize: 16 },
  saveButton: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: 'white', fontWeight: '500' },
});
