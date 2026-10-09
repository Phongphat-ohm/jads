'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';
import { showToast, showConfirm, showError } from '../../../lib/sweetalert';
import { Clock, FileSpreadsheet, Trash2, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

interface RecentFile {
  id: string;
  fileName: string;
  localPath: string;
  fileType?: string;
  lastOpenedAt: string;
  createdAt: string;
}

export default function RecentFilesPage() {
  const [files, setFiles] = useState<RecentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'ประวัติไฟล์ล่าสุด | JADS Court';
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/recent-files?limit=100');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.data || []);
      }
    } catch (err: any) {
      showError('เกิดข้อผิดพลาดในการโหลดประวัติไฟล์', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = await showConfirm('ยืนยันการลบ', `ท่านต้องการลบ "${name}" ออกจากประวัติใช่หรือไม่?`);
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchApi(`/recent-files/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        showToast('ลบประวัติสำเร็จ');
      } else {
        showError('ไม่สามารถลบได้');
      }
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="text-purple-600 hover:text-purple-800 text-xs font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่แดชบอร์ด</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-700" />
            <span>ประวัติไฟล์ล่าสุดทั้งหมด (Recent Files)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            แสดงรายการไฟล์ตารางคดีที่ท่านเคยเปิดใช้งานล่าสุด
          </p>
        </div>

        <button
          onClick={loadFiles}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-xs">กำลังโหลดข้อมูล...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600">ไม่มีประวัติไฟล์ในระบบ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-6">ชื่อไฟล์</th>
                  <th className="py-3 px-6">ตำแหน่งไฟล์ในเครื่อง (File Path)</th>
                  <th className="py-3 px-6">ประเภท</th>
                  <th className="py-3 px-6">ใช้งานล่าสุด</th>
                  <th className="py-3 px-6 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800 flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate max-w-xs">{file.fileName}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-[11px] max-w-md truncate">
                      {file.localPath}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-[10px] uppercase border border-purple-100">
                        {file.fileType || 'xlsx'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(file.lastOpenedAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDelete(file.id, file.fileName)}
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
