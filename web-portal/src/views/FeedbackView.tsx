import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReports } from '@/contexts/ReportsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Priority } from '@/contexts/ReportsContext';

interface FeedbackViewProps {
  onNavigate: (view: string) => void;
}

const FeedbackView = ({ onNavigate }: FeedbackViewProps) => {
  const { t } = useLanguage();
  const { addReport, addSuggestion } = useReports();
  const [isReportMode, setIsReportMode] = useState(true);
  const [type, setType] = useState('Power Outage');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleGeotag = () => {
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            if (!response.ok) throw new Error();
            const data = await response.json();
            setLocation(data.display_name.split(',').slice(0, 3).join(','));
          } catch (error) {
            setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          } finally {
            setIsFetchingLocation(false);
          }
        },
        () => {
          toast.error(t('location_error'));
          setIsFetchingLocation(false);
        }
      );
    } else {
      toast.error(t('location_error'));
      setIsFetchingLocation(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error(t('toast_desc_required'));
      return;
    }
    addReport({ type, priority, description, location: location || 'Not specified' });
    toast.success(t('toast_report_success'));
    setDescription('');
    setLocation('');
    onNavigate('track');
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error(t('toast_desc_required'));
      return;
    }
    addSuggestion(description);
    toast.success(t('toast_suggestion_success'));
    setDescription('');
    onNavigate('track');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-[#0056b3]">{t('feedback_title')}</h2>
      <a
        href="tel:1912"
        className="flex items-center justify-center p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg shadow-sm hover:bg-red-200 transition-colors"
      >
        <Phone className="w-6 h-6 mr-3 animate-pulse" />
        <span className="font-semibold">{t('form_emergency_cta')}</span>
      </a>
      <div className="flex border border-gray-300 rounded-lg p-1 bg-gray-100">
        <Button
          onClick={() => setIsReportMode(true)}
          variant={isReportMode ? 'default' : 'ghost'}
          className={`flex-1 ${isReportMode ? 'bg-primary text-white' : ''}`}
        >
          {t('feedback_report_tab')}
        </Button>
        <Button
          onClick={() => setIsReportMode(false)}
          variant={!isReportMode ? 'default' : 'ghost'}
          className={`flex-1 ${!isReportMode ? 'bg-primary text-white' : ''}`}
        >
          {t('feedback_suggestion_tab')}
        </Button>
      </div>

      {isReportMode ? (
        <form onSubmit={handleReportSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">{t('feedback_type_label')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Power Outage">{t('issue_type_outage')}</SelectItem>
                  <SelectItem value="Voltage Fluctuation">{t('issue_type_voltage')}</SelectItem>
                  <SelectItem value="Broken Wires">{t('issue_type_wires')}</SelectItem>
                  <SelectItem value="Other">{t('issue_type_other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">{t('form_priority')}</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{t('priority_low')}</SelectItem>
                  <SelectItem value="Medium">{t('priority_medium')}</SelectItem>
                  <SelectItem value="High">{t('priority_high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">{t('form_location')}</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleGeotag}
              disabled={isFetchingLocation}
              className="w-full justify-start"
            >
              {isFetchingLocation ? t('location_fetching') : location || t('form_geotag_btn')}
            </Button>
          </div>
          <Textarea
            placeholder={t('feedback_desc_placeholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
          <Input type="file" accept="image/*" />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            {t('feedback_submit_report')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSuggestionSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <Textarea
            placeholder={t('suggestion_placeholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            {t('feedback_submit_suggestion')}
          </Button>
        </form>
      )}
    </div>
  );
};

export default FeedbackView;
