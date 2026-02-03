import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';

// --- PARAMETER LISTS ---
// These lists define which parameters each screen can accept. 'undefined' means no parameters.

/**
 * Defines the screens available in the main bottom tab navigator for citizens.
 */
export type MainTabParamList = {
  Home: undefined;
  Report: undefined;
  Track: undefined;
  Suggestions: undefined;
  Guidance: undefined;
  QRScan: undefined;
};

/**
 * Defines the screens available in the technician's bottom tab navigator.
 */
export type TechnicianTabParamList = {
  TechnicianDashboard: undefined;
  TechnicianMap: undefined;
  TechnicianProfile: undefined;
};

/**
 * Defines all possible screens in the application's root stack navigator.
 * This includes nested navigators like Main (for citizens) and TechnicianMain.
 */
export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  Register: undefined;

  // Citizen Flow
  Main: NavigatorScreenParams<MainTabParamList>;
  ReportDetail: { reportId: string };
  AssetDetail: { assetId: string };

  // Technician Flow
  TechnicianMain: NavigatorScreenParams<TechnicianTabParamList>;
  TechnicianIssueDetail: { taskId: string };
  ProofOfWork: { taskId: string };
  Leaderboard: undefined;
};


// --- NAVIGATION & SCREEN PROP TYPES ---
// These are helper types to provide strong type-checking for navigation and screen components.

/**
 * A generic type for the navigation prop across the entire RootStack.
 * Use this for the `useNavigation` hook.
 * Example: const navigation = useNavigation<RootStackNavigationProp>();
 */
export type RootStackNavigationProp<T extends keyof RootStackParamList = keyof RootStackParamList> = StackNavigationProp<RootStackParamList, T>;
export type AuthStackNavigationProp = RootStackNavigationProp; // Alias for compatibility
export type RegisterScreenProps = RootStackScreenProps<'Register'>;
export type AssetDetailScreenProps = RootStackScreenProps<'AssetDetail'>;

/**
 * A generic type for screen props within the RootStack.
 * Use this to type the props of a screen component.
 * Example: const LoginScreen = ({ navigation }: RootStackScreenProps<'Login'>) => { ... };
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

/**
 * Type for props of screens that are part of the Citizen's MainTabNavigator.
 * It combines the tab screen's own props with the parent stack's props.
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    StackScreenProps<RootStackParamList>
  >;

/**
 * Type for props of screens that are part of the Technician's TabNavigator.
 * This ensures type safety within the technician-specific part of the app.
 */
export type TechnicianTabScreenProps<T extends keyof TechnicianTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<TechnicianTabParamList, T>,
    StackScreenProps<RootStackParamList>
  >;
