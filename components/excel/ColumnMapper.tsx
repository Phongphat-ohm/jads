'use client';

import React from 'react';
import { ColumnMapping } from '../../lib/excelParser';
import { SlidersHorizontal, CheckCircle2 } from 'lucide-react';

interface ColumnMapperProps {
  headers: string[];
  mapping: ColumnMapping;
  onMappingChange: (newMapping: ColumnMapping) => void;
}

const FIELD_DEFINITIONS: { key: keyof ColumnMapping; label: string; desc: string; sample: string }[] = [
  { key: 'case_black_no', label: 'เลขคดีดำ (case_black_no)', desc: 'เลขประจำคดีดำ', sample: 'ผบ121/2569' },
  { key: 'case_red_no', label: 'เลขคดีแดง (case_red_no)', desc: 'เลขประจำคดีแดง', sample: 'ผบ193/2569 หรือ /2569' },
  { key: 'hearing_date', label: 'วันที่นัด (hearing_date)', desc: 'วันเดือนปีที่นัดพิจารณา', sample: '05 ต.ค. 69' },
  { key: 'hearing_time', label: 'เวลาที่นัด (hearing_time)', desc: 'เวลานัดพิจารณา', sample: '09.00' },
  { key: 'plaintiff_name', label: 'โจทก์ / ผู้ร้อง (plaintiff_name)', desc: 'ชื่อผู้ฟ้องหรือผู้ร้อง', sample: 'นาย ก' },
  { key: 'defendant_name', label: 'จำเลย (defendant_name)', desc: 'ชื่อจำเลยหรือผู้ถูกร้อง', sample: 'บริษัท ก จำกัด' },
  { key: 'case_type', label: 'ประเภทความ (case_type)', desc: 'ประเภทคดีความ (เช่น แพ่ง, อาญา, ผู้บริโภค - ไม่ใช่ข้อหาในเรื่อง)', sample: 'แพ่ง' },
  { key: 'court_name', label: 'ศาล (court_name)', desc: 'ศาลเจ้าของสำนวน', sample: 'ศาลจังหวัดระยอง' },
  { key: 'hearing_purpose', label: 'นัดมาทำไม (hearing_purpose)', desc: 'จุดประสงค์การนัด เช่น พิจารณา, ไต่สวนมูลฟ้อง', sample: 'พิจารณา' },
  { key: 'judge_name', label: 'องค์คณะผู้พิพากษา (judge_name)', desc: 'ชื่อผู้พิพากษา', sample: 'นายสมชาย ยุติธรรม' },
];

export function ColumnMapper({ headers, mapping, onMappingChange }: ColumnMapperProps) {
  const handleSelect = (fieldKey: keyof ColumnMapping, selectedHeader: string) => {
    onMappingChange({
      ...mapping,
      [fieldKey]: selectedHeader,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-purple-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">การตั้งค่าจับคู่คอลัมน์ (Custom Column Mapping)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">เลือกจับคู่หัวตารางจากไฟล์ Excel ของท่านเข้ากับตัวแปรสร้างเอกสาร</p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ตรวจจับคอลัมน์อัตโนมัติ</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {FIELD_DEFINITIONS.map((field) => (
          <div key={field.key} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={field.label}>
              {field.label}
            </label>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 truncate">เช่น {field.sample}</p>
            <select
              value={mapping[field.key] || ''}
              onChange={(e) => handleSelect(field.key, e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              <option value="" className="dark:bg-slate-800">-- ไม่ได้เลือก (ใช้ค่าว่าง) --</option>
              {headers.map((h) => (
                <option key={h} value={h} className="dark:bg-slate-800">
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
