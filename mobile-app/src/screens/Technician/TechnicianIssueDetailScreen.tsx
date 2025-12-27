import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'; // Added useState, useEffect
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

// 👇 1. Import Supabase client
import { supabase } from '../../lib/supabase';
import {
  RootStackNavigationProp,
  RootStackParamList,
} from '../../navigation/types';

type TechDetailRouteProp = RouteProp<
  RootStackParamList,
  'TechnicianIssueDetail'
>;

// 👇 2. Define a type for the data we will fetch
// This includes the related citizen data!
type TaskData = {
  id: string;
  created_at: string;
  citizen_id: string;
  title: string;
  description: string;
  issue_type: string;
  location: { type: 'Point', coordinates: [number, number] } | null; // For GeoJSON
  address_text: string | null;
  image_url: string | null;
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  assigned_to: string | null;
  assigned_at: string | null;
  citizen: { // This comes from the relation
    name: string | null;
    phone: string | null;
  } | null;
};


const TechnicianIssueDetailScreen = () => {
  const route = useRoute<TechDetailRouteProp>();
  const navigation =
    useNavigation<RootStackNavigationProp<'TechnicianIssueDetail'>>();
  const { taskId } = route.params;

  // 👇 3. Remove context, add local state for loading and task data
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // For "Start Work" button

  // 👇 4. Fetch the task from Supabase when the screen loads
  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('issues')
          .select(`
            *,
            citizen:profiles!citizen_id ( name, phone )
          `) // Join with profiles table
          .eq('id', taskId)
          .single(); // We only want one
        
        if (error) throw error;
        if (data) {
          setTask(data as TaskData);
        }
      } catch (error: any) {
        console.error('Error fetching task details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]); // Re-run if taskId changes

  // 👇 5. Update handleStartWork to call Supabase directly
  const handleStartWork = async () => {
    if (!task || isUpdating) return;
    setIsUpdating(true);

    const { data, error } = await supabase
      .from('issues')
      .update({ 
        status: 'In Progress', 
        assigned_at: new Date().toISOString() // Update timestamp
      })
      .eq('id', task.id)
      .select() // Select the updated row
      .single();

    setIsUpdating(false);

    if (error) {
      console.error('Error starting work:', error.message);
      Alert.alert('Error', 'Could not update task status.');
    } else if (data) {
      // Update local state to match, so the UI changes
      setTask(data as TaskData); 
      Alert.alert(
        'Work Started',
        `The status for issue "${task.issue_type}" has been updated to "In Progress".`
      );
    }
  };

  // 👇 6. Update openMapDirections to use the correct data fields
  const openMapDirections = () => {
    if (!task || !task.location?.coordinates) {
      Alert.alert("No Location", "This task does not have precise coordinates.");
      return;
    }
    
    // GeoJSON is [longitude, latitude]
    const longitude = task.location.coordinates[0];
    const latitude = task.location.coordinates[1];
    
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = task.address_text || 'Issue Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
        Linking.openURL(url);
    }
  }
  
  // 👇 7. Add a loading state
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

  // 👇 8. This "Not Found" state now works correctly if the fetch fails
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
  
  // (Helper function unchanged)
  const getPriorityStyle = (priority: string) => {
    if (priority === 'High') return { color: '#EF4444', label: 'High Priority' };
    if (priority === 'Medium') return { color: '#F59E0B', label: 'Medium Priority' };
    return { color: '#6B7280', label: 'Low Priority' };
  };

  const priorityStyle = getPriorityStyle(task.priority);

  // 👇 9. Map Supabase columns to your component's props
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Task Details</Text>
        <View style={styles.headerIcon} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
            {/* Use issue_type */}
            <Text style={styles.title}>{task.issue_type}</Text>
            <View style={styles.idBadge}>
                {/* Use id, and slice for brevity */}
                <Text style={styles.idBadgeText}>{task.id.substring(0, 8)}...</Text>
            </View>
        </View>
        
        <View style={styles.infoRow}>
            <Icon name="map-pin" size={16} color="#6B7280" />
            {/* Use address_text */}
            <Text style={styles.subtitle}>{task.address_text || 'No address provided'}</Text>
        </View>
        <View style={styles.infoRow}>
             <Icon name="alert-circle" size={16} color={priorityStyle.color} />
            <Text style={[styles.subtitle, {color: priorityStyle.color, fontWeight: '600'}]}>{priorityStyle.label}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Report</Text>
          {/* Show citizen name */}
          <Text style={styles.reportedBy}>Reported by: {task.citizen?.name || 'Unknown User'}</Text>
          <Text style={styles.description}>{task.description}</Text>
          
          <Text style={styles.photoTitle}>Submitted Photo ("Before")</Text>
          {/* Handle null image_url */}
          {task.image_url ? (
             <Image source={{ uri: task.image_url }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No photo was submitted.</Text>
          )}
        </View>
        
        {/* 👇 10. Conditionally render map only if location data exists */}
        {task.location?.coordinates && (
          <View style={[styles.card, styles.mapCardContainer]}>
              <Text style={styles.cardTitle}>Geotagged Location</Text>
              <MapView
                  style={styles.map}
                  provider="google"
                  initialRegion={{
                  latitude: task.location.coordinates[1], // Latitude
                  longitude: task.location.coordinates[0], // Longitude
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
        {/* 👇 11. Update footer logic */}
        {task.status === 'Assigned' && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleStartWork}
            disabled={isUpdating} // Disable while updating
          >
            <Icon name="play-circle" size={22} color="white" />
            <Text style={styles.buttonText}>
              {isUpdating ? 'Starting...' : 'Start Work'}
            </Text>
          </TouchableOpacity>
        )}
        {task.status === 'In Progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => navigation.navigate('ProofOfWork', { taskId: task.id })}>
            <Icon name="check-circle" size={22} color="white" />
            <Text style={styles.buttonText}>Submit Proof of Work</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// --- Styles (with a few additions) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 50, // Adjust for platform
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerIcon: {
        width: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        flex: 1, // Allow title to take space
        marginHorizontal: 8,
    },
    scrollContainer: { padding: 20, paddingBottom: 120 },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    title: { 
        fontSize: 28, 
        fontWeight: '700', 
        color: '#1F2937',
        flex: 1,
        lineHeight: 36
    },
    idBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginLeft: 10
    },
    idBadgeText: {
        color: '#065F46',
        fontWeight: '600',
        fontSize: 12
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    subtitle: { fontSize: 16, color: '#6B7280', marginLeft: 8, flexShrink: 1 }, // Added flexShrink
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#1F2937',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
    },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
    reportedBy: {
      fontSize: 14,
      fontWeight: '500',
      color: '#4B5563',
      marginBottom: 8,
    },
    description: { fontSize: 16, color: '#374151', lineHeight: 24 },
    photoTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    image: { width: '100%', height: 200, borderRadius: 12 },
    noImageText: {
      fontSize: 14,
      color: '#6B7280',
      fontStyle: 'italic'
    },
    mapCardContainer: {
        padding: 8
    },
    map: {
        height: 200,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8
    },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#059669',
        paddingVertical: 12,
        borderRadius: 12,
    },
    directionsButtonText: {
        color: 'white',
        fontWeight: '600',
        marginRight: 8
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30, // Extra padding for home bar
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        elevation: 3
    },
    completeButton: { backgroundColor: '#059669' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // Added padding
    }
});

export default TechnicianIssueDetailScreen;