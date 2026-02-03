import '@/i18n'; // Initialize i18n
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ReportsProvider } from '@/contexts/ReportsContext';
import { TechnicianTasksProvider } from '@/contexts/TechnicianTasksContext'; // 👈 1. Import the new provider
import AppNavigator from '@/navigation/AppNavigator';
import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';


// This is a common warning in Expo apps with bottom tabs, it's safe to ignore.
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
]);

/**
 * This is the root component of the application.
 * It sets up all the global context providers (for authentication, language, etc.)
 * and renders the main AppNavigator, which controls all screen flows.
 */
export default function App() {
  return (
    // Provides gesture handling capabilities throughout the app
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Ensures content is displayed correctly on devices with notches */}
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <ReportsProvider>
              {/* 👇 2. Wrap the navigator with the new provider */}
              <TechnicianTasksProvider>
                <AppNavigator />
              </TechnicianTasksProvider>
            </ReportsProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}