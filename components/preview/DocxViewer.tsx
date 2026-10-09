'use client';

import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { FileText, Loader2, AlertCircle } from 'lucide-react';

interface DocxViewerProps {
  docxBlob: Blob | null;
  isLoading: boolean;
  error?: string | null;
}

export function DocxViewer({ docxBlob, isLoading, error }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function doRender() {
      if (!docxBlob || !containerRef.current) return;

      setIsRendering(true);
      setRenderError(null);

      // Clear previous content
      containerRef.current.innerHTML = '';

      try {
        await renderAsync(docxBlob, containerRef.current, undefined, {
          className: 'docx-preview-rendered',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          experimental: true,
          useBase64URL: true,
        });
      } catch (err: any) {
        if (!isCancelled) {
          console.error('docx-preview render error:', err);
          setRenderError(err?.message || 'ไม่สามารถประมวลผลการแสดงผลไฟล์ Word ได้');
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    }

    doRender();

    return () => {
      isCancelled = true;
    };
  }, [docxBlob]);

  return (
    <div className="relative w-full min-h-[600px] flex flex-col items-center">
      {/* Loading overlay */}
      {(isLoading || isRendering) && (
        <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl">
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg border border-purple-100">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-700">
              กำลังประมวลผลดึงหน้ากระดาษจากไฟล์ .docx จริง...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {(error || renderError) && (
        <div className="my-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || renderError}</span>
        </div>
      )}

      {/* Render Container for docx-preview */}
      <div
        ref={containerRef}
        className="w-full flex flex-col items-center overflow-x-auto docx-viewer-container"
        style={{
          fontFamily: "'Sarabun', 'TH Sarabun New', 'TH SarabunPSK', sans-serif",
        }}
      />
    </div>
  );
}
