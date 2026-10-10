'use client';

import React, { useState, useEffect } from 'react';
import {
  CaseFormData,
  formatAttendeesSummary,
  parseAttendeesList,
  positionsToSignatories,
} from '../../lib/excelParser';
import { fetchApi } from '../../lib/api';
import { showSuccess, showError, showToast } from '../../lib/sweetalert';
import {
  X,
  FileText,
  Download,
  CheckCircle,
  RefreshCw,
  Scale,
  Users,
  Plus,
  Trash2,
  Check,
  PenTool,
} from 'lucide-react';

const PRESET_ROLES = [
  'ทนายโจทก์',
  'โจทก์',
  'ทนายจำเลย',
  'จำเลย',
  'ผู้รับมอบอำนาจโจทก์',
  'ผู้รับมอบอำนาจจำเลย',
  'ผู้ร้อง',
  'ผู้คัดค้าน',
];

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: CaseFormData | null;
  templates: string[];
}

export function CaseFormModal({
  isOpen,
  onClose,
  initialData,
  templates,
}: CaseFormModalProps) {
  const [formData, setFormData] = useState<CaseFormData>({
    case_black_no: '',
    case_red_no: '',
    court_name: 'ศาลจังหวัดระยอง',
    date: '5',
    month: 'ตุลาคม',
    year: '2569',
    case_type: 'แพ่ง',
    plaintiff_name: '',
    defendant_name: '',
    hearing_time: '09.00',
    hearing_purpose: 'พิจารณา',
    attendees_summary: 'ทนายโจทก์ โจทก์ ทนายจำเลย และจำเลย',
    paragraphs: [''],
    judge_1_name: 'นาย สมศักดิ์ ยุติธรรม',
    judge_2_name: 'นางสาว ดวงใจ ซื่อตรง',
    judge_๑_name: 'นาย สมศักดิ์ ยุติธรรม',
    judge_๒_name: 'นางสาว ดวงใจ ซื่อตรง',
    signatories: [
      { position: 'ทนายโจทก์' },
      { position: 'โจทก์' },
      { position: 'ทนายจำเลย' },
      { position: 'จำเลย' }
    ],
  });

  const [customRoleInput, setCustomRoleInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setGeneratedBlobUrl(null);
    }
  }, [initialData]);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0] || 'รายงาน2356.docx');
    }
  }, [templates, selectedTemplate]);

  // Extract active positions from signatories or summary
  const currentPositions =
    Array.isArray(formData.signatories) && formData.signatories.length > 0
      ? formData.signatories.map((s) => s.position)
      : parseAttendeesList(formData.attendees_summary);

  const updatePositions = (newPositions: string[]) => {
    const summary = formatAttendeesSummary(newPositions);
    const sigs = positionsToSignatories(newPositions);
    setFormData((prev) => ({
      ...prev,
      attendees_summary: summary,
      signatories: sigs,
    }));
  };

  const handleTogglePreset = (role: string) => {
    if (currentPositions.includes(role)) {
      updatePositions(currentPositions.filter((r) => r !== role));
    } else {
      updatePositions([...currentPositions, role]);
    }
  };

  const handleAddCustomPosition = () => {
    if (!customRoleInput.trim()) return;
    const parsed = parseAttendeesList(customRoleInput);
    const combined = [...currentPositions];
    for (const p of parsed) {
      if (!combined.includes(p)) {
        combined.push(p);
      }
    }
    updatePositions(combined);
    setCustomRoleInput('');
  };

  const handleRemovePosition = (indexToRemove: number) => {
    const updated = currentPositions.filter((_, idx) => idx !== indexToRemove);
    updatePositions(updated);
  };

  if (!isOpen || !initialData) return null;

  const handleChange = (field: keyof CaseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.case_black_no) {
      showToast('กรุณาระบุเลขคดีดำ', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const templateToUse = selectedTemplate || templates[0] || 'รายงาน2356.docx';

      const res = await fetchApi(`/generate?template=${encodeURIComponent(templateToUse)}`, {
        method: 'POST',
        body: JSON.stringify({
          template: templateToUse,
          data: formData,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ message: res.statusText }));
        showError('ไม่สามารถสร้างเอกสารได้', errJson.message || 'เกิดข้อผิดพลาดในการประมวลผลเอกสาร');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Extract Thai filename from Content-Disposition header if available
      let outputName = `รายงาน_${formData.case_black_no.replace(/[\/\\]/g, '_')}.docx`;
      const disposition = res.headers.get('content-disposition');
      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
          try {
            outputName = decodeURIComponent(utf8Match[1]);
          } catch {}
        }
      }

      setGeneratedBlobUrl(url);
      setGeneratedFileName(outputName);

      showSuccess('สร้างเอกสารสำเร็จ!', 'สามารถกดดาวน์โหลดไฟล์ Word (.docx) ได้ทันที');
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedBlobUrl) return;
    const a = document.createElement('a');
    a.href = generatedBlobUrl;
    a.download = generatedFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('ดาวน์โหลดเอกสารเรียบร้อย');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-100 dark:border-slate-800 overflow-hidden my-8 transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">ตรวจสอบและสร้างเอกสารคดี</h3>
              <p className="text-xs text-purple-200">ตรวจสอบข้อมูล JSON ก่อนส่งไปเติมในไฟล์ Word Template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Template Selector */}
          <div className="bg-purple-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-purple-100 dark:border-slate-700">
            <label className="block text-xs font-bold text-purple-900 dark:text-purple-300 mb-1.5">
              เลือกไฟล์ Word Template ที่ต้องการใช้:
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              {templates.map((t) => (
                <option key={t} value={t} className="dark:bg-slate-800">
                  📄 {t}
                </option>
              ))}
            </select>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                เลขคดีดำ (case_black_no)
              </label>
              <input
                type="text"
                value={formData.case_black_no}
                onChange={(e) => handleChange('case_black_no', e.target.value)}
                placeholder="เช่น ผบ121/2569"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                เลขคดีแดง (case_red_no)
              </label>
              <input
                type="text"
                value={formData.case_red_no}
                onChange={(e) => handleChange('case_red_no', e.target.value)}
                placeholder="เช่น ผบ193/2569 หรือ /2569"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ศาล (court_name)
              </label>
              <input
                type="text"
                value={formData.court_name}
                onChange={(e) => handleChange('court_name', e.target.value)}
                placeholder="เช่น ศาลจังหวัดระยอง"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ประเภทคดี (case_type)
              </label>
              <input
                type="text"
                value={formData.case_type}
                onChange={(e) => handleChange('case_type', e.target.value)}
                placeholder="เช่น แพ่ง"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            {/* Date Details */}
            <div className="md:col-span-2 grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  วัน (date)
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  เดือน (month)
                </label>
                <input
                  type="text"
                  value={formData.month}
                  onChange={(e) => handleChange('month', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  ปี (year)
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                เวลา (hearing_time)
              </label>
              <input
                type="text"
                value={formData.hearing_time}
                onChange={(e) => handleChange('hearing_time', e.target.value)}
                placeholder="เช่น 09.00"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                โจทก์ / ผู้ร้อง (plaintiff_name)
              </label>
              <input
                type="text"
                value={formData.plaintiff_name}
                onChange={(e) => handleChange('plaintiff_name', e.target.value)}
                placeholder="เช่น นาย ก"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำเลย (defendant_name)
              </label>
              <textarea
                rows={2}
                value={formData.defendant_name}
                onChange={(e) => handleChange('defendant_name', e.target.value)}
                placeholder="เช่น บริษัท ก จำกัด ที่ 1 กับพวกรวม 3 คน"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                นัดมาทำไม (hearing_purpose)
              </label>
              <input
                type="text"
                value={formData.hearing_purpose || ''}
                onChange={(e) => handleChange('hearing_purpose', e.target.value)}
                placeholder="เช่น พิจารณา หรือ ไกล่เกลี่ย"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            {/* ผู้มาศาล และ ผู้ลงชื่อท้ายเอกสาร (กรอกทีเดียวเติมได้ 2 จุด) */}
            <div className="md:col-span-2 bg-purple-50/60 border border-purple-200 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-950">
                      ผู้มาศาล และ ผู้ลงชื่อท้ายเอกสาร (กรอกทีเดียวเติมได้ 2 ช่อง)
                    </h4>
                    <p className="text-xs text-purple-700/80">
                      กรอกหรือเลือกตำแหน่งด้านล่าง ระบบจะจัดรูปแบบสรุปในเนื้อหา และสร้างช่องลงชื่อท้ายเอกสารให้อัตโนมัติ
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-purple-200/80 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-300">
                  {currentPositions.length} ตำแหน่ง
                </span>
              </div>

              {/* Preset buttons */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">คลิกเพื่อเลือกตำแหน่งมาตรฐานด่วน:</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ROLES.map((role) => {
                    const isSelected = currentPositions.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleTogglePreset(role)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-400'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 text-purple-200" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPosition();
                    }
                  }}
                  placeholder="พิมพ์ตำแหน่งเพิ่มเติม เช่น ผู้รับมอบฉันทะ หรือพิมพ์หลายตำแหน่งคั่นด้วยเครื่องหมายจุลภาค"
                  className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPosition}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มตำแหน่ง</span>
                </button>
              </div>

              {/* Active position chips */}
              {currentPositions.length > 0 && (
                <div className="bg-white/90 dark:bg-slate-800/80 p-2.5 rounded-xl border border-purple-100 dark:border-slate-700 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">ลำดับตำแหน่ง:</span>
                  {currentPositions.map((pos, idx) => (
                    <span
                      key={`${pos}-${idx}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold"
                    >
                      <span className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{pos}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePosition(idx)}
                        className="text-purple-400 hover:text-red-600 transition-colors ml-0.5"
                        title="ลบออก"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dual preview outputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* 1. attendees_summary output */}
                <div className="bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-purple-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      ช่องที่ 1: ข้อความในเนื้อหา (attendees_summary)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.attendees_summary || ''}
                    onChange={(e) => {
                      const newSummary = e.target.value;
                      const parsed = parseAttendeesList(newSummary);
                      setFormData((prev) => ({
                        ...prev,
                        attendees_summary: newSummary,
                        signatories: positionsToSignatories(parsed),
                      }));
                    }}
                    placeholder="เช่น ทนายโจทก์ โจทก์ ทนายจำเลย และจำเลย"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    ✨ แสดงผลอัตโนมัติ: <span className="font-semibold text-purple-700 dark:text-purple-400">&ldquo;{formData.attendees_summary}&rdquo;</span>
                  </p>
                </div>

                {/* 2. signatories loop output */}
                <div className="bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-purple-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      ช่องที่ 2: ช่องลงชื่อท้ายเอกสาร (position loop)
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">1 ตำแหน่ง 1 ช่อง</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2.5 max-h-28 overflow-y-auto space-y-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    {Array.isArray(formData.signatories) && formData.signatories.length > 0 ? (
                      formData.signatories.map((sig, i) => (
                        <div key={i} className="flex items-center justify-start leading-tight py-0.5">
                          <span className="text-slate-400 dark:text-slate-600">........................................</span>
                          <span className="font-semibold text-purple-900 dark:text-purple-200 bg-purple-100/80 dark:bg-purple-950/60 px-2 py-0.2 rounded border border-purple-200 dark:border-purple-800 ml-2">
                            {sig.position}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs italic">ยังไม่มีตำแหน่งลงชื่อ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ผู้พิพากษาคนที่ 1 (judge_1_name / judge_๑_name)
              </label>
              <input
                type="text"
                value={formData.judge_1_name || ''}
                onChange={(e) => {
                  handleChange('judge_1_name', e.target.value);
                  handleChange('judge_๑_name', e.target.value);
                }}
                placeholder="เช่น นาย สมศักดิ์ ยุติธรรม"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ผู้พิพากษาคนที่ 2 (judge_2_name / judge_๒_name)
              </label>
              <input
                type="text"
                value={formData.judge_2_name || ''}
                onChange={(e) => {
                  handleChange('judge_2_name', e.target.value);
                  handleChange('judge_๒_name', e.target.value);
                }}
                placeholder="เช่น นางสาว ดวงใจ ซื่อตรง"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  เนื้อหาคำวินิจฉัย / ย่อหน้าเพิ่มเติม (paragraphs)
                </label>
                <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  ✨ ระบบจะใส่ย่อหน้าจริง (72pt / 1 นิ้ว) ให้เท่ากับย่อหน้าด้านบนอัตโนมัติ
                </span>
              </div>
              <textarea
                rows={4}
                value={Array.isArray(formData.paragraphs) ? formData.paragraphs.join('\n') : ''}
                onChange={(e) => {
                  const lines = e.target.value.split('\n');
                  setFormData((prev) => ({ ...prev, paragraphs: lines }));
                }}
                placeholder="พิมพ์ข้อความคำวินิจฉัยหรือกระบวนพิจารณา (แยกบรรทัดละ 1 ย่อหน้า ไม่ต้องเคาะ Spacebar เว้นวรรคข้างหน้า ระบบจะย่อหน้า 72pt ให้เท่ากับย่อหน้าด้านบนให้อัตโนมัติ)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none font-sans leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                💡 ข้อความแต่ละบรรทัดจะถูกนำไปสร้างเป็น 1 ย่อหน้าจริงใน Word โดยมีระยะย่อหน้าบรรทัดแรก (First Line Indent 72pt) และกระจายข้อความแบบไทย (Thai Distribute) เท่ากับย่อหน้าด้านบนทุกประการ
              </p>
            </div>
          </div>

          {/* JSON Live Preview */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 text-slate-300 border border-slate-800 font-mono text-xs">
            <p className="text-purple-400 font-semibold mb-1">📦 ข้อมูล JSON ที่จะถูกนำไปกรอกลงใน Word (.docx):</p>
            <pre className="overflow-x-auto text-[11px] leading-relaxed">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            ปิดหน้าต่าง
          </button>

          <div className="flex items-center gap-3">
            {generatedBlobUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์ Word (.docx)</span>
              </button>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-700/30 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างเอกสาร...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{generatedBlobUrl ? 'สร้างใหม่อีกครั้ง' : '🚀 สร้างเอกสาร Word (.docx)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
