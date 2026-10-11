'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import {
  Users,
  MessageSquare,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  totalRecentFiles: number;
  totalJudgePairs: number;
  totalTemplates: number;
  totalFeedbacks: number;
  pendingFeedbacks: number;
  totalAuditLogs: number;
  docGenerations: number;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string | null;
    fullName: string | null;
    courtName: string | null;
    role: string;
    createdAt: string;
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    resource: string | null;
    status: string;
    ipAddress: string | null;
    createdAt: string;
    user?: {
      username: string;
      fullName: string | null;
      role: string;
    } | null;
  }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
      } else {
        throw new Error(res.data?.message || 'Failed to load stats');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'ภาพรวมระบบผู้ดูแล | JADS Admin';
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Next.js 16 Proxy Active
            </span>
            <span className="text-xs text-slate-400">• สิทธิผู้ดูแลระบบสูงสุด</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">แผงควบคุมระบบศาลส่วนกลาง</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ภาพรวมการใช้งาน, การดูแลผู้ใช้งาน และตรวจสอบความปลอดภัยระบบ JADS
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">ผู้ใช้งานทั้งหมด</span>
            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats?.totalUsers ?? 0}
            </span>
            <span className="text-xs text-purple-400 font-medium">
              (แอดมิน {stats?.adminUsers ?? 0} คน)
            </span>
          </div>
          <Link
            href="/admin/users"
            className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>จัดการผู้ใช้</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pending Feedbacks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">ข้อร้องเรียนรอตรวจสอบ</span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats?.pendingFeedbacks ?? 0}
            </span>
            <span className="text-xs text-slate-400">
              / ทั้งหมด {stats?.totalFeedbacks ?? 0} เรื่อง
            </span>
          </div>
          <Link
            href="/admin/feedbacks"
            className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>ดูความคิดเห็นทั้งหมด</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Documents Generated */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">เอกสารคดีที่สร้างแล้ว</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats?.docGenerations ?? 0}
            </span>
            <span className="text-xs text-emerald-400 font-medium">ฉบับ</span>
          </div>
          <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-1">
            <span>จากประวัติใน Audit Logs</span>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">บันทึกเหตุการณ์ระบบ</span>
            <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats?.totalAuditLogs ?? 0}
            </span>
            <span className="text-xs text-slate-400">รายการ</span>
          </div>
          <Link
            href="/admin/audit-logs"
            className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>ตรวจสอบประวัติระบบ</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Grid: Recent Users & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">ผู้ใช้งานที่ลงทะเบียนล่าสุด</h3>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">กำลังโหลด...</div>
            ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {u.fullName || u.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {u.courtName || u.email || `@${u.username}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">ไม่มีข้อมูลผู้ใช้งาน</div>
            )}
          </div>
        </div>

        {/* Recent System Activity Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-white">ประวัติกิจกรรมล่าสุดในระบบ</h3>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">กำลังโหลด...</div>
            ) : stats?.recentLogs && stats.recentLogs.length > 0 ? (
              stats.recentLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate font-mono">
                      {log.action}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      โดย: {log.user?.fullName || log.user?.username || 'ระบบ'} • {log.ipAddress || '-'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">ไม่มีประวัติกิจกรรม</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
