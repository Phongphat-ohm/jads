'use client';

import React from 'react';
import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={3500}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-kanit), system-ui, sans-serif',
          fontSize: '13px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
        className: 'border border-slate-200 dark:border-slate-800',
      }}
    />
  );
}
