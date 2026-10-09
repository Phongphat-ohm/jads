'use client';

import React from 'react';
import { CaseFormData } from '../../lib/excelParser';

interface A4DocumentPreviewProps {
  data: CaseFormData;
  templateName?: string;
}

export function A4DocumentPreview({ data, templateName }: A4DocumentPreviewProps) {
  const paragraphs = Array.isArray(data.paragraphs)
    ? data.paragraphs.flatMap((p) => String(p).split(/\r?\n/)).map((p) => p.trim()).filter(Boolean)
    : [];

  const signatories = Array.isArray(data.signatories) ? data.signatories : [];

  return (
    <div className="w-full flex justify-center py-2">
      {/* A4 Paper Container */}
      <div
        id="court-document-preview"
        className="w-full max-w-[794px] min-h-[1123px] bg-white text-black shadow-2xl rounded-sm p-12 md:p-16 border border-slate-300 print:shadow-none print:border-none print:p-8 font-serif leading-relaxed relative flex flex-col justify-between"
        style={{
          fontFamily: "'Sarabun', 'TH Sarabun New', 'TH SarabunPSK', 'Angsana New', 'Cordia New', serif",
          fontSize: '15.5pt',
          lineHeight: '1.45',
        }}
      >
        <div>
          {/* Header Section: Left (22), Center (Garuda), Right (Court info) */}
          <div className="grid grid-cols-3 items-start pb-4">
            {/* Left */}
            <div className="text-left leading-tight text-sm md:text-base text-slate-800">
              <p className="font-semibold">(๒๒)</p>
              <p>รายงาน</p>
              <p>กระบวน</p>
              <p>พิจารณา</p>
            </div>

            {/* Center Garuda Emblem */}
            <div className="flex flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/garuda.png"
                alt="ตราครุฑ ศาลยุติธรรม"
                className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-sm select-none"
              />
            </div>

            {/* Right: Case Numbers */}
            <div className="text-right text-xs md:text-sm space-y-1 text-slate-900">
              <p className="underline decoration-dotted font-medium">สำหรับศาลใช้</p>
              <p>
                <span className="text-slate-600">คดีหมายเลขดำที่</span>{' '}
                <span className="font-bold underline decoration-dotted px-1">
                  {data.case_black_no || 'ผบ.../2569'}
                </span>
              </p>
              <p>
                <span className="text-slate-600">คดีหมายเลขแดงที่</span>{' '}
                <span className="font-bold underline decoration-dotted px-1">
                  {data.case_red_no || '/2569'}
                </span>
              </p>
            </div>
          </div>

          {/* Court Name, Date, Case Type Center Block */}
          <div className="text-center my-3 space-y-1.5 text-sm md:text-base">
            <p>
              <span className="text-slate-700">ศาล</span>{' '}
              <span className="font-bold px-2 underline decoration-dotted">
                {data.court_name || 'ศาลจังหวัดระยอง'}
              </span>
            </p>
            <p>
              <span className="text-slate-700">วันที่</span>{' '}
              <span className="font-bold px-2 underline decoration-dotted">{data.date || '...'}</span>{' '}
              <span className="text-slate-700">เดือน</span>{' '}
              <span className="font-bold px-2 underline decoration-dotted">{data.month || '...'}</span>{' '}
              <span className="text-slate-700">พุทธศักราช</span>{' '}
              <span className="font-bold px-2 underline decoration-dotted">{data.year || '2569'}</span>
            </p>
            <p>
              <span className="text-slate-700">ความ</span>{' '}
              <span className="font-bold px-3 underline decoration-dotted">
                {data.case_type || 'แพ่ง'}
              </span>
            </p>
          </div>

          {/* Parties Section with Bracket */}
          <div className="my-5 border-t border-b border-slate-300 py-3 text-sm md:text-base">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium shrink-0">ระหว่าง</span>
              <div className="text-2xl font-light text-slate-400 select-none leading-none scale-y-150">
                &#123;
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-900">{data.plaintiff_name || '...'}</span>
                  <span className="font-medium text-slate-700">โจทก์</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">{data.defendant_name || '...'}</span>
                  <span className="font-medium text-slate-700">จำเลย</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hearing Header & Attendees */}
          <div className="my-3 space-y-2 text-sm md:text-base text-slate-900">
            <p className="text-justify leading-relaxed">
              <span>ผู้พิพากษาออกนั่งพิจารณาคดีนี้เวลา</span>{' '}
              <span className="font-bold px-1.5 underline decoration-dotted">
                {data.hearing_time || '09.00'}
              </span>{' '}
              <span>นาฬิกา</span>
            </p>
            <p className="text-justify leading-relaxed">
              <span>นัด</span>{' '}
              <span className="font-bold px-1.5 underline decoration-dotted">
                {data.hearing_purpose || 'พิจารณา'}
              </span>{' '}
              <span>วันนี้</span>{' '}
              <span className="font-bold px-1.5 underline decoration-dotted text-purple-950">
                {data.attendees_summary || 'ทนายโจทก์ โจทก์ ทนายจำเลย และจำเลย'}
              </span>{' '}
              <span>มาศาล</span>
            </p>
          </div>

          {/* Body Paragraphs with Real First-line Indent */}
          <div className="my-4 space-y-3 text-sm md:text-base text-slate-900 text-justify">
            {/* Paragraphs from Form */}
            {paragraphs.filter((p) => Boolean(p && p.trim())).length === 0 ? (
              <p className="text-slate-400 italic text-xs py-2 text-center">
                (ยังไม่มีเนื้อหาย่อหน้า - เพิ่มย่อหน้าหรือเลือกจากเทมเพลตได้ในแบบฟอร์ม)
              </p>
            ) : (
              paragraphs
                .filter((p) => Boolean(p && p.trim()))
                .map((p, idx) => (
                  <p
                    key={idx}
                    className="text-justify leading-relaxed text-slate-900"
                    style={{ textIndent: '4rem', textAlignLast: 'left' }}
                  >
                    {p}
                  </p>
                ))
            )}
          </div>
        </div>

        {/* Footer Section: Judges & Signatories */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-sm md:text-base space-y-4">
          {/* Judges Signature Line */}
          <div className="flex items-center justify-center gap-6 text-center text-slate-800">
            <p>
              ( <span className="font-bold text-slate-900">{data.judge_1_name || '........................................'}</span> )
            </p>
            {data.judge_2_name && (
              <p>
                ( <span className="font-bold text-slate-900">{data.judge_2_name}</span> )
              </p>
            )}
            <p className="font-semibold text-slate-700">บันทึก/อ่าน</p>
          </div>

          {/* Signatories Loop: บรรทัดติดกัน ไม่เว้นบรรทัด */}
          <div className="flex flex-col space-y-0.5 pt-1">
            {signatories.map((sig, idx) => (
              <div key={idx} className="flex items-center justify-start font-mono text-xs md:text-sm text-slate-700 py-0.5 leading-none">
                <span className="text-slate-400">....................................................</span>
                <span className="font-semibold text-slate-900 ml-2">{sig.position}</span>
              </div>
            ))}
          </div>

          {/* Watermark badge at bottom for print preview */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
            <span>แบบฟอร์มรายงานกระบวนพิจารณา ศาลยุติธรรม</span>
            <span>{templateName ? `Template: ${templateName}` : 'รายงาน2356.docx'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
