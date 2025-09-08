import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RegisterUser, getHealth } from '../../Api/Services/Auth';

export default function Register() {
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const healthStatus = await getHealth();
        console.log('API Health Status:', healthStatus);
      } catch (error) {
        console.error('API Health Check Failed:', error);
        Alert.alert('Error', 'Unable to reach the server. Please try again later.');
      }
    };
    checkApiHealth();
  }, []);

  const [formData, setFormData] = useState({
    store_name: '',
    store_code: '',
    owner_name: '',
    business_type: '',
    owner_email: '',
    owner_password: '',
    owner_pin: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Store information validation
    if (!formData.store_name.trim()) newErrors.store_name = 'Store name is required';
    if (!formData.store_code.trim()) newErrors.store_code = 'Store code is required';
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required';
    if (!formData.business_type.trim()) newErrors.business_type = 'Business type is required';
    
    // Account information validation
    if (!formData.owner_email.trim()) newErrors.owner_email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.owner_email)) newErrors.owner_email = 'Email is invalid';
    if (!formData.owner_password) newErrors.owner_password = 'Password is required';
    else if (formData.owner_password.length < 6) newErrors.owner_password = 'Password must be at least 6 characters';
    
    // Security validation
    if (!formData.owner_pin.trim()) newErrors.owner_pin = 'Owner PIN is required';
    else if (formData.owner_pin.length < 4) newErrors.owner_pin = 'PIN must be at least 4 digits';
    else if (!/^\d+$/.test(formData.owner_pin)) newErrors.owner_pin = 'PIN must contain only numbers';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      setLoading(true);
      
      // Log the exact data being sent
      console.log('Registration data being sent:', JSON.stringify(formData, null, 2));
      console.log('Form data types:', {
        store_name: typeof formData.store_name,
        store_code: typeof formData.store_code,
        owner_name: typeof formData.owner_name,
        business_type: typeof formData.business_type,
        owner_email: typeof formData.owner_email,
        owner_password: typeof formData.owner_password,
        owner_pin: typeof formData.owner_pin
      });
      
      try {
        let response = await RegisterUser(formData);
        await AsyncStorage.setItem('email', formData.owner_email);
        await AsyncStorage.setItem('password', formData.owner_password);
        console.log('Registration response:', response);
          if(response.status ==201){
              router.push('/Screens/Admin/Login')
          }
        if (response.status === 201) {
          Alert.alert(
            'Success', 
            'Store registered successfully!',
            [{ text: 'OK', onPress: () => router.push('/Screens/Admin/Login') }]
          );
        } else {
          Alert.alert('Error', response.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Registration error details:', error);
        
        // Better error handling
        if (error.response) {
          // Server responded with error status
          console.log('Error response status:', error.response.status);
          console.log('Error response data:', error.response.data);
          
          if (error.response.status === 500) {
            Alert.alert(
              'Server Error', 
              `Internal server error (500). Details: ${JSON.stringify(error.response.data, null, 2)}`
            );
          } else {
            Alert.alert(
              'Error', 
              error.response.data?.message || `Server error: ${error.response.status}`
            );
          }
        } else if (error.request) {
          // Request was made but no response
          console.log('No response received:', error.request);
          Alert.alert('Error', 'No response from server. Please check your connection.');
        } else {
          // Something else happened
          console.log('Error message:', error.message);
          Alert.alert('Error', error.message || 'An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Form validation failed with errors:', errors);
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Add a test function to populate form with your working Postman data
  const fillTestData = () => {
    setFormData({
      store_name: 'Coffieday',
      store_code: '123456',
      owner_name: 'Pramod G',
      business_type: 'restaurant',
      owner_email: 'gopinath222.pramod@gmail.com',
      owner_password: '1234@qwer',
      owner_pin: '771199'
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Register Your Store</Text>
          <Text style={styles.subtitle}>Join Coffy Byte POS System</Text>
          
          {/* Test button - remove this in production */}
          {/* <TouchableOpacity onPress={fillTestData} style={styles.testButton}>
            <Text style={styles.testButtonText}>Fill Test Data</Text>
          </TouchableOpacity> */}
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Store Information Section */}
          <Text style={styles.sectionTitle}>Store Information</Text>
          
          <TextInput
            style={[styles.input, errors.store_name && styles.inputError]}
            placeholder="Store Name"
            placeholderTextColor="#9ca3af"
            value={formData.store_name}
            onChangeText={(text) => handleChange('store_name', text)}
          />
          {errors.store_name && <Text style={styles.errorText}>{errors.store_name}</Text>}

          <TextInput
            style={[styles.input, errors.store_code && styles.inputError]}
            placeholder="Store Code"
            placeholderTextColor="#9ca3af"
            value={formData.store_code}
            onChangeText={(text) => handleChange('store_code', text)}
          />
          {errors.store_code && <Text style={styles.errorText}>{errors.store_code}</Text>}

          <TextInput
            style={[styles.input, errors.owner_name && styles.inputError]}
            placeholder="Owner Name"
            placeholderTextColor="#9ca3af"
            value={formData.owner_name}
            onChangeText={(text) => handleChange('owner_name', text)}
          />
          {errors.owner_name && <Text style={styles.errorText}>{errors.owner_name}</Text>}

          <TextInput
            style={[styles.input, errors.business_type && styles.inputError]}
            placeholder="Business Type (e.g., Cafe, Restaurant)"
            placeholderTextColor="#9ca3af"
            value={formData.business_type}
            onChangeText={(text) => handleChange('business_type', text)}
          />
          {errors.business_type && <Text style={styles.errorText}>{errors.business_type}</Text>}

          {/* Account Information Section */}
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <TextInput
            style={[styles.input, errors.owner_email && styles.inputError]}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.owner_email}
            onChangeText={(text) => handleChange('owner_email', text)}
          />
          {errors.owner_email && <Text style={styles.errorText}>{errors.owner_email}</Text>}

          <TextInput
            style={[styles.input, errors.owner_password && styles.inputError]}
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={formData.owner_password}
            onChangeText={(text) => handleChange('owner_password', text)}
          />
          {errors.owner_password && <Text style={styles.errorText}>{errors.owner_password}</Text>}

          {/* Security Section */}
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TextInput
            style={[styles.input, errors.owner_pin && styles.inputError]}
            placeholder="Owner PIN (min 4 digits)"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            secureTextEntry
            value={formData.owner_pin}
            onChangeText={(text) => handleChange('owner_pin', text)}
            maxLength={6}
          />
          {errors.owner_pin && <Text style={styles.errorText}>{errors.owner_pin}</Text>}
        </View>

        {/* Debug Info - remove in production */}
        {/* <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>Data: {JSON.stringify(formData, null, 2)}</Text>
          <Text style={styles.debugText}>Errors: {JSON.stringify(errors, null, 2)}</Text>
        </View> */}

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <Text style={styles.registerButtonText}>Registering Store...</Text>
          ) : (
            <Text style={styles.registerButtonText}>Register Store</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/Screens/Admin/Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#581c87',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  testButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#581c87',
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  debugContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: '#7c3aed',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  registerButtonDisabled: {
    backgroundColor: '#c4b5fd',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '500',
  },
});