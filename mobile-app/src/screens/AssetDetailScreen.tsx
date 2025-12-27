import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useLanguage } from '../contexts/LanguageContext';
import { AssetDetailScreenProps } from '../navigation/types';

const AssetDetailScreen = ({ route, navigation }: AssetDetailScreenProps) => {
  const { assetId } = route.params;
  const { t } = useLanguage();

  if (!assetId) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('asset_title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Asset ID Card */}
        <View style={styles.card}>
            <Text style={styles.assetId}>Pole ID: {assetId}</Text>
            <Text style={styles.assetLocation}>Bodakdev, Ahmedabad</Text>
        </View>

        {/* Key Info Card */}
        <View style={styles.card}>
            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>{t('asset_install_date')}</Text>
                    <Text style={styles.gridValue}>14-Jan-2022</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>{t('asset_last_check')}</Text>
                    <Text style={styles.gridValue}>02-Aug-2025</Text>
                </View>
            </View>
        </View>

        {/* Maintenance History Card */}
        <View style={styles.card}>
            <Text style={styles.historyTitle}>{t('asset_history')}</Text>
            {/* History Item 1 */}
            <View style={styles.historyItem}>
                <View style={[styles.historyIconContainer, {backgroundColor: '#D1FAE5'}]}>
                    <Icon name="check-circle" size={20} color="#065F46" />
                </View>
                <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemTitle}>Routine Check</Text>
                    <Text style={styles.historyItemSubtitle}>02-Aug-2025 - All parameters normal.</Text>
                </View>
            </View>
            {/* History Item 2 */}
            <View style={styles.historyItem}>
                <View style={[styles.historyIconContainer, {backgroundColor: '#FEF3C7'}]}>
                    <Icon name="alert-circle" size={20} color="#92400E" />
                </View>
                <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemTitle}>Fuse Replaced</Text>
                    <Text style={styles.historyItemSubtitle}>19-Mar-2024 - Replaced faulty fuse.</Text>
                </View>
            </View>
        </View>

        <TouchableOpacity 
            style={styles.reportButton} 
            // UPDATED: Navigate to the 'Main' navigator AND specify the 'Report' screen inside it.
            onPress={() => navigation.navigate('Main', { screen: 'Report' })}
        >
            <Text style={styles.reportButtonText}>{t('asset_report_btn')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0056b3',
        marginLeft: 16,
    },
    scrollContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    assetId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    assetLocation: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    gridItem: {
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    gridValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 4,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    historyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    historyItemContent: {
      flex: 1,
    },
    historyItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    historyItemSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    reportButton: {
        backgroundColor: '#0056b3',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    reportButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AssetDetailScreen;