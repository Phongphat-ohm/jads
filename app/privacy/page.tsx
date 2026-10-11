import { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft, ShieldCheck, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy - PDPA) | JADS Court',
  description: 'นโยบายความเป็นส่วนตัวและการปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ของระบบ JADS Court',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-purple-700 dark:text-purple-400 font-bold hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <Scale className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                JADS Court
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                ระบบร่างและบริหารจัดการเอกสารคดี
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าแรก</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Hero Tag */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>มาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            (Privacy Policy for Judicial Automated Document System)
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            มีผลบังคับใช้ตั้งแต่วันที่ 11 ตุลาคม 2569 เป็นต้นไป | ปรับปรุงล่าสุด: 11 ตุลาคม 2569
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Highlight Overview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>หลักการคุ้มครองข้อมูลของ JADS</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ระบบ JADS ให้ความสำคัญอย่างสูงสุดต่อการคุ้มครองข้อมูลส่วนบุคคล (Personal Data) และข้อมูลความลับในสำนวนคดีความ
              นโยบายนี้จัดทำขึ้นตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
              เพื่อชี้แจงให้ท่านทราบถึงวิธีที่ระบบเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลของท่านและข้อมูลในกระบวนการพิจารณาคดี
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                1
              </span>
              ข้อมูลส่วนบุคคลที่ระบบเก็บรวบรวม
            </h2>
            <p>
              ระบบ JADS จำแนกประเภทของข้อมูลที่เกี่ยวข้องออกเป็น 2 ประเภทหลัก ได้แก่:
            </p>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">
                  1.1 ข้อมูลของผู้ใช้งานระบบ (User Account Data)
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                  <li>ชื่อ-นามสกุลจริง ของผู้ปฏิบัติงาน</li>
                  <li>ชื่อผู้ใช้งาน (Username) และรหัสผ่านที่ผ่านการเข้ารหัสทางเดียว (Bcrypt Hash)</li>
                  <li>ที่อยู่อีเมล (สำหรับการยืนยัน OTP รีเซ็ตรหัสผ่าน และการแจ้งเตือนความปลอดภัย)</li>
                  <li>ชื่อศาลหรือสังกัดหน่วยงานที่ปฏิบัติงาน</li>
                  <li>บันทึกการเข้าใช้งานระบบ (Audit Logs, IP Address, ชนิดเบราว์เซอร์, เวลาเข้าใช้งาน) เพื่อความปลอดภัย</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40">
                <h3 className="font-semibold text-slate-900 dark:text-white text-xs mb-1">
                  1.2 ข้อมูลที่ประมวลผลในเอกสารคดี (Case & Document Processing Data)
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                  <li>ข้อมูลตารางนัดคดี (เลขคดีดำ, เลขคดีแดง, วันเวลานัด, ฐานความผิด, ข้อหา)</li>
                  <li>ชื่อคู่ความ (โจทก์, จำเลย, ผู้ร้อง, ผู้คัดค้าน) และรายชื่อผู้มาศาล (ทนายความ, พยาน, ล่าม)</li>
                  <li>รายนามองค์คณะผู้พิพากษาและผู้พิพากษาประจำคดี</li>
                  <li>เทมเพลตและข้อความกระบวนพิจารณาที่ผู้ใช้จัดเก็บไว้ใช้งานซ้ำ</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                2
              </span>
              ฐานทางกฎหมายและวัตถุประสงค์ในการประมวลผลข้อมูล
            </h2>
            <p>ระบบประมวลผลข้อมูลส่วนบุคคลภายใต้ฐานความชอบธรรมด้วยกฎหมาย (Legal Basis) ตาม PDPA ดังนี้:</p>
            <ul className="space-y-2 list-disc pl-5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>ฐานการปฏิบัติตามหน้าที่ตามกฎหมายและภารกิจเพื่อประโยชน์สาธารณะ:</strong> เพื่อสนับสนุนการจัดทำเอกสารและคำสั่งในกระบวนการพิจารณาคดีของศาลยุติธรรมให้ถูกต้องตามระเบียบ
              </li>
              <li>
                <strong>ฐานความยินยอม (Consent):</strong> สำหรับการลงทะเบียนบัญชีผู้ใช้ การใช้อีเมลเพื่อยืนยันตัวตน OTP และการบันทึกการตั้งค่าส่วนบุคคล
              </li>
              <li>
                <strong>ฐานประโยชน์อันชอบธรรม (Legitimate Interest):</strong> เพื่อการรักษาความปลอดภัยของระบบ การตรวจสอบการเข้าถึงโดยมิชอบ (Audit Trail) และการพัฒนาประสิทธิภาพของระบบ
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                3
              </span>
              มาตรการรักษาความมั่นคงปลอดภัยของข้อมูล (Data Security)
            </h2>
            <p>ระบบ JADS ใช้มาตรการรักษาความปลอดภัยทั้งเชิงเทคนิคและการบริหารจัดการ ได้แก่:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  การเข้ารหัสข้อมูล (Encryption)
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  รับส่งข้อมูลผ่าน HTTPS (TLS 1.3) และเข้ารหัสผ่านด้วย Bcrypt มาตรฐานอุตสาหกรรม
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  การแยกส่วนข้อมูล (Data Isolation)
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  ไฟล์เอกสารและเทมเพลตถูกจัดเก็บแยกตามบัญชีผู้ใช้ เจ้าหน้าที่ศาลอื่นไม่สามารถเข้าถึงข้อมูลของท่านได้
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  บันทึกประวัติการใช้งาน (Audit Trail)
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  มีระบบ Audit Logs บันทึกการเข้าสู่ระบบ การสร้างเอกสาร และการแก้ไขเทมเพลตเพื่อตรวจสอบย้อนหลัง
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  การจัดการเซสชันปลอดภัย (Safe Session)
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  ระบบจับคู่คอมพิวเตอร์ Desktop มีอายุเซสชันจำกัด (Timeout) และยืนยันความถูกต้องผ่านรหัสชั่วคราว
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                4
              </span>
              ระยะเวลาในการเก็บรักษาข้อมูล (Retention Period)
            </h2>
            <ul className="space-y-2 list-disc pl-5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>ข้อมูลบัญชีผู้ใช้และเทมเพลต:</strong> จะถูกจัดเก็บไว้ตลอดระยะเวลาที่บัญชียังเปิดใช้งานอยู่ จนกว่าผู้ใช้จะส่งคำขอลบบัญชีออกจากระบบ
              </li>
              <li>
                <strong>ไฟล์ชั่วคราวและไฟล์แคชตารางนัด:</strong> ไฟล์เอกสารและไฟล์ Excel ที่อัปโหลดขึ้นเพื่อแปลงร่าง จะถูกลบตามรอบเวลา (Auto Purge) หรือผู้ใช้สามารถกดลบเองได้ทันทีในหน้าคลังไฟล์
              </li>
              <li>
                <strong>บันทึกประวัติ (Audit Logs):</strong> จัดเก็บเป็นระยะเวลาไม่เกิน 90 วัน เพื่อประโยชน์ในการตรวจสอบด้านความมั่นคงปลอดภัยตามกฎหมาย
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                5
              </span>
              สิทธิของเจ้าของข้อมูลส่วนบุคคล (Your Rights under PDPA)
            </h2>
            <p>ภายใต้กฎหมาย PDPA ท่านในฐานะเจ้าของข้อมูลส่วนบุคคลมีสิทธิดังต่อไปนี้:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong>1. สิทธิในการเข้าถึงและขอรับสำเนา:</strong> ขอตรวจสอบหรือขอรับสำเนาข้อมูลส่วนบุคคลของตนเอง
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong>2. สิทธิในการแก้ไขข้อมูล:</strong> แก้ไขชื่อ สังกัดศาล หรืออีเมลให้ถูกต้องเป็นปัจจุบันผ่านหน้า Settings
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong>3. สิทธิในการขอให้ลบหรือทำลาย:</strong> ขอลบบัญชี ข้อมูลส่วนบุคคล และไฟล์ทั้งหมดออกจากระบบ
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <strong>4. สิทธิในการเพิกถอนความยินยอม:</strong> ยกเลิกความยินยอมในการประมวลผลข้อมูลที่เคยให้ไว้ได้ตลอดเวลา
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                6
              </span>
              การใช้งานคุกกี้และเทคโนโลยีการจัดเก็บข้อมูล (Cookies & Local Storage)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ระบบ JADS ใช้ Cookies และ Local Storage ที่จำเป็นต่อการทำงานของระบบ (Strictly Necessary) เท่านั้น
              ได้แก่ โทเค็นสำหรับการยืนยันตัวตน (Authentication Token) เพื่อรักษาการเข้าสู่ระบบ
              และการจดจำการตั้งค่าธีมสว่าง/มืด (Theme Mode) ระบบไม่มีการใช้คุกกี้เพื่อการติดตามโฆษณา (Third-party Advertising Cookies) ใด ๆ ทั้งสิ้น
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                7
              </span>
              ช่องทางการติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO Contact)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              หากท่านประสงค์จะใช้สิทธิของเจ้าของข้อมูล หรือมีข้อสอบถามเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p><strong>ผู้ควบคุมข้อมูลส่วนบุคคล:</strong> นายพงษ์ภัทร เภสัชชะ (Phongphat Phesatcha)</p>
              <p><strong>ระบบ:</strong> JADS Court (Judicial Automated Document System)</p>
              <p><strong>ช่องทางติดต่อ:</strong> ผ่านทางระบบข้อเสนอแนะหรือผู้ดูแลระบบประจำศาล</p>
              <p><strong>ข้อกำหนดการให้บริการ:</strong> <Link href="/terms" className="text-purple-600 dark:text-purple-400 font-semibold underline">อ่านข้อกำหนดและเงื่อนไข (Terms of Service)</Link></p>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <Link
            href="/terms"
            className="text-purple-700 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1.5"
          >
            <span>&larr; อ่านข้อกำหนดและเงื่อนไขการใช้บริการ (Terms of Service)</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </main>
    </div>
  );
}
