'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api';
import { showSuccess, showError, showToast, showConfirm } from '../../../lib/sweetalert';
import { FileText, Plus, Trash2, Edit2, Search, X, Tag } from 'lucide-react';

interface ParagraphTemplate {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  createdAt: string;
}

export default function ParagraphTemplatesPage() {
  const [templates, setTemplates] = useState<ParagraphTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('คำพิพากษา');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'เทมเพลตย่อหน้าส่วนตัว | JADS Court';
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/paragraph-templates');
      setTemplates(res.data.paragraphTemplates || []);
    } catch (err: any) {
      showError('ไม่สามารถโหลดข้อมูลได้', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitleInput('');
    setContentInput('');
    setCategoryInput('คำพิพากษา');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: ParagraphTemplate) => {
    setEditingId(tpl.id);
    setTitleInput(tpl.title);
    setContentInput(tpl.content);
    setCategoryInput(tpl.category || 'คำพิพากษา');
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !contentInput.trim()) {
      showToast('กรุณากรอกชื่อและเนื้อหาเทมเพลต', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await apiClient.put(`/paragraph-templates/${editingId}`, {
          title: titleInput.trim(),
          content: contentInput.trim(),
          category: categoryInput.trim(),
        });
        showSuccess('สำเร็จ', 'อัปเดตเทมเพลตย่อหน้าเรียบร้อยแล้ว');
      } else {
        await apiClient.post('/paragraph-templates', {
          title: titleInput.trim(),
          content: contentInput.trim(),
          category: categoryInput.trim(),
        });
        showSuccess('สำเร็จ', 'เพิ่มเทมเพลตย่อหน้าใหม่เรียบร้อยแล้ว');
      }

      setIsModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (tpl: ParagraphTemplate) => {
    const confirmed = await showConfirm(
      'ยืนยันการลบ',
      `ท่านต้องการลบเทมเพลต "${tpl.title}" ใช่หรือไม่?`
    );
    if (!confirmed) return;

    try {
      await apiClient.delete(`/paragraph-templates/${tpl.id}`);
      showSuccess('ลบสำเร็จ', 'ลบเทมเพลตย่อหน้าเรียบร้อยแล้ว');
      setTemplates((prev) => prev.filter((t) => t.id !== t.id));
      fetchTemplates();
    } catch (err: any) {
      showError('ไม่สามารถลบได้', err.response?.data?.message || err.message);
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-3xl text-white shadow-xl shadow-purple-900/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5 text-purple-300" />
            <span>CUSTOM PARAGRAPH TEMPLATES</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">เทมเพลตย่อหน้าส่วนตัว</h1>
          <p className="text-sm text-purple-200 mt-1 max-w-xl">
            บันทึกและจัดการข้อความคำวินิจฉัยหรือข้อความที่ใช้งานบ่อย เพื่อเลือกแทรกลงในเอกสารคดีได้ทันทีโดยไม่ต้องพิมพ์ซ้ำ
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 text-purple-700" />
          <span>เพิ่มเทมเพลตใหม่</span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อเทมเพลต, เนื้อหา, หรือหมวดหมู่..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold px-2">
          ทั้งหมด <strong className="text-purple-700 font-bold">{templates.length}</strong> เทมเพลต
        </span>
      </div>

      {/* Grid of Templates */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-sm">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">กำลังโหลดรายการเทมเพลตย่อหน้า...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-sm">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">ยังไม่มีเทมเพลตย่อหน้าส่วนตัว</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            ท่านสามารถเพิ่มข้อความที่ใช้บ่อย เช่น คำสั่งเลื่อนนัด หรือคำพิพากษาตามยอม เพื่อเรียกใช้งานได้สะดวกรวดเร็ว
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างเทมเพลตแรก</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl p-5 border border-purple-100/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">{tpl.title}</h3>
                  </div>
                  {tpl.category && (
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{tpl.category}</span>
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                  {tpl.content}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(tpl)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(tpl)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingId ? 'แก้ไขเทมเพลตย่อหน้า' : 'สร้างเทมเพลตย่อหน้าใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อเทมเพลต (สำหรับเลือกใช้งาน)
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="เช่น พิพากษาตามยอม, คำสั่งเลื่อนคดี"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมวดหมู่ (Category)
                </label>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="เช่น คำพิพากษา, คำสั่ง, ไต่สวนมูลฟ้อง"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เนื้อหาข้อความย่อหน้า
                </label>
                <textarea
                  rows={5}
                  required
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  placeholder="พิมพ์ข้อความย่อหน้า (ระบบจะจัดย่อหน้า 72pt ให้อัตโนมัติเมื่อนำไปสร้างเอกสาร)"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans leading-relaxed focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-60"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเทมเพลต'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
