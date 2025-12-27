import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useLanguage } from '../contexts/LanguageContext';
import { RootStackParamList } from '../navigation/types';

type QRScanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const QRScanScreen = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<QRScanScreenNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused(); // Hook to check if the screen is active

  // Animation for the scanning line
  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      // Reset scan state when returning to the screen
      setScanned(false);
    }
  }, [isFocused]);

  // Loop the scanning animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanAnimation]);


  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    Alert.alert(
      t('qr_scanned_title'),
      `${t('qr_scanned_message')} ${data}`,
      [
        {
          text: t('view_details_btn'),
          onPress: () => navigation.navigate('AssetDetail', { assetId: data }),
        },
        {
          text: t('cancel_btn'),
          onPress: () => setScanned(false), // Allow scanning again
          style: 'cancel',
        },
      ]
    );
  };
  
  const animatedStyle = {
    transform: [
      {
        translateY: scanAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 240], // Animate within the scanner box height
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <View style={styles.overlay}>
        <Text style={styles.title}>{t('qr_scan_title')}</Text>
        <Text style={styles.subtitle}>{t('qr_scan_subtitle')}</Text>
        <View style={styles.scannerBox}>
            <Animated.View style={[styles.scanLine, animatedStyle]} />
        </View>
        <TouchableOpacity style={styles.helpButton} onPress={() => navigation.navigate('Guidance')}>
            <Icon name="help-circle" size={20} color="#FFF"/>
            <Text style={styles.helpButtonText}>{t('need_help_btn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: -40,
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  helpButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default QRScanScreen;

