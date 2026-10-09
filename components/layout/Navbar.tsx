'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { PlusCircle, ShieldCheck, User, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-purple-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="เปิดเมนูนำทาง"
          className="p-2 -ml-1 text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm md:text-base font-bold text-slate-800 truncate">
          ระบบบริหารจัดการเอกสารคดีความ
        </h2>
        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full shrink-0">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          ระบบปลอดภัยเข้ารหัส AES-256
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/generator"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-sm shadow-purple-600/30 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>สร้างเอกสารใหม่</span>
        </Link>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
            {user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {user?.fullName || user?.username || 'เข้าสู่ระบบแล้ว'}
            </p>
            <p className="text-[10px] text-purple-600 font-medium">
              สิทธิ์ {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
