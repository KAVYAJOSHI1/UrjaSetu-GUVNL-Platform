import React, { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
}

const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm h-[800px] max-h-[90vh] bg-[#F0F2F5] rounded-3xl shadow-2xl overflow-hidden ring-4 ring-gray-900 flex flex-col relative">
        {children}
      </div>
    </div>
  );
};

export default PhoneMockup;
