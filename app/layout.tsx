import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/authContext';

const kanit = Kanit({
  variable: '--font-kanit',
  weight: ['200', '300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JADS - ระบบสร้างเอกสารคดีศาล',
  description: 'ระบบจัดการและสร้างเอกสารคดีศาลอัตโนมัติจากไฟล์ Excel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
