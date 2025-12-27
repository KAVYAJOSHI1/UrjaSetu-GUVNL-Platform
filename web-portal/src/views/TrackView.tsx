import React from 'react';
import { Zap, Lightbulb, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReports } from '@/contexts/ReportsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReportStatus, Priority } from '@/contexts/ReportsContext';

interface TrackViewProps {
  onReportClick: (reportId: string) => void;
}

const TrackView = ({ onReportClick }: TrackViewProps) => {
  const { t } = useLanguage();
  const { reports } = useReports();

  const getStatusColor = (status: ReportStatus) => {
    const colors = {
      Resolved: 'bg-green-100 text-green-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      Acknowledged: 'bg-blue-100 text-blue-800',
      Submitted: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      High: 'text-red-600',
      Medium: 'text-yellow-600',
      Low: 'text-gray-600',
    };
    return colors[priority];
  };

  const sortedReports = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedReports.length === 0) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0056b3] mb-4">{t('track_title')}</h2>
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {t('track_empty')}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-[#0056b3] mb-4">{t('track_title')}</h2>
      <div className="space-y-4">
        {sortedReports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onReportClick(report.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {report.isSuggestion ? (
                    <Lightbulb className="w-5 h-5 text-blue-500 mr-3" />
                  ) : (
                    <Zap className="w-5 h-5 text-yellow-500 mr-3" />
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{report.type}</p>
                    <p className="text-xs text-gray-500">
                      {report.id} • {report.date}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {t(`status_${report.status.toLowerCase().replace(' ', '_')}`)}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{report.description}</p>
              {report.priority && (
                <div className="mt-2 bg-gray-50 border-t border-gray-200 -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
                  <div className={`text-xs font-semibold flex items-center ${getPriorityColor(report.priority)}`}>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {t(`priority_display_${report.priority.toLowerCase()}`)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrackView;
