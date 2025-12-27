import React from 'react';
import { QrCode } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QRReportViewProps {
  onScanAsset: () => void;
}

const QRReportView = ({ onScanAsset }: QRReportViewProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-[#0056b3]">{t('qr_title')}</h2>
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-4">
          <QrCode className="w-24 h-24 mx-auto text-gray-300" strokeWidth={1} />
          <p className="text-gray-600">{t('qr_instructions')}</p>
          <Button
            onClick={onScanAsset}
            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700"
          >
            <QrCode className="w-6 h-6 mr-2" />
            {t('qr_scan_btn')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRReportView;
