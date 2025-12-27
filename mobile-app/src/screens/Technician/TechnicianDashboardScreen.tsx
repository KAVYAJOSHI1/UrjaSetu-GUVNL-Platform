import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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
// 👇 1. Import your Supabase client
import { supabase } from '../../lib/supabase';
// 👇 2. Import your reusable header
import TechnicianHeader from '../../components/TechnicianHeader';

// 👇 3. Define a Type for your 'issues' table data
export type TechnicianTask = {
  id: string;
  created_at: string;
  title: string;
  issue_type: string;
  address_text: string;
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  // ...add any other fields you select
};

const TechnicianDashboardScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp<'TechnicianMain'>>();
  const { t } = useLanguage();
  const { user } = useAuth();

  // 👇 4. State for loading and tasks
  const [tasks, setTasks] = useState<TechnicianTask[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 5. Function to fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    if (!user) return; // Wait for the user to be loaded

    setLoading(true);
    try {
      // Fetch issues assigned to this user that are not yet Resolved
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('assigned_to', user.id)
        .neq('status', 'Resolved') // '!=' (not equal)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error.message);
      alert('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 👇 6. Fetch tasks on initial load and when user changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // (This helper function is unchanged)
  const getPriorityStyle = (priority: TechnicianTask['priority']) => {
    if (priority === 'High') return { bar: styles.priorityBarHigh, text: styles.priorityTextHigh, icon: 'alert-triangle', iconColor: '#EF4444' };
    if (priority === 'Medium') return { bar: styles.priorityBarMedium, text: styles.priorityTextMedium, icon: 'alert-circle', iconColor: '#F59E0B' };
    return { bar: styles.priorityBarLow, text: styles.priorityTextLow, icon: 'info', iconColor: '#6B7280' };
  };

  const renderItem = ({ item }: { item: TechnicianTask }) => {
    const priorityStyle = getPriorityStyle(item.priority);

    return (
      // (Animated.View removed for simplicity, you can add it back)
        <TouchableOpacity
          style={styles.card}
          // 👇 7. Navigate with the Supabase item 'id'
          onPress={() => navigation.navigate('TechnicianIssueDetail', { taskId: item.id })}>
          <View style={[styles.priorityBar, priorityStyle.bar]} />
          <View style={styles.cardContent}>
            {/* 👇 8. Use column names from your 'issues' table */}
            <Text style={styles.cardTitle}>{item.issue_type}</Text>
            <View style={styles.locationContainer}>
              <Icon name="map-pin" size={14} color="#6B7280" />
              <Text style={styles.cardLocation}>{item.address_text}</Text>
            </View>
            <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{item.status}</Text>
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
      {/* 👇 9. Use your simplified header */}
      <TechnicianHeader userName={user?.name || 'Technician'} />
      
      {/* 👇 10. Show a loading indicator while fetching */}
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
                  <Text style={styles.emptyText}>No tasks assigned.</Text>
                  <Text style={styles.emptySubText}>Check back later for new assignments.</Text>
              </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// --- Styles (Slightly adjusted for loading) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FF' },
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
        elevation: 5,
        overflow: 'hidden',
    },
    priorityBar: { width: 8 },
    priorityBarHigh: { backgroundColor: '#EF4444' },
    priorityBarMedium: { backgroundColor: '#F59E0B' },
    priorityBarLow: { backgroundColor: '#6B7280' },
    cardContent: { flex: 1, padding: 20 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
    locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    cardLocation: { fontSize: 14, color: '#6B7280', marginLeft: 6, flexShrink: 1 },
    priorityContainer: { justifyContent: 'center', alignItems: 'center', paddingRight: 20, width: 80},
    priorityText: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    priorityTextHigh: { color: '#EF4444' },
    priorityTextMedium: { color: '#F59E0B' },
    priorityTextLow: { color: '#6B7280' },
    statusBadge: {
        marginTop: 12,
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    statusBadgeText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '600'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100
    },
    emptyText: {
        fontSize: 20,
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