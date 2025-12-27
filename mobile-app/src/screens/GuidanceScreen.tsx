import React, { useState } from 'react';
import {
    Alert,
    LayoutAnimation,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useLanguage } from '../contexts/LanguageContext';

// Enable smooth animations on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const GuidanceScreen = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePhonePress = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Could not make the phone call.');
    });
  };

  // --- DO’S & DON’TS CONTENT ---
  const dos = [
    "Keep a safe distance (at least 10 feet) from exposed wires, broken poles, or open electrical panels.",
    "Report only—never attempt to repair electrical faults yourself.",
    "Capture photos from a safe distance using your phone’s zoom feature.",
    "If indoors, switch off the main power only if you can do so safely.",
    "Stay dry—water conducts electricity. Avoid taking pictures in the rain or while standing on wet surfaces.",
  ];

  const donts = [
    "Do not touch exposed wires, damaged poles, or broken transformers.",
    "Do not pour water on electrical fires—use sand or a dry cloth if it’s safe.",
    "Do not try to fix meters, switches, or transformers yourself.",
    "Do not click pictures during active rainfall or lightning.",
    "Do not enter restricted areas like substations or high-voltage zones."
  ];

  // --- FAQs CONTENT ---
  const faqs = [
    {
      question: "What is UrjaSetu and who can use it?",
      answer:
        "UrjaSetu lets citizens report broken or faulty electrical infrastructure (like poles, wires, or transformers) directly to the maintenance authority. Residents of Ahmedabad can report, track, and get real-time updates."
    },
    {
      question: "How do I report an issue?",
      answer:
        "Open the Report section, fill in the issue type, description, attach a photo, mark the location, and tap Submit. The report is automatically routed to the right department."
    },
    {
      question: "How can I track the status of my complaint?",
      answer:
        "Go to the Track screen to see all submitted reports. Each shows a live status—Submitted, In Progress, or Resolved—and a detailed timeline."
    },
    {
      question: "What should I do if a serious electrical accident occurs?",
      answer:
        "Call emergency numbers immediately (Fire: 101, Power Helpline: 1912, Ambulance: 108, Police: 100). Do not approach damaged or energized areas."
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Safety & Guidance</Text>

        {/* --- DO’S AND DON’TS --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Electrical Safety Do’s & Don’ts</Text>
          <View>
            <View style={styles.safetyHeader}>
              <Icon name="check-circle" size={22} color="#15803D" />
              <Text style={[styles.safetyTitle, { color: '#15803D' }]}>Do’s</Text>
            </View>
            {dos.map((item, index) => (
              <Text key={`do-${index}`} style={styles.safetyItem}>• {item}</Text>
            ))}
          </View>
          <View style={{ marginTop: 24 }}>
            <View style={styles.safetyHeader}>
              <Icon name="x-circle" size={22} color="#B91C1C" />
              <Text style={[styles.safetyTitle, { color: '#B91C1C' }]}>Don’ts</Text>
            </View>
            {donts.map((item, index) => (
              <Text key={`dont-${index}`} style={styles.safetyItem}>• {item}</Text>
            ))}
          </View>
        </View>

        {/* --- EMERGENCY CARD --- */}
        <View style={[styles.card, styles.emergencyCard]}>
          <Text style={styles.emergencyTitle}>Emergency Helplines</Text>
          <Text style={styles.emergencySubtitle}>Tap to call an emergency service</Text>
          <TouchableOpacity style={styles.phoneButton} onPress={() => handlePhonePress('1912')}>
            <Text style={styles.phoneButtonText}>Electricity Helpline</Text>
            <View style={styles.phoneIconContainer}>
              <Text style={styles.phoneNumber}>1912</Text>
              <Icon name="phone" size={16} color="#991B1B" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.phoneButton} onPress={() => handlePhonePress('108')}>
            <Text style={styles.phoneButtonText}>Ambulance</Text>
            <View style={styles.phoneIconContainer}>
              <Text style={styles.phoneNumber}>108</Text>
              <Icon name="phone" size={16} color="#991B1B" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.phoneButton} onPress={() => handlePhonePress('101')}>
            <Text style={styles.phoneButtonText}>Fire & Rescue</Text>
            <View style={styles.phoneIconContainer}>
              <Text style={styles.phoneNumber}>101</Text>
              <Icon name="phone" size={16} color="#991B1B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- FAQs --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFaq(index)}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Icon
                  name={openFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
              {openFaq === index && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#0056b3', marginBottom: 20, paddingHorizontal: 8 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
  emergencyCard: { backgroundColor: '#FFF1F2' },
  emergencyTitle: { fontSize: 22, fontWeight: '700', color: '#BE123C' },
  emergencySubtitle: { fontSize: 14, color: '#4B5563', marginTop: 4, marginBottom: 16 },
  phoneButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 16, marginBottom: 10,
  },
  phoneButtonText: { fontSize: 16, fontWeight: '600', color: '#991B1B' },
  phoneIconContainer: { flexDirection: 'row', alignItems: 'center' },
  phoneNumber: { fontSize: 16, fontWeight: 'bold', color: '#BE123C', marginRight: 8 },
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  faqQuestion: { fontSize: 16, fontWeight: '600', color: '#374151', flex: 1, marginRight: 12 },
  faqAnswerContainer: { paddingTop: 4, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: '#3B82F6', marginLeft: 4, marginTop: 4, marginBottom: 16 },
  faqAnswer: { fontSize: 15, color: '#4B5563', lineHeight: 22, paddingLeft: 12 },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  safetyTitle: { fontSize: 20, fontWeight: '700', marginLeft: 10 },
  safetyItem: { fontSize: 15, color: '#4B5563', lineHeight: 22, marginBottom: 6, marginLeft: 12 },
});

export default GuidanceScreen;

