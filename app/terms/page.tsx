import { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft, Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '../../components/layout/ThemeToggle';

export const metadata: Metadata = {
  title: 'ข้อกำหนดและเงื่อนไขการใช้บริการ (Terms of Service) | JADS Court',
  description: 'ข้อกำหนด เงื่อนไข และระเบียบปฏิบัติในการเข้าใช้งานระบบบริหารจัดการเอกสารคดีความศาล (JADS)',
};

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>ระเบียบและข้อตกลงการใช้งานระบบ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            ข้อกำหนดและเงื่อนไขการใช้บริการ
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            (Terms of Service)
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            มีผลบังคับใช้ตั้งแต่วันที่ 11 ตุลาคม 2569 เป็นต้นไป | ปรับปรุงล่าสุด: 11 ตุลาคม 2569
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Notice Box */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <strong className="font-semibold text-purple-900 dark:text-purple-200 block mb-0.5">
                ข้อควรทราบสำหรับผู้ใช้งานในกระบวนการยุติธรรม
              </strong>
              ระบบ JADS (Judicial Automated Document System) ถูกพัฒนาขึ้นเพื่ออำนวยความสะดวกในการจัดเรียงและร่างเอกสารคดีความ
              การใช้งานระบบนี้ต้องอยู่ภายใต้ระเบียบข้อบังคับของสำนักงานศาลยุติธรรม กฎหมายว่าด้วยการคุ้มครองข้อมูลส่วนบุคคล (PDPA)
              และประมวลกฎหมายวิธีพิจารณาความที่เกี่ยวข้อง
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                1
              </span>
              บทนำและการยอมรับข้อกำหนด
            </h2>
            <p>
              ยินดีต้อนรับสู่ระบบบริหารจัดการเอกสารคดีศาล (JADS) ข้อกำหนดและเงื่อนไขนี้จัดทำขึ้นเพื่อกำหนดสิทธิ หน้าที่
              และความรับผิดชอบระหว่างผู้ให้บริการระบบ และผู้ใช้งาน (เจ้าหน้าที่ธุรการศาล นิติกร ผู้พิพากษา หรือบุคลากรผู้ได้รับมอบหมาย)
              การลงทะเบียน เข้าสู่ระบบ หรือใช้งานโปรแกรม JADS (ทั้งระบบ Web Application และ Desktop Application)
              ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงยินยอมผูกพันตามข้อกำหนดและเงื่อนไขฉบับนี้ทุกประการ
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                2
              </span>
              คุณสมบัติและการรักษาความปลอดภัยของบัญชีผู้ใช้
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                ผู้ใช้งานต้องเป็นบุคลากรหรือผู้มีหน้าที่ปฏิบัติงานเกี่ยวข้องกับสำนวนคดีและการร่างเอกสารคดีความ
              </li>
              <li>
                ผู้ใช้งานมีหน้าที่รักษาชื่อผู้ใช้ (Username) และรหัสผ่าน (Password) ไว้เป็นความลับสูงสุด
                ห้ามเปิดเผย ถ่ายโอน หรืออนุญาตให้บุคคลภายนอกนำบัญชีไปใช้งาน
              </li>
              <li>
                การกระทำใด ๆ ภายใต้บัญชีผู้ใช้งานของท่าน ให้ถือว่าเป็นการกระทำของท่านเอง
                หากพบว่ามีการเข้าถึงโดยมิชอบ ท่านต้องแจ้งให้ผู้ดูแลระบบทราบทันที
              </li>
              <li>
                ระบบรองรับการยืนยันตัวตนและการจับคู่อุปกรณ์ Desktop ด้วยรหัสผ่านและโทเค็นเข้ารหัสความปลอดภัยสูง (JWT/Encrypted Session)
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                3
              </span>
              ขอบเขตการใช้งานและข้อห้ามในการปฏิบัติ
            </h2>
            <p>ผู้ใช้งานตกลงว่าจะไม่กระทำการใด ๆ ที่ขัดต่อกฎหมายหรือขัดต่อศีลธรรมอันดี ดังต่อไปนี้:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  สิ่งที่พึงปฏิบัติ
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  ใช้ระบบเพื่อการร่างรายงานกระบวนพิจารณา เอกสารคดี ตรวจสอบข้อมูลนัด และจัดเก็บเทมเพลตข้อความตามระเบียบศาล
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ข้อห้ามโดยเด็ดขาด
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  ห้ามนำข้อมูลคดีความลับ หรือข้อมูลส่วนบุคคลของคู่ความไปเผยแพร่นอกเหนืออำนาจหน้าที่ราชการ และห้ามพยายามเจาะระบบหรือแทรกแซงความมั่นคงปลอดภัย
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
              ทรัพย์สินทางปัญญาและความเป็นเจ้าของข้อมูล
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>สิทธิ์ในระบบซอฟต์แวร์:</strong> ซอร์สโค้ด หน้าตาการออกแบบ สถาปัตยกรรมระบบ โลโก้ และอัลกอริทึม
                เป็นทรัพย์สินทางปัญญาของผู้พัฒนาระบบ JADS ได้รับการคุ้มครองตามกฎหมายว่าด้วยลิขสิทธิ์
              </li>
              <li>
                <strong>ความเป็นเจ้าของข้อมูลคดี:</strong> ไฟล์ตารางนัด รายชื่อคู่ความ บันทึกกระบวนพิจารณา และเอกสารสำนวนที่นำเข้าสู่ระบบ
                เป็นกรรมสิทธิ์ของหน่วยงานศาลและผู้ใช้งาน ระบบทำหน้าที่เป็นเครื่องมือประมวลผลตามคำสั่งของผู้ใช้เท่านั้น
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                5
              </span>
              การตรวจทานความถูกต้องและการจำกัดความรับผิด
            </h2>
            <p>
              ระบบ JADS ช่วยเพิ่มความรวดเร็วในการแปลงข้อมูลตารางนัด Excel ให้เป็นเอกสาร Word/PDF
              อย่างไรก็ดี <strong>ผู้ใช้งานมีหน้าที่ตรวจสอบความถูกต้องครบถ้วนของเนื้อหา เลขคดีดำ/แดง รายนามผู้พิพากษา และคำสั่งศาล</strong>
              ก่อนที่จะนำไปพิมพ์ ลงนาม หรือใช้ในกระบวนการพิจารณาคดีจริง
              ผู้พัฒนาระบบจะไม่รับผิดชอบต่อความผิดพลาดเชิงเนื้อหาที่เกิดจากการนำเข้าข้อมูลต้นทางที่ไม่ถูกต้องหรือการมิได้ตรวจทานเอกสารก่อนการนำไปใช้งาน
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                6
              </span>
              การระงับและการยกเลิกการใช้งาน
            </h2>
            <p>
              ผู้ให้บริการระบบขอสงวนสิทธิ์ในการระงับ พัก หรือยกเลิกบัญชีผู้ใช้งานได้ทันทีโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
              หากพบว่ามีการละเมิดข้อกำหนดนี้ พยายามกระทำการอันก่อให้เกิดความเสียหายต่อเสถียรภาพของระบบ
              หรือมีคำสั่งจากผู้มีอำนาจตามกฎหมาย
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs">
                7
              </span>
              การติดต่อและข้อพิพาท
            </h2>
            <p>
              ข้อกำหนดนี้อยู่ภายใต้การบังคับใช้และตีความตามกฎหมายแห่งราชอาณาจักรไทย
              หากมีคำถาม ข้อสงสัย หรือข้อขัดข้องเกี่ยวกับข้อกำหนดการให้บริการนี้ สามารถติดต่อผู้ดูแลระบบได้ที่:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p><strong>ผู้พัฒนาระบบ:</strong> พงษ์ภัทร เภสัชชะ (Phongphat Phesatcha)</p>
              <p><strong>ระบบ:</strong> JADS Court Document System</p>
              <p><strong>นโยบายความเป็นส่วนตัว:</strong> <Link href="/privacy" className="text-purple-600 dark:text-purple-400 font-semibold underline">อ่านนโยบายความเป็นส่วนตัว (PDPA)</Link></p>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <Link
            href="/privacy"
            className="text-purple-700 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1.5"
          >
            <span>อ่านนโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูล (Privacy Policy)</span>
            <span>&rarr;</span>
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
