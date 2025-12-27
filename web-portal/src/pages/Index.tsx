import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ReportsProvider } from '@/contexts/ReportsContext';
import PhoneMockup from '@/components/PhoneMockup';
import LoginScreen from '@/components/LoginScreen';
import RegisterScreen from '@/components/RegisterScreen';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProfileModal from '@/components/ProfileModal';
import ReportDetailView from '@/components/ReportDetailView';
import AssetDetailView from '@/components/AssetDetailView';
import HomeView from '@/views/HomeView';
import FeedbackView from '@/views/FeedbackView';
import TrackView from '@/views/TrackView';
import QRReportView from '@/views/QRReportView';
import GuidanceView from '@/views/GuidanceView';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  const handleReportClick = (reportId: string) => {
    setSelectedReportId(reportId);
  };

  const handleScanAsset = () => {
    setSelectedAssetId('GJ01-P4572');
  };

  if (!isAuthenticated) {
    return (
      <PhoneMockup>
        {showRegister ? (
          <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </PhoneMockup>
    );
  }

  return (
    <PhoneMockup>
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <Header onProfileClick={() => setShowProfile(true)} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20">
          <div className={activeView === 'home' ? '' : 'hidden'}>
            <HomeView onNavigate={handleNavigate} />
          </div>
          <div className={activeView === 'feedback' ? '' : 'hidden'}>
            <FeedbackView onNavigate={handleNavigate} />
          </div>
          <div className={activeView === 'track' ? '' : 'hidden'}>
            <TrackView onReportClick={handleReportClick} />
          </div>
          <div className={activeView === 'qr' ? '' : 'hidden'}>
            <QRReportView onScanAsset={handleScanAsset} />
          </div>
          <div className={activeView === 'guidance' ? '' : 'hidden'}>
            <GuidanceView />
          </div>
        </main>

        <BottomNavigation activeView={activeView} onNavigate={handleNavigate} />
        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
        <ReportDetailView
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
        />
        <AssetDetailView
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onNavigate={handleNavigate}
        />
      </div>
    </PhoneMockup>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ReportsProvider>
          <AppContent />
        </ReportsProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default Index;
