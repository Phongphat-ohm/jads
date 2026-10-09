'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { PlusCircle, ShieldCheck, User } from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-purple-100 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-slate-800">
          ระบบบริหารจัดการเอกสารคดีความ
        </h2>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
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
