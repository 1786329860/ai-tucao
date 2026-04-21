import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/stats';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, platform, fingerprint } = body;

    if (!type || !fingerprint) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    trackEvent({
      type,
      platform,
      fingerprint: String(fingerprint).substring(0, 64),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '记录失败' }, { status: 500 });
  }
}
