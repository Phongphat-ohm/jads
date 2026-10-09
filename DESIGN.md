# JADS Court Design System (DESIGN.md)

ระบบออกแบบและมาตรฐานส่วนประสานงานผู้ใช้สำหรับ **JADS (Judicial Automated Document System)**  
แนวทางการออกแบบมุ่งเน้น **"ความยุติธรรมอันสง่างามและทันสมัย" (Courtroom Dignity & Modern Justice)** สอดคล้องกับการใช้งานจริงของเจ้าหน้าที่ธุรการศาลและนิติกร

---

## 1. ปรัชญาและแนวคิดการออกแบบ (Design Philosophy)

1. **Dignity & Clarity (สง่างามและชัดเจน):** ใช้โทนสีม่วงสัญลักษณ์แห่งกระบวนการยุติธรรม ผสานกับพื้นหลังโทนสะอาด (Slate / White) เพื่อให้ข้อมูลคดีความอ่านง่าย ไม่รบกวนสายตา
2. **Deterministic Workflow (ขั้นตอนแม่นยำ ไม่สับสน):** กระบวนการสร้างเอกสารทำงานแบบ Linear Step-by-Step มีปุ่มและการ์ดบอกสถานะที่ชัดเจน ป้องกันการข้ามขั้นตอนหรือข้อมูลตกหล่น
3. **Accessibility & Ergonomics (เข้าถึงง่ายและคล่องตัว):** รองรับทั้งหน้าจอคอมพิวเตอร์ตั้งโต๊ะในห้องพิจารณาคดี แท็บเล็ต และสมาร์ทโฟน มีขนาดปุ่มกด (Touch Target) ไม่ต่ำกว่า 32–36px พร้อม Focus Ring ชัดเจนสำหรับคีย์บอร์ด

---

## 2. โทนสีและโทเคนสี (Color Tokens & Palette)

### 2.1 สีหลัก (Primary Justice Palette)
- **Primary Purple (สีม่วงความยุติธรรม):**
  - `purple-50`: `#FAF5FF` (พื้นหลังการ์ดหรือแถบเน้นข้อความ)
  - `purple-100`: `#F3E8FF` (เส้นขอบอ่อน / Badge พื้นหลัง)
  - `purple-200`: `#E9D5FF` (ปุ่มตัวเลขขั้นตอน / Icon highlight)
  - `purple-600`: `#9333EA` (Hover state / Secondary accents)
  - `purple-700`: `#7E22CE` (Primary Button / Active Tab / Brand Identity)
  - `purple-800`: `#6B21A8` (Active hover / หัวข้อเน้นหนัก)
  - `purple-950`: `#3B0764` (หัวข้อสำคัญ / Deep brand badge)

- **Justice Indigo Accent (สีอินดิโกสนับสนุน):**
  - `indigo-600`: `#4F46E5` (Gradient accents ผสมผสานบนไอคอนและโลโก้)

### 2.2 สีพื้นผิวและตัวอักษร (Surfaces & Neutrals)
- **Backgrounds:**
  - App Background: `slate-50` (`#F8FAFC`)
  - Dark Surface (Sidebar / Modals Backdrop): `slate-900` (`#0F172A`) / `slate-950` (`#020617`)
  - Card & Container Surface: `white` (`#FFFFFF`)
- **Borders:**
  - Card Border: `slate-200` (`#E2E8F0`) หรือ `purple-100` (`#F3E8FF`)
  - Dark Mode Border: `slate-800` (`#1E293B`)
- **Typography Colors:**
  - Main Heading / High Contrast Text: `slate-900` (`#0F172A`)
  - Body Text: `slate-700` (`#334155`)
  - Subtitle & Helper Text: `slate-500` (`#64748B`)
  - Sidebar Inactive Text: `slate-400` (`#94A3B8`)

### 2.3 สถานะและการแจ้งเตือน (Status & Alerts)
- **Success (สำเร็จ):** `emerald-600` (`#059669`) / `emerald-50` พื้นหลัง
- **Warning (เตือน):** `amber-500` (`#F59E0B`) / `amber-50` พื้นหลัง
- **Danger / Error (ข้อผิดพลาด/ลบ):** `rose-600` (`#E11D48`) / `rose-50` พื้นหลัง
- **Info (ข้อมูลทั่วไป):** `sky-600` (`#0284C7`) / `sky-50` พื้นหลัง

