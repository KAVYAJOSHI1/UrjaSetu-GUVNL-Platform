import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react'; // --- [CHANGE] --- Added useState, useEffect, useCallback
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

// --- [CHANGE] --- Import Supabase and Auth
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

import { useLanguage } from '../contexts/LanguageContext';
// --- [CHANGE] --- Removed Report context, we'll fetch live data
// import { Report, useReports } from '../contexts/ReportsContext';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

// --- [CHANGE] --- Define the Issue type based on your Supabase table
export type Issue = {
  id: string;
  created_at: string;
  citizen_id: string;
  title: string;
  description: string;
  issue_type: string;
  location: any; // geography type
  address_text: string;
  image_url: string;
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  assigned_to: string;
};

// --- Carousel Data (Unchanged) ---
const carouselItems = [
    {
        title: 'Report an Issue',
        description: 'Submit a new complaint with photos and location.',
        icon: 'alert-triangle',
        screen: 'Report',
        color: '#FFDDC1'
    },
    {
        title: 'Track Your Reports',
        description: 'Check the live status of all your submissions.',
        icon: 'clipboard',
        screen: 'Track',
        color: '#C2EABD'
    },
    {
        title: 'Safety Guidance',
        description: 'Read Do’s & Don’ts and find emergency contacts.',
        icon: 'book-open',
        screen: 'Guidance',
        color: '#D1E8FF'
    }
];

const HomeScreen = () => {
  // --- [CHANGE] --- Use auth to get user and state for reports/loading
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [reports, setReports] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // --- [CHANGE] --- Fetch reports from Supabase
  const fetchReports = useCallback(async () => {
    if (!user) return; // Wait for user to be available

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('citizen_id', user.id) // Get reports for this user
        .order('created_at', { ascending: false }); // Show newest first

      if (error) {
        throw error;
      }
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
      // You might want to show an alert here
    } finally {
      setLoading(false);
    }
  }, [user]);

  // --- [CHANGE] --- Call fetchReports on mount (and when user changes)
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);


  // --- [CHANGE] --- Updated status to match your table's 'Reported' default
  const getStatusStyle = (status: Issue['status']) => {
    if (status === 'Resolved') return { badge: styles.statusResolved, text: styles.statusTextResolved };
    if (status === 'In Progress') return { badge: styles.statusInProgress, text: styles.statusTextInProgress };
    if (status === 'Assigned') return { badge: styles.statusAssigned, text: styles.statusTextAssigned };
    // Default is 'Reported'
    return { badge: styles.statusReported, text: styles.statusTextReported };
  };

  // --- [CHANGE] --- Updated renderItem to use 'Issue' type fields
  const renderReportItem = ({ item }: { item: Issue }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.issue_type}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status).badge]}>
          <Text style={getStatusStyle(item.status).text}>
            {t(`status_${item.status.toLowerCase().replace(' ', '_')}` as any)}
          </Text>
        </View>
      </View>
      <View style={styles.locationContainer}>
        <Icon name="map-pin" size={14} color="#6B7280" />
        <Text style={styles.cardLocation} numberOfLines={1}>{item.address_text}</Text>
      </View>
    </TouchableOpacity>
  );

  // --- Header component (Unchanged) ---
  const ListHeader = () => (
    <>
      <Text style={styles.welcomeTitle}>Welcome to Urja Setu</Text>
      <Text style={styles.welcomeSubtitle}>Your partner in building a better Ahmedabad.</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {carouselItems.map((item, index) => (
            <TouchableOpacity key={index} style={[styles.carouselCard, {backgroundColor: item.color}]} onPress={() => navigation.navigate(item.screen as any)}>
                <Icon name={item.icon} size={28} color="#1F2937"/>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <Text style={styles.carouselDescription}>{item.description}</Text>
            </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.listTitle}>{t('home_title')}</Text>
    </>
  );

  // --- [CHANGE] --- Added ListEmptyComponent, onRefresh, and refreshing
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={ListHeader}
        // Add pull-to-refresh
        onRefresh={fetchReports}
        refreshing={loading}
        // Show a message if loading or if list is empty
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#0056b3" />
            ) : (
              <Text style={styles.emptyListText}>You have no submitted reports.</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// --- [CHANGE] --- Added styles for Reported, Assigned, and Empty List
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40, // Added padding at bottom
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  carouselContainer: {
    paddingLeft: 8,
    paddingRight: 16,
    marginBottom: 24,
  },
  carouselCard: {
    width: Dimensions.get('window').width * 0.6,
    height: 180,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  carouselTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1F2937',
  },
  carouselDescription: {
      fontSize: 14,
      color: '#4B5563',
      lineHeight: 20,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
    marginRight: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusResolved: { backgroundColor: '#D1FAE5' },
  statusTextResolved: { color: '#065F46', fontWeight: '600', fontSize: 12 },
  
  statusInProgress: { backgroundColor: '#FEF3C7' }, // Was In Progress
  statusTextInProgress: { color: '#92400E', fontWeight: '600', fontSize: 12 },
  
  statusAssigned: { backgroundColor: '#FEF9C3' }, // New for Assigned
  statusTextAssigned: { color: '#854D0E', fontWeight: '600', fontSize: 12 },

  statusReported: { backgroundColor: '#DBEAFE' }, // Was Submitted
  statusTextReported: { color: '#1E40AF', fontWeight: '600', fontSize: 12 },
  
  // New styles for empty list
  emptyListContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default HomeScreen;