import React from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AssetDetailViewProps {
  assetId: string | null;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const AssetDetailView = ({ assetId, onClose, onNavigate }: AssetDetailViewProps) => {
  const { t } = useLanguage();

  if (!assetId) return null;

  return (
    <div className="absolute inset-0 bg-[#F0F2F5] z-20 flex flex-col animate-slide-in-right">
      <div className="bg-white shadow-sm w-full px-4 pt-8 pb-3 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Button>
        <h2 className="text-xl font-bold text-[#0056b3]">{t('asset_title')}</h2>
      </div>
      <div className="p-4 overflow-y-auto flex-1 pb-20 custom-scrollbar space-y-6">
        <Card className="shadow">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800">Pole ID: {assetId}</h3>
            <p className="text-sm text-gray-500">Bodakdev, Ahmedabad</p>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('asset_install_date')}</p>
                <p className="font-bold text-gray-800">14-Jan-2022</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('asset_last_check')}</p>
                <p className="font-bold text-gray-800">02-Aug-2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('asset_history')}</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Routine Check</p>
                  <p className="text-sm text-gray-500">02-Aug-2025 - All parameters normal.</p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Fuse Replaced</p>
                  <p className="text-sm text-gray-500">
                    19-Mar-2024 - Replaced faulty fuse as part of preventive maintenance.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => {
            onClose();
            onNavigate('feedback');
          }}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {t('asset_report_btn')}
        </Button>
      </div>
    </div>
  );
};

export default AssetDetailView;
