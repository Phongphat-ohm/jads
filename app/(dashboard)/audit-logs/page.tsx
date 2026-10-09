'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';
import { showError } from '../../../lib/sweetalert';
import {
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  resource?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  status: string;
  createdAt: string;
  user?: {
    username: string;
    fullName?: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'บันทึกการใช้งาน (Audit Logs) | JADS Court';
    loadLogs(page);
  }, [page]);

  const loadLogs = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const res = await fetchApi(`/audit-logs?page=${currentPage}&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data.logs || []);
        setTotalPages(data.data.totalPages || 1);
        setTotal(data.data.total || 0);
      }
    } catch (err: any) {
      showError('ไม่สามารถดึงข้อมูล Audit Logs ได้', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (action.includes('GENERATE')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (action.includes('FILE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/overview" className="text-purple-600 hover:text-purple-800 text-xs font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่แดชบอร์ด</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-700" />
            <span>บันทึกประวัติการใช้งานระบบ (Audit Logs)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกทุกกิจกรรมและคำสั่งการดำเนินงาน พร้อม IP Address และเวลาเพื่อความโปร่งใสและตรวจสอบได้ (ทั้งหมด {total} รายการ)
          </p>
        </div>

        <button
          onClick={() => loadLogs(page)}
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
            <p className="text-xs">กำลังโหลดบันทึกการใช้งาน...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600">ยังไม่มีบันทึก Audit Log</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-6">กิจกรรม (Action)</th>
                  <th className="py-3 px-6">สถานะ</th>
                  <th className="py-3 px-6">รายละเอียด (Details)</th>
                  <th className="py-3 px-6">IP Address</th>
                  <th className="py-3 px-6">วัน-เวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-6 font-semibold">
                      <span className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>สำเร็จ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ล้มเหลว</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(log.createdAt).toLocaleString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            หน้า {page} จากทั้งหมด {totalPages} หน้า (รวม {total} รายการ)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">{page}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
