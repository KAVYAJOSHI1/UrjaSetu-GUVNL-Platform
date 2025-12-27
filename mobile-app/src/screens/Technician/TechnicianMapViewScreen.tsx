import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import { TechnicianTask, useTechnicianTasks } from '../../contexts/TechnicianTasksContext';
import { RootStackNavigationProp } from '../../navigation/types';

// A professional, clean map style that helps markers stand out.
const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

const TechnicianMapViewScreen = () => {
    const { tasks } = useTechnicianTasks();
    const navigation = useNavigation<RootStackNavigationProp<'TechnicianMain'>>();
    const [selectedTask, setSelectedTask] = useState<TechnicianTask | null>(null);
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: selectedTask ? 0 : 300,
            duration: 350,
            useNativeDriver: true,
        }).start();
    }, [selectedTask]);

    const initialRegion = tasks.length > 0 ? {
        latitude: tasks[0].coords.latitude,
        longitude: tasks[0].coords.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
    } : {
        latitude: 23.0225, // Default to Ahmedabad
        longitude: 72.5714,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
    };
    
    const handleMarkerPress = (task: TechnicianTask) => {
        setSelectedTask(task);
    };

    const getMarkerStyle = (priority: string) => {
        if (priority === 'High') return { bgColor: 'rgba(239, 68, 68, 0.2)', iconColor: '#EF4444', icon: 'alert-triangle' as const };
        if (priority === 'Medium') return { bgColor: 'rgba(245, 158, 11, 0.2)', iconColor: '#F59E0B', icon: 'alert-circle' as const };
        return { bgColor: 'rgba(16, 185, 129, 0.2)', iconColor: '#10B981', icon: 'check-circle' as const };
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Task Map View</Text>
            </View>
            <MapView
                style={styles.map}
                provider="google"
                initialRegion={initialRegion}
                customMapStyle={mapStyle}
                onPress={() => setSelectedTask(null)} // Deselect on map press
            >
                {tasks.map(task => {
                    const markerStyle = getMarkerStyle(task.priority);
                    const isSelected = selectedTask?.id === task.id;
                    return (
                        <Marker
                            key={task.id}
                            coordinate={task.coords}
                            onPress={() => handleMarkerPress(task)}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <CustomMarker isSelected={isSelected} priority={task.priority} icon={markerStyle.icon} iconColor={markerStyle.iconColor} />
                        </Marker>
                    );
                })}
            </MapView>
            
            {selectedTask && (
                <Animated.View style={[styles.bottomCard, { transform: [{ translateY: slideAnim }] }]}>
                    <Image source={{ uri: selectedTask.imageUrl }} style={styles.cardImage} />
                    <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedTask(null)}>
                        <Icon name="x" size={20} color="#374151" />
                    </TouchableOpacity>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{selectedTask.type}</Text>
                        <View style={styles.locationRow}>
                            <Icon name="map-pin" size={14} color="#6B7280" />
                            <Text style={styles.cardLocation}>{selectedTask.location}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.detailsButton} 
                            onPress={() => navigation.navigate('TechnicianIssueDetail', { taskId: selectedTask.id })}>
                            <Text style={styles.detailsButtonText}>View Full Details</Text>
                            <Icon name="arrow-right-circle" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

// Custom Marker Component with pulsing animation for high priority
const CustomMarker = ({ isSelected, priority, icon, iconColor }: { isSelected: boolean, priority: string, icon: any, iconColor: string }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isSelected ? 1.2 : 1,
            friction: 3,
            useNativeDriver: true,
        }).start();

        if (priority === 'High') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [isSelected, priority]);

    return (
        <Animated.View style={[styles.markerContainer, { transform: [{ scale: scaleAnim }] }]}>
            {priority === 'High' && <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />}
            <View style={[styles.markerCore, { backgroundColor: iconColor }]}>
                <Icon name={icon} size={18} color="#FFFFFF" />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    map: { flex: 1 },
    markerContainer: { alignItems: 'center', justifyContent: 'center' },
    markerCore: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    pulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.4)',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -5 },
        overflow: 'hidden',
    },
    cardImage: { width: '100%', height: 150 },
    cardContent: { padding: 20, paddingTop: 15 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardLocation: { fontSize: 16, color: '#6B7280', marginLeft: 8 },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#059669',
        borderRadius: 12,
        paddingVertical: 14,
    },
    detailsButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default TechnicianMapViewScreen;

