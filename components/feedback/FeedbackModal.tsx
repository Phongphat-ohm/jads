'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { showToast, showSuccess, showError } from '../../lib/sweetalert';
import {
  MessageSquarePlus,
  Star,
  X,
  Send,
  Bug,
  Lightbulb,
  FileText,
  MessageCircle,
  Loader2,
  CheckCircle2,
  Paperclip,
  Upload,
  File,
  Image,
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES = [
  {
    id: 'GENERAL_FEEDBACK',
    label: 'ข้อคิดเห็นทั่วไป',
    icon: MessageCircle,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'BUG',
    label: 'รายงานบั๊ก/ปัญหา',
    icon: Bug,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'FEATURE_REQUEST',
    label: 'ขอฟังก์ชันใหม่',
    icon: Lightbulb,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'TEMPLATE_ISSUE',
    label: 'ปัญหาแบบพิมพ์ศาล',
    icon: FileText,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const pathname = usePathname();
  const [type, setType] = useState('GENERAL_FEEDBACK');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError('ไฟล์มีขนาดใหญ่เกินไป', 'กรุณาแนบไฟล์ขนาดไม่เกิน 10MB');
      return;
    }

    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError('กรุณากรอกหัวข้อ', 'โปรดระบุหัวข้อความคิดเห็นสั้นๆ');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      showError('กรุณากรอกรายละเอียด', 'โปรดระบุรายละเอียดอย่างน้อย 5 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);
    try {
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;

      // 1. If file attached, upload first
      if (attachedFile) {
        const formData = new FormData();
        formData.append('file', attachedFile);
        const uploadRes = await apiClient.post('/feedbacks/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes.data?.success && uploadRes.data?.file) {
          attachmentUrl = uploadRes.data.file.url;
          attachmentName = uploadRes.data.file.originalName;
        } else {
          throw new Error(uploadRes.data?.message || 'ไม่สามารถอัปโหลดไฟล์แนบได้');
        }
      }

      // 2. Submit feedback record
      const res = await apiClient.post('/feedbacks', {
        type,
        rating,
        title: title.trim(),
        description: description.trim(),
        contactInfo: contactInfo.trim() || null,
        attachmentUrl,
        attachmentName,
        pageUrl: pathname || window.location.pathname,
        appVersion: 'v1.0.0',
      });

      if (res.data?.success) {
        showSuccess('ขอบคุณสำหรับข้อเสนอแนะ!', 'เราได้รับข้อมูลเรียบร้อยแล้วและจะนำไปปรับปรุงระบบต่อไป');
        setTitle('');
        setDescription('');
        setContactInfo('');
        setAttachedFile(null);
        setFilePreview(null);
        setRating(5);
        setType('GENERAL_FEEDBACK');
        onClose();
      } else {
        throw new Error(res.data?.message || 'ไม่สามารถส่งความคิดเห็นได้');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'เกิดข้อผิดพลาดในการส่งความคิดเห็น';
      showError('ส่งไม่สำเร็จ', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-purple-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">รับฟังความคิดเห็นและข้อเสนอแนะ</h3>
              <p className="text-xs text-purple-200">ช่วยเราพัฒนาระบบเอกสารศาล JADS ให้ดียิ่งขึ้น</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Star Rating */}
          <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              ความพึงพอใจในการใช้งานระบบโดยรวม
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
                    aria-label={`ให้คะแนน ${star} ดาว`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 block">
              {rating === 5 && 'ยอดเยี่ยมมาก ⭐⭐⭐⭐⭐'}
              {rating === 4 && 'ดีมาก ⭐⭐⭐⭐'}
              {rating === 3 && 'พอใช้ ⭐⭐⭐'}
              {rating === 2 && 'ต้องปรับปรุง ⭐⭐'}
              {rating === 1 && 'ควรแก้ไขอย่างยิ่ง ⭐'}
            </span>
          </div>

          {/* Feedback Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
              หมวดหมู่ความคิดเห็น
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FEEDBACK_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-600'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              หัวข้อความคิดเห็น <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ตัวหนังสือในไฟล์ Word ทับกัน, อยากให้เพิ่มฟังก์ชันค้นหาคดี"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all"
              maxLength={150}
              required
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              รายละเอียดและคำอธิบาย <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="อธิบายสิ่งที่คุณพบ ปัญหา หรือข้อเสนอแนะเพิ่มเติมอย่างละเอียด..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all resize-none"
              required
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 mt-1">
              <span>หน้าปัจจุบัน: {pathname || '/'}</span>
              <span>{description.length}/1000 ตัวอักษร</span>
            </div>
          </div>

          {/* Contact Info (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                ข้อมูลการติดต่อกลับ
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full font-medium border border-purple-200/50 dark:border-purple-800/50">
                ไม่บังคับ (Optional)
              </span>
            </div>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="เบอร์โทรศัพท์, อีเมล หรือ Line ID เพื่อให้เจ้าหน้าที่ติดต่อกลับ..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all"
              maxLength={100}
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">
              ระบุหากคุณยินดีให้ทีมงานติดต่อสอบถามรายละเอียดเพิ่มเติมหรือแจ้งผลการดำเนินการ
            </p>
          </div>

          {/* Attachment File / Screenshot (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>แนบภาพหน้าจอหรือไฟล์หลักฐาน (ภาพ/PDF/เอกสาร)</span>
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-400">ไม่เกิน 10MB</span>
            </div>

            {!attachedFile ? (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
                <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 mb-1 transition-colors" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  คลิกเพื่อเลือกไฟล์แนบ หรือลากไฟล์มาวางที่นี่
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                  รองรับ PNG, JPG, WEBP, PDF, DOCX, XLSX (สูงสุด 10MB)
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.docx,.xlsx,.doc,.txt"
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-purple-200 dark:border-purple-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 flex-shrink-0">
                      <File className="w-6 h-6" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {attachedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  title="ลบไฟล์แนบ"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-medium shadow-sm shadow-purple-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังส่ง...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งความคิดเห็น</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
