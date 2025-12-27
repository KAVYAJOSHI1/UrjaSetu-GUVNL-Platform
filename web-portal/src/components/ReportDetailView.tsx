import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReports } from '@/contexts/ReportsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReportDetailViewProps {
  reportId: string | null;
  onClose: () => void;
}

const ReportDetailView = ({ reportId, onClose }: ReportDetailViewProps) => {
  const { t } = useLanguage();
  const { reports } = useReports();

  if (!reportId) return null;

  const report = reports.find((r) => r.id === reportId);
  if (!report) return null;

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
        <h2 className="text-xl font-bold text-[#0056b3]">{t('details_title')}</h2>
      </div>
      <div className="p-4 overflow-y-auto flex-1 pb-20 custom-scrollbar space-y-4">
        <Card className="shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{report.type}</h3>
              <p className="text-sm font-semibold text-blue-600">{report.id}</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">{report.location}</p>
            <p className="mt-4 text-gray-700">{report.description}</p>
            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt="Report"
                className="mt-4 rounded-lg w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=400&fit=crop';
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('asset_history')}</h3>
            <div className="space-y-6">
              {report.statusHistory.map((history, index) => {
                const isLast = index === report.statusHistory.length - 1;
                const isLatest = index === 0;
                return (
                  <div key={index} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          isLatest ? 'bg-blue-500 text-white' : 'bg-gray-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      {!isLast && <div className="w-px h-full bg-gray-300 mt-2" />}
                    </div>
                    <div className={!isLast ? 'pb-6' : ''}>
                      <p className="mb-1 text-sm font-bold text-gray-800">
                        {t(`status_${history.status.toLowerCase().replace(' ', '_')}`)}
                      </p>
                      <p className="text-xs text-gray-500">{history.date}</p>
                      <p className="mt-1 text-sm text-gray-600">{history.comment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportDetailView;
