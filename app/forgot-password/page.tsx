'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { Mail, KeyRound, Lock, ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2, RotateCw } from 'lucide-react';
import { showError } from '../../lib/sweetalert';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

export default function ForgotPasswordPage() {
  const { requestForgotPassword, resetPasswordWithOtp } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1); // 1 = ขอ OTP, 2 = กรอก OTP + ตั้งรหัสใหม่
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    document.title = 'ลืมรหัสผ่าน | JADS Court';
  }, []);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showError('กรุณาระบุอีเมล', 'โปรดป้อนอีเมลที่ลงทะเบียนไว้ในระบบ');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await requestForgotPassword(email);
      if (ok) {
        setStep(2);
        setCountdown(60);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const ok = await requestForgotPassword(email);
      if (ok) {
        setCountdown(60);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      showError('รหัส OTP ไม่ถูกต้อง', 'รหัส OTP ต้องมีตัวเลขครบ 6 หลัก');
      return;
    }
    if (newPassword.length < 8) {
      showError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('รหัสผ่านไม่ตรงกัน', 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-slate-950">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl border border-purple-500/20 backdrop-blur-xl">
        <div className="flex justify-between items-start mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-400 hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าเข้าสู่ระบบ</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            <span>ระบบกู้คืนรหัสผ่านด้วย OTP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === 1 ? 'ระบุอีเมลสำหรับรับรหัส OTP' : 'ยืนยันรหัส OTP และตั้งรหัสผ่านใหม่'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {step === 1
              ? 'ระบบจะส่งรหัสผ่านใช้ครั้งเดียว (OTP 6 หลัก) ผ่านระบบ Resend ไปยังอีเมลของท่าน'
              : `โปรดกรอกรหัส OTP ที่ได้รับทางอีเมล ${email} และกำหนดรหัสผ่านใหม่`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ที่อยู่อีเมลที่ลงทะเบียนไว้ <span className="text-purple-600 font-bold">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@court.go.th หรืออีเมลส่วนตัว"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <span>กำลังส่งรหัส OTP...</span>
              ) : (
                <>
                  <span>ส่งรหัส OTP ไปที่อีเมล</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  รหัสยืนยัน OTP 6 หลัก <span className="text-purple-600 font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isSubmitting}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{countdown > 0 ? `ขอรหัสใหม่ได้ใน ${countdown} วิ` : 'ส่งรหัสอีกครั้ง'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-purple-50/50 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] font-bold text-purple-950 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1 text-center">รหัสมีอายุ 5 นาที และใช้ได้ครั้งเดียว</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                รหัสผ่านใหม่ <span className="text-purple-600 font-bold">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ยืนยันรหัสผ่านใหม่อีกครั้ง <span className="text-purple-600 font-bold">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <span>กำลังบันทึกรหัสผ่านใหม่...</span>
              ) : (
                <>
                  <span>ยืนยันและเปลี่ยนรหัสผ่าน</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
