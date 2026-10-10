'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/authContext';
import { useTheme, ThemeMode } from '../../../lib/themeContext';
import { showToast, showError } from '../../../lib/sweetalert';
import {
  Settings,
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Landmark,
  Monitor,
  Sun,
  Moon,
  Mail,
  ShieldAlert,
  RotateCw,
  KeyRound,
  FolderDown,
  FolderOpen,
  Download,
  FolderCheck,
} from 'lucide-react';
import {
  getDownloadSettings,
  saveDownloadSettings,
  pickDownloadFolder,
  isTauriEnvironment,
  DownloadSettings,
} from '../../../lib/downloadManager';

export default function SettingsPage() {
  const { user, updateProfile, changePassword, requestBindEmail, confirmBindEmail } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [courtName, setCourtName] = useState(user?.courtName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Email Binding / Change state
  const [newEmail, setNewEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2>(1); // 1 = input email, 2 = input otp
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Download Directory Settings State
  const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({
    defaultDir: '',
    alwaysAskLocation: true,
  });
  const [isTauri, setIsTauri] = useState(false);

  // Sync state when user object loads or updates
  React.useEffect(() => {
    document.title = 'การตั้งค่าบัญชีและรหัสผ่าน | JADS Court';
    setDownloadSettings(getDownloadSettings());
    setIsTauri(isTauriEnvironment());
    if (user) {
      setUsername(user.username || '');
      setFullName(user.fullName || '');
      setCourtName(user.courtName || '');
    }
  }, [user]);

  const handleUpdateDownloadSettings = (newSettings: Partial<DownloadSettings>) => {
    setDownloadSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveDownloadSettings(updated);
      showToast('บันทึกการตั้งค่าการดาวน์โหลดเรียบร้อย');
      return updated;
    });
  };

  const handlePickFolder = async () => {
    try {
      const folder = await pickDownloadFolder();
      if (folder) {
        handleUpdateDownloadSettings({ defaultDir: folder });
      }
    } catch (e: any) {
      showError('ไม่สามารถเลือกโฟลเดอร์ได้', e.message);
    }
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
      await updateProfile(fullName, courtName, username);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleStartEmailBinding = () => {
    setNewEmail('');
    setOtpCode('');
    setEmailStep(1);
    setIsEmailModalOpen(true);
  };

  const handleRequestEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showError('กรุณาระบุอีเมล', 'โปรดป้อนที่อยู่อีเมลใหม่');
      return;
    }

    setIsSendingOtp(true);
    try {
      const ok = await requestBindEmail(newEmail);
      if (ok) {
        setEmailStep(2);
        setCountdown(60);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      showError('รหัส OTP ไม่ถูกต้อง', 'รหัส OTP ต้องมีตัวเลขครบ 6 หลัก');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const ok = await confirmBindEmail(newEmail, otpCode);
      if (ok) {
        setIsEmailModalOpen(false);
      }
    } finally {
      setIsVerifyingOtp(false);
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
          จัดการข้อมูลโปรไฟล์ผู้ใช้งาน อีเมลยืนยันตัวตน รูปลักษณ์ธีม และเปลี่ยนรหัสผ่านเพื่อความปลอดภัยของระบบ
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

      {/* Download Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <FolderDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>ตำแหน่งจัดเก็บไฟล์ดาวน์โหลด (Download Location)</span>
              {isTauri && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Tauri Desktop App
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              กำหนดโฟลเดอร์สำหรับบันทึกไฟล์รายงาน Word (.docx) และ PDF (.pdf) ที่สร้างจากระบบ
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              โฟลเดอร์ดาวน์โหลดเริ่มต้น (Default Directory):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={downloadSettings.defaultDir}
                onChange={(e) => handleUpdateDownloadSettings({ defaultDir: e.target.value })}
                placeholder={isTauri ? 'ยังไม่ได้ระบุ (จะใช้โฟลเดอร์ Downloads ของเครื่อง)' : 'ใช้โฟลเดอร์ Downloads ของเบราว์เซอร์'}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
              {isTauri ? (
                <button
                  type="button"
                  onClick={handlePickFolder}
                  className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-purple-700/20"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>เลือกโฟลเดอร์</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const custom = prompt('ระบุโฟลเดอร์ที่ต้องการตั้งค่า เช่น C:\\Users\\...\\Downloads', downloadSettings.defaultDir);
                    if (custom !== null) {
                      handleUpdateDownloadSettings({ defaultDir: custom.trim() });
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FolderCheck className="w-4 h-4" />
                  <span>ระบุตำแหน่ง</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isTauri
                ? 'กดปุ่ม "เลือกโฟลเดอร์" เพื่อเลือกไดเรกทอรีบนเครื่องคอมพิวเตอร์ของคุณได้อย่างอิสระ'
                : 'บนเว็บเบราว์เซอร์ ไฟล์จะถูกส่งไปยังตำแหน่งที่เบราว์เซอร์ตั้งค่าไว้'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={downloadSettings.alwaysAskLocation}
                onChange={(e) => handleUpdateDownloadSettings({ alwaysAskLocation: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-purple-700 rounded border-slate-300 dark:border-slate-700 focus:ring-purple-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  ถามตำแหน่งบันทึกไฟล์ทุกครั้งก่อนดาวน์โหลด (Always ask where to save each file)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  เมื่อเปิดใช้งาน ระบบจะแสดงหน้าต่าง Save As ให้เลือกโฟลเดอร์และเปลี่ยนชื่อไฟล์ก่อนเซฟทุกครั้ง หากปิดจะเซฟลงโฟลเดอร์เริ่มต้นทันที
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Email & Account Security Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-purple-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                อีเมลและการยืนยันตัวตน (Email Verification & Security)
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                ใช้สำหรับรับรหัส OTP ในการรีเซ็ตรหัสผ่านและการแจ้งเตือนความปลอดภัย
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartEmailBinding}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
          >
            {user?.email ? 'เปลี่ยนอีเมล' : 'ผูกอีเมลใหม่'}
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 block mb-1">ที่อยู่อีเมลที่ผูกกับระบบ:</span>
            {user?.email ? (
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium">
                <ShieldAlert className="w-4 h-4" />
                <span>ยังไม่ได้ระบุอีเมลในระบบ (โปรดผูกอีเมลเพื่อความปลอดภัยในการกู้คืนบัญชี)</span>
              </div>
            )}
          </div>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น username123"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * ตัวอักษรภาษาอังกฤษ, ตัวเลข, จุด (.), ขีดล่าง (_) หรือขีดกลาง (-) ความยาว 3 - 50 ตัวอักษร
                </p>
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

      {/* Modal สำหรับขอและยืนยัน OTP เปลี่ยนอีเมล */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-purple-100 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {emailStep === 1 ? 'ระบุอีเมลใหม่' : 'ยืนยันรหัส OTP 6 หลัก'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕ ปิด
              </button>
            </div>

            {emailStep === 1 ? (
              <form onSubmit={handleRequestEmailOtp} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  ระบบจะส่งรหัสผ่านใช้ครั้งเดียว (OTP) ผ่านบริการ Resend ไปยังอีเมลใหม่ เพื่อตรวจสอบว่าท่านเป็นเจ้าของอีเมลจริง
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ที่อยู่อีเมลใหม่
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@court.go.th"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSendingOtp ? <span>กำลังส่ง OTP...</span> : <span>ส่งรหัส OTP ไปที่อีเมลใหม่</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmEmailOtp} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  กรุณากรอกรหัส OTP 6 หลักที่ได้รับทางอีเมล <strong className="text-purple-700 dark:text-purple-400">{newEmail}</strong>
                </p>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      รหัส OTP (6 หลัก)
                    </label>
                    <button
                      type="button"
                      onClick={handleRequestEmailOtp}
                      disabled={countdown > 0 || isSendingOtp}
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{countdown > 0 ? `ขอใหม่ใน ${countdown}s` : 'ส่งอีกครั้ง'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-3.5 py-2.5 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-700 rounded-xl text-center font-mono text-xl tracking-[0.4em] font-bold text-purple-950 dark:text-purple-200 focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isVerifyingOtp ? <span>กำลังตรวจสอบ...</span> : <span>ยืนยันและบันทึกอีเมล</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
