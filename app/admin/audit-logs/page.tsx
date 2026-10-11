'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { showError } from '../../../lib/sweetalert';
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  RefreshCw,
  Terminal,
  Globe,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  userId: string | null;
  action: string;
  resource: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    fullName: string | null;
    courtName: string | null;
    role: string;
  } | null;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (actionFilter !== 'ALL') params.action = actionFilter;

      const res = await apiClient.get('/admin/audit-logs', { params });
      if (res.data?.success) {
        setLogs(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      showError('โหลดประวัติไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, statusFilter, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" />
            <span>ประวัติกิจกรรมและบันทึกความปลอดภัยระบบ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ตรวจสอบเหตุการณ์ทุกขั้นตอน: การเข้าสู่ระบบ, การสร้างเอกสาร, การเปลี่ยนสิทธิ์, และ IP Address
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          บันทึกทั้งหมด: <span className="text-white font-bold">{total}</span> รายการ
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วย Action, User, หรือ IP Address..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-medium transition-all"
          >
            ค้นหา
          </button>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">ทุกสถานะ (Status)</option>
            <option value="SUCCESS">สำเร็จ (SUCCESS)</option>
            <option value="FAILED">ล้มเหลว (FAILED)</option>
          </select>

          <button
            type="button"
            onClick={fetchLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">วันและเวลา</th>
                <th className="py-3.5 px-4">กิจกรรม (Action)</th>
                <th className="py-3.5 px-4">ผู้ดำเนินการ (User)</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    กำลังโหลดประวัติระบบ...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    ไม่พบบันทึกกิจกรรมที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === 'SUCCESS';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                          {log.action}
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        {log.user ? (
                          <div>
                            <p className="font-semibold text-white">
                              {log.user.fullName || log.user.username}
                            </p>
                            <p className="text-[10px] text-slate-400">@{log.user.username}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">ระบบ / ผู้มาเยือน</span>
                        )}
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {log.ipAddress || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isSuccess
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isSuccess ? '✓ สำเร็จ' : '✕ ล้มเหลว'}
                        </span>
                      </td>

                      {/* Details View */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-all"
                        >
                          ดู Log
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Limit Selector */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div>
              หน้า <span className="text-white font-medium">{page}</span> จาก{' '}
              <span className="text-white font-medium">{totalPages || 1}</span> (ทั้งหมด{' '}
              <span className="text-white font-medium">{total}</span> รายการ)
            </div>
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
              <span className="text-slate-400">แสดง:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              >
                <option value={10}>10 รายการ</option>
                <option value={25}>25 รายการ</option>
                <option value={50}>50 รายการ</option>
                <option value={100}>100 รายการ</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-40 transition-colors"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-40 transition-colors"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* JSON Log Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-white">
                  รายละเอียดเหตุการณ์: {selectedLog.action}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400">
                  <span className="font-semibold text-slate-300">ID:</span> {selectedLog.id}
                </p>
                <p className="text-slate-400">
                  <span className="font-semibold text-slate-300">เวลา:</span>{' '}
                  {new Date(selectedLog.createdAt).toLocaleString('th-TH')}
                </p>
                <p className="text-slate-400">
                  <span className="font-semibold text-slate-300">User Agent:</span>{' '}
                  {selectedLog.userAgent || '-'}
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">JSON Payload:</label>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-purple-300 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.details, null, 2) || '{}'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
