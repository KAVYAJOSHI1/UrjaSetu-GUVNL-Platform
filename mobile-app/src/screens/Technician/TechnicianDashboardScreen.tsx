import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
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

  // Tab State: 'active' or 'history'
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [tasks, setTasks] = useState<TechnicianTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('issues')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (activeTab === 'active') {
        // Active = assigned, in_progress, pending
        // using neon/postgres syntax if available, otherwise client side filter or multiple queries
        // Supabase .in() is cleaner
        query = query.in('status', ['assigned', 'in_progress', 'pending', 'open']);
      } else {
        // History = resolved
        query = query.eq('status', 'resolved');
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks((data as any[]) || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  // Use focus effect to refresh when coming back from details
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  // Real-time updates
  useRealtime('issues', () => {
    fetchTasks();
  });

  const getPriorityStyle = (priority: TechnicianTask['priority']) => {
    if (priority === 'High') return { bar: styles.priorityBarHigh, text: styles.priorityTextHigh, icon: 'alert-triangle', iconColor: '#EF4444' };
    if (priority === 'Medium') return { bar: styles.priorityBarMedium, text: styles.priorityTextMedium, icon: 'alert-circle', iconColor: '#F59E0B' };
    return { bar: styles.priorityBarLow, text: styles.priorityTextLow, icon: 'info', iconColor: '#6B7280' };
  };

  const renderItem = ({ item }: { item: TechnicianTask }) => {
    const priorityStyle = getPriorityStyle(item.priority);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TechnicianIssueDetail', { taskId: item.id })}>
        <View style={[styles.priorityBar, priorityStyle.bar]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.issue_type}</Text>
          <View style={styles.locationContainer}>
            <Icon name="map-pin" size={14} color="#6B7280" />
            <Text style={styles.cardLocation} numberOfLines={1}>{item.address_text}</Text>
          </View>
          <View style={[styles.statusBadge,
          item.status === 'pending' ? { backgroundColor: '#FEF3C7' } :
            item.status === 'resolved' ? { backgroundColor: '#D1FAE5' } : {}
          ]}>
            <Text style={[styles.statusBadgeText,
            item.status === 'pending' ? { color: '#B45309' } :
              item.status === 'resolved' ? { color: '#065F46' } : {}
            ]}>
              {item.status.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
        </View>
        <View style={styles.priorityContainer}>
          <Icon name={priorityStyle.icon} size={20} color={priorityStyle.iconColor} />
          <Text style={[styles.priorityText, priorityStyle.text]}>{item.priority}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TechnicianHeader userName={user?.name || 'Technician'} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.emptySubText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="check-square" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {activeTab === 'active' ? 'No active tasks.' : 'No completed history.'}
              </Text>
              <Text style={styles.emptySubText}>
                {activeTab === 'active' ? 'Check back for new assignments.' : 'Your resolved tasks will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#059669',
  },
  listContainer: { padding: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#1F2937',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    overflow: 'hidden',
  },
  priorityBar: { width: 6 },
  priorityBarHigh: { backgroundColor: '#EF4444' },
  priorityBarMedium: { backgroundColor: '#F59E0B' },
  priorityBarLow: { backgroundColor: '#6B7280' },
  cardContent: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardLocation: { fontSize: 13, color: '#6B7280', marginLeft: 4, flex: 1 },
  priorityContainer: { justifyContent: 'center', alignItems: 'center', paddingRight: 16, width: 70 },
  priorityText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  priorityTextHigh: { color: '#EF4444' },
  priorityTextMedium: { color: '#F59E0B' },
  priorityTextLow: { color: '#6B7280' },
  statusBadge: {
    marginTop: 8,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  statusBadgeText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
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