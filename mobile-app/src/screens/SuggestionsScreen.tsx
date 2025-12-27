import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase'; // Make sure this path is correct

// --- 1. TYPE UPDATED ---
// Matches your 'profiles' (with 'name')
// Matches the new 'suggestions' (with 'title', 'description', 'comments_count')
type Suggestion = {
  id: string;
  created_at: string;
  citizen_id: string;
  title: string;
  description: string;
  upvotes: number;
  profiles: {
    name: string; // <-- FIX: Using 'name' column from your profiles table
  } | null;
};

const SuggestionsScreen = () => {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Checks if the form is valid (disables submit button)
  const isFormValid = newTitle.trim() !== '' && newDescription.trim() !== '';

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    
    // --- 2. FETCH FIX ---
    // Now selects 'name' from profiles
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        profiles (
          name 
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suggestions:', error);
      Alert.alert(t('error_title'), error.message);
    } else if (data) {
      setSuggestions(data as Suggestion[]);
    }
    setLoading(false);
  };

  const handleUpvote = async (id: string, currentUpvotes: number) => {
    const newUpvotes = currentUpvotes + 1;

    setSuggestions(
      suggestions.map((s) => (s.id === id ? { ...s, upvotes: newUpvotes } : s))
    );

    const { error } = await supabase
      .from('suggestions')
      .update({ upvotes: newUpvotes })
      .eq('id', id);

    if (error) {
      console.error('Error upvoting:', error);
      Alert.alert(t('error_title'), error.message);
      setSuggestions(
        suggestions.map((s) => (s.id === id ? { ...s, upvotes: currentUpvotes } : s))
      );
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return; // Guard clause

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
        console.error('Error getting user session:', sessionError);
        Alert.alert(t('error_title'), t('suggestions_user_error'));
        return;
    }

    const user = session.user;
    
    // --- 3. SUBMIT FIX ---
    // Now saves to the new 'title' and 'description' columns
    const newSuggestionData = {
      citizen_id: user.id,
      title: newTitle.trim(),
      description: newDescription.trim(),
      upvotes: 1, 
      
    };

    // --- 4. RE-FETCH FIX ---
    // Fetches the new row, including the 'name' from profiles
    const { data: newSuggestion, error } = await supabase
      .from('suggestions')
      .insert(newSuggestionData)
      .select(`
        *,
        profiles (
          name 
        )
      `)
      .single();

    if (error) {
      console.error('Error creating suggestion:', error.message);
      Alert.alert(t('error_title'), error.message);
    } else if (newSuggestion) {
      setSuggestions([newSuggestion as Suggestion, ...suggestions]);
      setModalVisible(false);
      setNewTitle('');
      setNewDescription('');
    }
  };

  const renderItem = ({ item }: { item: Suggestion }) => {
    // --- 5. RENDER FIX ---
    // No need to split 'suggestion_text' anymore
    // Just use 'item.title' and 'item.description' directly
    const authorName = item.profiles?.name || 'Anonymous';

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardAuthor}>{t('suggestions_author_prefix')} {authorName}</Text>
        <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.footerButton} onPress={() => handleUpvote(item.id, item.upvotes)}>
            <Icon name="thumbs-up" size={18} color="#0056b3" />
            <Text style={styles.footerText}>{item.upvotes}</Text>
          </TouchableOpacity>
          
          
          
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={suggestions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.title}>{t('suggestions_title')}</Text>}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#0056b3" />
            ) : (
              <Text style={styles.emptyText}>{t('suggestions_empty')}</Text>
            )}
          </View>
        )}
        onRefresh={fetchSuggestions}
        refreshing={loading}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>{t('suggestions_modal_title')}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t('suggestions_title_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    value={newTitle}
                    onChangeText={setNewTitle}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('suggestions_desc_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    value={newDescription}
                    onChangeText={setNewDescription}
                    multiline
                />
                
                {/* 7. DISABLED BUTTON FIX */}
                <TouchableOpacity 
                  style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]} 
                  onPress={handleSubmit}
                  disabled={!isFormValid} // This disables the button
                >
                    <Text style={styles.submitButtonText}>{t('suggestions_submit_btn')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButtonText}>{t('cancel_btn')}</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles (including the new disabled button style)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  listContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 20, paddingHorizontal: 8 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#1F2937',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  cardAuthor: { fontSize: 12, color: '#6B7280', marginVertical: 4, fontStyle: 'italic' },
  cardDescription: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginVertical: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  footerButton: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  footerText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#4B5563' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0056b3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0056b3',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#0056b3', padding: 16, borderRadius: 10, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  submitButtonDisabled: {
    backgroundColor: '#A5B4FC', // A lighter, "disabled" color
  },

  closeButton: { marginTop: 12, padding: 16, alignItems: 'center' },
  closeButtonText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SuggestionsScreen;