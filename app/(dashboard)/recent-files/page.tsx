'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';
import { showToast, showConfirm, showError, showSuccess } from '../../../lib/sweetalert';
import {
  Clock,
  FileSpreadsheet,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Download,
  FolderOpen,
  FileText,
  FileCode,
  ExternalLink,
  HardDrive,
  FolderCheck,
} from 'lucide-react';
import {
  getDownloadHistory,
  removeDownloadHistoryItem,
  clearDownloadHistory,
  openDownloadedFile,
  showInFileManager,
  isTauriEnvironment,
  DownloadHistoryItem,
} from '../../../lib/downloadManager';

interface RecentFile {
  id: string;
  fileName: string;
  localPath: string;
  fileType?: string;
  lastOpenedAt: string;
  createdAt: string;
}

export default function RecentFilesPage() {
  const [activeTab, setActiveTab] = useState<'downloads' | 'recent'>('downloads');
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    document.title = 'ประวัติไฟล์และดาวน์โหลด | JADS Court';
    setIsTauri(isTauriEnvironment());
    loadRecentFiles();
    loadDownloadHistory();
  }, []);

  const loadRecentFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/recent-files?limit=100');
      if (res.ok) {
        const data = await res.json();
        setRecentFiles(data.data || []);
      }
    } catch (err: any) {
      showError('เกิดข้อผิดพลาดในการโหลดประวัติไฟล์', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDownloadHistory = () => {
    setDownloadHistory(getDownloadHistory());
  };

  const handleDeleteRecent = async (id: string, name: string) => {
    const confirm = await showConfirm('ยืนยันการลบ', `ท่านต้องการลบ "${name}" ออกจากประวัติใช่หรือไม่?`);
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchApi(`/recent-files/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecentFiles((prev) => prev.filter((f) => f.id !== id));
        showToast('ลบประวัติสำเร็จ');
      } else {
        showError('ไม่สามารถลบได้');
      }
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.message);
    }
  };

  const handleDeleteDownloadItem = (id: string, name: string) => {
    removeDownloadHistoryItem(id);
    loadDownloadHistory();
    showToast(`ลบ "${name}" ออกจากประวัติเรียบร้อย`);
  };

  const handleClearAllDownloads = () => {
    if (downloadHistory.length === 0) return;
    clearDownloadHistory();
    loadDownloadHistory();
    showToast('ล้างประวัติการดาวน์โหลดเรียบร้อย');
  };

  const handleOpenFile = async (filePath: string) => {
    if (!filePath) return;
    const ok = await openDownloadedFile(filePath);
    if (!ok) {
      showError('ไม่สามารถเปิดไฟล์ได้', `ไม่พบไฟล์ที่: ${filePath}`);
    }
  };

  const handleShowInFolder = async (filePath: string) => {
    if (!filePath) return;
    const ok = await showInFileManager(filePath);
    if (!ok) {
      showError('ไม่สามารถเปิดโฟลเดอร์ได้', `ไม่พบตำแหน่ง: ${filePath}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/overview"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่แดชบอร์ด</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 dark:text-purple-400 shrink-0" />
            <span>ประวัติการดาวน์โหลดและไฟล์ล่าสุด</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            จัดการและดูประวัติเอกสารคดีที่ดาวน์โหลด ตรวจสอบตำแหน่งโฟลเดอร์ และประวัติไฟล์ Excel ในระบบ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'downloads' && downloadHistory.length > 0 && (
            <button
              onClick={handleClearAllDownloads}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-800/60 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างประวัติ</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === 'downloads') loadDownloadHistory();
              else loadRecentFiles();
            }}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'downloads'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>ประวัติการโหลดไฟล์ (Downloads)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'downloads' ? 'bg-purple-900 text-purple-200' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            {downloadHistory.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'recent'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ประวัติไฟล์ Excel ล่าสุด</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'recent' ? 'bg-purple-900 text-purple-200' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            {recentFiles.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ประวัติการดาวน์โหลดไฟล์ (Download History) */}
      {/* ============================================================== */}
      {activeTab === 'downloads' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          {downloadHistory.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Download className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">ยังไม่มีประวัติการดาวน์โหลดไฟล์</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                เมื่อท่านสร้างและดาวน์โหลดไฟล์รายงาน Word (.docx) หรือ PDF (.pdf) ประวัติจะแสดงและบันทึกที่นี่อัตโนมัติ
              </p>
              <Link
                href="/generator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-700/20 transition-all mt-2"
              >
                <span>ไปยังหน้าสร้างเอกสาร</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-6">ชื่อไฟล์เอกสาร</th>
                    <th className="py-3 px-6">รูปแบบ</th>
                    <th className="py-3 px-6">หมายเลขคดีดำ</th>
                    <th className="py-3 px-6">ตำแหน่งบันทึกไฟล์ (Location)</th>
                    <th className="py-3 px-6">เวลาที่ดาวน์โหลด</th>
                    <th className="py-3 px-6 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {downloadHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2.5">
                          {item.format.toLowerCase() === 'pdf' ? (
                            <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          )}
                          <span className="truncate max-w-xs">{item.fileName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            item.format.toLowerCase() === 'pdf'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
                              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50'
                          }`}
                        >
                          {item.format}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-bold text-slate-700 dark:text-slate-300">
                        {item.caseBlackNo || '-'}
                      </td>

                      <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400 font-mono text-[11px] max-w-xs truncate">
                        {item.filePath ? (
                          <span title={item.filePath}>{item.filePath}</span>
                        ) : (
                          <span className="text-slate-400 italic">โฟลเดอร์ Downloads เริ่มต้น</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                        {new Date(item.downloadedAt).toLocaleString('th-TH')}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.filePath && isTauri && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenFile(item.filePath!)}
                                className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors cursor-pointer"
                                title="เปิดไฟล์"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShowInFolder(item.filePath!)}
                                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                                title="เปิดตำแหน่งโฟลเดอร์ในเครื่อง"
                              >
                                <FolderOpen className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteDownloadItem(item.id, item.fileName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="ลบออกจากประวัติ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ประวัติไฟล์ Excel ล่าสุด (Recent Files) */}
      {/* ============================================================== */}
      {activeTab === 'recent' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <p className="text-xs">กำลังโหลดข้อมูล...</p>
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">ไม่มีประวัติไฟล์ในระบบ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-6">ชื่อไฟล์</th>
                    <th className="py-3 px-6">ตำแหน่งไฟล์ในเครื่อง (File Path)</th>
                    <th className="py-3 px-6">ประเภท</th>
                    <th className="py-3 px-6">ใช้งานล่าสุด</th>
                    <th className="py-3 px-6 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                        <FileSpreadsheet className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="truncate max-w-xs">{file.fileName}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400 font-mono text-[11px] max-w-md truncate">
                        {file.localPath}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold text-[10px] uppercase border border-purple-100 dark:border-purple-800/50">
                          {file.fileType || 'xlsx'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                        {new Date(file.lastOpenedAt).toLocaleString('th-TH')}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteRecent(file.id, file.fileName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
      )}
    </div>
  );
}

