import React, { useState } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

const GuidanceView = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { question: t('guidance_q1'), answer: t('guidance_a1') },
    { question: t('guidance_q2'), answer: t('guidance_a2') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-[#0056b3]">{t('guidance_title')}</h2>
      
      <Card className="border-red-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold text-red-600">{t('guidance_emergency')}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">{t('guidance_tap_to_call')}</p>
          <div className="mt-4 space-y-3">
            <a
              href="tel:1912"
              className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="font-semibold text-red-800">{t('guidance_helpline')}</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-600">1912</span>
                <Phone className="w-5 h-5 text-red-600" />
              </div>
            </a>
            <a
              href="tel:1077"
              className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="font-semibold text-red-800">{t('guidance_state_emergency')}</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-600">1077</span>
                <Phone className="w-5 h-5 text-red-600" />
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-800">{t('guidance_faq')}</h3>
          <div className="mt-4 space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full text-left font-semibold text-gray-700 p-2"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="mt-2 text-sm pl-2 border-l-2 border-blue-500 pb-3">
                    <p className="pl-2 text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuidanceView;
