import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

import { RootStackNavigationProp } from '../../navigation/types';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import TechnicianHeader from '../../components/TechnicianHeader';

export type TechnicianTask = {
  id: string;
  created_at: string;
  title: string;
  issue_type: string;
  address_text: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'pending';
  priority: 'Low' | 'Medium' | 'High';
};

const TechnicianDashboardScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp<'TechnicianMain'>>();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Tab State: 'active' or 'history'
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [tasks, setTasks] = useState<TechnicianTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ points: 0, level: 1 });

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Fetch Stats
      const { data: userData } = await supabase
        .from('users')
        .select('points, level')
        .eq('id', user.id)
        .single();

      if (userData) {
        setStats({ points: userData.points || 0, level: userData.level || 1 });
      }

      // 2. Fetch Tasks
      let query = supabase
        .from('issues')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (activeTab === 'active') {
        query = query.in('status', ['assigned', 'in_progress', 'pending', 'open']);
      } else {
        query = query.eq('status', 'resolved');
      }

      const { data: taskData, error: taskError } = await query;

      if (taskError) throw taskError;
      setTasks((taskData as any[]) || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  useRealtime('issues', () => {
    fetchDashboardData();
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getPriorityStyle = (priority: TechnicianTask['priority']) => {
    if (priority === 'High') return {
      gradient: ['#FEE2E2', '#FEF2F2'] as const,
      text: '#B91C1C',
      icon: 'alert-triangle',
      iconColor: '#EF4444',
      border: '#FECACA'
    };
    if (priority === 'Medium') return {
      gradient: ['#FFFBEB', '#FFF7ED'] as const,
      text: '#B45309',
      icon: 'alert-circle',
      iconColor: '#F59E0B',
      border: '#FDE68A'
    };
    return {
      gradient: ['#F3F4F6', '#F9FAFB'] as const,
      text: '#374151',
      icon: 'info',
      iconColor: '#6B7280',
      border: '#E5E7EB'
    };
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const renderItem = ({ item }: { item: TechnicianTask }) => {
    const priorityStyle = getPriorityStyle(item.priority);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('TechnicianIssueDetail', { taskId: item.id })}>
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.cardTitle}>{formatText(item.issue_type)}</Text>
              <Text style={styles.timeText}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.gradient[0], borderColor: priorityStyle.border }]}>
              <Icon name={priorityStyle.icon} size={12} color={priorityStyle.iconColor} style={{ marginRight: 4 }} />
              <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{item.priority}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardBody}>
            <View style={styles.locationRow}>
              <View style={styles.iconContainer}>
                <Icon name="map-pin" size={14} color="#6B7280" />
              </View>
              <Text style={styles.cardLocation} numberOfLines={2}>
                {item.address_text || t('tech_dashboard.no_location')}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <View style={[styles.statusBadge,
              item.status === 'pending' ? { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' } :
                item.status === 'resolved' ? { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' } :
                  item.status === 'in_progress' ? { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' } :
                    { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }
              ]}>
                <Text style={[styles.statusBadgeText,
                item.status === 'pending' ? { color: '#B45309' } :
                  item.status === 'resolved' ? { color: '#065F46' } :
                    item.status === 'in_progress' ? { color: '#1E40AF' } :
                      { color: '#374151' }
                ]}>
                  {formatText(item.status)}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#D1D5DB" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <TechnicianHeader userName={user?.name || 'Technician'} />

      {/* Stats Section with Gradient */}
      <View style={styles.statsWrapper}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']} // Blue-600 to Blue-700
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsGradient}
        >
          <View style={styles.statItem}>
            <View style={styles.statIconBg}>
              <Icon name="zap" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.statValueLight}>{stats.points}</Text>
              <Text style={styles.statLabelLight}>{t('tech_dashboard.points_label')}</Text>
            </View>
          </View>
          <View style={styles.statDividerLight} />
          <View style={styles.statItem}>
            <View style={styles.statIconBg}>
              <Icon name="award" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.statValueLight}>Lvl {stats.level}</Text>
              <Text style={styles.statLabelLight}>{t('tech_dashboard.role_label')}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Custom Tabs */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              {t('tech_dashboard.active_tab')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              {t('tech_dashboard.history_tab')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.emptySubText}>{t('tech_dashboard.loading_tasks')}</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name={activeTab === 'active' ? 'check-circle' : 'clock'} size={60} color="#E5E7EB" />
              <Text style={styles.emptyText}>
                {activeTab === 'active' ? t('tech_dashboard.no_active_tasks') : t('tech_dashboard.no_history_tasks')}
              </Text>
              <Text style={styles.emptySubText}>
                {activeTab === 'active' ? t('tech_dashboard.caught_up') : t('tech_dashboard.history_empty_sub')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  statsWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  statsGradient: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  statDividerLight: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statValueLight: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  statLabelLight: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },

  tabWrapper: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
  },

  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },

  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12
  },
  headerLeft: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  timeText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityText: { fontSize: 11, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 16, marginRight: 16 },

  cardBody: { padding: 16, paddingTop: 12 },
  locationRow: { flexDirection: 'row', marginBottom: 16 },
  iconContainer: { marginTop: 2, marginRight: 8 },
  cardLocation: { fontSize: 14, color: '#4B5563', lineHeight: 20, flex: 1 },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center'
  }
});

export default TechnicianDashboardScreen;