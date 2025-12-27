import React, { createContext, ReactNode, useContext, useState } from 'react';

// Central dictionary for all app text
const translations = {
  en: {
    // General
    close_btn: 'Close',
    cancel_btn: 'Cancel',
    sign_in_continue: 'Sign in to continue',
    report_not_found: 'Report not found.',

    // Auth Screens
    login_title: 'Welcome Back!',
    email_label: 'Email Address',
    password_label: 'Password',
    login_btn: 'Login',
    forgot_password: 'Forgot Password?',
    no_account: "Don't have an account?",
    register_link: 'Sign up',
    register_title: 'Create Your Account',
    full_name_placeholder: 'Full Name',
    phone_placeholder: 'Phone Number',
    email_placeholder: 'Email Address',
    password_placeholder: 'Password',
    register_btn: 'Create Account',
    has_account: 'Already have an account?',
    login_link: 'Login',
    toast_register_success: 'Registration successful!',
    login_error_title: 'Login Error',
    login_error_message: 'Please enter both email and password.',
    input_error_title: 'Input Error',
    input_error_message: 'Please fill all fields.',

    // Navigation
    nav_home: 'Home',
    nav_feedback: 'Report',
    nav_track: 'Track',
    nav_qr: 'Scan QR',
    nav_guidance: 'Guide',
    nav_suggestions: 'Ideas',

    // Profile Modal
    profile_title: 'My Profile',
    logout_btn: 'Logout',

    // Home Screen
    welcome_title: 'Welcome to Urja Setu',
    welcome_subtitle: 'Your partner in building a better Ahmedabad.',
    carousel_report_title: 'Report an Issue',
    carousel_report_desc: 'Submit a new complaint with photos and location.',
    carousel_track_title: 'Track Your Reports',
    carousel_track_desc: 'Check the live status of all your submissions.',
    carousel_guidance_title: 'Safety Guidance',
    carousel_guidance_desc: 'Read Do’s & Don’ts and find emergency contacts.',
    home_title: 'My Recent Reports',

    // Report Screen (File a Complaint)
    report_new_issue_title: 'File a Complaint',
    sos_btn: 'SOS',
    attach_photo_btn: '1. Attach Photo',
    change_photo_btn: 'Change Photo',
    get_location_btn: '2. Get Current Location',
    step_1_title: 'Add a Photo',
    step_2_title: 'Set Location',
    step_3_title: 'Describe the Issue',
    priority_label: 'Urgency Level',
    select_priority_placeholder: 'Select Priority...',
    issue_type_label: 'Type of Issue',
    select_issue_type_placeholder: 'Select Issue Type...',
    location_label: 'Location',
    location_placeholder: 'Auto-filled from GPS',
    description_label: 'Description',
    description_placeholder: 'Provide any extra details...',
    submit_report_btn: 'Submit Report',
    ai_loading_text: 'AI is analyzing your image...',
    gps_loading_text: 'Finding your location...',
    select_priority_title: 'Select Urgency Level',
    select_issue_type_title: 'Select Issue Type',
    priority_high: 'High',
    priority_medium: 'Medium',
    priority_low: 'Low',
    issue_pole_fallen: 'Pole Fallen',
    issue_transformer_sparking: 'Transformer Sparking',
    issue_short_circuit: 'Short Circuit',
    issue_broken_meter: 'Broken Meter Box',
    issue_exposed_wires: 'Exposed Wires',
    
    // Suggestions Screen
    suggestions_title: 'Community Ideas',
    suggestions_author_prefix: 'by',
    suggestions_modal_title: 'Share Your Idea',
    suggestions_title_placeholder: 'Suggestion Title',
    suggestions_desc_placeholder: 'Describe your idea in detail...',
    suggestions_submit_btn: 'Submit Idea',

    // Track Screen
    track_title: 'Track Your Reports',
    track_empty_title: 'No Reports Yet',
    track_empty_subtitle: 'Once you submit a report, you can track its status here.',
    priority_display_high: 'High Priority',
    priority_display_medium: 'Medium Priority',
    priority_display_low: 'Low Priority',
    
    // QR Scan Screen
    qr_scan_title: 'Scan Asset QR Code',
    qr_scan_subtitle: 'Point your camera at the QR code on the electrical asset.',
    permission_camera_request: 'Requesting for camera permission...',
    permission_camera_denied: 'No access to camera. Please enable it in your settings.',
    permission_camera_message: 'We need your permission to show the camera.',
    grant_permission_btn: 'Grant Permission',
    qr_scanned_title: 'QR Code Scanned',
    qr_scanned_message: 'Asset ID found:',
    view_details_btn: 'View Details',
    manual_entry_btn: 'Manual Entry',
    need_help_btn: 'Need Help?',

    // Guidance Screen
    guidance_title: 'Safety & Guidance',
    guidance_safety_title: "Electrical Safety Do’s & Don’ts",
    guidance_dos: "Do’s",
    guidance_donts: "Don’ts",
    guidance_do1: "Keep a safe distance (at least 10 feet) from faults.",
    guidance_do2: "Report only—never attempt to repair yourself.",
    guidance_do3: "Use your phone’s zoom feature to take photos.",
    guidance_do4: "If indoors, switch off the main power only if you can do so safely.",
    guidance_do5: "Stay dry—water conducts electricity.",
    guidance_dont1: "Do not touch exposed wires or damaged equipment.",
    guidance_dont2: "Do not pour water on electrical fires.",
    guidance_dont3: "Do not enter restricted areas like substations.",
    guidance_dont4: "Do not click pictures during active rainfall or storms.",
    guidance_dont5: "Do not try to fix meters or circuits unless you are a certified technician.",
    guidance_emergency: "Emergency Helplines",
    guidance_tap_to_call: "Tap to call an emergency service",
    guidance_helpline: "Electricity Helpline",
    guidance_state_emergency: "State Emergency",
    guidance_ambulance: "Ambulance",
    guidance_fire: "Fire & Rescue",
    guidance_faq: "Frequently Asked Questions",
    guidance_q1: "What is UrjaSetu?",
    guidance_a1: "It's an app for citizens to report faulty electrical infrastructure directly to the authorities.",
    guidance_q2: "How do I track my complaint?",
    guidance_a2: "Go to the 'Track' screen to see the live status of all your submissions.",
    guidance_q3: "What if there is a serious accident?",
    guidance_a3: "Call emergency numbers like 1912 or 101 immediately. Your safety comes first.",

    // Detail Screens
    asset_title: 'Asset Details',
    asset_install_date: 'Installation Date',
    asset_last_check: 'Last Checked',
    asset_history: 'Status & History',
    asset_report_btn: 'Report an Issue with this Asset',
    details_title: 'Report Details',

    // Statuses
    status_submitted: 'Submitted',
    status_in_progress: 'In Progress',
    status_resolved: 'Resolved',

    // Alerts
    error_alert: 'Error',
    phone_call_error: 'Could not make the phone call.',
    permission_required_title: "Permission Required",
    permission_required_message: "You've refused to allow this app to access your photos.",
    location_permission_message: "You've refused to allow this app to access your location.",
    geotag_success_title: "Location Captured!",
    geotag_success_message: "Your current location has been set to:",
    ai_success_title: "AI Detection Complete",
    ai_success_message: "We've identified the object as:",
    form_incomplete_title: "Incomplete Form",
    form_incomplete_message: "Please fill out all fields and select a priority.",
    report_submitted_title: "Report Submitted",
    report_submitted_message: "Thank you! Your report has been received.",
    emergency_contacts_title: "Emergency Contacts",
    emergency_helpline_1: "Electricity Helpline (1912)",
    emergency_helpline_2: "Ambulance (108)",
    emergency_helpline_3: "Fire & Rescue (101)",

  },
  gu: { // Gujarati Translations
    // General
    close_btn: 'બંધ',
    cancel_btn: 'રદ કરો',
    sign_in_continue: 'ચાલુ રાખવા માટે સાઇન ઇન કરો',
    report_not_found: 'ફરિયાદ મળી નથી.',

    // Auth Screens
    login_title: 'ફરી સ્વાગત છે!',
    email_label: 'ઈમેલ સરનામું',
    password_label: 'પાસવર્ડ',
    login_btn: 'લૉગિન કરો',
    forgot_password: 'પાસવર્ડ ભૂલી ગયા?',
    no_account: 'ખાતું નથી?',
    register_link: 'સાઇન અપ કરો',
    register_title: 'તમારું એકાઉન્ટ બનાવો',
    full_name_placeholder: 'પૂરું નામ',
    phone_placeholder: 'ફોન નંબર',
    email_placeholder: 'ઈમેલ સરનામું',
    password_placeholder: 'પાસવર્ડ',
    register_btn: 'એકાઉન્ટ બનાવો',
    has_account: 'પહેલેથી જ એકાઉન્ટ છે?',
    login_link: 'લૉગિન કરો',
    toast_register_success: 'નોંધણી સફળ!',
    login_error_title: 'લૉગિન ભૂલ',
    login_error_message: 'કૃપા કરીને ઇમેઇલ અને પાસવર્ડ બંને દાખલ કરો.',
    input_error_title: 'ઇનપુટ ભૂલ',
    input_error_message: 'કૃપા કરીને બધી વિગતો ભરો.',

    // Navigation
    nav_home: 'હોમ',
    nav_feedback: 'ફરિયાદ',
    nav_track: 'ટ્રેક',
    nav_qr: 'QR સ્કેન',
    nav_guidance: 'માર્ગદર્શન',
    nav_suggestions: 'વિચારો',

    // Profile Modal
    profile_title: 'મારી પ્રોફાઇલ',
    logout_btn: 'લૉગઆઉટ',

    // Home Screen
    welcome_title: 'ઉર્જા સેતુમાં આપનું સ્વાગત છે',
    welcome_subtitle: 'વધુ સારા અમદાવાદના નિર્માણમાં તમારા ભાગીદાર.',
    carousel_report_title: 'સમસ્યાની જાણ કરો',
    carousel_report_desc: 'ફોટા અને સ્થાન સાથે નવી ફરિયાદ નોંધાવો.',
    carousel_track_title: 'તમારી ફરિયાદો ટ્રૅક કરો',
    carousel_track_desc: 'તમારી બધી ફરિયાદોની લાઇવ સ્થિતિ તપાસો.',
    carousel_guidance_title: 'સુરક્ષા માર્ગદર્શન',
    carousel_guidance_desc: 'શું કરવું અને શું ન કરવું તે વાંચો અને ઇમરજન્સી સંપર્કો શોધો.',
    home_title: 'મારી તાજેતરની ફરિયાદો',

    // Report Screen
    report_new_issue_title: 'નવી ફરિયાદ નોંધો',
    sos_btn: 'SOS',
    attach_photo_btn: '૧. ફોટો જોડો',
    change_photo_btn: 'ફોટો બદલો',
    get_location_btn: '૨. વર્તમાન સ્થાન મેળવો',
    step_1_title: 'ફોટો ઉમેરો',
    step_2_title: 'સ્થાન સેટ કરો',
    step_3_title: 'સમસ્યાનું વર્ણન કરો',
    priority_label: 'તાકીદનું સ્તર',
    select_priority_placeholder: 'પ્રાથમિકતા પસંદ કરો...',
    issue_type_label: 'સમસ્યાનો પ્રકાર',
    select_issue_type_placeholder: 'સમસ્યાનો પ્રકાર પસંદ કરો...',
    location_label: 'સ્થાન',
    location_placeholder: 'GPS થી આપમેળે ભરાઈ જશે',
    description_label: 'વર્ણન',
    description_placeholder: 'કોઈપણ વધારાની વિગતો પ્રદાન કરો...',
    submit_report_btn: 'ફરિયાદ સબમિટ કરો',
    ai_loading_text: 'AI તમારી છબીનું વિશ્લેષણ કરી રહ્યું છે...',
    gps_loading_text: 'તમારું સ્થાન શોધી રહ્યું છે...',
    select_priority_title: 'તાકીદનું સ્તર પસંદ કરો',
    select_issue_type_title: 'સમસ્યાનો પ્રકાર પસંદ કરો',
    priority_high: 'ઉચ્ચ',
    priority_medium: 'મધ્યમ',
    priority_low: 'નીચું',
    issue_pole_fallen: 'થાંભલો પડી ગયો',
    issue_transformer_sparking: 'ટ્રાન્સફોર્મરમાં તણખા',
    issue_short_circuit: 'શોર્ટ સર્કિટ',
    issue_broken_meter: 'તૂટેલું મીટર બોક્સ',
    issue_exposed_wires: 'ખુલ્લા વાયર',

    // Suggestions Screen
    suggestions_title: 'સમુદાયના વિચારો',
    suggestions_author_prefix: 'દ્વારા',
    suggestions_modal_title: 'તમારો વિચાર શેર કરો',
    suggestions_title_placeholder: 'સૂચનનું શીર્ષક',
    suggestions_desc_placeholder: 'તમારા વિચારનું વિગતવાર વર્ણન કરો...',
    suggestions_submit_btn: 'વિચાર સબમિટ કરો',

    // Track Screen
    track_title: 'તમારી ફરિયાદો ટ્રૅક કરો',
    track_empty_title: 'હજી સુધી કોઈ ફરિયાદ નથી',
    track_empty_subtitle: 'એકવાર તમે ફરિયાદ સબમિટ કરશો, પછી તમે તેની સ્થિતિ અહીં ટ્રૅક કરી શકશો.',
    priority_display_high: 'ઉચ્ચ પ્રાથમિકતા',
    priority_display_medium: 'મધ્યમ પ્રાથમિકતા',
    priority_display_low: 'ઓછી પ્રાથમિકતા',

    // QR Scan Screen
    qr_scan_title: 'QR કોડ સ્કેન કરો',
    qr_scan_subtitle: 'તમારા કેમેરાને ઇલેક્ટ્રિકલ એસેટ પરના QR કોડ પર રાખો.',
    permission_camera_request: 'કેમેરાની પરવાનગી માટે વિનંતી કરી રહ્યાં છીએ...',
    permission_camera_denied: 'કેમેરાની ઍક્સેસ નથી. કૃપા કરીને સેટિંગ્સમાં સક્ષમ કરો.',
    permission_camera_message: 'કેમેરો બતાવવા માટે અમને તમારી પરવાનગીની જરૂર છે.',
    grant_permission_btn: 'પરવાનગી આપો',
    qr_scanned_title: 'QR કોડ સ્કેન થયો',
    qr_scanned_message: 'એસેટ આઈડી મળ્યું:',
    view_details_btn: 'વિગતો જુઓ',
    manual_entry_btn: 'જાતે દાખલ કરો',
    need_help_btn: 'મદદ चाहिए?',

    // Guidance Screen
    guidance_title: 'સુરક્ષા અને માર્ગદર્શન',
    guidance_safety_title: "વિદ્યુત સુરક્ષા: શું કરવું અને શું ન કરવું",
    guidance_dos: "શું કરવું",
    guidance_donts: "શું ન કરવું",
    guidance_do1: "ખામીઓથી સુરક્ષિત અંતર (ઓછામાં ઓછું ૧૦ ફૂટ) રાખો.",
    guidance_do2: "ફક્ત જાણ કરો—ક્યારેય જાતે સમારકામ કરવાનો પ્રયાસ કરશો નહીં.",
    guidance_do3: "ફોટા લેવા માટે તમારા ફોનના ઝૂમનો ઉપયોગ કરો.",
    guidance_do4: "જો ઘરની અંદર હોય, તો મુખ્ય પાવર બંધ કરો જો તમે સુરક્ષિત રીતે કરી શકો.",
    guidance_do5: "સૂકા રહો—પાણી વીજળીનું સંચાલન કરે છે.",
    guidance_dont1: "ખુલ્લા વાયર અથવા ક્ષતિગ્રસ્ત સાધનોને સ્પર્શ કરશો નહીં.",
    guidance_dont2: "વિદ્યુત આગ પર પાણી નાખશો નહીં.",
    guidance_dont3: "પ્રતિબંધિત વિસ્તારો જેમ કે સબસ્ટેશનમાં પ્રવેશ કરશો નહીં.",
    guidance_dont4: "વરસાદ કે તોફાન દરમિયાન ફોટા ન લો.",
    guidance_dont5: "તમે પ્રમાણિત ટેકનિશિયન ન હો તો મીટર કે સર્કિટ ঠিক કરવાનો પ્રયાસ કરશો નહીં.",
    guidance_emergency: "ઇમરજન્સી હેલ્પલાઇન",
    guidance_tap_to_call: "ઇમરજન્સી સેવાને કૉલ કરવા માટે ટેપ કરો",
    guidance_helpline: "વીજળી હેલ્પલાઇન",
    guidance_state_emergency: "રાજ્ય ઇમરજન્સી",
    guidance_ambulance: "એમ્બ્યુલન્સ",
    guidance_fire: "ફાયર અને બચાવ",
    guidance_faq: "વારંવાર પૂછાતા પ્રશ્નો",
    guidance_q1: "ઉર્જા સેતુ શું છે?",
    guidance_a1: "આ એક એપ છે જે નાગરિકોને ખામીયુક્ત વિદ્યુત માળખાકીય સુવિધાઓની સીધી જાણ અધિકારીઓને કરવા દે છે.",
    guidance_q2: "હું મારી ફરિયાદને કેવી રીતે ટ્રેક કરી શકું?",
    guidance_a2: "'ટ્રેક' સ્ક્રીન પર જાઓ અને તમારી બધી ફરિયાદોની લાઇવ સ્થિતિ જુઓ.",
    guidance_q3: "જો કોઈ ગંભીર અકસ્માત થાય તો શું કરવું?",
    guidance_a3: "તરત જ ૧૯૧૨ અથવા ૧૦૧ જેવા ઇમરજન્સી નંબરો પર કૉલ કરો. તમારી સુરક્ષા પ્રથમ આવે છે.",

    // Detail Screens
    asset_title: 'એસેટ વિગતો',
    asset_install_date: 'ઇન્સ્ટોલેશન તારીખ',
    asset_last_check: 'છેલ્લી તપાસ',
    asset_history: 'સ્થિતિ અને ઇતિહાસ',
    asset_report_btn: 'આ એસેટ સાથે સમસ્યાની જાણ કરો',
    details_title: 'ફરિયાદની વિગતો',

    // Statuses
    status_submitted: 'સબમિટ કરેલ',
    status_in_progress: 'પ્રગતિમાં છે',
    status_resolved: 'ઉકેલાઈ ગયું',

    // Alerts
    error_alert: 'ભૂલ',
    phone_call_error: 'ફોન કૉલ કરી શકાયો નથી.',
    permission_required_title: "પરવાનગી જરૂરી",
    permission_required_message: "તમે આ એપને તમારા ફોટા એક્સેસ કરવાની પરવાનગી નકારી દીધી છે.",
    location_permission_message: "તમે આ એપને તમારું સ્થાન એક્સેસ કરવાની પરવાનગી નકારી દીધી છે.",
    geotag_success_title: "સ્થાન કેપ્ચર થયું!",
    geotag_success_message: "તમારું વર્તમાન સ્થાન આ પર સેટ કરવામાં આવ્યું છે:",
    ai_success_title: "AI દ્વારા શોધ પૂર્ણ",
    ai_success_message: "અમે આ વસ્તુને આ તરીકે ઓળખી છે:",
    form_incomplete_title: "અપૂર્ણ ફોર્મ",
    form_incomplete_message: "કૃપા કરીને ફરિયાદ સબમિટ કરવા માટે બધી વિગતો ભરો અને પ્રાથમિકતા પસંદ કરો.",
    report_submitted_title: "ફરિયાદ સબમિટ થઈ",
    report_submitted_message: "આભાર! તમારી ફરિયાદ મળી ગઈ છે.",
    emergency_contacts_title: "ઇમરજન્સી સંપર્કો",
    emergency_helpline_1: "વીજળી હેલ્પલાઇન (૧૯૧૨)",
    emergency_helpline_2: "એમ્બ્યુલન્સ (૧૦૮)",
    emergency_helpline_3: "ફાયર અને બચાવ (૧૦૧)",
  },
};

type Language = 'en' | 'gu';

// Define the shape of our context
interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create the provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'gu' : 'en'));
  };

  const t = (key: keyof typeof translations.en): string => {
    // Fallback to English if a translation is missing in the current language
    return (translations[language] as any)[key] || translations.en[key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook to use the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

