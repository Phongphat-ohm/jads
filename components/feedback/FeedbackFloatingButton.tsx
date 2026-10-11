'use client';

import React, { useState } from 'react';
import { MessageSquareHeart } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="ส่งความคิดเห็นหรือแจ้งปัญหา"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-full shadow-lg shadow-purple-900/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-purple-500/30 group cursor-pointer"
      >
        <MessageSquareHeart className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold tracking-wide pr-0.5">ข้อเสนอแนะ</span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
