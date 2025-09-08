import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { addBranch } from '../Api/Services/Branch';
export default function Branch() {
  const [modalVisible, setModalVisible] = useState(false);
  const [branches, setBranches] = useState([
    {
      id: 1,
      name: "Main Branch",
      branch_code: "MAIN001",
      address: { street: "123 Main St", city: "New York", state: "NY", zip: "10001" },
      is_active: true
    },
    {
      id: 2,
      name: "Downtown Branch",
      branch_code: "DTWN002",
      address: { street: "456 Oak Ave", city: "Los Angeles", state: "CA", zip: "90001" },
      is_active: true
    }
  ]);

  // Function to handle adding a new branch
  const handleAddBranch = async  (newBranchData) => {
    const newBranch = {
      id: branches.length + 1,
      ...newBranchData
    };
    // Here you would typically make an API call to save the new branch
    let response = await addBranch(newBranchData);
    console.log(response,"---")
    // For now, we'll just update the local state
    setBranches([...branches, newBranch]);
    setModalVisible(false);
    Alert.alert("Success", "Branch added successfully!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Branch Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Branch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.branchList}>
        {branches.map(branch => (
          <View key={branch.id} style={styles.branchCard}>
            <View style={styles.branchHeader}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <View style={[styles.statusIndicator, 
                { backgroundColor: branch.is_active ? '#10B981' : '#EF4444' }]}>
                <Text style={styles.statusText}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <Text style={styles.branchCode}>Code: {branch.branch_code}</Text>
            <Text style={styles.branchAddress}>
              {branch.address.street}, {branch.address.city}, {branch.address.state} {branch.address.zip}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Modal for adding new branch */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Branch</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            {/* AddBranch component with callback function */}
            <AddBranch 
              onSubmit={handleAddBranch} 
              onCancel={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Updated AddBranch component with the form
const AddBranch = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    branch_code: '',
    address: { street: '', city: '', state: '', zip: '' },
    contact_info: { phone: '', email: '' },
    manager_contact: { name: '', phone: '', email: '' },
    is_main_branch: false,
    seating_capacity: '',
    kitchen_printer_config: { ip: '', port: '' },
    receipt_printer_config: { ip: '', port: '' },
    pos_settings: { tax_rate: '', currency: 'USD' },
    is_active: true
  });

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.branch_code) {
      Alert.alert('Error', 'Name and Branch Code are required');
      return;
    }
    
    // Call the onSubmit function passed as prop
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.formContainer}>
      {/* Basic Information */}
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Branch Name *"
        value={formData.name}
        onChangeText={(text) => handleInputChange('name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Branch Code *"
        value={formData.branch_code}
        onChangeText={(text) => handleInputChange('branch_code', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Seating Capacity"
        keyboardType="numeric"
        value={formData.seating_capacity}
        onChangeText={(text) => handleInputChange('seating_capacity', text)}
      />
      
      {/* Address */}
      <Text style={styles.sectionTitle}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street"
        value={formData.address.street}
        onChangeText={(text) => handleInputChange('street', text, 'address')}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.address.city}
        onChangeText={(text) => handleInputChange('city', text, 'address')}
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        value={formData.address.state}
        onChangeText={(text) => handleInputChange('state', text, 'address')}
      />
      <TextInput
        style={styles.input}
        placeholder="ZIP Code"
        value={formData.address.zip}
        onChangeText={(text) => handleInputChange('zip', text, 'address')}
      />
      
      {/* Contact Information */}
      <Text style={styles.sectionTitle}>Contact Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.contact_info.phone}
        onChangeText={(text) => handleInputChange('phone', text, 'contact_info')}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={formData.contact_info.email}
        onChangeText={(text) => handleInputChange('email', text, 'contact_info')}
      />
      
      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Add Branch</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  branchList: {
    flex: 1,
  },
  branchCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  branchCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  branchAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6B7280',
  },
  formContainer: {
    padding: 16,
    maxHeight: '80%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});