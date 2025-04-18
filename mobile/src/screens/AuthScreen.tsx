import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../contexts/ThemeContext';
import authService from '../api/auth';

const AuthScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Clear validation errors when switching between login and register
  useEffect(() => {
    setValidationErrors({});
  }, [isLogin]);
  
  const validate = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && !username.trim()) {
      errors.username = 'Username is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleLogin = async () => {
    if (!validate()) return;
    
    Keyboard.dismiss();
    setIsLoading(true);
    
    try {
      await authService.login({ email, password });
      // Authentication success will be handled by the App component
      // when it checks for the auth token on next render
    } catch (error) {
      let errorMessage = 'Failed to log in. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async () => {
    if (!validate()) return;
    
    Keyboard.dismiss();
    setIsLoading(true);
    
    try {
      await authService.register({ username, email, password });
      // Authentication success will be handled by the App component
      // when it checks for the auth token on next render
    } catch (error) {
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    error?: string,
    secureTextEntry?: boolean,
    togglePasswordVisibility?: () => void
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={[
        styles.textInputContainer,
        { 
          backgroundColor: colors.card,
          borderColor: error ? colors.error : colors.border
        }
      ]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={label === 'Email' ? 'none' : label === 'Password' ? 'none' : 'words'}
          keyboardType={label === 'Email' ? 'email-address' : 'default'}
          placeholderTextColor={colors.inactive}
        />
        {togglePasswordVisibility && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color={colors.inactive}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>Connect</Text>
            <Text style={[styles.subtitle, { color: colors.inactive }]}>
              {isLogin ? 'Sign in to continue' : 'Create a new account'}
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {!isLogin && renderInput(
              'Username',
              username,
              setUsername,
              validationErrors.username
            )}
            
            {renderInput(
              'Email',
              email,
              setEmail,
              validationErrors.email
            )}
            
            {renderInput(
              'Password',
              password,
              setPassword,
              validationErrors.password,
              !passwordVisible,
              () => setPasswordVisible(!passwordVisible)
            )}
            
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toggleAuthModeButton}
              onPress={() => setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              <Text style={[styles.toggleAuthModeText, { color: colors.primary }]}>
                {isLogin ? 'New to Connect? Create an account' : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleAuthModeButton: {
    marginTop: 24,
    alignItems: 'center',
    padding: 12,
  },
  toggleAuthModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthScreen;