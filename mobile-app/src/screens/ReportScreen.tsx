import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  ActivityIndicator, // --- ADDED ---
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

// --- ADDED ---
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase'; // Import your Supabase client

type Priority = 'High' | 'Medium' | 'Low';
type Option = { label: string; value: string; icon: string; color?: string };

const ReportScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { user } = useAuth(); // --- ADDED --- Get the logged-in user

  const [issueType, setIssueType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);

  // --- ADDED --- New state variables
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null); // To store lat/long
  const [loading, setLoading] = useState(false); // For the submit button

  const [isClassifying, setIsClassifying] = useState(false);
  const [isGeotagging, setIsGeotagging] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [isPriorityModalVisible, setPriorityModalVisible] = useState(false);
  const [isIssueTypeModalVisible, setIssueTypeModalVisible] = useState(false);
  const [isEmergencyModalVisible, setEmergencyModalVisible] = useState(false);

  // (priorityOptions and issueTypeOptions are unchanged)
  const priorityOptions: Option[] = [
    { label: t('priority_high'), value: 'High', icon: 'alert-octagon', color: '#DC2626' },
    { label: t('priority_medium'), value: 'Medium', icon: 'alert-triangle', color: '#D97706' },
    { label: t('priority_low'), value: 'Low', icon: 'shield', color: '#16A34A' },
  ];

  const issueTypeOptions: Option[] = [
    { label: t('issue_pole_fallen'), value: 'Pole Fallen', icon: 'trending-down' },
    { label: t('issue_transformer_sparking'), value: 'Transformer Sparking', icon: 'zap' },
    { label: t('issue_short_circuit'), value: 'Short Circuit', icon: 'alert-circle' },
    { label: t('issue_broken_meter'), value: 'Broken Meter Box', icon: 'box' },
    { label: t('issue_exposed_wires'), value: 'Exposed Wires', icon: 'slash' },
  ];


  const handleImagePick = async () => {
    // (This function is unchanged)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(t('permission_required_title'), t('permission_required_message'));
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
      classifyImage(pickerResult.assets[0].uri);
    }
  };

  const handleGeotag = async () => {
    setIsGeotagging(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permission_required_title'), t('location_permission_message'));
      setIsGeotagging(false);
      return;
    }
    try {
      let position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      // --- ADDED --- Store the coordinates object
      setCoords(position.coords);

      let reverseGeocode = await Location.reverseGeocodeAsync(position.coords);

      if (reverseGeocode[0]) {
        const { name, street, city, postalCode } = reverseGeocode[0];
        const capturedLocation = `${name || ''}, ${street || ''}, ${city || ''} ${postalCode || ''}`.replace(/^,|,$/g, '').trim();
        setLocation(capturedLocation);
        setLocationCaptured(true);
        Alert.alert(t('geotag_success_title'), `${t('geotag_success_message')} ${capturedLocation}`);
      }
    } catch (error) {
      Alert.alert("Location Error", "Could not fetch location. Please check your GPS settings.");
    } finally {
      setIsGeotagging(false);
    }
  };

  // (classifyImage function is unchanged)
  const classifyImage = async (uri: string) => {
    setIsClassifying(true);

    try {
      const fileExt = uri.split('.').pop();
      const fileName = `temp_${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: formData
      });

      if (error) throw error;

      if (data && data.prediction) {
        setIssueType(data.prediction);
        setDescription(data.description || description);
        if (data.priority) setPriority(data.priority);

        Alert.alert('AI Diagnosis Complete', `Detected: ${data.prediction}\nConfidence: ${data.confidence}%`);
      }

    } catch (e: any) {
      console.log("AI Analysis failed:", e);
      // Fallback or silent fail
    } finally {
      setIsClassifying(false);
    }
  };

  // --- ADDED --- Helper function to reset the form
  const clearForm = () => {
    setIssueType('');
    setLocation('');
    setDescription('');
    setImageUri(null);
    setPriority(null);
    setCoords(null);
    setLocationCaptured(false);
  };

  // --- MODIFIED --- This is the main Supabase logic
  const handleSubmit = async () => {
    // 1. Validate all fields
    if (!issueType || !location || !description || !priority || !coords || !user) {
      Alert.alert(t('form_incomplete_title'), t('form_incomplete_message'));
      return;
    }

    setLoading(true);
    try {
      let publicImageUrl: string | null = null;

      // 2. Upload image if one exists
      if (imageUri) {
        const fileExt = imageUri.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('issue-images') // Use the bucket you created
          .upload(filePath, formData);

        if (uploadError) throw new Error(uploadError.message);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('issue-images')
          .getPublicUrl(uploadData.path);

        publicImageUrl = urlData.publicUrl;
      }

      // 3. Prepare location data for PostGIS (Stored as JSON for local compatibility)
      const locationJson = JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      // 4. Insert into the 'issues' table
      const { error: insertError } = await supabase
        .from('issues')
        .insert({
          citizen_id: user.id,
          title: issueType, // Using issueType as the title
          description: description,
          issue_type: issueType,
          location: locationJson, // Changed from POINT string to JSON
          address_text: location, // The human-readable string address
          image_url: publicImageUrl,
          status: 'Reported',
          priority: priority,
          // assigned_to is left null by default
        });

      if (insertError) throw new Error(insertError.message);

      // 5. Success
      Alert.alert(
        t('report_submitted_title'),
        t('report_submitted_message'),
        [{ text: 'OK', onPress: () => navigation.navigate('Home' as never) }]
      );
      clearForm();

    } catch (error: any) {
      console.error('Error submitting report:', error.message);
      Alert.alert('Submission Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // (handlePhonePress and Modals are unchanged)
  const handlePhonePress = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => Alert.alert('Error', 'Could not make the phone call.'));
  };

  const SelectionModal = ({ visible, onClose, options, onSelect, title }: any) => (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.optionButton} onPress={() => { onSelect(item); onClose(); }}>
                <Icon name={item.icon} size={22} color={item.color || '#374151'} />
                <Text style={[styles.optionButtonText, { color: item.color || '#374151' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('close_btn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const EmergencyModal = () => (
    <Modal visible={isEmergencyModalVisible} transparent={true} animationType="fade" onRequestClose={() => setEmergencyModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Emergency Contacts</Text>
          <TouchableOpacity style={styles.emergencyButton} onPress={() => handlePhonePress('1912')}>
            <Icon name="zap" size={22} color="#991B1B" />
            <Text style={styles.emergencyButtonText}>Electricity Helpline (1912)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emergencyButton} onPress={() => handlePhonePress('108')}>
            <Icon name="plus-circle" size={22} color="#991B1B" />
            <Text style={styles.emergencyButtonText}>Ambulance (108)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emergencyButton} onPress={() => handlePhonePress('101')}>
            <Icon name="shield" size={22} color="#991B1B" />
            <Text style={styles.emergencyButtonText}>Fire & Rescue (101)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => setEmergencyModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>File a Complaint</Text>
            <TouchableOpacity style={styles.sosButton} onPress={() => setEmergencyModalVisible(true)}>
              <Icon name="alert-octagon" size={24} color="#FFF" />
              <Text style={styles.sosButtonText}>SOS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {/* (Steps 1, 2, 3 are unchanged) */}
            <View style={styles.stepContainer}>
              <View style={styles.stepIcon}><Text style={styles.stepText}>1</Text></View>
              <Text style={styles.stepTitle}>Add a Photo</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleImagePick}>
              <Icon name="camera" size={20} color="#374151" />
              <Text style={styles.actionButtonText}>{imageUri ? t('change_photo_btn') : t('attach_photo_btn')}</Text>
            </TouchableOpacity>
            {isClassifying && <Text style={styles.loadingText}>🤖 {t('ai_loading_text')}</Text>}
            {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

            <View style={styles.stepContainer}>
              <View style={styles.stepIcon}><Text style={styles.stepText}>2</Text></View>
              <Text style={styles.stepTitle}>Set Location</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleGeotag}>
              <Icon name="map-pin" size={20} color="#374151" />
              <Text style={styles.actionButtonText}>{t('get_location_btn')}</Text>
            </TouchableOpacity>
            {isGeotagging && <Text style={styles.loadingText}>🛰️ {t('gps_loading_text')}</Text>}

            <View style={styles.stepContainer}>
              <View style={styles.stepIcon}><Text style={styles.stepText}>3</Text></View>
              <Text style={styles.stepTitle}>Describe the Issue</Text>
            </View>

            {/* (Form inputs are unchanged) */}
            <Text style={styles.label}>{t('priority_label')}</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setPriorityModalVisible(true)}>
              {priority ? (
                <>
                  <Icon name={priorityOptions.find(p => p.value === priority)?.icon || 'circle'} size={20} color={priorityOptions.find(p => p.value === priority)?.color} />
                  <Text style={[styles.dropdownButtonText, { color: priorityOptions.find(p => p.value === priority)?.color }]}>
                    {priority} Priority
                  </Text>
                </>
              ) : (
                <Text style={styles.dropdownPlaceholder}>{t('select_priority_placeholder')}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>{t('issue_type_label')}</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setIssueTypeModalVisible(true)}>
              <Icon name={issueTypeOptions.find(i => i.value === issueType)?.icon || 'alert-triangle'} size={20} color={issueType ? '#111827' : '#9CA3AF'} />
              <Text style={[styles.dropdownButtonText, !issueType && styles.dropdownPlaceholder]}>
                {issueType || t('select_issue_type_placeholder')}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t('location_label')}</Text>
            <View style={styles.inputContainer}>
              <Icon name="map" size={20} color={locationCaptured ? '#10B981' : '#9CA3AF'} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder={t('location_placeholder')} value={location} onChangeText={setLocation} editable={!locationCaptured} />
            </View>

            <Text style={styles.label}>{t('description_label')}</Text>
            <View style={styles.inputContainer}>
              <Icon name="file-text" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput style={[styles.input, styles.textArea]} placeholder={t('description_placeholder')} value={description} onChangeText={setDescription} multiline />
            </View>
          </View>

          {/* --- MODIFIED --- Submit button now shows loading state */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 10 }} />
            ) : (
              <Icon name="send" size={20} color="white" style={{ marginRight: 10 }} />
            )}
            <Text style={styles.submitButtonText}>
              {loading ? t('submitting_btn_text') : t('submit_report_btn')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* (Modals are unchanged) */}
      <EmergencyModal />
      <SelectionModal visible={isPriorityModalVisible} onClose={() => setPriorityModalVisible(false)} options={priorityOptions} onSelect={(item: any) => setPriority(item.value)} title={t('select_priority_title')} />
      <SelectionModal visible={isIssueTypeModalVisible} onClose={() => setIssueTypeModalVisible(false)} options={issueTypeOptions} onSelect={(item: any) => setIssueType(item.value)} title={t('select_issue_type_title')} />
    </SafeAreaView>
  );
};

// --- MODIFIED --- Added styles for the disabled submit button
const styles = StyleSheet.create({
  // (All your other styles are perfect and unchanged)
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  scrollContainer: { padding: 16 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827' },
  sosButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  sosButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 6 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#0056b3', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stepText: { color: 'white', fontWeight: 'bold' },
  stepTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginLeft: 4, marginTop: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, marginBottom: 16 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: '#111827' },
  inputIcon: { paddingLeft: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 14, justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  actionButtonText: { marginLeft: 10, fontSize: 16, fontWeight: '600', color: '#374151' },
  imagePreview: { width: '100%', height: 180, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  loadingText: { textAlign: 'center', fontStyle: 'italic', color: '#0056b3', marginBottom: 16 },
  submitButton: { backgroundColor: '#007BFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 5 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  // --- ADDED ---
  submitButtonDisabled: {
    backgroundColor: '#A9CFFC', // A lighter, disabled blue
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 20, textAlign: 'center' },
  optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  optionButtonText: { marginLeft: 12, fontSize: 18, fontWeight: '500' },
  closeButton: { backgroundColor: '#E5E7EB', borderRadius: 10, padding: 14, marginTop: 16, alignItems: 'center' },
  closeButtonText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  emergencyButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, backgroundColor: '#FEE2E2', borderRadius: 10, marginBottom: 10, paddingHorizontal: 16 },
  emergencyButtonText: { marginLeft: 12, fontSize: 18, fontWeight: '600', color: '#991B1B' },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  dropdownButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827'
  },
  dropdownPlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default ReportScreen;