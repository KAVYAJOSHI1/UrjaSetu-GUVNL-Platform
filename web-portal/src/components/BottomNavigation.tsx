import React from 'react';
import { Home, Zap, ClipboardList, QrCode, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BottomNavigationProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const BottomNavigation = ({ activeView, onNavigate }: BottomNavigationProps) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', icon: Home, label: t('nav_home') },
    { id: 'feedback', icon: Zap, label: t('nav_feedback') },
    { id: 'track', icon: ClipboardList, label: t('nav_track') },
    { id: 'qr', icon: QrCode, label: t('nav_qr') },
    { id: 'guidance', icon: BookOpen, label: t('nav_guidance') },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around z-10">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 flex flex-col items-center p-3 transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
