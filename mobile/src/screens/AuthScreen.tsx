import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleAuth = () => {
    // Input validation
    if (isLogin) {
      if (!username.trim() || !password.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
    } else {
      if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
      
      // Password strength validation
      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long');
        return;
      }
    }
    
    setLoading(true);
    
    // Simulating authentication API call
    setTimeout(() => {
      setLoading(false);
      
      // Navigate to main app after successful authentication
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 1500);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: colors.text }]}>Connect</Text>
            <Text style={[styles.tagline, { color: colors.inactive }]}>
              Discover activities. Meet new people.
            </Text>
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                isLogin && styles.activeTabButton,
                isLogin && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setIsLogin(true)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { color: isLogin ? colors.primary : colors.inactive }
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                !isLogin && styles.activeTabButton,
                !isLogin && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setIsLogin(false)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { color: !isLogin ? colors.primary : colors.inactive }
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={colors.inactive} 
                style={styles.inputIcon} 
              />
              <TextInput 
                style={[
                  styles.input, 
                  { 
                    backgroundColor: isDark ? colors.cardLight : '#F3F4F6', 
                    color: colors.text 
                  }
                ]}
                placeholder="Username"
                placeholderTextColor={colors.inactive}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={colors.inactive} 
                  style={styles.inputIcon} 
                />
                <TextInput 
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: isDark ? colors.cardLight : '#F3F4F6', 
                      color: colors.text 
                    }
                  ]}
                  placeholder="Email"
                  placeholderTextColor={colors.inactive}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={colors.inactive} 
                style={styles.inputIcon} 
              />
              <TextInput 
                style={[
                  styles.input, 
                  { 
                    backgroundColor: isDark ? colors.cardLight : '#F3F4F6', 
                    color: colors.text 
                  }
                ]}
                placeholder="Password"
                placeholderTextColor={colors.inactive}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.inactive} 
                />
              </TouchableOpacity>
            </View>
            
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={colors.inactive} 
                  style={styles.inputIcon} 
                />
                <TextInput 
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: isDark ? colors.cardLight : '#F3F4F6', 
                      color: colors.text 
                    }
                  ]}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.inactive}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            )}
            
            {isLogin && (
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.authButton, 
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 }
              ]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authButtonText}>
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.inactive }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.socialButton, 
                { 
                  borderColor: colors.border,
                  backgroundColor: isDark ? colors.cardLight : '#FFFFFF'
                }
              ]}
            >
              <Image 
                source={{ uri: 'https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-google-icon-logo-png-transparent-svg-vector-bie-supply-14.png' }} 
                style={styles.socialIcon} 
              />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.socialButton, 
                { 
                  borderColor: colors.border,
                  backgroundColor: isDark ? colors.cardLight : '#FFFFFF',
                  marginTop: 12
                }
              ]}
            >
              <Ionicons name="logo-apple" size={24} color={colors.text} />
              <Text style={[styles.socialButtonText, { color: colors.text }]}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: colors.inactive }]}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text 
                style={[styles.footerLink, { color: colors.primary }]}
                onPress={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign Up" : "Login"}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 40,
    fontSize: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  authButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  socialButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontWeight: '600',
  },
});

export default AuthScreen;