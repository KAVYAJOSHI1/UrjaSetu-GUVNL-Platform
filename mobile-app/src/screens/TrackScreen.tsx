import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
// --- [FIX] --- Import SafeAreaView from here
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useRealtime } from '../hooks/useRealtime';

// --- 1. Define the History item type ---
type StatusHistoryItem = {
  id: string;
  created_at: string;
  status: string;
};

// --- 2. Update Issue type to include history ---
type Issue = {
  id: string;
  created_at: string;
  issue_type: string;
  description: string;
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  status_history: StatusHistoryItem[]; // The array of history items
};

// --- 3. A new component for the "Journey" timeline ---
const StatusTimeline = ({ history }: { history: StatusHistoryItem[] }) => {

  // Helper to get icon and color for each status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return { icon: 'check-circle', color: '#10B981' };
      case 'In Progress':
        return { icon: 'play-circle', color: '#F59E0B' };
      case 'Assigned':
        return { icon: 'user-check', color: '#3B82F6' };
      case 'Rejected':
        return { icon: 'x-circle', color: '#EF4444' };
      case 'Reported':
        return { icon: 'send', color: '#6B7280' };
      default:
        return { icon: 'info', color: '#6B7280' };
    }
  };

  return (
    <View style={s.timelineContainer}>
      {history.map((item, index) => {
        const isLast = index === history.length - 1;
        const { icon, color } = getStatusIcon(item.status);

        return (
          <View key={item.id} style={s.timelineItem}>
            <View style={s.timelineIconContainer}>
              <Icon name={icon} size={20} color={color} />
              {!isLast && <View style={s.timelineConnector} />}
            </View>
            <View style={s.timelineContent}>
              <Text style={s.timelineStatusText}>{item.status}</Text>
              <Text style={s.timelineDateText}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// --- 4. The main TrackScreen component ---
const TrackScreen = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [reports, setReports] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 5. Update fetchReports to get the history too ---
  const fetchReports = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Fetch Issues
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .eq('citizen_id', user.id)
        .order('created_at', { ascending: false });

      if (issuesError) throw issuesError;
      if (!issuesData || issuesData.length === 0) {
        setReports([]);
        return;
      }

      const issues = issuesData as Issue[];
      const issueIds = issues.map(i => i.id);

      // 2. Fetch History for these issues
      const { data: historyData, error: historyError } = await supabase
        .from('status_history')
        .select('*')
        .in('issue_id', issueIds)
        .order('created_at', { ascending: true });

      if (historyError) {
        console.error("Error fetching history:", historyError);
        // Fallback: just show issues with empty history
        setReports(issues.map(i => ({ ...i, status_history: [] })));
        return;
      }

      // 3. Merge History into Issues
      const historyMap: Record<string, StatusHistoryItem[]> = {};
      (historyData as any[]).forEach((h: any) => {
        if (!historyMap[h.issue_id]) historyMap[h.issue_id] = [];
        historyMap[h.issue_id].push(h);
      });

      const mergedReports = issues.map(issue => ({
        ...issue,
        status_history: historyMap[issue.id] || []
      }));

      setReports(mergedReports);

    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useRealtime('issues', () => {
    fetchReports();
  });

  // --- 6. Update RenderItem to show the new card ---
  const renderItem = ({ item }: { item: Issue }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString();

    // We don't use these helpers anymore, but they are here if you want them
    // const statusStyle = getStatusStyle(item.status);
    // const priorityStyle = getPriorityStyle(item.priority);

    return (
      // --- NO MORE TouchableOpacity ---
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.cardTitleContainer}>
            <Icon name="zap" size={20} color="#D97706" style={s.cardIcon} />
            <View>
              <Text style={s.cardTitle} numberOfLines={1}>{item.issue_type}</Text>
              <Text style={s.cardSubtitle}>{`#${item.id.substring(0, 8)} • ${formattedDate}`}</Text>
            </View>
          </View>
          {/* You can still show the current status badge if you want */}
        </View>
        <Text style={s.description} numberOfLines={2}>{item.description}</Text>

        {/* --- 7. Render the timeline INSIDE the card --- */}
        <StatusTimeline history={item.status_history} />
      </View>
    );
  };

  const EmptyListComponent = () => (
    <View style={s.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#6B7280" />
      ) : (
        <>
          <Icon name="clipboard" size={60} color="#9CA3AF" />
          <Text style={s.emptyTitle}>{t('track_empty_title')}</Text>
          <Text style={s.emptySubtitle}>{t('track_empty_subtitle')}</Text>
        </>
      )}
    </View>
  );

  return (
    // --- [FIX] --- Using correct SafeAreaView
    <SafeAreaView style={s.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContainer}
        ListHeaderComponent={<Text style={s.title}>{t('track_title')}</Text>}
        ListEmptyComponent={EmptyListComponent}
        onRefresh={fetchReports}
        refreshing={loading}
      />
    </SafeAreaView>
  );
};

// --- 8. Add new styles for the timeline ---
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  listContainer: { paddingHorizontal: 16, paddingTop: 8, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, paddingHorizontal: 8 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16, // Increased margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  cardIcon: { marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  description: { fontSize: 14, color: '#4B5563', marginTop: 12, lineHeight: 20 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 400 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },

  // --- TIMELINE STYLES ---
  timelineContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timelineDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // --- (Optional) Old styles if you want to add them back ---
  // statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  // statusResolved: { backgroundColor: '#D1FAE5' },
  // statusTextResolved: { color: '#065F46', fontWeight: '600', fontSize: 12 },
  // statusInProgress: { backgroundColor: '#FEF3C7' },
  // statusTextInProgress: { color: '#92400E', fontWeight: '600', fontSize: 12 },
  // statusAssigned: { backgroundColor: '#FEF9C3' },
  // statusTextAssigned: { color: '#854D0E', fontWeight: '600', fontSize: 12 },
  // statusReported: { backgroundColor: '#DBEAFE' },
  // statusTextReported: { color: '#1E40AF', fontWeight: '600', fontSize: 12 },
  // statusRejected: { backgroundColor: '#FEE2E2' },
  // statusTextRejected: { color: '#991B1B', fontWeight: '600', fontSize: 12 },
  // priorityContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginTop: 12,
  //   paddingTop: 8,
  //   borderTopWidth: 1,
  //   borderTopColor: '#F3F4F6',
  // },
  // priorityText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  // priorityHigh: { color: '#DC2626' },
  // priorityMedium: { color: '#D97706' },
  // priorityLow: { color: '#4B5563' },
});

export default TrackScreen;