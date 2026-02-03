import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,

  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Icon from 'react-native-vector-icons/Feather';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import LanguageModal from '../components/LanguageModal';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export type Issue = {
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
};

const carouselItems = [
  {
    title: 'Register Complaint',
    description: 'Report power failure, voltage issues, or defects.',
    icon: 'zap',
    screen: 'Report',
    colors: ['#EF4444', '#B91C1C'] as const // Strong Red for Urgent Action
  },
  {
    title: 'Track Complaint',
    description: 'Monitor status of your reported grievances.',
    icon: 'activity',
    screen: 'Track',
    colors: ['#3B82F6', '#1D4ED8'] as const // Trustworthy Blue
  },
  {
    title: 'Safety Advisory',
    description: 'Vital electrical safety guidelines and emergency contacts.',
    icon: 'shield',
    screen: 'Guidance',
    colors: ['#10B981', '#059669'] as const // Safe Green
  }
];

const HomeScreen = () => {
  const { user } = useAuth();
  const { cycleLanguage, language } = useLanguage();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [reports, setReports] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('citizen_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getStatusStyle = (status: Issue['status']) => {
    if (status === 'Resolved') return { bg: '#D1FAE5', text: '#065F46', icon: 'check-circle' };
    if (status === 'In Progress') return { bg: '#FEF3C7', text: '#92400E', icon: 'clock' };
    if (status === 'Assigned') return { bg: '#E0F2FE', text: '#075985', icon: 'user-check' };
    return { bg: '#F3F4F6', text: '#1F2937', icon: 'alert-circle' };
  };

  const renderReportItem = ({ item }: { item: Issue }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Icon name="map-pin" size={18} color="#1e3c72" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.issue_type}</Text>
            <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardAddress} numberOfLines={2}>{item.address_text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#1e3c72', '#2a5298']}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Namaste, {user?.name?.split(' ')[0] || 'Citizen'}</Text>
            <Text style={styles.subGreeting}>UrjaSetu is available in 3 languages.</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.iconButton} onPress={cycleLanguage}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <Icon name="globe" size={20} color="#fff" />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                  {language === 'en' ? 'EN' : language === 'hi' ? 'HI' : 'GU'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="user" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          style={styles.carouselScrollView}
        >
          {carouselItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.screen as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.colors}
                style={styles.carouselCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.carouselIconCircle}>
                  <Icon name={item.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <Text style={styles.carouselDescription} numberOfLines={2}>{item.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Track')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3c72" />
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchReports} colors={['#1e3c72']} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#1e3c72" />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }}
                  style={{ width: 120, height: 120, opacity: 0.5, marginBottom: 16 }}
                />
                <Text style={styles.emptyListText}>No recent complaints found.</Text>
                <Text style={styles.emptyListSubText}>Your reported issues will appear here.</Text>
              </>
            )}
          </View>
        )}
      />

      <LanguageModal
        isVisible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  gradientHeader: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#1e3c72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  iconButton: {
    width: 50,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  carouselScrollView: {
    paddingLeft: 24,
  },
  carouselContainer: {
    paddingRight: 24,
    paddingBottom: 10,
  },
  carouselCard: {
    width: 150,
    height: 170,
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  carouselIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  carouselDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3c72',
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  cardHeaderText: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    paddingLeft: 48
  },
  cardAddress: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4
  },
  headerContainer: {
    marginBottom: 8
  }
});

export default HomeScreen;