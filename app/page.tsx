'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import {
  Scale,
  Download,
  ArrowRight,
  FileText,
  ShieldCheck,
  Sparkles,
  Laptop,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'JADS Court - ระบบสร้างและจัดการเอกสารคดีศาลอัตโนมัติ';
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      {/* Top Header / Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                JADS COURT
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-purple-400 font-medium">ระบบเอกสารคดีศาลยุติธรรม</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="#download"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดโปรแกรม</span>
            </a>

            {user ? (
              <Link
                href="/overview"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-900/40 transition-all hover:scale-[1.02]"
              >
                <span>เข้าสู่แผงควบคุม ({user.fullName || user.username})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-medium transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-900/40 transition-all hover:scale-[1.02]"
                >
                  <span>เริ่มต้นใช้งาน</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-medium shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>ระบบสนับสนุนงานคดีศาลยุติธรรมแห่งอนาคต</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-snug">
              ระบบสร้างและจัดการเอกสารคดีศาล
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200">
                สะดวกรวดเร็ว แม่นยำ และปลอดภัย
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              แปลงข้อมูลจากไฟล์ตารางเวรนัดคดีความ (Excel) สู่รายงานกระบวนพิจารณาและคำสั่งศาลในไม่กี่วินาที
              จัดรูปแบบลายมือชื่อคู่ความติดกันตามระเบียบศาล พร้อมระบบจัดการองค์คณะผู้พิพากษาและคลังเทมเพลตส่วนตัว
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href={user ? '/overview' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-semibold text-sm rounded-2xl shadow-xl shadow-purple-900/50 transition-all hover:scale-[1.02]"
              >
                <span>{user ? 'เข้าสู่แดชบอร์ดระบบ' : 'เข้าสู่ระบบ / ใช้งานบนเว็บ'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#download"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm rounded-2xl border border-slate-700 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>ดาวน์โหลดโปรแกรม Windows (.exe)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop App Spotlight Download Section */}
      <section id="download" className="py-16 bg-slate-950/60 border-y border-slate-800/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 rounded-3xl p-8 sm:p-12 border border-purple-800/40 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>JADS Desktop Application</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  ติดตั้งโปรแกรม JADS บนคอมพิวเตอร์ของคุณ
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  โปรแกรมทำงานแบบเต็มหน้าจอ (Fullscreen) ไร้แถบเมนูกวนใจ เชื่อมต่อกับระบบคลาวด์ศาล
                  ออกแบบเป็นพิเศษสำหรับการใช้งานบนคอมพิวเตอร์บัลลังก์และโต๊ะทำงานธุรการศาลโดยเฉพาะ
                </p>

                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>รองรับ Windows 10 &amp; 11 (64-bit)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ติดตั้งง่ายด้วยตัวติดตั้งอัตโนมัติ (Installer)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ทำงานเต็มหน้าจอพร้อมหน้าโหลดเฉพาะ</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center sm:items-start lg:items-end justify-center">
                <a
                  href="/downloads/JADS-Setup.exe"
                  download
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-purple-700 hover:bg-purple-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-purple-900/60 transition-all hover:scale-[1.03] group"
                >
                  <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  <div className="text-left">
                    <div className="text-sm font-bold">ดาวน์โหลดตัวติดตั้ง JADS</div>
                    <div className="text-[11px] font-normal text-purple-200">ไฟล์ JADS-Setup.exe (สำหรับ Windows)</div>
                  </div>
                </a>
                <a
                  href="/downloads/JADS-Portable.exe"
                  download
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline mt-2 text-center lg:text-right"
                >
                  หรือดาวน์โหลดเวอร์ชันพกพาไม่ต้องติดตั้ง (JADS-Portable.exe)
                </a>
                <p className="text-[11px] text-slate-500 mt-1 text-center lg:text-right">
                  ปลอดภัย ปราศจากมัลแวร์ • อัปเดตล่าสุด ตุลาคม 2569
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ฟังก์ชันการทำงานที่ครอบคลุมงานศาล
          </h2>
          <p className="text-slate-400 text-sm">
            พัฒนาจากความต้องการจริงของงานธุรการศาล ลดขั้นตอนที่ซ้ำซ้อน เพิ่มความรวดเร็วและความถูกต้อง 100%
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-purple-600/50 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-700/50 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ดึงข้อมูลจาก Excel อัตโนมัติ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              เพียงเลือกหรือลากวางไฟล์ตารางเวรนัดคดี ระบบจะตรวจจับเลขคดีดำ แดง ฐานความผิด โจทก์ จำเลย และผู้พิพากษาให้อัตโนมัติ
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-purple-600/50 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">จัดการคู่ผู้พิพากษาประจำบัลลังก์</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              บันทึกคู่ผู้พิพากษาประจำบัลลังก์ไว้ล่วงหน้า สลับเลือกใช้ได้ทันที ข้อมูลแยกตามผู้ใช้งานแบบเข้มงวด
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-purple-600/50 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-700/50 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">คลังเทมเพลตย่อหน้าส่วนบุคคล</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              บันทึกข้อความกระบวนพิจารณาที่ใช้บ่อย จัดหมวดหมู่ และกดแทรกเข้าสู่เอกสารได้ในคลิกเดียว
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl hover:border-purple-600/50 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ความปลอดภัยระดับสถาบันศาล</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              เข้ารหัสข้อมูลเส้นทางไฟล์ด้วย AES-256 บันทึก Audit Log ทุกกิจกรรม ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
            </p>
          </div>
        </div>
      </section>

      {/* Simple 3-step Workflow */}
      <section className="py-16 bg-slate-950/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-white">3 ขั้นตอนง่าย ๆ ในการสร้างเอกสาร</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-800/40 border border-purple-600/40 text-purple-300 font-bold text-lg flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="text-base font-semibold text-white">เลือกหรือวางไฟล์ Excel</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                รองรับไฟล์ตารางนัดทุกรูปแบบจากระบบของศาล ดึงข้อมูลขึ้นมาแสดงผลเป็นตารางทันที
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-800/40 border border-purple-600/40 text-purple-300 font-bold text-lg flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="text-base font-semibold text-white">เลือกคดีและตรวจทานเนื้อหา</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                ปรับปรุงข้อความกระบวนพิจารณา จัดลำดับผู้มาศาล และตรวจสอบรายชื่อคู่ผู้พิพากษา
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-800/40 border border-purple-600/40 text-purple-300 font-bold text-lg flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="text-base font-semibold text-white">ดาวน์โหลด Word หรือ PDF</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                สร้างเอกสารที่มีการจัดย่อหน้าและลายมือชื่ออย่างถูกต้อง พร้อมนำไปใช้งานหรือจัดพิมพ์ทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/80 border border-purple-700/50 flex items-center justify-center text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">JADS Court Document System</p>
              <p className="text-[10px] text-slate-500">ระบบบริหารจัดการและสร้างเอกสารคดีศาล</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center sm:text-right">
            &copy; 2026 JADS Court. All rights reserved. • พัฒนาเพื่อการอำนวยความยุติธรรม
          </p>
        </div>
      </footer>
    </div>
  );
}
