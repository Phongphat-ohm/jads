import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || '';

  const isConfigured = Boolean(
    clientId &&
    clientId !== '' &&
    !clientId.includes('placeholder') &&
    clientSecret &&
    clientSecret !== '' &&
    !clientSecret.includes('placeholder')
  );

  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? 'Google OAuth configured'
      : 'GOOGLE_CLIENT_ID หรือ GOOGLE_CLIENT_SECRET ยังไม่ได้ถูกกำหนดใน .env หรือ .env.local',
  });
}
