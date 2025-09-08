import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  customerCode: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SaveCustomerProps {
  onSave?: (customer: Customer) => void;
  onCancel?: () => void;
  initialCustomer?: Partial<Customer>;
  existingCustomers?: Customer[];
}

export default function SaveCustomer({
  onSave = () => {},
  onCancel = () => {},
  initialCustomer = {},
  existingCustomers = []
}: SaveCustomerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: initialCustomer.name || '',
    email: initialCustomer.email || '',
    phone: initialCustomer.phone || '',
    address: initialCustomer.address || '',
    city: initialCustomer.city || '',
    state: initialCustomer.state || '',
    postalCode: initialCustomer.postalCode || '',
    country: initialCustomer.country || 'United States',
    customerCode: initialCustomer.customerCode || '',
    note: initialCustomer.note || '',
  });

  // Generate customer code if not provided
  const generateCustomerCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const namePrefix = formData.name.replace(/\s+/g, '').slice(0, 3).toUpperCase() || 'CUS';
    return `${namePrefix}${timestamp}`;
  };

  // Filter customers based on search query
  const filteredCustomers = existingCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search input
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSearchResults(text.length > 0);
  };

  // Handle customer selection from search
  const handleSelectCustomer = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postalCode: customer.postalCode,
      country: customer.country,
      customerCode: customer.customerCode,
      note: customer.note,
    });
    setSearchQuery(customer.name);
    setShowSearchResults(false);
    setIsEditing(true);
  };

  // Handle form input changes
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email address is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  // Handle save customer
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Generate customer code if not provided
      const customerCode = formData.customerCode || generateCustomerCode();
      
      // Check if customer code already exists
      const codeExists = existingCustomers.some(
        customer => customer.customerCode === customerCode && 
        customer.id !== initialCustomer.id
      );
      
      if (codeExists) {
        Alert.alert('Error', 'Customer code already exists. Please enter a different code.');
        setIsSaving(false);
        return;
      }

      const customerData: Customer = {
        id: initialCustomer.id || Date.now().toString(),
        ...formData,
        customerCode,
        createdAt: initialCustomer.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSave(customerData);
      
      Alert.alert(
        'Success', 
        isEditing ? 'Customer updated successfully!' : 'Customer saved successfully!',
        [{ text: 'OK' }]
      );

      // Reset form if creating new customer
      if (!isEditing) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          customerCode: '',
          note: '',
        });
        setSearchQuery('');
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to save customer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle new customer
  const handleNewCustomer = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      customerCode: '',
      note: '',
    });
    setSearchQuery('');
    setIsEditing(false);
    setShowSearchResults(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Customer' : 'Add Customer'}
            </Text>
            {isEditing && (
              <TouchableOpacity
                style={styles.newCustomerButton}
                onPress={handleNewCustomer}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#2563eb" />
                <Text style={styles.newCustomerText}>New</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Customer</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email, phone, or customer code..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {showSearchResults && (
              <View style={styles.searchResults}>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.slice(0, 5).map((customer) => (
                    <TouchableOpacity
                      key={customer.id}
                      style={styles.searchResultItem}
                      onPress={() => handleSelectCustomer(customer)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <Text style={styles.customerDetails}>
                          {customer.email} • {customer.phone}
                        </Text>
                        <Text style={styles.customerCode}>
                          Code: {customer.customerCode}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No customers found</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Customer Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter customer's full name"
                placeholderTextColor="#94a3b8"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                maxLength={100}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="customer@example.com"
                placeholderTextColor="#94a3b8"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#94a3b8"
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="123 Main Street, Apt 4B"
                placeholderTextColor="#94a3b8"
                value={formData.address}
                onChangeText={(text) => updateFormData('address', text)}
                maxLength={200}
              />
            </View>

            {/* City, State Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="New York"
                  placeholderTextColor="#94a3b8"
                  value={formData.city}
                  onChangeText={(text) => updateFormData('city', text)}
                  maxLength={50}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="NY"
                  placeholderTextColor="#94a3b8"
                  value={formData.state}
                  onChangeText={(text) => updateFormData('state', text)}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Postal Code, Country Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Postal Code</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10001"
                  placeholderTextColor="#94a3b8"
                  value={formData.postalCode}
                  onChangeText={(text) => updateFormData('postalCode', text)}
                  maxLength={20}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="United States"
                  placeholderTextColor="#94a3b8"
                  value={formData.country}
                  onChangeText={(text) => updateFormData('country', text)}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Customer Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Customer Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Auto-generated if empty"
                placeholderTextColor="#94a3b8"
                value={formData.customerCode}
                onChangeText={(text) => updateFormData('customerCode', text)}
                maxLength={20}
                autoCapitalize="characters"
              />
              <Text style={styles.helperText}>
                Leave empty to auto-generate a unique customer code
              </Text>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                placeholder="Additional notes about the customer..."
                placeholderTextColor="#94a3b8"
                value={formData.note}
                onChangeText={(text) => updateFormData('note', text)}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Update Customer' : 'Save Customer'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  newCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newCustomerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  customerDetails: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  customerCode: {
    fontSize: 11,
    color: '#94a3b8',
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});