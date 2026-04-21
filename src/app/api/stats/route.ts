import { NextResponse } from 'next/server';
import { getSiteStats } from '@/lib/stats';

export async function GET() {
  try {
    const stats = getSiteStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
