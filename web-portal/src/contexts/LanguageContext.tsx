import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'gu';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth
    login_title: "Urjasatu Login",
    email_label: "Email Address",
    password_label: "Password",
    login_btn: "Login",
    forgot_password: "Forgot Password?",
    no_account: "Don't have an account?",
    register_link: "Register",
    register_title: "Create Account",
    full_name_placeholder: "Full Name",
    phone_placeholder: "Phone Number",
    email_placeholder: "Email Address",
    password_placeholder: "Password",
    register_btn: "Register",
    has_account: "Already have an account?",
    login_link: "Login",

    // Navigation
    nav_home: "Home",
    nav_feedback: "Feedback",
    nav_track: "Track",
    nav_guidance: "Guidance",
    nav_qr: "QR Report",

    // Profile
    profile_title: "My Profile",
    logout_btn: "Logout",
    close_btn: "Close",
    details_title: "Details",

    // Home
    home_welcome: "Welcome, Kavya!",
    home_subtitle: "How can we help you today?",
    home_report_btn: "Report Issue",
    home_track_btn: "Track Reports",
    home_activity: "Recent Activity",

    // Feedback
    feedback_title: "Submit Feedback",
    feedback_report_tab: "Report an Issue",
    feedback_suggestion_tab: "Give a Suggestion",
    feedback_desc_placeholder: "Please describe the issue...",
    feedback_submit_report: "Submit Report",
    suggestion_placeholder: "How can we improve?",
    feedback_submit_suggestion: "Submit Suggestion",

    // Track
    track_title: "Track Your Reports",
    track_empty: "You haven't submitted any reports yet.",

    // Guidance
    guidance_title: "Guidance & Safety",
    guidance_emergency: "Emergency Contacts",
    guidance_tap_to_call: "Tap a number to call immediately.",
    guidance_helpline: "Urjasatu Helpline",
    guidance_state_emergency: "State Emergency",
    guidance_faq: "Frequently Asked Questions",
    guidance_q1: "What to do during an outage?",
    guidance_a1: "Check your circuit breakers first. If they are fine, please report it using the Feedback tab.",
    guidance_q2: "How to protect from voltage spikes?",
    guidance_a2: "Using a good quality surge protector for sensitive electronics is highly recommended.",

    // Status
    status_resolved: "Resolved",
    status_in_progress: "In Progress",
    status_acknowledged: "Acknowledged",
    status_submitted: "Submitted",

    // Toasts
    toast_report_success: "Report submitted successfully!",
    toast_suggestion_success: "Suggestion submitted!",
    toast_desc_required: "Please enter a description.",
    toast_register_success: "Registration successful! Please log in.",

    // Form Fields
    form_priority: "Priority",
    priority_low: "🟢 Low",
    priority_medium: "🟡 Medium",
    priority_high: "🔴 High",
    form_location: "Location",
    location_fetching: "Fetching location...",
    location_error: "Could not fetch location. Tap to try again.",
    form_emergency_cta: "In case of emergency, call now!",
    form_geotag_btn: "Geotag My Location",
    feedback_type_label: "Type of Issue",
    issue_type_outage: "⚡️ Power Outage",
    issue_type_voltage: "⚠️ Voltage Fluctuation",
    issue_type_wires: "⛓️ Broken Wires",
    issue_type_other: "📝 Other",
    priority_display_high: "🔴 High Priority",
    priority_display_medium: "🟡 Medium Priority",
    priority_display_low: "🟢 Low Priority",

    // QR & Asset
    qr_title: "QR Asset Reporting",
    qr_instructions: "Scan the QR code on any GUVNL asset (pole, transformer, etc.) to view its history or report a new issue for that specific asset.",
    qr_scan_btn: "Scan Asset QR Code",
    asset_title: "Asset Details",
    asset_history: "Maintenance History",
    asset_report_btn: "Report Issue for this Asset",
    asset_install_date: "Installation Date",
    asset_last_check: "Last Maintenance",
    asset_past_issues: "Past Reported Issues",
  },
  gu: {
    // Auth
    login_title: "ઉર્જાસાતુ લોગીન",
    email_label: "ઈમેલ એડ્રેસ",
    password_label: "પાસવર્ડ",
    login_btn: "લોગીન કરો",
    forgot_password: "પાસવર્ડ ભૂલી ગયા?",
    no_account: "એકાઉન્ટ નથી?",
    register_link: "રજીસ્ટર કરો",
    register_title: "એકાઉન્ટ બનાવો",
    full_name_placeholder: "પૂરું નામ",
    phone_placeholder: "ફોન નંબર",
    email_placeholder: "ઈમેલ એડ્રેસ",
    password_placeholder: "પાસવર્ડ",
    register_btn: "રજીસ્ટર કરો",
    has_account: "પહેલેથી એકાઉન્ટ છે?",
    login_link: "લોગીન કરો",

    // Navigation
    nav_home: "હોમ",
    nav_feedback: "પ્રતિસાદ",
    nav_track: "ટ્રેક",
    nav_guidance: "માર્ગદર્શન",
    nav_qr: "QR રિપોર્ટ",

    // Profile
    profile_title: "મારી પ્રોફાઇલ",
    logout_btn: "લૉગઆઉટ",
    close_btn: "બંધ કરો",
    details_title: "વિગતો",

    // Home
    home_welcome: "સ્વાગત છે, કાવ્યા!",
    home_subtitle: "અમે આજે તમને કેવી રીતે મદદ કરી શકીએ?",
    home_report_btn: "સમસ્યાની જાણ કરો",
    home_track_btn: "રિપોર્ટ્સ ટ્રેક કરો",
    home_activity: "તાજેતરની પ્રવૃત્તિ",

    // Feedback
    feedback_title: "પ્રતિસાદ આપો",
    feedback_report_tab: "સમસ્યાની જાણ કરો",
    feedback_suggestion_tab: "સૂચન આપો",
    feedback_desc_placeholder: "કૃપા કરીને સમસ્યાનું વર્ણન કરો...",
    feedback_submit_report: "રિપોર્ટ સબમિટ કરો",
    suggestion_placeholder: "અમે કેવી રીતે સુધારી શકીએ?",
    feedback_submit_suggestion: "સૂચન સબમિટ કરો",

    // Track
    track_title: "તમારા રિપોર્ટ્સ ટ્રેક કરો",
    track_empty: "તમે હજી સુધી કોઈ રિપોર્ટ સબમિટ કર્યો નથી.",

    // Guidance
    guidance_title: "માર્ગદર્શન અને સુરક્ષા",
    guidance_emergency: "ઇમરજન્સી સંપર્કો",
    guidance_tap_to_call: "તરત જ કૉલ કરવા માટે નંબર પર ટેપ કરો.",
    guidance_helpline: "ઉર્જાસાતુ હેલ્પલાઇન",
    guidance_state_emergency: "રાજ્ય ઇમરજન્સી",
    guidance_faq: "વારંવાર પૂછાતા પ્રશ્નો",
    guidance_q1: "આઉટેજ દરમિયાન શું કરવું?",
    guidance_a1: "પહેલા તમારા ઘરના સર્કિટ બ્રેકર્સ તપાસો. જો તે બરાબર હોય, તો કૃપા કરીને પ્રતિસાદ ટેબનો ઉપયોગ કરીને તેની જાણ કરો.",
    guidance_q2: "વોલ્ટેજ સ્પાઇક્સથી કેવી રીતે બચવું?",
    guidance_a2: "સંવેદનશીલ ઇલેક્ટ્રોનિક્સ માટે સારી ગુણવત્તાવાળા સર્જ પ્રોટેક્ટરનો ઉપયોગ કરવાની ભલામણ કરવામાં આવે છે.",

    // Status
    status_resolved: "ઉકેલાઈ ગયું",
    status_in_progress: "પ્રગતિમાં છે",
    status_acknowledged: "સ્વીકાર્યું",
    status_submitted: "સબમિટ કર્યું",

    // Toasts
    toast_report_success: "રિપોર્ટ સફળતાપૂર્વક સબમિટ થયો!",
    toast_suggestion_success: "સૂચન સબમિટ થયું!",
    toast_desc_required: "કૃપા કરીને વર્ણન દાખલ કરો.",
    toast_register_success: "રજીસ્ટ્રેશન સફળ! કૃપા કરીને લોગીન કરો.",

    // Form Fields
    form_priority: "પ્રાથમિકતા",
    priority_low: "🟢 નીચી",
    priority_medium: "🟡 મધ્યમ",
    priority_high: "🔴 ઉચ્ચ",
    form_location: "સ્થળ",
    location_fetching: "સ્થળ મેળવી રહ્યું છે...",
    location_error: "સ્થળ મળ્યું નથી. ફરીથી પ્રયાસ કરવા માટે ટેપ કરો.",
    form_emergency_cta: "ઇમરજન્સીમાં, હમણાં કૉલ કરો!",
    form_geotag_btn: "મારું સ્થાન જીઓટેગ કરો",
    feedback_type_label: "સમસ્યાનો પ્રકાર",
    issue_type_outage: "⚡️ પાવર આઉટેજ",
    issue_type_voltage: "⚠️ વોલ્ટેજ વધઘટ",
    issue_type_wires: "⛓️ તૂટેલા વાયર",
    issue_type_other: "📝 અન્ય",
    priority_display_high: "🔴 ઉચ્ચ પ્રાથમિકતા",
    priority_display_medium: "🟡 મધ્યમ પ્રાથમિકતા",
    priority_display_low: "🟢 નીચી પ્રાથમિકતા",

    // QR & Asset
    qr_title: "QR એસેટ રિપોર્ટિંગ",
    qr_instructions: "કોઈપણ GUVNL એસેટ (પોલ, ટ્રાન્સફોર્મર, વગેરે) પર QR કોડ સ્કેન કરો અને તેનો ઇતિહાસ જુઓ અથવા તે એસેટ માટે નવી સમસ્યાની જાણ કરો.",
    qr_scan_btn: "એસેટ QR કોડ સ્કેન કરો",
    asset_title: "એસેટની વિગતો",
    asset_history: "જાળવણીનો ઇતિહાસ",
    asset_report_btn: "આ એસેટ માટે સમસ્યાની જાણ કરો",
    asset_install_date: "ઇન્સ્ટોલેશન તારીખ",
    asset_last_check: "છેલ્લી જાળવણી",
    asset_past_issues: "ભૂતકાળમાં નોંધાયેલી સમસ્યાઓ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'gu' : 'en'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
