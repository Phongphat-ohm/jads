'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api';
import { showSuccess, showError, showToast, showConfirm } from '../../../lib/sweetalert';
import { Users, Plus, Trash2, Edit2, Scale, Building2, Check, X, Search } from 'lucide-react';
import { APP_CONFIG } from '../../../lib/config';
import { useAuth } from '../../../lib/authContext';

interface JudgePair {
  id: string;
  judge1Name: string;
  judge2Name: string;
  courtName?: string | null;
  createdAt: string;
}

export default function JudgesPage() {
  const { user } = useAuth();
  const [judgePairs, setJudgePairs] = useState<JudgePair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judge1Input, setJudge1Input] = useState('');
  const [judge2Input, setJudge2Input] = useState('');
  const [courtInput, setCourtInput] = useState(user?.courtName || APP_CONFIG.DEFAULT_COURT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'จัดการคู่ผู้พิพากษา | JADS Court';
    fetchJudgePairs();
  }, []);

  const fetchJudgePairs = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/judge-pairs');
      setJudgePairs(res.data.judgePairs || []);
    } catch (err: any) {
      showError('ไม่สามารถโหลดข้อมูลได้', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setJudge1Input('');
    setJudge2Input('');
    setCourtInput(user?.courtName || APP_CONFIG.DEFAULT_COURT);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pair: JudgePair) => {
    setEditingId(pair.id);
    setJudge1Input(pair.judge1Name);
    setJudge2Input(pair.judge2Name);
    setCourtInput(pair.courtName || APP_CONFIG.DEFAULT_COURT);
    setIsModalOpen(true);
  };

  const handleSavePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judge1Input.trim() || !judge2Input.trim()) {
      showToast('กรุณาระบุชื่อผู้พิพากษาทั้ง 2 ท่าน', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await apiClient.put(`/judge-pairs/${editingId}`, {
          judge1Name: judge1Input.trim(),
          judge2Name: judge2Input.trim(),
          courtName: courtInput.trim(),
        });
        showSuccess('สำเร็จ', 'อัปเดตคู่ผู้พิพากษาเรียบร้อยแล้ว');
      } else {
        await apiClient.post('/judge-pairs', {
          judge1Name: judge1Input.trim(),
          judge2Name: judge2Input.trim(),
          courtName: courtInput.trim(),
        });
        showSuccess('สำเร็จ', 'เพิ่มคู่ผู้พิพากษาใหม่เรียบร้อยแล้ว');
      }

      setIsModalOpen(false);
      fetchJudgePairs();
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePair = async (pair: JudgePair) => {
    const confirmed = await showConfirm(
      'ยืนยันการลบ',
      `ท่านต้องการลบคู่ผู้พิพากษา "${pair.judge1Name} - ${pair.judge2Name}" ใช่หรือไม่?`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/judge-pairs/${pair.id}`);
      showSuccess('ลบสำเร็จ', 'ลบคู่ผู้พิพากษาเรียบร้อยแล้ว');
      setJudgePairs((prev) => prev.filter((p) => p.id !== pair.id));
    } catch (err: any) {
      showError('ไม่สามารถลบได้', err.response?.data?.message || err.message);
    }
  };

  const filteredPairs = judgePairs.filter(
    (p) =>
      p.judge1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.judge2Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.courtName && p.courtName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-3xl text-white shadow-xl shadow-purple-900/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-purple-300" />
            <span>JUDICIAL QUORUM MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">จัดการคู่ผู้พิพากษา (องค์คณะ)</h1>
          <p className="text-sm text-purple-200 mt-1 max-w-xl">
            บันทึกและจัดการคู่ผู้พิพากษาที่นั่งพิจารณาร่วมกันเป็นคู่ เพื่อให้ระบบเติมชื่ออัตโนมัติในหน้าสร้างเอกสารคดี
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto justify-center px-5 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-purple-700" />
          <span>เพิ่มคู่ผู้พิพากษาใหม่</span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-purple-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้พิพากษา หรือชื่อศาล..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
          ทั้งหมด <strong className="text-purple-700 dark:text-purple-400 font-bold">{judgePairs.length}</strong> คู่
        </span>
      </div>

      {/* Grid of Judge Pairs */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-purple-100 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">กำลังโหลดรายการคู่ผู้พิพากษา...</p>
        </div>
      ) : filteredPairs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-purple-100 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">ยังไม่มีคู่ผู้พิพากษาในระบบ</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            ท่านสามารถเพิ่มคู่ผู้พิพากษาไว้ เพื่อให้ระบบช่วยเติมชื่อผู้พิพากษาคนที่ 2 อัตโนมัติเมื่อเลือกคนที่ 1
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มคู่แรกตอนนี้</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPairs.map((pair) => (
            <div
              key={pair.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-purple-100/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <span className="text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Scale className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>องค์คณะร่วม</span>
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {pair.courtName || APP_CONFIG.DEFAULT_COURT}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-0.5">
                      ผู้พิพากษาคนที่ 1 (หลัก)
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{pair.judge1Name}</p>
                  </div>

                  <div className="bg-purple-50/60 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200/70 dark:border-purple-800/50">
                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                      ผู้พิพากษาคนที่ 2 (ร่วม)
                    </p>
                    <p className="text-xs font-bold text-purple-950 dark:text-purple-200">{pair.judge2Name}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(pair)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePair(pair)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {editingId ? 'แก้ไขคู่ผู้พิพากษา' : 'เพิ่มคู่ผู้พิพากษาใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePair} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้พิพากษาคนที่ 1 (หลัก)
                </label>
                <input
                  type="text"
                  required
                  value={judge1Input}
                  onChange={(e) => setJudge1Input(e.target.value)}
                  placeholder="เช่น นาย สมศักดิ์ ยุติธรรม"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้พิพากษาคนที่ 2 (ร่วม)
                </label>
                <input
                  type="text"
                  required
                  value={judge2Input}
                  onChange={(e) => setJudge2Input(e.target.value)}
                  placeholder="เช่น นางสาว ดวงใจ ซื่อตรง"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ศาล</label>
                <input
                  type="text"
                  value={courtInput}
                  onChange={(e) => setCourtInput(e.target.value)}
                  placeholder="เช่น ศาลจังหวัดระยอง"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกคู่ผู้พิพากษา'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
