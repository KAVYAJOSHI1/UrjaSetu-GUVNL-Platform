import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-scale-in">
        <h3 className="text-xl font-bold text-[#0056b3]">{t('profile_title')}</h3>
        <div className="mt-6 space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">{user?.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">{user?.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">{user?.phone}</span>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            {t('logout_btn')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
