import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface TechnicianHeaderProps {
  userName: string;
}

const TechnicianHeader = ({ userName }: TechnicianHeaderProps) => {
  const { language, cycleLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.nameText}>{userName}</Text>
      </View>
      <TouchableOpacity style={styles.langButton} onPress={cycleLanguage} activeOpacity={0.8}>
        <Text style={styles.langText}>{language.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB', // Seamless with background
    paddingTop: 10, // Added padding for top spacing
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800', // Extra bold
    color: '#111827',
    letterSpacing: -0.5
  },
  langButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151'
  }
});

export default TechnicianHeader;