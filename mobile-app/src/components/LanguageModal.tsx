import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const LanguageModal = ({ isVisible, onClose }: LanguageModalProps) => {
    const { t, language, changeLanguage } = useLanguage();

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'hi', label: 'Hindi', native: 'हिंदी' },
        { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    ];

    const handleLanguageSelect = (code: string) => {
        changeLanguage(code);
        onClose();
    };

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>{t('profile.language') || 'Select Language'}</Text>
                    <Text style={styles.subtitle}>Choose your preferred language</Text>

                    <View style={styles.listContainer}>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.optionButton,
                                    language === lang.code && styles.optionButtonActive
                                ]}
                                onPress={() => handleLanguageSelect(lang.code)}
                            >
                                <View>
                                    <Text style={[
                                        styles.optionLabel,
                                        language === lang.code && styles.optionLabelActive
                                    ]}>
                                        {lang.native}
                                    </Text>
                                    <Text style={styles.optionSubLabel}>{lang.label}</Text>
                                </View>
                                {language === lang.code && (
                                    <View style={styles.checkIcon}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>{t('common.close_btn') || 'Cancel'}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    listContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FAFAFA',
    },
    optionButtonActive: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    optionLabelActive: {
        color: '#1E40AF',
    },
    optionSubLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center'
    },
    closeButton: {
        marginTop: 24,
        padding: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LanguageModal;
