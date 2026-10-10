'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  FolderDown,
  Clock,
  Settings,
  HardDrive,
  ExternalLink,
  ChevronDown,
  FileSpreadsheet,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  isTauriEnvironment,
  getDownloadSettings,
  saveDownloadSettings,
  pickDownloadFolder,
  showInFileManager,
  getDownloadHistory,
  DownloadSettings,
  DownloadHistoryItem,
} from '../../lib/downloadManager';
import { showToast } from '../../lib/sweetalert';

export function DesktopMenuBar() {
  const [isTauri, setIsTauri] = useState(false);
  const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({
    defaultDir: '',
    alwaysAskLocation: true,
  });
  const [recentDownloads, setRecentDownloads] = useState<DownloadHistoryItem[]>([]);
  const [openMenu, setOpenMenu] = useState<'folder' | 'history' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate in Tauri Desktop Window App
    const runningInTauri = isTauriEnvironment();
    setIsTauri(runningInTauri);

    if (runningInTauri) {
      setDownloadSettings(getDownloadSettings());
      setRecentDownloads(getDownloadHistory().slice(0, 6));
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Do not render anything if running in regular Web Browser
  if (!isTauri) {
    return null;
  }

  const handlePickFolder = async () => {
    try {
      const folder = await pickDownloadFolder();
      if (folder) {
        const updated = { ...downloadSettings, defaultDir: folder };
        setDownloadSettings(updated);
        saveDownloadSettings(updated);
        showToast(`ตั้งโฟลเดอร์ดาวน์โหลด: ${folder}`);
        setOpenMenu(null);
      }
    } catch (e: any) {
      showToast('ไม่สามารถเลือกโฟลเดอร์ได้', 'error');
    }
  };

  const handleOpenCurrentFolder = async () => {
    if (downloadSettings.defaultDir) {
      const ok = await showInFileManager(downloadSettings.defaultDir);
      if (!ok) showToast('ไม่พบโฟลเดอร์ดังกล่าว', 'warning');
    } else {
      showToast('ยังไม่ได้กำหนดโฟลเดอร์ดาวน์โหลด', 'warning');
    }
    setOpenMenu(null);
  };

  const handleToggleAlwaysAsk = () => {
    const updated = {
      ...downloadSettings,
      alwaysAskLocation: !downloadSettings.alwaysAskLocation,
    };
    setDownloadSettings(updated);
    saveDownloadSettings(updated);
    showToast(
      updated.alwaysAskLocation
        ? 'เปิดการถามตำแหน่งบันทึกไฟล์ทุกครั้ง'
        : 'ปิดการถาม (บันทึกลงโฟลเดอร์เริ่มต้นอัตโนมัติ)'
    );
  };

  const refreshHistory = () => {
    setRecentDownloads(getDownloadHistory().slice(0, 6));
  };

  return (
    <div
      ref={menuRef}
      className="w-full bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-3 py-1 flex items-center justify-between select-none z-30 shadow-xs"
    >
      {/* Left Menu Items */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-[11px] font-bold text-purple-300 mr-2">
          <HardDrive className="w-3 h-3 text-purple-400" />
          <span>JADS Desktop</span>
        </div>

        {/* Menu 1: ตำแหน่งดาวน์โหลด (Download Folder Menu) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenMenu(openMenu === 'folder' ? null : 'folder');
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
              openMenu === 'folder'
                ? 'bg-slate-800 text-purple-400'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5 text-purple-400" />
            <span>โฟลเดอร์ดาวน์โหลด</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {openMenu === 'folder' && (
            <div className="absolute left-0 top-full mt-1 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 space-y-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  ตำแหน่งบันทึกไฟล์ปัจจุบัน
                </p>
                <p className="text-xs font-mono text-purple-300 truncate mt-0.5">
                  {downloadSettings.defaultDir || 'โฟลเดอร์ Downloads เริ่มต้นของเครื่อง'}
                </p>
              </div>

              <div className="h-px bg-slate-800" />

              <button
                type="button"
                onClick={handlePickFolder}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <FolderOpen className="w-4 h-4 text-purple-400" />
                <span>เปลี่ยนโฟลเดอร์ดาวน์โหลด...</span>
              </button>

              {downloadSettings.defaultDir && (
                <button
                  type="button"
                  onClick={handleOpenCurrentFolder}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                  <span>เปิดโฟลเดอร์ใน Windows Explorer</span>
                </button>
              )}

              <div className="h-px bg-slate-800" />

              <button
                type="button"
                onClick={handleToggleAlwaysAsk}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-slate-300 transition-colors"
              >
                <span className="text-[11px]">ถามตำแหน่งเซฟทุกครั้ง</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    downloadSettings.alwaysAskLocation
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  {downloadSettings.alwaysAskLocation && <Check className="w-3 h-3" />}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Menu 2: ประวัติการดาวน์โหลด (Download History Menu) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              refreshHistory();
              setOpenMenu(openMenu === 'history' ? null : 'history');
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
              openMenu === 'history'
                ? 'bg-slate-800 text-purple-400'
                : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>ประวัติไฟล์ที่โหลด</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {openMenu === 'history' && (
            <div className="absolute left-0 top-full mt-1 w-84 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 space-y-1.5 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  ดาวน์โหลดล่าสุด
                </span>
                <Link
                  href="/recent-files"
                  onClick={() => setOpenMenu(null)}
                  className="text-[11px] text-purple-400 hover:underline"
                >
                  ดูทั้งหมด
                </Link>
              </div>

              <div className="h-px bg-slate-800" />

              {recentDownloads.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs">
                  ยังไม่มีประวัติการดาวน์โหลด
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {recentDownloads.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-200 truncate">{item.fileName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.downloadedAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' • '}
                          <span className="uppercase text-purple-400">{item.format}</span>
                        </p>
                      </div>

                      {item.filePath && (
                        <button
                          type="button"
                          onClick={() => {
                            showInFileManager(item.filePath!);
                            setOpenMenu(null);
                          }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg shrink-0"
                          title="เปิดในโฟลเดอร์"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="h-px bg-slate-800" />

              <Link
                href="/recent-files"
                onClick={() => setOpenMenu(null)}
                className="w-full text-center block py-1.5 rounded-xl hover:bg-slate-800 text-[11px] font-bold text-purple-300 hover:text-white transition-colors"
              >
                เปิดหน้าประวัติการดาวน์โหลดเต็มรูปแบบ
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Indicator */}
      <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-400">Windows Native App</span>
      </div>
    </div>
  );
}
