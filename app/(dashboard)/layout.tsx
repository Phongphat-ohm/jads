'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Navbar } from '../../components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Navbar onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto w-full text-slate-800 dark:text-slate-100 relative flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm text-purple-200">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold tracking-wide">กำลังเตรียมข้อมูลระบบ JADS...</p>
              </div>
            </div>
          )}
          <div className="max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 flex-1">
            <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลด...</div>}>
              {children}
            </React.Suspense>
          </div>

          {/* Global Dashboard Footer */}
          <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-4 px-4 sm:px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">JADS Court</span>
                <span>•</span>
                <span>ระบบบริหารจัดการและสร้างเอกสารคดีศาล</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span>สร้างโดย</span>
                <span className="text-purple-700 dark:text-purple-400 font-bold hover:underline">พงษ์ภัทร เภสัชชะ</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
