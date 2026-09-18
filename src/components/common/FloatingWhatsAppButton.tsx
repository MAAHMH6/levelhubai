import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useContactInfo } from '@/hooks/useContactInfo';

export const FloatingWhatsAppButton: React.FC = () => {
  const contactInfo = useContactInfo();

  const handleOpenWhatsApp = () => {
    const message = "Hello LevelHubAI Support, I would like to inquire about Cambridge courses, Pro membership, and platform features.";
    window.open(`https://wa.me/${contactInfo.whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 group select-none">
      <button
        onClick={handleOpenWhatsApp}
        aria-label="Chat on WhatsApp"
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100"></span>
          </span>
        </div>
        <span className="hidden sm:inline font-extrabold tracking-wide">WhatsApp Support</span>
      </button>
    </div>
  );
};
