import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isVisible, onClose }: ProfileModalProps) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    // It's good practice to close the modal before logging out
    // to prevent any visual glitches.
    onClose();
    logout();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose} // For Android back button
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => {}}>
          <Text style={styles.title}>{t('profile_title')}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="user" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{user?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="mail" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{user?.phone}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
             <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>{t('logout_btn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{t('close_btn')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0056b3',
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 24,
    gap: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    flex: 1, // Allow text to wrap if long
  },
  buttonContainer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  logoutButtonText: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileModal;

