import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

const RegisterScreen = ({ onSwitchToLogin }: RegisterScreenProps) => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, phone, password);
    toast.success(t('toast_register_success'));
    onSwitchToLogin();
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">{t('register_title')}</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="text"
            placeholder={t('full_name_placeholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="tel"
            placeholder={t('phone_placeholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder={t('email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-[#007BFF] hover:bg-[#0056b3]">
            {t('register_btn')}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('has_account')}{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-blue-600 hover:underline"
            >
              {t('login_link')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
