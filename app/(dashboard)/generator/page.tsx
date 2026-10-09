'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  parseExcelFile,
  guessColumnMapping,
  convertRowToFormData,
  formatAttendeesSummary,
  parseAttendeesList,
  positionsToSignatories,
  COMMON_CASE_TYPES,
  ColumnMapping,
  CaseFormData,
} from '../../../lib/excelParser';
import { ColumnMapper } from '../../../components/excel/ColumnMapper';
import { DataTablePreview } from '../../../components/excel/DataTablePreview';
import {
  ParagraphTemplatePickerModal,
  ParagraphTemplateItem,
} from '../../../components/generator/ParagraphTemplatePickerModal';
import { apiClient } from '../../../lib/api';
import { useAuth } from '../../../lib/authContext';
import { APP_CONFIG } from '../../../lib/config';
import { showToast, showError, showSuccess, showConfirm } from '../../../lib/sweetalert';
import {
  UploadCloud,
  FileSpreadsheet,
  Layers,
  Sparkles,
  FolderOpen,
  Cloud,
  Laptop,
  Clock,
  ArrowRight,
  ArrowLeft,
  HardDrive,
  X,
  CheckCircle2,
  Download,
  Scale,
  Users,
  Plus,
  Check,
  FileCheck2,
  Calendar,
  Building2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  BookmarkPlus,
  FileText,
  FileCode,
  RotateCcw,
  Tag,
  Lock,
} from 'lucide-react';

// Preset Attendee Roles
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

const DEFAULT_CASE_DATA: CaseFormData = {
  case_black_no: 'ผบ121/2569',
  case_red_no: 'ผบ193/2569',
  court_name: APP_CONFIG.DEFAULT_COURT,
  date: '5',
  month: 'ตุลาคม',
  year: '2569',
  case_type: 'แพ่ง',
  plaintiff_name: 'นาย ก',
  defendant_name: 'บริษัท ก จำกัด ที่ 1 กับพวกรวม 3 คน',
  hearing_time: '09.00',
  hearing_purpose: 'นัดฟังคำวินิจฉัยประธานศาลอุทธรณ์',
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
    { position: 'จำเลย' },
  ],
};

interface CloudFileItem {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface RecentFileItem {
  id: string;
  fileName: string;
  localPath: string;
  lastOpenedAt: string;
}

interface JudgePairItem {
  id: string;
  judge1Name: string;
  judge2Name: string;
  courtName?: string | null;
}

export type GeneratorTab = 'upload' | 'table' | 'review' | 'download';

function GeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Active Tab state
  const initialTab = (searchParams.get('tab') as GeneratorTab) || 'upload';
  const [activeTab, setActiveTab] = useState<GeneratorTab>(initialTab);

