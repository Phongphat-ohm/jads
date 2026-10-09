'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/generator?tab=review');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-center text-xs text-slate-500 font-medium">
      <div className="space-y-2">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>กำลังนำท่านเข้าสู่ระบบสร้างและตรวจสอบเอกสารคดี...</p>
      </div>
    </div>
  );
}
