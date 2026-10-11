'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import {
  ShieldAlert,
  Users,
  MessageSquare,
  Activity,
  ArrowLeft,
  Scale,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    if (refreshUser && !hasRefreshed) {
      setHasRefreshed(true);
      refreshUser();
    }
  }, [refreshUser, hasRefreshed]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?callbackUrl=/admin');
      } else if (user.role !== 'ADMIN') {
        router.push('/overview?unauthorized=admin_required');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-rose-300">
            กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin Guard)...
          </p>
        </div>
      </div>
    );
  }

  const adminNav = [
    {
      name: 'ภาพรวมระบบ (Overview)',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'จัดการผู้ใช้งาน (Users)',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'ความคิดเห็น & แจ้งปัญหา (Feedbacks)',
      href: '/admin/feedbacks',
      icon: MessageSquare,
    },
    {
      name: 'บันทึกระบบส่วนกลาง (Audit Logs)',
      href: '/admin/audit-logs',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white">JADS ADMIN</h1>
            <p className="text-[10px] text-rose-400 font-mono">ศูนย์ควบคุมระบบศาล</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                  <span>JADS</span>
                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-mono">
                    ADMIN
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">ศูนย์จัดการส่วนกลาง</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              เมนูผู้ดูแลระบบ
            </div>
            {adminNav.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800">
              <Link
                href="/overview"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 border border-purple-900/30 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับหน้าหลักผู้ใช้ (App)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Admin Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-900/60 border border-rose-700/50 flex items-center justify-center text-rose-300 text-xs font-bold">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.fullName || user.username}</p>
              <p className="text-[10px] text-rose-400 font-mono">ADMINISTRATOR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto max-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
