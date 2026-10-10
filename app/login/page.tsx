'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../lib/authContext';
import { Scale, Lock, User, FileText, CheckCircle2, ArrowRight, Sparkles, Landmark } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    document.title = isLoginTab ? 'เข้าสู่ระบบ | JADS Court' : 'สมัครสมาชิกใหม่ | JADS Court';
  }, [isLoginTab]);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [courtName, setCourtName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLoginTab) {
        await login(username, password);
      } else {
        await register(username, password, fullName, courtName);
      }
    } finally {
      setIsSubmitting(false);
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
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 bg-slate-950/40 backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Side: Illustration of Legal Worker */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between relative bg-gradient-to-br from-purple-900/40 via-purple-950/30 to-transparent">
          {/* Brand Header */}
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

          {/* Person Working On Documents PNG Image */}
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
        <div className="lg:col-span-5 bg-white p-8 md:p-10 flex flex-col justify-center relative">
          <div className="w-full max-w-sm mx-auto">
            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-purple-50 p-1 mb-8 border border-purple-100">
              <button
                type="button"
                onClick={() => setIsLoginTab(true)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isLoginTab
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                    : 'text-purple-900/60 hover:text-purple-900'
                  }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => setIsLoginTab(false)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${!isLoginTab
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-600/20'
                    : 'text-purple-900/60 hover:text-purple-900'
                  }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {/* Header Text */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {isLoginTab ? 'ยินดีต้อนรับกลับเข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้งานใหม่'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isLoginTab
                  ? 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าถึงระบบ'
                  : 'ลงทะเบียนเพื่อเริ่มต้นใช้งานระบบสร้างเอกสารคดี'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginTab && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLoginTab ? 'กรอกรหัสผ่าน' : 'ความยาวอย่างน้อย 8 ตัวอักษร'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                  />
                </div>
                {!isLoginTab && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    * รหัสผ่านต้องมีความยาวตั้งแต่ 8 ตัวอักษรขึ้นไป
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm"
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

            <div className="mt-6 text-center text-xs text-slate-400">
              ระบบบริหารจัดการเอกสารคดีความศาลยุติธรรม
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
