'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { showSuccess, showError, showConfirm, showToast } from '../../../lib/sweetalert';
import {
  MessageSquare,
  Search,
  Filter,
  Star,
  Bug,
  Lightbulb,
  FileText,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  User,
  Trash2,
  Paperclip,
  Download,
  Image as ImageIcon,
  File as FileIcon,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'BUG' | 'FEATURE_REQUEST' | 'GENERAL_FEEDBACK' | 'TEMPLATE_ISSUE';
  rating: number | null;
  title: string;
  description: string;
  screenshot: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  pageUrl: string | null;
  appVersion: string | null;
  contactInfo: string | null;
  status: 'PENDING' | 'REVIEWED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    fullName: string | null;
    courtName: string | null;
    role: string;
  } | null;
}

const WIN1252_MAP: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

function fixMojibake(str: string | null | undefined): string {
  if (!str) return '';
  if (!str.includes('à')) return str;
  try {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (WIN1252_MAP[code]) {
        bytes.push(WIN1252_MAP[code]);
      } else if (code <= 0xff) {
        bytes.push(code);
      } else {
        return str;
      }
    }
    const decoded = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    return decoded.includes('\ufffd') ? str : decoded;
  } catch {
    return str;
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'รอตรวจสอบ', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  REVIEWED: { label: 'รับเรื่องแล้ว', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  RESOLVED: { label: 'แก้ไขเสร็จสิ้น', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  REJECTED: { label: 'ยกเลิก/ไม่พบปัญหา', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  BUG: { label: 'รายงานบั๊ก', icon: Bug, color: 'text-rose-400 bg-rose-950/40 border-rose-800/40' },
  FEATURE_REQUEST: { label: 'ขอฟีเจอร์ใหม่', icon: Lightbulb, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  TEMPLATE_ISSUE: { label: 'แบบพิมพ์ศาล', icon: FileText, color: 'text-sky-400 bg-sky-950/40 border-sky-800/40' },
  GENERAL_FEEDBACK: { label: 'ข้อคิดเห็นทั่วไป', icon: MessageCircle, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
};

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [editStatus, setEditStatus] = useState<string>('PENDING');
  const [editAdminNote, setEditAdminNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await apiClient.get('/admin/feedbacks', { params });
      if (res.data?.success) {
        setFeedbacks(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      showError('โหลดความคิดเห็นไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'จัดการข้อเสนอแนะและปัญหา | JADS Admin';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedFeedback) {
        setSelectedFeedback(null);
      }
    };
    if (selectedFeedback) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedFeedback]);

  useEffect(() => {
    fetchFeedbacks();
  }, [page, statusFilter, typeFilter]);

  const handleOpenDetail = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setEditStatus(item.status);
    setEditAdminNote(item.adminNote || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    setIsUpdating(true);
    try {
      const res = await apiClient.patch(`/admin/feedbacks/${selectedFeedback.id}`, {
        status: editStatus,
        adminNote: editAdminNote,
      });

      if (res.data?.success) {
        showSuccess('อัปเดตเรียบร้อย', 'บันทึกสถานะและข้อความตอบกลับแล้ว');
        setSelectedFeedback(null);
        fetchFeedbacks();
      }
    } catch (err: any) {
      showError('อัปเดตไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadAttachment = async (fileUrl: string, fileName: string) => {
    try {
      showToast('กำลังดาวน์โหลดไฟล์แนบ...');
      // If it's an API route (e.g. /api/feedbacks/attachments/...)
      const endpoint = fileUrl.startsWith('/api')
        ? fileUrl.replace(/^\/api/, '')
        : fileUrl;

      const res = await apiClient.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'attachment';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('ดาวน์โหลดไฟล์แนบสำเร็จ', 'success');
    } catch (err: any) {
      showError('ดาวน์โหลดไม่สำเร็จ', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    const confirmed = await showConfirm(
      'ยืนยันการลบ',
      'คุณต้องการลบข้อเสนอแนะนี้ออกจากระบบหรือไม่?'
    );
    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/admin/feedbacks/${id}`);
      if (res.data?.success) {
        showSuccess('ลบเรียบร้อย', 'ลบข้อเสนอแนะสำเร็จ');
        if (selectedFeedback?.id === id) setSelectedFeedback(null);
        fetchFeedbacks();
      }
    } catch (err: any) {
      showError('ลบไม่สำเร็จ', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <span>จัดการความคิดเห็นและข้อร้องเรียน</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            รับฟังเสียงสะท้อนจากเจ้าหน้าที่ศาล, ตรวจสอบบั๊ก และปรับสถานะการแก้ไข
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          รายการทั้งหมด: <span className="text-white font-bold">{total}</span> รายการ
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                fetchFeedbacks();
              }
            }}
            placeholder="ค้นหาตามหัวข้อหรือรายละเอียด..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="PENDING">รอตรวจสอบ (Pending)</option>
            <option value="REVIEWED">รับเรื่องแล้ว (Reviewed)</option>
            <option value="IN_PROGRESS">กำลังดำเนินการ (In Progress)</option>
            <option value="RESOLVED">แก้ไขเสร็จสิ้น (Resolved)</option>
            <option value="REJECTED">ยกเลิก/ไม่พบปัญหา (Rejected)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">ทุกหมวดหมู่</option>
            <option value="BUG">รายงานบั๊ก</option>
            <option value="FEATURE_REQUEST">ขอฟีเจอร์ใหม่</option>
            <option value="TEMPLATE_ISSUE">ปัญหาแบบพิมพ์ศาล</option>
            <option value="GENERAL_FEEDBACK">ข้อคิดเห็นทั่วไป</option>
          </select>

          <button
            type="button"
            onClick={fetchFeedbacks}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedbacks Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-500">กำลังโหลดความคิดเห็น...</div>
      ) : feedbacks.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">ยังไม่มีข้อเสนอแนะในหมวดนี้</p>
          <p className="text-xs text-slate-500 mt-1">
            เมื่อมีผู้ใช้แจ้งปัญหาหรือแนะนำระบบ ข้อมูลจะปรากฏที่นี่
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbacks.map((item) => {
            const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG.GENERAL_FEEDBACK;
            const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
            const TypeIcon = typeConf.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg cursor-pointer group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeConf.color}`}
                    >
                      <TypeIcon className="w-3 h-3" />
                      <span>{typeConf.label}</span>
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConf.color}`}
                    >
                      {statusConf.label}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  {item.rating && (
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= (item.rating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Title & Preview */}
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate">
                      {item.user?.fullName || item.user?.username || 'ผู้ใช้นิรนาม'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(item.attachmentUrl || item.screenshot) && (
                      <span className="flex items-center gap-0.5 text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40 text-[10px]" title="มีไฟล์แนบ">
                        <Paperclip className="w-2.5 h-2.5" />
                        <span>ไฟล์แนบ</span>
                      </span>
                    )}
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
          <div>
            หน้า {page} จาก {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Detail & Action Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">
                  FEEDBACK ID: {selectedFeedback.id}
                </span>
                <h3 className="font-bold text-base text-white mt-1">
                  {selectedFeedback.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Details Content */}
            <div className="space-y-4 text-xs">
              {/* Sender & Court Info */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">ผู้ส่งข้อเสนอแนะ:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedFeedback.user?.fullName || selectedFeedback.user?.username || 'ผู้ใช้นิรนาม'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">สังกัดศาล:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedFeedback.user?.courtName || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">หน้าที่พบปัญหา:</span>
                  <span className="font-mono text-purple-400">
                    {selectedFeedback.pageUrl || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">วันที่ส่ง:</span>
                  <span className="text-slate-300">
                    {new Date(selectedFeedback.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/60 flex items-center gap-2">
                  <span className="text-slate-500">ข้อมูลติดต่อกลับ:</span>
                  {selectedFeedback.contactInfo ? (
                    <span className="font-semibold text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-800/40">
                      📞 {selectedFeedback.contactInfo}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">ผู้ใช้ไม่ได้ระบุข้อมูลติดต่อกลับ</span>
                  )}
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className="font-semibold text-slate-400 block mb-1">
                  รายละเอียดข้อเสนอแนะ:
                </label>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedFeedback.description}
                </div>
              </div>

              {/* Attachment Preview (if any) */}
              {(selectedFeedback.attachmentUrl || selectedFeedback.screenshot) && (
                <div>
                  <label className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                    <span>ไฟล์แนบ / ภาพประกอบ:</span>
                  </label>
                  {(() => {
                    const fileUrl = selectedFeedback.attachmentUrl || selectedFeedback.screenshot || '';
                    const rawFileName = selectedFeedback.attachmentName || 'ไฟล์แนบ';
                    const fileName = fixMojibake(rawFileName);
                    const isImg = fileName.match(/\.(png|jpg|jpeg|gif|webp)$/i) || fileUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i);

                    // If fileUrl is relative e.g. /api/feedbacks/attachments/..., prefix with backend or full URL
                    const resolvedUrl = fileUrl.startsWith('http')
                      ? fileUrl
                      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

                    return (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        {isImg && (
                          <div className="rounded-lg overflow-hidden border border-slate-800 max-h-60 bg-black/40 flex items-center justify-center">
                            <img
                              src={resolvedUrl}
                              alt={fileName}
                              className="max-h-60 object-contain hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {isImg ? (
                              <ImageIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            ) : (
                              <FileIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                            )}
                            <span className="text-xs text-slate-300 font-medium truncate">
                              {fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(fileUrl, fileName)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ดาวน์โหลดไฟล์</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Admin Status & Note Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      ปรับสถานะการดำเนินการ
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="PENDING">รอตรวจสอบ (Pending)</option>
                      <option value="REVIEWED">รับเรื่องแล้ว (Reviewed)</option>
                      <option value="IN_PROGRESS">กำลังดำเนินการ (In Progress)</option>
                      <option value="RESOLVED">แก้ไขเสร็จสิ้น (Resolved)</option>
                      <option value="REJECTED">ยกเลิก/ไม่พบปัญหา (Rejected)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    ข้อความตอบกลับหรือบันทึกของแอดมิน (Admin Note)
                  </label>
                  <textarea
                    value={editAdminNote}
                    onChange={(e) => setEditAdminNote(e.target.value)}
                    rows={3}
                    placeholder="บันทึกข้อความภายใน เช่น ดำเนินการอัปเดตเทมเพลตให้แล้วใน v1.0.1..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรายการนี้</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedback(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                    >
                      ปิด
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                    >
                      {isUpdating ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
