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
import { LoginUser } from '../../Api/Services/Auth';
// Import your login API function
// import { LoginUser } from '../../Api/Services/Auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [storedEmail, setStoredEmail] = useState('');
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    checkStoredCredentials();
  }, []);

  const checkStoredCredentials = async () => {
    try {
      setCheckingStorage(true);
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPassword = await AsyncStorage.getItem('password');
      
      console.log('Checking stored credentials:', { savedEmail, hasPassword: !!savedPassword });
      
      if (savedEmail && savedPassword) {
        setHasStoredCredentials(true);
        setStoredEmail(savedEmail);
        setEmail(savedEmail);
        setPassword(savedPassword);
      } else {
        setHasStoredCredentials(false);
      }
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      setHasStoredCredentials(false);
    } finally {
      setCheckingStorage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!hasStoredCredentials) {
      // Full validation when no stored credentials
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!password.trim()) {
        newErrors.password = 'Password is required';
      } else if (password.length < 1) {
        newErrors.password = 'Password is required';
      }
    }
    
    // PIN validation (always required)
    if (!pin.trim()) {
      newErrors.pin = 'PIN is required';
    } else if (pin.length < 1 || pin.length > 6) {
      newErrors.pin = 'PIN must be between 1-6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    
    try {
      const loginData = {
        email: hasStoredCredentials ? storedEmail : email,
        password: hasStoredCredentials ? await AsyncStorage.getItem('password') : password,
        pin: pin
      };
          console.log('Login attempt with data:', loginData);

      let response = await LoginUser(loginData);
        if(response.status ==200){
            await AsyncStorage.setItem('access', response.data.access);
            await AsyncStorage.setItem('refreshToken', response.data.refresh);
            router.push('/(tabs)/Home')
        }
      
      // Simulate successful login  
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        console.log('Error response:', error.response.data);
        Alert.alert(
          'Login Error',
          error.response.data?.message || `Server error: ${error.response.status}`
        );
      } else {
        Alert.alert('Login Error', 'An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearCredentials = async () => {
    try {
      await AsyncStorage.removeItem('user_email');
      await AsyncStorage.removeItem('user_password');
      setHasStoredCredentials(false);
      setStoredEmail('');
      setEmail('');
      setPassword('');
      setPin('');
      setErrors({});
      Alert.alert('Success', 'Stored credentials cleared. Please enter your full login details.');
    } catch (error) {
      console.error('Error clearing credentials:', error);
      Alert.alert('Error', 'Failed to clear stored credentials.');
    }
  };

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'pin':
        setPin(value);
        break;
    }
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  if (checkingStorage) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Checking saved credentials...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Welcome to Coffy Byte</Text>
          <Text style={styles.subtitle}>
            {hasStoredCredentials 
              ? `Welcome back, ${storedEmail}` 
              : 'Sign in to your POS account'
            }
          </Text>
        </View>

        {/* Credential Status */}
        {hasStoredCredentials && (
          <View style={styles.credentialStatus}>
            <Text style={styles.credentialStatusText}>
              ✓ Using saved credentials for: {storedEmail}
            </Text>
            <TouchableOpacity onPress={handleClearCredentials}>
              <Text style={styles.clearCredentialsText}>Use different account?</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          {!hasStoredCredentials && (
            <>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => handleInputChange('email', text)}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={(text) => handleInputChange('password', text)}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </>
          )}

          <TextInput
            style={[styles.input, errors.pin && styles.inputError]}
            placeholder={hasStoredCredentials ? "Enter your PIN" : "PIN (1-6 characters)"}
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            secureTextEntry
            value={pin}
            onChangeText={(text) => handleInputChange('pin', text)}
            maxLength={6}
          />
          {errors.pin && <Text style={styles.errorText}>{errors.pin}</Text>}

          {!hasStoredCredentials && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Debug Info - remove in production
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>Has Stored Credentials: {hasStoredCredentials ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Stored Email: {storedEmail || 'None'}</Text>
          <Text style={styles.debugText}>Current PIN: {pin || 'Empty'}</Text>
          <Text style={styles.debugText}>Errors: {JSON.stringify(errors, null, 2)}</Text>
        </View> */}

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <Text style={styles.loginButtonText}>Signing In...</Text>
          ) : (
            <Text style={styles.loginButtonText}>
              {hasStoredCredentials ? 'Sign In with PIN' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/Screens/Admin/Register')}>
            <Text style={styles.signupLink}>Create one</Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
    textAlign: 'center',
  },
  credentialStatus: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    marginBottom: 20,
  },
  credentialStatusText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  clearCredentialsText: {
    color: '#7c3aed',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  formContainer: {
    marginBottom: 24,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#7c3aed',
    fontSize: 14,
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
  loginButton: {
    backgroundColor: '#7c3aed',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  loginButtonDisabled: {
    backgroundColor: '#c4b5fd',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#6b7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '500',
  },
});