'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { fetchApi } from '../../lib/api';
import { showToast, showConfirm, showError, showSuccess } from '../../lib/sweetalert';
import {
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
  Trash2,
  FolderOpen,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface RecentFile {
  id: string;
  fileName: string;
  localPath: string;
  fileType?: string;
  lastOpenedAt: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  useEffect(() => {
    document.title = 'แผงควบคุมระบบ | JADS Court';
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const res = await fetchApi('/recent-files?limit=10');
      if (res.ok) {
        const data = await res.json();
        setRecentFiles(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load recent files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleDeleteRecent = async (id: string, fileName: string) => {
    const confirm = await showConfirm(
      'ยืนยันการลบประวัติไฟล์',
      `ท่านต้องการลบ "${fileName}" ออกจากประวัติไฟล์ล่าสุดหรือไม่?`
    );
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchApi(`/recent-files/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecentFiles((prev) => prev.filter((f) => f.id !== id));
        showToast('ลบประวัติไฟล์สำเร็จ');
      } else {
        showError('ไม่สามารถลบประวัติได้');
      }
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>JUSTICE AUTOMATION PLATFORM</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            สวัสดี, {user?.fullName || user?.username} 👋
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            ระบบสร้างเอกสารคดีความและรายงานทางการศาลอัตโนมัติจากไฟล์ Excel ตรวจสอบข้อมูลก่อนสร้าง และจัดการไฟล์อย่างเป็นระบบ
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/50 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>เริ่มอัปโหลดไฟล์ Excel / สร้างเอกสาร</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>

            <Link
              href="/judges"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all"
            >
              <span>จัดการคู่ผู้พิพากษา</span>
            </Link>

            <Link
              href="/paragraph-templates"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all"
            >
              <span>เทมเพลตย่อหน้า</span>
            </Link>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute right-48 bottom-0 -mb-12 w-64 h-64 rounded-full bg-indigo-600/20 blur-2xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">ประวัติไฟล์ล่าสุดในระบบ</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{recentFiles.length} ไฟล์</h3>
            <p className="text-[11px] text-purple-600 mt-1">ประวัติการเปิดไฟล์ของฉัน</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">การปกป้องข้อมูลส่วนบุคคล</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">ปลอดภัย</h3>
            <p className="text-[11px] text-slate-400 mt-1">ระบบแยกข้อมูลเฉพาะบัญชีคุณ 100%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">แม่แบบรายงานคดี (.docx)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">พร้อมใช้งาน</h3>
            <p className="text-[11px] text-slate-400 mt-1">มาตรฐานแบบพิมพ์ศาล</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Files Table Section */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">ประวัติไฟล์ล่าสุด (Recent Files)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ตำแหน่งไฟล์ในเครื่องของท่านถูกถอดรหัสแสดงผลเฉพาะผู้ใช้งานที่เป็นเจ้าของ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadRecentFiles}
              className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/recent-files"
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {isLoadingFiles ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-xs">กำลังโหลดประวัติไฟล์ล่าสุด...</p>
          </div>
        ) : recentFiles.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">ยังไม่มีประวัติไฟล์ในระบบ</p>
            <p className="text-xs text-slate-400 mt-1">
              เริ่มต้นด้วยการอัปโหลดไฟล์ Excel ในหน้าระบบสร้างเอกสาร
            </p>
            <Link
              href="/generator"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20"
            >
              <span>ไปที่หน้าระบบสร้างเอกสาร</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-6">ชื่อไฟล์</th>
                  <th className="py-3 px-6">ตำแหน่งไฟล์ในเครื่อง (Decrypted Path)</th>
                  <th className="py-3 px-6">ประเภท</th>
                  <th className="py-3 px-6">ใช้งานล่าสุด</th>
                  <th className="py-3 px-6 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800 flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate max-w-xs">{file.fileName}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px] truncate max-w-sm">
                      {file.localPath}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                        {file.fileType || 'xlsx'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(file.lastOpenedAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDeleteRecent(file.id, file.fileName)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบออกจากประวัติ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
