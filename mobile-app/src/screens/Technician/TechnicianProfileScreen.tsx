import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const TechnicianProfileScreen = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tech_nav_profile')}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Icon name="user" size={60} color="#059669" />
        </View>
        <Text style={styles.name}>{user?.name || 'Technician User'}</Text>
        <Text style={styles.email}>{user?.email || 'tech@urja.com'}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#4B5563" />
            <Text style={styles.infoText}>{user?.phone || '987-654-3210'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="hash" size={20} color="#4B5563" />
            <Text style={styles.infoText}>Technician ID: T-1024</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="log-out" size={20} color="white" />
          <Text style={styles.logoutButtonText}>{t('logout_btn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 10,
    shadowColor: '#059669',
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  email: { fontSize: 16, color: '#6B7280', marginTop: 4, marginBottom: 32 },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoText: { fontSize: 16, color: '#374151', marginLeft: 16 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 3,
  },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});

export default TechnicianProfileScreen;
