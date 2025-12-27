import React from 'react';
import { Zap, ClipboardList } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

const HomeView = ({ onNavigate }: HomeViewProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('home_welcome')}</h2>
        <p className="text-gray-500">{t('home_subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => onNavigate('feedback')}
          className="flex flex-col items-center justify-center bg-blue-500 text-white p-6 h-auto rounded-xl shadow-lg hover:bg-blue-600 transition-all transform hover:-translate-y-1"
        >
          <Zap className="w-8 h-8" />
          <span className="mt-2 font-semibold text-sm">{t('home_report_btn')}</span>
        </Button>
        <Button
          onClick={() => onNavigate('track')}
          variant="outline"
          className="flex flex-col items-center justify-center bg-white text-gray-700 p-6 h-auto rounded-xl shadow-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1"
        >
          <ClipboardList className="w-8 h-8" />
          <span className="mt-2 font-semibold text-sm">{t('home_track_btn')}</span>
        </Button>
      </div>
      <Card className="shadow">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 mb-2">{t('home_activity')}</h3>
          <p className="text-sm text-gray-600">
            Your report <span className="font-semibold text-blue-600">#RPT-1024</span> has been
            acknowledged.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeView;
