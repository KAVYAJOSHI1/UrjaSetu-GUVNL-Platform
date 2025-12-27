import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

const LoginScreen = ({ onSwitchToRegister }: LoginScreenProps) => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('citizen@urjasatu.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">{t('login_title')}</h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label className="text-sm font-medium text-gray-700">{t('email_label')}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">{t('password_label')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full bg-[#007BFF] hover:bg-[#0056b3]">
            {t('login_btn')}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            {t('forgot_password')}
          </a>
          <p className="mt-2 text-sm text-gray-600">
            {t('no_account')}{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-medium text-blue-600 hover:underline"
            >
              {t('register_link')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
