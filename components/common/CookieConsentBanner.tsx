'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check, Settings2, X } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'jads_cookie_consent';

export interface CookiePreferences {
  status: 'accepted' | 'necessary';
  necessary: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  useEffect(() => {
    // Check if user has already made a decision
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        // Small delay so it animates in smoothly after page load
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {}

    // Listen to custom reset event (e.g. triggered from Settings page)
    const handleReset = () => {
      setIsVisible(true);
      setShowPreferences(false);
    };

    window.addEventListener('jads-reset-cookie-consent', handleReset);
    return () => window.removeEventListener('jads-reset-cookie-consent', handleReset);
  }, []);

  const saveConsent = (status: 'accepted' | 'necessary', enableAnalytics: boolean) => {
    try {
      const pref: CookiePreferences = {
        status,
        necessary: true,
        analytics: enableAnalytics,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(pref));
    } catch {}

    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="การแจ้งเตือนคุกกี้และความเป็นส่วนตัว"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 border border-purple-200/80 dark:border-slate-800 shadow-2xl shadow-purple-950/20 text-slate-800 dark:text-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                การใช้งานคุกกี้ (Cookies Notice)
              </h3>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                มาตรฐานตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => saveConsent('necessary', false)}
            aria-label="ปิดการแจ้งเตือนและเลือกเฉพาะที่จำเป็น"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!showPreferences ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ระบบ JADS ใช้คุกกี้ที่จำเป็นต่อการรักษาสถานะเข้าสู่ระบบและจดจำธีมการแสดงผลเพื่อความสะดวกในการปฏิบัติงานของท่าน
              ท่านสามารถเลือกยอมรับทั้งหมดหรือปรับแต่งตัวเลือกได้ตามต้องการ{' '}
              <Link
                href="/privacy"
                target="_blank"
                className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
              >
                อ่านนโยบายคุกกี้
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => saveConsent('accepted', true)}
                className="w-full sm:flex-1 py-2 px-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ยอมรับทั้งหมด</span>
              </button>

              <button
                type="button"
                onClick={() => saveConsent('necessary', false)}
                className="w-full sm:w-auto py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                เฉพาะที่จำเป็น
              </button>

              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-xs text-slate-500 hover:text-purple-700 dark:hover:text-purple-300 p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                title="ตั้งค่าคุกกี้อย่างละเอียด"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="sm:hidden">ตั้งค่า</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2 text-xs">
              {/* Necessary Cookies */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>คุกกี้ที่จำเป็นอย่างยิ่ง</span>
                    <span className="text-[10px] text-purple-600 font-semibold bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">จำเป็น</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    รักษาสถานะเข้าสู่ระบบ เซสชันความปลอดภัย และธีม (ปิดไม่ได้)
                  </p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  checked
                  className="rounded text-purple-700 w-4 h-4 cursor-not-allowed opacity-80"
                />
              </div>

              {/* Analytics / Performance */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    คุกกี้เพื่อการปรับปรุงระบบ (Analytics)
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    ช่วยบันทึกสถิติเพื่อพัฒนาความเร็วและเสถียรภาพของระบบศาล
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="rounded text-purple-700 w-4 h-4 cursor-pointer accent-purple-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => saveConsent(analyticsConsent ? 'accepted' : 'necessary', analyticsConsent)}
                className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="py-2 px-3 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
