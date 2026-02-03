import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '../../lib/supabase';
import {
  RootStackNavigationProp,
  RootStackParamList,
} from '../../navigation/types';

type TechDetailRouteProp = RouteProp<
  RootStackParamList,
  'TechnicianIssueDetail'
>;

type TaskData = {
  id: string;
  created_at: string;
  citizen_id: string;
  title: string;
  description: string;
  issue_type: string;
  location: { type: 'Point', coordinates: [number, number] } | null;
  address_text: string | null;
  image_url: string | null;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'pending';
  priority: 'Low' | 'Medium' | 'High';
  assigned_to: string | null;
  assigned_at: string | null;
  citizen: {
    name: string | null;
    phone: string | null;
  } | null;
};

const TechnicianIssueDetailScreen = () => {
  const route = useRoute<TechDetailRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp<'TechnicianIssueDetail'>>();
  const { taskId } = route.params;

  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTask = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          citizen:profiles!citizen_id ( name, phone )
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;
      if (data) {
        setTask(data as any); // Cast to any because of join type complexity
      }
    } catch (error: any) {
      console.error('Error fetching task details:', error.message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
    // Add focus listener via navigation if needed, but simple re-mount works too
  }, [fetchTask, taskId]);

  const updateStatus = async (newStatus: string) => {
    if (!task || isUpdating) return;
    setIsUpdating(true);

    const { data, error } = await supabase
      .from('issues')
      .update({
        status: newStatus,
        assigned_at: newStatus === 'in_progress' ? new Date().toISOString() : task.assigned_at
      })
      .eq('id', task.id)
      .select()
      .single();

    setIsUpdating(false);

    if (error) {
      Alert.alert('Error', 'Could not update task status.');
    } else if (data) {
      setTask({ ...task, status: newStatus as any });
      // If we are marking as resolved, we usually go to ProofOfWork screen instead of just updating here
    }
  };

  const handleStartWork = () => updateStatus('in_progress');
  const handlePending = () => updateStatus('pending');

  const openMapDirections = () => {
    if (!task || !task.location?.coordinates) {
      Alert.alert("No Location", "This task does not have precise coordinates.");
      return;
    }
    const longitude = task.location.coordinates[0];
    const latitude = task.location.coordinates[1];
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = task.address_text || 'Issue Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Task</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </SafeAreaView>
    )
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text>The requested task could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getPriorityStyle = (priority: string) => {
    if (priority === 'High') return { color: '#EF4444', label: 'High Priority' };
    if (priority === 'Medium') return { color: '#F59E0B', label: 'Medium Priority' };
    return { color: '#6B7280', label: 'Low Priority' };
  };

  const priorityStyle = getPriorityStyle(task.priority);

  /* Helper to format text (remove underscores, capitalize) */
  const formatText = (text: string) => {
    return text ? text.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Task Details</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={fetchTask}>
          <Icon name="refresh-cw" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          {/* Apply formatting to issue_type */}
          <Text style={styles.title}>{formatText(task.issue_type)}</Text>
          <View style={[styles.statusBadge,
          task.status === 'pending' ? { backgroundColor: '#FEF3C7' } :
            task.status === 'resolved' ? { backgroundColor: '#D1FAE5' } : {}
          ]}>
            <Text style={[styles.statusBadgeText,
            task.status === 'pending' ? { color: '#B45309' } :
              task.status === 'resolved' ? { color: '#065F46' } : {}
            ]}>{formatText(task.status)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="map-pin" size={16} color="#6B7280" />
          <Text style={styles.subtitle}>{task.address_text || 'No address provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="alert-circle" size={16} color={priorityStyle.color} />
          <Text style={[styles.subtitle, { color: priorityStyle.color, fontWeight: '600' }]}>{priorityStyle.label}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Report</Text>
          <Text style={styles.reportedBy}>Reported by: {task.citizen?.name || 'Unknown User'}</Text>
          {task.citizen?.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${task.citizen?.phone}`)} style={styles.phoneRow}>
              <Icon name="phone" size={14} color="#059669" />
              <Text style={styles.phoneText}>{task.citizen.phone}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.description}>{task.description}</Text>

          <Text style={styles.photoTitle}>Submitted Photo</Text>
          {task.image_url ? (
            <Image source={{ uri: task.image_url }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No photo was submitted.</Text>
          )}
        </View>

        {task.location?.coordinates && (
          <View style={[styles.card, styles.mapCardContainer]}>
            <Text style={styles.cardTitle}>Geotagged Location</Text>
            <MapView
              style={styles.map}
              provider="google"
              initialRegion={{
                latitude: task.location.coordinates[1],
                longitude: task.location.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={{
                latitude: task.location.coordinates[1],
                longitude: task.location.coordinates[0],
              }} title={task.address_text || 'Issue Location'} />
            </MapView>
            <TouchableOpacity style={styles.directionsButton} onPress={openMapDirections}>
              <Text style={styles.directionsButtonText}>Get Directions</Text>
              <Icon name="navigation" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
      <View style={styles.footer}>
        {/* ASSIGNED -> Start */}
        {task.status === 'assigned' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartWork}
            disabled={isUpdating}
          >
            <Icon name="play-circle" size={22} color="white" />
            <Text style={styles.buttonText}>
              {isUpdating ? 'Starting...' : 'Start Work'}
            </Text>
          </TouchableOpacity>
        )}

        {/* IN PROGRESS -> Complete OR Pending */}
        {(task.status === 'in_progress') && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pendingButton, { flex: 1, marginRight: 8 }]}
              onPress={handlePending}
              disabled={isUpdating}
            >
              <Icon name="pause" size={22} color="#92400E" />
              <Text style={[styles.buttonText, { color: '#92400E' }]}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => navigation.navigate('ProofOfWork', { taskId: task.id })}
            >
              <Icon name="check-circle" size={22} color="white" />
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PENDING -> Resume Work */}
        {task.status === 'pending' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartWork}
            disabled={isUpdating}
          >
            <Icon name="play" size={22} color="white" />
            <Text style={styles.buttonText}>
              {isUpdating ? 'Updating...' : 'Resume Work'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcon: { width: 30, alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
  scrollContainer: { padding: 20, paddingBottom: 150 },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8
  },
  statusBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '700'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  subtitle: { fontSize: 15, color: '#6B7280', marginLeft: 8, flexShrink: 1 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  reportedBy: { fontSize: 14, fontWeight: '500', color: '#4B5563', marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  phoneText: { fontSize: 14, color: '#059669', marginLeft: 6, fontWeight: '600' },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },
  photoTitle: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginTop: 16, marginBottom: 8 },
  image: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#F3F4F6' },
  noImageText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },
  mapCardContainer: { padding: 8 },
  map: { height: 180, width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
  },
  directionsButtonText: { color: 'white', fontWeight: '600', marginRight: 8 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buttonRow: { flexDirection: 'row' },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2
  },
  completeButton: { backgroundColor: '#059669' },
  pendingButton: { backgroundColor: '#FEF3C7' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});

export default TechnicianIssueDetailScreen;