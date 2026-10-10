'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../lib/themeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return empty placeholder with same dimensions to avoid layout shift
    return <div className={`w-9 h-9 ${className}`} />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`ธีม: ${
        theme === 'system'
          ? `ตามระบบของเครื่อง (${isDark ? 'โหมดมืด' : 'โหมดสว่าง'})`
          : isDark
          ? 'โหมดมืด'
          : 'โหมดสว่าง'
      } (คลิกเพื่อสลับ)`}
      aria-label="สลับธีม สว่าง / มืด"
      className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <Moon className="w-4 h-4 text-purple-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>

      {theme === 'system' && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 ring-2 ring-white dark:ring-slate-900"
          title="โหมดปัจจุบัน: ตามระบบเครื่อง"
        />
      )}
    </button>
  );
}
