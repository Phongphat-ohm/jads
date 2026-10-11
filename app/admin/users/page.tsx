'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import { showSuccess, showError, showConfirm } from '../../../lib/sweetalert';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  Mail,
  Calendar,
} from 'lucide-react';

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  isEmailVerified: boolean;
  fullName: string | null;
  courtName: string | null;
  role: 'USER' | 'ADMIN';
  isProfileComplete: boolean;
  createdAt: string;
  _count: {
    recentFiles: number;
    judgePairs: number;
    paragraphTemplates: number;
    feedbacks: number;
    auditLogs: number;
  };
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.role = roleFilter;

      const res = await apiClient.get('/admin/users', { params });
      if (res.data?.success) {
        setUsers(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      showError('โหลดข้อมูลไม่สำเร็จ', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'จัดการผู้ใช้งาน | JADS Admin';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && resetModalUser) {
        setResetModalUser(null);
      }
    };
    if (resetModalUser) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [resetModalUser]);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleRole = async (targetUser: UserItem) => {
    const nextRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const actionText = nextRole === 'ADMIN' ? 'แต่งตั้งเป็น ADMIN' : 'ลดสิทธิ์เป็น USER ธรรมดา';

    const confirmed = await showConfirm(
      `ยืนยันการเปลี่ยนสิทธิ์`,
      `คุณต้องการปรับสิทธิ์ของ "${targetUser.fullName || targetUser.username}" ให้เป็น ${actionText} หรือไม่?`
    );

    if (!confirmed) return;

    try {
      const res = await apiClient.patch(`/admin/users/${targetUser.id}/role`, {
        role: nextRole,
      });

      if (res.data?.success) {
        showSuccess('สำเร็จ', res.data.message);
        fetchUsers();
      }
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.response?.data?.message || err.message);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (newPassword.length < 8) {
      showError('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setIsResetting(true);
    try {
      const res = await apiClient.post(`/admin/users/${resetModalUser.id}/reset-password`, {
        newPassword,
      });

      if (res.data?.success) {
        showSuccess('รีเซ็ตรหัสผ่านสำเร็จ', `รหัสผ่านของผู้ใช้ ${resetModalUser.username} ถูกเปลี่ยนเรียบร้อยแล้ว`);
        setResetModalUser(null);
        setNewPassword('');
      }
    } catch (err: any) {
      showError('ไม่สามารถรีเซ็ตได้', err.response?.data?.message || err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async (targetUser: UserItem) => {
    if (targetUser.id === currentUser?.id) {
      showError('ไม่อนุญาต', 'คุณไม่สามารถลบบัญชีตนเองได้');
      return;
    }

    const confirmed = await showConfirm(
      'ยืนยันการลบผู้ใช้',
      `คำเตือน: ข้อมูลเอกสารทั้งหมดของผู้ใช้ "${targetUser.username}" จะถูกลบถาวร ไม่สามารถกู้คืนได้!`
    );

    if (!confirmed) return;

    try {
      const res = await apiClient.delete(`/admin/users/${targetUser.id}`);
      if (res.data?.success) {
        showSuccess('ลบเรียบร้อย', 'ผู้ใช้ถูกลบออกจากระบบแล้ว');
        fetchUsers();
      }
    } catch (err: any) {
      showError('ลบไม่สำเร็จ', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>จัดการผู้ใช้งานในระบบ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ค้นหา, ตรวจสอบสังกัดศาล, ปรับสิทธิ์บทบาท (USER / ADMIN) และรีเซ็ตรหัสผ่าน
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          ผู้ใช้ทั้งหมด: <span className="text-white font-bold">{total}</span> คน
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
              placeholder="ค้นหาด้วยชื่อผู้ใช้, ชื่อ-นามสกุล, อีเมล หรือสังกัดศาล..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-medium transition-all"
          >
            ค้นหา
          </button>
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">ทุกบทบาท</option>
              <option value="USER" className="bg-slate-900">ผู้ใช้ทั่วไป (USER)</option>
              <option value="ADMIN" className="bg-slate-900">ผู้ดูแลระบบ (ADMIN)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">ผู้ใช้งาน / บัญชี</th>
                <th className="py-3.5 px-4">สังกัดศาล / แผนก</th>
                <th className="py-3.5 px-4">อีเมล & สถานะ</th>
                <th className="py-3.5 px-4">บทบาท (Role)</th>
                <th className="py-3.5 px-4 text-center">สถิติการใช้งาน</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    กำลังโหลดข้อมูลผู้ใช้งาน...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    ไม่พบข้อมูลผู้ใช้ที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-purple-300">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.fullName || u.username}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                                  คุณ
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Court Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{u.courtName || '-'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-300 flex items-center gap-1 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{u.email || 'ไม่มีอีเมล'}</span>
                          </p>
                          {u.email && (
                            <span
                              className={`text-[9px] inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-medium ${
                                u.isEmailVerified
                                  ? 'text-emerald-400 bg-emerald-950/40'
                                  : 'text-amber-400 bg-amber-950/40'
                              }`}
                            >
                              {u.isEmailVerified ? '✓ ยืนยันแล้ว' : 'รอการยืนยัน'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {u.role === 'ADMIN' ? (
                            <ShieldCheck className="w-3 h-3 text-rose-400" />
                          ) : (
                            <Users className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                          <span title="ไฟล์ที่เคยสร้าง">📄 {u._count?.recentFiles || 0}</span>
                          <span>•</span>
                          <span title="ข้อคิดเห็นที่ส่ง">💬 {u._count?.feedbacks || 0}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Role Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              u.role === 'ADMIN'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40'
                            }`}
                            title={u.role === 'ADMIN' ? 'ปรับสิทธิ์เป็น User' : 'ตั้งเป็น Admin'}
                          >
                            {u.role === 'ADMIN' ? 'ลดเป็น User' : 'ตั้งเป็น Admin'}
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => setResetModalUser(u)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-all"
                            title="รีเซ็ตรหัสผ่าน"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                              title="ลบผู้ใช้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
            <div>
              หน้า {page} จาก {totalPages} (ทั้งหมด {total} รายการ)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setResetModalUser(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  รีเซ็ตรหัสผ่าน: @{resetModalUser.username}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isResetting ? 'กำลังบันทึก...' : 'ยืนยันเปลี่ยนรหัสผ่าน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
