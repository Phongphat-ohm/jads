'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import {
  Scale,
  LayoutDashboard,
  FileSpreadsheet,
  Clock,
  ShieldAlert,
  Settings,
  LogOut,
  Users,
  FileText,
  FileCheck,
  User as UserIcon,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    name: 'แผงควบคุม (Overview)',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    name: 'สร้างเอกสาร',
    href: '/generator',
    icon: FileText,
    badge: 'หลัก',
  },
  {
    name: 'จัดการคู่ผู้พิพากษา',
    href: '/judges',
    icon: Users,
    badge: 'ใหม่',
  },
  {
    name: 'เทมเพลตย่อหน้าส่วนตัว',
    href: '/paragraph-templates',
    icon: FileText,
    badge: 'ใหม่',
  },
  {
    name: 'ประวัติไฟล์/ดาวน์โหลด',
    href: '/recent-files',
    icon: Clock,
  },
  {
    name: 'บันทึกการใช้งาน',
    href: '/audit-logs',
    icon: ShieldAlert,
  },
  {
    name: 'ตั้งค่าและรหัสผ่าน',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-screen overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-wide">JADS COURT</h1>
                <p className="text-[11px] text-purple-400 font-medium tracking-wider">ระบบเอกสารคดีศาล</p>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดเมนู"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Navigation Links */}
        <div className="px-3 py-6 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            เมนูหลัก
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300 text-xs font-bold">
              {user?.username?.substring(0, 2).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-purple-400 font-mono truncate">{user?.role || 'USER'}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
    </>
  );
}
