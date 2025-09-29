import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RegisterUser } from '../../Api/Services/Auth';
export default function Register() {
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const healthStatus = await getHealth();
        console.log('API Health Status:', healthStatus);
      } catch (error) {
        console.log('API Health Check Failed:', error);
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
    owner_pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.store_name.trim()) newErrors.store_name = 'Store name is required';
    if (!formData.store_code.trim()) newErrors.store_code = 'Store code is required';
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required';
    if (!formData.business_type) newErrors.business_type = 'Business type is required';
    if (!formData.owner_email.trim()) newErrors.owner_email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.owner_email)) newErrors.owner_email = 'Email is invalid';
    if (!formData.owner_password) newErrors.owner_password = 'Password is required';
    else if (formData.owner_password.length < 6) newErrors.owner_password = 'Password must be at least 6 characters';
    if (!formData.owner_pin.trim()) newErrors.owner_pin = 'Owner PIN is required';
    else if (formData.owner_pin.length < 4) newErrors.owner_pin = 'PIN must be at least 4 digits';
    else if (!/^\d+$/.test(formData.owner_pin)) newErrors.owner_pin = 'PIN must contain only numbers';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      setLoading(true);
      console.log('Registration data being sent:', JSON.stringify(formData, null, 2));
      try {
        let response = await RegisterUser(formData);
        await AsyncStorage.setItem('email', formData.owner_email);
        await AsyncStorage.setItem('password', formData.owner_password);
        console.log('Registration response:', response);
        if (response.status === 201) {
          Alert.alert('Success', 'Store registered successfully!', [
            { text: 'OK', onPress: () => router.push('/Screens/Admin/Login') },
          ]);
        } else {
          Alert.alert('Error', response.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.log('Registration error details:', error);
        if (error.response) {
          console.log('Error response status:', error.response.status);
          console.log('Error response data:', error.response.data);
          if (error.response.status === 500) {
            Alert.alert('Server Error', `Internal server error (500). Details: ${JSON.stringify(error.response.data, null, 2)}`);
          } else {
            Alert.alert('Error', error.response.data?.message || `Server error: ${error.response.status}`);
          }
        } else if (error.request) {
          console.log('No response received:', error.request);
          Alert.alert('Error', 'No response from server. Please check your connection.');
        } else {
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
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
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
          <Text style={styles.title}>Create Your Store</Text>
          <Text style={styles.subtitle}>Join the Coffy Byte POS System</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Store Information Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Store Information</Text>
            <Text style={styles.sectionIcon}>🏬</Text>
          </View>
          
          <TextInput
            style={[styles.input, errors.store_name && styles.inputError, focusedInput === 'store_name' && styles.inputFocused]}
            placeholder="Store Name"
            placeholderTextColor="#9ca3af"
            value={formData.store_name}
            onChangeText={(text) => handleChange('store_name', text)}
            onFocus={() => setFocusedInput('store_name')}
            onBlur={() => setFocusedInput(null)}
            accessibilityLabel="Store Name"
          />
          {errors.store_name && <Text style={styles.errorText}>{errors.store_name}</Text>}

          <TextInput
            style={[styles.input, errors.store_code && styles.inputError, focusedInput === 'store_code' && styles.inputFocused]}
            placeholder="Store Code"
            placeholderTextColor="#9ca3af"
            value={formData.store_code}
            onChangeText={(text) => handleChange('store_code', text)}
            onFocus={() => setFocusedInput('store_code')}
            onBlur={() => setFocusedInput(null)}
            accessibilityLabel="Store Code"
          />
          {errors.store_code && <Text style={styles.errorText}>{errors.store_code}</Text>}

          <TextInput
            style={[styles.input, errors.owner_name && styles.inputError, focusedInput === 'owner_name' && styles.inputFocused]}
            placeholder="Owner Name"
            placeholderTextColor="#9ca3af"
            value={formData.owner_name}
            onChangeText={(text) => handleChange('owner_name', text)}
            onFocus={() => setFocusedInput('owner_name')}
            onBlur={() => setFocusedInput(null)}
            accessibilityLabel="Owner Name"
          />
          {errors.owner_name && <Text style={styles.errorText}>{errors.owner_name}</Text>}

          <View style={[styles.pickerContainer, errors.business_type && styles.inputError]}>
            <Picker
              selectedValue={formData.business_type}
              onValueChange={(itemValue) => handleChange('business_type', itemValue)}
              style={styles.picker}
              accessibilityLabel="Business Type"
            >
              <Picker.Item label="Select Business Type" value="" />
              <Picker.Item label="Cafe" value="cafe" />
              <Picker.Item label="Restaurant" value="restaurant" />
            </Picker>
          </View>
          {errors.business_type && <Text style={styles.errorText}>{errors.business_type}</Text>}

          {/* Account Information Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <Text style={styles.sectionIcon}>👤</Text>
          </View>
          
          <TextInput
            style={[styles.input, errors.owner_email && styles.inputError, focusedInput === 'owner_email' && styles.inputFocused]}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.owner_email}
            onChangeText={(text) => handleChange('owner_email', text)}
            onFocus={() => setFocusedInput('owner_email')}
            onBlur={() => setFocusedInput(null)}
            accessibilityLabel="Email Address"
          />
          {errors.owner_email && <Text style={styles.errorText}>{errors.owner_email}</Text>}

          <TextInput
            style={[styles.input, errors.owner_password && styles.inputError, focusedInput === 'owner_password' && styles.inputFocused]}
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={formData.owner_password}
            onChangeText={(text) => handleChange('owner_password', text)}
            onFocus={() => setFocusedInput('owner_password')}
            onBlur={() => setFocusedInput(null)}
            accessibilityLabel="Password"
          />
          {errors.owner_password && <Text style={styles.errorText}>{errors.owner_password}</Text>}

          {/* Security Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security</Text>
            <Text style={styles.sectionIcon}>🔒</Text>
          </View>
          
          <TextInput
            style={[styles.input, errors.owner_pin && styles.inputError, focusedInput === 'owner_pin' && styles.inputFocused]}
            placeholder="Owner PIN (min 4 digits)"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            secureTextEntry
            value={formData.owner_pin}
            onChangeText={(text) => handleChange('owner_pin', text)}
            maxLength={6}
            onFocus={() => setFocusedInput('owner_pin')}
            onBlur={() => setFocusedInput(null)}
            accessibilityLabel="Owner PIN"
          />
          {errors.owner_pin && <Text style={styles.errorText}>{errors.owner_pin}</Text>}
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Register Store"
        >
          <View style={[styles.registerButton, loading && styles.registerButtonDisabled]}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Register Store</Text>
            )}
          </View>
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
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#581c87',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#581c87',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  inputFocused: {
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    color: '#111827',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  registerButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#c4b5fd',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
});