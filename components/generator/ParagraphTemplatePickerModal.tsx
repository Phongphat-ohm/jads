'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Plus, FileText, Tag, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface ParagraphTemplateItem {
  id: string;
  title: string;
  content: string;
  category?: string | null;
}

interface ParagraphTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ParagraphTemplateItem[];
  onSelectTemplate: (content: string) => void;
}

export function ParagraphTemplatePickerModal({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: ParagraphTemplatePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set);
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory =
        selectedCategory === 'ALL' || t.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        t.title.toLowerCase().includes(term) ||
        t.content.toLowerCase().includes(term) ||
        (t.category && t.category.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-purple-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50/50 dark:from-slate-900 to-indigo-50/30 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-700/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">เลือกเทมเพลตย่อหน้าส่วนตัว</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เลือกข้อความย่อหน้าที่บันทึกไว้เพื่อนำไปแทรกในเอกสารคดี
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="relative">
            <Search className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อเทมเพลต หรือข้อความภายในย่อหน้า..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              autoFocus
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                ทั้งหมด ({templates.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Template Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y-0">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">ไม่พบเทมเพลตที่ตรงกับคำค้นหา</p>
              {templates.length === 0 && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  คุณยังไม่มีเทมเพลตย่อหน้าที่บันทึกไว้ สามารถเพิ่มเทมเพลตใหม่ได้ที่เมนูเทมเพลตย่อหน้าส่วนตัว
                </p>
              )}
            </div>
          ) : (
            filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="group p-4 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-purple-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-900 dark:group-hover:text-purple-300 transition-colors">
                      {t.title}
                    </h4>
                    {t.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold shrink-0">
                        <Tag className="w-3 h-3" />
                        <span>{t.category}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-sans">
                    {t.content}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(t.content);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เลือกใช้ย่อหน้านี้</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/paragraph-templates"
            className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-semibold"
          >
            <span>จัดการเทมเพลตย่อหน้าของฉัน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
