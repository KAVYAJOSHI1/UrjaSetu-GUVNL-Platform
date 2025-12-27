import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthStackNavigationProp } from '../navigation/types'; // Assuming you have this type

const LoginScreen = () => {
  const { t } = useLanguage();
  const { login } = useAuth(); // We only need the 'login' function
  const navigation = useNavigation<AuthStackNavigationProp<'Login'>>(); // For navigating to Register

  // --- State for the form ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Handles the actual Supabase login ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    // Call the login function from our AuthContext
    const { error } = await login(email.trim(), password.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    // No navigation.navigate() needed!
    // The AuthProvider detects the login and AppNavigator will
    // automatically switch to the correct dashboard based on the user's role.
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to your account to continue</Text>

          {/* --- Email Input --- */}
          <TextInput
            style={styles.input}
            placeholder="Email (e.g., technician@test.com)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />

          {/* --- Password Input --- */}
          <TextInput
            style={styles.input}
            placeholder="Password (e.g., password123)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />

          {/* --- Submit Button --- */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          {/* --- Register Link --- */}
          <View style={styles.footer}>
             <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                 <Text style={styles.footerText}>
                     {t('no_account')}{' '}
                     <Text style={styles.linkText}>{t('register_link')}</Text>
                 </Text>
             </TouchableOpacity>
         </View>

        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
  subtitle: { textAlign: 'center', color: '#6B7280', marginTop: 8, fontSize: 16, marginBottom: 32 },
  
  // Input field styles
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },

  button: { 
    backgroundColor: '#059669', // Using the technician green
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  buttonDisabled: {
    backgroundColor: '#6EE7B7',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footer: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#059669', fontWeight: '600' },
  footerText: { color: '#6B7280' }
});

export default LoginScreen;