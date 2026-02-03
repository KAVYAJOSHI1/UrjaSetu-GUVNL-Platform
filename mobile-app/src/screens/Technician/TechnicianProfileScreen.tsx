import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const TechnicianProfileScreen = () => {
  const { user, logout } = useAuth();
  const { t, changeLanguage, language } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [stats, setStats] = useState({ points: 0, level: 1, badges: [] });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`http://192.168.16.108:3000/rest/v1/users?email=eq.${user.email}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const u = data[0];
        setStats({
          points: u.points || 0,
          level: u.level || 1,
          badges: JSON.parse(u.badges || '[]')
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'gu', label: 'ગુજરાતી' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tech_nav_profile')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="user" size={50} color="#059669" />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{stats.level}</Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.name || 'Technician'}</Text>
          <Text style={styles.role}>Level {stats.level} Lineman</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="zap" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <TouchableOpacity
            style={[styles.statCard, styles.leaderboardCard]}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Icon name="award" size={24} color="#fff" />
            <Text style={[styles.statValue, { color: '#fff' }]}>Rank #4</Text>
            <Text style={[styles.statLabel, { color: '#E0F2FE' }]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {stats.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earned Badges</Text>
            <View style={styles.badgesContainer}>
              {stats.badges.map((badge: string, index: number) => (
                <View key={index} style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>🏅</Text>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language') || 'Language'}</Text>
          <View style={styles.langRow}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langButton, language === lang.code && styles.langButtonActive]}
                onPress={() => changeLanguage(lang.code)}
              >
                <Text style={[styles.langText, language === lang.code && styles.langTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="log-out" size={20} color="white" />
          <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 20
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  content: { padding: 20, paddingBottom: 40 },

  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, position: 'relative'
  },
  levelBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F59E0B',
    width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff'
  },
  levelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  role: { fontSize: 14, color: '#6B7280' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center', justifyContent: 'center', elevation: 2
  },
  leaderboardCard: { backgroundColor: '#1E40AF' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#6B7280' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FFEDD5'
  },
  badgeIcon: { marginRight: 6, fontSize: 16 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#9A3412' },

  langRow: { flexDirection: 'row', gap: 8 },
  langButton: {
    flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff',
    alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB'
  },
  langButtonActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  langText: { fontSize: 14, color: '#4B5563' },
  langTextActive: { color: '#2563EB', fontWeight: '600' },

  logoutButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#DC2626', padding: 16, borderRadius: 12, marginTop: 12
  },
  logoutButtonText: { color: 'white', fontWeight: '600', marginLeft: 8 }
});

export default TechnicianProfileScreen;
