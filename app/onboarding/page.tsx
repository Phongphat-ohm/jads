'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { Landmark, User, Lock, ArrowRight, ShieldCheck, CheckCircle2, Trash2 } from 'lucide-react';
import { showError, showConfirm } from '../../lib/sweetalert';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

export default function OnboardingPage() {
  const { user, isLoading, completeProfile, cancelOnboarding } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [courtName, setCourtName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    document.title = 'กรอกข้อมูลเริ่มต้นเพื่อเปิดใช้งาน | JADS Court';
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.isProfileComplete !== false) {
        router.push('/overview');
      } else {
        if (user.fullName) setFullName(user.fullName);
        if (user.courtName) setCourtName(user.courtName);
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courtName.trim()) {
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อศาลหรือสังกัดที่ท่านปฏิบัติงาน');
      return;
    }
    if (!fullName.trim()) {
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อ-นามสกุลจริง');
      return;
    }
    if (password.length < 8) {
      showError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      showError('รหัสผ่านไม่ตรงกัน', 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile(fullName, courtName, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const result = await showConfirm(
      'ยืนยันการยกเลิกการลงทะเบียน?',
      'ระบบจะลบข้อมูลบัญชีของท่านออกจากฐานข้อมูล และยกเลิกการเชื่อมต่อบัญชี ท่านสามารถกลับมาเข้าสู่ระบบเพื่อลงทะเบียนใหม่ได้ในภายหลัง',
      'ใช่, ยกเลิกและลบข้อมูล'
    );

    if (result.isConfirmed) {
      setIsCancelling(true);
      try {
        await cancelOnboarding();
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white text-sm">
        กำลังโหลดข้อมูลบัญชี...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-slate-950">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl border border-purple-500/20 backdrop-blur-xl">
        <div className="flex justify-between items-start mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>ตั้งค่าข้อมูลผู้ใช้งานครั้งแรก (Onboarding)</span>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ยินดีต้อนรับสู่ JADS Court
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          ท่านได้เชื่อมต่อผ่านผู้ให้บริการภายนอกสำเร็จ กรุณากรอกข้อมูลส่วนตัว รหัสผ่านสำหรับระบบ และสังกัดศาล เพื่อเปิดใช้งานระบบสร้างเอกสารคดีความ
        </p>

        {user.email && (
          <div className="mt-4 p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/50 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">อีเมลที่เชื่อมต่อ:</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 font-mono">
              <span>{user.email}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ชื่อศาลที่ปฏิบัติงาน / สังกัด <span className="text-purple-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Landmark className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="เช่น ศาลแขวงดอนเมือง, ศาลจังหวัดนนทบุรี"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * ข้อมูลนี้จะถูกนำไปใช้เป็นชื่อศาลเริ่มต้นในส่วนหัวและท้ายเอกสารคดี
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ชื่อ - นามสกุล <span className="text-purple-600 font-bold">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น นาย สมชาย รักชาติ"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              กำหนดรหัสผ่านสำหรับระบบ (Password) <span className="text-purple-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * เพื่อให้ท่านสามารถใช้ล็อกอินด้วย Username / Password แบบปกติได้เช่นกัน
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ยืนยันรหัสผ่านอีกครั้ง <span className="text-purple-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isCancelling}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer"
          >
            {isSubmitting ? (
              <span>กำลังบันทึกข้อมูล...</span>
            ) : (
              <>
                <span>บันทึกและเริ่มใช้งานระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              disabled={isSubmitting || isCancelling}
              onClick={handleCancel}
              className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium py-2 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCancelling ? (
                <span>กำลังยกเลิกและลบข้อมูล...</span>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ยกเลิกการลงทะเบียนและออกจากระบบ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
