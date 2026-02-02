import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';

import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// Import ALL screens
import AssetDetailScreen from '../screens/AssetDetailScreen';
import GuidanceScreen from '../screens/GuidanceScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ReportScreen from '../screens/ReportScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import TrackScreen from '../screens/TrackScreen';
import QRScanScreen from '../screens/QRScanScreen';

// Import ALL Technician screens
import ProofOfWorkScreen from '../screens/Technician/ProofOfWorkScreen';
import TechnicianDashboardScreen from '../screens/Technician/TechnicianDashboardScreen';
import TechnicianIssueDetailScreen from '../screens/Technician/TechnicianIssueDetailScreen';
import TechnicianMapViewScreen from '../screens/Technician/TechnicianMapViewScreen';
import TechnicianProfileScreen from '../screens/Technician/TechnicianProfileScreen';

import { MainTabParamList, RootStackParamList, TechnicianTabParamList } from './types';

// --- Create the navigators ---
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const TechTabs = createBottomTabNavigator<TechnicianTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

// --- Auth Stack ---
// Groups the Login and Register screens together
const AuthNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
    <RootStack.Screen name="Login" component={LoginScreen} />
    <RootStack.Screen name="Register" component={RegisterScreen} />
  </RootStack.Navigator>
);

// --- Citizen's Tab Navigator ---
function CitizenTabNavigator() {
  const { t } = useLanguage();
  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        header: () => <Header />,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Report': iconName = 'alert-triangle'; break;
            case 'Track': iconName = 'clipboard'; break;
            case 'Suggestions': iconName = 'award'; break;
            case 'QRScan': iconName = 'maximize'; break;
            case 'Guidance': iconName = 'book-open'; break;
            default: iconName = 'circle';
          }
          return <Icon name={iconName} size={focused ? 24 : 22} color={color} />;
        },
        tabBarActiveTintColor: '#0056b3',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', paddingBottom: 10 },
        tabBarStyle: { height: 95, paddingTop: 10, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
      })}
    >
      <MainTabs.Screen name="Home" component={HomeScreen} options={{ title: t('nav_home') }} />
      <MainTabs.Screen name="Report" component={ReportScreen} options={{ title: t('nav_feedback') }} />
      <MainTabs.Screen name="Track" component={TrackScreen} options={{ title: t('nav_track') }} />
      <MainTabs.Screen name="Suggestions" component={SuggestionsScreen} options={{ title: t('nav_suggestions') }} />
      <MainTabs.Screen name="QRScan" component={QRScanScreen} options={{ title: t('nav_qr') }} />
      <MainTabs.Screen name="Guidance" component={GuidanceScreen} options={{ title: t('nav_guidance') }} />
    </MainTabs.Navigator>
  );
}

// --- Technician's Tab Navigator ---
function TechnicianTabNavigator() {
  const { t } = useLanguage();
  return (
    <TechTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Headers are handled inside each screen now
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string;
          if (route.name === 'TechnicianDashboard') iconName = 'clipboard';
          else if (route.name === 'TechnicianMap') iconName = 'map';
          else if (route.name === 'TechnicianProfile') iconName = 'user';
          else iconName = 'circle';
          return <Icon name={iconName} size={focused ? 26 : 22} color={color} />;
        },
        tabBarActiveTintColor: '#059669', // Professional Green
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', paddingBottom: 5 },
        tabBarStyle: { height: 90, paddingTop: 10, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
      })}
    >
      <TechTabs.Screen name="TechnicianDashboard" component={TechnicianDashboardScreen} options={{ title: t('tech_nav_dashboard') }} />
      <TechTabs.Screen name="TechnicianMap" component={TechnicianMapViewScreen} options={{ title: t('tech_nav_map') }} />
      <TechTabs.Screen name="TechnicianProfile" component={TechnicianProfileScreen} options={{ title: t('tech_nav_profile') }} />
    </TechTabs.Navigator>
  );
}

// --- The Main App Navigator ---
export default function AppNavigator() {
  const { user, isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false, cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
        {isAuthenticated ? (
          // User is logged in, determine which main interface to show
          <RootStack.Group>
            {(() => {
              switch (user?.role) {
                case 'lineman':
                  return (
                    <>
                      <RootStack.Screen name="TechnicianMain" component={TechnicianTabNavigator} />
                      <RootStack.Screen name="TechnicianIssueDetail" component={TechnicianIssueDetailScreen} />
                      <RootStack.Screen name="ProofOfWork" component={ProofOfWorkScreen} />
                    </>
                  );
                // case 'admin':
                //   return <RootStack.Screen name="AdminMain" component={AdminNavigator} />;
                case 'citizen':
                default:
                  return (
                    <>
                      <RootStack.Screen name="Main" component={CitizenTabNavigator} />
                      <RootStack.Screen name="ReportDetail" component={ReportDetailScreen} />
                      <RootStack.Screen name="AssetDetail" component={AssetDetailScreen} />
                    </>
                  );
              }
            })()}
          </RootStack.Group>
        ) : (
          // User is not logged in, show authentication screens.
          // Note: "Auth" is not a defined screen in your RootStackParamList, so this now groups Login/Register.
          // For a cleaner approach, you might add `Auth: NavigatorScreenParams<AuthStackParamList>` to your RootStackParamList.
          <RootStack.Group>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

