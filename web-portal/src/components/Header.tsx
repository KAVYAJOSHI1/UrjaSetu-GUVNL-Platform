import React from 'react';
import { User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onProfileClick: () => void;
}

const Header = ({ onProfileClick }: HeaderProps) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-white shadow-sm w-full px-4 pt-8 pb-3 z-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0056b3]">Urjasatu</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-gray-100 text-sm font-semibold text-blue-600 border-2 border-blue-200 w-10 h-10 flex items-center justify-center transition-all"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={onProfileClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <User className="w-8 h-8 text-[#007BFF]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
