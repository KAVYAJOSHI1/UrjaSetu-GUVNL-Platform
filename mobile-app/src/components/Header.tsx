import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 1. Import the hook that measures the phone's safe area
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useLanguage } from '../contexts/LanguageContext';
import ProfileModal from '../screens/ProfileModal';

const Header = () => {
  const { language, cycleLanguage } = useLanguage();
  const [isProfileOpen, setProfileOpen] = useState(false);
  // 2. Get the measurements for the top, bottom, etc.
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* 3. Apply the top inset as padding, INCREASING the extra space from 10 to 15 */}
      <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
        <Text style={styles.logo}>Urja Setu</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.langButton} onPress={cycleLanguage}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => setProfileOpen(true)}>
            <Icon name="user" size={30} color="#007BFF" />
          </TouchableOpacity>
        </View>
      </View>
      <ProfileModal isVisible={isProfileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12, // Kept a bit more bottom padding for balance
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  profileButton: {
    padding: 4,
  },
});

export default Header;

