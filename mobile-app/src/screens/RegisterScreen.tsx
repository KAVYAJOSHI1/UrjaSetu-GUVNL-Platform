import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { RegisterScreenProps } from '../navigation/types';

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !phone || !password) {
        Alert.alert("Input Error", "Please fill all fields.");
        return;
    }
    register(name, email, phone, password);
    Alert.alert("Success", t('toast_register_success'));
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>{t('register_title')}</Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={t('full_name_placeholder')}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder={t('phone_placeholder')}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder={t('email_placeholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder={t('password_placeholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>{t('register_btn')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('has_account')}{' '}
                <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
                  {t('login_link')}
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Using similar styles to LoginScreen for consistency
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F2F5' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 24,
  },
  form: { gap: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#F9FAFB'
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#007BFF',
    fontWeight: '600',
  },
  footerText: {
    color: '#4B5563',
  },
});


export default RegisterScreen;
