'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/authContext';
import { useTheme, ThemeMode } from '../../../lib/themeContext';
import { showToast, showError } from '../../../lib/sweetalert';
import { Settings, User, Lock, ShieldCheck, CheckCircle2, ArrowRight, Landmark, Monitor, Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [courtName, setCourtName] = useState(user?.courtName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Sync state when user object loads or updates
  React.useEffect(() => {
    document.title = 'การตั้งค่าบัญชีและรหัสผ่าน | JADS Court';
    if (user) {
      setFullName(user.fullName || '');
      setCourtName(user.courtName || '');
    }
  }, [user]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const themeOptions: { mode: ThemeMode; label: string; desc: string; icon: typeof Monitor }[] = [
    {
      mode: 'system',
      label: 'ตามระบบของเครื่อง (System)',
      desc: 'ปรับธีมสว่างหรือมืดตามการตั้งค่าของระบบปฏิบัติการอัตโนมัติ',
      icon: Monitor,
    },
    {
      mode: 'light',
      label: 'โหมดสว่าง (Light Mode)',
      desc: 'พื้นหลังสีสว่าง เหมาะสำหรับการใช้งานในห้องที่มีแสงสว่างเพียงพอ',
      icon: Sun,
    },
    {
      mode: 'dark',
      label: 'โหมดมืด (Dark Mode)',
      desc: 'พื้นหลังสีมืดโทนม่วงเข้ม ลดอาการเมื่อยล้าสายตาขณะทำงานเวลากลางคืน',
      icon: Moon,
    },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile(fullName, courtName);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('รหัสผ่านไม่ตรงกัน', 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsChangingPassword(true);
    try {
      const ok = await changePassword(currentPassword, newPassword);
      if (ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-700 dark:text-purple-400" />
          <span>การตั้งค่าบัญชีและรหัสผ่าน</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          จัดการข้อมูลโปรไฟล์ผู้ใช้งาน รูปลักษณ์ธีม และเปลี่ยนรหัสผ่านเพื่อความปลอดภัยของระบบ
        </p>
      </div>

      {/* Theme Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Sun className="w-5 h-5 dark:hidden" />
            <Moon className="w-5 h-5 hidden dark:block" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              การตั้งค่าธีมและการแสดงผล (Theme & Appearance)
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              เลือกธีมการแสดงผลที่ต้องการ โดยค่าเริ่มต้นจะเป็นไปตามการตั้งค่าของเครื่องคุณ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setTheme(opt.mode)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 dark:border-purple-500 ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-purple-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      isSelected ? 'text-purple-900 dark:text-purple-200' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Profile Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">ข้อมูลส่วนตัว</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400">แก้ไขชื่อ-นามสกุลที่แสดงผล</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">* ชื่อผู้ใช้งานไม่สามารถเปลี่ยนแปลงได้</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  ระดับสิทธิ์ (Role)
                </label>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-lg text-xs font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ (ADMIN)' : 'ผู้ใช้งานทั่วไป (USER)'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อศาลประจำตัว / สังกัดที่ปฏิบัติงาน (Court Name)
                </label>
                <div className="relative">
                  <Landmark className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="เช่น ศาลแขวงดอนเมือง, ศาลจังหวัดนนทบุรี"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * สามารถแก้ไขชื่อศาลได้ตลอดเวลา ระบบจะใช้ชื่อศาลนี้เป็นค่าเริ่มต้นอัตโนมัติในการสร้างเอกสารคดี
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อ - นามสกุล (Full Name)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น นาย สมชาย รักชาติ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isUpdatingProfile ? <span>กำลังบันทึก...</span> : <span>บันทึกข้อมูลส่วนตัว</span>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Section 2: Change Password */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">เปลี่ยนรหัสผ่าน</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400">อัปเดตรหัสผ่านใหม่เพื่อความปลอดภัย</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านเดิม"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isChangingPassword ? <span>กำลังเปลี่ยนรหัสผ่าน...</span> : <span>ยืนยันการเปลี่ยนรหัสผ่าน</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
