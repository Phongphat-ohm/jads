'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';
import { showError } from '../../../lib/sweetalert';
import {
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  Eye,
  RotateCcw,
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

type SortField = 'createdAt' | 'action' | 'status' | 'ipAddress';
type SortOrder = 'asc' | 'desc';

export default function AuditLogsPage() {
  // Data state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal for view detail
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null);

  // Debounce search input
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1); // Reset to page 1 on new search
    }, 400);
  };

  // Fetch logs function on demand
  const loadLogs = useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', targetPage.toString());
        queryParams.set('limit', limit.toString());
        queryParams.set('sortBy', sortBy);
        queryParams.set('sortOrder', sortOrder);

        if (debouncedSearch.trim()) {
          queryParams.set('search', debouncedSearch.trim());
        }
        if (actionFilter && actionFilter !== 'ALL') {
          queryParams.set('action', actionFilter);
        }
        if (statusFilter && statusFilter !== 'ALL') {
          queryParams.set('status', statusFilter);
        }
        if (startDate) {
          queryParams.set('startDate', startDate);
        }
        if (endDate) {
          queryParams.set('endDate', endDate);
        }

        const res = await fetchApi(`/audit-logs?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.data.logs || []);
          setTotalPages(data.data.totalPages || 1);
          setTotal(data.data.total || 0);
        } else {
          const errData = await res.json().catch(() => ({}));
          showError('ไม่สามารถดึงข้อมูล Audit Logs ได้', errData.message);
        }
      } catch (err: any) {
        showError('เกิดข้อผิดพลาดในการโหลดข้อมูล', err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, sortBy, sortOrder, debouncedSearch, actionFilter, statusFilter, startDate, endDate]
  );

  // Trigger load when page or any filter/sorting changes
  useEffect(() => {
    document.title = 'บันทึกการใช้งาน (Audit Logs) | JADS Court';
    loadLogs(page);
  }, [page, loadLogs]);

  // Handle column header sort click
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 font-bold" />
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setActionFilter('ALL');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' ||
    actionFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    startDate !== '' ||
    endDate !== '';

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN') || action.includes('OAUTH')) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60';
    }
    if (action.includes('LOGOUT') || action.includes('CANCEL')) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
    }
    if (action.includes('GENERATE')) {
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60';
    }
    if (action.includes('FILE') || action.includes('S3') || action.includes('UPLOAD')) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60';
    }
    if (action.includes('DELETE')) {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
    }
    return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  // Pagination calculation
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  // Generate visible page numbers
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/overview"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่แดชบอร์ด</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span>บันทึกประวัติการใช้งานระบบ (Audit Logs)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ระบบจัดเก็บประวัติกิจกรรม คำสั่งการดำเนินงาน พร้อม IP Address และวันเวลาแบบโปร่งใส (พบ {total.toLocaleString()} รายการ)
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadLogs(page)}
          className="self-start sm:self-auto px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-purple-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>ค้นหาและคัดกรองข้อมูล</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ค้นหากิจกรรม, IP Address, หรือ Resource..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all cursor-pointer"
            >
              <option value="ALL">กิจกรรมทั้งหมด (All Actions)</option>
              <option value="USER_LOGIN">USER_LOGIN (เข้าสู่ระบบ)</option>
              <option value="USER_LOGOUT">USER_LOGOUT (ออกจากระบบ)</option>
              <option value="USER_OAUTH_LOGIN">USER_OAUTH_LOGIN (OAuth)</option>
              <option value="USER_ONBOARDING_COMPLETE">USER_ONBOARDING_COMPLETE</option>
              <option value="USER_ONBOARDING_CANCELLED">USER_ONBOARDING_CANCELLED</option>
              <option value="DOCUMENT_GENERATE_DOCX">DOCUMENT_GENERATE_DOCX</option>
              <option value="DOCUMENT_GENERATE_PDF">DOCUMENT_GENERATE_PDF</option>
              <option value="S3_UPLOAD_FILE">S3_UPLOAD_FILE</option>
              <option value="S3_DELETE_FILE">S3_DELETE_FILE</option>
              <option value="PROFILE_UPDATE">PROFILE_UPDATE</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all cursor-pointer"
            >
              <option value="ALL">ทุกสถานะ (All Status)</option>
              <option value="SUCCESS">สำเร็จ (SUCCESS)</option>
              <option value="FAILED">ล้มเหลว (FAILED)</option>
            </select>
          </div>

          {/* Page Limit Selector */}
          <div>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all cursor-pointer"
            >
              <option value="10">10 รายการ / หน้า</option>
              <option value="15">15 รายการ / หน้า</option>
              <option value="25">25 รายการ / หน้า</option>
              <option value="50">50 รายการ / หน้า</option>
              <option value="100">100 รายการ / หน้า</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>ช่วงวันที่:</span>
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span className="text-slate-400">ถึง</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer ml-1"
              >
                ล้างวันที่
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-purple-600 dark:text-purple-400" />
            <p className="text-xs font-medium">กำลังโหลดข้อมูล Audit Logs ตามเงื่อนไข...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-40 text-purple-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ไม่พบข้อมูล Audit Log ที่ตรงกับเงื่อนไข
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ลองปรับเปลี่ยนคำค้นหา หรือกด "ล้างตัวกรองทั้งหมด" เพื่อดูประวัติการใช้งาน
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 font-semibold select-none">
                <tr>
                  {/* Action Column (Sortable) */}
                  <th
                    className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors group"
                    onClick={() => handleSort('action')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>กิจกรรม (Action)</span>
                      {renderSortIcon('action')}
                    </div>
                  </th>

                  {/* Status Column (Sortable) */}
                  <th
                    className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors group"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>สถานะ</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>

                  {/* Details Column */}
                  <th className="py-3.5 px-6">รายละเอียด (Details)</th>

                  {/* IP Address Column (Sortable) */}
                  <th
                    className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors group"
                    onClick={() => handleSort('ipAddress')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>IP Address</span>
                      {renderSortIcon('ipAddress')}
                    </div>
                  </th>

                  {/* Created At Column (Sortable) */}
                  <th
                    className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors group"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>วัน-เวลา</span>
                      {renderSortIcon('createdAt')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-colors"
                  >
                    {/* Action */}
                    <td className="py-3.5 px-6 font-semibold">
                      <span
                        className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      {log.resource && (
                        <span className="block text-[10px] text-slate-400 mt-1 font-normal">
                          ทรัพยากร: {log.resource}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>สำเร็จ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800/50">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ล้มเหลว</span>
                        </span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-6">
                      {log.details ? (
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate block">
                            {JSON.stringify(log.details)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedLogForDetails(log)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 p-1 rounded hover:bg-purple-100/50 dark:hover:bg-purple-950/50 shrink-0 cursor-pointer"
                            title="ดูรายละเอียดทั้งหมด"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Pagination Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            แสดง <span className="font-semibold text-slate-700 dark:text-slate-200">{startIndex}</span> ถึง{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{endIndex}</span> จากทั้งหมด{' '}
            <span className="font-semibold text-purple-700 dark:text-purple-400">{total.toLocaleString()}</span> รายการ
          </div>

          <div className="flex items-center gap-1 self-center sm:self-auto">
            {/* First Page */}
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="หน้าแรกสุด"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Pills */}
            <div className="flex items-center gap-1 px-1">
              {getPaginationNumbers().map((pageNum, idx) =>
                typeof pageNum === 'number' ? (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setPage(pageNum)}
                    className={`min-w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      page === pageNum
                        ? 'bg-purple-700 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-slate-400">
                    ...
                  </span>
                )
              )}
            </div>

            {/* Next Page */}
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(totalPages)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="หน้าสุดท้าย"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedLogForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedLogForDetails(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-purple-100 dark:border-slate-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    รายละเอียดกิจกรรม Audit Log
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedLogForDetails.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">กิจกรรม (Action)</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {selectedLogForDetails.action}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">สถานะ (Status)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedLogForDetails.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">IP Address</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedLogForDetails.ipAddress || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">วัน-เวลา</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {new Date(selectedLogForDetails.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold mb-1 block">
                  ข้อมูล JSON Details:
                </span>
                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800">
                  {JSON.stringify(selectedLogForDetails.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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
