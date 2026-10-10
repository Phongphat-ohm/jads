'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { PlusCircle, ShieldCheck, User, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-purple-100 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="เปิดเมนูนำทาง"
          className="p-2 -ml-1 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
          ระบบบริหารจัดการเอกสารคดีความ
        </h2>
        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 px-2.5 py-0.5 rounded-full shrink-0">
          <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          ระบบปลอดภัยเข้ารหัส AES-256
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <ThemeToggle />

        <Link
          href="/generator"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-sm shadow-purple-600/30 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">สร้างเอกสารใหม่</span>
        </Link>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-200 dark:border-purple-700">
            {user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.fullName || user?.username || 'เข้าสู่ระบบแล้ว'}
            </p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
              สิทธิ์ {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
