'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { signIn, useSession } from 'next-auth/react';
import { Scale, Lock, User, FileText, CheckCircle2, ArrowRight, Sparkles, Landmark, Mail } from 'lucide-react';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { showError } from '../../lib/sweetalert';

export default function LoginPage() {
  const { user, isLoading, login, register, syncOAuth } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [courtName, setCourtName] = useState('');

  // Auto redirect if already logged in locally
  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.isProfileComplete === false) {
        router.push('/onboarding');
      } else {
        router.push('/overview');
      }
    }
  }, [user, isLoading, router]);

  // Synchronize NextAuth session with JADS local backend
  React.useEffect(() => {
    if (status === 'authenticated' && session?.user && !user) {
      const provider = (session as any).provider || 'google';
      const providerAccountId = (session as any).providerAccountId || session.user.email || 'oauth_user';

      syncOAuth({
        provider,
        providerAccountId,
        email: session.user.email || undefined,
        fullName: session.user.name || undefined,
        avatarUrl: session.user.image || undefined,
        accessToken: (session as any).accessToken,
      });
    }
  }, [session, status, user]);

  React.useEffect(() => {
    document.title = isLoginTab ? 'เข้าสู่ระบบ | JADS Court' : 'สมัครสมาชิกใหม่ | JADS Court';
  }, [isLoginTab]);

  // Check URL error params from NextAuth (e.g. /login?error=OAuthSignin)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get('error');
      if (authError) {
        if (authError === 'Configuration' || authError === 'OAuthSignin') {
          showError(
            'Google OAuth ยังไม่ได้ตั้งค่า',
            'กรุณาระบุ GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ในไฟล์ client/.env หรือ client/.env.local'
          );
        } else {
          showError('เข้าสู่ระบบไม่สำเร็จ', `ข้อผิดพลาด: ${authError}`);
        }
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLoginTab) {
        await login(username, password);
      } else {
        await register(username, password, email, fullName, courtName);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/auth/check-google');
      if (res.ok) {
        const data = await res.json();
        if (!data.configured) {
          showError(
            'ยังไม่ได้ตั้งค่า Google OAuth',
            'ระบบยังไม่มี GOOGLE_CLIENT_ID หรือ GOOGLE_CLIENT_SECRET กรุณานำ Client ID และ Client Secret จาก Google Cloud Console มาใส่ในไฟล์ client/.env ก่อนใช้งาน'
          );
          return;
        }
      }
      signIn('google', { callbackUrl: '/login' });
    } catch {
      signIn('google', { callbackUrl: '/login' });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Full Viewport Background Image */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none select-none overflow-hidden">
        <img
          src="/images/courtroom-bg.webp"
          alt="Courtroom Background"
          className="w-full h-full object-cover object-center min-w-full min-h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/90 via-slate-950/80 to-purple-900/85 backdrop-blur-[2px]" />
      </div>

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 bg-slate-950/40 backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Court Identity & Features */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between relative bg-gradient-to-br from-purple-900/40 via-purple-950/30 to-transparent">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-200 mb-6">
              <Scale className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold tracking-wide">JADS COURT AUTOMATION</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              ระบบสร้างเอกสารคดีความ
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-200">
                แห่งความยุติธรรม
              </span>
            </h1>
            <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed max-w-md">
              เปลี่ยนข้อมูลตารางนัดพิจารณาคดีจากไฟล์ Excel ให้กลายเป็นเอกสารคำร้องและรายงานทางการศาล (.docx) สมบูรณ์แบบในคลิกเดียว
            </p>
          </div>

          {/* Legal Worker Illustration */}
          <div className="my-6 flex justify-center items-center relative">
            <div className="w-full max-w-[350px] aspect-[4/3] relative drop-shadow-[0_20px_35px_rgba(109,40,217,0.35)] transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/images/legal-worker.webp"
                alt="เจ้าหน้าที่กำลังทำงานเอกสารคดี"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-purple-500/20 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>ระบบอัตโนมัติ</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400 shrink-0" />
              <span>รองรับ .xlsx / .csv</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>ดาวน์โหลด .docx</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign-in / Sign-up Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 md:p-10 flex flex-col justify-center relative transition-colors">
          <div className="absolute top-4 right-4 z-20">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-sm mx-auto">
            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-purple-50 dark:bg-slate-800 p-1 mb-6 border border-purple-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsLoginTab(true)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  isLoginTab
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                    : 'text-purple-900/60 dark:text-purple-300/70 hover:text-purple-900 dark:hover:text-purple-200'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => setIsLoginTab(false)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  !isLoginTab
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                    : 'text-purple-900/60 dark:text-purple-300/70 hover:text-purple-900 dark:hover:text-purple-200'
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {/* OAuth Provider Buttons (Visible on Login Tab) */}
            {isLoginTab && (
              <div className="space-y-2.5 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-medium">หรือเข้าสู่ระบบด้วยชื่อผู้ใช้</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>
              </div>
            )}

            {/* Header Text */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoginTab ? 'ลงชื่อเข้าใช้งาน' : 'สร้างบัญชีผู้ใช้งานใหม่'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isLoginTab
                  ? 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าถึงระบบ'
                  : 'ลงทะเบียนเพื่อเริ่มต้นใช้งานระบบสร้างเอกสารคดี (เข้าใช้งานได้ทันที)'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLoginTab && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อศาลที่ปฏิบัติงาน / สังกัด <span className="text-purple-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Landmark className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required={!isLoginTab}
                        value={courtName}
                        onChange={(e) => setCourtName(e.target.value)}
                        placeholder="เช่น ศาลแขวงดอนเมือง, ศาลจังหวัดนนทบุรี"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อ - นามสกุล
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required={!isLoginTab}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="เช่น นาย สมชาย รักชาติ"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ที่อยู่อีเมล (Email)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="เช่น somchai@court.go.th"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      * สามารถใช้สำหรับกู้คืนรหัสผ่านได้ทันที
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ความยาวอย่างน้อย 3 ตัวอักษร"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    รหัสผ่าน (Password)
                  </label>
                  {isLoginTab && (
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-purple-700 dark:text-purple-400 hover:underline font-medium"
                    >
                      ลืมรหัสผ่าน?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLoginTab ? 'กรอกรหัสผ่าน' : 'ความยาวอย่างน้อย 8 ตัวอักษร'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
                {!isLoginTab && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    * รหัสผ่านต้องมีความยาวตั้งแต่ 8 ตัวอักษรขึ้นไป
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <span>กำลังดำเนินการ...</span>
                ) : (
                  <>
                    <span>{isLoginTab ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกทันที'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
              ระบบบริหารจัดการเอกสารคดีความศาลยุติธรรม
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
