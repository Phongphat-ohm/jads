'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Scale,
  Lock,
  User,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Landmark,
  Mail,
  ExternalLink,
  Laptop,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { showError, showToast } from '../../lib/sweetalert';
import { fetchApi } from '../../lib/api';

export default function LoginPage() {
  const { user, isLoading, login, register, syncOAuth, setDirectAuth, logout } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [courtName, setCourtName] = useState('');

  // Inline Field Validation Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Desktop Mode & Session Pairing states
  const [isTauriDesktop, setIsTauriDesktop] = useState(false);
  const [desktopSessionId, setDesktopSessionId] = useState<string | null>(null);
  const [desktopBrowserUrl, setDesktopBrowserUrl] = useState<string>('');
  const [isPollingDesktop, setIsPollingDesktop] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDirectFormOnDesktop, setShowDirectFormOnDesktop] = useState(false);

  // Browser Pair Session (When opened in external browser from Desktop)
  const [browserPairSessionId, setBrowserPairSessionId] = useState<string | null>(null);
  const [isApprovingDesktop, setIsApprovingDesktop] = useState(false);
  const [desktopApprovedSuccess, setDesktopApprovedSuccess] = useState(false);
  const [showAccountConfirm, setShowAccountConfirm] = useState(false);

  // Helper to get active desktop session pairing ID reliably
  const getEffectivePairSessionId = () => {
    if (browserPairSessionId) return browserPairSessionId;
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('desktop_session');
      if (p) return p;
      try {
        return sessionStorage.getItem('jads_desktop_pair_session');
      } catch {}
    }
    return null;
  };

  // Detect environment & URL query params
  useEffect(() => {
    setIsMounted(true);
    const params = new URLSearchParams(window.location.search);
    const isFromTauriParam = params.get('from_tauri') === '1';
    const isTauri =
      isFromTauriParam ||
      Boolean((window as any).__IS_TAURI__) ||
      Boolean((window as any).__TAURI_INTERNALS__) ||
      navigator.userAgent.includes('Tauri');

    setIsTauriDesktop(isTauri);

    const pairSession = params.get('desktop_session');
    if (pairSession) {
      setBrowserPairSessionId(pairSession);
      try {
        sessionStorage.setItem('jads_desktop_pair_session', pairSession);
      } catch {}
    } else {
      try {
        const savedSession = sessionStorage.getItem('jads_desktop_pair_session');
        if (savedSession) {
          setBrowserPairSessionId(savedSession);
        }
      } catch {}
    }
  }, []);

  // Check if already logged in locally
  useEffect(() => {
    if (!isLoading && user) {
      // Don't auto-approve immediately; show account confirmation prompt first
      setShowAccountConfirm(true);
    } else if (!isLoading && !user) {
      setShowAccountConfirm(false);
    }
  }, [user, isLoading]);

  // Synchronize NextAuth session with JADS local backend
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('logged_out') === '1') {
        return;
      }
    }

    if (status === 'authenticated' && session?.user && !user) {
      const provider = (session as any).provider || 'google';
      const providerAccountId = (session as any).providerAccountId || session.user.email || 'oauth_user';
      const effectivePairId = getEffectivePairSessionId();

      syncOAuth(
        {
          provider,
          providerAccountId,
          email: session.user.email || undefined,
          fullName: session.user.name || undefined,
          avatarUrl: session.user.image || undefined,
          accessToken: (session as any).accessToken,
        },
        { skipRedirect: true }
      ).then((res) => {
        if (res.success) {
          // Once synced, the `user` state will update, which triggers showAccountConfirm prompt!
        }
      });
    }
  }, [session, status, user, browserPairSessionId]);

  useEffect(() => {
    document.title = isLoginTab ? 'เข้าสู่ระบบ | JADS Court' : 'สมัครสมาชิกใหม่ | JADS Court';
  }, [isLoginTab]);

  // Check URL params from NextAuth (error or intentional logout)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      if (params.get('logged_out') === '1') {
        signOut({ redirect: false });
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

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

  // -------------------------------------------------------------
  // TAURI DESKTOP: Init and Poll Desktop Login Session
  // -------------------------------------------------------------
  const initDesktopSession = async () => {
    try {
      setIsPollingDesktop(true);
      const res = await fetchApi('/auth/desktop-session/create', { method: 'POST' });
      if (!res.ok) throw new Error('ไม่สามารถสร้างเซสชันการเชื่อมต่อได้');
      const data = await res.json();
      const sId = data.data.sessionId;
      setDesktopSessionId(sId);

      // Determine browser url (ensure valid HTTP origin)
      let currentOrigin = window.location.origin;
      if (!currentOrigin || currentOrigin.startsWith('tauri:') || currentOrigin.startsWith('file:') || (currentOrigin.includes('localhost') && !currentOrigin.includes(':3001'))) {
        currentOrigin = 'http://localhost:3001';
      }
      const targetUrl = `${currentOrigin}/login?desktop_session=${encodeURIComponent(sId)}`;
      setDesktopBrowserUrl(targetUrl);

      // Open in default external system browser
      openUrlInDefaultBrowser(targetUrl);
    } catch (err: any) {
      setIsPollingDesktop(false);
      showError('เกิดข้อผิดพลาดในการเชื่อมต่อ', err.message);
    }
  };

  const openUrlInDefaultBrowser = async (urlToOpen: string) => {
    let opened = false;

    // 1. Try Tauri IPC first if running inside desktop app (Direct Native Windows Launch via cmd 'start' & Opener Plugin)
    try {
      const tauri = (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__;
      if (tauri && typeof tauri.invoke === 'function') {
        await tauri.invoke('open_in_browser', { url: urlToOpen });
        opened = true;
      }
    } catch (e) {
      console.warn('Tauri invoke open_in_browser failed, trying next methods:', e);
    }

    // 2. If not opened, try local backend server if reachable (useful in local dev / hybrid setup)
    if (!opened) {
      try {
        const res = await fetch('http://localhost:3000/api/open-browser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToOpen }),
        });
        if (res.ok) {
          opened = true;
        }
      } catch {}
    }

    // 3. Fallback to hidden anchor tag / window.open
    if (!opened) {
      try {
        const a = document.createElement('a');
        a.href = urlToOpen;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        opened = true;
      } catch {
        try {
          window.open(urlToOpen, '_blank');
          opened = true;
        } catch {}
      }
    }

    if (opened) {
      showToast('เปิดเบราว์เซอร์ของเครื่องเรียบร้อยแล้ว');
    } else {
      showError('ไม่สามารถเปิดเบราว์เซอร์ได้อัตโนมัติ', 'กรุณากดปุ่ม "คัดลอกลิงก์" เพื่อนำไปเปิดในเบราว์เซอร์ด้วยตนเอง');
    }
  };

  // Auto-init session if running in Tauri desktop
  useEffect(() => {
    if (isTauriDesktop && !desktopSessionId && !isLoading) {
      const p = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      if (p?.get('logged_out') === '1') {
        return;
      }
      initDesktopSession();
    }
  }, [isTauriDesktop, desktopSessionId, isLoading]);

  // Polling check for desktop session status
  useEffect(() => {
    if (!isTauriDesktop || !desktopSessionId) return;

    let isPollingActive = true;

    const interval = setInterval(async () => {
      if (!isPollingActive) return;

      try {
        const res = await fetchApi(`/auth/desktop-session/check/${desktopSessionId}`);
        if (res.ok) {
          const body = await res.json();
          if (body.data?.status === 'AUTHORIZED') {
            isPollingActive = false;
            clearInterval(interval);
            setIsPollingDesktop(false);

            // Logged in successfully via external browser!
            const { token: receivedToken, user: receivedUser } = body.data;
            if (receivedToken) {
              localStorage.setItem('jads_token', receivedToken);
            }
            if (receivedUser) {
              // Bring Tauri Desktop window to front if running in Tauri
              try {
                const tauri = (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__;
                if (tauri && typeof tauri.invoke === 'function') {
                  tauri.invoke('focus_window').catch(() => {
                    tauri.invoke('tauri', { __tauriModule: 'Window', message: { cmd: 'setFocus' } }).catch(() => {});
                  });
                }
              } catch {}

              setDirectAuth(receivedToken, receivedUser);
              showToast(`เข้าสู่ระบบสำเร็จ: ${receivedUser.fullName || receivedUser.username}`);

              const target = receivedUser.isProfileComplete === false ? '/onboarding' : '/overview';
              window.location.replace(target);
            }
          } else if (body.data?.status === 'EXPIRED') {
            isPollingActive = false;
            clearInterval(interval);
            setIsPollingDesktop(false);
            showError('หมดเวลาการรอเข้าสู่ระบบ', 'เซสชันหมดอายุแล้ว กรุณากดปุ่มเพื่อลองใหม่อีกครั้ง');
          }
        }
      } catch (err) {
        // network issue, retry next tick
      }
    }, 1500);

    return () => {
      isPollingActive = false;
      clearInterval(interval);
    };
  }, [isTauriDesktop, desktopSessionId]);

  // -------------------------------------------------------------
  // WEB BROWSER: Approve Desktop Session when Logged In
  // -------------------------------------------------------------
  const approveDesktopSession = async (sId: string, currentUser?: any, currentToken?: string | null) => {
    const tokenToUse = currentToken || localStorage.getItem('jads_token');
    const userToUse = currentUser || user;
    if (!tokenToUse || !userToUse) return;

    try {
      setIsApprovingDesktop(true);
      const res = await fetchApi('/auth/desktop-session/authorize', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: sId,
          token: tokenToUse,
          user: userToUse,
        }),
      });

      if (res.ok) {
        setDesktopApprovedSuccess(true);
        try {
          sessionStorage.removeItem('jads_desktop_pair_session');
        } catch {}

        // Bring Desktop app window to the front immediately
        try {
          fetchApi('/focus-app', { method: 'POST' }).catch(() => {});
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to approve desktop session:', err);
    } finally {
      setIsApprovingDesktop(false);
    }
  };

  const handleConfirmCurrentUser = async () => {
    const effectivePairId = getEffectivePairSessionId();
    if (effectivePairId) {
      await approveDesktopSession(effectivePairId, user);
    } else {
      showToast(`เข้าสู่ระบบสำเร็จ: ${user?.fullName || user?.username}`);
      if (user?.isProfileComplete === false) {
        window.location.replace('/onboarding');
      } else {
        window.location.replace('/overview');
      }
    }
  };

  const handleSwitchAccount = async () => {
    setShowAccountConfirm(false);
    await logout();
    showToast('ออกจากบัญชีเดิมแล้ว กรุณาเข้าสู่ระบบด้วยบัญชีที่ต้องการ');
  };

  const handleCopyLink = () => {
    if (!desktopBrowserUrl) return;
    navigator.clipboard.writeText(desktopBrowserUrl);
    setIsCopied(true);
    showToast('คัดลอกลิงก์เรียบร้อยแล้ว');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Submit standard login / register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (isLoginTab) {
      if (!username.trim()) {
        errors.username = 'กรุณากรอกชื่อผู้ใช้หรือที่อยู่อีเมล';
      }
      if (!password) {
        errors.password = 'กรุณากรอกรหัสผ่าน';
      }
    } else {
      if (!courtName.trim()) {
        errors.courtName = 'กรุณาระบุชื่อศาลหรือสังกัดที่ปฏิบัติงาน';
      }
      if (!username.trim()) {
        errors.username = 'กรุณาระบุชื่อผู้ใช้งาน';
      } else if (username.trim().length < 3) {
        errors.username = 'ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
      } else if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
        errors.username = 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ, ตัวเลข, จุด, ขีดกลาง และขีดล่าง';
      }
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'รูปแบบที่อยู่อีเมลไม่ถูกต้อง';
      }
      if (!password) {
        errors.password = 'กรุณากำหนดรหัสผ่าน';
      } else if (password.length < 8) {
        errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const effectivePairId = getEffectivePairSessionId();

    try {
      if (isLoginTab) {
        const result = await login(username, password, { skipRedirect: Boolean(effectivePairId) });
        if (result.success && effectivePairId && result.user && result.token) {
          await approveDesktopSession(effectivePairId, result.user, result.token);
        }
      } else {
        const result = await register(username, password, email, fullName, courtName, { skipRedirect: Boolean(effectivePairId) });
        if (result.success && effectivePairId && result.user && result.token) {
          await approveDesktopSession(effectivePairId, result.user, result.token);
        }
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
      const effectivePairId = getEffectivePairSessionId();
      const cb = effectivePairId
        ? `/login?desktop_session=${encodeURIComponent(effectivePairId)}`
        : '/login';
      signIn('google', { callbackUrl: cb });
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
              เปลี่ยนข้อมูลตารางนัดพิจารณาคดีจากไฟล์ Excel ให้กลายเป็นเอกสารคำร้องและรายงานทางการศาล (.docx / .pdf) สมบูรณ์แบบในคลิกเดียว
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

        {/* Right Side: Sign-in / Desktop Wait / Sign-up Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 md:p-10 flex flex-col justify-center relative transition-colors">
          <div className="absolute top-4 right-4 z-20">
            <ThemeToggle />
          </div>

          {/* ============================================================== */}
          {/* CASE A: Web Browser Successfully Approved Desktop Session */}
          {/* ============================================================== */}
          {desktopApprovedSuccess ? (
            <div className="w-full max-w-sm mx-auto text-center space-y-5 py-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  เข้าสู่ระบบสำเร็จเรียบร้อยแล้ว
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {user?.fullName || user?.username ? `ยินดีต้อนรับ ${user.fullName || user.username}` : 'ยืนยันตัวตนสำเร็จ'}
                </p>
              </div>

              {/* ข้อความแจ้งเตือนเด่นชัด: คุณสามารถปิดหน้าต่างนี้ได้ */}
              <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-left space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>คุณสามารถปิดหน้าต่างนี้ได้</span>
                </div>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed">
                  ระบบได้ส่งข้อมูลการเข้าสู่ระบบไปยังโปรแกรม JADS บนเดสก์ท็อปของคุณเรียบร้อยแล้ว ท่านสามารถปิดแท็บหรือหน้าต่างเบราว์เซอร์นี้ได้ทันที
                </p>
              </div>

              {/* ปุ่ม: สลับกลับไปยังโปรแกรม JADS ทันที หรือ เข้าเว็บไซต์ */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetchApi('/focus-app', { method: 'POST' });
                      showToast('กำลังสลับหน้าต่างกลับไปยังโปรแกรม JADS...');
                    } catch {}
                  }}
                  className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 active:scale-[0.99] text-white font-semibold rounded-xl text-xs md:text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิด / สลับกลับไปยังโปรแกรม JADS</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (user?.isProfileComplete === false) {
                      router.push('/onboarding');
                    } else {
                      router.push('/overview');
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>ใช้งานต่อบนหน้าเว็บเบราว์เซอร์นี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          ) : isApprovingDesktop ? (
            <div className="w-full max-w-sm mx-auto text-center space-y-4 py-8">
              <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                กำลังยืนยันตัวตนเข้าสู่ Desktop...
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                กรุณารอสักครู่ กำลังส่งสิทธิ์การเข้าสู่ระบบไปยังโปรแกรม JADS บนเครื่อง
              </p>
            </div>
          ) : showAccountConfirm && user ? (
            /* ============================================================== */
            /* CASE A-2: User already logged in - Prompt Confirmation */
            /* ============================================================== */
            <div className="w-full max-w-sm mx-auto text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/20">
                <User className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  ยืนยันการเข้าสู่ระบบ
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  คุณต้องการเข้าสู่ระบบด้วยบัญชีนี้หรือไม่?
                </p>
              </div>

              {/* User Account Info Card */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-slate-800/70 border border-purple-200 dark:border-slate-700 text-left space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                      {user.email || user.username}
                    </p>
                  </div>
                </div>
                {user.courtName && (
                  <div className="pt-2 border-t border-purple-100 dark:border-slate-700 text-[11px] text-purple-900 dark:text-purple-300 font-medium flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.courtName}</span>
                  </div>
                )}
              </div>

              {Boolean(getEffectivePairSessionId()) && (
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-slate-800/50 border border-purple-100 dark:border-slate-700/60 text-left text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <Laptop className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                  <span>เมื่อกดยืนยัน ระบบจะเข้าสู่โปรแกรม <strong>JADS Desktop</strong> ให้ทันที</span>
                </div>
              )}

              {/* Actions: ตกลง / เข้าสู่ระบบด้วยบัญชีอื่น */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmCurrentUser}
                  className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 active:scale-[0.99] text-white font-semibold rounded-xl text-xs md:text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ตกลง เข้าสู่ระบบด้วยบัญชีนี้</span>
                </button>

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>เข้าสู่ระบบด้วยบัญชีอื่น</span>
                </button>
              </div>
            </div>
          ) : isMounted && isTauriDesktop && !showDirectFormOnDesktop ? (
            /* ============================================================== */
            /* CASE B: TAURI DESKTOP - Waiting for External Browser Sign-in */
            /* ============================================================== */
            <div className="w-full max-w-sm mx-auto space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/20 relative">
                <Laptop className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-600"></span>
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  รอการเข้าสู่ระบบผ่านเบราว์เซอร์
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  ระบบได้เปิดหน้าต่างเบราว์เซอร์หลักของเครื่องเพื่อให้ท่านเข้าสู่ระบบอย่างปลอดภัย (รองรับ Google และบัญชีเดิมทันที)
                </p>
              </div>

              {/* Status Indicator */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-slate-800/60 border border-purple-200/60 dark:border-slate-700/60 flex items-center gap-3 text-left">
                <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">กำลังรอการยืนยันตัวตน...</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    เมื่อเข้าสู่ระบบในเบราว์เซอร์เสร็จ หน้านี้จะเข้าสู่โปรแกรมอัตโนมัติ
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => openUrlInDefaultBrowser(desktopBrowserUrl)}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดเบราว์เซอร์อีกครั้ง</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={initDesktopSession}
                    className="py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="เริ่มสร้างเซสชันใหม่"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>สร้างใหม่</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-purple-100 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setShowDirectFormOnDesktop(true)}
                    className="text-xs text-purple-700 dark:text-purple-400 hover:underline font-medium cursor-pointer"
                  >
                    หรือเข้าสู่ระบบด้วยชื่อผู้ใช้ / รหัสผ่านในโปรแกรมนี้โดยตรง
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* CASE C: Standard Web Browser Login Form / Direct Desktop Form */
            /* ============================================================== */
            <div className="w-full max-w-sm mx-auto">
              {/* Back button if in direct desktop view */}
              {isMounted && isTauriDesktop && showDirectFormOnDesktop && (
                <button
                  type="button"
                  onClick={() => setShowDirectFormOnDesktop(false)}
                  className="mb-4 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>← กลับไปยังหน้าต่างรอเบราว์เซอร์</span>
                </button>
              )}

              {/* Banner for Browser Pair Mode */}
              {isMounted && Boolean(getEffectivePairSessionId()) && (
                <div className="mb-5 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center gap-2.5 text-xs text-purple-900 dark:text-purple-200">
                  <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>
                    เมื่อท่านเข้าสู่ระบบสำเร็จ ข้อมูลจะถูกเชื่อมต่อเข้าสู่โปรแกรม <strong>JADS Desktop</strong> ทันที
                  </span>
                </div>
              )}

              {/* Tab Switcher */}
              <div className="flex rounded-xl bg-purple-50 dark:bg-slate-800 p-1 mb-6 border border-purple-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(true);
                    setFieldErrors({});
                  }}
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
                  onClick={() => {
                    setIsLoginTab(false);
                    setFieldErrors({});
                  }}
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
                    <span className="flex-shrink mx-3 text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                      หรือเข้าสู่ระบบด้วยชื่อผู้ใช้หรืออีเมล
                    </span>
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
                    ? 'กรุณากรอกชื่อผู้ใช้หรืออีเมลและรหัสผ่านเพื่อเข้าถึงระบบ'
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
                          onChange={(e) => {
                            setCourtName(e.target.value);
                            if (fieldErrors.courtName) setFieldErrors((prev) => ({ ...prev, courtName: '' }));
                          }}
                          placeholder="เช่น ศาลแขวงดอนเมือง, ศาลจังหวัดนนทบุรี"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all ${
                            fieldErrors.courtName
                              ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                              : 'border-slate-200 dark:border-slate-700 focus:ring-purple-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.courtName && (
                        <p className="text-[11px] text-rose-500 font-medium mt-1">
                          {fieldErrors.courtName}
                        </p>
                      )}
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
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          placeholder="เช่น somchai@court.go.th"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all ${
                            fieldErrors.email
                              ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                              : 'border-slate-200 dark:border-slate-700 focus:ring-purple-600'
                          }`}
                        />
                      </div>
                      {fieldErrors.email ? (
                        <p className="text-[11px] text-rose-500 font-medium mt-1">
                          {fieldErrors.email}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          * สามารถใช้สำหรับกู้คืนรหัสผ่านได้ทันที
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isLoginTab ? 'ชื่อผู้ใช้หรืออีเมล' : 'ชื่อผู้ใช้งาน (Username)'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
                      }}
                      placeholder={isLoginTab ? 'กรอกชื่อผู้ใช้หรือที่อยู่อีเมล' : 'ความยาวอย่างน้อย 3 ตัวอักษร'}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all ${
                        fieldErrors.username
                          ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-purple-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.username && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">
                      {fieldErrors.username}
                    </p>
                  )}
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      placeholder={isLoginTab ? 'กรอกรหัสผ่าน' : 'ความยาวอย่างน้อย 8 ตัวอักษร'}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all ${
                        fieldErrors.password
                          ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-purple-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.password ? (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">
                      {fieldErrors.password}
                    </p>
                  ) : !isLoginTab ? (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      * รหัสผ่านต้องมีความยาวตั้งแต่ 8 ตัวอักษรขึ้นไป
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isApprovingDesktop}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer"
                >
                  {isSubmitting || isApprovingDesktop ? (
                    <span>กำลังดำเนินการ...</span>
                  ) : (
                    <>
                      <span>{isLoginTab ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกทันที'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <div>ระบบบริหารจัดการเอกสารคดีความศาลยุติธรรม</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isLoginTab ? 'การเข้าใช้งานถือว่าท่านยอมรับ' : 'การสมัครสมาชิกถือว่าท่านยอมรับ'}{' '}
                  <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                    ข้อกำหนดการใช้งาน
                  </Link>{' '}
                  และ{' '}
                  <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                    นโยบายความเป็นส่วนตัว (PDPA)
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