---

## 3. ระบบฟอนต์และตัวอักษร (Typography)

- **Font Family หลัก:** `Kanit` (Google Fonts) รองรับภาษาไทยและละตินอย่างสมบูรณ์
- **Hierarchy & Sizes:**
  - `Display / Page Title`: 24px–28px (`text-2xl` ถึง `text-3xl`), `font-bold`, `leading-tight`
  - `Section Title`: 18px–20px (`text-lg` ถึง `text-xl`), `font-bold`
  - `Card Header / Step Title`: 14px–16px (`text-sm` ถึง `text-base`), `font-semibold`
  - `Body / Form Label`: 13px–14px (`text-xs` ถึง `text-sm`), `font-normal` หรือ `font-medium`
  - `Caption / Badge / Helper`: 10px–12px (`text-[10px]` ถึง `text-xs`), `font-medium`
  - `Case Numbers & Codes`: `font-mono` สำหรับรหัสคดีความเพื่อความชัดเจนในการตรวจสอบ

---

## 4. มาตรฐานส่วนประกอบ (Component Specifications)

### 4.1 ปุ่ม (Buttons)
- **Primary Action (ปุ่มหลัก):**
  - Class: `px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-medium shadow-sm shadow-purple-600/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600`
- **Secondary / Ghost Button (ปุ่มรอง):**
  - Class: `px-4 py-2.5 bg-white hover:bg-purple-50 text-slate-700 border border-slate-200 hover:border-purple-300 rounded-xl font-medium transition-all`
- **Icon / Reorder Buttons (ปุ่มลูกศรและการดำเนินการย่อย):**
  - ขนาดขั้นต่ำ: `min-w-[32px] min-h-[32px] p-1.5`
  - Class: `flex items-center justify-center text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 disabled:opacity-20`

### 4.2 ช่องกรอกข้อมูล (Form Controls)
- **Input & Textarea:**
  - Class: `w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all`
- **Select Dropdown:**
  - สไตล์เดียวกับ Input พร้อม icon Chevron ขวามือ

### 4.3 โมดอลและลิ้นชักเมนู (Modals & Navigation Drawer)
- **Backdrop:** `fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50`
- **Modal Container:** `bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-purple-100 shadow-2xl`
- **Mobile Sidebar Drawer:**
  - ซ่อนในจอมือถือ (`-translate-x-full`) และสไลด์แสดงเมื่อกดปุ่ม Hamburger (`translate-x-0`) บน z-index ระดับ 50
  - มีปุ่มปิด (`X`) และปิดอัตโนมัติเมื่อกดเลือกเมนู

### 4.4 ขั้นตอนการสร้างเอกสาร (Linear Step Wizard)
- **Completed Step:** แสดงไอคอน Checkmark สีม่วงเข้ม พื้นหลังสีม่วงอ่อน
- **Active Step:** แถบสีม่วงเข้ม ตัวอักษรสีขาว โดดเด่น
- **Pending Step:** ข้อความสีเทา ไม่สามารถคลิกข้ามขั้นตอนได้จนกว่าขั้นตอนก่อนหน้าจะเสร็จสิ้น

---

## 5. การจัดรูปแบบการลงลายมือชื่อ (Signature Formatting Rules)
- การจัดตำแหน่งรายชื่อผู้มาศาลและลายมือชื่อท้ายคำคู่ความ / รายงานกระบวนพิจารณา:
  - กำหนดให้บรรทัดติดกัน (Single Line Spacing) ไม่เว้นบรรทัดว่าง
  - ตัวอย่าง:
    ```text
    ............................................................โจทก์
    ............................................................จำเลย
    ```

---

## 6. จุดตอบสนองหน้าจอ (Responsive Breakpoints)
- **Mobile (< 768px):** Hamburger menu, single-column forms, touch targets >= 32px
- **Tablet (768px - 1024px):** Fixed navigation, collapsible panels, 2-column forms
- **Desktop (>= 1024px):** Two-pane layout with persistent sidebar, table previews, and sticky action headers
