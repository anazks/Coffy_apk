import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function BranchManagement() {
  const [activeTab, setActiveTab] = useState('Branches');
  const [modalVisible, setModalVisible] = useState(false);
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
    pos_settings: { tax_rate: '', currency: '' },
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
    
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    Alert.alert('Success', 'Branch added successfully');
    setModalVisible(false);
    
    // Reset form
    setFormData({
      name: '',
      branch_code: '',
      address: { street: '', city: '', state: '', zip: '' },
      contact_info: { phone: '', email: '' },
      manager_contact: { name: '', phone: '', email: '' },
      is_main_branch: false,
      seating_capacity: '',
      kitchen_printer_config: { ip: '', port: '' },
      receipt_printer_config: { ip: '', port: '' },
      pos_settings: { tax_rate: '', currency: '' },
      is_active: true
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Branches':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Branch Management</Text>
            <Text style={styles.tabDescription}>
              Manage your business branches, view details, and configure settings.
            </Text>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Add New Branch</Text>
            </TouchableOpacity>
            
            <View style={styles.branchList}>
              <Text style={styles.listTitle}>Existing Branches</Text>
              <View style={styles.branchCard}>
                <Text style={styles.branchName}>Main Branch</Text>
                <Text style={styles.branchCode}>Code: MAIN001</Text>
                <Text style={styles.branchStatus}>Status: Active</Text>
              </View>
              <View style={styles.branchCard}>
                <Text style={styles.branchName}>Downtown Branch</Text>
                <Text style={styles.branchCode}>Code: DTWN002</Text>
                <Text style={styles.branchStatus}>Status: Active</Text>
              </View>
            </View>
          </View>
        );
      case 'Taxes':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Tax Settings</Text>
            <Text style={styles.tabDescription}>
              Configure tax rates and settings for your business.
            </Text>
          </View>
        );
      case 'Printer':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Printer Settings</Text>
            <Text style={styles.tabDescription}>
              Manage printer configurations for kitchen and receipts.
            </Text>
          </View>
        );
      case 'Profile':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Profile Settings</Text>
            <Text style={styles.tabDescription}>
              Update your profile information and preferences.
            </Text>
          </View>
        );
      default:
        return <View style={styles.tabContent}></View>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Branches' && styles.activeTab]}
          onPress={() => setActiveTab('Branches')}
        >
          <Text style={[styles.tabText, activeTab === 'Branches' && styles.activeText]}>Branches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Taxes' && styles.activeTab]}
          onPress={() => setActiveTab('Taxes')}
        >
          <Text style={[styles.tabText, activeTab === 'Taxes' && styles.activeText]}>Taxes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Printer' && styles.activeTab]}
          onPress={() => setActiveTab('Printer')}
        >
          <Text style={[styles.tabText, activeTab === 'Printer' && styles.activeText]}>Printer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Profile' && styles.activeTab]}
          onPress={() => setActiveTab('Profile')}
        >
          <Text style={[styles.tabText, activeTab === 'Profile' && styles.activeText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Active Tab Content */}
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>

      {/* Add Branch Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Branch</Text>
            
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
              
              {/* Manager Contact */}
              <Text style={styles.sectionTitle}>Manager Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="Manager Name"
                value={formData.manager_contact.name}
                onChangeText={(text) => handleInputChange('name', text, 'manager_contact')}
              />
              <TextInput
                style={styles.input}
                placeholder="Manager Phone"
                value={formData.manager_contact.phone}
                onChangeText={(text) => handleInputChange('phone', text, 'manager_contact')}
              />
              <TextInput
                style={styles.input}
                placeholder="Manager Email"
                keyboardType="email-address"
                value={formData.manager_contact.email}
                onChangeText={(text) => handleInputChange('email', text, 'manager_contact')}
              />
              
              {/* Printer Configuration */}
              <Text style={styles.sectionTitle}>Printer Configuration</Text>
              <Text style={styles.subSectionTitle}>Kitchen Printer</Text>
              <TextInput
                style={styles.input}
                placeholder="IP Address"
                value={formData.kitchen_printer_config.ip}
                onChangeText={(text) => handleInputChange('ip', text, 'kitchen_printer_config')}
              />
              <TextInput
                style={styles.input}
                placeholder="Port"
                value={formData.kitchen_printer_config.port}
                onChangeText={(text) => handleInputChange('port', text, 'kitchen_printer_config')}
              />
              
              <Text style={styles.subSectionTitle}>Receipt Printer</Text>
              <TextInput
                style={styles.input}
                placeholder="IP Address"
                value={formData.receipt_printer_config.ip}
                onChangeText={(text) => handleInputChange('ip', text, 'receipt_printer_config')}
              />
              <TextInput
                style={styles.input}
                placeholder="Port"
                value={formData.receipt_printer_config.port}
                onChangeText={(text) => handleInputChange('port', text, 'receipt_printer_config')}
              />
              
              {/* POS Settings */}
              <Text style={styles.sectionTitle}>POS Settings</Text>
              <TextInput
                style={styles.input}
                placeholder="Tax Rate (%)"
                keyboardType="numeric"
                value={formData.pos_settings.tax_rate}
                onChangeText={(text) => handleInputChange('tax_rate', text, 'pos_settings')}
              />
              <TextInput
                style={styles.input}
                placeholder="Currency"
                value={formData.pos_settings.currency}
                onChangeText={(text) => handleInputChange('currency', text, 'pos_settings')}
              />
              
              {/* Toggles */}
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>Main Branch</Text>
                <Switch
                  value={formData.is_main_branch}
                  onValueChange={(value) => handleInputChange('is_main_branch', value)}
                />
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>Active</Text>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) => handleInputChange('is_active', value)}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Add Branch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activeText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    paddingBottom: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tabDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  branchList: {
    marginTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
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
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  branchCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  branchStatus: {
    fontSize: 14,
    color: '#059669',
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
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: '75%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toggleText: {
    fontSize: 16,
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
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