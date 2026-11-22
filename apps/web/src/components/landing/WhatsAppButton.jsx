import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '919876543210'; // Placeholder
  const message = 'Hi, I need to enquire about pump service.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.4 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 sm:px-5 sm:py-3.5 shadow-[0_10px_35px_rgba(16,185,129,0.45)] border border-emerald-300/40 transition-colors"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
        <MessageCircle size={24} className="relative z-10" />
      </span>
      <span className="hidden sm:inline text-sm font-bold tracking-wide">
        WhatsApp Us
      </span>
    </motion.a>
  );
};

export default WhatsAppButton;
