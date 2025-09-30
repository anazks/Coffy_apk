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
import { AddTax, deleteTax, editTax, getTaxes } from '../../Api/Services/Products'; // adjust path
import CustomAlert from '@/app/Components/Alert/Alert';

export default function Taxes() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    tax_id: null,
    tax_name: '',
    tax_percentage: '',
    is_active: true,
  });
  
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  // Function to show the alert
  const showAlert = (type, title, message) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  // Function to hide the alert, passed to the CustomAlert component
  const hideAlert = () => {
      setAlertConfig({ ...alertConfig, visible: false });
  };

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
        showAlert('error', 'Error', response.message || 'Failed to fetch taxes');
      }
    } catch (error) {
      showAlert('error', 'Error', 'Failed to fetch taxes');
      console.log('Fetch Taxes Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTax = async () => {
    if (!formData.tax_name || !formData.tax_percentage) {
      showAlert('warning', 'Validation Error', 'Please fill all fields');
      return;
    }

    const taxPercentage = parseFloat(formData.tax_percentage);
    if (isNaN(taxPercentage) || taxPercentage < 0 || taxPercentage > 100) {
      showAlert('error', 'Validation Error', 'Tax percentage must be a valid number between 0 and 100');
      return;
    }

    try {
      const taxData = {
        tax_name: formData.tax_name.trim(),
        tax_percentage: taxPercentage,
        is_active: formData.is_active,
      };

      setLoading(true);
      let response;
      if (isEditing) {
        response = await editTax(formData.tax_id, taxData);
      } else {
        response = await AddTax(taxData);
      }

      if ([200, 201, 204].includes(response.status)) {
        showAlert('success', 'Success', isEditing ? 'Tax updated successfully' : 'Tax added successfully');
        resetForm();
        setModalVisible(false);
        setIsEditing(false);
        fetchTaxes();
      } else {
        showAlert('error', 'Error', response.message || `Failed to ${isEditing ? 'update' : 'add'} tax`);
      }
    } catch (error) {
      console.log(`${isEditing ? 'Edit' : 'Add'} Tax Error:`, error.response?.data, error.response?.status, error.message);
      showAlert('error', 'Error', `Failed to ${isEditing ? 'update' : 'add'} tax: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Using native Alert for confirmation is often better for user experience
  const handleDeleteTax = async (taxId, taxName) => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Tax',
      `Are you sure you want to delete ${taxName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await deleteTax(taxId);
              if ([200, 201, 204].includes(response.status)) {
                showAlert('success', 'Success', 'Tax deleted successfully');
                fetchTaxes();
              } else {
                showAlert('error', 'Error', response.message || 'Failed to delete tax');
              }
            } catch (error) {
              console.log('Delete Tax Error:', error.response?.data, error.response?.status, error.message);
              showAlert('error', 'Error', `Failed to delete tax: ${error.response?.data?.message || error.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditTax = (tax) => {
    setMenuVisible(false);
    setFormData({
      tax_id: tax.id,
      tax_name: tax.tax_name,
      tax_percentage: tax.tax_percentage.toString(),
      is_active: tax.is_active,
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const openMenu = (tax) => {
    setSelectedTax(tax);
    setMenuVisible(true);
  };

  const resetForm = () => {
    setFormData({
      tax_id: null,
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
          onPress={() => {
            resetForm();
            setIsEditing(false);
            setModalVisible(true);
          }}
          disabled={loading}
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
              <View style={styles.taxInfo}>
                <Text style={styles.taxName}>{item.tax_name}</Text>
                <Text style={styles.taxPercent}>{item.tax_percentage}%</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => openMenu(item)}
                  disabled={loading}
                >
                  <Icon name="more-vert" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add/Edit Tax Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Tax' : 'Add New Tax'}</Text>

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
                onPress={() => {
                  setModalVisible(false);
                  setIsEditing(false);
                  resetForm();
                }}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, loading && { opacity: 0.6 }]}
                onPress={handleSaveTax}
                disabled={loading}
              >
                <Text style={styles.saveText}>{loading ? 'Saving...' : isEditing ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Modal for Edit/Delete */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPressOut={() => setMenuVisible(false)}>
            <View style={styles.menuContent}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleEditTax(selectedTax)}
                    disabled={loading}
                >
                    <Icon name="edit" size={20} color="#4F46E5" />
                    <Text style={styles.menuItemText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleDeleteTax(selectedTax?.id, selectedTax?.tax_name)}
                    disabled={loading}
                >
                    <Icon name="delete" size={20} color="#EF4444" />
                    <Text style={styles.menuItemText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>
      
     
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', padding: 10, borderRadius: 8 },
    addText: { color: 'white', marginLeft: 6, fontWeight: '500' },
    emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
    taxItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    taxInfo: { flex: 1 },
    taxName: { fontSize: 16, fontWeight: '500', color: '#111827' },
    taxPercent: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12, width: '90%', elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20, color: '#111827' },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    cancelButton: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 12 },
    cancelText: { color: '#374151', fontSize: 16, fontWeight: '500' },
    saveButton: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    saveText: { color: 'white', fontWeight: '500', fontSize: 16 },
    menuOverlay: {
        flex: 1,
        // The menu will be positioned manually, so we don't need justify/align here
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    menuContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        width: 160,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        position: 'absolute', // Added for better positioning if needed
        top: 150, // Example positioning, adjust as necessary
        right: 20, // Example positioning
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12
    },
    menuItemText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 12
    },
});