  // File & Excel parsing states
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    case_black_no: '',
    case_red_no: '',
    hearing_date: '',
    hearing_time: '',
    plaintiff_name: '',
    defendant_name: '',
    case_type: '',
    court_name: '',
    hearing_purpose: '',
    judge_name: '',
  });

  // Selected row from table
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);

  // Case Form Data (for Review & Generation)
  const [formData, setFormData] = useState<CaseFormData>(DEFAULT_CASE_DATA);

  // Templates & Judge pairs states
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('รายงาน2356.docx');
  const [judgePairs, setJudgePairs] = useState<JudgePairItem[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [paragraphTemplates, setParagraphTemplates] = useState<ParagraphTemplateItem[]>([]);

  // Cloud & Recent Files states
  const [cloudFiles, setCloudFiles] = useState<CloudFileItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>([]);
  const [isLoadingSavedFiles, setIsLoadingSavedFiles] = useState(false);

  // Upload Prompt Modal state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploadChoiceOpen, setIsUploadChoiceOpen] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Paragraph Template Picker Modal state
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  // Attendees Drag and Drop states
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [draggedAttendeeIdx, setDraggedAttendeeIdx] = useState<number | null>(null);
  const [dragOverAttendeeIdx, setDragOverAttendeeIdx] = useState<number | null>(null);

  // Document Generating states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingFormat, setGeneratingFormat] = useState<'docx' | 'pdf' | null>(null);

  useEffect(() => {
    document.title = 'สร้างเอกสารคดีความ | JADS Court';
    fetchInitialData();
    fetchSavedFiles();

    // Check if review case is saved in sessionStorage
    try {
      const stored = sessionStorage.getItem('jads_review_case');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed.paragraphs) || parsed.paragraphs.length === 0) {
          parsed.paragraphs = [''];
        }
        if (!parsed.court_name && user?.courtName) {
          parsed.court_name = user.courtName;
        }
        setFormData(parsed);
      } else if (user?.courtName) {
        setFormData((prev) => ({
          ...prev,
          court_name: prev.court_name && prev.court_name !== 'ศาลจังหวัดระยอง' ? prev.court_name : user.courtName || prev.court_name,
        }));
      }
    } catch (e) {
      console.error('Failed to load session case:', e);
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [resTpl, resJudges, resParas] = await Promise.all([
        apiClient.get('/templates').catch(() => ({ data: { templates: ['รายงาน2356.docx'] } })),
        apiClient.get('/judge-pairs').catch(() => ({ data: { judgePairs: [] } })),
        apiClient.get('/paragraph-templates').catch(() => ({ data: { paragraphTemplates: [] } })),
      ]);

      const tList = resTpl.data.templates || [];
      setTemplates(tList);
      if (tList.length > 0) setSelectedTemplate(tList[0]);

      setJudgePairs(resJudges.data.judgePairs || []);
      setParagraphTemplates(resParas.data.paragraphTemplates || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const fetchSavedFiles = async () => {
    setIsLoadingSavedFiles(true);
    try {
      const [resCloud, resRecent] = await Promise.all([
        apiClient.get('/cloud-files').catch(() => ({ data: { cloudFiles: [] } })),
        apiClient.get('/recent-files').catch(() => ({ data: { data: [] } })),
      ]);
      setCloudFiles(resCloud.data.cloudFiles || []);
      setRecentFiles(resRecent.data.data || []);
    } catch (err) {
      console.error('Failed to load saved files:', err);
    } finally {
      setIsLoadingSavedFiles(false);
    }
  };

  // Called when user selects or drops a file
  const handleFileSelected = (file: File) => {
    setPendingFile(file);
    setIsUploadChoiceOpen(true);
  };

  // Upload to Cloud (S3)
  const handleConfirmCloudUpload = async () => {
    if (!pendingFile) return;
    setIsProcessingUpload(true);
    try {
      const form = new FormData();
      form.append('file', pendingFile);
      await apiClient.post('/cloud-files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await processAndLoadFile(pendingFile);
      showSuccess('อัปโหลดสำเร็จ!', `บันทึก "${pendingFile.name}" เข้าสู่ Cloud Storage เรียบร้อยแล้ว`);
      setIsUploadChoiceOpen(false);
      setPendingFile(null);
      fetchSavedFiles();
      setActiveTab('table');
    } catch (err: any) {
      showError('อัปโหลดล้มเหลว', err.response?.data?.message || err.message);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // Save as Local Recent File only
  const handleConfirmLocalSave = async () => {
    if (!pendingFile) return;
    setIsProcessingUpload(true);
    try {
      await apiClient.post('/recent-files', {
        fileName: pendingFile.name,
        localPath: `C:\\Users\\User\\Documents\\${pendingFile.name}`,
        fileType: 'xlsx',
      });

      await processAndLoadFile(pendingFile);
      showToast(`บันทึกประวัติไฟล์ "${pendingFile.name}" สำหรับเครื่องนี้เรียบร้อย`);
      setIsUploadChoiceOpen(false);
      setPendingFile(null);
      fetchSavedFiles();
      setActiveTab('table');
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.response?.data?.message || err.message);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleCancelUploadChoice = () => {
    setIsUploadChoiceOpen(false);
    setPendingFile(null);
    showToast('ยกเลิกการโหลดไฟล์');
  };

  // Parse Excel and load into state
  const processAndLoadFile = async (fileOrBuffer: File | ArrayBuffer, customName?: string) => {
    const { headers: extractedHeaders, rows: extractedRows } = await parseExcelFile(fileOrBuffer);
    const resolvedName = customName || (fileOrBuffer instanceof File ? fileOrBuffer.name : 'ตารางคดี.xlsx');

    setFileName(resolvedName);
    setHeaders(extractedHeaders);
    setRows(extractedRows);
    setSelectedRow(null);

    const autoMapping = guessColumnMapping(extractedHeaders);
    setMapping(autoMapping);

    showToast(`โหลดข้อมูลจาก "${resolvedName}" สำเร็จ (${extractedRows.length} คดี)`);
  };

  // Load a Cloud File directly from S3
  const handleOpenCloudFile = async (cf: CloudFileItem) => {
    try {
      showToast(`กำลังดึงไฟล์ "${cf.fileName}" จาก Cloud...`);
      const res = await apiClient.get(`/cloud-files/${cf.id}/download`, {
        responseType: 'arraybuffer',
      });
      await processAndLoadFile(res.data, cf.fileName);
      setActiveTab('table');
    } catch (err: any) {
      showError('ไม่สามารถดึงไฟล์ได้', err.response?.data?.message || err.message);
    }
  };

  // Handle row selection from Table
  const handleSelectRow = (row: Record<string, any>) => {
    setSelectedRow(row);
    const userCourt = user?.courtName || APP_CONFIG.DEFAULT_COURT;
    const converted = convertRowToFormData(row, mapping, userCourt);
    setFormData(converted);

    try {
      sessionStorage.setItem('jads_review_case', JSON.stringify(converted));
    } catch (e) {
      console.error('Failed to save selected case in sessionStorage:', e);
    }

    showToast(`เลือกข้อมูลคดี "${converted.case_black_no || 'ไม่ระบุ'}" เรียบร้อยแล้ว`);
    setActiveTab('review');
  };

  const handleFieldChange = (field: keyof CaseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ----------------------------------------------------
  // Attendees & Signatories management with Visual Slots
  // ----------------------------------------------------
  const currentPositions = useMemo(() => {
    if (Array.isArray(formData.signatories) && formData.signatories.length > 0) {
      return formData.signatories.map((s) => s.position);
    }
    return parseAttendeesList(formData.attendees_summary);
  }, [formData.signatories, formData.attendees_summary]);

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
      if (!combined.includes(p)) combined.push(p);
    }
    updatePositions(combined);
    setCustomRoleInput('');
  };

  const handleRemovePosition = (idx: number) => {
    const updated = currentPositions.filter((_, i) => i !== idx);
    updatePositions(updated);
  };

  const handleMovePosition = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= currentPositions.length) return;
    const reordered = [...currentPositions];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    updatePositions(reordered);
  };

  // DnD Handlers with clear Target feedback
  const handleDragStart = (idx: number) => {
    setDraggedAttendeeIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragOverAttendeeIdx !== idx) {
      setDragOverAttendeeIdx(idx);
    }
  };

  const handleDrop = (dropIdx: number) => {
    if (draggedAttendeeIdx !== null && draggedAttendeeIdx !== dropIdx) {
      handleMovePosition(draggedAttendeeIdx, dropIdx);
    }
    setDraggedAttendeeIdx(null);
    setDragOverAttendeeIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedAttendeeIdx(null);
    setDragOverAttendeeIdx(null);
  };

  // ----------------------------------------------------
  // Judges Quorum Selection
  // ----------------------------------------------------
  const handleSelectJudgePair = (pairId: string) => {
    setSelectedPairId(pairId);
    if (!pairId) return;

    const pair = judgePairs.find((p) => p.id === pairId);
    if (pair) {
      setFormData((prev) => ({
        ...prev,
        judge_1_name: pair.judge1Name,
        judge_2_name: pair.judge2Name,
        judge_๑_name: pair.judge1Name,
        judge_๒_name: pair.judge2Name,
        ...(pair.courtName && { court_name: pair.courtName }),
      }));
      showToast(`เลือกองค์คณะ: ${pair.judge1Name} และ ${pair.judge2Name}`);
    }
  };

  // ----------------------------------------------------
  // Dynamic 1 Box / 1 Paragraph Management
  // ----------------------------------------------------
  const paragraphsList = Array.isArray(formData.paragraphs) ? formData.paragraphs : [''];

  const handleParagraphChange = (index: number, value: string) => {
    const updated = [...paragraphsList];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, paragraphs: updated }));
  };

  const handleAddParagraph = (text = '') => {
    setFormData((prev) => ({
      ...prev,
      paragraphs: [...(Array.isArray(prev.paragraphs) ? prev.paragraphs : []), text],
    }));
  };

  const handleRemoveParagraph = (index: number) => {
    if (paragraphsList.length <= 1) {
      setFormData((prev) => ({ ...prev, paragraphs: [''] }));
      return;
    }
    const updated = paragraphsList.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, paragraphs: updated }));
  };

  const handleMoveParagraph = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= paragraphsList.length) return;
    const updated = [...paragraphsList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFormData((prev) => ({ ...prev, paragraphs: updated }));
  };

  const handleInsertTemplate = (tplContent: string) => {
    handleAddParagraph(tplContent);
    showToast('แทรกย่อหน้าจากเทมเพลตเรียบร้อย');
  };

  const handleSaveParagraphAsTemplate = async (content: string) => {
    if (!content.trim()) {
      showToast('กรุณากรอกข้อความก่อนบันทึกเป็นเทมเพลต', 'warning');
      return;
    }

    try {
      const title = content.substring(0, 30).trim() + (content.length > 30 ? '...' : '');
      const res = await apiClient.post('/paragraph-templates', {
        title,
        content: content.trim(),
        category: 'คำพิพากษา',
      });
      showSuccess('สำเร็จ', 'บันทึกย่อหน้านี้เป็นเทมเพลตส่วนตัวเรียบร้อย');
      if (res.data.paragraphTemplate) {
        setParagraphTemplates((prev) => [res.data.paragraphTemplate, ...prev]);
      }
    } catch (err: any) {
      showError('เกิดข้อผิดพลาด', err.response?.data?.message || err.message);
    }
  };

  // ----------------------------------------------------
  // Document Generation & Download (DOCX & PDF)
  // ----------------------------------------------------
  const handleDownload = async (format: 'docx' | 'pdf') => {
    if (!formData.case_black_no) {
      showToast('กรุณาระบุเลขคดีดำ', 'warning');
      setActiveTab('review');
      return;
    }

    setIsGenerating(true);
    setGeneratingFormat(format);
    try {
      const tName = selectedTemplate || 'รายงาน2356.docx';
      const res = await apiClient.post(
        `/generate?template=${encodeURIComponent(tName)}&format=${format}`,
        {
          template: tName,
          format,
          data: formData,
        },
        {
          responseType: 'blob',
        }
      );

      const mimeType =
        format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      let filename = `รายงาน_${formData.case_black_no.replace(/[\/\\]/g, '_')}.${format}`;
      const disposition = res.headers['content-disposition'];
      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
          try {
            filename = decodeURIComponent(utf8Match[1]);
          } catch {}
        }
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showSuccess(
        'ดาวน์โหลดสำเร็จ!',
        `เอกสาร ${format.toUpperCase()} "${filename}" พร้อมใช้งานเรียบร้อยแล้ว`
      );
    } catch (err: any) {
      let errorMsg = err.message || 'ไม่สามารถสร้างเอกสารได้';
      if (err.response?.data) {
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const parsed = JSON.parse(text);
            errorMsg = parsed.error || parsed.message || text;
          } catch {
            // keep default errorMsg
          }
        } else if (typeof err.response.data === 'string') {
          try {
            const parsed = JSON.parse(err.response.data);
            errorMsg = parsed.error || parsed.message || err.response.data;
          } catch {
            errorMsg = err.response.data;
          }
        } else if (err.response.data.error || err.response.data.message) {
          errorMsg = err.response.data.error || err.response.data.message;
        }
      }
      showError('เกิดข้อผิดพลาดในการสร้างเอกสาร', errorMsg);
    } finally {
      setIsGenerating(false);
      setGeneratingFormat(null);
    }
  };

  // ----------------------------------------------------
  // Strict Linear Step Progression Guards
  // ----------------------------------------------------
  const isStep1Done = rows.length > 0 && !!fileName;
  const isStep2Done = isStep1Done && !!selectedRow;
  const isStep3Done = isStep2Done && Boolean(formData.case_black_no && formData.case_black_no.trim().length > 0);

  // Tab change handler strictly enforcing one step at a time
  const handleTabClick = (targetTab: GeneratorTab) => {
    if (targetTab === 'table' && !isStep1Done) {
      showToast('กรุณาอัปโหลดหรือเลือกไฟล์ Excel ก่อนไปยังขั้นตอนที่ 2', 'warning');
      return;
    }
    if (targetTab === 'review' && !isStep2Done) {
      showToast('กรุณาเลือกข้อมูลคดีจากตารางก่อนไปยังขั้นตอนที่ 3', 'warning');
      return;
    }
    if (targetTab === 'download' && !isStep3Done) {
      showToast('กรุณาตรวจสอบและระบุหมายเลขคดีดำให้ถูกต้องก่อนไปยังขั้นตอนที่ 4', 'warning');
      return;
    }
    setActiveTab(targetTab);
  };

  // Ensure activeTab never jumps ahead of completed steps
  useEffect(() => {
    if (activeTab === 'download' && !isStep3Done) {
      if (isStep2Done) setActiveTab('review');
      else if (isStep1Done) setActiveTab('table');
      else setActiveTab('upload');
    } else if (activeTab === 'review' && !isStep2Done) {
      if (isStep1Done) setActiveTab('table');
      else setActiveTab('upload');
    } else if (activeTab === 'table' && !isStep1Done) {
      setActiveTab('upload');
    }
  }, [activeTab, isStep1Done, isStep2Done, isStep3Done]);

  // Tabs Configuration
  const tabs = [
    {
      id: 'upload' as GeneratorTab,
      step: 1,
      title: '1. เลือกไฟล์ / อัปโหลด',
      desc: 'อัปโหลด Excel หรือเลือกจาก Cloud',
      icon: UploadCloud,
      completed: isStep1Done,
      disabled: false,
    },
    {
      id: 'table' as GeneratorTab,
      step: 2,
      title: '2. เลือกข้อมูลในตาราง',
      desc: 'Filter, Sort, และเลือกคดี',
      icon: FileSpreadsheet,
      completed: isStep2Done,
      disabled: !isStep1Done,
    },
    {
      id: 'review' as GeneratorTab,
      step: 3,
      title: '3. ตรวจสอบและแก้ไขคดี',
      desc: 'ผู้มาศาล องค์คณะ และย่อหน้า',
      icon: Scale,
      completed: isStep3Done,
      disabled: !isStep2Done,
    },
    {
      id: 'download' as GeneratorTab,
      step: 4,
      title: '4. ดาวน์โหลดเอกสาร',
      desc: 'ส่งออกไฟล์ .docx หรือ .pdf',
      icon: Download,
      completed: false,
      disabled: !isStep3Done,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-purple-950 to-indigo-900 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-purple-950/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>UNIFIED COURT DOCUMENT WORKFLOW</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            ระบบสร้างและจัดการเอกสารคดีความ
          </h1>
          <p className="text-xs md:text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
            แปลงข้อมูลตารางนัดพิจารณาคดีจาก Excel สู่เอกสารศาลมาตรฐาน (.docx / .pdf) ครบวงจรในหน้าเดียว
          </p>
        </div>

        {/* Quick Status Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs">
          <div>
            <span className="text-purple-300 block text-[10px]">ไฟล์ที่ใช้งานอยู่:</span>
            <span className="font-bold text-white max-w-[160px] truncate block">
              {fileName || 'ยังไม่ได้เลือกไฟล์'}
            </span>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <div>
            <span className="text-purple-300 block text-[10px]">คดีที่เลือก:</span>
            <span className="font-bold text-amber-300 max-w-[120px] truncate block">
              {formData.case_black_no || 'ยังไม่ได้เลือก'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-3xl p-2.5 border border-purple-100 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all relative ${
                isActive
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/25 ring-2 ring-purple-600'
                  : tab.disabled
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border border-transparent'
                  : 'hover:bg-purple-50 text-slate-700 border border-slate-100 bg-white hover:border-purple-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.disabled
                    ? 'bg-slate-100 text-slate-400'
                    : tab.completed
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {tab.completed && !isActive ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : tab.disabled ? (
                  <Lock className="w-4 h-4 text-slate-400" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold block truncate">{tab.title}</span>
                  {tab.completed && !isActive && (
                    <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold">
                      เสร็จแล้ว
                    </span>
                  )}
                  {tab.disabled && (
                    <span className="shrink-0 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.2 rounded-full font-medium">
                      ล็อก
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] block truncate mt-0.5 ${
                    isActive ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {tab.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: เลือกไฟล์หรืออัปโหลด (Upload & Select File) */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Upload Dropzone Area */}
          <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-purple-200 hover:border-purple-500 transition-all text-center relative group shadow-sm bg-gradient-to-b from-purple-50/20 to-white">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md shadow-purple-100">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ลากและวางไฟล์ตารางนัดพิจารณา หรือคลิกเพื่อเลือกไฟล์
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  รองรับไฟล์ Excel (.xlsx, .xls) และไฟล์ CSV ทุกเวอร์ชัน
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-700/20 group-hover:bg-purple-800 transition-colors pointer-events-none"
                >
                  เลือกไฟล์จากเครื่อง
                </button>
              </div>
            </div>
          </div>

          {/* Quick Access Grid: Cloud Storage & Recent Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cloud Files (S3) */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Cloud Storage (S3)</h4>
                      <p className="text-[11px] text-slate-400">ไฟล์ที่ซิงค์บนคลาวด์ ดึงได้จากทุกอุปกรณ์</p>
                    </div>
                  </div>
                  <span className="text-[11px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md">
                    {cloudFiles.length} ไฟล์
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cloudFiles.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      ยังไม่มีไฟล์บน Cloud Storage
                    </div>
                  ) : (
                    cloudFiles.map((cf) => (
                      <div
                        key={cf.id}
                        onClick={() => handleOpenCloudFile(cf)}
                        className="group p-3 rounded-2xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileSpreadsheet className="w-4 h-4 text-purple-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-purple-900 block truncate">
                              {cf.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(cf.fileSize / 1024).toFixed(1)} KB • {new Date(cf.createdAt).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Files (Local History) */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">ประวัติเปิดไฟล์ล่าสุด</h4>
                      <p className="text-[11px] text-slate-400">ไฟล์ที่เปิดใช้งานเร็วๆ นี้บนเครื่องนี้</p>
                    </div>
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                    {recentFiles.length} ไฟล์
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {recentFiles.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      ยังไม่มีประวัติการเปิดไฟล์
                    </div>
                  ) : (
                    recentFiles.map((rf) => (
                      <div
                        key={rf.id}
                        className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Laptop className="w-4 h-4 text-slate-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-700 block truncate">
                              {rf.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              {rf.localPath}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {new Date(rf.lastOpenedAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column Mapping Section if file loaded */}
          {headers.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ตรวจสอบการจับคู่หัวคอลัมน์</h4>
                    <p className="text-xs text-slate-500">
                      ระบบตรวจจับคอลัมน์ที่สอดคล้องให้อัตโนมัติ สามารถปรับเปลี่ยนได้ตามต้องการ
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isStep1Done}
                  onClick={() => setActiveTab('table')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                    isStep1Done
                      ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-700/20 hover:scale-105 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>ถัดไป: เลือกข้อมูลในตาราง</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <ColumnMapper
                headers={headers}
                mapping={mapping}
                onMappingChange={setMapping}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: เลือกข้อมูลในตาราง (DataTable with Filter, Sort, Pagination) */}
      {/* ========================================================================= */}
      {activeTab === 'table' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {rows.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-sm space-y-4">
              <FileSpreadsheet className="w-12 h-12 text-purple-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">ยังไม่มีข้อมูลตารางคดี</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                กรุณาอัปโหลดหรือเลือกไฟล์ Excel ในแท็บที่ 1 ก่อนเข้าสู่การเลือกข้อมูล
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-700/20"
              >
                ย้อนกลับไปแท็บเลือกไฟล์
              </button>
            </div>
          ) : (
            <>
              <DataTablePreview
                headers={headers}
                rows={rows}
                mapping={mapping}
                fileName={fileName}
                selectedRow={selectedRow}
                onSelectRow={handleSelectRow}
              />

              {/* Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ย้อนกลับ: ตัวเลือกไฟล์</span>
                </button>

                <div className="flex items-center gap-3">
                  {!isStep2Done && (
                    <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-medium">
                      ⚠️ กรุณาคลิกปุ่ม &quot;เลือกข้อมูลคดีนี้&quot; ในตารางก่อนเพื่อดำเนินการต่อ
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={!isStep2Done}
                    onClick={() => setActiveTab('review')}
                    className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isStep2Done
                        ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20 hover:scale-105 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>ถัดไป: ตรวจสอบและแก้ไขข้อมูลคดี</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ตรวจสอบและแก้ไขข้อมูลคดี (Case Review, Enhanced DnD, Template Modal) */}
      {/* ========================================================================= */}
      {activeTab === 'review' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar with Case Identity */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white flex items-center justify-center shadow-md">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    ข้อมูลคดี: หมายเลขดำที่ {formData.case_black_no || '-'}
                  </h3>
                  {formData.case_red_no && (
                    <span className="text-xs bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-200">
                      แดงที่ {formData.case_red_no}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {formData.court_name || 'ศาลยุติธรรม'} • {formData.case_type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>เปลี่ยนคดีจากตาราง</span>
              </button>
              <button
                type="button"
                disabled={!isStep3Done}
                onClick={() => setActiveTab('download')}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isStep3Done
                    ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20 hover:scale-105 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={!isStep3Done ? 'กรุณาระบุเลขคดีดำให้ถูกต้องก่อนดำเนินการต่อ' : ''}
              >
                <span>ถัดไป: ดาวน์โหลดเอกสาร</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section 1: General Case Fields */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">1. ข้อมูลทั่วไปของคดี</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ศาล (court_name)
                </label>
                <input
                  type="text"
                  value={formData.court_name}
                  onChange={(e) => handleFieldChange('court_name', e.target.value)}
                  placeholder="เช่น ศาลจังหวัดระยอง, ศาลแขวงดอนเมือง"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเลขคดีดำ (case_black_no)
                </label>
                <input
                  type="text"
                  value={formData.case_black_no}
                  onChange={(e) => handleFieldChange('case_black_no', e.target.value)}
                  placeholder="เช่น ผบ121/2569"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเลขคดีแดง (case_red_no)
                </label>
                <input
                  type="text"
                  value={formData.case_red_no}
                  onChange={(e) => handleFieldChange('case_red_no', e.target.value)}
                  placeholder="เช่น ผบ193/2569 หรือ /2569"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-red-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {/* Case Type & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ความ / ประเภทคดี (case_type)
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {COMMON_CASE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleFieldChange('case_type', type)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                        formData.case_type === type
                          ? 'bg-purple-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.case_type}
                  onChange={(e) => handleFieldChange('case_type', e.target.value)}
                  placeholder="เช่น แพ่ง, อาญา, ผู้บริโภค"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {/* Date Split */}
              <div className="md:col-span-2 grid grid-cols-3 gap-3 bg-purple-50/40 p-3 rounded-2xl border border-purple-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-center">วันที่</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    placeholder="เช่น 5"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-center font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-center">เดือน</label>
                  <input
                    type="text"
                    value={formData.month}
                    onChange={(e) => handleFieldChange('month', e.target.value)}
                    placeholder="เช่น ตุลาคม"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-center font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-center">พ.ศ.</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => handleFieldChange('year', e.target.value)}
                    placeholder="เช่น 2569"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-center font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เวลาที่นัด (hearing_time)
                </label>
                <input
                  type="text"
                  value={formData.hearing_time}
                  onChange={(e) => handleFieldChange('hearing_time', e.target.value)}
                  placeholder="เช่น 09.00"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  นัดมาทำไม (hearing_purpose)
                </label>
                <input
                  type="text"
                  value={formData.hearing_purpose}
                  onChange={(e) => handleFieldChange('hearing_purpose', e.target.value)}
                  placeholder="เช่น นัดฟังคำวินิจฉัยประธานศาลอุทธรณ์"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  โจทก์ / ผู้ร้อง (plaintiff_name)
                </label>
                <input
                  type="text"
                  value={formData.plaintiff_name}
                  onChange={(e) => handleFieldChange('plaintiff_name', e.target.value)}
                  placeholder="เช่น นาย สมชาย หรือ ธนาคาร..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  จำเลย (defendant_name)
                </label>
                <input
                  type="text"
                  value={formData.defendant_name}
                  onChange={(e) => handleFieldChange('defendant_name', e.target.value)}
                  placeholder="เช่น นาย สมศักดิ์ หรือ บริษัท..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Attendees with Visual DnD Slots */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  2. ผู้มาศาล และ ผู้ลงชื่อท้ายเอกสาร (ลากสลับช่อง หรือคลิกลูกศรขึ้น/ลง)
                </h4>
                <p className="text-xs text-slate-500">
                  จัดลำดับช่องลงชื่อท้ายเอกสารได้ทันที ระบบจะอัปเดตข้อความสรุปผู้มาศาลให้อัตโนมัติ
                </p>
              </div>
            </div>

            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-4">
              {/* Presets and Custom Input */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">เลือกตำแหน่งด่วน:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ROLES.map((role) => {
                    const isSelected = currentPositions.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleTogglePreset(role)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input */}
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
                  placeholder="พิมพ์ตำแหน่งเพิ่มเติม เช่น ผู้รับมอบฉันทะ หรือคั่นด้วยเครื่องหมายจุลภาค ,"
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPosition}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  เพิ่มตำแหน่ง
                </button>
              </div>

              {/* Visual Numbered Slots Grid with DnD and Arrow Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    ลำดับช่องลงชื่อท้ายเอกสาร ({currentPositions.length} ช่อง):
                  </span>
                  <span className="text-[11px] text-purple-700 font-semibold">
                    * ลากการ์ดไปยังช่องที่ต้องการ หรือคลิกปุ่มลูกศร ↑ ↓ เพื่อสลับลำดับ
                  </span>
                </div>

                {currentPositions.length === 0 ? (
                  <div className="py-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    ยังไม่มีตำแหน่งผู้มาศาล กรุณาคลิกเลือกตำแหน่งด่วนหรือพิมพ์เพิ่มด้านบน
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    {currentPositions.map((pos, idx) => {
                      const isDragged = draggedAttendeeIdx === idx;
                      const isOver = dragOverAttendeeIdx === idx && draggedAttendeeIdx !== idx;

                      return (
                        <div
                          key={`${pos}-${idx}`}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={() => handleDrop(idx)}
                          onDragEnd={handleDragEnd}
                          className={`relative p-3 rounded-2xl border transition-all cursor-grab active:cursor-grabbing select-none ${
                            isOver
                              ? 'bg-purple-100/90 border-purple-600 ring-2 ring-purple-600 ring-offset-2 scale-102 shadow-md'
                              : isDragged
                              ? 'opacity-30 bg-purple-50 border-purple-300 border-dashed scale-95'
                              : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'
                          }`}
                        >
                          {/* Drop Indicator Label when dragging over */}
                          {isOver && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-20 whitespace-nowrap animate-bounce">
                              ⬇ วางที่ช่องที่ {idx + 1}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                              <span>ช่องที่ {idx + 1}</span>
                            </span>

                            {/* Arrow Up / Down and Delete buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMovePosition(idx, idx - 1);
                                }}
                                className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg disabled:opacity-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                                title="เลื่อนไปช่องก่อนหน้า"
                              >
                                <ArrowLeft className="w-3.5 h-3.5 md:hidden" />
                                <ArrowLeft className="w-3.5 h-3.5 hidden md:inline" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === currentPositions.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMovePosition(idx, idx + 1);
                                }}
                                className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg disabled:opacity-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                                title="เลื่อนไปช่องถัดไป"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePosition(idx);
                                }}
                                className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                title="ลบออก"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-0.5">
                            <GripVertical className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {pos}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* attendees_summary synchronized text input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ข้อความสรุปผู้มาศาล (attendees_summary):
                </label>
                <input
                  type="text"
                  value={formData.attendees_summary}
                  onChange={(e) => {
                    const newSummary = e.target.value;
                    const parsed = parseAttendeesList(newSummary);
                    setFormData((prev) => ({
                      ...prev,
                      attendees_summary: newSummary,
                      signatories: positionsToSignatories(parsed),
                    }));
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Judges Quorum */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">3. องค์คณะผู้พิพากษา</h4>
                <p className="text-xs text-slate-500">เลือกคู่ผู้พิพากษาจากระบบเพื่อเติมชื่อทั้ง 2 ท่านอัตโนมัติ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-900 mb-1">
                  เลือกคู่ผู้พิพากษา (ดึงชื่ออัตโนมัติ)
                </label>
                <select
                  value={selectedPairId}
                  onChange={(e) => handleSelectJudgePair(e.target.value)}
                  className="w-full px-3.5 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="">-- เลือกคู่ผู้พิพากษา --</option>
                  {judgePairs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.judge1Name} / {p.judge2Name} {p.courtName ? `(${p.courtName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ผู้พิพากษาคนที่ 1 (judge_1_name)
                </label>
                <input
                  type="text"
                  value={formData.judge_1_name}
                  onChange={(e) => {
                    handleFieldChange('judge_1_name', e.target.value);
                    handleFieldChange('judge_๑_name', e.target.value);
                  }}
                  placeholder="เช่น นาย สมศักดิ์ ยุติธรรม"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ผู้พิพากษาคนที่ 2 (judge_2_name)
                </label>
                <input
                  type="text"
                  value={formData.judge_2_name}
                  onChange={(e) => {
                    handleFieldChange('judge_2_name', e.target.value);
                    handleFieldChange('judge_๒_name', e.target.value);
                  }}
                  placeholder="เช่น นางสาว ดวงใจ ซื่อตรง"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Paragraphs & Paragraph Template Modal Picker */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    4. เนื้อหาคำวินิจฉัย (1 ย่อหน้า / 1 ช่องข้อความ)
                  </h4>
                  <p className="text-xs text-slate-500">
                    ระบบจะขึ้นย่อหน้าจริง 72pt ในไฟล์ Word อัตโนมัติทุกช่อง
                  </p>
                </div>
              </div>

              {/* Action Buttons: [+ เลือกจากเทมเพลต] and [+ เพิ่มย่อหน้าเปล่า] */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplatePickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-102"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เลือกจากเทมเพลต</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddParagraph('')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มช่องย่อหน้า</span>
                </button>
              </div>
            </div>

            {/* List of Paragraph Boxes */}
            <div className="space-y-3.5">
              {paragraphsList.map((para, index) => (
                <div
                  key={index}
                  className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 transition-all hover:border-purple-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-purple-200 text-purple-900 text-[11px] flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span>ย่อหน้าที่ {index + 1}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveParagraph(index, index - 1)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === paragraphsList.length - 1}
                        onClick={() => handleMoveParagraph(index, index + 1)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-white rounded-lg transition-colors disabled:opacity-30"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveParagraphAsTemplate(para)}
                        className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
                        title="บันทึกข้อความนี้เป็นเทมเพลตส่วนตัว"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(index)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบย่อหน้านี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={para}
                    onChange={(e) => handleParagraphChange(index, e.target.value)}
                    placeholder={`กรอกเนื้อหาย่อหน้าที่ ${index + 1}...`}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs leading-relaxed font-sans text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับ: ตารางข้อมูลคดี</span>
            </button>

            <div className="flex items-center gap-3">
              {!isStep3Done && (
                <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 font-medium">
                  ⚠️ กรุณากรอกหมายเลขคดีดำก่อนดาวน์โหลด
                </span>
              )}
              <button
                type="button"
                disabled={!isStep3Done}
                onClick={() => setActiveTab('download')}
                className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isStep3Done
                    ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20 hover:scale-105 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span>ถัดไป: สรุปและดาวน์โหลดเอกสาร</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ดาวน์โหลดเอกสาร (Download DOCX & PDF) */}
      {/* ========================================================================= */}
      {activeTab === 'download' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Overview Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white flex items-center justify-center shadow-md">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">สรุปข้อมูลและดาวน์โหลดเอกสารคดี</h3>
                  <p className="text-xs text-slate-500">
                    เลือกรูปแบบไฟล์เอกสารที่ต้องการ (.docx สำหรับ Word หรือ .pdf สำหรับพิมพ์และเผยแพร่)
                  </p>
                </div>
              </div>

              {/* Template Selector */}
              {templates.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">แบบฟอร์ม:</span>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-purple-900 focus:outline-none"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Case Details Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border border-purple-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">หมายเลขคดีดำ</span>
                <span className="text-sm font-extrabold text-purple-900 block truncate">
                  {formData.case_black_no || '-'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">หมายเลขคดีแดง</span>
                <span className="text-sm font-extrabold text-red-800 block truncate">
                  {formData.case_red_no || '-'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">ศาลที่สังกัด</span>
                <span className="text-sm font-extrabold text-slate-800 block truncate">
                  {formData.court_name || '-'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">วันที่นัดพิจารณา</span>
                <span className="text-sm font-extrabold text-slate-800 block truncate">
                  {formData.date} {formData.month} {formData.year}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">โจทก์</span>
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {formData.plaintiff_name || '-'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">จำเลย</span>
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {formData.defendant_name || '-'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">ผู้ลงชื่อท้ายเอกสาร</span>
                <span className="text-xs font-bold text-purple-700 block truncate">
                  {currentPositions.length} ตำแหน่ง
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">จำนวนย่อหน้า</span>
                <span className="text-xs font-bold text-purple-700 block truncate">
                  {paragraphsList.length} ย่อหน้า
                </span>
              </div>
            </div>

            {/* Big Action Download Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Option 1: DOCX Word */}
              <div className="p-6 rounded-3xl border-2 border-purple-200 bg-white hover:border-purple-600 transition-all shadow-sm flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">เอกสาร Microsoft Word (.docx)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    สร้างไฟล์รายงานกระบวนพิจารณา (.docx) สำหรับนำไปเปิดแก้ไขเพิ่มเติมใน Microsoft Word ได้อย่างอิสระ
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleDownload('docx')}
                  className="w-full py-3.5 px-6 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-700/20 flex items-center justify-center gap-2 transition-all group-hover:scale-102"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isGenerating && generatingFormat === 'docx'
                      ? 'กำลังสร้างไฟล์ Word...'
                      : 'ดาวน์โหลดไฟล์ Word (.docx)'}
                  </span>
                </button>
              </div>

              {/* Option 2: PDF Adobe */}
              <div className="p-6 rounded-3xl border-2 border-indigo-200 bg-white hover:border-indigo-600 transition-all shadow-sm flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">เอกสารแบบพร้อมพิมพ์ PDF (.pdf)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    แปลงเป็นไฟล์ PDF โดยตรงผ่าน Microsoft Word Engine ตราครุฑ ฟอนต์ และการจัดหน้ากระดาษตรงตามแบบศาล 100%
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleDownload('pdf')}
                  className="w-full py-3.5 px-6 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-700/20 flex items-center justify-center gap-2 transition-all group-hover:scale-102"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isGenerating && generatingFormat === 'pdf'
                      ? 'กำลังแปลงและสร้าง PDF...'
                      : 'ดาวน์โหลดไฟล์ PDF (.pdf)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับไปแก้ไขข้อมูลคดี</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>สร้างเอกสารคดีอื่นต่อจากตาราง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Upload Choice Modal (Cloud S3 vs Local Save) */}
      {/* ========================================================================= */}
      {isUploadChoiceOpen && pendingFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCancelUploadChoice}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-purple-100 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">เลือกพื้นที่จัดเก็บไฟล์</h3>
                  <p className="text-xs text-slate-500 font-mono truncate max-w-[240px]">
                    {pendingFile.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelUploadChoice}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                aria-label="ปิดและยกเลิก"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ท่านต้องการอัปโหลดไฟล์นี้ขึ้นระบบ Cloud เพื่อให้สามารถเปิดใช้งานได้จากทุกที่ หรือต้องการบันทึกเป็นประวัติเฉพาะบนเครื่องนี้?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                disabled={isProcessingUpload}
                onClick={handleConfirmCloudUpload}
                className="p-5 rounded-2xl border-2 border-purple-500 bg-purple-50/50 hover:bg-purple-100/60 text-left transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Cloud className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-purple-950">อัปโหลดเข้า Cloud (S3)</h4>
                <p className="text-[11px] text-purple-800/80 leading-relaxed">
                  ปลอดภัย แยกข้อมูลเฉพาะคุณ เข้าถึงได้จากทุกอุปกรณ์
                </p>
              </button>

              <button
                type="button"
                disabled={isProcessingUpload}
                onClick={handleConfirmLocalSave}
                className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-left transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Laptop className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">บันทึกเฉพาะเครื่องนี้</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  บันทึกลงรายการเปิดล่าสุด ทำงานรวดเร็วในเครื่องปัจจุบัน
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Paragraph Template Picker Modal */}
      {/* ========================================================================= */}
      <ParagraphTemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        templates={paragraphTemplates}
        onSelectTemplate={handleInsertTemplate}
      />
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลด...</div>}>
      <GeneratorContent />
    </Suspense>
  );
}
