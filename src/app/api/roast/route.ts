import { NextResponse } from 'next/server';
import { generateRoastReport } from '@/lib/ai';
import type { RoastRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: RoastRequest = await request.json();

    // 验证必填字段
    if (!body.platform || !body.username) {
      return NextResponse.json(
        { error: '请选择平台并输入用户名' },
        { status: 400 }
      );
    }

    // 验证平台
    const validPlatforms = ['weibo', 'xiaohongshu', 'douyin', 'bilibili', 'zhihu'];
    if (!validPlatforms.includes(body.platform)) {
      return NextResponse.json(
        { error: '不支持的平台' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (body.username.trim().length < 1 || body.username.trim().length > 50) {
      return NextResponse.json(
        { error: '用户名长度需在 1-50 个字符之间' },
        { status: 400 }
      );
    }

    // 验证强度
    const validIntensities = ['mild', 'medium', 'spicy'];
    if (body.intensity && !validIntensities.includes(body.intensity)) {
      body.intensity = 'medium';
    }

    // 生成吐槽报告
    const report = await generateRoastReport(body);

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('生成吐槽报告失败:', error);
    const message = error instanceof Error ? error.message : '生成失败，请稍后重试';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
