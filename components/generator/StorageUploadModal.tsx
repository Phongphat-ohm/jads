'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Cloud,
  Laptop,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { apiClient } from '../../lib/api';

export interface StorageUploadModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onSuccessCloud: (file: File) => Promise<void> | void;
  onSuccessLocal: (file: File) => Promise<void> | void;
}

type StorageService = 'cloud' | 'local';
type ModalStep = 'select' | 'uploading' | 'completed' | 'error';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function StorageUploadModal({
  isOpen,
  file,
  onClose,
  onSuccessCloud,
  onSuccessLocal,
}: StorageUploadModalProps) {
  const [selectedService, setSelectedService] = useState<StorageService>('cloud');
  const [step, setStep] = useState<ModalStep>('select');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmittingLocal, setIsSubmittingLocal] = useState<boolean>(false);

  // Reset state whenever modal is opened with a new file
  useEffect(() => {
    if (isOpen && file) {
      setSelectedService('cloud');
      setStep('select');
      setUploadProgress(0);
      setUploadedBytes(0);
      setTotalBytes(file.size || 0);
      setErrorMessage('');
      setIsSubmittingLocal(false);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleConfirm = async () => {
    if (selectedService === 'local') {
      try {
        setIsSubmittingLocal(true);
        await onSuccessLocal(file);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || err.message || 'บันทึกประวัติไฟล์ล้มเหลว');
        setStep('error');
      } finally {
        setIsSubmittingLocal(false);
      }
      return;
    }

    // Selected Cloud (S3)
    setStep('uploading');
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(file.size);
    setErrorMessage('');

    try {
      const form = new FormData();
      form.append('file', file);

      await apiClient.post('/cloud-files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          if (total > 0) {
            const percent = Math.min(
              Math.round((progressEvent.loaded * 100) / total),
              99
            );
            setUploadProgress(percent);
            setUploadedBytes(progressEvent.loaded);
            setTotalBytes(total);
          }
        },
      });

      // Upload finished successfully
      setUploadProgress(100);
      setUploadedBytes(file.size);
      setStep('completed');

      // Brief delay for user to see the 100% completion checkmark
      setTimeout(async () => {
        await onSuccessCloud(file);
        onClose();
      }, 700);
    } catch (err: any) {
      setStep('error');
      setErrorMessage(
        err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์ขึ้น Cloud S3'
      );
    }
  };

  const handleRetry = () => {
    setStep('select');
    setUploadProgress(0);
    setErrorMessage('');
  };

  const getProgressStatusText = () => {
    if (uploadProgress >= 100 || step === 'completed') {
      return 'อัปโหลดและบันทึกข้อมูลเรียบร้อยแล้ว!';
    }
    if (uploadProgress >= 85) {
      return 'กำลังประมวลผลและตรวจสอบความถูกต้องบน Cloud...';
    }
    if (uploadProgress >= 20) {
      return 'กำลังส่งข้อมูลเข้าสู่ Cloud Storage (S3)...';
    }
    return 'กำลังเริ่มต้นการเชื่อมต่อ Cloud S3...';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (step !== 'uploading') onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 md:p-8 border border-purple-100 dark:border-slate-800 shadow-2xl space-y-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {step === 'select' ? 'เลือกพื้นที่จัดเก็บไฟล์' : 'กำลังดำเนินการกับไฟล์'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[240px]">
                {file.name} ({formatBytes(file.size)})
              </p>
            </div>
          </div>
          {step !== 'uploading' && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
              aria-label="ปิดและยกเลิก"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP 1: SELECT SERVICE */}
        {step === 'select' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              กรุณาเลือกบริการที่ต้องการจัดเก็บไฟล์ จากนั้นกดปุ่ม <span className="font-semibold text-purple-700 dark:text-purple-400">ตกลง</span> เพื่อเริ่มดำเนินการ:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cloud Storage (S3) */}
              <button
                type="button"
                onClick={() => setSelectedService('cloud')}
                className={`p-5 rounded-2xl border-2 text-left transition-all space-y-3 relative group cursor-pointer ${
                  selectedService === 'cloud'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-4 ring-purple-600/10 shadow-md shadow-purple-600/5'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Active Checkmark Pill */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      selectedService === 'cloud'
                        ? 'bg-purple-700 text-white shadow-md shadow-purple-700/30'
                        : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      selectedService === 'cloud'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-transparent'
                    }`}
                  >
                    {selectedService === 'cloud' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                      Cloud Storage (S3)
                    </h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-purple-200/70 dark:bg-purple-800 text-purple-800 dark:text-purple-200 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> แนะนำ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    ปลอดภัย จัดเก็บบน S3 เข้าถึงได้จากทุกอุปกรณ์ พร้อมสำรองข้อมูล
                  </p>
                </div>
              </button>

              {/* Option 2: Local Recent File */}
              <button
                type="button"
                onClick={() => setSelectedService('local')}
                className={`p-5 rounded-2xl border-2 text-left transition-all space-y-3 relative group cursor-pointer ${
                  selectedService === 'local'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-4 ring-purple-600/10 shadow-md shadow-purple-600/5'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      selectedService === 'local'
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      selectedService === 'local'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-transparent'
                    }`}
                  >
                    {selectedService === 'local' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                    บันทึกเฉพาะเครื่องนี้
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    บันทึกลงรายการเปิดล่าสุด ทำงานรวดเร็ว ไม่มีการส่งไฟล์ขึ้นคลาวด์
                  </p>
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmittingLocal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmittingLocal}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-700/25 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isSubmittingLocal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <span>ตกลง</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: UPLOADING (PROGRESS SCREEN) */}
        {step === 'uploading' && (
          <div className="py-4 space-y-6 text-center animate-in fade-in duration-200">
            {/* Animated Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-purple-500/10 dark:bg-purple-500/20 animate-ping opacity-75" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Cloud className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            {/* Title & Stats */}
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                กำลังอัปโหลดไฟล์ขึ้น Cloud Storage (S3)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                กรุณารอสักครู่ ระบบกำลังจัดเก็บไฟล์อย่างปลอดภัย
              </p>
            </div>

            {/* Percentage Display & Progress Bar */}
            <div className="space-y-2 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-purple-700 dark:text-purple-400 font-bold text-lg">
                  {uploadProgress}%
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
                </span>
              </div>

              {/* Progress Bar with animated gradient */}
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
                </div>
              </div>
            </div>

            {/* Status indicator badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{getProgressStatusText()}</span>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED */}
        {step === 'completed' && (
          <div className="py-6 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                อัปโหลดขึ้น Cloud S3 สำเร็จ 100%
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                จัดเก็บไฟล์ "{file.name}" เรียบร้อยแล้ว กำลังเปิดข้อมูลตาราง...
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: ERROR */}
        {step === 'error' && (
          <div className="py-4 space-y-5 text-center animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                การดำเนินการล้มเหลว
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {errorMessage}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-700/20 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ลองใหม่อีกครั้ง</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
