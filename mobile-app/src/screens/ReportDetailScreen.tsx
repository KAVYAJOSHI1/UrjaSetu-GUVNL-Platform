import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// --- [FIX] --- Import SafeAreaView from here
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase'; // Your Supabase client
import { RootStackParamList } from '../navigation/types';

// Type for the history items from the 'status_history' table
type StatusHistoryItem = {
  id: string;
  created_at: string;
  status: string;
  comment: string | null;
};

// Type for the 'issues' table, including the history array from the join
type Issue = {
  id: string;
  created_at: string;
  citizen_id: string;
  title: string;
  description: string;
  issue_type: string;
  location: any;
  address_text: string;
  image_url: string;
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  assigned_to: string;
  status_history: StatusHistoryItem[]; // The array of history items
};

type ReportDetailScreenRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;
type ReportDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReportDetail'>;

const ReportDetailScreen = () => {
  const route = useRoute<ReportDetailScreenRouteProp>();
  const navigation = useNavigation<ReportDetailScreenNavigationProp>();
  const { t } = useLanguage();

  // --- [THIS IS THE CRASH FIX] ---
  // Safely get reportId. It will be 'undefined' on reload instead of crashing.
  const reportId = route.params?.reportId;
  // -------------------------------

  const [report, setReport] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the report AND its history from Supabase
  useEffect(() => {
    const fetchReport = async () => {
      // If reportId is missing (e.g., on a bad reload), stop early.
      if (!reportId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('issues')
          .select(`
            *,
            status_history (
              id,
              created_at,
              status,
              comment
            )
          `)
          .eq('id', reportId)
          .order('created_at', { foreignTable: 'status_history', ascending: false })
          .single(); 

        if (error) {
          if (error.code === 'PGRST116') console.warn('Report not found');
          else throw error;
        }
        setReport(data);
      } catch (error: any) {
        console.error('Error fetching report:', error.message);
        Alert.alert('Error', 'Failed to fetch report details.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  // --- Helper Functions ---
  const getStatusStyle = (status: string) => {
    if (status === 'Resolved') return { badge: styles.statusResolved, text: styles.statusTextResolved };
    if (status === 'In Progress') return { badge: styles.statusInProgress, text: styles.statusTextInProgress };
    if (status === 'Assigned') return { badge: styles.statusAssigned, text: styles.statusTextAssigned };
    if (status === 'Rejected') return { badge: styles.statusRejected, text: styles.statusTextRejected };
    return { badge: styles.statusReported, text: styles.statusTextReported };
  };

  const getPriorityStyle = (priority: Issue['priority']) => {
    if (priority === 'High') return { text: styles.priorityHigh, icon: 'alert-triangle' };
    if (priority === 'Medium') return { text: styles.priorityMedium, icon: 'alert-circle' };
    return { text: styles.priorityLow, icon: 'info' };
  };

  // Reusable header component
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#1F2937" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('details_title')}</Text>
    </View>
  );

  // --- Handle Loading and Not Found States ---
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0056b3" />
        </View>
      </SafeAreaView>
    );
  }

  // This will now show "Report not found" on reload, which is correct.
  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContainer}>
          <Text>Report not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Get dynamic styles for the loaded report ---
  const statusStyle = getStatusStyle(report.status);
  const priorityStyle = getPriorityStyle(report.priority);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Report Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.reportType}>{report.issue_type}</Text>
            <Text style={styles.reportId}>#{report.id.split('-')[0]}...</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.statusBadge, statusStyle.badge]}>
              <Text style={statusStyle.text}>
                {t(`status_${report.status.toLowerCase().replace(' ', '_')}` as any)}
              </Text>
            </View>
            <View style={styles.priorityContainer}>
              <Icon name={priorityStyle.icon} size={14} color={priorityStyle.text.color} />
              <Text style={[styles.priorityText, priorityStyle.text]}>
                {report.priority} {t('priority')}
              </Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Icon name="map-pin" size={14} color="#6B7280" />
            <Text style={styles.reportLocation}>{report.address_text}</Text>
          </View>
          <Text style={styles.reportDescription}>{report.description}</Text>
          {report.image_url && (
            <Image source={{ uri: report.image_url }} style={styles.image} resizeMode="cover" />
          )}
        </View>

        {/* Status History (Timeline) Card */}
        <View style={styles.card}>
          <Text style={styles.historyTitle}>{t('asset_history')}</Text>
          <View>
            {report.status_history.map((history, index) => {
              const isLast = index === report.status_history.length - 1;
              const isLatest = index === 0; // Newest is at index 0
              return (
                <View key={history.id} style={styles.timelineItem}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.timelineIcon, isLatest && styles.timelineIconActive]}>
                      <Icon name="check" size={16} color={isLatest ? 'white' : '#4B5563'} />
                    </View>
                    {!isLast && <View style={styles.timelineConnector} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.statusText}>
                      {t(`status_${history.status.toLowerCase().replace(' ', '_')}` as any)}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(history.created_at).toLocaleString()}
                    </Text>
                    {history.comment && (
                      <Text style={styles.commentText}>{history.comment}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Full Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0056b3',
    marginLeft: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  reportType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  reportId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0056b3',
    fontFamily: 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  priorityHigh: { color: '#EF4444' },
  priorityMedium: { color: '#F59E0B' },
  priorityLow: { color: '#6B7280' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  reportLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  reportDescription: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  statusResolved: { backgroundColor: '#D1FAE5' },
  statusTextResolved: { color: '#065F46', fontWeight: '600', fontSize: 12 },
  statusInProgress: { backgroundColor: '#FEF3C7' },
  statusTextInProgress: { color: '#92400E', fontWeight: '600', fontSize: 12 },
  statusAssigned: { backgroundColor: '#FEF9C3' },
  statusTextAssigned: { color: '#854D0E', fontWeight: '600', fontSize: 12 },
  statusReported: { backgroundColor: '#DBEAFE' },
  statusTextReported: { color: '#1E40AF', fontWeight: '600', fontSize: 12 },
  statusRejected: { backgroundColor: '#FEE2E2' },
  statusTextRejected: { color: '#991B1B', fontWeight: '600', fontSize: 12 },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection:'row',
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#007BFF',
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  commentText: {
    marginTop: 6,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default ReportDetailScreen;