import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RootStackNavigationProp, RootStackParamList } from '../../navigation/types';
// 👇 1. Import Supabase and the Auth hook
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type ProofOfWorkRouteProp = RouteProp<RootStackParamList, 'ProofOfWork'>;

const ProofOfWorkScreen = () => {
    const route = useRoute<ProofOfWorkRouteProp>();
    const navigation = useNavigation<RootStackNavigationProp<'ProofOfWork'>>();
    const { taskId } = route.params;
    // 👇 2. Get the logged-in user
    const { user } = useAuth();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "Camera access is needed to take a photo.");
            return;
        }
        const pickerResult = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!pickerResult.canceled) {
            setImageUri(pickerResult.assets[0].uri);
        }
    };

    // 👇 3. This is the new, fully functional handleSubmit
    const handleSubmit = async () => {
        if (!imageUri || !notes.trim() || !user) {
            Alert.alert("Incomplete", "Please provide an 'After' photo and completion notes.");
            return;
        }

        setLoading(true);
        try {
            // --- Step 1: Upload Image to Storage ---
            const fileExt = imageUri.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Create FormData for the image
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: fileName,
                type: `image/${fileExt}`,
            } as any);

            // Upload to the 'proof-images' bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('proof-images')
                .upload(filePath, formData);

            if (uploadError || !uploadData) {
                throw new Error('Image upload failed: ' + (uploadError?.message || 'Unknown error'));
            }

            // --- Step 2: Get Public URL of the uploaded image ---
            const { data: urlData } = supabase.storage
                .from('proof-images')
                .getPublicUrl(uploadData.path);

            const publicImageUrl = urlData.publicUrl;

            // --- Step 3: Insert into 'proof_of_work' table ---
            const { error: insertError } = await supabase
                .from('proof_of_work')
                .insert({
                    issue_id: taskId,
                    technician_id: user.id,
                    notes: notes.trim(),
                    image_url: publicImageUrl,
                });

            if (insertError) {
                throw new Error('Failed to save proof: ' + insertError.message);
            }

            // --- Step 4: Update 'issues' table status to 'Resolved' ---
            const { error: updateError } = await supabase
                .from('issues')
                .update({ status: 'resolved' })
                .eq('id', taskId);

            if (updateError) {
                throw new Error('Failed to update issue status: ' + updateError.message);
            }

            // --- Step 5: Success! Navigate back ---
            navigation.navigate('TechnicianMain', { screen: 'TechnicianDashboard' });

        } catch (error: any) {
            console.error("Submission failed:", error.message);
            Alert.alert("Submission Failed", "Could not submit proof of work. Please try again. " + error.message);
            setLoading(false); // Stop loading only if there's an error
        }
    };

    const isFormIncomplete = !imageUri || !notes.trim();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Submit Proof of Work</Text>
            <View style={styles.card}>
                <Text style={styles.label}>1. &quot;After&quot; Photo (Mandatory)</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <>
                            <Icon name="camera" size={32} color="#4B5563" />
                            <Text style={styles.imagePickerText}>Tap to Take Photo</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>2. Completion Notes</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="e.g., Replaced faulty capacitor and secured the paneling."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, (isFormIncomplete || loading) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isFormIncomplete || loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.submitButtonText}>Submit for Verification</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 24,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    imagePicker: {
        height: 220,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        marginBottom: 20,
    },
    imagePickerText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    textArea: {
        height: 120,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        backgroundColor: '#F9FAFB',
    },
    submitButton: {
        backgroundColor: '#059669',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    submitButtonDisabled: {
        backgroundColor: '#6EE7B7',
    },
});

export default ProofOfWorkScreen;